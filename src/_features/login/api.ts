"use server";

import { signIn } from "@/_libraries/auth";
import { AuthError } from "next-auth";

export async function loginAction(values: { email: string; password: string }) {
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
    });

    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "이메일 또는 비밀번호가 잘못되었습니다." };
        default:
          return { error: "알 수 없는 오류가 발생했습니다." };
      }
    }
    throw error;
  }
}
