"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export default function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
}) {
  useEffect(() => {
    if (!open) {
      return undefined;
    }
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event) {
      if (event.key === "Escape") {
        onClose?.();
      }
    }
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  const widths = {
    sm: "tablet:max-w-sm",
    md: "tablet:max-w-md",
    lg: "tablet:max-w-lg",
    xl: "tablet:max-w-2xl",
  };

  return (
    <div
      className="fixed inset-0 z-[150] flex items-end justify-center bg-[#10271D]/45 px-0 backdrop-blur-[2px] animate-fade tablet:items-center tablet:px-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose?.();
        }
      }}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-[24px] bg-white shadow-2xl animate-sheet-up tablet:rounded-[22px] tablet:animate-fade-up",
          widths[size] || widths.md
        )}
      >
        <div className="flex items-start gap-3 border-b border-reset-border px-5 py-4">
          <div className="min-w-0 flex-1">
            <h2 className="text-[18px] font-bold leading-tight text-reset-dark">
              {title}
            </h2>
            {description ? (
              <p className="mt-1 text-[13px] leading-5 text-reset-muted">
                {description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-reset-muted transition hover:bg-reset-bg hover:text-reset-dark"
          >
            <X size={18} />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer ? (
          <div className="border-t border-reset-border bg-[#FBFDFB] px-5 py-3.5">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}