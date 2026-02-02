"use client";

import { useTranslations } from "next-intl";

export default function DashboardPage() {
  const t = useTranslations("HomePage");

  return (
    <div className="space-y-6">
      {/* 헤더 섹션 */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">대시보드 페이지입니다.</p>
      </div>
    </div>
  );
}
