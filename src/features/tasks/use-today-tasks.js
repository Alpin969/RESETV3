"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { localToday } from "@/lib/utils/date";
import {
  archiveTask as apiArchive, completeTask as apiComplete, createTask as apiCreate,
  deleteTask as apiDelete, fetchActiveTasks, fetchChecklists,
  fetchStreakStats, restoreTask as apiRestore, uncompleteTask as apiUncomplete,
  updateTask as apiUpdate,
} from "@/features/tasks/tasks-mutations";
import { useDataRevision } from "@/lib/data-revision";

export function useTodayTasks() {
  const [tasks, setTasks] = useState([]);
  const [streak, setStreak] = useState({ currentStreak: 0, longestStreak: 0, totalSuccessDays: 0, lastSuccessDate: null });
  const [today, setToday] = useState(() => localToday());
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);
  const [busyIds, setBusyIds] = useState(new Set());
  const [saving, setSaving] = useState(false);
  const { revisions, bump } = useDataRevision();
  const tasksRevision = revisions.tasks;
  const firstLoad = useRef(true);

  const load = useCallback(async () => {
    const day = localToday();
    setToday(day);
    setStatus((s) => (s === "ready" ? s : "loading"));
    try {
      const [active, checks, stats] = await Promise.all([
        fetchActiveTasks(),
        fetchChecklists({ from: day, to: day }),
        fetchStreakStats().catch(() => ({ currentStreak: 0, longestStreak: 0, totalSuccessDays: 0, lastSuccessDate: null })),
      ]);
      const completed = new Set(checks.filter((c) => c.isCompleted).map((c) => c.taskId));
      const start = (t) => new Date(t.startsOn.getFullYear(), t.startsOn.getMonth(), t.startsOn.getDate());
      setTasks(active.filter((t) => day >= start(t)).map((t) => ({ task: t, isCompleted: completed.has(t.id) })));
      setStreak(stats);
      setError(null);
      setStatus("ready");
    } catch (err) {
      setError(err?.message || "Gagal memuat data hari ini.");
      setStatus((s) => (tasks.length === 0 ? "failure" : s));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (firstLoad.current) { firstLoad.current = false; load(); return; }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasksRevision]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase.channel("today-tasks-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "daily_task_checklists" }, () => load())
      .on("postgres_changes", { event: "*", schema: "public", table: "user_tasks" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggle = useCallback(async (item) => {
    const id = item.task.id;
    if (busyIds.has(id)) return;
    const target = !item.isCompleted;
    const previous = tasks;
    setTasks((cur) => cur.map((t) => (t.task.id === id ? { ...t, isCompleted: target } : t)));
    setBusyIds((cur) => new Set(cur).add(id));
    try {
      if (target) await apiComplete({ taskId: id, date: today });
      else await apiUncomplete({ taskId: id, date: today });
      fetchStreakStats().then(setStreak).catch(() => {});
      bump("tasks");
    } catch (err) {
      setTasks(previous);
      setError(err?.message || "Gagal menyimpan perubahan.");
    } finally {
      setBusyIds((cur) => { const next = new Set(cur); next.delete(id); return next; });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busyIds, tasks, today]);

  const addTask = useCallback(async ({ title, notes }) => {
    setSaving(true);
    try {
      const created = await apiCreate({ title, notes, startsOn: today, sortOrder: tasks.length });
      setTasks((cur) => [...cur, { task: created, isCompleted: false }]);
      fetchStreakStats().then(setStreak).catch(() => {});
      bump("tasks");
    } finally { setSaving(false); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks.length, today]);

  const editTask = useCallback(async ({ id, title, notes }) => {
    setSaving(true);
    try {
      const updated = await apiUpdate({ id, title, notes });
      setTasks((cur) => cur.map((t) => (t.task.id === id ? { task: updated, isCompleted: t.isCompleted } : t)));
      bump("tasks");
    } finally { setSaving(false); }
  }, []);

  const archive = useCallback(async (id) => {
    setBusyIds((cur) => new Set(cur).add(id));
    try {
      await apiArchive({ id, archivedOn: today });
      setTasks((cur) => cur.filter((t) => t.task.id !== id));
      fetchStreakStats().then(setStreak).catch(() => {});
      bump("tasks");
    } finally {
      setBusyIds((cur) => { const next = new Set(cur); next.delete(id); return next; });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [today]);

  const remove = useCallback(async (id) => {
    setBusyIds((cur) => new Set(cur).add(id));
    try {
      await apiDelete({ id });
      setTasks((cur) => cur.filter((t) => t.task.id !== id));
      bump("tasks");
    } finally {
      setBusyIds((cur) => { const next = new Set(cur); next.delete(id); return next; });
    }
  }, []);

  const restore = useCallback(async (id) => {
    await apiRestore({ id });
    bump("tasks");
    load();
  }, [load]);

  const completedCount = tasks.filter((t) => t.isCompleted).length;
  return {
    tasks, streak, today, status, error, busyIds, saving,
    totalCount: tasks.length, completedCount,
    hasTasks: tasks.length > 0,
    progress: tasks.length === 0 ? 0 : completedCount / tasks.length,
    isBusy: (id) => busyIds.has(id),
    load, toggle, addTask, editTask, archive, remove, restore, setError,
  };
}
