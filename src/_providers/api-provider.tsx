"use client";

import { useEffect } from "react";

/**
 * API Provider - 실제 API 서버 사용 시
 * API 클라이언트 설정 및 초기화
 */
export function APIProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // 실제 API 서버 사용 시 필요한 초기화 작업
    // 예: API 헬스 체크, 토큰 갱신 등
    console.log("APIProvider: Using real API server");
  }, []);

  return <>{children}</>;
}
