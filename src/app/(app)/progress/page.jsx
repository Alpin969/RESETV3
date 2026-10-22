"use client";

import { useRouter } from "next/navigation";
import { Trophy, TrendingUp, MoonStar, PiggyBank } from "lucide-react";
import PageContainer from "@/components/ui/page-container";
import Skeleton from "@/components/ui/skeleton";
import EmptyState from "@/components/ui/empty-state";
import WeeklyChart, { MiniStat, formatMinutesId } from "@/features/progress/weekly-chart";
import { useProgressData } from "@/features/progress/use-progress-data";
import { formatRupiah } from "@/lib/utils/currency";

export default function ProgressPage() {
  const router = useRouter();
  const data = useProgressData();

  if (data.status === "loading") {
    return (
      <PageContainer>
        <Skeleton className="h-10 w-48 rounded-xl" />
        <Skeleton className="mt-6 h-96 rounded-[var(--radius-card)]" />
      </PageContainer>
    );
  }

  if (data.status === "failure") {
    return (
      <PageContainer>
        <EmptyState icon={Trophy} title="Failed to load statistics"
          description={data.error || "Check connection and try again."}
          action={<button type="button" onClick={data.reload} className="btn-primary btn-sm">Try again</button>} />
      </PageContainer>
    );
  }

  const pct = Math.round(data.completionRate * 100);

  return (
    <PageContainer className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">Progress</h1>
          <p className="mt-1 body-md text-reset-muted">See how far you&apos;ve come.</p>
        </div>
      </div>

      <div className="card p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-reset-primary-light text-reset-primary">
            <Trophy size={24} />
          </div>
          <div className="flex-1">
            <h2 className="heading-3">Completion Rate</h2>
            <p className="body-sm text-reset-muted">Last 30 days</p>
          </div>
          <span className="text-[32px] font-extrabold text-reset-primary">{pct}%</span>
        </div>
        <div className="mt-4 h-3 overflow-hidden rounded-full bg-reset-border">
          <div className="h-full rounded-full bg-reset-primary transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
        <div className="mt-6 grid grid-cols-3 gap-4">
          <MiniStat label="Active Days" value={`${data.trackedDays}`} />
          <MiniStat label="Success Days" value={`${data.successDays}`} />
          <MiniStat label="Streak" value={`${data.streak.currentStreak} days`} />
        </div>
      </div>

      <div className="card p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="heading-3">Weekly Activity</h2>
        </div>
        <WeeklyChart weekly={data.weekly} />
      </div>

      <div className="grid gap-4 desktop:grid-cols-2 mb-6">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="heading-3" style={{ color: '#2f8a60', fontSize: '10px', fontWeight: 700 }}>{'Sleep Statistics'}</h2>
            <button type="button" onClick={() => router.push("/sleep")} className="btn-ghost btn-sm">Manage</button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <MiniStat label="Average" value={formatMinutesId(data.sleep.averageMinutes)} />
            <MiniStat label="Longest" value={formatMinutesId(data.sleep.bestMinutes)} />
            <MiniStat label="Shortest" value={formatMinutesId(data.sleep.worstMinutes)} />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="heading-3">Savings Statistics</h2>
            <button type="button" onClick={() => router.push("/savings")} className="btn-ghost btn-sm">Manage</button>
          </div>
          <p className="text-[28px] font-extrabold tracking-tight text-reset-dark">{formatRupiah(data.savings.balance, { withDecimals: true })}</p>
          <p className="mt-1 body-sm text-reset-muted">Current Balance</p>
          <div className="mt-4 grid grid-cols-3 gap-3">
            <MiniStat label="Deposits" value={formatRupiah(data.savings.totalDeposits)} />
            <MiniStat label="Withdrawals" value={formatRupiah(data.savings.totalWithdrawals)} />
            <MiniStat label="Transactions" value={`${data.savings.transactionCount}`} />
          </div>
        </div>
      </div>
    </PageContainer>
  );
}