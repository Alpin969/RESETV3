"use client";

import { useCallback, useEffect, useState } from "react";
import { firstDayOfMonth } from "@/lib/utils/date";
import { deleteSavingsTransaction, fetchSavingsSummary, fetchSavingsTransactions } from "@/features/savings/savings-api";
import { useDataRevision } from "@/lib/data-revision";

export function useSavingsData(month) {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({ totalDeposits: 0, totalWithdrawals: 0, balance: 0, transactionCount: 0 });
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);
  const [busyIds, setBusyIds] = useState(new Set());
  const { revisions, bump } = useDataRevision();

  const load = useCallback(async () => {
    try {
      const from = firstDayOfMonth(month);
      const to = new Date(month.getFullYear(), month.getMonth() + 1, 0);
      const [rows, sum] = await Promise.all([
        fetchSavingsTransactions({ from, to }), fetchSavingsSummary().catch(() => null),
      ]);
      setTransactions(rows);
      if (sum) setSummary(sum);
      setError(null);
      setStatus("ready");
    } catch (err) {
      setError(err?.message || "Gagal memuat tabungan.");
      setStatus((s) => (transactions.length === 0 ? "failure" : s));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month.getFullYear(), month.getMonth(), revisions.savings]);

  useEffect(() => { load(); }, [load]);

  const remove = useCallback(async (id) => {
    setBusyIds((cur) => new Set(cur).add(id));
    const previous = transactions;
    setTransactions((cur) => cur.filter((t) => t.id !== id));
    try {
      await deleteSavingsTransaction({ id });
      bump("savings");
    } catch (err) {
      setTransactions(previous);
      throw err;
    } finally {
      setBusyIds((cur) => { const n = new Set(cur); n.delete(id); return n; });
    }
  }, [transactions, bump]);

  return { transactions, summary, status, error, reload: load, remove, isBusy: (id) => busyIds.has(id) };
}
