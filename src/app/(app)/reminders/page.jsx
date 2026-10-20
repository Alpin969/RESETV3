"use client";

import { useState } from "react";
import { BellRing, Plus } from "lucide-react";
import PageContainer from "@/components/ui/page-container";
import PageHeader from "@/components/ui/page-header";
import Skeleton from "@/components/ui/skeleton";
import EmptyState from "@/components/ui/empty-state";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import ReminderFormModal from "@/features/reminders/reminder-form-modal";
import ReminderTile from "@/features/reminders/reminder-tile";
import { useRemindersData } from "@/features/reminders/use-reminders-data";
import { createReminder, updateReminder } from "@/features/reminders/reminders-api";
import { useToast } from "@/components/ui/toast";
import { friendlyError } from "@/lib/utils/errors";
import { useDataRevision } from "@/lib/data-revision";

export default function RemindersPage() {
  const { push } = useToast();
  const { bump } = useDataRevision();
  const data = useRemindersData();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [saving, setSaving] = useState(false);

  async function save(values, id) {
    setSaving(true);
    try {
      if (id) await updateReminder({ id, ...values });
      else await createReminder(values);
      setFormOpen(false);
      setEditing(null);
      bump("reminders");
      push(id ? "Reminder diperbarui." : "Reminder dibuat.");
    } catch (err) { push(friendlyError(err, "Gagal menyimpan reminder."), "error"); }
    finally { setSaving(false); }
  }

  return (
    <PageContainer className="max-w-3xl">
      <PageHeader title="Reminders" subtitle="Kelola pengingat harianmu."
        action={<button type="button" onClick={() => setFormOpen(true)} className="btn-primary btn-sm"><Plus size={16} /> Tambah</button>} />
      <div className="rounded-[14px] border border-[#BFE3D0] bg-[#F0FAF4] px-4 py-3 text-[13px] font-medium leading-5 text-[#1B5C3E]">
        Notifikasi push belum diaktifkan. Reminder tetap tersimpan dan bisa dikelola di sini.
      </div>
      <div className="mt-4 space-y-3">
        {data.status === "loading" ? (<><Skeleton className="h-24 rounded-[20px]" /><Skeleton className="h-24 rounded-[20px]" /></>)
        : data.status === "failure" ? (
          <EmptyState icon={BellRing} title="Gagal memuat reminder" description={data.error}
            action={<button type="button" onClick={data.reload} className="btn-primary btn-sm">Coba lagi</button>} />
        ) : data.reminders.length === 0 ? (
          <EmptyState icon={BellRing} title="Belum ada reminder" description="Buat pengingat pertamamu agar rutinitas tidak terlewat."
            action={<button type="button" onClick={() => setFormOpen(true)} className="btn-primary btn-sm">Buat reminder</button>} />
        ) : data.reminders.map((reminder) => (
          <ReminderTile key={reminder.id} reminder={reminder}
            onToggle={(v) => data.toggle(reminder, v).catch((e) => push(friendlyError(e), "error"))}
            onEdit={() => { setEditing(reminder); setFormOpen(true); }}
            onDelete={() => setDeleting(reminder)} />
        ))}
      </div>
      <ReminderFormModal key={editing?.id || "new"} open={formOpen} onClose={() => { setFormOpen(false); setEditing(null); }}
        title={editing ? "Ubah reminder" : "Buat reminder"} submitLabel={editing ? "Simpan perubahan" : "Simpan reminder"}
        initial={editing} saving={saving} onSubmit={(v) => save(v, editing?.id || null)} />
      <ConfirmDialog open={!!deleting} onClose={() => setDeleting(null)} title="Hapus reminder?"
        message={`"${deleting?.title}" akan dihapus permanen.`} confirmLabel="Hapus" danger
        onConfirm={async () => {
          try { await data.remove(deleting); setDeleting(null); push("Reminder dihapus."); }
          catch (err) { push(friendlyError(err, "Gagal menghapus reminder."), "error"); }
        }} />
    </PageContainer>
  );
}
