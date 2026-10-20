"use client";

import { useState } from "react";
import { ArrowDownLeft, ArrowUpRight, MoreVertical } from "lucide-react";
import { formatRupiah } from "@/lib/utils/currency";
import { shortDate } from "@/lib/utils/format";

export function SavingsTile({ transaction, busy, onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  const isDeposit = transaction.kind === "deposit";
  return (
    <div className="card flex items-center gap-3.5 p-4">
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${isDeposit ? "bg-reset-soft text-reset-primary" : "bg-[#FBE9E7] text-reset-danger"}`}>
        {isDeposit ? <ArrowDownLeft size={19} /> : <ArrowUpRight size={19} />}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-bold text-reset-dark">{isDeposit ? "Menabung" : "Penarikan"}</p>
        <p className="text-[13px] text-reset-muted">{shortDate(transaction.occurredOn)}</p>
        {transaction.note ? <p className="mt-0.5 truncate text-[13px] text-reset-dark">{transaction.note}</p> : null}
      </div>
      <p className={`shrink-0 text-[15px] font-bold ${isDeposit ? "text-reset-primary" : "text-reset-danger"}`}>
        {isDeposit ? "+" : "-"}{formatRupiah(transaction.amount)}
      </p>
      <div className="relative shrink-0">
        <button type="button" aria-label="Aksi transaksi" onClick={() => setOpen((v) => !v)} className="flex h-8 w-8 items-center justify-center rounded-full text-reset-muted hover:bg-reset-bg">
          {busy ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-reset-primary border-t-transparent" /> : <MoreVertical size={17} />}
        </button>
        {open ? (
          <>
            <button type="button" aria-label="Tutup" className="fixed inset-0 z-10 cursor-default" onClick={() => setOpen(false)} />
            <div className="absolute right-0 top-9 z-20 w-36 overflow-hidden rounded-xl border border-reset-border bg-white py-1 shadow-xl">
              <button type="button" onClick={() => { setOpen(false); onEdit(); }} className="block w-full px-3.5 py-2.5 text-left text-[13.5px] hover:bg-reset-bg">Ubah</button>
              <button type="button" onClick={() => { setOpen(false); onDelete(); }} className="block w-full px-3.5 py-2.5 text-left text-[13.5px] text-reset-danger hover:bg-reset-bg">Hapus</button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
