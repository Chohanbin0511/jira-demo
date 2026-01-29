"use client";

import { useMemo } from "react";
import { Search } from "lucide-react";
import { Input } from "@/_features/common/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/_features/common/components/ui/select";
import { Button } from "@/_features/common/components/ui/button";
import type { Column } from "@/_libraries/api/handlers";

export interface IssueFilterState {
  search: string;
  priority: string;
  status: string;
  assignee: string;
  type: string;
  label: string;
}

interface IssueFilterProps {
  children?: React.ReactNode;
  hideSearch?: boolean;
  columns: Column[];
  assignees: string[];
  labels: string[];
  filters: IssueFilterState;
  onFiltersChange: (filters: IssueFilterState) => void;
}

export function IssueFilter({
  children,
  hideSearch = false,
  columns,
  assignees,
  labels,
  filters,
  onFiltersChange,
}: IssueFilterProps) {
  const handleChange = (key: keyof IssueFilterState, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const handleReset = () => {
    onFiltersChange({
      search: "",
      priority: "ALL",
      status: "ALL",
      assignee: "ALL",
      type: "ALL",
      label: "ALL",
    });
  };

  // 상태(Status) 옵션 중복 제거
  const uniqueColumns = useMemo(() => {
    const seen = new Set<string>();
    return columns.filter((col) => {
      if (seen.has(col.id)) return false;
      seen.add(col.id);
      return true;
    });
  }, [columns]);

  return (
    <div className="flex flex-col gap-4 p-4 bg-slate-50/50 border rounded-lg animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="flex flex-wrap items-center gap-2">
        {children}
        {/* Search */}
        {!hideSearch && (
          <div className="relative w-[200px]">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="검색..."
              value={filters.search}
              onChange={(e) => handleChange("search", e.target.value)}
              className="pl-8 bg-white"
            />
          </div>
        )}

        {/* Assignee */}
        <Select
          value={filters.assignee}
          onValueChange={(val) => handleChange("assignee", val)}
        >
          <SelectTrigger className="w-[140px] bg-white">
            <SelectValue placeholder="담당자" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">모든 담당자</SelectItem>
            <SelectItem value="UNASSIGNED">미지정</SelectItem>
            {assignees.map((assignee) => (
              <SelectItem key={assignee} value={assignee}>
                {assignee}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Type */}
        <Select
          value={filters.type}
          onValueChange={(val) => handleChange("type", val)}
        >
          <SelectTrigger className="w-[140px] bg-white">
            <SelectValue placeholder="유형" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">모든 유형</SelectItem>
            <SelectItem value="TASK">Task</SelectItem>
            <SelectItem value="BUG">Bug</SelectItem>
            <SelectItem value="STORY">Story</SelectItem>
            <SelectItem value="EPIC">Epic</SelectItem>
          </SelectContent>
        </Select>

        {/* Status */}
        <Select
          value={filters.status}
          onValueChange={(val) => handleChange("status", val)}
        >
          <SelectTrigger className="w-[140px] bg-white">
            <SelectValue placeholder="상태" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">모든 상태</SelectItem>
            {uniqueColumns.map((col) => (
              <SelectItem key={col.id} value={col.id}>
                {col.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Priority */}
        <Select
          value={filters.priority}
          onValueChange={(val) => handleChange("priority", val)}
        >
          <SelectTrigger className="w-[140px] bg-white">
            <SelectValue placeholder="우선순위" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">모든 우선순위</SelectItem>
            <SelectItem value="HIGH">High</SelectItem>
            <SelectItem value="MEDIUM">Medium</SelectItem>
            <SelectItem value="LOW">Low</SelectItem>
          </SelectContent>
        </Select>

        {/* Label */}
        <Select
          value={filters.label}
          onValueChange={(val) => handleChange("label", val)}
        >
          <SelectTrigger className="w-[140px] bg-white">
            <SelectValue placeholder="레이블" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">모든 레이블</SelectItem>
            {labels.map((label) => (
              <SelectItem key={label} value={label}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Reset */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReset}
          title="필터 초기화"
          className="ml-auto"
        >
          초기화
        </Button>
      </div>
    </div>
  );
}
