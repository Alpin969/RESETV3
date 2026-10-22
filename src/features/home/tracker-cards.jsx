"use client";

import { useRouter } from "next/navigation";
import { BedDouble, ChevronRight, PiggyBank, MoonStar, TrendingUp } from "lucide-react";
import { formatRupiah } from "@/lib/utils/currency";

function CardShell({ icon: Icon, title, value, subtitle, footnote, onTap, children }) {
  const router = useRouter();
  const go = onTap || (() => router.push("/sleep"));
  
  return (
    <button type="button" onClick={go}
      className="card p-5 transition-all duration-200 hover:border-reset-primary/50 hover:shadow-soft group"
    >
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-reset-primary-light text-reset-primary group-hover:scale-105 transition-transform">
          <Icon size={20} />
        </span>
        <span className="min-w-0 flex-1 truncate heading-3">{title}</span>
        <ChevronRight size={18} className="shrink-0 text-reset-muted group-hover:text-reset-primary transition-colors" />
      </div>
      {children || (
        <>
          <p className="mt-4 truncate text-[28px] font-bold tracking-tight text-reset-dark">{value}</p>
          <p className="mt-1 line-clamp-2 min-h-10 body-sm text-reset-muted">{subtitle}</p>
          {footnote && <p className="mt-3 body-sm font-semibold text-reset-primary">{footnote}</p>}
        </>
      )}
    </button>
  );
}

function formatDuration(minutes) {
  const total = Math.max(0, Math.round(minutes || 0));
  if (total <= 0) return "—";
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function SleepTrackerCard({ log, averageMinutes, isLoading, onTap }) {
  let value = "—";
  let subtitle = "No sleep logged yet.";
  if (isLoading) { value = "..."; subtitle = "Loading sleep data..."; }
  else if (log) {
    value = formatDuration(log.durationMinutes);
    subtitle = `Bed ${String(log.bedTime.getHours()).padStart(2, "0")}:${String(log.bedTime.getMinutes()).padStart(2, "0")} • Wake ${String(log.wakeTime.getHours()).padStart(2, "0")}:${String(log.wakeTime.getMinutes()).padStart(2, "0")}`;
  }
  const footnote = log && averageMinutes > 0 ? `7-day avg ${formatDuration(averageMinutes)}` : null;
  
  return (
    <CardShell icon={BedDouble} title="Sleep Tracker" value={value} subtitle={subtitle} footnote={footnote} onTap={onTap} />
  );
}

function compactRupiah(value) {
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) return `Rp ${(value / 1_000_000_000).toFixed(1).replace(".0", "")} B`;
  if (abs >= 1_000_000) return `Rp ${(value / 1_000_000).toFixed(1).replace(".0", "")} M`;
  if (abs >= 1000) return `Rp ${(value / 1000).toFixed(1).replace(".0", "")} K`;
  return formatRupiah(value);
}

export function SavingsTrackerCard({ summary, isLoading, onTap }) {
  const hasData = summary && summary.transactionCount > 0;
  const value = isLoading ? "..." : formatRupiah(summary?.balance || 0);
  const subtitle = isLoading ? "Loading savings..."
    : hasData ? `In ${compactRupiah(summary.totalDeposits)} • Out ${compactRupiah(summary.totalWithdrawals)}`
    : "No transactions yet.";
  
  return (
    <CardShell icon={PiggyBank} title="Savings Tracker" value={value} subtitle={subtitle} footnote={hasData ? "Keep building your safety net" : null} onTap={onTap} />
  );
}