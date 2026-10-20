"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthShell from "./auth-shell";
import AuthMessage from "./auth-message";
import PasswordField from "./password-field";
import AuthSubmitButton from "./auth-submit-button";
import { createClient } from "@/lib/supabase/client";
import { friendlyError } from "@/lib/utils/errors";
import {
  validateConfirmPassword,
  validateEmail,
  validatePassword,
  validateUsername,
} from "@/lib/utils/validators";
import { deviceTimezone } from "@/lib/utils/timezones";

export default function RegisterForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  function validate() {
    const nextErrors = {};
    const usernameError = validateUsername(username);
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    const confirmError = validateConfirmPassword(confirmPassword, password);
    if (usernameError) nextErrors.username = usernameError;
    if (emailError) nextErrors.email = emailError;
    if (passwordError) nextErrors.password = passwordError;
    if (confirmError) nextErrors.confirmPassword = confirmError;
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
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            username: username.trim(),
            timezone: deviceTimezone(),
          },
        },
      });
      if (error) {
        throw error;
      }
      if (!data.user || !data.session) {
        setNeedsConfirmation(true);
        setSubmitting(false);
        return;
      }
      router.replace("/home");
      router.refresh();
    } catch (error) {
      setMessage(friendlyError(error));
      setSubmitting(false);
    }
  }

  if (needsConfirmation) {
    return (
      <AuthShell
        title="Akun dibuat"
        subtitle="Satu langkah lagi sebelum kamu mulai."
        backHref="/login"
      >
        <AuthMessage
          type="success"
          message="Akun berhasil dibuat, tetapi sesi login belum aktif. Periksa emailmu untuk konfirmasi, lalu masuk lewat halaman Login."
        />
        <Link href="/login" className="btn-primary w-full">
          Ke halaman Login
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Buat akun RESET"
      subtitle="Isi data di bawah untuk mulai membangun kebiasaan baik."
      backHref="/welcome"
      footer={
        <span>
          Sudah punya akun?{" "}
          <Link href="/login" className="font-semibold text-reset-primary">
            Login
          </Link>
        </span>
      }
    >
      <AuthMessage message={message} />

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <label htmlFor="register-username" className="field-label">
            Username
          </label>
          <input
            id="register-username"
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="mis. alvin_25"
            autoComplete="username"
            disabled={submitting}
            aria-invalid={errors.username ? "true" : undefined}
            className="field"
          />
          {errors.username ? (
            <p className="mt-1.5 text-[12px] text-reset-danger">
              {errors.username}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="register-email" className="field-label">
            Email
          </label>
          <input
            id="register-email"
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
          id="register-password"
          label="Password"
          value={password}
          onChange={setPassword}
          error={errors.password}
          autoComplete="new-password"
          placeholder="Minimal 8 karakter"
          disabled={submitting}
        />

        <PasswordField
          id="register-confirm"
          label="Konfirmasi Password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          error={errors.confirmPassword}
          autoComplete="new-password"
          placeholder="Ulangi password"
          disabled={submitting}
        />

        <AuthSubmitButton
          label="Register"
          loadingLabel="Membuat akun..."
          loading={submitting}
        />
      </form>

      <p className="mt-4 text-center text-[11.5px] leading-5 text-reset-muted">
        Dengan mendaftar, kamu setuju menggunakan RESET untuk membangun
        kebiasaan baik secara konsisten.
      </p>
    </AuthShell>
  );
}