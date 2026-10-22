"use client";

import { useEffect, useState } from "react";
import { MoonStar, BellPlus, BellOff } from "lucide-react";
import Modal from "@/components/ui/modal";
import ToggleSwitch from "@/components/ui/switch";
import Skeleton from "@/components/ui/skeleton";
import { fetchNotificationPreferences, saveNotificationPreferences } from "@/features/settings/settings-api";
import { friendlyError } from "@/lib/utils/errors";
import { usePushSubscription } from "@/features/settings/use-push-subscription";

const ROWS = [
  { key: "reminderEnabled", title: "Reminder harian", subtitle: "Pengingat tugas dan rutinitas" },
  { key: "sleepReminderEnabled", title: "Pengingat tidur", subtitle: "Ingatkan waktu tidur" },
  { key: "savingsReminderEnabled", title: "Pengingat tabungan", subtitle: "Ingatkan mencatat tabungan" },
  { key: "dailySummaryEnabled", title: "Ringkasan harian", subtitle: "Rangkuman progres di akhir hari" },
];

export default function NotificationCard({ push }) {
  const [prefs, setPrefs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [quietOpen, setQuietOpen] = useState(false);
  const [testLoading, setTestLoading] = useState(false);

  const { isSupported, isSubscribed, loading: pushLoading, error: pushError, subscribe, unsubscribe } = usePushSubscription();

  useEffect(() => {
    let active = true;
    fetchNotificationPreferences()
      .then((rows) => { if (active) setPrefs(rows); })
      .catch(() => { if (active) setPrefs(null); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  async function update(next) {
    setPrefs(next);
    setSaving(true);
    try {
      await saveNotificationPreferences(next);
    } catch (err) {
      push(friendlyError(err, "Gagal menyimpan preferensi."), "error");
    } finally {
      setSaving(false);
    }
  }

  async function handlePushToggle() {
    if (!isSupported) {
      push("Push notification tidak didukung di browser ini.", "error");
      return;
    }
    if (isSubscribed) {
      await unsubscribe();
      await update({ ...prefs, pushEnabled: false });
    } else {
      const result = await subscribe();
      if (result.ok) {
        await update({ ...prefs, pushEnabled: true });
        push("Notifikasi push diaktifkan.", "success");
      } else {
        push(result.error || "Gagal mengaktifkan push notification.", "error");
      }
    }
  }

  async function handleTestNotification() {
    setTestLoading(true);
    try {
      const res = await fetch("/api/push-notification/test", {
        method: "POST",
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Gagal mengirim notifikasi uji.");
      }

      const data = await res.json();
      push(data.message || "Notifikasi uji berhasil dikirim.", "success");
    } catch (err) {
      console.error("Test notification error:", err);
      push(err.message || "Gagal mengirim notifikasi uji.", "error");
    } finally {
      setTestLoading(false);
    }
  }

  if (loading) return (<div className="card mt-4 p-5"><Skeleton className="h-24 rounded-2xl" /></div>);

  return (
    <div className="card mt-4 p-5">
      <h2 className="text-[16px] font-bold text-reset-dark">Notifikasi</h2>
      <p className="mt-1 text-[13px] leading-5 text-reset-muted">
        Atur preferensi notifikasi dan aktifkan push untuk menerima pengingat di perangkat Anda.
      </p>
      {prefs ? (
        <div className="mt-3 divide-y divide-reset-border/60">
          <div className="flex items-center gap-3 py-3 border-b border-reset-border/60">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-reset-primary-light text-reset-primary">
              {prefs?.pushEnabled ? <BellOff size={18} /> : <BellPlus size={18} />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-bold text-reset-dark">Notifikasi Push</p>
              <p className="text-[12.5px] text-reset-muted">{prefs?.pushEnabled ? "Notifikasi akan dikirim ke perangkat Anda." : "Aktifkan untuk menerima notifikasi push."}</p>
            </div>
            <button
              type="button"
              onClick={handlePushToggle}
              disabled={pushLoading || !isSupported}
              className={`flex h-9 w-[52px] shrink-0 items-center justify-center rounded-full transition-colors ${
                prefs?.pushEnabled
                  ? "bg-reset-primary text-white"
                  : "bg-[#CFD9D2] text-reset-muted"
              } ${pushLoading ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
              aria-label={prefs?.pushEnabled ? "Matikan Push" : "Aktifkan Push"}
            >
              {pushLoading ? (
                <span className="animate-spin h-4 w-4 border-2 border-current rounded-full border-t-transparent" />
              ) : null}
            </button>
          </div>
          {!isSupported && (
            <div className="py-3 px-4 bg-reset-bg rounded-lg text-[12.5px] text-reset-muted border border-reset-border/40">
              Browser ini tidak mendukung notifikasi push. Gunakan Chrome atau Edge.
            </div>
          )}
          {pushError && (
            <div className="py-3 px-4 bg-[#FDECEA] rounded-lg text-[12.5px] text-reset-danger border border-reset-danger/40">
              {pushError}
            </div>
          )}
          {isSubscribed && (
            <div className="flex items-center gap-3 py-3">
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-bold text-reset-dark">Kirim Notifikasi Uji</p>
                <p className="text-[12.5px] text-reset-muted">Coba kirim notifikasi push ke perangkat Anda.</p>
              </div>
              <button
                type="button"
                onClick={handleTestNotification}
                disabled={testLoading}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-reset-primary text-white text-[13px] font-semibold hover:bg-reset-primary-hover transition-colors disabled:opacity-60"
              >
                {testLoading ? (
                  <span className="animate-spin h-4 w-4 border-2 border-current rounded-full border-t-transparent" />
                ) : (
                  "Kirim"
                )}
              </button>
            </div>
          )}
          {ROWS.map((row) => (
            <div key={row.key} className="flex items-center gap-3 py-3">
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-bold text-reset-dark">{row.title}</p>
                <p className="text-[12.5px] text-reset-muted">{row.subtitle}</p>
              </div>
              <ToggleSwitch checked={!!prefs[row.key]} label={row.title} onChange={(v) => update({ ...prefs, [row.key]: v })} />
            </div>
          ))}
          <button type="button" onClick={() => setQuietOpen(true)} className="flex w-full items-center gap-3 py-3 text-left">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-reset-soft text-reset-primary"><MoonStar size={18} /></span>
            <span className="min-w-0 flex-1">
              <span className="block text-[14px] font-bold text-reset-dark">Jam tenang</span>
              <span className="block text-[12.5px] text-reset-muted">
                {prefs.quietHoursStart && prefs.quietHoursEnd ? `${prefs.quietHoursStart} - ${prefs.quietHoursEnd}` : "Belum diatur"}
              </span>
            </span>
          </button>
          {prefs.quietHoursStart && prefs.quietHoursEnd ? (
            <button type="button" onClick={() => update({ ...prefs, quietHoursStart: null, quietHoursEnd: null })}
              className="py-2 text-[13px] font-bold text-reset-primary">Matikan jam tenang</button>
          ) : null}
        </div>
      ) : (
        <p className="muted mt-3 text-[13.5px]">Preferensi belum bisa dimuat. Coba lagi nanti.</p>
      )}
      {saving ? <div className="mt-2 h-1 overflow-hidden rounded-full bg-reset-soft"><div className="h-full w-1/2 animate-pulse rounded-full bg-reset-primary" /></div> : null}
      <QuietHoursModal open={quietOpen} onClose={() => setQuietOpen(false)} initial={prefs}
        onSave={(start, end) => { setQuietOpen(false); if (prefs) update({ ...prefs, quietHoursStart: start, quietHoursEnd: end }); }} />
    </div>
  );
}

function QuietHoursModal({ open, onClose, initial, onSave }) {
  const [start, setStart] = useState(initial?.quietHoursStart || "22:00");
  const [end, setEnd] = useState(initial?.quietHoursEnd || "06:00");
  return (
    <Modal open={open} onClose={onClose} title="Jam tenang" description="Selama jam tenang, pengingat tidak dikirim."
      footer={<div className="flex gap-3">
        <button type="button" onClick={onClose} className="btn-outline flex-1">Batal</button>
        <button type="button" onClick={() => onSave(start, end)} className="btn-primary flex-1">Simpan</button>
      </div>}>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="field-label" htmlFor="quiet-start">Mulai</label>
          <input id="quiet-start" type="time" className="field" value={start} onChange={(e) => setStart(e.target.value)} />
        </div>
        <div>
          <label className="field-label" htmlFor="quiet-end">Selesai</label>
          <input id="quiet-end" type="time" className="field" value={end} onChange={(e) => setEnd(e.target.value)} />
        </div>
      </div>
    </Modal>
  );
}
