import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";

export const routing = defineRouting({
  // 지원할 언어 목록
  locales: ["ko", "en"],
  // 기본 언어
  defaultLocale: "ko",
  // 주소창에 기본 언어 표시 여부 (false면 /ko 없이 그냥 /로 접속됨)
  localePrefix: "as-needed",
});

// 컴포넌트에서 사용할 네비게이션 유틸리티
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
