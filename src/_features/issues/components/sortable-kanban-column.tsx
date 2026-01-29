"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/_utilities/utilities";
import { GripVertical } from "lucide-react";

interface SortableKanbanColumnProps {
  id: string;
  title: string;
  count: number;
  children: React.ReactNode;
}

export function SortableKanbanColumn({
  id,
  title,
  count,
  children,
}: SortableKanbanColumnProps) {
  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // 두 ref를 하나로 합치기
  const setRefs = (node: HTMLDivElement | null) => {
    setSortableRef(node);
    setDroppableRef(node);
  };

  return (
    <div
      ref={setRefs}
      style={style}
      className={cn(
        "flex flex-col bg-gray-50 rounded-lg border border-gray-200 min-w-[280px] max-w-[280px]",
        isDragging && "ring-2 ring-blue-500",
        isOver && "ring-2 ring-blue-400 ring-offset-2"
      )}
    >
      {/* 컬럼 헤더 */}
      <div
        {...attributes}
        {...listeners}
        className="flex items-center justify-between p-3 border-b border-gray-200 bg-white rounded-t-lg cursor-grab active:cursor-grabbing"
      >
        <div className="flex items-center gap-2">
          <GripVertical className="h-4 w-4 text-gray-400" />
          <h3 className="font-semibold text-sm text-gray-700">{title}</h3>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
            {count}
          </span>
        </div>
      </div>

      {/* 컬럼 내용 */}
      <div className="flex-1 p-2 space-y-2 overflow-y-auto max-h-[calc(100vh-300px)]">
        {children}
      </div>
    </div>
  );
}
