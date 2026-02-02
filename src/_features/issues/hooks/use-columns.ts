"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/_libraries/api";

export interface Column {
  id: string;
  projectId: string;
  name: string;
  order: number;
  color: string | null;
  limit: number | null;
  createdAt: string;
  updatedAt: string;
}

export function useColumns(projectId: string) {
  return useQuery<Column[]>({
    queryKey: ["columns", projectId],
    queryFn: () => api.get<Column[]>(`/columns?projectId=${projectId}`),
    enabled: !!projectId,
  });
}

export function useCreateColumn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<Column, "id" | "createdAt" | "updatedAt">) => {
      return api.post<Column>("/columns", data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["columns", data.projectId] });
    },
  });
}

export function useUpdateColumn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Column>;
    }) => {
      return api.put<Column>(`/columns/${id}`, data);
    },
    // onSuccess에서 자동 무효화하지 않음 (수동으로 처리)
    // onSuccess: (data) => {
    //   queryClient.invalidateQueries({ queryKey: ["columns", data.projectId] });
    // },
  });
}

export function useDeleteColumn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, projectId }: { id: string; projectId: string }) => {
      return api.delete(`/columns/${id}`);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["columns", variables.projectId] });
    },
  });
}
