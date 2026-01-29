"use client";

import { useSearchParams } from "next/navigation";
import { useTimeline } from "@/_features/timeline/hooks/use-timeline";
import { TimelineView } from "@/_features/timeline/components/TimelineView";
import { Skeleton } from "@/_features/common/components/ui/skeleton";

export function TimelineContainer() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId") || undefined;

  const { tasks, isLoading, error } = useTimeline(projectId);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-[120px]" />
        </div>
        <Skeleton className="h-[500px] w-full rounded-lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[400px] items-center justify-center text-destructive">
        Failed to load timeline data.
      </div>
    );
  }

  return <TimelineView tasks={tasks} />;
}
