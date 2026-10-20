import { Suspense } from "react";
import LoginForm from "@/features/auth/login-form";

export const metadata = {
  title: "Masuk",
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-reset-bg" />}>
      <LoginForm />
    </Suspense>
  );
}