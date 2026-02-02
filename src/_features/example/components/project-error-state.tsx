"use client";

import { Card, CardContent } from "@/_features/common/components/ui/card";
import { AlertCircle } from "lucide-react";

interface ProjectErrorStateProps {
  message?: string;
}

export function ProjectErrorState({
  message = "프로젝트를 불러오는 중 오류가 발생했습니다.",
}: ProjectErrorStateProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircle className="h-5 w-5" />
          <p>{message}</p>
        </div>
      </CardContent>
    </Card>
  );
}
