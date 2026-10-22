"use client";

import { useState } from "react";
import { Check, MoreVertical, Pencil, Archive, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { formatTime } from "@/lib/utils/format";

export default function TaskTile({ item, isBusy, onToggle, onEdit, onArchive }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="flex items-center gap-2.5 py-2">
      <button
        type="button"
        onClick={onToggle}
        disabled={isBusy}
        aria-label={item.isCompleted ? "Mark as not done" : "Mark as done"}
        className={cn(
          "flex h-[19px] w-[19px] shrink-0 items-center justify-center rounded-full border-[1.5px] transition",
          item.isCompleted
            ? "border-reset-primary bg-reset-primary text-white"
            : "border-[#c4d2c7] bg-white hover:border-reset-primary"
        )}
      >
        {isBusy ? <Loader2 size={11} className="animate-spin" /> : item.isCompleted ? <Check size={11} strokeWidth={3.2} /> : null}
      </button>
      <div className="min-w-0 flex-1">
        <p className={cn("truncate text-[12.5px] font-semibold text-reset-dark", item.isCompleted && "text-[#93a497] line-through")}>
          {item.task.title}
        </p>
        {item.task.notes ? <p className="mt-0.5 truncate text-[10px] text-reset-muted">{item.task.notes}</p> : null}
      </div>
      <span className="shrink-0 text-[9.5px] font-medium text-[#a1b0a4]">
        {item.isCompleted && item.completedAt ? formatTime(item.completedAt) : "Daily"}
      </span>
      <div className="relative shrink-0">
        <button
          type="button"
          aria-label="Task actions"
          onClick={() => setMenuOpen((v) => !v)}
          className="flex h-7 w-7 items-center justify-center rounded-full text-[#a6b4a9] transition hover:bg-reset-bg hover:text-reset-dark"
        >
          <MoreVertical size={15} />
        </button>
        {menuOpen ? (
          <>
            <button type="button" aria-label="Close menu" className="fixed inset-0 z-10 cursor-default" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-0 top-8 z-20 w-36 overflow-hidden rounded-xl border border-reset-border bg-white py-1 shadow-xl animate-fade">
              <button
                type="button"
                onClick={() => { setMenuOpen(false); onEdit(); }}
                className="flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-[12.5px] font-medium text-reset-dark hover:bg-reset-bg"
              >
                <Pencil size={14} /> Edit
              </button>
              <button
                type="button"
                onClick={() => { setMenuOpen(false); onArchive(); }}
                className="flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-[12.5px] font-medium text-reset-dark hover:bg-reset-bg"
              >
                <Archive size={14} /> Archive
              </button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
