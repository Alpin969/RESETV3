"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  Flame,
  ListChecks,
  MoonStar,
  PiggyBank,
  Plus,
  Sprout,
  Target,
  TrendingUp,
} from "lucide-react";
import DashboardHeader from "@/features/home/dashboard-header";
import QuickActions from "@/features/home/quick-actions";
import TaskTile from "@/features/tasks/task-tile";
import TaskFormModal from "@/features/tasks/task-form-modal";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import Skeleton from "@/components/ui/skeleton";
import ProgressRing from "@/components/ui/progress-ring";
import { useTodayTasks } from "@/features/tasks/use-today-tasks";
import { useHomeSummary } from "@/features/home/use-home-summary";
import { useToast } from "@/components/ui/toast";
import { friendlyError } from "@/lib/utils/errors";
import { formatRupiah } from "@/lib/utils/currency";
import { compactDate, formatDuration } from "@/lib/utils/format";
import WeeklyChart from "@/features/progress/weekly-chart";
import ProgressAreaChart from "@/features/progress/progress-area-chart";
import { cn } from "@/lib/utils/cn";

export default function HomePage() {
  const { push } = useToast();
  const today = useTodayTasks();
  const summary = useHomeSummary();
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [archiving, setArchiving] = useState(null);
  const [focusMode, setFocusMode] = useState(false);
  const [range, setRange] = useState("7");

  async function handleCreate({ title, notes }) {
    try {
      await today.addTask({ title, notes });
      setCreateOpen(false);
      push("Task added.");
    } catch (err) { push(friendlyError(err, "Failed to add task."), "error"); }
  }

  async function handleEdit({ title, notes }) {
    try {
      await today.editTask({ id: editing.task.id, title, notes });
      setEditing(null);
      push("Task updated.");
    } catch (err) { push(friendlyError(err, "Failed to update task."), "error"); }
  }

  async function handleArchive() {
    try {
      await today.archive(archiving.task.id);
      setArchiving(null);
      push("Task archived.");
    } catch (err) { push(friendlyError(err, "Failed to archive task."), "error"); }
  }

  const pct = today.totalCount === 0 ? 0 : Math.round((today.completedCount / today.totalCount) * 100);
  const weekly = useMemo(() => summary.weeklyProgress || [], [summary.weeklyProgress]);
  const progress30 = useMemo(() => summary.progress30 || [], [summary.progress30]);

  const weeklyTotals = useMemo(() => totalsFor(weekly), [weekly]);
  const monthlyTotals = useMemo(() => totalsFor(progress30), [progress30]);
  const monthlyRate = monthlyTotals.total === 0 ? 0 : Math.round((monthlyTotals.completed / monthlyTotals.total) * 100);

  const chart7 = useMemo(() => toChartData(weekly), [weekly]);
  const chart30 = useMemo(() => toChartData(progress30), [progress30]);
  const chartData = range === "30" ? chart30 : chart7;
  const chartTotals = range === "30" ? monthlyTotals : weeklyTotals;
  const chartRate = chartTotals.total === 0 ? 0 : Math.round((chartTotals.completed / chartTotals.total) * 100);

  return (
    <div className="container-main">
      <DashboardHeader
        date={today.today}
        focusMode={focusMode}
        onFocusMode={() => setFocusMode((value) => !value)}
      />

      <div className="mt-5 grid grid-cols-2 gap-3 desktop:mt-6 desktop:grid-cols-12 desktop:gap-4">
        <FocusCard
          pct={pct}
          completed={today.completedCount}
          total={today.totalCount}
          className="col-span-2 desktop:col-span-5"
        />
        <StreakCard streak={today.streak.currentStreak} className="desktop:col-span-3" />
        <CompletionCard rate={monthlyRate} loading={summary.loading} className="desktop:col-span-4" />
      </div>

      <div className="mt-3 grid gap-3 desktop:mt-4 desktop:grid-cols-2 desktop:gap-4">
        <TasksCard
          today={today}
          pct={pct}
          onAdd={() => setCreateOpen(true)}
          onEdit={setEditing}
          onArchive={setArchiving}
        />
        <WeeklyProgressCard
          weekly={weekly}
          weeklyTotals={weeklyTotals}
          sleepAverage={summary.sleepAverage}
          savings={summary.savings}
          loading={summary.loading}
        />
      </div>

      {!focusMode ? (
        <div className="mt-3 grid gap-3 desktop:mt-4 desktop:grid-cols-3 desktop:gap-4">
          <RecentActivityCard today={today} summary={summary} />
          <YourProgressCard
            range={range}
            onRange={setRange}
            data={chartData}
            rate={chartRate}
            loading={summary.loading}
          />
          <QuickActions onAddTask={() => setCreateOpen(true)} />
        </div>
      ) : (
        <div className="mt-3 flex items-center justify-center rounded-[16px] border border-dashed border-[#cfe2d5] bg-white/60 px-5 py-4 text-center desktop:mt-4">
          <p className="text-[12px] font-medium text-[#7d9183]">
            Focus mode is on. Distractions are hidden, your daily tasks stay front and center.
          </p>
        </div>
      )}

      <TaskFormModal
        key={createOpen ? "create-open" : "create-closed"}
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Add Task"
        description="New task starts today and repeats daily."
        submitLabel="Save Task"
        saving={today.saving}
        onSubmit={handleCreate}
      />
      <TaskFormModal
        key={editing ? editing.task.id : "edit"}
        open={!!editing}
        onClose={() => setEditing(null)}
        title="Edit Task"
        description="Update task name or notes."
        submitLabel="Save Changes"
        initialTitle={editing ? editing.task.title : ""}
        initialNotes={editing ? editing.task.notes || "" : ""}
        saving={today.saving}
        onSubmit={handleEdit}
      />
      <ConfirmDialog
        open={!!archiving}
        onClose={() => setArchiving(null)}
        title="Archive Task?"
        message={`"${archiving?.task.title}" will no longer appear in your daily list.`}
        confirmLabel="Archive"
        onConfirm={handleArchive}
      />
    </div>
  );
}

