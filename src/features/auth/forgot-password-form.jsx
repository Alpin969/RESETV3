"use client";

import { useState } from "react";
import Link from "next/link";
import AuthShell from "./auth-shell";
import AuthMessage from "./auth-message";
import AuthSubmitButton from "./auth-submit-button";
import { createClient } from "@/lib/supabase/client";
import { friendlyError } from "@/lib/utils/errors";
import { validateEmail } from "@/lib/utils/validators";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const [fieldError, setFieldError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    const emailError = validateEmail(email);
    setFieldError(emailError);
    if (emailError) {
      return;
    }

    setSubmitting(true);
    try {
      const supabase = createClient();
      const redirectTo = `${window.location.origin}/auth/callback?next=/reset-password`;
      const { error: resetError } =
        await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo });
      if (resetError) {
        throw resetError;
      }
      setSent(true);
    } catch (caught) {
      setError(friendlyError(caught));
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <AuthShell
        title="Periksa emailmu"
        subtitle="Link reset password sudah dikirim jika email tersebut terdaftar."
        backHref="/login"
      >
        <AuthMessage
          type="success"
          message="Buka email dan klik link reset password. Demi keamanan, link ini hanya dapat digunakan sekali dan memiliki masa berlaku."
        />
        <Link href="/login" className="btn-primary w-full">
          Kembali ke Login
        </Link>
        <p className="mt-4 text-center text-[12px] leading-5 text-reset-muted">
          Tidak menerima email? Periksa folder spam atau{" "}
          <button
            type="button"
            onClick={() => setSent(false)}
            className="font-semibold text-reset-primary hover:underline"
          >
            coba lagi
          </button>
          .
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Reset Password"
      subtitle="Masukkan email akunmu untuk menerima link reset password."
      backHref="/login"
    >
      <AuthMessage message={error} />
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <label htmlFor="forgot-email" className="field-label">
            Email
          </label>
          <input
            id="forgot-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="nama@email.com"
            autoComplete="email"
            inputMode="email"
            disabled={submitting}
            className="field"
          />
          {fieldError ? (
            <p className="mt-1.5 text-[12px] text-reset-danger">{fieldError}</p>
          ) : null}
        </div>
        <AuthSubmitButton
          label="Kirim link reset"
          loadingLabel="Mengirim..."
          loading={submitting}
        />
      </form>
      <p className="mt-4 text-center text-[12px] leading-5 text-reset-muted">
        Ingat passwordmu?{" "}
        <Link href="/login" className="font-semibold text-reset-primary">
          Login
        </Link>
      </p>
    </AuthShell>
  );
}