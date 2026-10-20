import { createClient } from "@/lib/supabase/client";

export async function updateProfile({ username, timezone }) {
  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth?.user?.id;
  if (!userId) throw new Error("Sesi login tidak ditemukan. Silakan login ulang.");
  const payload = {};
  if (username !== undefined) payload.username = String(username).trim();
  if (timezone !== undefined) payload.timezone = timezone;
  const { data, error } = await supabase.from("profiles").update(payload).eq("id", userId)
    .select("id, username, avatar_url, timezone").single();
  if (error) throw error;
  return data;
}

export async function uploadAvatar(file) {
  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth?.user?.id;
  if (!userId) throw new Error("Sesi login tidak ditemukan. Silakan login ulang.");
  const ext = String(file.name || "jpg").split(".").pop().toLowerCase().slice(0, 4) || "jpg";
  const path = `${userId}/avatar-${Date.now()}.${ext}`;
  const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, {
    cacheControl: "3600", upsert: true, contentType: file.type || "image/jpeg",
  });
  if (uploadError) throw uploadError;
  const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
  const publicUrl = urlData?.publicUrl;
  if (!publicUrl) throw new Error("Gagal mendapatkan URL avatar.");
  const { data, error } = await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("id", userId)
    .select("id, username, avatar_url, timezone").single();
  if (error) throw error;
  return data;
}

export function parseNotificationPreferences(row) {
  if (!row) {
    return {
      pushEnabled: true, reminderEnabled: true, sleepReminderEnabled: false,
      savingsReminderEnabled: false, dailySummaryEnabled: false,
      quietHoursStart: null, quietHoursEnd: null,
    };
  }
  return {
    pushEnabled: row.push_enabled ?? true,
    reminderEnabled: row.reminder_enabled ?? true,
    sleepReminderEnabled: row.sleep_reminder_enabled ?? false,
    savingsReminderEnabled: row.savings_reminder_enabled ?? false,
    dailySummaryEnabled: row.daily_summary_enabled ?? false,
    quietHoursStart: row.quiet_hours_start ? String(row.quiet_hours_start).slice(0, 5) : null,
    quietHoursEnd: row.quiet_hours_end ? String(row.quiet_hours_end).slice(0, 5) : null,
  };
}

export function toNotificationRow(prefs) {
  return {
    push_enabled: prefs.pushEnabled,
    reminder_enabled: prefs.reminderEnabled,
    sleep_reminder_enabled: prefs.sleepReminderEnabled,
    savings_reminder_enabled: prefs.savingsReminderEnabled,
    daily_summary_enabled: prefs.dailySummaryEnabled,
    quiet_hours_start: prefs.quietHoursStart ? `${prefs.quietHoursStart}:00` : null,
    quiet_hours_end: prefs.quietHoursEnd ? `${prefs.quietHoursEnd}:00` : null,
  };
}

export async function fetchNotificationPreferences() {
  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth?.user?.id;
  if (!userId) throw new Error("Sesi login tidak ditemukan. Silakan login ulang.");
  const { data, error } = await supabase.from("notification_preferences").select("*").eq("user_id", userId).maybeSingle();
  if (error) throw error;
  return parseNotificationPreferences(data);
}

export async function saveNotificationPreferences(prefs) {
  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth?.user?.id;
  if (!userId) throw new Error("Sesi login tidak ditemukan. Silakan login ulang.");
  const { error } = await supabase.from("notification_preferences").upsert({ user_id: userId, ...toNotificationRow(prefs) });
  if (error) throw error;
}
