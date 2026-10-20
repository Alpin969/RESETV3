"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/ui/modal";
import { WEEKDAY_OPTIONS } from "@/lib/utils/format";

export default function ReminderFormModal({ open, onClose, title, submitLabel, initial, saving, onSubmit }) {
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [time, setTime] = useState("07:00");
  const [days, setDays] = useState(() => new Set([1, 2, 3, 4, 5, 6, 7]));
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) {
      setName(initial?.title || "");
      setBody(initial?.body || "");
      setTime(initial?.time || "07:00");
      setDays(new Set(initial?.daysOfWeek || [1, 2, 3, 4, 5, 6, 7]));
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function toggleDay(day) {
    setDays((cur) => {
      const next = new Set(cur);
      if (next.has(day)) next.delete(day);
      else next.add(day);
      return next;
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const clean = name.trim();
    if (!clean) { setError("Judul reminder wajib diisi."); return; }
    if (clean.length > 120) { setError("Judul maksimal 120 karakter."); return; }
    if (body.trim().length > 300) { setError("Isi maksimal 300 karakter."); return; }
    if (days.size === 0) { setError("Pilih minimal satu hari."); return; }
    setError(null);
    await onSubmit({ title: clean, body: body.trim(), time, daysOfWeek: days });
  }

  return (
    <Modal open={open} onClose={onClose} title={title} description="Pengingat tersimpan dan aktif sesuai jadwal harianmu."
      footer={<div className="flex gap-3">
        <button type="button" onClick={onClose} className="btn-outline flex-1">Batal</button>
        <button type="button" onClick={handleSubmit} disabled={saving} className="btn-primary flex-1">{saving ? "Menyimpan..." : submitLabel}</button>
      </div>}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error ? <p className="rounded-xl border border-[#F0C9C6] bg-[#FFF6F5] px-3.5 py-2.5 text-[13px] font-medium text-[#8F211A]">{error}</p> : null}
        <div>
          <label className="field-label" htmlFor="rem-title">Judul</label>
          <input id="rem-title" className="field" value={name} onChange={(e) => setName(e.target.value)} maxLength={120} placeholder="Contoh: Minum air putih" />
        </div>
        <div>
          <label className="field-label" htmlFor="rem-body">Isi (opsional)</label>
          <textarea id="rem-body" className="field min-h-20 resize-y" value={body} onChange={(e) => setBody(e.target.value)} maxLength={300} placeholder="Detail pengingat..." />
        </div>
        <div>
          <label className="field-label" htmlFor="rem-time">Jam</label>
          <input id="rem-time" type="time" className="field" value={time} onChange={(e) => setTime(e.target.value)} />
        </div>
        <div>
          <span className="field-label">Hari aktif</span>
          <div className="flex flex-wrap gap-2">
            {WEEKDAY_OPTIONS.map((d) => (
              <button key={d.value} type="button" onClick={() => toggleDay(d.value)}
                className={`rounded-full border px-3.5 py-2 text-[13px] font-bold transition ${days.has(d.value) ? "border-reset-primary bg-reset-primary text-white" : "border-reset-border bg-white text-reset-muted"}`}>
                {d.short}
              </button>
            ))}
          </div>
        </div>
      </form>
    </Modal>
  );
}
