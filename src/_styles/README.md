# Styles Directory

이 디렉토리는 프로젝트의 SCSS 스타일 파일을 관리합니다.

## 구조

- `base/`: 기본 스타일 (변수, 믹스인, 리셋 등)
- `components/`: 컴포넌트별 스타일
- `pages/`: 페이지별 스타일
- `layouts/`: 레이아웃 관련 스타일
- `main.scss`: 메인 스타일 파일 (모든 스타일 import)

## 사용 방법

각 컴포넌트/페이지에서 의미있는 클래스명을 사용하고, 해당 클래스명에 대한 스타일을 이 디렉토리의 SCSS 파일에서 정의합니다.

예시:
```tsx
// 컴포넌트
<div className="login-page-container">
  <Card className="login-card">
    ...
  </Card>
</div>
```

```scss
// src/_styles/pages/login.scss
.login-page-container {
  display: flex;
  min-height: 100vh;
  align-items: center;
  justify-content: center;
  background-color: #f9fafb;
  padding: 1rem;
}

.login-card {
  width: 100%;
  max-width: 28rem;
}
```
