"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/_features/common/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/_features/common/components/ui/select";
import { Button } from "@/_features/common/components/ui/button";
import { Input } from "@/_features/common/components/ui/input";
import { Label } from "@/_features/common/components/ui/label";
import { Textarea } from "@/_features/common/components/ui/textarea";
import { useCreateIssue } from "../../hooks/use-issues";
import { useColumns } from "../../hooks/use-columns";
import { Plus } from "lucide-react";

interface CreateIssueModalProps {
  projectId: string;
  trigger?: React.ReactNode;
}

// 기본 컬럼 (하위 호환성)
const defaultColumns = [
  { id: "TODO", name: "할 일" },
  { id: "IN_PROGRESS", name: "진행 중" },
  { id: "DONE", name: "완료" },
];

export function CreateIssueModal({
  projectId,
  trigger,
}: CreateIssueModalProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"LOW" | "MEDIUM" | "HIGH">("MEDIUM");
  const [status, setStatus] = useState<string>("TODO");
  const createIssue = useCreateIssue();
  const { data: columns } = useColumns(projectId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      return;
    }

    createIssue.mutate(
      {
        projectId,
        title,
        description,
        priority,
        status,
      },
      {
        onSuccess: () => {
          setOpen(false);
          setTitle("");
          setDescription("");
          setPriority("MEDIUM");
          // 첫 번째 컬럼을 기본값으로 설정
          const firstColumnId = columns && columns.length > 0
            ? columns[0].id
            : defaultColumns[0].id;
          setStatus(firstColumnId);
        },
      }
    );
  };

  const priorityConfig = [
    { value: "LOW", label: "낮음", color: "text-gray-600" },
    { value: "MEDIUM", label: "보통", color: "text-blue-600" },
    { value: "HIGH", label: "높음", color: "text-orange-600" },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2 bg-[#0052CC] hover:bg-[#0065FF] text-white">
            <Plus className="h-4 w-4" />
            이슈 만들기
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>새 이슈 만들기</DialogTitle>
          <DialogDescription>
            작업할 새로운 이슈를 생성하세요.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">제목 *</Label>
            <Input
              id="title"
              placeholder="이슈 제목을 입력하세요"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={createIssue.isPending}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">설명</Label>
            <Textarea
              id="description"
              placeholder="이슈에 대한 상세한 설명을 입력하세요"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={createIssue.isPending}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">상태 *</Label>
            <Select value={status} onValueChange={(value: string) => setStatus(value)}>
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {columns && columns.length > 0
                  ? columns.map((col) => (
                      <SelectItem key={col.id} value={col.id}>
                        {col.name}
                      </SelectItem>
                    ))
                  : defaultColumns.map((col) => (
                      <SelectItem key={col.id} value={col.id}>
                        {col.name}
                      </SelectItem>
                    ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">우선순위 *</Label>
            <Select
              value={priority}
              onValueChange={(value: any) => setPriority(value)}
            >
              <SelectTrigger id="priority">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {priorityConfig.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    <span className={p.color}>{p.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {createIssue.isError && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
              이슈 생성 중 오류가 발생했습니다.
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={createIssue.isPending}
              className="border-[#DFE1E6] text-[#172B4D] hover:bg-[#EBECF0]"
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={createIssue.isPending}
              className="bg-[#0052CC] hover:bg-[#0065FF] text-white"
            >
              {createIssue.isPending ? "생성 중..." : "이슈 만들기"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
