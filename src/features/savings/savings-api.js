import { createClient } from "@/lib/supabase/client";
import { formatDateParam, localToday, parseDateParam } from "@/lib/utils/date";

export const SAVINGS_COLUMNS = "id, kind, amount, occurred_on, note, client_ref";

export function parseSavings(row) {
  return {
    id: row.id,
    kind: row.kind === "withdrawal" ? "withdrawal" : "deposit",
    amount: typeof row.amount === "number" ? row.amount : Number(row.amount) || 0,
    occurredOn: parseDateParam(row.occurred_on) || localToday(),
    note: row.note || null,
    clientRef: row.client_ref || null,
  };
}

export function parseSavingsSummary(row) {
  if (!row) return { totalDeposits: 0, totalWithdrawals: 0, balance: 0, transactionCount: 0 };
  const num = (v) => (typeof v === "number" ? v : Number(v) || 0);
  return {
    totalDeposits: num(row.total_deposits),
    totalWithdrawals: num(row.total_withdrawals),
    balance: num(row.balance),
    transactionCount: Number(row.transaction_count) || 0,
  };
}

async function requireUserId(supabase) {
  const { data } = await supabase.auth.getUser();
  if (!data?.user) throw new Error("Sesi login tidak ditemukan. Silakan login ulang.");
  return data.user.id;
}

export async function fetchSavingsTransactions({ from, to }) {
  const supabase = createClient();
  const { data, error } = await supabase.from("savings_transactions").select(SAVINGS_COLUMNS)
    .gte("occurred_on", formatDateParam(from)).lte("occurred_on", formatDateParam(to))
    .order("occurred_on", { ascending: false }).order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map(parseSavings);
}

export async function fetchSavingsSummary() {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("get_savings_summary");
  if (error) throw error;
  const rows = Array.isArray(data) ? data : [];
  return parseSavingsSummary(rows[0]);
}

export function newClientRef() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export async function createSavingsTransaction({ kind, amount, occurredOn, note, clientRef }) {
  const supabase = createClient();
  const userId = await requireUserId(supabase);
  const clean = String(note || "").trim();
  const { data, error } = await supabase.from("savings_transactions").insert({
    user_id: userId, kind, amount: Number(amount).toFixed(2),
    occurred_on: formatDateParam(occurredOn), note: clean ? clean : null,
    client_ref: clientRef || newClientRef(),
  }).select(SAVINGS_COLUMNS).single();
  if (error) throw error;
  return parseSavings(data);
}

export async function updateSavingsTransaction({ id, kind, amount, occurredOn, note }) {
  const supabase = createClient();
  const clean = String(note || "").trim();
  const { data, error } = await supabase.from("savings_transactions").update({
    kind, amount: Number(amount).toFixed(2),
    occurred_on: formatDateParam(occurredOn), note: clean ? clean : null,
  }).eq("id", id).select(SAVINGS_COLUMNS).single();
  if (error) throw error;
  return parseSavings(data);
}

export async function deleteSavingsTransaction({ id }) {
  const supabase = createClient();
  const { error } = await supabase.from("savings_transactions").delete().eq("id", id);
  if (error) throw error;
}
