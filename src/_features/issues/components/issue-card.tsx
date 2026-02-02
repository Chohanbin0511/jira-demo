"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/_features/common/components/ui/card";
import { Badge } from "@/_features/common/components/ui/badge";
import { cn } from "@/_utilities/utilities";
import type { Issue } from "@/_libraries/api/handlers";

interface IssueCardProps {
  issue: Issue;
  isDragging?: boolean;
}

const priorityColors = {
  LOW: "bg-blue-100 text-blue-800",
  MEDIUM: "bg-yellow-100 text-yellow-800",
  HIGH: "bg-red-100 text-red-800",
};

export function IssueCard({ issue, isDragging }: IssueCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: issue.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow",
        isDragging && "shadow-lg scale-105"
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-sm font-semibold line-clamp-2">
            {issue.title}
          </CardTitle>
          <Badge
            className={cn(
              "shrink-0",
              priorityColors[issue.priority] || priorityColors.MEDIUM
            )}
          >
            {issue.priority}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <CardDescription className="text-xs line-clamp-2">
          {issue.description}
        </CardDescription>
        {issue.assignee && (
          <div className="mt-2 text-xs text-muted-foreground">
            담당자: {issue.assignee}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
