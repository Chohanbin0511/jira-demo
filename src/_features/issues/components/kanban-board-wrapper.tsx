"use client";

import { useState, useMemo, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useProject } from "@/_features/projects/hooks/use-projects";
import { useColumns, type Column } from "../hooks/use-columns";
import { useIssues } from "../hooks/use-issues";
import { KanbanBoard } from "./kanban-board";
import { CreateIssueModal } from "./modals/create-issue-modal";
import { CreateColumnModal } from "./modals/create-column-modal";
import { IssueFilter, type IssueFilterState } from "./issue-filter";
import { Loader2 } from "lucide-react";
import { useIsMobile } from "@/_features/common/hooks/useMobile";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/_features/common/components/ui/tabs";

interface KanbanBoardWrapperProps {
  projectId: string;
}

export function KanbanBoardWrapper({ projectId }: KanbanBoardWrapperProps) {
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const { data: project, isLoading: projectLoading, error: projectError } = useProject(projectId);
  const { data: columns, isLoading: columnsLoading } = useColumns(projectId);
  const { data: issues } = useIssues(projectId);
  
  const [filters, setFilters] = useState<IssueFilterState>({
    search: "",
    assignee: "ALL",
    type: "ALL",
    status: "ALL",
    priority: "ALL",
    label: "ALL",
  });
  
  const [activeTab, setActiveTab] = useState<string>("");

  // 컬럼이 없으면 기본 컬럼 사용 (하위 호환성) - 훅 호출 전에 계산
  const displayColumns: Column[] = useMemo(() => {
    if (!columns || columns.length === 0) {
      return [
        { id: "TODO", name: "할 일", order: 0, color: null, limit: null, projectId, createdAt: "", updatedAt: "" },
        { id: "IN_PROGRESS", name: "진행 중", order: 1, color: null, limit: null, projectId, createdAt: "", updatedAt: "" },
        { id: "DONE", name: "완료", order: 2, color: null, limit: null, projectId, createdAt: "", updatedAt: "" },
      ];
    }
    return columns;
  }, [columns, projectId]);

  // 정렬된 컬럼 (항상 호출되어야 함)
  const sortedColumns = useMemo(() => {
    return [...displayColumns].sort((a, b) => a.order - b.order);
  }, [displayColumns]);

  // 담당자 목록 추출
  const assignees = useMemo(() => {
    if (!issues) return [];
    const uniqueAssignees = new Set(
      issues
        .map((issue) => issue.assignee)
        .filter((assignee): assignee is string => !!assignee)
    );
    return Array.from(uniqueAssignees).sort();
  }, [issues]);

  // 레이블 목록 추출
  const labels = useMemo(() => {
    if (!issues) return [];
    const uniqueLabels = new Set(
      issues.flatMap((issue) => issue.labels || [])
    );
    return Array.from(uniqueLabels).sort();
  }, [issues]);

  // 첫 번째 컬럼을 기본 탭으로 설정 (항상 호출되어야 함)
  useEffect(() => {
    if (sortedColumns.length > 0 && !activeTab) {
      setActiveTab(sortedColumns[0].id);
    }
  }, [sortedColumns, activeTab]);

  // Early return은 모든 훅 호출 후에만 수행
  if (projectLoading || columnsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[#0052CC]" />
      </div>
    );
  }

  if (projectError || !project) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-destructive">프로젝트를 불러오는 중 오류가 발생했습니다.</div>
      </div>
    );
  }

  // 모바일: 탭 기반 UI
  if (isMobile) {
    return (
      <div className="flex flex-col h-[calc(100vh-120px)]">
        <div className="flex-shrink-0 space-y-2 mb-2 px-2">
          <div className="flex flex-col gap-2">
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-semibold text-[#172B4D] truncate">{project.name}</h1>
              {project.description && (
                <p className="mt-1 text-xs text-[#6B778C] line-clamp-1">{project.description}</p>
              )}
            </div>
            <div className="flex gap-1.5 shrink-0">
              <CreateColumnModal projectId={project.id} />
              <CreateIssueModal projectId={project.id} />
            </div>
          </div>

          <IssueFilter
            columns={displayColumns}
            assignees={assignees}
            labels={labels}
            filters={filters}
            onFiltersChange={setFilters}
          />
        </div>

        <div className="flex-1 min-h-0 flex flex-col -mx-2 md:mx-0">
          {sortedColumns.length > 0 ? (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
              <TabsList className="w-full justify-start overflow-x-auto mb-2 h-auto p-1">
                {sortedColumns.map((column) => (
                  <TabsTrigger
                    key={column.id}
                    value={column.id}
                    className="text-xs px-3 py-1.5 data-[state=active]:bg-[#0052CC] data-[state=active]:text-white"
                  >
                    {column.name}
                    {column.limit !== null && (
                      <span className="ml-1 text-[10px] opacity-75">
                        ({issues?.filter(i => i.status === column.id).length || 0}/{column.limit})
                      </span>
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>
              {sortedColumns.map((column) => {
                const columnIssues = issues?.filter((issue) => issue.status === column.id) || [];
                const filteredColumnIssues = columnIssues.filter((issue) => {
                  if (filters.search.trim()) {
                    const searchLower = filters.search.toLowerCase();
                    if (!issue.title.toLowerCase().includes(searchLower) && 
                        !issue.description?.toLowerCase().includes(searchLower)) {
                      return false;
                    }
                  }
                  if (filters.assignee !== "ALL") {
                    if (filters.assignee === "UNASSIGNED" && issue.assignee) return false;
                    if (filters.assignee !== "UNASSIGNED" && issue.assignee !== filters.assignee) return false;
                  }
                  if (filters.type !== "ALL" && issue.type !== filters.type) return false;
                  if (filters.priority !== "ALL" && issue.priority !== filters.priority) return false;
                  if (filters.label !== "ALL" && (!issue.labels || !issue.labels.includes(filters.label))) return false;
                  return true;
                });

                return (
                  <TabsContent key={column.id} value={column.id} className="flex-1 flex flex-col min-h-0 mt-0">
                    <KanbanBoard
                      projectId={project.id}
                      columns={[column]}
                      queryClient={queryClient}
                      filters={filters}
                    />
                  </TabsContent>
                );
              })}
            </Tabs>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-muted-foreground">컬럼이 없습니다.</div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 데스크톱: 기존 칸반 보드
  return (
    <div className="flex flex-col h-[calc(100vh-120px)] md:h-[calc(100vh-120px)]">
      <div className="flex-shrink-0 space-y-2 md:space-y-4 mb-2 md:mb-4 px-2 md:px-0">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-0">
          <div className="flex-1 min-w-0">
            <h1 className="text-lg md:text-2xl font-semibold text-[#172B4D] truncate">{project.name}</h1>
            {project.description && (
              <p className="mt-1 text-xs md:text-sm text-[#6B778C] line-clamp-1">{project.description}</p>
            )}
          </div>
          <div className="flex gap-1.5 md:gap-2 shrink-0">
            <CreateColumnModal projectId={project.id} />
            <CreateIssueModal projectId={project.id} />
          </div>
        </div>

        <IssueFilter
          columns={displayColumns}
          assignees={assignees}
          labels={labels}
          filters={filters}
          onFiltersChange={setFilters}
        />
      </div>

      <div className="flex-1 min-h-0 px-2 md:px-0">
        <KanbanBoard
          projectId={project.id}
          columns={displayColumns}
          queryClient={queryClient}
          filters={filters}
        />
      </div>
    </div>
  );
}
