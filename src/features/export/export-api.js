import { createClient } from "@/lib/supabase/client";

export const EXPORT_TABLES = [
  "profile", "tasks", "task_checklists", "sleep_logs",
  "savings_transactions", "reminders", "notification_preferences",
];
export function buildExportJson({ tables, username, email, generatedAt }) {
  const clean = {};
  for (const [key, rows] of Object.entries(tables)) {
    if (key === "username" || key === "email") continue;
    clean[key] = (rows || []).map((row) => {
      const next = { ...row };
      delete next.user_id;
      return next;
    });
  }
  return {
    app: "RESET V2", version: 2, exported_at: generatedAt.toISOString(),
    account: { username: username || null, email: email || null }, tables: clean,
  };
}

export function csvCell(value) {
  if (value === null || value === undefined) return "";
  let text = "";
  if (typeof value === "boolean") text = value ? "true" : "false";
  else if (Array.isArray(value)) text = value.join("|");
  else if (typeof value === "object") text = JSON.stringify(value);
  else text = String(value);
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function rowsToCsv(rows) {
  if (!rows || rows.length === 0) return "";
  const columns = [];
  for (const row of rows) {
    for (const key of Object.keys(row)) {
      if (key === "user_id" || columns.includes(key)) continue;
      columns.push(key);
    }
  }
  const lines = [columns.map(csvCell).join(",")];
  for (const row of rows) lines.push(columns.map((c) => csvCell(row[c])).join(","));
  return `\uFEFF${lines.join("\r\n")}`;
}

export function csvFileNameFor(table) {
  return `reset-v2-${table}.csv`;
}

export function exportFileName(kind, date) {
  const stamp = date.toISOString().replace(/:/g, "-").substring(0, 19);
  return kind === "json" ? `reset-v2-export-${stamp}.json` : `reset-v2-export-${stamp}.zip`;
}

export async function buildExportTables() {
  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;
  if (!user) throw new Error("Sesi login tidak ditemukan. Silakan login ulang.");
  const userId = user.id;

  async function select(table, orderBy) {
    let query = supabase.from(table).select("*").eq("user_id", userId);
    if (orderBy) query = query.order(orderBy, { ascending: true });
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
  return {
    profile: profile ? [profile] : [],
    tasks: await select("user_tasks", "created_at"),
    task_checklists: await select("daily_task_checklists", "task_date"),
    sleep_logs: await select("sleep_logs", "sleep_date"),
    savings_transactions: await select("savings_transactions", "occurred_on"),
    reminders: await select("reminders", "reminder_time"),
    notification_preferences: await select("notification_preferences"),
    username: profile?.username || null,
    email: user.email || null,
  };
}
