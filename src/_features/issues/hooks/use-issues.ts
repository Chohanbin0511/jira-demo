"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/_libraries/api";
import type { Issue } from "@/_libraries/api/handlers";

export function useIssues(projectId?: string) {
  return useQuery({
    queryKey: ["issues", projectId],
    queryFn: () => {
      const url = projectId ? `/issues?projectId=${projectId}` : "/issues";
      return api.get<Issue[]>(url);
    },
  });
}

export function useIssue(id: string) {
  return useQuery({
    queryKey: ["issues", id],
    queryFn: () => api.get<Issue>(`/issues/${id}`),
    enabled: !!id,
  });
}

export function useCreateIssue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<Issue, "id" | "createdAt" | "updatedAt">) => {
      return api.post<Issue>("/issues", data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["issues"] });
      queryClient.invalidateQueries({ queryKey: ["issues", data.projectId] });
    },
  });
}

export function useDeleteIssue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {
      return api.delete(`/issues/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["issues"] });
    },
  });
}

export function useUpdateIssue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Issue> }) => {
      return api.put<Issue>(`/issues/${id}`, data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["issues"] });
      queryClient.invalidateQueries({ queryKey: ["issues", data.projectId] });
      queryClient.invalidateQueries({ queryKey: ["issues", data.id] });
    },
  });
}
