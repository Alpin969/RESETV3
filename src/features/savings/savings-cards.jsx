"use client";

import { formatRupiah } from "@/lib/utils/currency";

export function SavingsBalanceCard({ balance, onDeposit, onWithdraw }) {
  return (
    <div className="card p-5 tablet:p-6">
      <p className="text-[13px] font-semibold text-reset-muted">Saldo saat ini</p>
      <p className="mt-1 text-[30px] font-extrabold tracking-tight text-reset-dark">{formatRupiah(balance, { withDecimals: true })}</p>
      <div className="mt-4 grid grid-cols-2 gap-2.5">
        <button type="button" onClick={onDeposit} className="btn-primary">+ Menabung</button>
        <button type="button" onClick={onWithdraw} className="btn-outline">- Penarikan</button>
      </div>
    </div>
  );
}

export function SavingsMonthSummary({ monthIn, monthOut }) {
  return (
    <div className="flex items-center justify-between text-[13.5px]">
      <span className="font-semibold text-reset-primary">Masuk {formatRupiah(monthIn)}</span>
      <span className="font-semibold text-reset-danger">Keluar {formatRupiah(monthOut)}</span>
    </div>
  );
}
