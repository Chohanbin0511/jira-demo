"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/_features/common/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/_features/common/components/ui/dropdown-menu";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/_features/common/components/ui/avatar";
import { SearchBar } from "@/_features/common/components/search-bar";
import { Bell, Plus, LogOut } from "lucide-react";
import { useSession, signOut } from "next-auth/react";

export default function AppHeader() {
  const router = useRouter();
  const { data } = useSession();
  const user = data?.user;

  const handleLogout = () => {
    signOut({ redirectTo: "/login" });
  };

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="app-header-container">
      {/* 검색바 */}
      {/* <div className="app-header-search">
        <SearchBar placeholder="검색..." />
      </div> */}

      {/* 액션 버튼들 */}
      <div className="app-header-actions">
        {/* <Button variant="ghost" size="icon">
          <Plus className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon">
          <Bell className="h-4 w-4" />
        </Button> */}

        {/* 사용자 메뉴 */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="app-header-avatar-button">
              <Avatar className="app-header-avatar">
                <AvatarImage src="" alt={user?.name || "사용자"} />
                <AvatarFallback>
                  {getInitials(user?.name as string)}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="app-header-user-menu"
            align="end"
            forceMount
          >
            <DropdownMenuLabel className="font-normal">
              <div className="app-header-user-info">
                <p className="app-header-user-name">{user?.name || "사용자"}</p>
                <p className="app-header-user-email">
                  {user?.email || "user@example.com"}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>프로필</DropdownMenuItem>
            <DropdownMenuItem>설정</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              로그아웃
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
