"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
import { Badge } from "@/_features/common/components/ui/badge";
import { useUpdateIssue, useDeleteIssue } from "../../hooks/use-issues";
import { useColumns } from "../../hooks/use-columns";
import { Trash2, User } from "lucide-react";
import type { Issue } from "@/_libraries/api/handlers";

interface IssueDetailModalProps {
  issue: Issue;
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function IssueDetailModal({
  issue,
  projectId,
  open,
  onOpenChange,
}: IssueDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(issue.title);
  const [description, setDescription] = useState(issue.description || "");
  const [status, setStatus] = useState(issue.status);
  const [priority, setPriority] = useState(issue.priority);
  const updateIssue = useUpdateIssue();
  const deleteIssue = useDeleteIssue();
  const { data: columns } = useColumns(projectId);

  useEffect(() => {
    if (open) {
      setTitle(issue.title);
      setDescription(issue.description || "");
      setStatus(issue.status);
      setPriority(issue.priority);
      setIsEditing(false);
    }
  }, [issue, open]);

  const handleSave = async () => {
    updateIssue.mutate(
      {
        id: issue.id,
        data: {
          title,
          description,
          status,
          priority,
        },
      },
      {
        onSuccess: () => {
          setIsEditing(false);
        },
      }
    );
  };

  const handleDelete = async () => {
    if (!confirm("정말로 이 이슈를 삭제하시겠습니까?")) {
      return;
    }

    deleteIssue.mutate(issue.id, {
      onSuccess: () => {
        onOpenChange(false);
      },
    });
  };

  const priorityConfig = {
    LOW: { label: "낮음", color: "bg-gray-100 text-gray-700" },
    MEDIUM: { label: "보통", color: "bg-blue-100 text-blue-700" },
    HIGH: { label: "높음", color: "bg-orange-100 text-orange-700" },
  };

  // 기본 상태 설정 (하위 호환성)
  const defaultStatusConfig: Record<string, { label: string; color: string }> = {
    TODO: { label: "할 일", color: "bg-gray-100 text-gray-700" },
    IN_PROGRESS: { label: "진행 중", color: "bg-blue-100 text-blue-700" },
    DONE: { label: "완료", color: "bg-green-100 text-green-700" },
  };

  // 컬럼 목록에서 동적으로 상태 설정 생성
  const statusConfig: Record<string, { label: string; color: string }> = columns && columns.length > 0
    ? columns.reduce((acc, col) => {
        acc[col.id] = {
          label: col.name,
          color: "bg-gray-100 text-gray-700", // 기본 색상 (컬럼 색상은 나중에 개선 가능)
        };
        return acc;
      }, {} as Record<string, { label: string; color: string }>)
    : defaultStatusConfig;

  // 현재 상태에 대한 설정 가져오기 (없으면 기본값)
  const getStatusConfig = (status: string) => {
    return (
      statusConfig[status] || {
        label: status,
        color: "bg-gray-100 text-gray-700",
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">{issue.id}</DialogTitle>
          <DialogDescription>이슈 상세 정보</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {(updateIssue.isError || deleteIssue.isError) && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
              {updateIssue.isError
                ? "이슈 수정 중 오류가 발생했습니다."
                : "이슈 삭제 중 오류가 발생했습니다."}
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">제목</Label>
              {isEditing ? (
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={updateIssue.isPending}
                />
              ) : (
                <p className="text-lg font-medium">{issue.title}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">설명</Label>
              {isEditing ? (
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={updateIssue.isPending}
                  rows={5}
                />
              ) : (
                <p className="whitespace-pre-wrap text-sm text-gray-600">
                  {issue.description || "설명이 없습니다."}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>상태</Label>
                {isEditing ? (
                  <Select
                    value={status}
                    onValueChange={(value: any) => setStatus(value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {columns && columns.length > 0
                        ? columns.map((col) => (
                            <SelectItem key={col.id} value={col.id}>
                              {col.name}
                            </SelectItem>
                          ))
                        : Object.entries(defaultStatusConfig).map(([key, config]) => (
                            <SelectItem key={key} value={key}>
                              {config.label}
                            </SelectItem>
                          ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge className={getStatusConfig(issue.status).color}>
                    {getStatusConfig(issue.status).label}
                  </Badge>
                )}
              </div>

              <div className="space-y-2">
                <Label>우선순위</Label>
                {isEditing ? (
                  <Select
                    value={priority}
                    onValueChange={(value: any) => setPriority(value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(priorityConfig).map(([key, config]) => (
                        <SelectItem key={key} value={key}>
                          {config.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge className={priorityConfig[issue.priority].color}>
                    {priorityConfig[issue.priority].label}
                  </Badge>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>담당자</Label>
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-gray-400" />
                <span>{issue.assignee || "미지정"}</span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-gray-500">
              <div>
                생성: {new Date(issue.createdAt).toLocaleDateString("ko-KR")}
              </div>
              <div>•</div>
              <div>
                수정: {new Date(issue.updatedAt).toLocaleDateString("ko-KR")}
              </div>
            </div>
          </div>

          <div className="flex justify-between gap-3">
            <Button
              variant="outline"
              onClick={handleDelete}
              disabled={deleteIssue.isPending}
              className="text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              삭제
            </Button>

            <div className="flex gap-3">
              {isEditing ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setTitle(issue.title);
                      setDescription(issue.description || "");
                      setStatus(issue.status);
                      setPriority(issue.priority);
                    }}
                    disabled={updateIssue.isPending}
                  >
                    취소
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={updateIssue.isPending}
                    className="bg-[#0052CC] hover:bg-[#0065FF] text-white"
                  >
                    {updateIssue.isPending ? "저장 중..." : "저장"}
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="bg-[#0052CC] hover:bg-[#0065FF] text-white"
                >
                  수정
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
