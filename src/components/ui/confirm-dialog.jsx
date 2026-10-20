"use client";

import { useState } from "react";
import Modal from "./modal";
import Spinner from "./spinner";

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  message,
  confirmLabel = "Hapus",
  cancelLabel = "Batal",
  danger = true,
}) {
  const [working, setWorking] = useState(false);

  async function handleConfirm() {
    setWorking(true);
    try {
      await onConfirm?.();
    } finally {
      setWorking(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={working ? undefined : onClose}
      title={title}
      description={description}
      size="sm"
      footer={
        <div className="flex gap-2">
          <button
            type="button"
            className="btn-outline flex-1"
            onClick={onClose}
            disabled={working}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={danger ? "btn-danger flex-1" : "btn-primary flex-1"}
            onClick={handleConfirm}
            disabled={working}
          >
            {working ? <Spinner size={17} /> : null}
            {confirmLabel}
          </button>
        </div>
      }
    >
      <p className="text-[14px] leading-6 text-reset-muted">
        {message || description || "Tindakan ini tidak dapat dibatalkan."}
      </p>
    </Modal>
  );
}