"use client";

import { useCallback, useEffect, useState } from "react";
import { deleteReminder, fetchReminders, setReminderEnabled } from "@/features/reminders/reminders-api";
import { useDataRevision } from "@/lib/data-revision";

export function useRemindersData() {
  const [reminders, setReminders] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);
  const { revisions, bump } = useDataRevision();

  const load = useCallback(async () => {
    try {
      const rows = await fetchReminders();
      setReminders(rows);
      setError(null);
      setStatus("ready");
    } catch (err) {
      setError(err?.message || "Gagal memuat reminder.");
      setStatus((s) => (reminders.length === 0 ? "failure" : s));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revisions.reminders]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const toggle = useCallback(async (reminder, isEnabled) => {
    const previous = reminders;
    setReminders((cur) => cur.map((r) => (r.id === reminder.id ? { ...r, isEnabled } : r)));
    try {
      await setReminderEnabled({ id: reminder.id, isEnabled });
      bump("reminders");
    } catch (err) {
      setReminders(previous);
      throw err;
    }
  }, [reminders, bump]);

  const remove = useCallback(async (reminder) => {
    const previous = reminders;
    setReminders((cur) => cur.filter((r) => r.id !== reminder.id));
    try {
      await deleteReminder({ id: reminder.id });
      bump("reminders");
    } catch (err) {
      setReminders(previous);
      throw err;
    }
  }, [reminders, bump]);

  return { reminders, status, error, reload: load, toggle, remove };
}
