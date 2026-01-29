"use client";

import { AbstractIntlMessages, NextIntlClientProvider } from "next-intl";
import AuthProvider from "./auth-provider";
import QueryProvider from "./query-provider";
import { APIProviderWrapper } from "./api-provider-wrapper";
import { Toaster } from "sonner";

interface RootProviderProps {
  children: React.ReactNode;
  locale: string;
  messages: AbstractIntlMessages;
}

export default function RootProvider({
  children,
  locale,
  messages,
}: RootProviderProps) {
  return (
    // 1. 다국어 (가장 바깥쪽: UI 렌더링에 필수)
    <NextIntlClientProvider locale={locale} messages={messages}>
      {/* 2. API/MSW 설정 (Auth나 Query가 API를 쓰니까 얘네보다 상위여야 함) */}
      <APIProviderWrapper>
        {/* 3. 인증 (API 설정 위에서 동작, Query가 사용자 정보를 쓸 수 있음) */}
        <AuthProvider>
          {/* 4. 데이터 페칭 (가장 안쪽: 위쪽의 모든 설정(API, Auth)을 활용) */}
          <QueryProvider>
            {children}
            <Toaster position="top-center" richColors closeButton />
          </QueryProvider>
        </AuthProvider>
      </APIProviderWrapper>
    </NextIntlClientProvider>
  );
}
