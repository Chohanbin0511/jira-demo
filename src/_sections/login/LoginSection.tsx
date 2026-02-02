import { LoginForm } from "@/_features/login/components/LoginForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/_features/common/components/ui/card";
import { Button } from "@/_features/common/components/ui/button";

export function LoginSection() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight">
            로그인
          </CardTitle>
        </CardHeader>

        <CardContent>
          {/* Client Component 주입 */}
          <LoginForm />
        </CardContent>

        <CardFooter className="flex flex-col space-y-2">
          <div className="relative w-full">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                계정이 없으신가요?
              </span>
            </div>
          </div>
          <Button variant="outline" className="w-full" asChild>
            회원가입 하러가기
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
