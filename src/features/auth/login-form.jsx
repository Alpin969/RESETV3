"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail } from "lucide-react";
import AuthShell from "./auth-shell";
import AuthMessage from "./auth-message";
import AuthSubmitButton from "./auth-submit-button";
import { AuthDivider, AuthInput, AuthPasswordInput, GoogleButton } from "./auth-fields";
import { createClient } from "@/lib/supabase/client";
import { friendlyError } from "@/lib/utils/errors";
import { validateEmail } from "@/lib/utils/validators";

const REMEMBER_KEY = "reset:remembered-email";

function safeNext(value) {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) {
    return "/home";
  }
  return value;
}

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeNext(searchParams.get("next"));
  const authError = searchParams.get("auth_error");
  const justReset = searchParams.get("reset") === "1";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState(
    authError
      ? friendlyError(
          { message: authError },
          "This link can't be used. Please request a new one."
        )
      : null
  );
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const saved = window.localStorage.getItem(REMEMBER_KEY);
        if (saved) {
          setEmail(saved);
          setRemember(true);
        }
      } catch {
        // ignore unavailable storage
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  function validate() {
    const nextErrors = {};
    const emailError = validateEmail(email);
    if (emailError) {
      nextErrors.email = emailError;
    }
    if (!password) {
      nextErrors.password = "Password is required.";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage(null);
    if (!validate()) {
      return;
    }

    setSubmitting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) {
        throw error;
      }
      try {
        if (remember) window.localStorage.setItem(REMEMBER_KEY, email.trim());
        else window.localStorage.removeItem(REMEMBER_KEY);
      } catch {
        // ignore unavailable storage
      }
      router.replace(next);
      router.refresh();
    } catch (error) {
      setMessage(friendlyError(error));
      setSubmitting(false);
    }
  }

  async function handleGoogle() {
    setMessage(null);
    setGoogleLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });
      if (error) {
        throw error;
      }
    } catch (error) {
      setMessage(friendlyError(error));
      setGoogleLoading(false);
    }
  }

  return (
    <AuthShell
      title="Welcome back!"
      subtitle="Login to your account to continue"
      panelVariant="login"
      footer={
        <span>
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-bold text-reset-primary hover:underline">
            Register
          </Link>
        </span>
      }
    >
      {justReset ? (
        <AuthMessage
          type="success"
          message="Password successfully changed. Please sign in again."
        />
      ) : null}
      <AuthMessage message={message} />

      <form onSubmit={handleSubmit} noValidate className="space-y-3.5">
        <AuthInput
          id="login-email"
          label="Email address"
          type="email"
          icon={Mail}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email address"
          autoComplete="email"
          inputMode="email"
          disabled={submitting || googleLoading}
          error={errors.email}
        />

        <AuthPasswordInput
          id="login-password"
          label="Password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Password"
          autoComplete="current-password"
          disabled={submitting || googleLoading}
          error={errors.password}
        />

        <div className="flex items-center justify-between pt-0.5">
          <label className="flex cursor-pointer select-none items-center gap-2">
            <input
              type="checkbox"
              checked={remember}
              onChange={(event) => setRemember(event.target.checked)}
              className="h-[15px] w-[15px] cursor-pointer rounded-[4px] border-[#cbd9cf] accent-[#2f8a60]"
            />
            <span className="text-[12.5px] font-medium text-[#6f8376]">Remember me</span>
          </label>
          <Link
            href="/forgot-password"
            className="text-[12.5px] font-semibold text-reset-primary hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <AuthSubmitButton
          label="Login"
          loadingLabel="Signing in..."
          loading={submitting}
          disabled={googleLoading}
        />

        <AuthDivider />

        <GoogleButton onClick={handleGoogle} loading={googleLoading} disabled={submitting} />
      </form>
    </AuthShell>
  );
}
