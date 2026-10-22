"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";
import AuthShell from "./auth-shell";
import AuthMessage from "./auth-message";
import AuthSubmitButton from "./auth-submit-button";
import { AuthInput } from "./auth-fields";
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
        title="Check your inbox"
        subtitle="We've sent a password reset link if that email is registered."
        panelVariant="forgot"
        footer={
          <Link href="/login" className="font-bold text-reset-primary hover:underline">
            Back to login
          </Link>
        }
      >
        <AuthMessage
          type="success"
          message="Open the email and tap the reset password link. For security, the link can only be used once and expires."
        />
        <Link href="/login" className="btn-primary btn-lg w-full">
          Back to Login
        </Link>
        <p className="mt-4 text-center text-[12.5px] leading-5 text-reset-muted">
          Didn&apos;t receive the email? Check your spam folder or{" "}
          <button
            type="button"
            onClick={() => setSent(false)}
            className="font-semibold text-reset-primary hover:underline"
          >
            try again
          </button>
          .
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Forgot your password?"
      subtitle="Enter your email and we'll send you a reset link."
      panelVariant="forgot"
      footer={
        <Link href="/login" className="font-bold text-reset-primary hover:underline">
          Back to login
        </Link>
      }
    >
      <AuthMessage message={error} />
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <AuthInput
          id="forgot-email"
          label="Email address"
          type="email"
          icon={Mail}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email address"
          autoComplete="email"
          inputMode="email"
          disabled={submitting}
          error={fieldError}
        />
        <AuthSubmitButton
          label="Send reset link"
          loadingLabel="Sending..."
          loading={submitting}
        />
      </form>
    </AuthShell>
  );
}
