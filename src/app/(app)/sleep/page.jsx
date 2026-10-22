"use client";

import { useState } from "react";
import { BedDouble, ChevronLeft, ChevronRight, Plus, MoonStar } from "lucide-react";
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

const navBtn = "btn-ghost btn-sm";

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
      push(id ? "Sleep log updated." : "Sleep log saved.");
    } catch (err) { push(friendlyError(err, "Failed to save sleep log."), "error"); }
    finally { setSaving(false); }
  }

  async function handleDelete() {
    try {
      await data.remove(deleting.id);
      setDeleting(null);
      push("Sleep log deleted.");
    } catch (err) { push(friendlyError(err, "Failed to delete sleep log."), "error"); }
  }

  return (
    <PageContainer className="max-w-3xl">
      <PageHeader title="Sleep Tracker" subtitle="Track your sleep patterns and improve your rest."
        action={<button type="button" onClick={() => setFormOpen(true)} className="btn-primary btn-sm flex items-center gap-2"><Plus size={16} /> Log Sleep</button>} />
      
      <div className="card p-5 mb-6">
        <MonthNav month={month} canNext={canNext} ChevronLeft={ChevronLeft} ChevronRight={ChevronRight} monthTitle={monthTitle}
          onPrev={() => setMonth((m) => addMonths(m, -1))} onNext={() => setMonth((m) => addMonths(m, 1))} />
        <div className="mt-4 grid grid-cols-3 gap-3">
          <StatCard label="Average" value={data.summary.averageMinutes > 0 ? formatSleepDuration(data.summary.averageMinutes) : "—"} />
          <StatCard label="Longest" value={data.summary.bestMinutes > 0 ? formatSleepDuration(data.summary.bestMinutes) : "—"} />
          <StatCard label="Shortest" value={data.summary.worstMinutes > 0 ? formatSleepDuration(data.summary.worstMinutes) : "—"} />
        </div>
      </div>

      <div className="space-y-3">
        {data.status === "loading" ? (
          <><Skeleton className="h-32 rounded-[var(--radius-card)]" /><Skeleton className="h-32 rounded-[var(--radius-card)]" /></>
        ) : data.status === "failure" ? (
          <EmptyState icon={BedDouble} title="Failed to load sleep data" description={data.error}
            action={<button type="button" onClick={data.reload} className="btn-primary btn-sm">Try again</button>} />
        ) : data.logs.length === 0 ? (
          <EmptyState icon={BedDouble} title="No sleep logs yet" description="Log your sleep to see summaries here."
            action={<button type="button" onClick={() => setFormOpen(true)} className="btn-primary btn-sm">Log Sleep</button>} />
        ) : data.logs.map((log) => (
          <SleepTile key={log.id} log={log} busy={data.isBusy(log.id)} onEdit={() => setEditing(log)} onDelete={() => setDeleting(log)} />
        ))}
      </div>

      <SleepFormModal open={formOpen} onClose={() => setFormOpen(false)} title="Log Sleep" submitLabel="Save Log" saving={saving} onSubmit={(v) => save(v, null)} />
      <SleepFormModal key={editing?.id || "edit"} open={!!editing} onClose={() => setEditing(null)} title="Edit Sleep Log" submitLabel="Save Changes" initial={editing} saving={saving} onSubmit={(v) => save(v, editing.id)} />
      <ConfirmDialog open={!!deleting} onClose={() => setDeleting(null)} title="Delete Sleep Log?" message="This log will be permanently deleted." confirmLabel="Delete" danger onConfirm={handleDelete} />
    </PageContainer>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-xl bg-reset-bg p-4 text-center">
      <p className="truncate text-[20px] font-bold text-reset-dark">{value}</p>
      <p className="body-xs text-reset-muted">{label}</p>
    </div>
  );
}