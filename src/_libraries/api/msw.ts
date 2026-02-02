"use client";

import type { SetupWorker } from "msw/browser";

let worker: SetupWorker;

export async function initMSW() {
  if (typeof window === "undefined") {
    return;
  }

  const useMSW = process.env.NEXT_PUBLIC_USE_MSW === "true";

  if (!useMSW) {
    console.log("[MSW] MSW 비활성화됨");
    return;
  }

  try {
    // ⭐️ 워커가 없을 때만 생성 (싱글톤 패턴)
    if (!worker) {
      // 여기서 동적으로 import (Tree Shaking 최적화)
      const { setupWorker } = await import("msw/browser");
      const { handlers } = await import("./handlers");
      worker = setupWorker(...handlers);
    }

    await worker.start({
      onUnhandledRequest: (request) => {
        // 정적 파일이나 Next.js 내부 요청은 로그 무시
        if (
          request.url.includes("/_next/") ||
          request.url.includes("/static/")
        ) {
          return;
        }
      },
      serviceWorker: {
        url: "/mockServiceWorker.js",
      },
      quiet: false, // MSW 내부 로그 활성화
    });

    // Service Worker 등록 확인
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration, index) => {
          console.log(`[MSW] Service Worker ${index + 1}:`, {
            scope: registration.scope,
            active: registration.active?.scriptURL,
          });
        });
      });
    }
  } catch (error) {
    throw error;
  }
}
