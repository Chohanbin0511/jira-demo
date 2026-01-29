import type { NextAuthConfig } from "next-auth";
import { routing } from "../i18n/routing";

// 1. 라우트 정의 (확장성 확보)
// 로그인하지 않아도 접근 가능한 경로들
const publicRoutes = ["/login"];

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = nextUrl;

      // 2. URL에서 로케일 감지
      const segments = pathname.split("/");
      const firstSegment = segments[1];

      let locale = routing.defaultLocale as string;
      let cleanPath = pathname;

      // URL의 첫 세그먼트가 유효한 로케일이라면?
      if (firstSegment && routing.locales.includes(firstSegment as any)) {
        locale = firstSegment;
        cleanPath = pathname.replace(`/${locale}`, "") || "/";
      }

      // 3. 유틸리티: 로케일을 고려한 리다이렉트 경로 생성 (as-needed 완벽 대응)
      const getLocalizedUrl = (path: string) => {
        const prefix = locale === routing.defaultLocale ? "" : `/${locale}`;
        const targetPath = path.startsWith("/") ? path : `/${path}`;
        return new URL(`${prefix}${targetPath}`, nextUrl);
      };

      // 4. 라우트 검사 로직
      const isPublicRoute = publicRoutes.some(
        (route) => cleanPath === route || cleanPath.startsWith(`${route}/`)
      );

      // 로그인 O && 공개 페이지 = 메인
      if (isLoggedIn && isPublicRoute) {
        return Response.redirect(getLocalizedUrl("/dashboard"));
      }

      // 공개 페이지 = 통과
      if (isPublicRoute) {
        return true;
      }

      // 로그인 X = 로그인 페이지
      if (!isLoggedIn) {
        return Response.redirect(getLocalizedUrl("/login"));
      }

      // 그 외 통과
      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
