"use client";

import { useState, useEffect } from "react";
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
import { useUpdateColumn } from "../../hooks/use-columns";
import { Settings, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import type { Column } from "../../hooks/use-columns";
import { useQueryClient } from "@tanstack/react-query";

interface EditColumnModalProps {
  column: Column;
  projectId: string;
  isFirst?: boolean;
  isLast?: boolean;
  onMove?: (columnId: string, direction: "left" | "right") => void;
}

export function EditColumnModal({
  column,
  projectId,
  isFirst = false,
  isLast = false,
  onMove,
}: EditColumnModalProps) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(column.name);
  const [color, setColor] = useState(column.color || "#6b7280");
  const [limit, setLimit] = useState<string>(column.limit?.toString() || "");
  const [error, setError] = useState("");
  const updateColumn = useUpdateColumn();

  // 모달이 열릴 때마다 최신 column 데이터로 초기화
  useEffect(() => {
    if (open) {
      setName(column.name);
      setColor(column.color || "#6b7280");
      setLimit(column.limit?.toString() || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, column.id]); // column.id만 의존성으로 사용하여 같은 컬럼이 열릴 때만 초기화

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("컬럼 이름을 입력해주세요.");
      return;
    }

    updateColumn.mutate(
      {
        id: column.id,
        data: { 
          name: name.trim(), 
          color: color || null,
          limit: limit ? parseInt(limit, 10) : null,
        },
      },
      {
        onSuccess: (updatedColumn) => {
          // 캐시 직접 업데이트하여 즉시 반영
          queryClient.setQueryData<Column[]>(
            ["columns", projectId],
            (oldData) => {
              if (!oldData) return oldData;
              return oldData.map((col) =>
                col.id === column.id ? updatedColumn : col
              );
            }
          );
          setOpen(false);
        },
        onError: () => {
          setError("컬럼 수정 중 오류가 발생했습니다.");
        },
      }
    );
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "이 컬럼을 삭제하시겠습니까? 컬럼 내의 이슈는 보관되지만 컬럼 할당이 해제됩니다."
      )
    ) {
      return;
    }

    // TODO: 컬럼 삭제 API 구현 시 사용
    console.log("Delete column:", column.id);
    setOpen(false);
  };

  const handleMove = (direction: "left" | "right") => {
    if (onMove) {
      onMove(column.id, direction);
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 hover:bg-[#EBECF0] text-[#6B778C] hover:text-[#172B4D]"
        >
          <Settings className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>컬럼 편집</DialogTitle>
          <DialogDescription>
            컬럼 이름과 색상을 수정하세요. (현재는 고정 컬럼만 사용 가능)
          </DialogDescription>
        </DialogHeader>

        {/* 순서 변경 섹션 */}
        <div className="border border-[#DFE1E6] rounded p-4 bg-[#F4F5F7]">
          <Label className="text-sm font-medium mb-2 block text-[#172B4D]">
            컬럼 순서
          </Label>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleMove("left")}
              disabled={isFirst || updateColumn.isPending}
              className="flex-1 gap-2 border-[#DFE1E6] text-[#172B4D] hover:bg-[#EBECF0] disabled:opacity-50"
              title={isFirst ? "첫 번째 컬럼입니다" : "왼쪽으로 이동"}
            >
              <ChevronLeft className="h-4 w-4" />
              왼쪽으로
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleMove("right")}
              disabled={isLast || updateColumn.isPending}
              className="flex-1 gap-2 border-[#DFE1E6] text-[#172B4D] hover:bg-[#EBECF0] disabled:opacity-50"
              title={isLast ? "마지막 컬럼입니다" : "오른쪽으로 이동"}
            >
              오른쪽으로
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">컬럼 이름</Label>
            <Input
              id="name"
              placeholder="예: 검토 중"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={updateColumn.isPending}
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
                disabled={updateColumn.isPending}
              />
              <Input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="#6b7280"
                disabled={updateColumn.isPending}
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
              disabled={updateColumn.isPending}
            />
            <p className="text-xs text-[#6B778C]">
              컬럼에 들어갈 수 있는 최대 이슈 개수를 설정합니다. 비워두면 제한이 없습니다.
            </p>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex justify-between">
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled
              className="gap-2 bg-[#DE350B] hover:bg-[#FF5630] text-white"
            >
              <Trash2 className="h-4 w-4" />
              삭제 (준비 중)
            </Button>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={updateColumn.isPending}
                className="border-[#DFE1E6] text-[#172B4D] hover:bg-[#EBECF0]"
              >
                취소
              </Button>
              <Button
                type="submit"
                disabled={updateColumn.isPending}
                className="bg-[#0052CC] hover:bg-[#0065FF] text-white"
              >
                {updateColumn.isPending ? "저장 중..." : "저장"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
