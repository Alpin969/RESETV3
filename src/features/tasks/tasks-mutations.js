import { formatDateParam, localToday } from "@/lib/utils/date";
import { createTask, fetchActiveTasks, fetchArchivedTasks, parseChecklist, parseStreak, parseTask, TASK_COLUMNS } from "./tasks-api";
import { createClient } from "@/lib/supabase/client";

export { createTask, fetchActiveTasks, fetchArchivedTasks };

export async function updateTask({ id, title, notes }) {
  const supabase = createClient();
  const clean = String(notes || "").trim();
  const { data, error } = await supabase.from("user_tasks")
    .update({ title: String(title || "").trim(), notes: clean ? clean : null })
    .eq("id", id).select(TASK_COLUMNS).single();
  if (error) throw error;
  return parseTask(data);
}

export async function archiveTask({ id, archivedOn }) {
  const supabase = createClient();
  const { error } = await supabase.from("user_tasks")
    .update({ archived_on: formatDateParam(archivedOn || localToday()) }).eq("id", id);
  if (error) throw error;
}

export async function restoreTask({ id }) {
  const supabase = createClient();
  const { error } = await supabase.from("user_tasks")
    .update({ archived_on: null }).eq("id", id);
  if (error) throw error;
}

export async function deleteTask({ id }) {
  const supabase = createClient();
  const { error } = await supabase.from("user_tasks").delete().eq("id", id);
  if (error) throw error;
}

export async function fetchChecklists({ from, to }) {
  const supabase = createClient();
  const { data, error } = await supabase.from("daily_task_checklists")
    .select("task_id, task_date, is_completed, completed_at")
    .gte("task_date", formatDateParam(from)).lte("task_date", formatDateParam(to));
  if (error) throw error;
  return (data || []).map((row) => parseChecklist(row, from));
}

export async function completeTask({ taskId, date }) {
  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) throw new Error("Sesi login tidak ditemukan. Silakan login ulang.");
  const { error } = await supabase.from("daily_task_checklists").upsert({
    user_id: auth.user.id, task_id: taskId, task_date: formatDateParam(date),
    is_completed: true, completed_at: new Date().toISOString(),
  }, { onConflict: "task_id,task_date" });
  if (error) throw error;
}

export async function uncompleteTask({ taskId, date }) {
  const supabase = createClient();
  const { error } = await supabase.from("daily_task_checklists").delete()
    .eq("task_id", taskId).eq("task_date", formatDateParam(date));
  if (error) throw error;
}

export async function fetchStreakStats() {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("get_streak_stats");
  if (error) throw error;
  const rows = Array.isArray(data) ? data : [];
  return parseStreak(rows[0]);
}

export function completionRateForMonth({ tasks, completedByDate, month, today }) {
  const lastDayOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const isCurrent = month.getFullYear() === today.getFullYear() && month.getMonth() === today.getMonth();
  const lastDay = isCurrent ? today.getDate() : lastDayOfMonth;
  let penalty = 0;
  for (let day = 1; day <= lastDay; day += 1) {
    const date = new Date(month.getFullYear(), month.getMonth(), day);
    const start = (t) => new Date(t.startsOn.getFullYear(), t.startsOn.getMonth(), t.startsOn.getDate());
    const active = tasks.filter((t) => {
      if (date < start(t)) return false;
      if (!t.archivedOn) return true;
      const arch = new Date(t.archivedOn.getFullYear(), t.archivedOn.getMonth(), t.archivedOn.getDate());
      return date < arch;
    });
    if (active.length === 0) continue;
    const done = active.filter((t) => (completedByDate[formatDateParam(date)] || new Set()).has(t.id)).length;
    penalty += done === 0 ? 3 : active.length - done;
  }
  return Math.max(0, 100 - penalty);
}
