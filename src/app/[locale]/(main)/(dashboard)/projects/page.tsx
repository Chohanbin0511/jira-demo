"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useProjects, useCreateProject, useUpdateProject } from "@/_features/projects/hooks/use-projects";
import { Button } from "@/_features/common/components/ui/button";
import { Input } from "@/_features/common/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/_features/common/components/ui/dialog";
import { DataTable, type Column } from "@/_features/common/components/data-table";
import { SearchBar } from "@/_features/common/components/search-bar";
import { formatDate } from "@/_utilities/date";
import { Plus, FolderKanban, Pencil, ChevronDown, ChevronUp } from "lucide-react";
import type { Project } from "@/_libraries/api/handlers";
import { useIsMobile } from "@/_features/common/hooks/useMobile";

export default function ProjectsPage() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [editProjectName, setEditProjectName] = useState("");
  const [editProjectDescription, setEditProjectDescription] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isHeaderOpen, setIsHeaderOpen] = useState(false); // 모바일에서는 기본적으로 접힘
  const { data: projects, isLoading, error } = useProjects();
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();

  // 검색 필터링
  const filteredProjects = useMemo(() => {
    if (!projects || !searchQuery.trim()) {
      return projects || [];
    }

    const query = searchQuery.toLowerCase();
    return projects.filter(
      (project) =>
        project.name.toLowerCase().includes(query) ||
        project.description?.toLowerCase().includes(query)
    );
  }, [projects, searchQuery]);

  // 검색어가 있는지 확인
  const hasSearchQuery = searchQuery.trim() !== "";

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) return;

    createProject.mutate(
      {
        name: projectName,
        description: projectDescription,
      },
      {
        onSuccess: () => {
          setProjectName("");
          setProjectDescription("");
          setIsDialogOpen(false);
        },
      }
    );
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setEditProjectName(project.name);
    setEditProjectDescription(project.description || "");
    setIsEditDialogOpen(true);
  };

  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject || !editProjectName.trim()) return;

    updateProject.mutate(
      {
        id: editingProject.id,
        data: {
          name: editProjectName,
          description: editProjectDescription,
        },
      },
      {
        onSuccess: () => {
          setIsEditDialogOpen(false);
          setEditingProject(null);
          setEditProjectName("");
          setEditProjectDescription("");
        },
      }
    );
  };

  const columns: Column<Project>[] = [
    {
      id: "name",
      header: "프로젝트 이름",
      accessor: (row) => (
        <div className="projects-table-project-name">
          <FolderKanban className="projects-table-project-icon" />
          <span className="projects-table-project-text">{row.name}</span>
        </div>
      ),
      sortable: true,
      sortKey: (row) => row.name,
    },
    {
      id: "description",
      header: "설명",
      accessor: (row) => (
        <span className="projects-table-description">
          {row.description || "-"}
        </span>
      ),
      className: "max-w-md",
      sortable: true,
      sortKey: (row) => row.description || "",
    },
    {
      id: "createdAt",
      header: "생성일",
      accessor: (row) => (
        <span className="text-[#6B778C] text-sm">
          {formatDate(row.createdAt, "YYYY-MM-DD")}
        </span>
      ),
      sortable: true,
      sortKey: (row) => new Date(row.createdAt),
    },
    {
      id: "updatedAt",
      header: "수정일",
      accessor: (row) => (
        <span className="text-[#6B778C] text-sm">
          {formatDate(row.updatedAt, "YYYY-MM-DD")}
        </span>
      ),
      sortable: true,
      sortKey: (row) => new Date(row.updatedAt),
    },
    {
      id: "actions",
      header: "",
      accessor: (row) => (
        <div className="projects-table-actions">
          <Button
            variant="ghost"
            size="sm"
            className="text-[#0052CC] hover:text-[#0065FF] hover:bg-[#EBECF0]"
            onClick={(e) => {
              e.stopPropagation();
              handleEditProject(row);
            }}
          >
            <Pencil className="h-4 w-4 mr-1" />
          </Button>
        </div>
      ),
      className: "w-24",
    },
  ];

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-destructive">프로젝트를 불러오는 중 오류가 발생했습니다.</div>
      </div>
    );
  }

  return (
    <div className="projects-page-container">
      {/* 모바일: 토글 가능한 헤더 */}
      {isMobile ? (
        <div className="bg-slate-50/50 border rounded-lg overflow-hidden mb-2">
          {/* 헤더 토글 버튼 */}
          <button
            onClick={() => setIsHeaderOpen(!isHeaderOpen)}
            className="w-full flex items-center justify-between px-3 py-2 hover:bg-slate-100/50 transition-colors"
          >
            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-semibold text-[#172B4D]">프로젝트</h1>
              {hasSearchQuery && (
                <span className="h-1.5 w-1.5 rounded-full bg-[#0052CC]"></span>
              )}
            </div>
            {isHeaderOpen ? (
              <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            )}
          </button>

          {/* 헤더 내용 (접기/펼치기) */}
          {isHeaderOpen && (
            <div className="px-3 pb-3 pt-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
              <p className="text-xs text-muted-foreground mb-3">
                프로젝트를 생성하고 관리하세요
              </p>
              <div className="flex flex-col gap-2">
                <div className="flex-1">
                  <SearchBar
                    placeholder="프로젝트 검색..."
                    value={searchQuery}
                    onChange={setSearchQuery}
                    maxWidth="max-w-full"
                  />
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full">
                      <Plus className="mr-2 h-4 w-4" />
                      새 프로젝트
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>새 프로젝트 생성</DialogTitle>
                      <DialogDescription>
                        프로젝트 이름과 설명을 입력하세요
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateProject} className="projects-dialog-form">
                      <div className="py-4">
                        <div className="projects-dialog-field">
                          <label htmlFor="name" className="projects-dialog-label">
                            프로젝트 이름
                          </label>
                          <Input
                            id="name"
                            value={projectName}
                            onChange={(e) => setProjectName(e.target.value)}
                            placeholder="예: 웹사이트 리뉴얼"
                            required
                          />
                        </div>
                        <div className="projects-dialog-field">
                          <label htmlFor="description" className="projects-dialog-label">
                            설명
                          </label>
                          <Input
                            id="description"
                            value={projectDescription}
                            onChange={(e) => setProjectDescription(e.target.value)}
                            placeholder="프로젝트에 대한 간단한 설명"
                          />
                        </div>
                      </div>
                      <DialogFooter className="projects-dialog-footer">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsDialogOpen(false)}
                        >
                          취소
                        </Button>
                        <Button type="submit" disabled={createProject.isPending}>
                          {createProject.isPending ? "생성 중..." : "생성"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* 데스크톱: 항상 보이는 헤더 */
        <div className="projects-page-header mb-4">
          <div>
            <h1 className="projects-page-title">프로젝트</h1>
            <p className="text-muted-foreground mt-2">
              프로젝트를 생성하고 관리하세요
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="projects-page-search">
              <SearchBar
                placeholder="프로젝트 검색..."
                value={searchQuery}
                onChange={setSearchQuery}
                maxWidth="max-w-xs"
              />
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  새 프로젝트
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>새 프로젝트 생성</DialogTitle>
                  <DialogDescription>
                    프로젝트 이름과 설명을 입력하세요
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateProject} className="projects-dialog-form">
                  <div className="py-4">
                    <div className="projects-dialog-field">
                      <label htmlFor="name" className="projects-dialog-label">
                        프로젝트 이름
                      </label>
                      <Input
                        id="name"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        placeholder="예: 웹사이트 리뉴얼"
                        required
                      />
                    </div>
                    <div className="projects-dialog-field">
                      <label htmlFor="description" className="projects-dialog-label">
                        설명
                      </label>
                      <Input
                        id="description"
                        value={projectDescription}
                        onChange={(e) => setProjectDescription(e.target.value)}
                        placeholder="프로젝트에 대한 간단한 설명"
                      />
                    </div>
                  </div>
                  <DialogFooter className="projects-dialog-footer">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      취소
                    </Button>
                    <Button type="submit" disabled={createProject.isPending}>
                      {createProject.isPending ? "생성 중..." : "생성"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      )}

      {/* 프로젝트 수정 다이얼로그 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>프로젝트 수정</DialogTitle>
            <DialogDescription>
              프로젝트 이름과 설명을 수정하세요
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateProject} className="projects-dialog-form">
            <div className="py-4">
              <div className="projects-dialog-field">
                <label htmlFor="edit-name" className="projects-dialog-label">
                  프로젝트 이름
                </label>
                <Input
                  id="edit-name"
                  value={editProjectName}
                  onChange={(e) => setEditProjectName(e.target.value)}
                  placeholder="예: 웹사이트 리뉴얼"
                  required
                />
              </div>
              <div className="projects-dialog-field">
                <label htmlFor="edit-description" className="projects-dialog-label">
                  설명
                </label>
                <Input
                  id="edit-description"
                  value={editProjectDescription}
                  onChange={(e) => setEditProjectDescription(e.target.value)}
                  placeholder="프로젝트에 대한 간단한 설명"
                />
              </div>
            </div>
            <DialogFooter className="projects-dialog-footer">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setEditingProject(null);
                  setEditProjectName("");
                  setEditProjectDescription("");
                }}
              >
                취소
              </Button>
              <Button type="submit" disabled={updateProject.isPending}>
                {updateProject.isPending ? "수정 중..." : "수정"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <DataTable
        data={filteredProjects}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="프로젝트가 없습니다. 새 프로젝트를 생성하여 시작하세요."
        emptyIcon={<FolderKanban className="h-12 w-12 text-muted-foreground" />}
        onRowClick={(project) => {
          router.push(`/board/${project.id}`);
        }}
      />
    </div>
  );
}
