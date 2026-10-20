"use client";

import { useState } from "react";
import { BellRing, MoreVertical } from "lucide-react";
import Switch from "@/components/ui/switch";
import { reminderDaysLabel } from "@/features/reminders/reminders-api";

export default function ReminderTile({ reminder, onToggle, onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="card flex items-center gap-3 p-4">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-reset-soft text-reset-primary">
        <BellRing size={19} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-bold text-reset-dark">{reminder.title}</p>
        <p className="mt-0.5 text-[13px] text-reset-muted">{reminder.time} • {reminderDaysLabel(reminder.daysOfWeek)}</p>
        {reminder.body ? <p className="mt-0.5 truncate text-[13px] text-reset-dark">{reminder.body}</p> : null}
      </div>
      <Switch checked={reminder.isEnabled} onChange={onToggle} label={`Aktifkan ${reminder.title}`} />
      <div className="relative">
        <button type="button" aria-label="Aksi reminder" onClick={() => setOpen((v) => !v)} className="flex h-8 w-8 items-center justify-center rounded-full text-reset-muted hover:bg-reset-bg">
          <MoreVertical size={17} />
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
