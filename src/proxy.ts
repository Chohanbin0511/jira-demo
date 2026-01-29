import NextAuth from "next-auth";
import createMiddleware from "next-intl/middleware";
import { routing } from "./_libraries/i18n/routing";
import { authConfig } from "./_libraries/auth/auth.config";

// 1. NextAuth 초기화
const { auth } = NextAuth(authConfig);

// 2. Next-Intl 미들웨어 생성
const intlMiddleware = createMiddleware(routing);

// 3. 미들웨어 결합
// auth()가 먼저 실행되어 auth.config.ts의 'authorized' 콜백을 수행함.
export default auth((request) => intlMiddleware(request));

// 5. Matcher 설정 (수정됨)
export const config = {
  // 아래 2번 설명 참조: 모든 경로를 포함하되, 정적 파일과 API는 제외
  // mockServiceWorker.js는 MSW Service Worker이므로 미들웨어를 거치지 않아야 함
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|mockServiceWorker.js).*)"],
};
