"use client";

import { useMemo, useState } from "react";
import { Search, ChevronDown, ChevronUp, Filter } from "lucide-react";
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
import { useIsMobile } from "@/_features/common/hooks/useMobile";

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
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false); // 모바일에서는 기본적으로 접힘
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

  // 필터가 적용되어 있는지 확인
  const hasActiveFilters = useMemo(() => {
    return (
      filters.search.trim() !== "" ||
      filters.priority !== "ALL" ||
      filters.status !== "ALL" ||
      filters.assignee !== "ALL" ||
      filters.type !== "ALL" ||
      filters.label !== "ALL"
    );
  }, [filters]);

  // 상태(Status) 옵션 중복 제거
  const uniqueColumns = useMemo(() => {
    const seen = new Set<string>();
    return columns.filter((col) => {
      if (seen.has(col.id)) return false;
      seen.add(col.id);
      return true;
    });
  }, [columns]);

  // 모바일: 토글 가능한 필터
  if (isMobile) {
    return (
      <div className="flex flex-col bg-slate-50/50 border rounded-lg overflow-hidden">
        {/* 필터 헤더 (토글 버튼) */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between px-3 py-2 hover:bg-slate-100/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-[#172B4D]">필터</span>
            {hasActiveFilters && (
              <span className="h-2 w-2 rounded-full bg-[#0052CC]"></span>
            )}
          </div>
          {isOpen ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </button>

        {/* 필터 내용 (접기/펼치기) */}
        {isOpen && (
          <div className="flex flex-col gap-2 p-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex flex-wrap items-center gap-1.5 md:gap-2 overflow-x-auto pb-1 md:pb-0">
        {children}
        {/* Search */}
        {!hideSearch && (
          <div className="relative w-full md:w-[200px] min-w-[140px] flex-shrink-0">
            <Search className="absolute left-2 top-2 md:top-2.5 h-3.5 w-3.5 md:h-4 md:w-4 text-muted-foreground" />
            <Input
              placeholder="검색..."
              value={filters.search}
              onChange={(e) => handleChange("search", e.target.value)}
              className="pl-7 md:pl-8 bg-white text-sm md:text-base"
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
          <SelectTrigger className="w-[120px] md:w-[140px] bg-white text-xs md:text-sm">
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
          <SelectTrigger className="w-[120px] md:w-[140px] bg-white text-xs md:text-sm">
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
          <SelectTrigger className="w-[120px] md:w-[140px] bg-white text-xs md:text-sm">
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
          <SelectTrigger className="w-[120px] md:w-[140px] bg-white text-xs md:text-sm">
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
          className="ml-auto text-xs"
        >
          초기화
        </Button>
          </div>
        </div>
      )}
    </div>
    );
  }

  // 데스크톱: 항상 보이는 필터
  return (
    <div className="flex flex-col gap-2 md:gap-4 p-2 md:p-4 bg-slate-50/50 border rounded-lg animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="flex flex-wrap items-center gap-1.5 md:gap-2 overflow-x-auto pb-1 md:pb-0">
        {children}
        {/* Search */}
        {!hideSearch && (
          <div className="relative w-full md:w-[200px] min-w-[140px] flex-shrink-0">
            <Search className="absolute left-2 top-2 md:top-2.5 h-3.5 w-3.5 md:h-4 md:w-4 text-muted-foreground" />
            <Input
              placeholder="검색..."
              value={filters.search}
              onChange={(e) => handleChange("search", e.target.value)}
              className="pl-7 md:pl-8 bg-white text-sm md:text-base"
            />
          </div>
        )}

        {/* Assignee */}
        <Select
          value={filters.assignee}
          onValueChange={(val) => handleChange("assignee", val)}
        >
          <SelectTrigger className="w-[120px] md:w-[140px] bg-white text-xs md:text-sm">
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
          <SelectTrigger className="w-[120px] md:w-[140px] bg-white text-xs md:text-sm">
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
          <SelectTrigger className="w-[120px] md:w-[140px] bg-white text-xs md:text-sm">
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
          <SelectTrigger className="w-[120px] md:w-[140px] bg-white text-xs md:text-sm">
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
          <SelectTrigger className="w-[120px] md:w-[140px] bg-white text-xs md:text-sm">
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
          className="ml-auto text-xs md:text-sm"
        >
          초기화
        </Button>
      </div>
    </div>
  );
}
