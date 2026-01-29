"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { loginAction } from "../api"; // actions.ts 경로 확인 필요
import { toast } from "sonner";

export function useLogin() {
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: any) => {
      const result = await loginAction(data);
      // 서버 액션이 { error: string }을 반환하면 예외를 던져서 onError로 보냄
      if (result?.error) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: () => {
      toast.success("로그인 성공!");
      router.refresh();
      router.push("/dashboard");
    },
    onError: (error) => {
      const message =
        error instanceof Error
          ? error.message
          : "로그인 중 오류가 발생했습니다.";
      toast.error(message);
    },
  });
}
