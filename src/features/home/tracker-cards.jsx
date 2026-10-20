"use client";

import { useRouter } from "next/navigation";
import { BedDouble, ChevronRight, PiggyBank } from "lucide-react";
import { formatRupiah } from "@/lib/utils/currency";

function Shell({ icon: Icon, title, value, subtitle, footnote, onTap }) {
  return (
    <button type="button" onClick={onTap}
      className="rounded-[18px] border border-reset-border bg-white p-4 text-left transition hover:border-reset-primary/40 hover:shadow-sm active:scale-[0.99] tablet:p-5">
      <div className="flex items-center gap-2.5">
        <span className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-reset-soft text-reset-primary">
          <Icon size={17} />
        </span>
        <span className="min-w-0 flex-1 truncate text-[14px] font-bold text-reset-dark">{title}</span>
        <ChevronRight size={19} className="shrink-0 text-reset-muted" />
      </div>
      <p className="mt-3 truncate text-[22px] font-bold tracking-tight text-reset-dark">{value}</p>
      <p className="mt-1 line-clamp-2 min-h-9 text-[12.5px] leading-4.5 text-reset-muted">{subtitle}</p>
      {footnote ? <p className="mt-2.5 text-[12px] font-semibold text-reset-primary">{footnote}</p> : null}
    </button>
  );
}

function pad(n) { return String(n).padStart(2, "0"); }
function formatDurationEn(minutes) {
  const total = Math.max(0, Math.round(minutes || 0));
  if (total <= 0) return "0m";
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function SleepTrackerCard({ log, averageMinutes, isLoading, onTap }) {
  const router = useRouter();
  const go = onTap || (() => router.push("/sleep"));
  let value = "—";
  let subtitle = "No sleep logged yet.";
  if (isLoading) { value = "..."; subtitle = "Memuat catatan tidur..."; }
  else if (log) {
    value = formatDurationEn(log.durationMinutes);
    subtitle = `Bedtime ${pad(log.bedTime.getHours())}:${pad(log.bedTime.getMinutes())} • Wake ${pad(log.wakeTime.getHours())}:${pad(log.wakeTime.getMinutes())}`;
  }
  const footnote = log && averageMinutes > 0 ? `7-day average ${formatDurationEn(averageMinutes)}` : null;
  return <Shell icon={BedDouble} title="Sleep Tracker" value={value} subtitle={subtitle} footnote={footnote} onTap={go} />;
}

function compactRupiah(value) {
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) return `Rp ${(value / 1_000_000_000).toFixed(1).replace(".0", "")} M`;
  if (abs >= 1_000_000) return `Rp ${(value / 1_000_000).toFixed(1).replace(".0", "")} jt`;
  if (abs >= 1000) return `Rp ${(value / 1000).toFixed(1).replace(".0", "")} rb`;
  return formatRupiah(value);
}

export function SavingsTrackerCard({ summary, isLoading, onTap }) {
  const router = useRouter();
  const go = onTap || (() => router.push("/savings"));
  const hasData = summary && summary.transactionCount > 0;
  const value = isLoading ? "..." : formatRupiah(summary?.balance || 0);
  const subtitle = isLoading ? "Memuat tabungan..."
    : hasData ? `Total in ${compactRupiah(summary.totalDeposits)} • Out ${compactRupiah(summary.totalWithdrawals)}`
    : "No transactions yet.";
  return <Shell icon={PiggyBank} title="Savings Tracker" value={value} subtitle={subtitle} footnote={hasData ? "Keep building your safety net" : null} onTap={go} />;
}
