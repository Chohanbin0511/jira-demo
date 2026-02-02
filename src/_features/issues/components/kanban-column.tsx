"use client";

import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/_utilities/utilities";

interface KanbanColumnProps {
  id: string;
  title: string;
  color: string;
  children: React.ReactNode;
}

export function KanbanColumn({
  id,
  title,
  color,
  children,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "rounded-lg border p-4 min-h-[400px] transition-colors",
        color,
        isOver && "ring-2 ring-primary ring-offset-2"
      )}
    >
      <h3 className="font-semibold mb-4 text-lg">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}
