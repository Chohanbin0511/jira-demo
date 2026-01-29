"use client";

interface ProjectEmptyStateProps {
  message?: string;
}

export function ProjectEmptyState({
  message = "프로젝트가 없습니다.",
}: ProjectEmptyStateProps) {
  return (
    <div className="col-span-full text-center py-12 text-muted-foreground">
      {message}
    </div>
  );
}
