"use client";

import { useState } from "react";
import Modal from "@/components/ui/modal";
import { validateNotes, validateTaskTitle } from "@/lib/utils/validators";

export default function TaskFormModal({ open, onClose, title, description, submitLabel, initialTitle = "", initialNotes = "", saving, onSubmit }) {
  const [name, setName] = useState(initialTitle);
  const [notes, setNotes] = useState(initialNotes || "");
  const [error, setError] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();
    const titleError = validateTaskTitle(name);
    if (titleError) { setError(titleError); return; }
    const notesError = validateNotes(notes);
    if (notesError) { setError(notesError); return; }
    setError(null);
    await onSubmit({ title: name.trim(), notes: notes.trim() });
  }

  return (
    <Modal open={open} onClose={onClose} title={title} description={description}
      footer={
        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="btn-outline flex-1">Cancel</button>
          <button type="button" onClick={handleSubmit} disabled={saving} className="btn-primary flex-1">
            {saving ? "Saving..." : submitLabel}
          </button>
        </div>
      }>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error ? <p className="rounded-xl border border-[#F0C9C6] bg-[#FFF6F5] px-3.5 py-2.5 text-[13px] font-medium text-[#8F211A]">{error}</p> : null}
        <div>
          <label className="field-label" htmlFor="task-title">Task name</label>
          <input id="task-title" className="field" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Morning workout" maxLength={120} autoFocus />
        </div>
        <div>
          <label className="field-label" htmlFor="task-notes">Notes (optional)</label>
          <textarea id="task-notes" className="field min-h-24 resize-y" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Extra details..." maxLength={1000} />
        </div>
      </form>
    </Modal>
  );
}
