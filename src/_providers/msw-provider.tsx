"use client";

import { useEffect, useState } from "react";
import { initMSW } from "../_libraries/api/msw";

export function MSWProvider({ children }: { children: React.ReactNode }) {
  // MSW가 준비되었는지 확인하는 상태
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    console.log("[MSW Provider] 컴포넌트 마운트됨");
    console.log("[MSW Provider] 환경 변수:", {
      NEXT_PUBLIC_USE_MSW: process.env.NEXT_PUBLIC_USE_MSW,
      isClient: typeof window !== "undefined",
    });

    const startMSW = async () => {
      console.log("[MSW Provider] MSW 초기화 시작...");
      // 초기화 완료될 때까지 대기
      await initMSW();
      console.log("[MSW Provider] MSW 초기화 완료");
      setIsReady(true);
    };

    startMSW().catch((error) => {
      console.error("[MSW Provider] ❌ MSW 초기화 실패:", error);
      console.error("[MSW Provider] ⚠️ MSW 없이 실행됩니다. API 요청이 실제 서버로 전송됩니다.");
      // 에러가 나더라도 앱은 띄워줘야 하니 true로 변경 (혹은 에러 화면 처리)
      setIsReady(true);
    });
  }, []);

  // 준비되지 않았으면 아무것도 렌더링하지 않음 (Loading 스피너를 넣어도 됨)
  if (!isReady) {
    return null;
  }

  return <>{children}</>;
}
