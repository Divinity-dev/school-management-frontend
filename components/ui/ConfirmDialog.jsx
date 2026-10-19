"use client";

import { useState } from "react";
import { AlertTriangle, X } from "lucide-react";

export default function ConfirmDialog({
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  onConfirm,
  onCancel,
}) {
  const [confirming, setConfirming] = useState(false);
  const isDangerous = variant === "danger";

  const handleConfirm = async () => {
    setConfirming(true);

    try {
      await onConfirm();
      onCancel();
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
      onClick={(event) => {
        if (!confirming && event.target === event.currentTarget) {
          onCancel();
        }
      }}
    >
      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-message"
        className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
          <div className="flex items-start gap-3">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                isDangerous
                  ? "bg-red-50 text-red-600"
                  : "bg-emerald-50 text-emerald-600"
              }`}
            >
              <AlertTriangle size={20} />
            </div>
            <div>
              <h2
                id="confirm-dialog-title"
                className="text-lg font-semibold text-slate-900"
              >
                {title}
              </h2>
              <p
                id="confirm-dialog-message"
                className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600"
              >
                {message}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onCancel}
            disabled={confirming}
            aria-label="Close confirmation"
            className="ml-3 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col-reverse gap-2 px-6 py-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={confirming}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={confirming}
            className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
              isDangerous
                ? "bg-red-600 hover:bg-red-700"
                : "bg-emerald-600 hover:bg-emerald-700"
            }`}
          >
            {confirming && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            )}
            {confirming ? "Please wait..." : confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}
