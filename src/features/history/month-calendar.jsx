"use client";

import { cn } from "@/lib/utils/cn";
import { isSameDate } from "@/lib/utils/date";

const WEEKDAYS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

export default function MonthCalendar({ month, selectedDate, today, dayMeta, onSelect }) {
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const leading = (firstDay.getDay() + 6) % 7;
  const total = leading + daysInMonth;
  const weeks = Math.ceil(total / 7);

  return (
    <div>
      <div className="grid grid-cols-7">
        {WEEKDAYS.map((d) => (
          <p key={d} className="py-1 text-center text-[11.5px] font-semibold text-reset-muted">{d}</p>
        ))}
      </div>
      <div className="mt-1 space-y-0.5">
        {Array.from({ length: weeks }).map((_, week) => (
          <div key={week} className="grid grid-cols-7">
            {Array.from({ length: 7 }).map((__, slot) => {
              const dayNum = week * 7 + slot - leading + 1;
              if (dayNum < 1 || dayNum > daysInMonth) return <div key={slot} className="h-[52px]" />;
              const date = new Date(month.getFullYear(), month.getMonth(), dayNum);
              const selected = selectedDate && isSameDate(date, selectedDate);
              const isToday = isSameDate(date, today);
              const meta = dayMeta ? dayMeta(date) : null;
              return (
                <div key={slot} className="p-[3px]">
                  <button type="button" onClick={() => onSelect(date)}
                    className={cn(
                      "flex h-[46px] w-full flex-col items-center justify-center gap-0.5 rounded-[14px] border transition",
                      selected ? "border-reset-primary bg-reset-primary text-white"
                        : isToday ? "border-reset-primary bg-white text-reset-dark"
                        : "border-reset-border bg-white text-reset-dark hover:border-reset-primary/50"
                    )}>
                    <span className={cn("text-[13px]", (selected || isToday) ? "font-bold" : "font-medium")}>{dayNum}</span>
                    {meta && meta.hasTasks ? (
                      <span className={cn("h-1.5 w-1.5 rounded-full",
                        selected ? "bg-white" : meta.done ? "bg-reset-primary" : "bg-[#F0A22E]")} />
                    ) : null}
                  </button>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
