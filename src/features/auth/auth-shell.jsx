import Link from "next/link";
import { ArrowLeft, Leaf } from "lucide-react";

export default function AuthShell({
  title,
  subtitle,
  children,
  backHref,
  footer,
}) {
  return (
    <div className="relative min-h-dvh overflow-hidden bg-reset-bg">
      <div className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-reset-soft/70 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-[#EAF2ED] blur-3xl" />

      <div className="relative mx-auto flex min-h-dvh w-full max-w-[520px] flex-col px-5 py-5 tablet:px-6">
        <div className="flex h-11 items-center justify-between">
          {backHref ? (
            <Link
              href={backHref}
              aria-label="Kembali"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-reset-border bg-white/80 text-reset-dark transition hover:bg-white"
            >
              <ArrowLeft size={19} />
            </Link>
          ) : (
            <Link
              href="/welcome"
              className="flex items-center gap-2 text-reset-dark"
            >
              <Leaf size={23} className="text-reset-primary" />
              <span className="text-[18px] font-extrabold tracking-[-0.5px]">
                RESET.
              </span>
            </Link>
          )}
        </div>

        <main className="flex flex-1 flex-col justify-center py-8">
          <div className="animate-fade-up">
            <div className="mx-auto flex h-[76px] w-[76px] items-center justify-center rounded-full bg-white shadow-[0_10px_30px_rgba(35,132,91,0.13)]">
              <Leaf size={38} strokeWidth={1.6} className="text-reset-primary" />
            </div>
            <h1 className="mt-6 text-center text-[28px] font-bold leading-tight tracking-[-0.7px] text-reset-dark tablet:text-[31px]">
              {title}
            </h1>
            {subtitle ? (
              <p className="mx-auto mt-2 max-w-[360px] text-center text-[14px] leading-6 text-reset-muted">
                {subtitle}
              </p>
            ) : null}
            <div className="card mt-7 p-5 shadow-[0_12px_40px_rgba(25,61,45,0.05)] tablet:p-6">
              {children}
            </div>
            {footer ? (
              <div className="mt-5 text-center text-[12.5px] leading-5 text-reset-muted">
                {footer}
              </div>
            ) : null}
          </div>
        </main>
      </div>
    </div>
  );
}