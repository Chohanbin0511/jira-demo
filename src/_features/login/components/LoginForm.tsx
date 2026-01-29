"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLogin } from "../hooks/use-login";
import { Button } from "@/_features/common/components/ui/button";
import { Input } from "@/_features/common/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/_features/common/components/ui/form";

// 1. 스키마 정의 (Co-location)
const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: "이메일을 입력해주세요." })
    .email({ message: "유효한 이메일 형식이 아닙니다." }),
  password: z.string().min(4, { message: "비밀번호는 4자 이상이어야 합니다." }),
});

type LoginSchemaType = z.infer<typeof loginSchema>;

export function LoginForm() {
  const { mutate, isPending } = useLogin();

  const form = useForm<LoginSchemaType>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "test@example.com",
      password: "password",
    },
  });

  const onSubmit = (values: LoginSchemaType) => {
    form.clearErrors("root");
    mutate(values, {
      onError: (error) => {
        const message = error instanceof Error ? error.message : "로그인 실패";
        form.setError("root", { message });
      },
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* 이메일 */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>이메일</FormLabel>
              <FormControl>
                <Input placeholder="test@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 비밀번호 */}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>비밀번호</FormLabel>
              <FormControl>
                <Input type="password" placeholder="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 서버 에러 메시지 (로그인 실패 등) */}
        {form.formState.errors.root && (
          <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive font-medium">
            {form.formState.errors.root.message}
          </div>
        )}

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "로그인 중..." : "로그인"}
        </Button>
      </form>
    </Form>
  );
}
