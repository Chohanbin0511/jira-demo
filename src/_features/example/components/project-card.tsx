"use client";

import { Button } from "@/_features/common/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardAction,
} from "@/_features/common/components/ui/card";
import { formatDate } from "@/_utilities/date";
import type { Project } from "@/_libraries/api/handlers";
import { MoreVertical, Bookmark } from "lucide-react";

interface ProjectCardProps {
  project: Project;
  onOpen?: (projectId: string) => void;
  onBookmark?: (projectId: string) => void;
  onMore?: (projectId: string) => void;
}

export function ProjectCard({
  project,
  onOpen,
  onBookmark,
  onMore,
}: ProjectCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl mb-2">{project.name}</CardTitle>
            <CardDescription>{project.description}</CardDescription>
          </div>
          <CardAction>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onMore?.(project.id)}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </CardAction>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          <div className="text-xs text-muted-foreground">
            생성일: {formatDate(project.createdAt, "YYYY-MM-DD")}
          </div>
        </div>
      </CardContent>

      <CardFooter className="gap-2">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => onOpen?.(project.id)}
        >
          열기
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onBookmark?.(project.id)}
        >
          <Bookmark className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
