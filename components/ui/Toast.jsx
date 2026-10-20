"use client";

import { useEffect } from "react";
import { CircleAlert, CheckCircle2, X } from "lucide-react";

export default function Toast({ message, type = "error", onClose }) {
  useEffect(() => {
    const timeoutId = window.setTimeout(onClose, 5000);
    return () => window.clearTimeout(timeoutId);
  }, [message, onClose]);

  const isError = type === "error";

  return (
    <div
      role={isError ? "alert" : "status"}
      aria-live={isError ? "assertive" : "polite"}
      className={`fixed right-4 top-4 z-[70] flex w-[min(24rem,calc(100vw-2rem))] items-start gap-3 rounded-xl border p-4 text-sm shadow-lg ${
        isError
          ? "border-red-200 bg-white text-red-800"
          : "border-emerald-200 bg-white text-emerald-800"
      }`}
    >
      {isError ? (
        <CircleAlert size={19} className="mt-0.5 shrink-0 text-red-600" />
      ) : (
        <CheckCircle2 size={19} className="mt-0.5 shrink-0 text-emerald-600" />
      )}
      <p className="flex-1 leading-5">{message}</p>
      <button
        type="button"
        onClick={onClose}
        aria-label="Dismiss notification"
        className="rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
      >
        <X size={16} />
      </button>
    </div>
  );
}
