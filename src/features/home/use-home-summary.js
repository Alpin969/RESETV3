"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchLatestSleep, fetchSleepSummary } from "@/features/sleep/sleep-api";
import { fetchSavingsSummary } from "@/features/savings/savings-api";
import { fetchDailyProgress } from "@/features/stats/stats-api";
import { addDays, localToday, formatDateParam } from "@/lib/utils/date";
import { useDataRevision } from "@/lib/data-revision";

export function useHomeSummary() {
  const [latestSleep, setLatestSleep] = useState(null);
  const [sleepAverage, setSleepAverage] = useState(0);
  const [savings, setSavings] = useState({ totalDeposits: 0, totalWithdrawals: 0, balance: 0, transactionCount: 0 });
  const [progress30, setProgress30] = useState([]);
  const [weeklyProgress, setWeeklyProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const { revisions } = useDataRevision();

  const load = useCallback(async () => {
    try {
      const today = localToday();
      const monthAgo = addDays(today, -29);

      const [latest, week, save, progress] = await Promise.all([
        fetchLatestSleep().catch(() => null),
        fetchSleepSummary(7).catch(() => ({ averageMinutes: 0 })),
        fetchSavingsSummary().catch(() => null),
        fetchDailyProgress({ from: monthAgo, to: today }).catch(() => []),
      ]);

      setLatestSleep(latest);
      setSleepAverage(Number(week?.averageMinutes) || 0);
      if (save) setSavings(save);

      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const days = Array.from({ length: 30 }, (_, index) => {
        const date = addDays(monthAgo, index);
        const dayStr = formatDateParam(date);
        const dayData = progress.find((p) => formatDateParam(p.day) === dayStr);
        return {
          date,
          name: dayNames[date.getDay()],
          completed: dayData?.completedCount || 0,
          total: dayData?.totalTasks || 0,
        };
      });

      setProgress30(days);
      setWeeklyProgress(days.slice(-7));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load, revisions.sleep, revisions.savings, revisions.tasks]);

  return { latestSleep, sleepAverage, savings, weeklyProgress, progress30, loading, reload: load };
}
