"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchLatestSleep, fetchSleepSummary } from "@/features/sleep/sleep-api";
import { fetchSavingsSummary } from "@/features/savings/savings-api";
import { useDataRevision } from "@/lib/data-revision";

export function useHomeSummary() {
  const [latestSleep, setLatestSleep] = useState(null);
  const [sleepAverage, setSleepAverage] = useState(0);
  const [savings, setSavings] = useState({ totalDeposits: 0, totalWithdrawals: 0, balance: 0, transactionCount: 0 });
  const [loading, setLoading] = useState(true);
  const { revisions } = useDataRevision();

  const load = useCallback(async () => {
    try {
      const [latest, week, save] = await Promise.all([
        fetchLatestSleep().catch(() => null),
        fetchSleepSummary(7).catch(() => ({ averageMinutes: 0 })),
        fetchSavingsSummary().catch(() => null),
      ]);
      setLatestSleep(latest);
      setSleepAverage(Number(week?.averageMinutes) || 0);
      if (save) setSavings(save);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load, revisions.sleep, revisions.savings]);

  return { latestSleep, sleepAverage, savings, loading, reload: load };
}
