"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, PiggyBank, Plus, TrendingUp } from "lucide-react";
import PageContainer from "@/components/ui/page-container";
import PageHeader from "@/components/ui/page-header";
import Skeleton from "@/components/ui/skeleton";
import EmptyState from "@/components/ui/empty-state";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import SavingsFormModal from "@/features/savings/savings-form-modal";
import { SavingsTile } from "@/features/savings/savings-tiles";
import { SavingsBalanceCard, SavingsMonthSummary } from "@/features/savings/savings-cards";
import { useSavingsData } from "@/features/savings/use-savings-data";
import { createSavingsTransaction, newClientRef, updateSavingsTransaction } from "@/features/savings/savings-api";
import { addMonths, firstDayOfMonth, localToday } from "@/lib/utils/date";
import { monthTitle } from "@/lib/utils/format";
import { useToast } from "@/components/ui/toast";
import { friendlyError } from "@/lib/utils/errors";
import { useDataRevision } from "@/lib/data-revision";

const navBtn = "btn-ghost btn-sm";

export default function SavingsPage() {
  const { push } = useToast();
  const { bump } = useDataRevision();
  const [month, setMonth] = useState(() => firstDayOfMonth(localToday()));
  const data = useSavingsData(month);
  const [kind, setKind] = useState("deposit");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [saving, setSaving] = useState(false);
  const canNext = month < firstDayOfMonth(localToday());

  function openCreate(nextKind) {
    setKind(nextKind);
    setEditing(null);
    setFormOpen(true);
  }

  return (
    <PageContainer className="max-w-3xl">
      <PageHeader title="Savings Tracker" subtitle="Manage your savings and watch your balance grow."
        action={<button type="button" onClick={() => openCreate("deposit")} className="btn-primary btn-sm flex items-center gap-2"><Plus size={16} /> Add Transaction</button>} />
      
      <SavingsBalanceCard balance={data.summary.balance}
        onDeposit={() => openCreate("deposit")} onWithdraw={() => openCreate("withdrawal")} />
      
      <div className="card mt-4 p-5">
        <div className="flex items-center justify-between mb-4">
          <button type="button" aria-label="Previous month" onClick={() => setMonth((m) => addMonths(m, -1))} className={navBtn}><ChevronLeft size={18} /></button>
          <h2 className="heading-3">{monthTitle(month)}</h2>
          <button type="button" aria-label="Next month" disabled={!canNext} onClick={() => setMonth((m) => addMonths(m, 1))} className={navBtn}><ChevronRight size={18} /></button>
        </div>
        <SavingsMonthSummary monthIn={monthTotal(data.transactions, "deposit")} monthOut={monthTotal(data.transactions, "withdrawal")} />
      </div>

      <div className="mt-4 space-y-3">
        {data.status === "loading" ? (
          <><Skeleton className="h-24 rounded-[var(--radius-card)]" /><Skeleton className="h-24 rounded-[var(--radius-card)]" /></>
        ) : data.status === "failure" ? (
          <EmptyState icon={PiggyBank} title="Failed to load savings" description={data.error}
            action={<button type="button" onClick={data.reload} className="btn-primary btn-sm">Try again</button>} />
        ) : data.transactions.length === 0 ? (
          <EmptyState icon={PiggyBank} title="No transactions yet" description="Log your first deposit or withdrawal."
            action={<button type="button" onClick={() => openCreate("deposit")} className="btn-primary btn-sm">Add Transaction</button>} />
        ) : data.transactions.map((t) => (
          <SavingsTile key={t.id} transaction={t} busy={data.isBusy(t.id)}
            onEdit={() => { setEditing(t); setFormOpen(true); }} onDelete={() => setDeleting(t)} />
        ))}
      </div>

      <SavingsFormModal key={editing?.id || kind} open={formOpen} onClose={() => { setFormOpen(false); setEditing(null); }}
        title={editing ? "Edit Transaction" : kind === "deposit" ? "Add Deposit" : "Add Withdrawal"}
        submitLabel={editing ? "Save Changes" : "Save Transaction"}
        initial={editing || { kind }} saving={saving}
        onSubmit={(v) => saveTx(v, editing?.id || null, { data, push, bump, setFormOpen, setEditing, setSaving })} />
      <ConfirmDialog open={!!deleting} onClose={() => setDeleting(null)} title="Delete Transaction?"
        message="This transaction will be permanently deleted." confirmLabel="Delete" danger
        onConfirm={() => deleteTx(deleting, { data, push, setDeleting })} />
    </PageContainer>
  );
}

function monthTotal(transactions, kind) {
  return transactions.filter((t) => t.kind === kind).reduce((s, t) => s + t.amount, 0);
}

async function saveTx(values, id, { push, bump, setFormOpen, setEditing, setSaving }) {
  setSaving(true);
  try {
    if (id) await updateSavingsTransaction({ id, ...values });
    else await createSavingsTransaction({ ...values, clientRef: newClientRef() });
    setFormOpen(false);
    setEditing(null);
    bump("savings");
    push(id ? "Transaction updated." : "Transaction saved.");
  } catch (err) { push(friendlyError(err, "Failed to save transaction."), "error"); }
  finally { setSaving(false); }
}

async function deleteTx(target, { data, push, setDeleting }) {
  try {
    await data.remove(target.id);
    setDeleting(null);
    push("Transaction deleted.");
  } catch (err) { push(friendlyError(err, "Failed to delete transaction."), "error"); }
}