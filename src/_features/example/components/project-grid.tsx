"use client";

import { ProjectCard } from "./project-card";
import { ProjectEmptyState } from "./project-empty-state";
import type { Project } from "@/_libraries/api/handlers";

interface ProjectGridProps {
  projects: Project[];
  onProjectOpen?: (projectId: string) => void;
  onProjectBookmark?: (projectId: string) => void;
  onProjectMore?: (projectId: string) => void;
  emptyMessage?: string;
}

export function ProjectGrid({
  projects,
  onProjectOpen,
  onProjectBookmark,
  onProjectMore,
  emptyMessage,
}: ProjectGridProps) {
  if (projects.length === 0) {
    return <ProjectEmptyState message={emptyMessage} />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          onOpen={onProjectOpen}
          onBookmark={onProjectBookmark}
          onMore={onProjectMore}
        />
      ))}
    </div>
  );
}
