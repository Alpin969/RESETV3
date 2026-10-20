"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export default function PageHeader({
  title,
  subtitle,
  backHref = "/home",
  action,
  className,
}) {
  return (
    <div className={cn("mb-6 flex items-start gap-3", className)}>
      <Link
        href={backHref}
        aria-label="Kembali"
        className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-reset-border bg-white text-reset-dark transition hover:bg-reset-soft"
      >
        <ArrowLeft size={19} />
      </Link>
      <div className="min-w-0 flex-1 pt-0.5">
        <h1 className="text-[24px] font-bold leading-tight tracking-[-0.5px] text-reset-dark tablet:text-[28px]">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-1 text-[13.5px] leading-5 text-reset-muted">
            {subtitle}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0 pt-0.5">{action}</div> : null}
    </div>
  );
}