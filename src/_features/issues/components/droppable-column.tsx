"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Card, CardContent } from "@/_features/common/components/ui/card";
import { SortableIssueCard } from "./sortable-issue-card";
import type { Issue } from "@/_libraries/api/handlers";

interface DroppableColumnProps {
  id: string;
  issues: Issue[];
  projectId: string;
  color: string | null;
  limit: number | null;
}

export function DroppableColumn({ id, issues, projectId, color, limit }: DroppableColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
  });

  const isLimitExceeded = limit !== null && issues.length >= limit;
  const isAtLimit = limit !== null && issues.length === limit;

  // Hex 색상을 rgba로 변환하는 헬퍼 함수
  const hexToRgba = (hex: string, alpha: number): string => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  // 컬럼 색상 스타일 계산
  const getColumnStyle = () => {
    if (isOver) {
      return {
        backgroundColor: color ? hexToRgba(color, 0.25) : "#EBECF0",
        borderColor: color || "#0052CC",
        borderWidth: "2px",
        borderStyle: "solid",
        borderLeftWidth: color ? "4px" : "2px",
      };
    }
    if (color) {
      return {
        backgroundColor: hexToRgba(color, 0.15),
        borderColor: hexToRgba(color, 0.5),
        borderWidth: "1px",
        borderStyle: "solid",
        borderLeftWidth: "4px",
        borderLeftColor: color,
      };
    }
    return {
      backgroundColor: "#F4F5F7",
    };
  };

  return (
    <SortableContext
      id={id}
      items={issues.map((i) => i.id)}
      strategy={verticalListSortingStrategy}
    >
            <div
              ref={setNodeRef}
              className={`flex flex-col gap-3 h-full rounded p-3 overflow-y-auto transition-all duration-200 ${
                isLimitExceeded ? "opacity-60" : ""
              }`}
              style={getColumnStyle()}
            >
        {issues.length === 0 ? (
          <Card
            className={`border-2 border-dashed transition-colors bg-white ${
              isOver ? "border-[#0052CC] bg-[#EBECF0]" : "border-[#DFE1E6]"
            }`}
          >
            <CardContent className="flex items-center justify-center py-12 text-sm text-[#6B778C] font-medium">
              {isOver ? "여기에 놓으세요" : "이슈를 드래그하세요"}
            </CardContent>
          </Card>
        ) : (
          <>
            {issues.map((issue) => (
              <SortableIssueCard
                key={issue.id}
                issue={issue}
                projectId={projectId}
              />
            ))}
            {isLimitExceeded && (
              <div className="text-xs text-red-600 font-medium bg-red-50 border border-red-200 rounded p-2 text-center">
                ⚠️ 이슈 개수 제한 초과 ({issues.length}/{limit})
              </div>
            )}
            {isAtLimit && !isLimitExceeded && (
              <div className="text-xs text-orange-600 font-medium bg-orange-50 border border-orange-200 rounded p-2 text-center">
                ⚠️ 이슈 개수 제한 도달 ({issues.length}/{limit})
              </div>
            )}
          </>
        )}
      </div>
    </SortableContext>
  );
}
