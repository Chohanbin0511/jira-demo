"use client";

import {
  QueryClient,
  QueryClientProvider,
  defaultShouldDehydrateQuery,
  isServer,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { ReactNode } from "react";

// 1. QueryClient 생성 함수
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 데이터 캐시시 유통기한 1분
        gcTime: 5 * 60 * 1000, // 데이터 캐시 비우는 시간 5분
        retry: 1,
        refetchOnWindowFocus: false,
      },
      dehydrate: {
        // pending 상태인 쿼리도 dehydrate 포함 (SSR 프리패칭 시 필수)
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === "pending",
      },
    },
  });
}

// 2. 브라우저용 싱글톤 변수
let browserQueryClient: QueryClient | undefined = undefined;

// 3. Server/Client 환경에 따라 클라이언트 반환 (export 필수!)
export function getQueryClient() {
  if (isServer) {
    return makeQueryClient();
  } else {
    // 클라이언트: 없으면 만들고, 있으면 재사용
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

// 4. Provider 컴포넌트
export default function QueryProvider({ children }: { children: ReactNode }) {
  // 컴포넌트 내부에서는 getQueryClient 호출
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
