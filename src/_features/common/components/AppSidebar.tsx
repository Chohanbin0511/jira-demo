"use client";

import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/_features/common/components/ui/sidebar";
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Users,
  Settings,
  GanttChart,
} from "lucide-react";

const menuItems = [
  {
    title: "대시보드",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    title: "프로젝트",
    icon: FolderKanban,
    href: "/projects",
  },
  {
    title: "타임라인",
    icon: GanttChart,
    href: "/timeline",
  },
  {
    title: "예시",
    icon: Settings,
    href: "/example",
  },
];

export default function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="app-sidebar-header">
          <div className="app-sidebar-logo">J</div>
          <span className="app-sidebar-title">Jira</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>메뉴</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
