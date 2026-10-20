"use client";

import { useState } from "react";
import { BedDouble, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import PageContainer from "@/components/ui/page-container";
import PageHeader from "@/components/ui/page-header";
import Skeleton from "@/components/ui/skeleton";
import EmptyState from "@/components/ui/empty-state";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import SleepFormModal from "@/features/sleep/sleep-form-modal";
import { MonthNav, SleepTile, formatSleepDuration } from "@/features/sleep/sleep-tiles";
import { useSleepData } from "@/features/sleep/use-sleep-data";
import { createSleepLog, resolveSleepTimes, updateSleepLog } from "@/features/sleep/sleep-api";
import { addMonths, firstDayOfMonth, localToday } from "@/lib/utils/date";
import { monthTitle } from "@/lib/utils/format";
import { useToast } from "@/components/ui/toast";
import { friendlyError } from "@/lib/utils/errors";
import { useDataRevision } from "@/lib/data-revision";

export default function SleepPage() {
  const { push } = useToast();
  const { bump } = useDataRevision();
  const [month, setMonth] = useState(() => firstDayOfMonth(localToday()));
  const data = useSleepData(month);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [saving, setSaving] = useState(false);
  const canNext = month < firstDayOfMonth(localToday());

  async function save(values, id) {
    setSaving(true);
    try {
      const times = resolveSleepTimes(values);
      const payload = { sleepDate: values.sleepDate, bedTime: times.bedTime, wakeTime: times.wakeTime, quality: values.quality, notes: values.notes };
      if (id) await updateSleepLog({ id, ...payload });
      else await createSleepLog(payload);
      setFormOpen(false);
      setEditing(null);
      bump("sleep");
      push(id ? "Catatan tidur diperbarui." : "Catatan tidur disimpan.");
    } catch (err) { push(friendlyError(err, "Gagal menyimpan catatan tidur."), "error"); }
    finally { setSaving(false); }
  }

  async function handleDelete() {
    try {
      await data.remove(deleting.id);
      setDeleting(null);
      push("Catatan tidur dihapus.");
    } catch (err) { push(friendlyError(err, "Gagal menghapus catatan tidur."), "error"); }
  }

  return (
    <PageContainer className="max-w-3xl">
      <PageHeader title="Sleep Tracker" subtitle="Catat dan pantau kualitas tidurmu."
        action={<button type="button" onClick={() => setFormOpen(true)} className="btn-primary btn-sm"><Plus size={16} /> Catat</button>} />
      <div className="card p-5">
        <MonthNav month={month} canNext={canNext} ChevronLeft={ChevronLeft} ChevronRight={ChevronRight} monthTitle={monthTitle}
          onPrev={() => setMonth((m) => addMonths(m, -1))} onNext={() => setMonth((m) => addMonths(m, 1))} />
        <div className="grid grid-cols-3 gap-2.5">
          <Stat label="Rata-rata" value={data.summary.averageMinutes > 0 ? formatSleepDuration(data.summary.averageMinutes) : "—"} />
          <Stat label="Terlama" value={data.summary.bestMinutes > 0 ? formatSleepDuration(data.summary.bestMinutes) : "—"} />
          <Stat label="Terpendek" value={data.summary.worstMinutes > 0 ? formatSleepDuration(data.summary.worstMinutes) : "—"} />
        </div>
      </div>
      <div className="mt-4 space-y-3">
        {data.status === "loading" ? (<><Skeleton className="h-28 rounded-[20px]" /><Skeleton className="h-28 rounded-[20px]" /></>)
        : data.status === "failure" ? (
          <EmptyState icon={BedDouble} title="Gagal memuat data tidur" description={data.error}
            action={<button type="button" onClick={data.reload} className="btn-primary btn-sm">Coba lagi</button>} />
        ) : data.logs.length === 0 ? (
          <EmptyState icon={BedDouble} title="Belum ada catatan tidur" description="Catat tidurmu untuk melihat ringkasan di sini."
            action={<button type="button" onClick={() => setFormOpen(true)} className="btn-primary btn-sm">Catat tidur</button>} />
        ) : data.logs.map((log) => (
          <SleepTile key={log.id} log={log} busy={data.isBusy(log.id)} onEdit={() => setEditing(log)} onDelete={() => setDeleting(log)} />
        ))}
      </div>
      <SleepFormModal open={formOpen} onClose={() => setFormOpen(false)} title="Catat tidur" submitLabel="Simpan catatan" saving={saving} onSubmit={(v) => save(v, null)} />
      <SleepFormModal key={editing?.id || "edit"} open={!!editing} onClose={() => setEditing(null)} title="Ubah catatan tidur" submitLabel="Simpan perubahan" initial={editing} saving={saving} onSubmit={(v) => save(v, editing.id)} />
      <ConfirmDialog open={!!deleting} onClose={() => setDeleting(null)} title="Hapus catatan tidur?" message="Catatan ini akan dihapus permanen." confirmLabel="Hapus" danger onConfirm={handleDelete} />
    </PageContainer>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-2xl bg-reset-bg px-3 py-3">
      <p className="truncate text-[15px] font-bold text-reset-dark">{value}</p>
      <p className="text-[12px] text-reset-muted">{label}</p>
    </div>
  );
}
