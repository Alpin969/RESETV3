"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Logo, { LeafMark } from "@/components/brand/logo";
import { AuthIllustration } from "./auth-illustration";

const PANEL_TITLES = {
  login: "Small steps everyday lead to big changes.",
  register: "Better habits start with you.",
  forgot: "A small step today, a better tomorrow.",
  reset: "A fresh start begins with a new password.",
  welcome: "Your journey starts with one small step.",
};

export default function AuthShell({
  title,
  subtitle,
  children,
  backHref,
  footer,
  panelTitle,
  panelVariant = "login",
  className,
}) {
  const headline = panelTitle || PANEL_TITLES[panelVariant] || PANEL_TITLES.login;

  return (
    <div className={`min-h-dvh bg-[#f8fbf7] text-reset-dark desktop:flex desktop:bg-white ${className || ""}`}>
      <aside className="relative hidden overflow-hidden bg-[#eef6ef] desktop:flex desktop:w-1/2">
        <AuthIllustration />
        <div className="relative z-10 flex h-full w-full flex-col justify-between px-10 py-12 desktop:px-14 desktop:py-16">
          <div className="max-w-[290px]">
            <p className="text-[25px] font-medium leading-[1.45] tracking-[-0.4px] text-[#5b7162] desktop:text-[28px]">
              {headline}
            </p>
            <div className="mt-5 h-px w-12 bg-[#8fb29c]/60" />
          </div>

          <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7f9687]">
            <span>Reset · V3</span>
            <span className="flex items-center gap-1.5">
              <LeafMark size={13} id="panel-leaf" />
              Better habits
            </span>
          </div>
        </div>
      </aside>

      <main className="relative flex min-h-dvh w-full flex-col overflow-hidden bg-white desktop:w-1/2">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-56 overflow-hidden desktop:hidden">
          <div className="absolute -right-16 -top-20 h-52 w-52 rounded-full bg-[#e8f4eb] blur-2xl" />
          <div className="absolute -left-10 top-12 h-40 w-40 rounded-full bg-[#f1f8f1] blur-2xl" />
          <div className="absolute right-6 top-3 rotate-12 opacity-[0.09]">
            <LeafMark size={120} id="auth-mobile-leaf" />
          </div>
        </div>

        <div className="relative z-10 flex flex-1 flex-col px-5 pb-[max(28px,env(safe-area-inset-bottom))] pt-[max(26px,env(safe-area-inset-top))] tablet:px-10 desktop:px-12">
          <div className="flex min-h-8 items-center justify-between">
            {backHref ? (
              <Link
                href={backHref}
                aria-label="Back"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-reset-border bg-white/80 text-reset-dark shadow-sm backdrop-blur transition hover:border-reset-primary/40 hover:bg-white"
              >
                <ArrowLeft size={17} />
              </Link>
            ) : (
              <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9aab9e] desktop:hidden">
                <LeafMark size={15} id="mobile-top-leaf" />
                Better habits
              </span>
            )}

          </div>

          <div className="mx-auto flex w-full max-w-[392px] flex-1 flex-col justify-center py-7 tablet:py-10">
            <div className="mb-7 flex flex-col items-center text-center">
              <Logo size={29} textClassName="text-[20px] tracking-[0.16em]" id="auth-form-logo" />
              <h1 className="mt-8 text-[26px] font-extrabold leading-tight tracking-[-0.7px] text-reset-dark tablet:text-[29px]">
                {title}
              </h1>
              {subtitle ? (
                <p className="mt-2 max-w-[320px] text-[13.5px] leading-6 text-reset-muted">
                  {subtitle}
                </p>
              ) : null}
            </div>

            <div className="animate-fade-up">
              {children}
            </div>

            {footer ? (
              <div className="mt-6 text-center text-[13px] text-reset-muted">
                {footer}
              </div>
            ) : null}
          </div>

          <p className="mx-auto mt-2 flex items-center gap-2 text-[10.5px] font-medium text-[#a4b3a7]">
            <LeafMark size={12} id="auth-footer-leaf" />
            RESET keeps your progress private and secure.
          </p>
        </div>
      </main>
    </div>
  );
}
