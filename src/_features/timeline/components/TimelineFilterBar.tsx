"use client";

import { Search, Filter, CalendarDays, UserPlus } from "lucide-react";
import { ViewMode } from "gantt-task-react";
import { Input } from "@/_features/common/components/ui/input";
import { Button } from "@/_features/common/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/_features/common/components/ui/select";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/_features/common/components/ui/avatar";

interface TimelineFilterBarProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onSearch: (query: string) => void;
}

export function TimelineFilterBar({
  viewMode,
  onViewModeChange,
  onSearch,
}: TimelineFilterBarProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-1">
      <div className="flex items-center gap-2 flex-1">
        <div className="relative w-[200px]">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search issues"
            className="pl-8 h-9"
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center -space-x-2">
          {/* Mock Avatars for filters */}
          <Avatar className="h-8 w-8 border-2 border-background cursor-pointer hover:z-10">
            <AvatarImage src="/avatars/01.png" alt="@shadcn" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <Avatar className="h-8 w-8 border-2 border-background cursor-pointer hover:z-10">
            <AvatarImage src="/avatars/02.png" alt="@shadcn" />
            <AvatarFallback>KM</AvatarFallback>
          </Avatar>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full ml-2 bg-muted/50 border-dashed"
          >
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>

        <Button variant="ghost" size="sm" className="h-9 text-muted-foreground">
          <Filter className="mr-2 h-4 w-4" />
          Filters
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Select
          value={viewMode}
          onValueChange={(v) => onViewModeChange(v as ViewMode)}
        >
          <SelectTrigger className="w-[120px] h-9 bg-white">
            <CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" />
            <SelectValue placeholder="View" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ViewMode.Day}>Day</SelectItem>
            <SelectItem value={ViewMode.Week}>Week</SelectItem>
            <SelectItem value={ViewMode.Month}>Month</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
