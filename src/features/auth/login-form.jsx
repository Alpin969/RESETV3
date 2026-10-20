"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import AuthShell from "./auth-shell";
import AuthMessage from "./auth-message";
import PasswordField from "./password-field";
import AuthSubmitButton from "./auth-submit-button";
import { createClient } from "@/lib/supabase/client";
import { friendlyError } from "@/lib/utils/errors";
import { validateEmail } from "@/lib/utils/validators";

function safeNext(value) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
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
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState(
    authError
      ? friendlyError(
          { message: authError },
          "Link tidak dapat digunakan. Silakan minta link baru."
        )
      : null
  );
  const [submitting, setSubmitting] = useState(false);

  function validate() {
    const nextErrors = {};
    const emailError = validateEmail(email);
    if (emailError) {
      nextErrors.email = emailError;
    }
    if (!password) {
      nextErrors.password = "Password wajib diisi.";
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
      router.replace(next);
      router.refresh();
    } catch (error) {
      setMessage(friendlyError(error));
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      title="Masuk ke RESET"
      subtitle="Lanjutkan kebiasaan baikmu hari ini."
      backHref="/welcome"
      footer={
        <span>
          Belum punya akun?{" "}
          <Link href="/register" className="font-semibold text-reset-primary">
            Register
          </Link>
        </span>
      }
    >
      {justReset ? (
        <AuthMessage
          type="success"
          message="Password berhasil diubah. Silakan login kembali."
        />
      ) : null}
      <AuthMessage message={message} />

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <label htmlFor="login-email" className="field-label">
            Email
          </label>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="nama@email.com"
            autoComplete="email"
            inputMode="email"
            disabled={submitting}
            aria-invalid={errors.email ? "true" : undefined}
            className="field"
          />
          {errors.email ? (
            <p className="mt-1.5 text-[12px] text-reset-danger">
              {errors.email}
            </p>
          ) : null}
        </div>

        <PasswordField
          id="login-password"
          label="Password"
          value={password}
          onChange={setPassword}
          error={errors.password}
          autoComplete="current-password"
          disabled={submitting}
        />

        <div className="-mt-1 flex justify-end">
          <Link
            href="/forgot-password"
            className="text-[12.5px] font-semibold text-reset-primary hover:underline"
          >
            Forgot Password?
          </Link>
        </div>

        <AuthSubmitButton
          label="Login"
          loadingLabel="Masuk..."
          loading={submitting}
        />
      </form>
    </AuthShell>
  );
}