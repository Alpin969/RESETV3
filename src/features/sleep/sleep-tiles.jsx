"use client";

import { useState } from "react";
import { MoreVertical } from "lucide-react";
import { shortDate } from "@/lib/utils/format";

function pad(n) { return String(n).padStart(2, "0"); }

export function formatSleepDuration(minutes) {
  const t = Math.max(0, Math.round(minutes || 0));
  const h = Math.floor(t / 60);
  const m = t % 60;
  if (h === 0) return `${m} menit`;
  if (m === 0) return `${h} jam`;
  return `${h} jam ${m} menit`;
}

export function MonthNav({ month, canNext, onPrev, onNext, ChevronLeft, ChevronRight, monthTitle }) {
  const btn = "flex h-9 w-9 items-center justify-center rounded-full border border-reset-border text-reset-dark hover:bg-reset-bg disabled:opacity-40";
  return (
    <div className="mb-4 flex items-center justify-between">
      <button type="button" aria-label="Bulan sebelumnya" onClick={onPrev} className={btn}><ChevronLeft size={18} /></button>
      <p className="text-[15px] font-bold text-reset-dark">{monthTitle(month)}</p>
      <button type="button" aria-label="Bulan berikutnya" disabled={!canNext} onClick={onNext} className={btn}><ChevronRight size={18} /></button>
    </div>
  );
}

export function SleepTile({ log, busy, onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="card p-4">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-bold text-reset-dark">{shortDate(log.sleepDate)}</p>
          <p className="mt-1 text-[13.5px] text-reset-muted">
            {pad(log.bedTime.getHours())}:{pad(log.bedTime.getMinutes())} - {pad(log.wakeTime.getHours())}:{pad(log.wakeTime.getMinutes())}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <span className="rounded-full bg-reset-soft px-2.5 py-1 text-[12px] font-bold text-reset-primary">{formatSleepDuration(log.durationMinutes)}</span>
            {log.quality ? <span className="text-[13px] text-reset-primary">{"★".repeat(log.quality)}{"☆".repeat(5 - log.quality)}</span> : null}
          </div>
          {log.notes ? <p className="mt-2 text-[13.5px] leading-5 text-reset-dark">{log.notes}</p> : null}
        </div>
        <div className="relative">
          <button type="button" aria-label="Aksi catatan" onClick={() => setOpen((v) => !v)} className="flex h-8 w-8 items-center justify-center rounded-full text-reset-muted hover:bg-reset-bg">
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
    </div>
  );
}
