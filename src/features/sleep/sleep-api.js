import { createClient } from "@/lib/supabase/client";
import { formatDateParam, localToday, parseDateParam, parseTimestamp } from "@/lib/utils/date";

export const SLEEP_COLUMNS = "id, sleep_date, bed_time, wake_time, duration_minutes, quality, notes";

export function parseSleepLog(row) {
  return {
    id: row.id,
    sleepDate: parseDateParam(row.sleep_date) || localToday(),
    bedTime: parseTimestamp(row.bed_time) || new Date(),
    wakeTime: parseTimestamp(row.wake_time) || new Date(),
    durationMinutes: Number(row.duration_minutes) || 0,
    quality: row.quality == null ? null : Number(row.quality),
    notes: row.notes || null,
  };
}

export function parseSleepSummary(row) {
  if (!row) return { averageMinutes: 0, bestMinutes: 0, worstMinutes: 0, logCount: 0 };
  return {
    averageMinutes: Number(row.average_minutes) || 0,
    bestMinutes: Number(row.best_minutes) || 0,
    worstMinutes: Number(row.worst_minutes) || 0,
    logCount: Number(row.log_count) || 0,
  };
}

export function resolveSleepTimes({ sleepDate, bedHour, bedMinute, wakeHour, wakeMinute }) {
  const day = new Date(sleepDate.getFullYear(), sleepDate.getMonth(), sleepDate.getDate());
  const wakeTime = new Date(day.getFullYear(), day.getMonth(), day.getDate(), wakeHour, wakeMinute);
  let bedTime = new Date(day.getFullYear(), day.getMonth(), day.getDate(), bedHour, bedMinute);
  if (!(bedTime < wakeTime)) bedTime = new Date(bedTime.getTime() - 86400000);
  return { bedTime, wakeTime };
}

async function requireUserId(supabase) {
  const { data } = await supabase.auth.getUser();
  if (!data?.user) throw new Error("Sesi login tidak ditemukan. Silakan login ulang.");
  return data.user.id;
}

export async function fetchSleepLogs({ from, to }) {
  const supabase = createClient();
  const { data, error } = await supabase.from("sleep_logs").select(SLEEP_COLUMNS)
    .gte("sleep_date", formatDateParam(from)).lte("sleep_date", formatDateParam(to))
    .order("sleep_date", { ascending: false });
  if (error) throw error;
  return (data || []).map(parseSleepLog);
}

export async function fetchLatestSleep() {
  const supabase = createClient();
  const { data, error } = await supabase.from("sleep_logs").select(SLEEP_COLUMNS)
    .order("sleep_date", { ascending: false }).limit(1).maybeSingle();
  if (error) throw error;
  return data ? parseSleepLog(data) : null;
}

export async function fetchSleepSummary(days = 30) {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("get_sleep_summary", { p_days: days });
  if (error) throw error;
  const rows = Array.isArray(data) ? data : [];
  return parseSleepSummary(rows[0]);
}

export async function createSleepLog({ sleepDate, bedTime, wakeTime, quality, notes }) {
  const supabase = createClient();
  const userId = await requireUserId(supabase);
  const clean = String(notes || "").trim();
  const { data, error } = await supabase.from("sleep_logs").insert({
    user_id: userId, sleep_date: formatDateParam(sleepDate),
    bed_time: bedTime.toISOString(), wake_time: wakeTime.toISOString(),
    quality: quality || null, notes: clean ? clean : null,
  }).select(SLEEP_COLUMNS).single();
  if (error) throw error;
  return parseSleepLog(data);
}

export async function updateSleepLog({ id, sleepDate, bedTime, wakeTime, quality, notes }) {
  const supabase = createClient();
  const clean = String(notes || "").trim();
  const { data, error } = await supabase.from("sleep_logs").update({
    sleep_date: formatDateParam(sleepDate),
    bed_time: bedTime.toISOString(), wake_time: wakeTime.toISOString(),
    quality: quality || null, notes: clean ? clean : null,
  }).eq("id", id).select(SLEEP_COLUMNS).single();
  if (error) throw error;
  return parseSleepLog(data);
}

export async function deleteSleepLog({ id }) {
  const supabase = createClient();
  const { error } = await supabase.from("sleep_logs").delete().eq("id", id);
  if (error) throw error;
}
