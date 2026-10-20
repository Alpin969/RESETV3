"use client";

import { useState } from "react";
import { Flame, ListChecks, MoonStar, PiggyBank, Plus, Sprout } from "lucide-react";
import DashboardHeader from "@/features/home/dashboard-header";
import QuickActions from "@/features/home/quick-actions";
import { SavingsTrackerCard, SleepTrackerCard } from "@/features/home/tracker-cards";
import TaskTile from "@/features/tasks/task-tile";
import TaskFormModal from "@/features/tasks/task-form-modal";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import EmptyState from "@/components/ui/empty-state";
import Skeleton from "@/components/ui/skeleton";
import { useTodayTasks } from "@/features/tasks/use-today-tasks";
import { useHomeSummary } from "@/features/home/use-home-summary";
import { useToast } from "@/components/ui/toast";
import { friendlyError } from "@/lib/utils/errors";
import { formatRupiah } from "@/lib/utils/currency";

export default function HomePage() {
  const { push } = useToast();
  const today = useTodayTasks();
  const summary = useHomeSummary();
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [archiving, setArchiving] = useState(null);

  async function handleCreate({ title, notes }) {
    try {
      await today.addTask({ title, notes });
      setCreateOpen(false);
      push("Task ditambahkan.");
    } catch (err) { push(friendlyError(err, "Gagal menambah task."), "error"); }
  }

  async function handleEdit({ title, notes }) {
    try {
      await today.editTask({ id: editing.task.id, title, notes });
      setEditing(null);
      push("Task diperbarui.");
    } catch (err) { push(friendlyError(err, "Gagal memperbarui task."), "error"); }
  }

  async function handleArchive() {
    try {
      await today.archive(archiving.task.id);
      setArchiving(null);
      push("Task diarsipkan.");
    } catch (err) { push(friendlyError(err, "Gagal mengarsipkan task."), "error"); }
  }

  const pct = today.totalCount === 0 ? 0 : Math.round((today.completedCount / today.totalCount) * 100);

  return (
    <div className="mx-auto w-full max-w-5xl px-5 pb-28 pt-5 tablet:px-7 tablet:pt-7 desktop:pb-10">
      <div className="tablet:hidden">
        <DashboardHeader date={today.today} compact />
      </div>
      <div className="hidden tablet:block">
        <DashboardHeader date={today.today} compact={false} />
      </div>
      <StatGrid today={today} summary={summary} />
      <FocusCard today={today} pct={pct} onAdd={() => setCreateOpen(true)}
        onEdit={setEditing} onArchive={setArchiving} />
      <div className="mt-4 grid gap-3 tablet:grid-cols-2">
        <SleepTrackerCard log={summary.latestSleep} averageMinutes={summary.sleepAverage} isLoading={summary.loading} />
        <SavingsTrackerCard summary={summary.savings} isLoading={summary.loading} />
      </div>
      <div className="mt-6"><QuickActions compact={false} /></div>
      <p className="mt-8 hidden text-center text-[14px] font-medium italic text-reset-muted/70 desktop:block">
        Discipline today, freedom tomorrow.
      </p>
      <TaskFormModal open={createOpen} onClose={() => setCreateOpen(false)} title="Tambah task"
        description="Task baru berlaku mulai hari ini dan berulang setiap hari." submitLabel="Simpan task"
        saving={today.saving} onSubmit={handleCreate} />
      <TaskFormModal key={editing ? editing.task.id : "edit"} open={!!editing} onClose={() => setEditing(null)}
        title="Ubah task" description="Perbarui nama atau catatan task." submitLabel="Simpan perubahan"
        initialTitle={editing ? editing.task.title : ""} initialNotes={editing ? editing.task.notes || "" : ""}
        saving={today.saving} onSubmit={handleEdit} />
      <ConfirmDialog open={!!archiving} onClose={() => setArchiving(null)} title="Arsipkan task?"
        message={`"${archiving?.task.title}" tidak akan muncul di daftar harian lagi.`}
        confirmLabel="Arsipkan" onConfirm={handleArchive} />
    </div>
  );
}

function StatGrid({ today, summary }) {
  const stats = [
    { icon: MoonStar, label: "Last Night's Sleep", value: summary.loading ? "..." : summary.latestSleep ? formatDurationEn(summary.latestSleep.durationMinutes) : "—" },
    { icon: Flame, label: "Current Streak", value: `${today.streak.currentStreak} days` },
    { icon: ListChecks, label: "Tasks Completed", value: `${today.completedCount}/${today.totalCount}` },
    { icon: PiggyBank, label: "Total Savings", value: summary.loading ? "..." : formatRupiah(summary.savings.balance) },
  ];
  return (
    <div className="mt-6 grid grid-cols-2 gap-3 min-[600px]:grid-cols-4">
      {today.status === "loading" ? (
        <><Skeleton className="h-[92px] rounded-[20px]" /><Skeleton className="h-[92px] rounded-[20px]" /><Skeleton className="h-[92px] rounded-[20px]" /><Skeleton className="h-[92px] rounded-[20px]" /></>
      ) : stats.map(({ icon: Icon, label, value }) => (
        <div key={label} className="card p-3.5 tablet:p-4">
          <div className="flex items-center gap-1.5 text-reset-muted">
            <Icon size={15} />
            <span className="truncate text-[11.5px] font-medium">{label}</span>
          </div>
          <p className="mt-1.5 truncate text-[19px] font-bold tracking-tight text-reset-dark tablet:text-[21px]">{value}</p>
        </div>
      ))}
    </div>
  );
}

function formatDurationEn(minutes) {
  const total = Math.max(0, Math.round(minutes || 0));
  if (total <= 0) return "0m";
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

function FocusCard({ today, pct, onAdd, onEdit, onArchive }) {
  return (
    <div className="card mt-6 p-[18px] tablet:p-[22px]">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-reset-soft text-reset-primary">
          <ListChecks size={21} />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-[17px] font-bold text-reset-dark">Today&apos;s Focus</h2>
          <p className="truncate text-[13px] text-reset-muted">Keep going, you&apos;re doing great!</p>
        </div>
        <button type="button" onClick={onAdd} className="btn-primary btn-sm !rounded-xl !px-3.5">
          <Plus size={16} /> Add Task
        </button>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-reset-soft">
          <div className="h-full rounded-full bg-reset-primary transition-all" style={{ width: `${pct}%` }} />
        </div>
        <span className="text-[13px] font-bold text-reset-primary">{pct}%</span>
      </div>
      <div className="mt-2 divide-y divide-reset-border/70">
        {today.status === "loading" ? (
          <><Skeleton className="my-2 h-12 rounded-xl" /><Skeleton className="my-2 h-12 rounded-xl" /></>
        ) : today.status === "failure" ? (
          <div className="py-6 text-center">
            <p className="text-[14px] text-reset-muted">{today.error || "Gagal memuat task."}</p>
            <button type="button" onClick={today.load} className="btn-outline btn-sm mt-3">Try again</button>
          </div>
        ) : today.tasks.length === 0 ? (
          <EmptyState icon={Sprout} title="No tasks yet"
            description="Add your first daily task and start building momentum."
            action={<button type="button" onClick={onAdd} className="btn-primary btn-sm">Add your first task</button>} />
        ) : (
          today.tasks.map((item) => (
            <TaskTile key={item.task.id} item={item} isBusy={today.isBusy(item.task.id)}
              onToggle={() => today.toggle(item)} onEdit={() => onEdit(item)} onArchive={() => onArchive(item)} />
          ))
        )}
      </div>
    </div>
  );
}
