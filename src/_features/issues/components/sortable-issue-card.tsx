"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { JiraIssueCard } from "./jira-issue-card";
import type { Issue } from "@/_libraries/api/handlers";

interface SortableIssueCardProps {
  issue: Issue;
  projectId: string;
}

export function SortableIssueCard({
  issue,
  projectId,
}: SortableIssueCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id: issue.id,
      disabled: isModalOpen, // 모달이 열려있으면 드래그 비활성화
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || "transform 200ms ease",
    opacity: isDragging ? 0.5 : 1,
    cursor: isModalOpen ? "default" : "grab", // 모달이 열려있으면 커서 변경
  };

  // 모달이 열려있을 때는 드래그 리스너 비활성화
  const dragListeners = isModalOpen ? {} : listeners;

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...dragListeners}>
      <JiraIssueCard
        issue={issue}
        projectId={projectId}
        isDragging={isDragging}
        onModalOpenChange={setIsModalOpen}
      />
    </div>
  );
}
