"use client";

import { useState, useEffect, useMemo } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import { useIssues, useUpdateIssue } from "../hooks/use-issues";
import { useUpdateColumn } from "../hooks/use-columns";
import { DroppableColumn } from "./droppable-column";
import { JiraIssueCard } from "./jira-issue-card";
import { ColumnHeader } from "./sortable-column-header";
import { EditColumnModal } from "./modals/edit-column-modal";
import type { IssueFilterState } from "./issue-filter";
import type { QueryClient } from "@tanstack/react-query";
import type { Issue } from "@/_libraries/api/handlers";
import { useIsMobile } from "@/_features/common/hooks/useMobile";

// Hex 색상을 rgba로 변환하는 헬퍼 함수
function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

interface BoardColumn {
  id: string;
  name: string;
  order: number;
  color: string | null;
  limit: number | null;
}

interface KanbanBoardProps {
  projectId: string;
  columns: BoardColumn[];
  queryClient: QueryClient;
  filters?: IssueFilterState;
}

export function KanbanBoard({
  projectId,
  columns,
  queryClient,
  filters,
}: KanbanBoardProps) {
  const isMobile = useIsMobile();
  const { data: issues, isLoading } = useIssues(projectId);
  const updateIssue = useUpdateIssue();
  const updateColumn = useUpdateColumn();
  const [activeIssue, setActiveIssue] = useState<Issue | null>(null);
  const [columnsOrder, setColumnsOrder] = useState<BoardColumn[]>(columns);

  // 필터링된 이슈
  const filteredIssues = useMemo(() => {
    if (!issues || !filters) return issues || [];

    return issues.filter((issue) => {
      // 검색 필터
      if (filters.search.trim()) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch =
          issue.title.toLowerCase().includes(searchLower) ||
          issue.description?.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // 담당자 필터
      if (filters.assignee !== "ALL") {
        if (filters.assignee === "UNASSIGNED") {
          if (issue.assignee) return false;
        } else {
          if (issue.assignee !== filters.assignee) return false;
        }
      }

      // 업무유형 필터
      if (filters.type !== "ALL" && issue.type !== filters.type) {
        return false;
      }

      // 상태 필터
      if (filters.status !== "ALL" && issue.status !== filters.status) {
        return false;
      }

      // 우선순위 필터
      if (filters.priority !== "ALL" && issue.priority !== filters.priority) {
        return false;
      }

      // 레이블 필터
      if (filters.label !== "ALL") {
        if (!issue.labels || !issue.labels.includes(filters.label)) {
          return false;
        }
      }

      return true;
    });
  }, [issues, filters]);

  // 모바일에서는 드래그 비활성화
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
      disabled: isMobile,
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
      disabled: isMobile,
    })
  );

  // 컬럼 순서 초기화 및 업데이트
  useEffect(() => {
    if (columns.length > 0) {
      const sortedColumns = [...columns].sort((a, b) => a.order - b.order);
      
      // 컬럼이 처음 로드되거나 개수가 변경된 경우
      if (columnsOrder.length === 0 || columns.length !== columnsOrder.length) {
        setColumnsOrder(sortedColumns);
      } else {
        // 컬럼 속성(이름, 색상, limit 등)이 변경된 경우 업데이트
        const hasChanges = sortedColumns.some((col, index) => {
          const existingCol = columnsOrder[index];
          return (
            !existingCol ||
            col.id !== existingCol.id ||
            col.name !== existingCol.name ||
            col.color !== existingCol.color ||
            col.limit !== existingCol.limit
          );
        });
        
        if (hasChanges) {
          setColumnsOrder(sortedColumns);
        }
      }
    }
  }, [columns, columnsOrder.length]);

  // 컬럼별로 이슈 그룹화 (필터링된 이슈 사용)
  const issuesByColumn = columnsOrder.reduce(
    (acc, column) => {
      acc[column.id] =
        filteredIssues?.filter((issue) => issue.status === column.id) || [];
      return acc;
    },
    {} as Record<string, Issue[]>
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const issue = filteredIssues?.find((i) => i.id === active.id);
    if (issue) {
      setActiveIssue(issue);
    }
  };

  // 컬럼 이동 처리
  const handleMoveColumn = async (columnId: string, direction: "left" | "right") => {
    const currentIndex = columnsOrder.findIndex((col) => col.id === columnId);
    if (currentIndex === -1) return;

    const newIndex = direction === "left" ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= columnsOrder.length) return;

    // 순서 변경
    const newOrder = [...columnsOrder];
    const movedColumn = newOrder[currentIndex];
    const swappedColumn = newOrder[newIndex];
    
    [newOrder[currentIndex], newOrder[newIndex]] = [
      newOrder[newIndex],
      newOrder[currentIndex],
    ];

    // 낙관적 업데이트: UI를 먼저 변경
    setColumnsOrder(newOrder);

    try {
      // 실제로 순서가 바뀐 두 컬럼만 업데이트
      await Promise.all([
        updateColumn.mutateAsync({
          id: movedColumn.id,
          data: { order: newIndex },
        }),
        updateColumn.mutateAsync({
          id: swappedColumn.id,
          data: { order: currentIndex },
        }),
      ]);

      // 모든 업데이트가 완료된 후에만 캐시 직접 업데이트 (무효화 대신)
      queryClient.setQueryData<typeof columns>(
        ["columns", projectId],
        (oldData) => {
          if (!oldData) return oldData;
          return oldData.map((col) => {
            if (col.id === movedColumn.id) {
              return { ...col, order: newIndex };
            }
            if (col.id === swappedColumn.id) {
              return { ...col, order: currentIndex };
            }
            return col;
          });
        }
      );
    } catch (error) {
      console.error("Failed to update columns:", error);
      // 에러 발생 시 원래 순서로 복구
      setColumnsOrder([...columns].sort((a, b) => a.order - b.order));
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveIssue(null);

    if (!over) return;

          const issueId = active.id as string;
          const overId = over.id as string;

          // 이슈 이동 처리
          let newStatus: string;
          let targetColumn: BoardColumn | undefined;

          // over.id가 컬럼 ID인지 확인
          const isColumnId = columnsOrder.some((col) => col.id === overId);

          if (isColumnId) {
            newStatus = overId;
            targetColumn = columnsOrder.find((col) => col.id === overId);
          } else {
            // over.id가 이슈 ID인 경우, 해당 이슈의 컬럼 찾기
            const overIssue = filteredIssues?.find((i) => i.id === overId);
            if (!overIssue) return;
            newStatus = overIssue.status;
            targetColumn = columnsOrder.find((col) => col.id === newStatus);
          }

          const issue = filteredIssues?.find((i) => i.id === issueId);
          if (!issue || issue.status === newStatus) return;

          // limit 체크: 같은 컬럼으로 이동하는 경우는 제외 (이미 그 컬럼에 있음)
          if (targetColumn && targetColumn.limit !== null && issue.status !== newStatus) {
            const targetColumnIssues = issuesByColumn[targetColumn.id] || [];
            if (targetColumnIssues.length >= targetColumn.limit) {
              // limit 초과 시 이동 방지
              alert(`이 컬럼의 이슈 개수 제한(${targetColumn.limit}개)에 도달했습니다.`);
              // return;
            }
          }

    // 낙관적 업데이트를 위해 즉시 UI 변경
    updateIssue.mutate(
      {
        id: issueId,
        data: { status: newStatus },
      },
      {
        onSuccess: () => {
          // 서버 업데이트 성공 후 React Query 캐시 무효화
          queryClient.invalidateQueries({ queryKey: ["issues", projectId] });
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="kanban-board-loading">
        <div className="text-muted-foreground">로딩 중...</div>
      </div>
    );
  }

  if (columnsOrder.length === 0) {
    return (
      <div className="kanban-board-empty">
        <div className="text-muted-foreground">컬럼이 없습니다.</div>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="kanban-board-container">
        {columnsOrder.map((column, index) => {
          const columnIssues = issuesByColumn[column.id] || [];
          const isFirst = index === 0;
          const isLast = index === columnsOrder.length - 1;
          return (
            <div
              key={column.id}
              className="flex flex-col gap-2 md:gap-3 flex-shrink-0 w-full md:w-auto md:min-w-[260px]"
            >
              <div
                className="rounded-t-lg md:rounded-t-lg px-3 md:px-3 py-1.5 md:py-2 bg-white border-b border-[#DFE1E6]"
                style={
                  column.color
                    ? {
                        borderLeft: `4px solid ${column.color}`,
                        backgroundColor: hexToRgba(column.color, 0.08),
                      }
                    : {}
                }
              >
                <ColumnHeader
                  id={column.id}
                  name={column.name}
                  color={column.color}
                  count={columnIssues.length}
                  limit={column.limit}
                >
                <EditColumnModal
                  column={{
                    ...column,
                    projectId,
                    createdAt: "",
                    updatedAt: "",
                  }}
                  projectId={projectId}
                  isFirst={isFirst}
                  isLast={isLast}
                  onMove={handleMoveColumn}
                />
                </ColumnHeader>
              </div>
              <DroppableColumn
                id={column.id}
                issues={columnIssues}
                projectId={projectId}
                color={column.color}
                limit={column.limit}
                isMobile={isMobile}
              />
            </div>
          );
        })}
      </div>
      <DragOverlay dropAnimation={null}>
        {activeIssue && (
          <div className="cursor-grabbing shadow-lg rotate-2 scale-105 opacity-95">
            <JiraIssueCard
              issue={activeIssue}
              projectId={projectId}
              isDragging={true}
            />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
