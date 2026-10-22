"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthShell from "./auth-shell";
import AuthMessage from "./auth-message";
import AuthSubmitButton from "./auth-submit-button";
import { AuthPasswordInput } from "./auth-fields";
import Spinner from "@/components/ui/spinner";
import { createClient } from "@/lib/supabase/client";
import { friendlyError } from "@/lib/utils/errors";
import { validateConfirmPassword, validatePassword } from "@/lib/utils/validators";

export default function ResetPasswordForm() {
  const router = useRouter();
  const [status, setStatus] = useState("checking");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    const supabase = createClient();

    async function initialize() {
      try {
        const hash =
          typeof window !== "undefined" ? window.location.hash.slice(1) : "";
        if (hash) {
          const params = new URLSearchParams(hash);
          const accessToken = params.get("access_token");
          const refreshToken = params.get("refresh_token");
          if (accessToken && refreshToken) {
            const { error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            if (!error && typeof window !== "undefined") {
              window.history.replaceState(
                null,
                "",
                window.location.pathname + window.location.search
              );
            }
          }
        }

        const { data } = await supabase.auth.getSession();
        if (active) {
          setStatus(data.session ? "ready" : "invalid");
        }
      } catch {
        if (active) {
          setStatus("invalid");
        }
      }
    }

    initialize();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!active) {
          return;
        }
        if (event === "PASSWORD_RECOVERY" || session) {
          setStatus("ready");
        }
      }
    );

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage(null);

    const nextErrors = {};
    const passwordError = validatePassword(password);
    const confirmError = validateConfirmPassword(confirmPassword, password);
    if (passwordError) nextErrors.password = passwordError;
    if (confirmError) nextErrors.confirmPassword = confirmError;
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setSubmitting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        throw error;
      }
      await supabase.auth.signOut();
      router.replace("/login?reset=1");
      router.refresh();
    } catch (caught) {
      setMessage(friendlyError(caught));
      setSubmitting(false);
    }
  }

  if (status === "checking") {
    return (
      <AuthShell
        title="Securing your account"
        subtitle="Verifying your password reset link."
        panelVariant="reset"
      >
        <div className="flex flex-col items-center justify-center rounded-[14px] border border-reset-border bg-white px-6 py-8">
          <Spinner size={28} className="text-reset-primary" />
          <p className="mt-4 text-[13px] text-reset-muted">Verifying reset link...</p>
        </div>
      </AuthShell>
    );
  }

  if (status === "invalid") {
    return (
      <AuthShell
        title="Invalid link"
        subtitle="This password reset link has expired or can't be used."
        panelVariant="reset"
        footer={
          <Link href="/login" className="font-bold text-reset-primary hover:underline">
            Back to login
          </Link>
        }
      >
        <AuthMessage message="Request a new link, then open it in the same browser where you requested the reset." />
        <Link href="/forgot-password" className="btn-primary btn-lg w-full">
          Request New Link
        </Link>
        <Link href="/login" className="btn-outline btn-lg mt-3 w-full">
          Back to Login
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Set a new password"
      subtitle="Create a strong new password for your account."
      panelVariant="reset"
      footer={
        <Link href="/login" className="font-bold text-reset-primary hover:underline">
          Back to login
        </Link>
      }
    >
      <AuthMessage message={message} />
      <form onSubmit={handleSubmit} noValidate className="space-y-3.5">
        <AuthPasswordInput
          id="reset-password"
          label="New password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="new-password"
          placeholder="New password"
          disabled={submitting}
          error={errors.password}
        />
        <AuthPasswordInput
          id="reset-confirm"
          label="Confirm new password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          autoComplete="new-password"
          placeholder="Confirm new password"
          disabled={submitting}
          error={errors.confirmPassword}
        />
        <AuthSubmitButton
          label="Save New Password"
          loadingLabel="Saving..."
          loading={submitting}
        />
      </form>
    </AuthShell>
  );
}
