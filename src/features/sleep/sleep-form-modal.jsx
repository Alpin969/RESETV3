"use client";

import { useState } from "react";
import Modal from "@/components/ui/modal";
import { formatDateParam, parseDateParam } from "@/lib/utils/date";

function pad(n) { return String(n).padStart(2, "0"); }

export default function SleepFormModal({ open, onClose, title, submitLabel, initial, saving, onSubmit }) {
  const todayStr = formatDateParam(new Date());
  const [date, setDate] = useState(initial?.sleepDate ? formatDateParam(initial.sleepDate) : todayStr);
  const [bed, setBed] = useState(initial ? `${pad(initial.bedTime.getHours())}:${pad(initial.bedTime.getMinutes())}` : "22:00");
  const [wake, setWake] = useState(initial ? `${pad(initial.wakeTime.getHours())}:${pad(initial.wakeTime.getMinutes())}` : "06:00");
  const [quality, setQuality] = useState(initial?.quality || null);
  const [notes, setNotes] = useState(initial?.notes || "");
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    const sleepDate = parseDateParam(date);
    if (!sleepDate) { setError("Tanggal tidak valid."); return; }
    const [bh, bm] = bed.split(":").map(Number);
    const [wh, wm] = wake.split(":").map(Number);
    if (bh == null || wh == null) { setError("Jam tidur tidak valid."); return; }
    setError(null);
    await onSubmit({ sleepDate, bedHour: bh, bedMinute: bm || 0, wakeHour: wh, wakeMinute: wm || 0, quality, notes: notes.trim() });
  }

  return (
    <Modal open={open} onClose={onClose} title={title} description="Catat jam tidur dan bangun. Durasi dihitung otomatis."
      footer={<div className="flex gap-3">
        <button type="button" onClick={onClose} className="btn-outline flex-1">Batal</button>
        <button type="button" onClick={handleSubmit} disabled={saving} className="btn-primary flex-1">{saving ? "Menyimpan..." : submitLabel}</button>
      </div>}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error ? <p className="rounded-xl border border-[#F0C9C6] bg-[#FFF6F5] px-3.5 py-2.5 text-[13px] font-medium text-[#8F211A]">{error}</p> : null}
        <div>
          <label className="field-label" htmlFor="sleep-date">Tanggal tidur</label>
          <input id="sleep-date" type="date" className="field" value={date} max={todayStr} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="field-label" htmlFor="bed-time">Jam tidur</label>
            <input id="bed-time" type="time" className="field" value={bed} onChange={(e) => setBed(e.target.value)} />
          </div>
          <div>
            <label className="field-label" htmlFor="wake-time">Jam bangun</label>
            <input id="wake-time" type="time" className="field" value={wake} onChange={(e) => setWake(e.target.value)} />
          </div>
        </div>
        <div>
          <span className="field-label">Kualitas (opsional)</span>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((q) => (
              <button key={q} type="button" onClick={() => setQuality(quality === q ? null : q)}
                aria-label={`Kualitas ${q}`}
                className={`flex h-10 w-10 items-center justify-center rounded-full border text-[16px] transition ${quality >= q ? "" : "border-reset-border text-reset-muted"}`}
                style={quality >= q ? { borderColor: "#2F8A60", background: "#E3F1E9" } : undefined}>
                ★
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="field-label" htmlFor="sleep-notes">Catatan (opsional)</label>
          <textarea id="sleep-notes" className="field min-h-20 resize-y" value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={1000} placeholder="Contoh: tidur nyenyak..." />
        </div>
      </form>
    </Modal>
  );
}
