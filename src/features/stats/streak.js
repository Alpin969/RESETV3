import { createClient } from "@/lib/supabase/client";
import { formatDateParam, localToday, parseDateParam } from "@/lib/utils/date";

const EMPTY_STREAK = {
  currentStreak: 0,
  longestStreak: 0,
  totalSuccessDays: 0,
  lastSuccessDate: null,
};

export function emptyStreakStats() {
  return { ...EMPTY_STREAK };
}

function toDay(value) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  }
  return parseDateParam(value);
}

function dayDistance(from, to) {
  return Math.round((to.getTime() - from.getTime()) / 86400000);
}

export function computeStreakStats(progress, today = localToday()) {
  const todayDay = toDay(today) || localToday();
  const byDate = new Map();

  for (const row of Array.isArray(progress) ? progress : []) {
    const day = toDay(row?.day);
    if (!day) continue;
    const key = formatDateParam(day);
    const completedCount = Number(row.completedCount ?? row.completed_count) || 0;
    const totalTasks = Number(row.totalTasks ?? row.total_tasks) || 0;
    const existing = byDate.get(key);
    if (existing) {
      existing.completedCount = Math.max(existing.completedCount, completedCount);
      existing.totalTasks = Math.max(existing.totalTasks, totalTasks);
    } else {
      byDate.set(key, { day, completedCount, totalTasks });
    }
  }

  const days = [...byDate.values()].sort((a, b) => a.day - b.day);
  let currentRun = 0;
  let lastRunLength = 0;
  let longestStreak = 0;
  let totalSuccessDays = 0;
  let lastSuccessDate = null;
  let previousDay = null;

  for (const row of days) {
    const isSuccess = row.totalTasks > 0 && row.completedCount > 0;
    if (isSuccess) {
      totalSuccessDays += 1;
      lastSuccessDate = row.day;
      currentRun = previousDay && dayDistance(previousDay, row.day) === 1
        ? currentRun + 1
        : 1;
      lastRunLength = currentRun;
      if (currentRun > longestStreak) longestStreak = currentRun;
    } else {
      currentRun = 0;
    }
    previousDay = row.day;
  }

  const distanceFromToday = lastSuccessDate ? dayDistance(lastSuccessDate, todayDay) : null;
  const currentStreak = distanceFromToday !== null && distanceFromToday >= 0 && distanceFromToday <= 1
    ? lastRunLength
    : 0;

  return {
    currentStreak,
    longestStreak,
    totalSuccessDays,
    lastSuccessDate,
  };
}

async function fetchEarliestTaskDay(supabase) {
  const { data, error } = await supabase.from("user_tasks")
    .select("starts_on").order("starts_on", { ascending: true }).limit(1);
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  return parseDateParam(row?.starts_on);
}

export async function fetchStreakStats() {
  const supabase = createClient();
  const today = localToday();
  const from = await fetchEarliestTaskDay(supabase);

  if (!from || from > today) return emptyStreakStats();

  const { data, error } = await supabase.rpc("get_daily_progress", {
    p_from: formatDateParam(from),
    p_to: formatDateParam(today),
  });
  if (error) throw error;

  const progress = (Array.isArray(data) ? data : []).map((row) => ({
    day: parseDateParam(row.day),
    completedCount: Number(row.completed_count) || 0,
    totalTasks: Number(row.total_tasks) || 0,
  }));

  return computeStreakStats(progress, today);
}