function totalsFor(days) {
  return (days || []).reduce(
    (acc, day) => ({
      completed: acc.completed + (day.completed || 0),
      total: acc.total + (day.total || 0),
    }),
    { completed: 0, total: 0 }
  );
}

function toChartData(days) {
  return (days || []).map((day) => ({
    label: compactDate(day.date),
    value: day.total > 0 ? Math.round((day.completed / day.total) * 100) : 0,
  }));
}

function CardTitle({ icon: Icon, children }) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-6 w-6 items-center justify-center rounded-[7px] bg-[#f1f8f2] text-reset-primary">
        <Icon size={13} strokeWidth={2} />
      </span>
      <span className="text-[11px] font-semibold text-[#6e8375]">{children}</span>
    </div>
  );
}

function FocusCard({ pct, completed, total, className }) {
  const remaining = Math.max(0, total - completed);
  return (
    <section className={cn("card relative flex h-full flex-col overflow-hidden p-4 desktop:p-5", className)}>
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[#f1f8f2] text-reset-primary">
          <Target size={18} strokeWidth={1.9} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#92a396]">Today&apos;s Focus</p>
          <h2 className="mt-0.5 text-[14px] font-extrabold tracking-[-0.2px] text-reset-dark">Be Productive</h2>
        </div>
        <Link
          href="/history"
          aria-label="Open history"
          className="flex h-7 w-7 items-center justify-center rounded-full text-[#a6b4a9] transition hover:bg-white hover:text-reset-primary"
        >
          <ChevronRight size={16} />
        </Link>
      </div>

      <p className="mt-3 max-w-[360px] text-[11.5px] leading-[1.7] text-[#849688]">
        {total === 0
          ? "Add your first task today, then keep showing up one small step at a time."
          : remaining === 0
            ? "Every task is done. Take a breath and enjoy the progress you made today."
            : `${remaining} task${remaining === 1 ? "" : "s"} left today. Finish what matters and keep your momentum going.`}
      </p>

      <div className="mt-auto flex items-center gap-2.5 pt-4">
        <span className="text-[10.5px] font-bold text-reset-primary">{completed}/{total} completed</span>
        <div className="h-1 flex-1 overflow-hidden rounded-full bg-[#e9f1ea]">
          <div className="h-full rounded-full bg-reset-primary transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
        <span className="text-[10.5px] font-bold text-[#6f8376]">{pct}%</span>
      </div>
    </section>
  );
}

function StreakCard({ streak, className }) {
  return (
    <section className={cn("card flex h-full flex-col p-4 desktop:p-5", className)}>
      <CardTitle icon={Flame}>Current Streak</CardTitle>
      <div className="mt-3 flex items-end gap-1.5">
        <span className="text-[30px] font-extrabold leading-none tracking-[-1px] text-reset-dark">{streak}</span>
        <span className="pb-0.5 text-[11.5px] font-semibold text-[#6f8376]">days</span>
      </div>
      <p className="mt-auto pt-3 text-[10.5px] leading-4 text-reset-muted">
        {streak > 0 ? "Keep it up! You're doing great!" : "Complete at least one task to start your streak."}
      </p>
    </section>
  );
}

function CompletionCard({ rate, loading, className }) {
  return (
    <section className={cn("card flex h-full flex-col p-4 desktop:p-5", className)}>
      <CardTitle icon={ListChecks}>Completion Rate</CardTitle>
      <div className="mt-auto flex items-center gap-2.5 pt-3">
        <ProgressRing value={loading ? 0 : rate} size={58} stroke={6} trackColor="#e9f1ea" color="#2f8a60">
          <span className="text-[12px] font-extrabold text-reset-dark">{loading ? "..." : `${rate}%`}</span>
        </ProgressRing>
        <div className="min-w-0">
          <p className="text-[10.5px] font-medium text-reset-muted">This Month</p>
          <p className="mt-0.5 flex items-center gap-1 text-[10.5px] font-bold text-reset-primary">
            <TrendingUp size={11} />
            On track
          </p>
        </div>
      </div>
    </section>
  );
}

function TasksCard({ today, pct, onAdd, onEdit, onArchive }) {
  return (
    <section className="card flex h-full flex-col p-4 desktop:p-5">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <h2 className="heading-3">Today&apos;s Tasks</h2>
          <p className="mt-0.5 text-[10.5px] text-reset-muted">
            {today.completedCount}/{today.totalCount} completed
          </p>
        </div>
        <button type="button" onClick={onAdd} className="btn-primary btn-sm !min-h-8 shrink-0 !rounded-[8px] !px-2.5 !text-[11px] flex items-center gap-2">
          <Plus size={13} strokeWidth={2.4} /> Add Task
        </button>
      </div>

      <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-[#e9f1ea]">
        <div className="h-full rounded-full bg-reset-primary transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>

      <div className="mt-2 flex-1 divide-y divide-[#eef3ef]">
        {today.status === "loading" ? (
          <>
            <Skeleton className="my-2 h-8 rounded-lg" />
            <Skeleton className="my-2 h-8 rounded-lg" />
            <Skeleton className="my-2 h-8 rounded-lg" />
          </>
        ) : today.status === "failure" ? (
          <div className="flex flex-col items-center justify-center py-7 text-center">
            <p className="text-[12px] text-reset-muted">{today.error || "Failed to load tasks."}</p>
            <button type="button" onClick={today.load} className="btn-outline btn-sm mt-3">Try again</button>
          </div>
        ) : today.tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-7 text-center">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-reset-primary-soft text-reset-primary">
              <Sprout size={19} />
            </span>
            <p className="mt-2 text-[12px] font-semibold text-reset-dark">No tasks yet</p>
            <p className="mt-0.5 max-w-[190px] text-[10.5px] leading-4 text-reset-muted">
              Add your first daily task and start building momentum.
            </p>
          </div>
        ) : (
          today.tasks.map((item) => (
            <TaskTile
              key={item.task.id}
              item={item}
              isBusy={today.isBusy(item.task.id)}
              onToggle={() => today.toggle(item)}
              onEdit={() => onEdit(item)}
              onArchive={() => onArchive(item)}
            />
          ))
        )}
      </div>

      <Link
        href="/history"
        className="mt-2 inline-flex items-center gap-1 self-start text-[11px] font-bold text-reset-primary transition hover:gap-1.5"
      >
        View all tasks <ArrowRight size={12} />
      </Link>
    </section>
  );
}

function WeeklyProgressCard({ weekly, weeklyTotals, sleepAverage, savings, loading }) {
  return (
    <section className="card flex h-full flex-col p-4 desktop:p-5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="heading-3">Weekly Progress</h2>
        <span className="flex items-center gap-1 text-[10.5px] font-medium text-reset-muted">
          Last 7 days <ChevronDown size={12} />
        </span>
      </div>

      <div className="mt-1 min-h-[158px] flex-1">
        {loading ? (
          <div className="flex h-full items-end gap-2 px-2 pb-6">
            {[54, 78, 42, 88, 64, 96, 72].map((height, index) => (
              <div key={index} className="flex-1 rounded-t-[4px] bg-[#eef4ef]" style={{ height: `${height}%` }} />
            ))}
          </div>
        ) : (
          <WeeklyChart weekly={weekly} />
        )}
      </div>

      <div className="mt-3 grid grid-cols-3 gap-1.5 tablet:gap-2">
        <MiniStatCard icon={ListChecks} label="Tasks Completed" value={`${weeklyTotals.completed}/${weeklyTotals.total}`} />
        <MiniStatCard icon={MoonStar} label="Sleep Avg" value={sleepAverage > 0 ? formatDuration(sleepAverage) : "—"} />
        <MiniStatCard icon={PiggyBank} label="Savings" value={formatRupiah(savings?.balance || 0)} />
      </div>
    </section>
  );
}

function MiniStatCard({ icon: Icon, label, value }) {
  return (
    <div className="min-w-0 rounded-[9px] border border-[#edf2ee] bg-[#fbfdfb] px-2 py-2">
      <div className="flex items-center gap-1 text-[#8a9d8f]">
        <Icon size={10.5} strokeWidth={2} className="shrink-0" />
        <span className="truncate text-[8.5px] font-semibold uppercase tracking-[0.02em]">{label}</span>
      </div>
      <p className="mt-1 truncate text-[12px] font-extrabold tracking-[-0.2px] text-reset-dark">{value}</p>
    </div>
  );
}

function activityTime(value) {
  if (!value) return "Today";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "Today";
  const minutes = Math.max(0, Math.round((Date.now() - date.getTime()) / 60000));
  if (minutes < 2) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

function RecentActivityCard({ today, summary }) {
  const items = [];

  if (today.status !== "loading") {
    [...today.tasks]
      .filter((item) => item.isCompleted)
      .sort((a, b) => (b.completedAt?.getTime?.() || 0) - (a.completedAt?.getTime?.() || 0))
      .slice(0, 3)
      .forEach((item) => {
        items.push({
          icon: Check,
          title: "Task completed",
          subtitle: item.task.title,
          time: activityTime(item.completedAt),
          tone: "green",
        });
      });
  }

  if (summary.latestSleep) {
    const quality = summary.latestSleep.quality;
    items.push({
      icon: MoonStar,
      title: "Sleep record added",
      subtitle: `${formatDuration(summary.latestSleep.durationMinutes)}${quality ? ` · Quality ${quality}/5` : ""}`,
      time: activityTime(summary.latestSleep.sleepDate),
      tone: "blue",
    });
  }

  if (summary.savings?.transactionCount > 0) {
    items.push({
      icon: PiggyBank,
      title: "Savings balance",
      subtitle: formatRupiah(summary.savings.balance),
      time: "All time",
      tone: "amber",
    });
  }

  return (
    <section className="card flex h-full flex-col p-4 desktop:p-5">
      <div className="flex items-center justify-between">
        <h2 className="heading-3">Recent Activity</h2>
        <Link href="/history" className="text-[10.5px] font-semibold text-reset-primary hover:underline">
          View all
        </Link>
      </div>

      {today.status === "loading" ? (
        <div className="mt-3 space-y-2">
          <Skeleton className="h-9 rounded-lg" />
          <Skeleton className="h-9 rounded-lg" />
          <Skeleton className="h-9 rounded-lg" />
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center py-7 text-center">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-reset-primary-soft text-reset-primary">
            <CalendarDays size={17} />
          </span>
          <p className="mt-2 text-[11px] text-reset-muted">Your activity will appear here.</p>
        </div>
      ) : (
        <div className="mt-2 flex flex-1 flex-col justify-center divide-y divide-[#eef3ef]">
          {items.slice(0, 4).map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={`${item.title}-${index}`} className="flex items-center gap-2.5 py-1.5">
                <span
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                    item.tone === "green" && "bg-[#edf8f0] text-reset-primary",
                    item.tone === "blue" && "bg-[#eef3fa] text-[#5b78a8]",
                    item.tone === "amber" && "bg-[#fdf5e9] text-[#b78132]"
                  )}
                >
                  <Icon size={13} strokeWidth={2.1} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[11px] font-semibold text-reset-dark">{item.title}</p>
                  <p className="truncate text-[10px] text-reset-muted">{item.subtitle}</p>
                </div>
                <span className="shrink-0 text-[9.5px] font-medium text-[#a1b0a4]">{item.time}</span>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function YourProgressCard({ range, onRange, data, rate, loading }) {
  return (
    <section className="card flex h-full flex-col p-4 desktop:p-5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="heading-3">Your Progress</h2>
        <div className="flex items-center gap-0.5 rounded-full bg-[#f3f8f3] p-0.5">
          {[
            { key: "7", label: "7 Days" },
            { key: "30", label: "30 Days" },
          ].map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => onRange(option.key)}
              className={cn(
                "rounded-full px-2 py-1 text-[9.5px] font-semibold transition",
                range === option.key
                  ? "bg-white text-reset-primary shadow-[0_1px_3px_rgba(29,58,42,0.08)]"
                  : "text-[#8a9c8f] hover:text-reset-dark"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-1 flex items-end justify-between">
        <p className="text-[10px] font-medium text-reset-muted">Completion Rate</p>
        <p className="text-[21px] font-extrabold tracking-[-0.7px] text-reset-dark">
          {loading ? "..." : `${rate}%`}
        </p>
      </div>

      <div className="mt-1 min-h-[96px] flex-1">
        {loading ? (
          <Skeleton className="h-full min-h-[96px] rounded-[10px]" />
        ) : (
          <ProgressAreaChart data={data} id={`home-progress-${range}`} compact />
        )}
      </div>
    </section>
  );
}
