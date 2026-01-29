import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

// 우리가 만든 request.ts 경로를 지정 (경로 정확해야 함!)
const withNextIntl = createNextIntlPlugin("./src/_libraries/i18n/request.ts");

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["lucide-react", "date-fns"],
  },
};

// 플러그인으로 감싸서 내보내기
export default withNextIntl(nextConfig);
