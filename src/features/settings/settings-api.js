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

export async function fetchNotificationPreferences() {
  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth?.user?.id;
  if (!userId) throw new Error("Sesi login tidak ditemukan. Silakan login ulang.");
  const { data, error } = await supabase.from("notification_preferences").select("*").eq("user_id", userId).maybeSingle();
  if (error) throw error;
  return data || { push_enabled: false, reminder_enabled: true, sleep_reminder_enabled: false, savings_reminder_enabled: false, daily_summary_enabled: false };
}

export async function saveNotificationPreferences(prefs) {
  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth?.user?.id;
  if (!userId) throw new Error("Sesi login tidak ditemukan. Silakan login ulang.");
  const { error } = await supabase.from("notification_preferences").upsert({ user_id: userId, ...prefs });
  if (error) throw error;
}
