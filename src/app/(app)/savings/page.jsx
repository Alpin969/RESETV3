"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, PiggyBank, Plus } from "lucide-react";
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

const navBtn = "flex h-9 w-9 items-center justify-center rounded-full border border-reset-border text-reset-dark hover:bg-reset-bg disabled:opacity-40";

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
      <PageHeader title="Savings Tracker" subtitle="Kelola tabungan dan pantau saldomu."
        action={<button type="button" onClick={() => openCreate("deposit")} className="btn-primary btn-sm"><Plus size={16} /> Tambah</button>} />
      <SavingsBalanceCard balance={data.summary.balance}
        onDeposit={() => openCreate("deposit")} onWithdraw={() => openCreate("withdrawal")} />
      <div className="card mt-4 p-5">
        <div className="mb-3 flex items-center justify-between">
          <button type="button" aria-label="Bulan sebelumnya" onClick={() => setMonth((m) => addMonths(m, -1))} className={navBtn}><ChevronLeft size={18} /></button>
          <p className="text-[15px] font-bold text-reset-dark">{monthTitle(month)}</p>
          <button type="button" aria-label="Bulan berikutnya" disabled={!canNext} onClick={() => setMonth((m) => addMonths(m, 1))} className={navBtn}><ChevronRight size={18} /></button>
        </div>
        <SavingsMonthSummary monthIn={monthTotal(data.transactions, "deposit")} monthOut={monthTotal(data.transactions, "withdrawal")} />
      </div>
      <div className="mt-4 space-y-3">
        {data.status === "loading" ? (<><Skeleton className="h-20 rounded-[20px]" /><Skeleton className="h-20 rounded-[20px]" /></>)
        : data.status === "failure" ? (
          <EmptyState icon={PiggyBank} title="Gagal memuat tabungan" description={data.error}
            action={<button type="button" onClick={data.reload} className="btn-primary btn-sm">Coba lagi</button>} />
        ) : data.transactions.length === 0 ? (
          <EmptyState icon={PiggyBank} title="Belum ada transaksi" description="Catat menabung atau penarikan pertamamu."
            action={<button type="button" onClick={() => openCreate("deposit")} className="btn-primary btn-sm">Catat transaksi</button>} />
        ) : data.transactions.map((t) => (
          <SavingsTile key={t.id} transaction={t} busy={data.isBusy(t.id)}
            onEdit={() => { setEditing(t); setFormOpen(true); }} onDelete={() => setDeleting(t)} />
        ))}
      </div>
      <SavingsFormModal key={editing?.id || kind} open={formOpen} onClose={() => { setFormOpen(false); setEditing(null); }}
        title={editing ? "Ubah transaksi" : kind === "deposit" ? "Tambah tabungan" : "Catat penarikan"}
        submitLabel={editing ? "Simpan perubahan" : "Simpan transaksi"}
        initial={editing || { kind }} saving={saving}
        onSubmit={(v) => saveTx(v, editing?.id || null, { data, push, bump, setFormOpen, setEditing, setSaving })} />
      <ConfirmDialog open={!!deleting} onClose={() => setDeleting(null)} title="Hapus transaksi?"
        message="Transaksi ini akan dihapus permanen." confirmLabel="Hapus" danger
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
    push(id ? "Transaksi diperbarui." : "Transaksi disimpan.");
  } catch (err) { push(friendlyError(err, "Gagal menyimpan transaksi."), "error"); }
  finally { setSaving(false); }
}

async function deleteTx(target, { data, push, setDeleting }) {
  try {
    await data.remove(target.id);
    setDeleting(null);
    push("Transaksi dihapus.");
  } catch (err) { push(friendlyError(err, "Gagal menghapus transaksi."), "error"); }
}
