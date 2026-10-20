"use client";

import { useState } from "react";
import { Check, MoreVertical, Pencil, Archive, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export default function TaskTile({ item, isBusy, onToggle, onEdit, onArchive }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="flex items-center gap-3 py-2.5">
      <button
        type="button"
        onClick={onToggle}
        disabled={isBusy}
        aria-label={item.isCompleted ? "Batalkan selesai" : "Tandai selesai"}
        className={cn(
          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition",
          item.isCompleted
            ? "border-reset-primary bg-reset-primary text-white"
            : "border-[#C4D2C7] bg-white hover:border-reset-primary"
        )}
      >
        {isBusy ? <Loader2 size={13} className="animate-spin" /> : item.isCompleted ? <Check size={14} strokeWidth={3} /> : null}
      </button>
      <div className="min-w-0 flex-1">
        <p className={cn("truncate text-[15px] font-medium text-reset-dark", item.isCompleted && "text-reset-muted line-through")}>
          {item.task.title}
        </p>
        {item.task.notes ? <p className="mt-0.5 truncate text-[13px] text-reset-muted">{item.task.notes}</p> : null}
      </div>
      <div className="relative shrink-0">
        <button type="button" aria-label="Aksi task" onClick={() => setMenuOpen((v) => !v)}
          className="flex h-8 w-8 items-center justify-center rounded-full text-reset-muted transition hover:bg-reset-bg hover:text-reset-dark">
          <MoreVertical size={17} />
        </button>
        {menuOpen ? (
          <>
            <button type="button" aria-label="Tutup menu" className="fixed inset-0 z-10 cursor-default" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-0 top-9 z-20 w-40 overflow-hidden rounded-xl border border-reset-border bg-white py-1 shadow-xl animate-fade">
              <button type="button" onClick={() => { setMenuOpen(false); onEdit(); }}
                className="flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-[13.5px] font-medium text-reset-dark hover:bg-reset-bg">
                <Pencil size={15} /> Ubah
              </button>
              <button type="button" onClick={() => { setMenuOpen(false); onArchive(); }}
                className="flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-[13.5px] font-medium text-reset-dark hover:bg-reset-bg">
                <Archive size={15} /> Arsipkan
              </button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
