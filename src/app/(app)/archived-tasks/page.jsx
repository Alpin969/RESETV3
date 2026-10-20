"use client";

import { useCallback, useEffect, useState } from "react";
import { Archive } from "lucide-react";
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
      setError(err?.message || "Gagal memuat arsip.");
      setStatus("failure");
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleRestore(task) {
    setRestoring((cur) => new Set(cur).add(task.id));
    try {
      await restoreTask({ id: task.id });
      setTasks((cur) => cur.filter((t) => t.id !== task.id));
      bump("tasks");
      push("Task dipulihkan.");
    } catch (err) { push(friendlyError(err, "Gagal memulihkan task."), "error"); }
    finally { setRestoring((cur) => { const n = new Set(cur); n.delete(task.id); return n; }); }
  }

  async function handleDelete() {
    try {
      await deleteTask({ id: deleting.id });
      setTasks((cur) => cur.filter((t) => t.id !== deleting.id));
      setDeleting(null);
      bump("tasks");
      push("Task dihapus permanen.");
    } catch (err) { push(friendlyError(err, "Gagal menghapus task."), "error"); }
  }

  return (
    <PageContainer className="max-w-3xl">
      <PageHeader title="Archived Tasks" subtitle="Task yang diarsipkan tidak muncul di daftar harian." />
      <div className="space-y-3">
        {status === "loading" ? (<><Skeleton className="h-20 rounded-[20px]" /><Skeleton className="h-20 rounded-[20px]" /></>)
        : status === "failure" ? (
          <EmptyState icon={Archive} title="Gagal memuat arsip" description={error}
            action={<button type="button" onClick={load} className="btn-primary btn-sm">Coba lagi</button>} />
        ) : tasks.length === 0 ? (
          <EmptyState icon={Archive} title="Arsip kosong" description="Task yang kamu arsipkan akan muncul di sini." />
        ) : tasks.map((task) => (
          <div key={task.id} className="card flex items-center gap-3 p-4">
            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] font-bold text-reset-dark">{task.title}</p>
              <p className="mt-0.5 text-[13px] text-reset-muted">
                Diarsipkan {task.archivedOn ? shortDate(task.archivedOn) : ""}
              </p>
            </div>
            <button type="button" disabled={restoring.has(task.id)} onClick={() => handleRestore(task)} className="btn-outline btn-sm">
              {restoring.has(task.id) ? "Memulihkan..." : "Pulihkan"}
            </button>
            <button type="button" onClick={() => setDeleting(task)} className="btn-sm rounded-xl px-3 py-2 text-[13.5px] font-semibold text-reset-danger hover:bg-[#FFF0EF]">
              Hapus
            </button>
          </div>
        ))}
      </div>
      <ConfirmDialog open={!!deleting} onClose={() => setDeleting(null)} title="Hapus permanen?"
        message={`"${deleting?.title}" akan dihapus permanen beserta riwayat checklist-nya.`}
        confirmLabel="Hapus permanen" onConfirm={handleDelete} />
    </PageContainer>
  );
}
