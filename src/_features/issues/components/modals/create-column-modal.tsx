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
import { Button } from "@/_features/common/components/ui/button";
import { Input } from "@/_features/common/components/ui/input";
import { Label } from "@/_features/common/components/ui/label";
import { useCreateColumn } from "../../hooks/use-columns";
import { Plus } from "lucide-react";

interface CreateColumnModalProps {
  projectId: string;
  trigger?: React.ReactNode;
}

export function CreateColumnModal({
  projectId,
  trigger,
}: CreateColumnModalProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState("#6b7280");
  const [limit, setLimit] = useState<string>("");
  const createColumn = useCreateColumn();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      return;
    }

    createColumn.mutate(
      {
        projectId,
        name: name.trim(),
        order: 0, // API에서 자동으로 계산됨
        color: color || null,
        limit: limit ? parseInt(limit, 10) : null,
      },
      {
        onSuccess: () => {
          setOpen(false);
          setName("");
          setColor("#6b7280");
          setLimit("");
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            variant="outline"
            size="sm"
            className="gap-1 md:gap-2 border-[#DFE1E6] text-[#172B4D] hover:bg-[#EBECF0] text-xs md:text-sm px-2 md:px-3 h-8 md:h-9"
          >
            <Plus className="h-3.5 w-3.5 md:h-4 md:w-4" />
            <span className="hidden sm:inline">새 컬럼</span>
            <span className="sm:hidden">컬럼</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>새 컬럼 만들기</DialogTitle>
          <DialogDescription>
            칸반 보드에 새로운 컬럼을 추가하세요. (현재는 고정 컬럼만 사용 가능)
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">컬럼 이름</Label>
            <Input
              id="name"
              placeholder="예: 검토 중"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={createColumn.isPending}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="color">색상</Label>
            <div className="flex gap-2">
              <Input
                id="color"
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-20 h-10"
                disabled={createColumn.isPending}
              />
              <Input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="#6b7280"
                disabled={createColumn.isPending}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="limit">이슈 개수 제한 (선택사항)</Label>
            <Input
              id="limit"
              type="number"
              min="1"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              placeholder="예: 10 (제한 없음: 비워두기)"
              disabled={createColumn.isPending}
            />
            <p className="text-xs text-[#6B778C]">
              컬럼에 들어갈 수 있는 최대 이슈 개수를 설정합니다. 비워두면 제한이 없습니다.
            </p>
          </div>

          {createColumn.isError && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
              컬럼 생성 중 오류가 발생했습니다.
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={createColumn.isPending}
              className="border-[#DFE1E6] text-[#172B4D] hover:bg-[#EBECF0]"
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={createColumn.isPending || !name.trim()}
              className="bg-[#0052CC] hover:bg-[#0065FF] text-white"
            >
              {createColumn.isPending ? "생성 중..." : "생성"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
