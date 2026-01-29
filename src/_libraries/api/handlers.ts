import { http, HttpResponse } from "msw";
import dayjs from "dayjs";

// 타입 정의
export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface Issue {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: string; // 동적 컬럼 지원을 위해 string으로 변경
  priority: "LOW" | "MEDIUM" | "HIGH";
  assignee?: string;
  type?: "TASK" | "BUG" | "STORY" | "EPIC"; // 업무유형
  labels?: string[]; // 레이블
  startDate?: string; // 타임라인 시작일
  dueDate?: string; // 타임라인 종료일
  parentId?: string; // 계층 구조 (Epic > Story)
  progress?: number; // 진행률 (0-100)
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

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

// Mock 데이터 저장소 (메모리 기반)
// Mock 데이터 저장소 (메모리 기반)
// eslint-disable-next-line prefer-const
let projects: Project[] = [
  {
    id: "1",
    name: "웹사이트 리뉴얼",
    description: "메인 웹사이트 디자인 및 기능 개선 프로젝트",
    createdAt: dayjs().subtract(10, "day").toISOString(),
    updatedAt: dayjs().subtract(10, "day").toISOString(),
  },
  {
    id: "2",
    name: "모바일 앱 개발",
    description: "iOS 및 Android 네이티브 앱 개발",
    createdAt: dayjs().subtract(5, "day").toISOString(),
    updatedAt: dayjs().subtract(5, "day").toISOString(),
  },
];

// eslint-disable-next-line prefer-const
let issues: Issue[] = [
  {
    id: "1",
    projectId: "1",
    title: "홈페이지 디자인 개선",
    description: "메인 페이지 UI/UX 개선 작업",
    status: "IN_PROGRESS",
    priority: "HIGH",
    assignee: "user1",
    type: "TASK",
    labels: ["디자인", "프론트엔드"],
    startDate: dayjs().subtract(2, "day").toISOString(),
    dueDate: dayjs().add(5, "day").toISOString(),
    progress: 45,
    createdAt: dayjs().subtract(3, "day").toISOString(),
    updatedAt: dayjs().subtract(3, "day").toISOString(),
  },
  {
    id: "2",
    projectId: "1",
    title: "반응형 레이아웃 적용",
    description: "모바일 및 태블릿 대응",
    status: "TODO",
    priority: "MEDIUM",
    assignee: "user2",
    type: "TASK",
    labels: ["프론트엔드", "반응형"],
    startDate: dayjs().add(1, "week").toISOString(),
    dueDate: dayjs().add(2, "month").toISOString(), // 2달 뒤까지 연장
    progress: 0,
    createdAt: dayjs().subtract(2, "day").toISOString(),
    updatedAt: dayjs().subtract(2, "day").toISOString(),
  },
  {
    id: "3",
    projectId: "1",
    title: "성능 최적화",
    description: "페이지 로딩 속도 개선",
    status: "DONE",
    priority: "HIGH",
    assignee: "user1",
    type: "STORY",
    labels: ["성능", "최적화"],
    startDate: dayjs().add(2, "month").toISOString(), // 2달 뒤 시작
    dueDate: dayjs().add(3, "month").toISOString(), // 3달 뒤 종료
    progress: 100,
    createdAt: dayjs().subtract(1, "day").toISOString(),
    updatedAt: dayjs().subtract(1, "day").toISOString(),
  },
  {
    id: "4",
    projectId: "2",
    title: "앱 아이콘 디자인",
    description: "iOS 및 Android 앱 아이콘 제작",
    status: "TODO",
    priority: "LOW",
    assignee: "user2",
    type: "TASK",
    labels: ["디자인"],
    startDate: dayjs().toISOString(),
    dueDate: dayjs().add(7, "day").toISOString(),
    progress: 10,
    createdAt: dayjs().subtract(1, "day").toISOString(),
    updatedAt: dayjs().subtract(1, "day").toISOString(),
  },
];

// Mock 사용자 데이터
// eslint-disable-next-line prefer-const
let users: User[] = [
  {
    id: "user1",
    email: "test@example.com",
    name: "테스트 사용자",
    role: "admin",
    createdAt: dayjs().subtract(30, "day").toISOString(),
  },
];

// Mock 토큰 저장소
const tokens = new Map<string, string>();

// Mock 컬럼 데이터 (프로젝트별 기본 컬럼)
// eslint-disable-next-line prefer-const
let columns: Column[] = [
  {
    id: "TODO",
    projectId: "1",
    name: "할 일",
    order: 0,
    color: null,
    limit: null,
    createdAt: dayjs().subtract(10, "day").toISOString(),
    updatedAt: dayjs().subtract(10, "day").toISOString(),
  },
  {
    id: "IN_PROGRESS",
    projectId: "1",
    name: "진행 중",
    order: 1,
    color: null,
    limit: null,
    createdAt: dayjs().subtract(10, "day").toISOString(),
    updatedAt: dayjs().subtract(10, "day").toISOString(),
  },
  {
    id: "DONE",
    projectId: "1",
    name: "완료",
    order: 2,
    color: null,
    limit: null,
    createdAt: dayjs().subtract(10, "day").toISOString(),
    updatedAt: dayjs().subtract(10, "day").toISOString(),
  },
  {
    id: "TODO",
    projectId: "2",
    name: "할 일",
    order: 0,
    color: null,
    limit: null,
    createdAt: dayjs().subtract(5, "day").toISOString(),
    updatedAt: dayjs().subtract(5, "day").toISOString(),
  },
  {
    id: "IN_PROGRESS",
    projectId: "2",
    name: "진행 중",
    order: 1,
    color: null,
    limit: null,
    createdAt: dayjs().subtract(5, "day").toISOString(),
    updatedAt: dayjs().subtract(5, "day").toISOString(),
  },
  {
    id: "DONE",
    projectId: "2",
    name: "완료",
    order: 2,
    color: null,
    limit: null,
    createdAt: dayjs().subtract(5, "day").toISOString(),
    updatedAt: dayjs().subtract(5, "day").toISOString(),
  },
];

// MSW 핸들러는 와일드카드 패턴을 사용하여 모든 도메인에서 오는 요청을 가로챕니다.
// `*/api/...` 패턴은 어떤 도메인에서든 `/api/...` 경로로 오는 요청을 매칭합니다.
// 실제 서버 연동 시에도 동일한 경로(`/api/...`)를 사용하므로 경로 변경이 필요 없습니다.
export const handlers = [
  // 인증: 로그인
  http.post("*/api/login", async ({ request }) => {
    const body = (await request.json()) as LoginRequest;

    const user = users.find((u) => u.email === body.email);

    // 간단한 인증 로직 (실제로는 비밀번호 해시 검증)
    if (!user || body.password !== "password") {
      return HttpResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // 요청하신 반환 구조에 맞춰 토큰 및 정보 생성
    const accessToken = `mock-access-token-${user.id}-${Date.now()}`;
    const refreshToken = `mock-refresh-token-${user.id}-${Date.now()}`;

    return HttpResponse.json({
      id: user.id,
      role: user.role,
      accessToken,
      refreshToken,
      expiresIn: 3600, // 1시간
      email: user.email,
      name: user.name,
    });
  }),

  // 인증: 토큰 갱신
  http.post("*/api/refresh", async ({ request }) => {
    const body = (await request.json()) as { refreshToken: string };

    if (!body.refreshToken) {
      return HttpResponse.json(
        { error: "Refresh token required" },
        { status: 400 }
      );
    }

    const accessToken = `mock-access-token-refreshed-${Date.now()}`;
    const refreshToken = `mock-refresh-token-refreshed-${Date.now()}`;

    return HttpResponse.json({
      accessToken,
      refreshToken,
      expiresIn: 3600, // 1시간
    });
  }),

  // 프로젝트 목록 조회
  http.get("*/api/projects", ({ request }) => {
    const response = HttpResponse.json(projects);
    return response;
  }),

  // 프로젝트 상세 조회
  http.get("*/api/projects/:id", ({ params }) => {
    const { id } = params as { id: string };
    const project = projects.find((p) => p.id === id);

    if (!project) {
      return HttpResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return HttpResponse.json(project);
  }),

  // 프로젝트 생성
  http.post("*/api/projects", async ({ request }) => {
    const body = (await request.json()) as Omit<
      Project,
      "id" | "createdAt" | "updatedAt"
    >;
    const now = dayjs().toISOString();

    const newProject: Project = {
      ...body,
      id: String(projects.length + 1),
      createdAt: now,
      updatedAt: now,
    };

    projects.push(newProject);
    return HttpResponse.json(newProject, { status: 201 });
  }),

  // 프로젝트 수정
  http.put("*/api/projects/:id", async ({ params, request }) => {
    const { id } = params as { id: string };
    const body = (await request.json()) as Partial<Project>;
    const projectIndex = projects.findIndex((p) => p.id === id);

    if (projectIndex === -1) {
      return HttpResponse.json({ error: "Project not found" }, { status: 404 });
    }

    projects[projectIndex] = {
      ...projects[projectIndex],
      ...body,
      id,
      updatedAt: dayjs().toISOString(),
    };

    return HttpResponse.json(projects[projectIndex]);
  }),

  // 프로젝트 삭제
  http.delete("*/api/projects/:id", ({ params }) => {
    const { id } = params as { id: string };
    const projectIndex = projects.findIndex((p) => p.id === id);

    if (projectIndex === -1) {
      return HttpResponse.json({ error: "Project not found" }, { status: 404 });
    }

    projects.splice(projectIndex, 1);
    // 관련 이슈도 삭제
    issues = issues.filter((i) => i.projectId !== id);

    return HttpResponse.json({ message: "Project deleted" });
  }),

  // 이슈 목록 조회
  http.get("*/api/issues", ({ request }) => {
    const url = new URL(request.url);
    const projectId = url.searchParams.get("projectId");

    let filteredIssues = issues;
    if (projectId) {
      filteredIssues = issues.filter((i) => i.projectId === projectId);
    }

    return HttpResponse.json(filteredIssues);
  }),

  // 이슈 상세 조회
  http.get("*/api/issues/:id", ({ params }) => {
    const { id } = params as { id: string };
    const issue = issues.find((i) => i.id === id);

    if (!issue) {
      return HttpResponse.json({ error: "Issue not found" }, { status: 404 });
    }

    return HttpResponse.json(issue);
  }),

  // 이슈 생성
  http.post("*/api/issues", async ({ request }) => {
    const body = (await request.json()) as Omit<
      Issue,
      "id" | "createdAt" | "updatedAt"
    >;
    const now = dayjs().toISOString();

    const newIssue: Issue = {
      ...body,
      id: String(issues.length + 1),
      createdAt: now,
      updatedAt: now,
    };

    issues.push(newIssue);
    return HttpResponse.json(newIssue, { status: 201 });
  }),

  // 이슈 수정
  http.put("*/api/issues/:id", async ({ params, request }) => {
    const { id } = params as { id: string };
    const body = (await request.json()) as Partial<Issue>;
    const issueIndex = issues.findIndex((i) => i.id === id);

    if (issueIndex === -1) {
      return HttpResponse.json({ error: "Issue not found" }, { status: 404 });
    }

    issues[issueIndex] = {
      ...issues[issueIndex],
      ...body,
      id,
      updatedAt: dayjs().toISOString(),
    };

    return HttpResponse.json(issues[issueIndex]);
  }),

  // 이슈 삭제
  http.delete("*/api/issues/:id", ({ params }) => {
    const { id } = params as { id: string };
    const issueIndex = issues.findIndex((i) => i.id === id);

    if (issueIndex === -1) {
      return HttpResponse.json({ error: "Issue not found" }, { status: 404 });
    }

    issues.splice(issueIndex, 1);

    // 프로젝트 날짜 업데이트 (삭제 시에도 범위가 바뀔 수 있음)
    // updateProjectDateRange(deletedIssue.projectId); // deletedIssue 참조 필요 시 로직 추가

    return HttpResponse.json({ message: "Issue deleted" });
  }),

  // 컬럼 목록 조회
  http.get("*/api/columns", ({ request }) => {
    const url = new URL(request.url);
    const projectId = url.searchParams.get("projectId");

    let filteredColumns = columns;
    if (projectId) {
      filteredColumns = columns.filter((c) => c.projectId === projectId);
    }

    // order로 정렬
    filteredColumns.sort((a, b) => a.order - b.order);

    return HttpResponse.json(filteredColumns);
  }),

  // 컬럼 상세 조회
  http.get("*/api/columns/:id", ({ params }) => {
    const { id } = params as { id: string };
    const column = columns.find((c) => c.id === id);

    if (!column) {
      return HttpResponse.json({ error: "Column not found" }, { status: 404 });
    }

    return HttpResponse.json(column);
  }),

  // 컬럼 생성
  http.post("*/api/columns", async ({ request }) => {
    const body = (await request.json()) as Omit<
      Column,
      "id" | "createdAt" | "updatedAt"
    >;
    const now = dayjs().toISOString();

    // 같은 프로젝트의 컬럼 개수로 order 결정
    const projectColumns = columns.filter(
      (c) => c.projectId === body.projectId
    );
    const maxOrder =
      projectColumns.length > 0
        ? Math.max(...projectColumns.map((c) => c.order))
        : -1;

    const newColumn: Column = {
      ...body,
      id: `col-${Date.now()}`,
      order: maxOrder + 1,
      createdAt: now,
      updatedAt: now,
    };

    columns.push(newColumn);
    return HttpResponse.json(newColumn, { status: 201 });
  }),

  // 컬럼 수정
  http.put("*/api/columns/:id", async ({ params, request }) => {
    const { id } = params as { id: string };
    const body = (await request.json()) as Partial<Column>;
    const columnIndex = columns.findIndex((c) => c.id === id);

    if (columnIndex === -1) {
      return HttpResponse.json({ error: "Column not found" }, { status: 404 });
    }

    columns[columnIndex] = {
      ...columns[columnIndex],
      ...body,
      id,
      updatedAt: dayjs().toISOString(),
    };

    return HttpResponse.json(columns[columnIndex]);
  }),

  // 컬럼 삭제
  http.delete("*/api/columns/:id", ({ params }) => {
    const { id } = params as { id: string };
    const columnIndex = columns.findIndex((c) => c.id === id);

    if (columnIndex === -1) {
      return HttpResponse.json({ error: "Column not found" }, { status: 404 });
    }

    columns.splice(columnIndex, 1);
    // 해당 컬럼의 이슈들은 기본 컬럼으로 이동 (또는 삭제)
    // 여기서는 간단하게 처리
    return HttpResponse.json({ message: "Column deleted" });
  }),
];
