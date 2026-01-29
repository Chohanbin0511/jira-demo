"use client";

import { useState, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useProject } from "@/_features/projects/hooks/use-projects";
import { useColumns, type Column } from "../hooks/use-columns";
import { useIssues } from "../hooks/use-issues";
import { KanbanBoard } from "./kanban-board";
import { CreateIssueModal } from "./modals/create-issue-modal";
import { CreateColumnModal } from "./modals/create-column-modal";
import { IssueFilter, type IssueFilterState } from "./issue-filter";
import { Loader2 } from "lucide-react";

interface KanbanBoardWrapperProps {
  projectId: string;
}

export function KanbanBoardWrapper({ projectId }: KanbanBoardWrapperProps) {
  const queryClient = useQueryClient();
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

  // 컬럼이 없으면 기본 컬럼 사용 (하위 호환성)
  const displayColumns: Column[] = columns && columns.length > 0
    ? columns
    : [
        { id: "TODO", name: "할 일", order: 0, color: null, limit: null, projectId, createdAt: "", updatedAt: "" },
        { id: "IN_PROGRESS", name: "진행 중", order: 1, color: null, limit: null, projectId, createdAt: "", updatedAt: "" },
        { id: "DONE", name: "완료", order: 2, color: null, limit: null, projectId, createdAt: "", updatedAt: "" },
      ];

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      <div className="flex-shrink-0 space-y-4 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-[#172B4D]">{project.name}</h1>
            {project.description && (
              <p className="mt-1 text-sm text-[#6B778C]">{project.description}</p>
            )}
          </div>
          <div className="flex gap-2">
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

      <div className="flex-1 min-h-0">
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
