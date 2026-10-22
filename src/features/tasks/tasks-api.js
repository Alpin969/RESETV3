import { createClient } from "@/lib/supabase/client";
import { formatDateParam, localToday, parseDateParam } from "@/lib/utils/date";

export const TASK_COLUMNS = "id, title, notes, sort_order, starts_on, archived_on";

export function parseTask(row) {
  return {
    id: row.id,
    title: row.title || "",
    notes: row.notes || null,
    sortOrder: Number(row.sort_order) || 0,
    startsOn: parseDateParam(row.starts_on) || localToday(),
    archivedOn: parseDateParam(row.archived_on),
  };
}

export function parseChecklist(row, fallbackDate) {
  return {
    taskId: row.task_id,
    taskDate: parseDateParam(row.task_date) || fallbackDate,
    isCompleted: row.is_completed ?? true,
    completedAt: row.completed_at ? new Date(row.completed_at) : null,
  };
}

export function parseStreak(row) {
  if (!row) return { currentStreak: 0, longestStreak: 0, totalSuccessDays: 0, lastSuccessDate: null };
  return {
    currentStreak: Number(row.current_streak) || 0,
    longestStreak: Number(row.longest_streak) || 0,
    totalSuccessDays: Number(row.total_success_days) || 0,
    lastSuccessDate: parseDateParam(row.last_success_date),
  };
}

async function requireUserId(supabase) {
  const { data } = await supabase.auth.getUser();
  if (!data?.user) throw new Error("Sesi login tidak ditemukan. Silakan login ulang.");
  return data.user.id;
}

export async function fetchActiveTasks() {
  const supabase = createClient();
  const { data, error } = await supabase.from("user_tasks").select(TASK_COLUMNS)
    .is("archived_on", null).order("sort_order").order("created_at");
  if (error) throw error;
  return (data || []).map(parseTask);
}

export async function fetchArchivedTasks() {
  const supabase = createClient();
  const { data, error } = await supabase.from("user_tasks").select(TASK_COLUMNS)
    .not("archived_on", "is", null).order("archived_on", { ascending: false });
  if (error) throw error;
  return (data || []).map(parseTask);
}

export async function createTask({ title, notes, startsOn, sortOrder }) {
  const supabase = createClient();
  const userId = await requireUserId(supabase);
  const clean = String(notes || "").trim();
  const { data, error } = await supabase.from("user_tasks").insert({
    user_id: userId, title: String(title || "").trim(),
    notes: clean ? clean : null, sort_order: Number(sortOrder) || 0,
    starts_on: formatDateParam(startsOn || localToday()),
  }).select(TASK_COLUMNS).single();
  if (error) throw error;
  return parseTask(data);
}
