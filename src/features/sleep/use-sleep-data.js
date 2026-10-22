"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { firstDayOfMonth, localToday } from "@/lib/utils/date";
import { deleteSleepLog, fetchSleepLogs, fetchSleepSummary } from "@/features/sleep/sleep-api";
import { useDataRevision } from "@/lib/data-revision";

export function useSleepData(month) {
  const [logs, setLogs] = useState([]);
  const [summary, setSummary] = useState({ averageMinutes: 0, bestMinutes: 0, worstMinutes: 0, logCount: 0 });
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);
  const [busyIds, setBusyIds] = useState(new Set());
  const { revisions, bump } = useDataRevision();

  const monthYear = useMemo(() => month.getFullYear(), [month]);
  const monthIndex = useMemo(() => month.getMonth(), [month]);

  const load = useCallback(async () => {
    try {
      const from = firstDayOfMonth(month);
      const to = new Date(month.getFullYear(), month.getMonth() + 1, 0);
      const [rows, sum] = await Promise.all([
        fetchSleepLogs({ from, to }), fetchSleepSummary(30).catch(() => null),
      ]);
      setLogs(rows);
      if (sum) setSummary(sum);
      setError(null);
      setStatus("ready");
    } catch (err) {
      setError(err?.message || "Gagal memuat data tidur.");
      setStatus((s) => (logs.length === 0 ? "failure" : s));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monthYear, monthIndex, revisions.sleep]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const remove = useCallback(async (id) => {
    setBusyIds((cur) => new Set(cur).add(id));
    const previous = logs;
    setLogs((cur) => cur.filter((l) => l.id !== id));
    try {
      await deleteSleepLog({ id });
      bump("sleep");
    } catch (err) {
      setLogs(previous);
      throw err;
    } finally {
      setBusyIds((cur) => { const n = new Set(cur); n.delete(id); return n; });
    }
  }, [logs, bump]);

  return {
    logs, summary, status, error, reload: load, remove,
    isBusy: (id) => busyIds.has(id),
    today: localToday(),
  };
}
