"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/_features/common/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/_features/common/components/ui/card";
import { useProjects } from "@/_features/example/hooks/use-projects";
import {
  ProjectSearchBar,
  ProjectLoadingState,
  ProjectErrorState,
  ProjectGrid,
} from "@/_features/example/components";

export default function DashboardPage() {
  const t = useTranslations("HomePage");
  const { data: projects, isLoading, error } = useProjects();

  const handleProjectOpen = (projectId: string) => {
    console.log("프로젝트 열기:", projectId);
    // TODO: 프로젝트 상세 페이지로 이동
  };

  const handleProjectBookmark = (projectId: string) => {
    console.log("프로젝트 북마크:", projectId);
    // TODO: 북마크 기능 구현
  };

  const handleProjectMore = (projectId: string) => {
    console.log("프로젝트 더보기:", projectId);
    // TODO: 더보기 메뉴 구현
  };

  const handleCreateProject = () => {
    console.log("새 프로젝트 생성");
    // TODO: 프로젝트 생성 모달/페이지로 이동
  };

  const handleSearchChange = (value: string) => {
    console.log("검색:", value);
    // TODO: 검색 기능 구현
  };

  return (
    <div className="space-y-6">
      {/* 헤더 섹션 */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">
          프로젝트를 관리하고 이슈를 추적하세요
        </p>
      </div>

      {/* 검색 및 액션 바 */}
      <ProjectSearchBar
        onCreateClick={handleCreateProject}
        onSearchChange={handleSearchChange}
      />

      {/* 로딩 상태 */}
      {isLoading && <ProjectLoadingState />}

      {/* 에러 상태 */}
      {error && <ProjectErrorState />}

      {/* 프로젝트 카드 그리드 */}
      {!isLoading && !error && projects && (
        <ProjectGrid
          projects={projects}
          onProjectOpen={handleProjectOpen}
          onProjectBookmark={handleProjectBookmark}
          onProjectMore={handleProjectMore}
        />
      )}

      {/* Button Variants 예제 섹션 */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Button 컴포넌트 Variants</CardTitle>
          <CardDescription>
            shadcn/ui Button 컴포넌트의 다양한 스타일
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button>기본 (Default)</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
          </div>
          <div className="flex flex-wrap gap-3 mt-4">
            <Button size="sm">작은 버튼</Button>
            <Button size="default">기본 크기</Button>
            <Button size="lg">큰 버튼</Button>
          </div>
        </CardContent>
      </Card>
</div>
  );
}
