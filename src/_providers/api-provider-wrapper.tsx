"use client";

import { MSWProvider } from "./msw-provider";
import { APIProvider } from "./api-provider";

/**
 * API Provider Wrapper
 * 환경 변수에 따라 MSW 또는 실제 API Provider를 선택합니다.
 *
 * NEXT_PUBLIC_USE_MSW=true -> MSWProvider (Mock API)
 * NEXT_PUBLIC_USE_MSW=false 또는 미설정 -> APIProvider (실제 API)
 */
export function APIProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const useMSW = process.env.NEXT_PUBLIC_USE_MSW === "true";
  
  console.log("[API Provider Wrapper] 렌더링:", {
    useMSW,
    NEXT_PUBLIC_USE_MSW: process.env.NEXT_PUBLIC_USE_MSW,
    isClient: typeof window !== "undefined",
  });

  if (useMSW) {
    console.log("[API Provider Wrapper] MSWProvider 사용");
    return <MSWProvider>{children}</MSWProvider>;
  }

  console.log("[API Provider Wrapper] APIProvider 사용");
  return <APIProvider>{children}</APIProvider>;
}
