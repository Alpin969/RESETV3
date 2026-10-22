"use client";

import { useCallback, useEffect, useState } from "react";
import { Archive, ChevronRight, RotateCcw, Trash2 } from "lucide-react";
import PageContainer from "@/components/ui/page-container";
import PageHeader from "@/components/ui/page-header";
import Skeleton from "@/components/ui/skeleton";
import EmptyState from "@/components/ui/empty-state";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import { fetchArchivedTasks } from "@/features/tasks/tasks-api";
import { deleteTask, restoreTask } from "@/features/tasks/tasks-mutations";
import { useToast } from "@/components/ui/toast";
import { friendlyError } from "@/lib/utils/errors";
import { useDataRevision } from "@/lib/data-revision";
import { shortDate } from "@/lib/utils/format";

export default function ArchivedTasksPage() {
  const { push } = useToast();
  const { bump } = useDataRevision();
  const [tasks, setTasks] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);
  const [restoring, setRestoring] = useState(new Set());
  const [deleting, setDeleting] = useState(null);

  const load = useCallback(async () => {
    try {
      const rows = await fetchArchivedTasks();
      setTasks(rows);
      setError(null);
      setStatus("ready");
    } catch (err) {
      setError(err?.message || "Failed to load archive.");
      setStatus("failure");
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect
    load();
  }, [load]);

  async function handleRestore(task) {
    setRestoring((cur) => new Set(cur).add(task.id));
    try {
      await restoreTask({ id: task.id });
      setTasks((cur) => cur.filter((t) => t.id !== task.id));
      bump("tasks");
      push("Task restored.");
    } catch (err) { push(friendlyError(err, "Failed to restore task."), "error"); }
    finally { setRestoring((cur) => { const n = new Set(cur); n.delete(task.id); return n; }); }
  }

  async function handleDelete() {
    try {
      await deleteTask({ id: deleting.id });
      setTasks((cur) => cur.filter((t) => t.id !== deleting.id));
      setDeleting(null);
      bump("tasks");
      push("Task permanently deleted.");
    } catch (err) { push(friendlyError(err, "Failed to delete task."), "error"); }
  }

  return (
    <PageContainer className="max-w-3xl">
      <PageHeader title="Archived Tasks" subtitle="Archived tasks don&apos;t appear in your daily list." />
      
      <div className="space-y-3">
        {status === "loading" ? (
          <><Skeleton className="h-24 rounded-[var(--radius-card)]" /><Skeleton className="h-24 rounded-[var(--radius-card)]" /></>
        ) : status === "failure" ? (
          <EmptyState icon={Archive} title="Failed to load archive" description={error}
            action={<button type="button" onClick={load} className="btn-primary btn-sm">Try again</button>} />
        ) : tasks.length === 0 ? (
          <EmptyState icon={Archive} title="Archive is empty" description="Tasks you archive will appear here." />
        ) : tasks.map((task) => (
          <div key={task.id} className="card flex items-center gap-4 p-4">
            <div className="min-w-0 flex-1">
              <p className="truncate body-md font-semibold text-reset-dark">{task.title}</p>
              <p className="mt-0.5 body-sm text-reset-muted">
                Archived {task.archivedOn ? shortDate(task.archivedOn) : "Unknown date"}
              </p>
            </div>
            <button type="button" disabled={restoring.has(task.id)} onClick={() => handleRestore(task)} className="btn-outline btn-sm flex items-center gap-1.5">
              <RotateCcw size={16} />
              {restoring.has(task.id) ? "Restoring..." : "Restore"}
            </button>
            <button type="button" onClick={() => setDeleting(task)} className="btn-danger btn-sm flex items-center gap-1.5">
              <Trash2 size={16} />
              Delete
            </button>
          </div>
        ))}
      </div>

      <ConfirmDialog open={!!deleting} onClose={() => setDeleting(null)} title="Delete Permanently?"
        message={`"${deleting?.title}" will be permanently deleted along with its checklist history.`}
        confirmLabel="Delete Permanently" onConfirm={handleDelete} />
    </PageContainer>
  );
}