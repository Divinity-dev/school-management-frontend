"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  Clock,
  Pencil,
  Power,
  RefreshCw,
  Star,
} from "lucide-react";
import api from "@/lib/api";

export default function AcademicTermDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const termId = params.termId;

  const [term, setTerm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const fetchTerm = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(`/academic-terms/${termId}`);

      setTerm(response.data.term);
    } catch (err) {
      console.error("Failed to load academic term:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load academic term."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (termId) {
      fetchTerm();
    }
  }, [termId]);

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-NG", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const handleSetCurrent = async () => {
    try {
      setActionLoading(true);
      setActionError("");
      setSuccessMessage("");

      const response = await api.patch(
        `/academic-terms/${termId}/current`
      );

      setTerm(response.data.term);

      setSuccessMessage(
        response.data.message ||
          "Academic term set as current successfully."
      );
    } catch (err) {
      console.error("Failed to set current term:", err);

      setActionError(
        err.response?.data?.message ||
          "Unable to set this term as current."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeactivate = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to deactivate this academic term?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(true);
      setActionError("");
      setSuccessMessage("");

      const response = await api.patch(
        `/academic-terms/${termId}/deactivate`
      );

      setTerm(response.data.term);

      setSuccessMessage(
        response.data.message ||
          "Academic term deactivated successfully."
      );
    } catch (err) {
      console.error("Failed to deactivate term:", err);

      setActionError(
        err.response?.data?.message ||
          "Unable to deactivate this term."
      );
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600" />

        <p className="mt-4 text-sm text-slate-500">
          Loading academic term...
        </p>
      </div>
    );
  }

  if (error || !term) {
    return (
      <div className="space-y-4">
        <Link
          href="/dashboard/school-admin/academic-terms"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft size={18} />
          Back to Academic Terms
        </Link>

        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <div className="flex items-start gap-3">
            <CircleAlert
              size={22}
              className="mt-0.5 text-red-600"
            />

            <div>
              <h2 className="font-semibold text-red-800">
                Unable to load academic term
              </h2>

              <p className="mt-1 text-sm text-red-700">
                {error || "Academic term not found."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={fetchTerm}
            className="mt-4 inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
          >
            <RefreshCw size={16} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link
        href="/dashboard/school-admin/academic-terms"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft size={18} />
        Back to Academic Terms
      </Link>

      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">
              {term.name}
            </h1>

            {term.isCurrent && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                <Star size={13} />
                Current Term
              </span>
            )}

            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                term.isActive
                  ? "bg-blue-100 text-blue-700"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {term.isActive ? "Active" : "Inactive"}
            </span>
          </div>

          <p className="mt-2 text-sm text-slate-500">
            Academic term details and management.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href={`/dashboard/school-admin/academic-terms/${termId}/edit`}
            className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-white px-4 py-2.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-50"
          >
            <Pencil size={17} />
            Edit
          </Link>

          {!term.isCurrent && term.isActive && (
            <button
              type="button"
              onClick={handleSetCurrent}
              disabled={actionLoading}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Star size={17} />
              {actionLoading ? "Updating..." : "Set as Current"}
            </button>
          )}

          {term.isActive && (
            <button
              type="button"
              onClick={handleDeactivate}
              disabled={actionLoading}
              className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Power size={17} />
              {actionLoading ? "Updating..." : "Deactivate"}
            </button>
          )}
        </div>
      </div>

      {/* Success */}
      {successMessage && (
        <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          <CheckCircle2
            size={20}
            className="mt-0.5 shrink-0"
          />

          <p>{successMessage}</p>
        </div>
      )}

      {/* Action error */}
      {actionError && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <CircleAlert
            size={20}
            className="mt-0.5 shrink-0"
          />

          <p>{actionError}</p>
        </div>
      )}

      {/* Main details */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Term overview */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
              <CalendarDays size={22} />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900">
                Term Information
              </h2>

              <p className="text-sm text-slate-500">
                Basic information about this academic term.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Term
              </p>

              <p className="mt-1 font-semibold text-slate-900">
                {term.name}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Academic Session
              </p>

              <p className="mt-1 font-semibold text-slate-900">
                {term.academicSession?.name || "—"}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Start Date
              </p>

              <p className="mt-1 font-semibold text-slate-900">
                {formatDate(term.startDate)}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                End Date
              </p>

              <p className="mt-1 font-semibold text-slate-900">
                {formatDate(term.endDate)}
              </p>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
              <Clock size={22} />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900">
                Status
              </h2>

              <p className="text-sm text-slate-500">
                Current term status.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">
                Active
              </span>

              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                  term.isActive
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {term.isActive ? "Yes" : "No"}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">
                Current
              </span>

              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                  term.isCurrent
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {term.isCurrent ? "Yes" : "No"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Academic session information */}
      {term.academicSession && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <CalendarDays size={22} />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900">
                Academic Session
              </h2>

              <p className="text-sm text-slate-500">
                The academic session this term belongs to.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Session
              </p>

              <p className="mt-1 font-semibold text-slate-900">
                {term.academicSession.name}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Session Start
              </p>

              <p className="mt-1 font-semibold text-slate-900">
                {formatDate(term.academicSession.startDate)}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Session End
              </p>

              <p className="mt-1 font-semibold text-slate-900">
                {formatDate(term.academicSession.endDate)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}