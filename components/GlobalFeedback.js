"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckCircle2, X, AlertCircle, Info, LockKeyhole } from "lucide-react";

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

export default function GlobalFeedback() {
  const [toasts, setToasts] = useState([]);
  const [restriction, setRestriction] = useState(null);

  useEffect(() => {
    const onToast = (event) => {
      const id = `${Date.now()}-${Math.random()}`;
      setToasts((items) => [...items, { id, ...event.detail }].slice(-4));
      window.setTimeout(() => {
        setToasts((items) => items.filter((item) => item.id !== id));
      }, 4200);
    };
    const onRestriction = (event) => setRestriction(event.detail);

    window.addEventListener("schoolpilot:toast", onToast);
    window.addEventListener("schoolpilot:subscription-restricted", onRestriction);
    return () => {
      window.removeEventListener("schoolpilot:toast", onToast);
      window.removeEventListener("schoolpilot:subscription-restricted", onRestriction);
    };
  }, []);

  return (
    <>
      <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-[min(92vw,390px)] flex-col gap-3">
        {toasts.map((toast) => {
          const Icon = icons[toast.type] || Info;
          const success = toast.type === "success";
          return (
            <div key={toast.id} role="status" className="pointer-events-auto flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-900/10 animate-in slide-in-from-top-2">
              <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${success ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}>
                <Icon size={19} />
              </span>
              <p className="flex-1 pt-1 text-sm font-medium leading-6 text-slate-700">{toast.message}</p>
              <button type="button" aria-label="Dismiss notification" onClick={() => setToasts((items) => items.filter((item) => item.id !== toast.id))} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>

      {restriction && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="subscription-required-title">
          <div className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
              <LockKeyhole size={27} />
            </div>
            <h2 id="subscription-required-title" className="mt-5 text-xl font-bold text-slate-900">Subscription required</h2>
            <p className="mt-2 leading-7 text-slate-600">{restriction.message}</p>
            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setRestriction(null)} className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">Not now</button>
              <Link href={restriction.redirectTo || "/dashboard/school-admin/subscription"} onClick={() => setRestriction(null)} className="rounded-xl bg-emerald-600 px-5 py-3 text-center text-sm font-semibold text-white hover:bg-emerald-700">View subscription</Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
