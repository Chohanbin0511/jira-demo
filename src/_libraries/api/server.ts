import { setupServer } from "msw/node";
import { handlers } from "./handlers";

// Node.js 환경(서버 사이드)에서 요청을 가로채는 MSW 서버 설정
export const server = setupServer(...handlers);
