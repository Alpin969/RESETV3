"use client";

import { useState } from "react";
import { BellRing, Plus, ChevronRight } from "lucide-react";
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
      push(id ? "Reminder updated." : "Reminder created.");
    } catch (err) { push(friendlyError(err, "Failed to save reminder."), "error"); }
    finally { setSaving(false); }
  }

  return (
    <PageContainer className="max-w-3xl">
      <PageHeader title="Reminders" subtitle="Manage your daily reminders and never miss a habit."
        action={<button type="button" onClick={() => setFormOpen(true)} className="btn-primary btn-sm"><Plus size={16} /> Add Reminder</button>} />
      
      <div className="card mt-4 p-4 bg-reset-primary-light border-reset-primary/30">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-reset-primary/10">
            <BellRing size={18} className="text-reset-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="body-sm font-semibold text-reset-dark">Push Notifications</p>
            <p className="body-xs text-reset-primary">Reminders are stored locally. Push notifications coming soon.</p>
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {data.status === "loading" ? (
          <><Skeleton className="h-28 rounded-[var(--radius-card)]" /><Skeleton className="h-28 rounded-[var(--radius-card)]" /></>
        ) : data.status === "failure" ? (
          <EmptyState icon={BellRing} title="Failed to load reminders" description={data.error}
            action={<button type="button" onClick={data.reload} className="btn-primary btn-sm">Try again</button>} />
        ) : data.reminders.length === 0 ? (
          <EmptyState icon={BellRing} title="No reminders yet" description="Create your first reminder to stay on track."
            action={<button type="button" onClick={() => setFormOpen(true)} className="btn-primary btn-sm">Create Reminder</button>} />
        ) : data.reminders.map((reminder) => (
          <ReminderTile key={reminder.id} reminder={reminder}
            onToggle={(v) => data.toggle(reminder, v).catch((e) => push(friendlyError(e), "error"))}
            onEdit={() => { setEditing(reminder); setFormOpen(true); }}
            onDelete={() => setDeleting(reminder)} />
        ))}
      </div>

      <ReminderFormModal key={editing?.id || "new"} open={formOpen} onClose={() => { setFormOpen(false); setEditing(null); }}
        title={editing ? "Edit Reminder" : "Create Reminder"} submitLabel={editing ? "Save Changes" : "Save Reminder"}
        initial={editing} saving={saving} onSubmit={(v) => save(v, editing?.id || null)} />
      <ConfirmDialog open={!!deleting} onClose={() => setDeleting(null)} title="Delete Reminder?"
        message={`"${deleting?.title}" will be permanently deleted.`} confirmLabel="Delete" danger
        onConfirm={async () => {
          try { await data.remove(deleting); setDeleting(null); push("Reminder deleted."); }
          catch (err) { push(friendlyError(err, "Failed to delete reminder."), "error"); }
        }} />
    </PageContainer>
  );
}