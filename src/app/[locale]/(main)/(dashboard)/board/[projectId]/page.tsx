"use client";

import { useParams } from "next/navigation";
import { KanbanBoardWrapper } from "@/_features/issues/components/kanban-board-wrapper";
import { Button } from "@/_features/common/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function BoardPage() {
  const params = useParams();
  const projectId = params.projectId as string;

  return (
    <div className="space-y-6">
      <div>
        <Link href="/projects">
          <Button variant="ghost" size="sm" className="mb-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            프로젝트 목록
          </Button>
        </Link>
      </div>

      <KanbanBoardWrapper projectId={projectId} />
    </div>
  );
}
