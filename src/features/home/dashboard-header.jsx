"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { Leaf } from "lucide-react";
import { useAuth } from "@/features/auth/auth-provider";
import Avatar from "@/components/ui/avatar";
import { titleCase } from "@/lib/utils/format";

const EN_MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const EN_DAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

function greetingForHour(hour) {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function DashboardHeader({ date, compact }) {
  const { profile, user } = useAuth();
  const raw = String(profile?.username || user?.email?.split("@")[0] || "").trim();
  const display = titleCase(raw);
  const greet = greetingForHour(new Date().getHours());
  const dateLabel = `${EN_DAYS[date.getDay()]}, ${date.getDate()} ${EN_MONTHS[date.getMonth()]} ${date.getFullYear()}`;

  const actions = (
    <div className="flex shrink-0 items-center gap-2.5">
      <Link href="/reminders" aria-label="Reminder"
        className="flex h-11 w-11 items-center justify-center rounded-full border border-reset-border bg-white text-reset-dark transition hover:bg-reset-soft">
        <Bell size={20} />
      </Link>
      <Link href="/settings" aria-label="Settings">
        <Avatar username={raw} avatarUrl={profile?.avatar_url} size={compact ? 40 : 44} />
      </Link>
    </div>
  );

  const greetingBlock = (
    <div className="min-w-0">
      <h1 className="text-[26px] font-bold leading-tight tracking-[-0.7px] text-reset-dark tablet:text-[31px]">
        {display ? `${greet}, ${display} 👋` : `${greet} 👋`}
      </h1>
      <p className="mt-1.5 text-[14px] text-reset-muted">{dateLabel}</p>
      <p className="mt-0.5 text-[13px] text-reset-muted">Small steps, better days.</p>
    </div>
  );

  if (compact) {
    return (
      <div>
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-reset-primary text-white">
            <Leaf size={15} strokeWidth={2.2} />
          </span>
          <span className="text-[16px] font-extrabold tracking-[-0.4px] text-reset-dark">RESET.</span>
          <div className="flex-1" />
          {actions}
        </div>
        <div className="mt-5">{greetingBlock}</div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-4">
      <div className="min-w-0 flex-1">{greetingBlock}</div>
      <div className="pt-0.5">{actions}</div>
    </div>
  );
}
