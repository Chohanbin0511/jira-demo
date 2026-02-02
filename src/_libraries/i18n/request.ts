import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  // 1. 현재 요청된 로케일을 가져옴
  let locale = await requestLocale;

  // 2. 만약 로케일이 없거나 지원하지 않는 언어라면 기본값(ko)으로 설정
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    // 3. _messages 폴더에서 해당 언어의 JSON 파일을 동적으로 가져옴
    // 에러 방지를 위해 default export를 가져오도록 설정
    messages: (await import(`../../_messages/${locale}.json`)).default,
  };
});
