"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
ArrowLeft,
CalendarDays,
CheckCircle2,
CircleOff,
Edit,
Loader2,
} from "lucide-react";
import api from "@/lib/api";

export default function AcademicSessionDetailsPage() {
const params = useParams();
const router = useRouter();

const sessionId = params?.sessionId;

const [session, setSession] = useState(null);
const [loading, setLoading] = useState(true);
const [deactivating, setDeactivating] = useState(false);
const [error, setError] = useState("");
const [success, setSuccess] = useState("");

useEffect(() => {
const loadSession = async () => {
if (!sessionId) return;


  try {
    setLoading(true);
    setError("");

    const response = await api.get(
      `/academic-sessions/${sessionId}`
    );

    const sessionData =
      response.data?.academicSession ||
      response.data?.session ||
      response.data?.data ||
      response.data;

    setSession(sessionData);
  } catch (err) {
    console.error(
      "Failed to load academic session:",
      err
    );

    setError(
      err.response?.data?.message ||
        "Failed to load academic session."
    );
  } finally {
    setLoading(false);
  }
};

loadSession();


}, [sessionId]);

const handleDeactivate = async () => {
const confirmed = window.confirm(
"Are you sure you want to deactivate this academic session?"
);


if (!confirmed) return;

try {
  setDeactivating(true);
  setError("");
  setSuccess("");

  await api.patch(
    `/academic-sessions/${sessionId}/deactivate`
  );

  setSuccess(
    "Academic session deactivated successfully."
  );

  setSession((prev) => ({
    ...prev,
    isActive: false,
  }));
} catch (err) {
  console.error(
    "Failed to deactivate academic session:",
    err
  );

  setError(
    err.response?.data?.message ||
      "Failed to deactivate academic session. Please try again."
  );
} finally {
  setDeactivating(false);
}


};

const formatDate = (date) => {
if (!date) return "—";


return new Date(date).toLocaleDateString("en-NG", {
  day: "numeric",
  month: "long",
  year: "numeric",
});


};

if (loading) {
return ( <div className="flex min-h-[60vh] items-center justify-center"> <Loader2 className="h-7 w-7 animate-spin text-emerald-600" /> </div>
);
}

if (error && !session) {
return ( <div className="space-y-6 p-4 sm:p-6 lg:p-8">
<button
type="button"
onClick={() =>
router.push(
"/dashboard/school-admin/academic-sessions"
)
}
className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-emerald-600"
> <ArrowLeft className="h-4 w-4" />
Back to Academic Sessions </button>


    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      {error}
    </div>
  </div>
);


}

return ( <div className="space-y-6 p-4 sm:p-6 lg:p-8">
{/* Header */} <div>
<button
type="button"
onClick={() =>
router.push(
"/dashboard/school-admin/academic-sessions"
)
}
className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-emerald-600"
> <ArrowLeft className="h-4 w-4" />
Back to Academic Sessions </button>


    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
          <CalendarDays className="h-5 w-5" />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {session?.name || "Academic Session"}
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Academic session details and settings.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() =>
          router.push(
            `/dashboard/school-admin/academic-sessions/${sessionId}/edit`
          )
        }
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
      >
        <Edit className="h-4 w-4" />
        Edit Session
      </button>
    </div>
  </div>

  {/* Error */}
  {error && (
    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      {error}
    </div>
  )}

  {/* Success */}
  {success && (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
      {success}
    </div>
  )}

  {/* Session Overview */}
  <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
    <div className="mb-6 flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
        <CalendarDays className="h-5 w-5" />
      </div>

      <div>
        <h2 className="font-semibold text-slate-900">
          Session Overview
        </h2>

        <p className="text-sm text-slate-500">
          Basic information about this academic session.
        </p>
      </div>
    </div>

    <div className="grid gap-5 sm:grid-cols-2">
      {/* Name */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Academic Session
        </p>

        <p className="mt-1 text-sm font-semibold text-slate-900">
          {session?.name || "—"}
        </p>
      </div>

      {/* Start Date */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Start Date
        </p>

        <p className="mt-1 text-sm font-semibold text-slate-900">
          {formatDate(session?.startDate)}
        </p>
      </div>

      {/* End Date */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          End Date
        </p>

        <p className="mt-1 text-sm font-semibold text-slate-900">
          {formatDate(session?.endDate)}
        </p>
      </div>

      {/* Current Status */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Current Session
        </p>

        <div className="mt-2">
          {session?.isCurrent ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Current Session
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              Not Current
            </span>
          )}
        </div>
      </div>

      {/* Active Status */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Status
        </p>

        <div className="mt-2">
          {session?.isActive !== false ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Active
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              <CircleOff className="h-3.5 w-3.5" />
              Inactive
            </span>
          )}
        </div>
      </div>
    </div>
  </section>

  {/* Actions */}
  <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
    <h2 className="font-semibold text-slate-900">
      Session Actions
    </h2>

    <p className="mt-1 text-sm text-slate-500">
      Manage this academic session.
    </p>

    <div className="mt-5 flex flex-col gap-3 sm:flex-row">
      <button
        type="button"
        onClick={() =>
          router.push(
            `/dashboard/school-admin/academic-sessions/${sessionId}/edit`
          )
        }
        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
      >
        <Edit className="h-4 w-4" />
        Edit Session
      </button>

      {session?.isActive !== false && (
        <button
          type="button"
          onClick={handleDeactivate}
          disabled={deactivating}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {deactivating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Deactivating...
            </>
          ) : (
            <>
              <CircleOff className="h-4 w-4" />
              Deactivate Session
            </>
          )}
        </button>
      )}
    </div>
  </section>
</div>


);
}
