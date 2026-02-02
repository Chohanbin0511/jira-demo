"use client";

import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/_features/common/components/ui/card";
import { Badge } from "@/_features/common/components/ui/badge";
import {
  Avatar,
  AvatarFallback,
} from "@/_features/common/components/ui/avatar";
import { Calendar, User } from "lucide-react";
import { IssueDetailModal } from "./modals/issue-detail-modal";
import type { Issue } from "@/_libraries/api/handlers";

interface JiraIssueCardProps {
  issue: Issue;
  projectId: string;
  isDragging?: boolean;
  onModalOpenChange?: (isOpen: boolean) => void;
}

export function JiraIssueCard({
  issue,
  projectId,
  isDragging,
  onModalOpenChange,
}: JiraIssueCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mouseDownPos, setMouseDownPos] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    onModalOpenChange?.(open);
  };

  const priorityConfig = {
    LOW: { label: "낮음", color: "bg-[#F4F5F7] text-[#6B778C]" },
    MEDIUM: { label: "보통", color: "bg-[#DEEBFF] text-[#0052CC]" },
    HIGH: { label: "높음", color: "bg-[#FFE380] text-[#172B4D]" },
  };

  const getPriorityBorderColor = (priority: "LOW" | "MEDIUM" | "HIGH") => {
    switch (priority) {
      case "HIGH":
        return "#FF5630";
      case "MEDIUM":
        return "#0052CC";
      case "LOW":
      default:
        return "#6B778C";
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setMouseDownPos({ x: e.clientX, y: e.clientY });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setMouseDownPos({ x: touch.clientX, y: touch.clientY });
  };

  const handleClick = (e: React.MouseEvent) => {
    // 마우스가 거의 움직이지 않았을 때만 클릭으로 간주
    if (mouseDownPos) {
      const distance = Math.sqrt(
        Math.pow(e.clientX - mouseDownPos.x, 2) +
          Math.pow(e.clientY - mouseDownPos.y, 2)
      );

      // 5px 이내 움직임만 클릭으로 간주
      if (distance < 5 && !isDragging) {
        e.stopPropagation();
        handleOpenChange(true);
      }
    }
    setMouseDownPos(null);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    // 터치가 거의 움직이지 않았을 때만 클릭으로 간주
    if (mouseDownPos) {
      const touch = e.changedTouches[0];
      const distance = Math.sqrt(
        Math.pow(touch.clientX - mouseDownPos.x, 2) +
          Math.pow(touch.clientY - mouseDownPos.y, 2)
      );

      // 10px 이내 움직임만 클릭으로 간주 (터치는 더 여유있게)
      if (distance < 10 && !isDragging) {
        e.stopPropagation();
        handleOpenChange(true);
      }
    }
    setMouseDownPos(null);
  };

  return (
    <>
      <Card
        className="cursor-pointer transition-all hover:shadow-md border-l-4 bg-white border-[#DFE1E6]"
        style={{
          borderLeftColor: getPriorityBorderColor(issue.priority),
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onClick={handleClick}
        onTouchEnd={handleTouchEnd}
      >
        <CardHeader className="p-3.5 pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 space-y-1">
              <span className="text-xs text-[#6B778C] font-medium">
                {issue.id}
              </span>
              <CardTitle className="text-sm font-medium text-[#172B4D] line-clamp-2 leading-snug">
                {issue.title}
              </CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-3.5 pt-0 space-y-2.5">
          {/* 설명 미리보기 */}
          {issue.description && (
            <p className="text-xs text-[#6B778C] line-clamp-2 leading-relaxed">
              {issue.description}
            </p>
          )}

          {/* 우선순위 뱃지 */}
          <div>
            <Badge
              className={`${priorityConfig[issue.priority].color} text-xs px-2 py-0.5`}
              variant="secondary"
            >
              {priorityConfig[issue.priority].label}
            </Badge>
          </div>

          {/* 하단 메타데이터 */}
          <div className="flex items-center justify-between text-xs text-[#6B778C] pt-1">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              <span>
                {issue.startDate && issue.dueDate
                  ? `${new Date(issue.startDate).toLocaleDateString("ko-KR", {
                      month: "short",
                      day: "numeric",
                    })} - ${new Date(issue.dueDate).toLocaleDateString(
                      "ko-KR",
                      {
                        month: "short",
                        day: "numeric",
                      }
                    )}`
                  : new Date(issue.createdAt).toLocaleDateString("ko-KR", {
                      month: "short",
                      day: "numeric",
                    })}
              </span>
            </div>

            {issue.assignee ? (
              <div className="flex items-center gap-1.5">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="bg-[#0052CC] text-white text-xs font-medium">
                    {getInitials(issue.assignee)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs font-medium text-[#172B4D]">
                  {issue.assignee}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-[#6B778C]">
                <User className="h-3.5 w-3.5" />
                <span className="text-xs">미지정</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <IssueDetailModal
        issue={issue}
        projectId={projectId}
        open={isOpen}
        onOpenChange={handleOpenChange}
      />
    </>
  );
}
