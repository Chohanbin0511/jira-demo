"use client";

import { Button } from "@/_features/common/components/ui/button";
import { Input } from "@/_features/common/components/ui/input";
import { Plus } from "lucide-react";

interface ProjectSearchBarProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onCreateClick?: () => void;
  placeholder?: string;
  createButtonText?: string;
}

export function ProjectSearchBar({
  searchValue,
  onSearchChange,
  onCreateClick,
  placeholder = "프로젝트 검색...",
  createButtonText = "새 프로젝트",
}: ProjectSearchBarProps) {
  return (
    <div className="mb-6 flex flex-col sm:flex-row gap-4">
      <div className="flex-1">
        <Input
          type="search"
          placeholder={placeholder}
          className="w-full"
          value={searchValue}
          onChange={(e) => onSearchChange?.(e.target.value)}
        />
      </div>
      <Button onClick={onCreateClick}>
        <Plus className="h-4 w-4 mr-2" />
        {createButtonText}
      </Button>
    </div>
  );
}
