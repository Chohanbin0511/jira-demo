"use client";

import * as React from "react";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/_features/common/components/ui/sidebar";
import AppSidebar from "./AppSidebar";
import AppHeader from "./AppHeader";
import { Separator } from "@/_features/common/components/ui/separator";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  // 사이드바 토글 등으로 컨테이너 크기가 변경될 때 차트 리사이징 처리
  React.useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      window.dispatchEvent(new Event("resize"));
    });

    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, []);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="overflow-x-hidden">
        <div ref={containerRef} className="app-layout-container w-full">
          <div className="app-layout-header">
            <SidebarTrigger />
            <Separator orientation="vertical" className="h-4" />
            <AppHeader />
          </div>
          <main className="app-layout-main">{children}</main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
