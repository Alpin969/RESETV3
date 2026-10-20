"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, History as HistoryIcon } from "lucide-react";
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
    return (<PageContainer><Skeleton className="h-9 w-48 rounded-xl" /><Skeleton className="mt-4 h-[420px] rounded-[20px]" /></PageContainer>);
  }
  if (status === "failure") {
    return (<PageContainer><EmptyState icon={HistoryIcon} title="Gagal memuat riwayat"
      description={error || "Periksa koneksi lalu coba lagi."}
      action={<button type="button" onClick={reload} className="btn-primary btn-sm">Coba lagi</button>} /></PageContainer>);
  }

  return (
    <PageContainer className="max-w-3xl">
      <h1 className="page-title">History</h1>
      <p className="muted mt-1 text-[14px]">Your journey, day by day.</p>
      <div className="card mt-5 p-5 tablet:p-6">
        <MonthNav month={month} canNext={canNext} onPrev={() => setMonth((m) => addMonths(m, -1))} onNext={() => setMonth((m) => addMonths(m, 1))} />
        <MonthCalendar month={month} selectedDate={selected} today={today}
          dayMeta={(date) => dayMeta(date, tasks, completedByDate)} onSelect={setSelected} />
      </div>
      <SelectedDayCard selected={selected} today={today} tasks={tasks} completedByDate={completedByDate} />
      <div className="mt-4"><CompletionRateCard rate={rate} /></div>
    </PageContainer>
  );
}

function MonthNav({ month, canNext, onPrev, onNext }) {
  const btn = "flex h-9 w-9 items-center justify-center rounded-full border border-reset-border text-reset-dark hover:bg-reset-bg disabled:opacity-40";
  return (
    <div className="mb-4 flex items-center justify-between">
      <button type="button" aria-label="Bulan sebelumnya" onClick={onPrev} className={btn}><ChevronLeft size={18} /></button>
      <p className="text-[15px] font-bold text-reset-dark">{monthTitle(month)}</p>
      <button type="button" aria-label="Bulan berikutnya" disabled={!canNext} onClick={onNext} className={btn}><ChevronRight size={18} /></button>
    </div>
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
    <div className="card mt-4 p-5">
      <p className="text-[13px] font-semibold text-reset-muted">
        {isSameDate(selected, today) ? "Hari ini" : shortDate(selected)} • {done.length}/{active.length} selesai
      </p>
      {active.length === 0 ? (
        <p className="mt-2 text-[14px] text-reset-muted">Tidak ada task pada tanggal ini.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {active.map((t) => (
            <li key={t.id} className="flex items-center gap-2.5 text-[14px]">
              <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold ${doneSet.has(t.id) ? "bg-reset-primary text-white" : "bg-reset-soft text-reset-primary"}`}>
                {doneSet.has(t.id) ? "✓" : "•"}
              </span>
              <span className={doneSet.has(t.id) ? "text-reset-muted line-through" : "text-reset-dark"}>{t.title}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
