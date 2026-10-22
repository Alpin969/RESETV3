"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, User } from "lucide-react";
import AuthShell from "./auth-shell";
import AuthMessage from "./auth-message";
import AuthSubmitButton from "./auth-submit-button";
import { AuthDivider, AuthInput, AuthPasswordInput, GoogleButton } from "./auth-fields";
import { createClient } from "@/lib/supabase/client";
import { friendlyError } from "@/lib/utils/errors";
import { validateEmail, validatePassword, validateConfirmPassword, validateUsername } from "@/lib/utils/validators";
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
  const [googleLoading, setGoogleLoading] = useState(false);

  function validate() {
    const nextErrors = {};
    const usernameError = validateUsername(username);
    if (usernameError) nextErrors.username = usernameError;
    const emailError = validateEmail(email);
    if (emailError) nextErrors.email = emailError;
    const passwordError = validatePassword(password);
    if (passwordError) nextErrors.password = passwordError;
    const confirmError = validateConfirmPassword(confirmPassword, password);
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
        email: String(email || "").trim(),
        password,
        options: {
          data: {
            username: String(username || "").trim(),
            timezone: deviceTimezone(),
          },
        },
      });
      if (error) {
        throw error;
      }
      if (!data.user || !data.session) {
        const confirmation = new Error(
          "Account created, but the login session isn't active yet. Please sign in on the Login page."
        );
        confirmation.code = "confirmation_required";
        throw confirmation;
      }
      router.replace("/home");
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
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent("/home")}`,
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
      title="Create your account"
      subtitle="Start your journey to a better you"
      panelVariant="register"
      footer={
        <span>
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-reset-primary hover:underline">
            Login
          </Link>
        </span>
      }
    >
      <AuthMessage message={message} />

      <form onSubmit={handleSubmit} noValidate className="space-y-3.5">
        <AuthInput
          id="register-username"
          label="Username"
          type="text"
          icon={User}
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          placeholder="Username"
          autoComplete="username"
          inputMode="text"
          disabled={submitting || googleLoading}
          error={errors.username}
          maxLength={30}
        />

        <AuthInput
          id="register-email"
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
          id="register-password"
          label="Password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Password"
          autoComplete="new-password"
          disabled={submitting || googleLoading}
          error={errors.password}
        />

        <AuthPasswordInput
          id="register-confirm"
          label="Confirm password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          placeholder="Confirm password"
          autoComplete="new-password"
          disabled={submitting || googleLoading}
          error={errors.confirmPassword}
        />

        <AuthSubmitButton
          label="Register"
          loadingLabel="Creating account..."
          loading={submitting}
          disabled={googleLoading}
        />

        <AuthDivider />

        <GoogleButton onClick={handleGoogle} loading={googleLoading} disabled={submitting} />
      </form>
    </AuthShell>
  );
}
