# API 설정 가이드

## Provider 구조

프로젝트는 환경 변수에 따라 자동으로 적절한 Provider를 선택합니다:

- **MSWProvider**: Mock API 사용 시 (`NEXT_PUBLIC_USE_MSW=true`)
- **APIProvider**: 실제 API 서버 사용 시 (`NEXT_PUBLIC_USE_MSW=false` 또는 미설정)

`APIProviderWrapper`가 레이아웃 단에서 자동으로 분기 처리합니다.

## MSW (Mock Service Worker) 사용

### 개발 환경에서 Mock API 사용

```bash
# Mock API 활성화하여 개발 서버 실행
pnpm dev:mock
```

또는 `.env.local` 파일에 다음을 추가:

```env
NEXT_PUBLIC_USE_MSW=true
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
```

### 실제 API 서버 사용

```bash
# 일반 개발 서버 실행 (MSW 비활성화)
pnpm dev
```

`.env.local` 파일:

```env
NEXT_PUBLIC_USE_MSW=false
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
```

## API 클라이언트 사용

### 기본 사용법

```typescript
import { api } from "@/_libraries/api";

// GET 요청
const projects = await api.get<Project[]>("/projects");

// POST 요청
const newProject = await api.post<Project>("/projects", {
  name: "새 프로젝트",
  description: "설명",
});

// PUT 요청
const updated = await api.put<Project>(`/projects/${id}`, {
  name: "수정된 이름",
});

// DELETE 요청
await api.delete(`/projects/${id}`);
```

### React Query와 함께 사용

```typescript
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/_libraries/api";

// Query
const { data, isLoading } = useQuery({
  queryKey: ["projects"],
  queryFn: () => api.get<Project[]>("/projects"),
});

// Mutation
const mutation = useMutation({
  mutationFn: (data: CreateProjectDto) => api.post<Project>("/projects", data),
});
```

## 실제 API 서버로 전환

1. **환경 변수 설정**
   - `.env.local` 파일 생성 또는 수정
   - `NEXT_PUBLIC_USE_MSW=false` 설정
   - `NEXT_PUBLIC_API_BASE_URL`을 실제 API 서버 주소로 변경

2. **코드 변경 불필요**
   - API 클라이언트는 동일하게 사용
   - MSW가 비활성화되면 자동으로 실제 API 서버로 요청

3. **인증 토큰**
   - JWT 토큰은 `localStorage.getItem("authToken")`에서 자동으로 가져옴
   - 필요시 `apiClient`의 interceptor 수정

## MSW Mock API 엔드포인트

현재 구현된 Mock API:

- `GET /api/projects` - 프로젝트 목록
- `GET /api/projects/:id` - 프로젝트 상세
- `POST /api/projects` - 프로젝트 생성
- `PUT /api/projects/:id` - 프로젝트 수정
- `DELETE /api/projects/:id` - 프로젝트 삭제
- `GET /api/issues` - 이슈 목록 (쿼리: `?projectId=1`)
- `GET /api/issues/:id` - 이슈 상세
- `POST /api/issues` - 이슈 생성
- `PUT /api/issues/:id` - 이슈 수정
- `DELETE /api/issues/:id` - 이슈 삭제

## 주의사항

- MSW는 **브라우저 환경에서만** 작동합니다
- 실제 API 서버와 동일한 엔드포인트 구조를 유지하세요
- Spring Boot API가 준비되면 `NEXT_PUBLIC_USE_MSW=false`로 설정하면 자동으로 전환됩니다
