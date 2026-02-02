import NextAuth, { DefaultSession, User } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { JWT } from "next-auth/jwt";
import { z } from "zod";
import { authConfig } from "./auth.config";
import { api } from "../api";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      accessToken: string;
      refreshToken: string;
      error?: "RefreshAccessTokenError"; // 클라이언트 강제 로그아웃 트리거용
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: string;
    accessToken: string;
    refreshToken: string;
    expiresIn: number; // 초 단위 (예: 3600)
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    accessToken: string;
    refreshToken: string;
    expiresAt: number; // 밀리초 단위 (Date.now() 기준)
    error?: "RefreshAccessTokenError";
  }
}

async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    const response = await api.post<User>("/refresh", {
      refreshToken: token.refreshToken,
    });

    if (!response) throw new Error("Failed to refresh token");

    console.log("response ::: ", response);

    return {
      ...token,
      accessToken: response.accessToken,
      refreshToken: response.refreshToken ?? token.refreshToken,
      expiresAt: Date.now() + response.expiresIn * 1000,
      error: undefined,
    };
  } catch (error) {
    console.error("Error refreshing access token", error);
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

// [Server Side] MSW 설정: instrumentation.ts 없이 서버에서 MSW를 실행하기 위함
// 동적 import를 사용하여 클라이언트 빌드 시 'async_hooks' 에러 방지
if (
  process.env.NEXT_PUBLIC_USE_MSW === "true" &&
  typeof window === "undefined"
) {
  import("../api/server").then(({ server }) => {
    server.listen({
      onUnhandledRequest: (request) => {
        // 정적 파일이나 Next.js 내부 요청은 로그 무시
        if (
          request.url.includes("/_next/") ||
          request.url.includes("/static/")
        ) {
          return;
        }
        console.warn("[MSW Server] 처리되지 않은 요청:", request.method, request.url);
      },
    });
    console.log("[MSW Server] ✅ 서버 사이드 MSW 활성화됨");
  }).catch((error) => {
    console.error("[MSW Server] ❌ 서버 사이드 MSW 초기화 실패:", error);
  });
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsed = z
          .object({ email: z.string().email(), password: z.string().min(4) })
          .safeParse(credentials);

        if (parsed.success) {
          try {
            // 실제 백엔드(또는 MSW)로 로그인 요청
            const user = await api.post<User>("/login", {
              email: parsed.data.email,
              password: parsed.data.password,
            });

            return user;
          } catch (error) {
            console.error("Login failed:", error);
            return null;
          }
        }
        return null;
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        return {
          id: user.id,
          role: user.role,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          expiresAt: Date.now() + user.expiresIn * 1000,
        };
      }

      if (Date.now() < token.expiresAt) {
        return token;
      }

      return await refreshAccessToken(token);
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.accessToken = token.accessToken;
        session.user.error = token.error;
      }
      return session;
    },
  },
});
