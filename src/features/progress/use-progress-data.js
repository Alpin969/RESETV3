"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchDailyProgress, fetchStreak } from "@/features/stats/stats-api";
import { fetchSleepSummary } from "@/features/sleep/sleep-api";
import { fetchSavingsSummary } from "@/features/savings/savings-api";
import { addDays, localToday } from "@/lib/utils/date";
import { useDataRevision } from "@/lib/data-revision";

export function useProgressData() {
  const [today] = useState(() => localToday());
  const [monthly, setMonthly] = useState([]);
  const [streak, setStreak] = useState({ currentStreak: 0, longestStreak: 0, totalSuccessDays: 0, lastSuccessDate: null });
  const [sleep, setSleep] = useState({ averageMinutes: 0, bestMinutes: 0, worstMinutes: 0, logCount: 0 });
  const [savings, setSavings] = useState({ totalDeposits: 0, totalWithdrawals: 0, balance: 0, transactionCount: 0 });
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);
  const { revisions } = useDataRevision();

  const load = useCallback(async () => {
    const to = localToday();
    const from = addDays(to, -29);
    try {
      const [progress, streakStats, sleepSummary, savingsSummary] = await Promise.all([
        fetchDailyProgress({ from, to }),
        fetchStreak().catch(() => null),
        fetchSleepSummary(30).catch(() => null),
        fetchSavingsSummary().catch(() => null),
      ]);
      setMonthly(progress);
      if (streakStats) setStreak(streakStats);
      if (sleepSummary) setSleep(sleepSummary);
      if (savingsSummary) setSavings(savingsSummary);
      setError(null);
      setStatus("ready");
    } catch (err) {
      setError(err?.message || "Gagal memuat statistik.");
      setStatus((s) => (monthly.length === 0 ? "failure" : s));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revisions.tasks, revisions.sleep, revisions.savings]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const weekly = monthly.filter((p) => {
    const from = addDays(today, -6);
    return p.day >= from && p.day <= today;
  });
  const trackedDays = monthly.filter((p) => p.totalTasks > 0).length;
  const successDays = monthly.filter((p) => p.totalTasks > 0 && p.completedCount >= p.totalTasks).length;

  return {
    today, monthly, weekly, streak, sleep, savings, status, error, reload: load,
    trackedDays, successDays,
    completionRate: trackedDays === 0 ? 0 : successDays / trackedDays,
  };
}
