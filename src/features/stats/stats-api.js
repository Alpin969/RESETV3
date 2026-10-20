import { createClient } from "@/lib/supabase/client";
import { formatDateParam, localToday, parseDateParam } from "@/lib/utils/date";
import { parseStreak } from "@/features/tasks/tasks-api";

export function parseDailyProgress(row) {
  return {
    day: parseDateParam(row.day) || localToday(),
    completedCount: Number(row.completed_count) || 0,
    totalTasks: Number(row.total_tasks) || 0,
  };
}

export async function fetchDailyProgress({ from, to }) {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("get_daily_progress", {
    p_from: formatDateParam(from), p_to: formatDateParam(to),
  });
  if (error) throw error;
  return (Array.isArray(data) ? data : []).map(parseDailyProgress);
}

export async function fetchStreak() {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("get_streak_stats");
  if (error) throw error;
  const rows = Array.isArray(data) ? data : [];
  return parseStreak(rows[0]);
}
