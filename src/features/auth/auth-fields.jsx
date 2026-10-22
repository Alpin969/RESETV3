"use client";

import { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import Spinner from "@/components/ui/spinner";

export function AuthInput({
  id,
  label,
  icon: Icon,
  error,
  right,
  className,
  ...props
}) {
  return (
    <div>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <div className="relative">
        {Icon ? <Icon size={17} strokeWidth={1.9} className="auth-input-icon" aria-hidden="true" /> : null}
        <input
          id={id}
          aria-label={label}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className={cn("field auth-input", right && "pr-12", error && "border-reset-danger/60 focus:border-reset-danger", className)}
          {...props}
        />
        {right ? <div className="absolute right-1.5 top-1/2 -translate-y-1/2">{right}</div> : null}
      </div>
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-[12px] font-medium text-reset-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function AuthPasswordInput({ id, label, error, autoComplete = "current-password", placeholder, disabled, value, onChange, icon = Lock }) {
  const [visible, setVisible] = useState(false);
  return (
    <AuthInput
      id={id}
      label={label}
      type={visible ? "text" : "password"}
      icon={icon}
      value={value}
      onChange={onChange}
      autoComplete={autoComplete}
      placeholder={placeholder}
      disabled={disabled}
      error={error}
      right={
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          disabled={disabled}
          aria-label={visible ? "Hide password" : "Show password"}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-reset-muted transition hover:bg-reset-primary-soft hover:text-reset-primary"
        >
          {visible ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      }
    />
  );
}

export function GoogleButton({ onClick, loading, disabled, label = "Continue with Google" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading || disabled}
      className="flex min-h-[46px] w-full items-center justify-center gap-2.5 rounded-[10px] border border-[#e1e9e2] bg-white px-4 text-[14px] font-semibold text-[#3b4d40] shadow-[0_1px_2px_rgba(29,58,42,0.03)] transition hover:border-[#c9dbcf] hover:bg-[#fafdf9] disabled:opacity-60"
    >
      {loading ? <Spinner size={17} /> : <GoogleIcon />}
      {loading ? "Connecting..." : label}
    </button>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5Z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7Z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.6-5.3l-6.3-5.3C29.2 35 26.7 36 24 36c-5.3 0-9.8-3.3-11.4-8l-6.5 5C9.5 39.6 16.2 44 24 44Z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.4l6.3 5.3C41.4 35.7 44 30.4 44 24c0-1.3-.1-2.3-.4-3.5Z" />
    </svg>
  );
}

export function AuthDivider({ label = "or continue with" }) {
  return (
    <div className="my-5 flex items-center gap-3">
      <span className="h-px flex-1 bg-[#edf2ed]" />
      <span className="text-[11.5px] font-medium text-[#9aab9e]">{label}</span>
      <span className="h-px flex-1 bg-[#edf2ed]" />
    </div>
  );
}
