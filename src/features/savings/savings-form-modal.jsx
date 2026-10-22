"use client";

import { useState } from "react";
import Modal from "@/components/ui/modal";
import { formatDateParam, parseDateParam } from "@/lib/utils/date";
import { parseAmountInput } from "@/lib/utils/currency";

export default function SavingsFormModal({ open, onClose, title, submitLabel, initial, saving, onSubmit }) {
  const [kind, setKind] = useState(initial?.kind || "deposit");
  const [amount, setAmount] = useState(initial ? String(initial.amount) : "");
  const [date, setDate] = useState(initial?.occurredOn ? formatDateParam(initial.occurredOn) : formatDateParam(new Date()));
  const [note, setNote] = useState(initial?.note || "");
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    const parsed = parseAmountInput(amount);
    if (parsed == null) { setError("Nominal tidak valid. Contoh: 50000 atau 50.000"); return; }
    const occurredOn = parseDateParam(date);
    if (!occurredOn) { setError("Tanggal tidak valid."); return; }
    setError(null);
    await onSubmit({ kind, amount: parsed, occurredOn, note: note.trim() });
  }

  return (
    <Modal open={open} onClose={onClose} title={title} description="Catat pemasukan atau penarikan tabungan."
      footer={<div className="flex gap-3">
        <button type="button" onClick={onClose} className="btn-outline flex-1">Batal</button>
        <button type="button" onClick={handleSubmit} disabled={saving} className="btn-primary flex-1">{saving ? "Menyimpan..." : submitLabel}</button>
      </div>}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error ? <p className="rounded-xl border border-[#F0C9C6] bg-[#FFF6F5] px-3.5 py-2.5 text-[13px] font-medium text-[#8F211A]">{error}</p> : null}
        <div className="grid grid-cols-2 gap-2 rounded-[14px] border border-reset-border bg-reset-bg p-1">
          {(["deposit", "withdrawal"]).map((k) => (
            <button key={k} type="button" onClick={() => setKind(k)}
              className={`rounded-[10px] py-2.5 text-[14px] font-bold transition ${kind === k ? "bg-white text-reset-primary shadow-sm" : "text-reset-muted"}`}>
              {k === "deposit" ? "Menabung" : "Penarikan"}
            </button>
          ))}
        </div>
        <div>
          <label className="field-label" htmlFor="savings-amount">Nominal (Rp)</label>
          <input id="savings-amount" className="field" inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="50.000" />
        </div>
        <div>
          <label className="field-label" htmlFor="savings-date">Tanggal</label>
          <input id="savings-date" type="date" className="field" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div>
          <label className="field-label" htmlFor="savings-note">Catatan (opsional)</label>
          <input id="savings-note" className="field" value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} placeholder="Contoh: gaji bulanan" />
        </div>
      </form>
    </Modal>
  );
}
