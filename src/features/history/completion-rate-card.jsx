"use client";

import { Trophy } from "lucide-react";

export default function CompletionRateCard({ rate }) {
  const pct = Math.round(rate);
  return (
    <div className="card p-5 tablet:p-6">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-reset-soft text-reset-primary">
          <Trophy size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-[16px] font-bold text-reset-dark">Completion Rate</h2>
          <p className="text-[13px] text-reset-muted">Bulan ini</p>
        </div>
        <span className="text-[26px] font-extrabold text-reset-primary">{pct}%</span>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-reset-soft">
        <div className="h-full rounded-full bg-reset-primary transition-all" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-3 text-[13px] leading-5 text-reset-muted">
        Mulai dari 100%. Berkurang 3% untuk setiap hari tanpa penyelesaian dan 1% untuk setiap tugas yang terlewat.
      </p>
    </div>
  );
}
