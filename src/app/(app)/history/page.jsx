"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, CalendarDays, Trophy } from "lucide-react";
import PageContainer from "@/components/ui/page-container";
import Skeleton from "@/components/ui/skeleton";
import EmptyState from "@/components/ui/empty-state";
import MonthCalendar from "@/features/history/month-calendar";
import CompletionRateCard from "@/features/history/completion-rate-card";
import { useHistoryData } from "@/features/history/use-history-data";
import { completionRateForMonth } from "@/features/tasks/tasks-mutations";
import { addMonths, firstDayOfMonth, formatDateParam, isSameDate, localToday } from "@/lib/utils/date";
import { monthTitle, shortDate } from "@/lib/utils/format";

export default function HistoryPage() {
  const [month, setMonth] = useState(() => firstDayOfMonth(localToday()));
  const [selected, setSelected] = useState(() => localToday());
  const { today, tasks, completedByDate, status, error, reload } = useHistoryData(month);

  const rate = useMemo(
    () => completionRateForMonth({ tasks, completedByDate, month, today }),
    [tasks, completedByDate, month, today]
  );

  const canNext = month.getFullYear() < today.getFullYear()
    || (month.getFullYear() === today.getFullYear() && month.getMonth() < today.getMonth());

  if (status === "loading") {
    return (
      <PageContainer>
        <Skeleton className="h-10 w-48 rounded-xl" />
        <Skeleton className="mt-6 h-96 rounded-[var(--radius-card)]" />
      </PageContainer>
    );
  }

  if (status === "failure") {
    return (
      <PageContainer>
        <EmptyState icon={CalendarDays} title="Failed to load history"
          description={error || "Check connection and try again."}
          action={<button type="button" onClick={reload} className="btn-primary btn-sm">Try again</button>} />
      </PageContainer>
    );
  }

  return (
    <PageContainer className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">History</h1>
          <p className="mt-1 body-md text-reset-muted">Your journey, day by day.</p>
        </div>
      </div>

      <div className="card p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <button type="button" aria-label="Previous month" onClick={() => setMonth((m) => addMonths(m, -1))} className="btn-ghost btn-sm">
            <ChevronLeft size={20} />
          </button>
          <h2 className="heading-2">{monthTitle(month)}</h2>
          <button type="button" aria-label="Next month" disabled={!canNext} onClick={() => setMonth((m) => addMonths(m, 1))} className="btn-ghost btn-sm">
            <ChevronRight size={20} />
          </button>
        </div>
        <MonthCalendar month={month} selectedDate={selected} today={today}
          dayMeta={(date) => dayMeta(date, tasks, completedByDate)} onSelect={setSelected} />
      </div>

      <SelectedDayCard selected={selected} today={today} tasks={tasks} completedByDate={completedByDate} />
      
      <div className="mt-4">
        <CompletionRateCard rate={rate} />
      </div>
    </PageContainer>
  );
}

function activeOn(tasks, date) {
  return tasks.filter((t) => {
    const start = new Date(t.startsOn.getFullYear(), t.startsOn.getMonth(), t.startsOn.getDate());
    if (date < start) return false;
    if (!t.archivedOn) return true;
    const arch = new Date(t.archivedOn.getFullYear(), t.archivedOn.getMonth(), t.archivedOn.getDate());
    return date < arch;
  });
}

function dayMeta(date, tasks, completedByDate) {
  const active = activeOn(tasks, date);
  if (active.length === 0) return { hasTasks: false, done: false };
  const done = active.filter((t) => (completedByDate[formatDateParam(date)] || new Set()).has(t.id)).length;
  return { hasTasks: true, done: done >= active.length };
}

function SelectedDayCard({ selected, today, tasks, completedByDate }) {
  const active = activeOn(tasks, selected);
  const doneSet = completedByDate[formatDateParam(selected)] || new Set();
  const done = active.filter((t) => doneSet.has(t.id));

  return (
    <div className="card mt-4 p-6">
      <div className="flex items-center justify-between mb-4">
        <p className="body-sm font-semibold text-reset-muted">
          {isSameDate(selected, today) ? "Today" : shortDate(selected)} • {done.length}/{active.length} completed
        </p>
      </div>
      {active.length === 0 ? (
        <p className="body-md text-reset-muted text-center py-4">No tasks on this date.</p>
      ) : (
        <ul className="space-y-2">
          {active.map((t) => (
            <li key={t.id} className="flex items-center gap-3 p-3 rounded-xl bg-reset-bg hover:bg-reset-primary/5 transition-colors">
              <span className={`flex h-9 w-9 items-center justify-center rounded-full text-[12px] font-bold ${doneSet.has(t.id) ? "bg-reset-primary text-white" : "bg-reset-primary-light text-reset-primary"}`}>
                {doneSet.has(t.id) ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : "•"}
              </span>
              <span className={doneSet.has(t.id) ? "text-reset-muted line-through" : "text-reset-dark"}>{t.title}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}