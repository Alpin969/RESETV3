"use client";

import { useRouter } from "next/navigation";
import { Trophy } from "lucide-react";
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
    return (<PageContainer><Skeleton className="h-9 w-48 rounded-xl" /><Skeleton className="mt-4 h-64 rounded-[20px]" /></PageContainer>);
  }
  if (data.status === "failure") {
    return (<PageContainer><EmptyState icon={Trophy} title="Gagal memuat statistik"
      description={data.error || "Periksa koneksi lalu coba lagi."}
      action={<button type="button" onClick={data.reload} className="btn-primary btn-sm">Coba lagi</button>} /></PageContainer>);
  }

  const pct = Math.round(data.completionRate * 100);

  return (
    <PageContainer className="max-w-3xl">
      <h1 className="page-title">Progress</h1>
      <p className="muted mt-1 text-[14px]">Lihat seberapa jauh kamu berkembang.</p>
      <div className="card mt-5 p-5 tablet:p-6">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-reset-soft text-reset-primary"><Trophy size={20} /></span>
          <div className="flex-1">
            <h2 className="text-[16px] font-bold text-reset-dark">Completion Rate</h2>
            <p className="text-[13px] text-reset-muted">30 hari terakhir</p>
          </div>
          <span className="text-[26px] font-extrabold text-reset-primary">{pct}%</span>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-reset-soft">
          <div className="h-full rounded-full bg-reset-primary" style={{ width: `${pct}%` }} />
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2.5">
          <MiniStat label="Hari aktif" value={`${data.trackedDays}`} />
          <MiniStat label="Hari sukses" value={`${data.successDays}`} />
          <MiniStat label="Streak" value={`${data.streak.currentStreak} hari`} />
        </div>
      </div>
      <div className="card mt-4 p-5 tablet:p-6">
        <h2 className="text-[16px] font-bold text-reset-dark">Aktivitas 7 hari</h2>
        <WeeklyChart weekly={data.weekly} />
      </div>
      <div className="card mt-4 p-5">
        <Row title="Statistik tidur" onOpen={() => router.push("/sleep")} />
        <div className="mt-3 grid grid-cols-3 gap-2.5">
          <MiniStat label="Rata-rata" value={formatMinutesId(data.sleep.averageMinutes)} />
          <MiniStat label="Terlama" value={formatMinutesId(data.sleep.bestMinutes)} />
          <MiniStat label="Terpendek" value={formatMinutesId(data.sleep.worstMinutes)} />
        </div>
      </div>
      <div className="card mt-4 p-5">
        <Row title="Statistik tabungan" onOpen={() => router.push("/savings")} />
        <p className="mt-2 text-[24px] font-extrabold tracking-tight text-reset-dark">{formatRupiah(data.savings.balance, { withDecimals: true })}</p>
        <p className="muted text-[13px]">Saldo saat ini</p>
        <div className="mt-3 grid grid-cols-3 gap-2.5">
          <MiniStat label="Masuk" value={formatRupiah(data.savings.totalDeposits)} />
          <MiniStat label="Keluar" value={formatRupiah(data.savings.totalWithdrawals)} />
          <MiniStat label="Transaksi" value={`${data.savings.transactionCount}`} />
        </div>
      </div>
    </PageContainer>
  );
}

function Row({ title, onOpen }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-[16px] font-bold text-reset-dark">{title}</h2>
      <button type="button" onClick={onOpen} className="text-[13px] font-bold text-reset-primary">Kelola</button>
    </div>
  );
}
