"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthShell from "./auth-shell";
import AuthMessage from "./auth-message";
import PasswordField from "./password-field";
import AuthSubmitButton from "./auth-submit-button";
import Spinner from "@/components/ui/spinner";
import { createClient } from "@/lib/supabase/client";
import { friendlyError } from "@/lib/utils/errors";
import {
  validateConfirmPassword,
  validatePassword,
} from "@/lib/utils/validators";

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
      <div className="flex min-h-dvh items-center justify-center bg-reset-bg">
        <Spinner size={26} className="text-reset-primary" />
      </div>
    );
  }

  if (status === "invalid") {
    return (
      <AuthShell
        title="Link tidak valid"
        subtitle="Link reset password sudah kedaluwarsa atau tidak dapat digunakan."
        backHref="/login"
      >
        <AuthMessage message="Minta link baru, lalu buka link tersebut di browser yang sama dengan tempat kamu meminta reset." />
        <Link href="/forgot-password" className="btn-primary w-full">
          Minta link baru
        </Link>
        <Link href="/login" className="btn-outline mt-3 w-full">
          Kembali
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Password Baru"
      subtitle="Buat password baru untuk akunmu."
      backHref="/login"
    >
      <AuthMessage message={message} />
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <PasswordField
          id="reset-password"
          label="Password Baru"
          value={password}
          onChange={setPassword}
          error={errors.password}
          autoComplete="new-password"
          placeholder="Minimal 8 karakter"
          disabled={submitting}
        />
        <PasswordField
          id="reset-confirm"
          label="Konfirmasi Password Baru"
          value={confirmPassword}
          onChange={setConfirmPassword}
          error={errors.confirmPassword}
          autoComplete="new-password"
          placeholder="Ulangi password baru"
          disabled={submitting}
        />
        <AuthSubmitButton
          label="Simpan password baru"
          loadingLabel="Menyimpan..."
          loading={submitting}
        />
      </form>
    </AuthShell>
  );
}