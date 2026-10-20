import { createClient } from "@/lib/supabase/client";
import { deviceTimezone } from "@/lib/utils/timezones";

export function parseReminder(row) {
  const rawDays = Array.isArray(row.days_of_week) ? row.days_of_week : [1,2,3,4,5,6,7];
  const days = new Set(rawDays.map(Number).filter((d) => d >= 1 && d <= 7));
  const timeRaw = String(row.reminder_time || "07:00:00");
  const [h, m] = timeRaw.split(":").map(Number);
  return {
    id: row.id,
    title: String(row.title || "").trim(),
    body: row.body ? String(row.body).trim() || null : null,
    time: `${String(h || 0).padStart(2, "0")}:${String(m || 0).padStart(2, "0")}`,
    daysOfWeek: days.size > 0 ? days : new Set([1,2,3,4,5,6,7]),
    isEnabled: row.is_enabled ?? true,
    timezone: row.timezone || "UTC",
  };
}

export function reminderDaysLabel(days) {
  const list = [...days].sort((a, b) => a - b);
  if (list.length === 7) return "Setiap hari";
  const names = { 1: "Sen", 2: "Sel", 3: "Rab", 4: "Kam", 5: "Jum", 6: "Sab", 7: "Min" };
  return list.map((d) => names[d]).join(", ");
}

async function requireUserId(supabase) {
  const { data } = await supabase.auth.getUser();
  if (!data?.user) throw new Error("Sesi login tidak ditemukan. Silakan login ulang.");
  return data.user.id;
}

export async function fetchReminders() {
  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth?.user?.id;
  if (!userId) throw new Error("Sesi login tidak ditemukan. Silakan login ulang.");
  const { data, error } = await supabase.from("reminders").select("*")
    .eq("user_id", userId).order("reminder_time", { ascending: true });
  if (error) throw error;
  return (data || []).map(parseReminder);
}

export async function createReminder({ title, body, time, daysOfWeek }) {
  const supabase = createClient();
  const userId = await requireUserId(supabase);
  const cleanBody = String(body || "").trim();
  const sorted = [...daysOfWeek].sort((a, b) => a - b);
  const { error } = await supabase.from("reminders").insert({
    user_id: userId, title: String(title || "").trim(),
    body: cleanBody ? cleanBody : null,
    reminder_time: `${time}:00`, days_of_week: sorted,
    timezone: deviceTimezone(), is_enabled: true,
  });
  if (error) throw error;
}

export async function updateReminder({ id, title, body, time, daysOfWeek }) {
  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth?.user?.id;
  const cleanBody = String(body || "").trim();
  const sorted = [...daysOfWeek].sort((a, b) => a - b);
  const { error } = await supabase.from("reminders").update({
    title: String(title || "").trim(), body: cleanBody ? cleanBody : null,
    reminder_time: `${time}:00`, days_of_week: sorted, timezone: deviceTimezone(),
  }).eq("id", id).eq("user_id", userId);
  if (error) throw error;
}

export async function setReminderEnabled({ id, isEnabled }) {
  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  const { error } = await supabase.from("reminders").update({ is_enabled: isEnabled })
    .eq("id", id).eq("user_id", auth?.user?.id);
  if (error) throw error;
}

export async function deleteReminder({ id }) {
  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  const { error } = await supabase.from("reminders").delete()
    .eq("id", id).eq("user_id", auth?.user?.id);
  if (error) throw error;
}
