"use client";

import Link from "next/link";
import { Bell, CalendarDays, Sparkles } from "lucide-react";
import { useAuth } from "@/features/auth/auth-provider";
import { LeafMark } from "@/components/brand/logo";
import { fullDate, titleCase } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

function greetingForHour(hour) {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function DashboardHeader({ date, focusMode = false, onFocusMode }) {
  const { profile, user } = useAuth();
  const raw = String(profile?.username || user?.email?.split("@")[0] || "").trim();
  const display = titleCase(raw);
  const greet = greetingForHour(new Date().getHours());
  const dateLabel = fullDate(date);

  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0 flex-1">
        <h1 className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[23px] font-extrabold leading-tight tracking-[-0.7px] text-reset-dark tablet:text-[26px] desktop:text-[27px]">
          <span>
            {greet}
            {display ? `, ${display}!` : "!"}
          </span>
          <span className="inline-flex translate-y-[1px]">
            <LeafMark size={20} id="greeting-leaf" />
          </span>
        </h1>
        <p className="mt-1.5 max-w-[430px] text-[12.5px] leading-[1.55] text-[#7d8f82] desktop:text-[13px]">
          Keep your focus, build better habits, and make today count.
        </p>
        <p className="mt-2.5 flex items-center gap-1.5 text-[11.5px] font-medium text-[#8b9c90]">
          <CalendarDays size={13} strokeWidth={1.9} />
          {dateLabel}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2 pt-1">
        <Link
          href="/reminders"
          aria-label="Reminders"
          className="hidden h-9 w-9 items-center justify-center rounded-full border border-reset-border bg-white text-[#5f7467] shadow-[0_1px_2px_rgba(29,58,42,0.03)] transition hover:border-[#cfe2d5] hover:text-reset-primary tablet:flex"
        >
          <Bell size={17} strokeWidth={1.9} />
        </Link>
        <button
          type="button"
          onClick={onFocusMode}
          aria-pressed={focusMode}
          aria-label="Toggle Focus Mode"
          title="Focus Mode"
          className={cn(
            "flex h-9 w-9 items-center justify-center gap-1.5 rounded-full border text-[12px] font-semibold transition tablet:w-auto tablet:px-3.5",
            focusMode
              ? "border-reset-primary bg-reset-primary text-white shadow-[0_6px_16px_rgba(47,138,96,0.2)]"
              : "border-reset-border bg-white text-[#4f6457] shadow-[0_1px_2px_rgba(29,58,42,0.03)] hover:border-[#cfe2d5] hover:text-reset-primary"
          )}
        >
          <Sparkles size={15} strokeWidth={1.9} />
          <span className="hidden tablet:inline">Focus Mode</span>
        </button>
      </div>
    </div>
  );
}
