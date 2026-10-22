"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchActiveTasks, fetchArchivedTasks } from "@/features/tasks/tasks-api";
import { fetchChecklists } from "@/features/tasks/tasks-mutations";
import { firstDayOfMonth, formatDateParam, localToday } from "@/lib/utils/date";
import { useDataRevision } from "@/lib/data-revision";

export function useHistoryData(month) {
  const [today] = useState(() => localToday());
  const [tasks, setTasks] = useState([]);
  const [completedByDate, setCompletedByDate] = useState({});
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);
  const { revisions } = useDataRevision();

  const monthYear = useMemo(() => month.getFullYear(), [month]);
  const monthIndex = useMemo(() => month.getMonth(), [month]);

  const load = useCallback(async () => {
    try {
      const from = firstDayOfMonth(month);
      const to = new Date(month.getFullYear(), month.getMonth() + 1, 0);
      const [active, archived, checks] = await Promise.all([
        fetchActiveTasks(), fetchArchivedTasks(), fetchChecklists({ from, to }),
      ]);
      const map = {};
      for (const c of checks) {
        if (!c.isCompleted) continue;
        const key = formatDateParam(c.taskDate);
        if (!map[key]) map[key] = new Set();
        map[key].add(c.taskId);
      }
      setTasks([...active, ...archived]);
      setCompletedByDate(map);
      setError(null);
      setStatus("ready");
    } catch (err) {
      setError(err?.message || "Gagal memuat riwayat.");
      setStatus((s) => (tasks.length === 0 ? "failure" : s));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monthYear, monthIndex, revisions.tasks]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  return { today, tasks, completedByDate, status, error, reload: load };
}
