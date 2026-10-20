"use client";

import { useState } from "react";
import Modal from "@/components/ui/modal";
import { searchTimezones, timezoneLabel } from "@/lib/utils/timezones";
import { validateUsername } from "@/lib/utils/validators";
import { friendlyError } from "@/lib/utils/errors";

export function UsernameModal({ open, onClose, initial, onSave }) {
  const [value, setValue] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  return (
    <Modal open={open} onClose={onClose} title="Ubah username"
      description="3-30 karakter, hanya huruf, angka, dan garis bawah."
      footer={<div className="flex gap-3">
        <button type="button" onClick={onClose} className="btn-outline flex-1">Batal</button>
        <button type="button" disabled={saving} className="btn-primary flex-1"
          onClick={async () => {
            const err = validateUsername(value);
            if (err) { setError(err); return; }
            setError(null);
            setSaving(true);
            try { await onSave(value.trim()); }
            catch (e) { setError(friendlyError(e, "Gagal menyimpan username.")); }
            finally { setSaving(false); }
          }}>{saving ? "Menyimpan..." : "Simpan"}</button>
      </div>}>
      {error ? <p className="mb-3 rounded-xl border border-[#F0C9C6] bg-[#FFF6F5] px-3.5 py-2.5 text-[13px] font-medium text-[#8F211A]">{error}</p> : null}
      <label className="field-label" htmlFor="username-field">Username</label>
      <input id="username-field" className="field" value={value} onChange={(e) => setValue(e.target.value)} maxLength={30} />
    </Modal>
  );
}

export function TimezoneModal({ open, onClose, initial, onSave, onError }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(initial);
  const [saving, setSaving] = useState(false);
  const results = searchTimezones(query).slice(0, 40);
  return (
    <Modal open={open} onClose={onClose} title="Pilih zona waktu" description="Dipakai untuk jadwal reminder dan tanggal harian."
      footer={<div className="flex gap-3">
        <button type="button" onClick={onClose} className="btn-outline flex-1">Batal</button>
        <button type="button" disabled={saving} className="btn-primary flex-1"
          onClick={async () => {
            setSaving(true);
            try { await onSave(selected); }
            catch (e) { onError?.(e); }
            finally { setSaving(false); }
          }}>{saving ? "Menyimpan..." : "Simpan"}</button>
      </div>}>
      <input className="field" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari zona waktu..." />
      <div className="mt-3 max-h-64 space-y-1 overflow-y-auto">
        {results.map((zone) => (
          <button key={zone} type="button" onClick={() => setSelected(zone)}
            className={`block w-full rounded-xl px-3.5 py-2.5 text-left text-[14px] transition ${selected === zone ? "bg-reset-soft font-bold text-reset-primary" : "text-reset-dark hover:bg-reset-bg"}`}>
            {timezoneLabel(zone)}
          </button>
        ))}
      </div>
    </Modal>
  );
}
