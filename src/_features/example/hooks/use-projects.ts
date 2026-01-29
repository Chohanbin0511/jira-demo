import { useQuery } from "@tanstack/react-query";
import { api } from "@/_libraries/api";
import type { Project } from "@/_libraries/api/handlers";

/**
 * 프로젝트 목록 조회 훅
 */
export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: () => api.get<Project[]>("/projects"),
  });
}

/**
 * 프로젝트 상세 조회 훅
 */
export function useProject(id: string) {
  return useQuery({
    queryKey: ["projects", id],
    queryFn: () => api.get<Project>(`/projects/${id}`),
    enabled: !!id,
  });
}
