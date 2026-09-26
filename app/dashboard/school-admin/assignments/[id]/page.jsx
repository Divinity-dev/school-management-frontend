"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock,
  FileText,
  GraduationCap,
  Loader2,
  User,
  XCircle,
} from "lucide-react";
import api from "@/lib/api";

export default function AssignmentDetailsPage({ params }) {
  const { id } = use(params);

  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchAssignment = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(`/assignments/${assignmentId}`);

      setAssignment(response.data.assignment);
    } catch (err) {
      console.error("Failed to load assignment:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load assignment."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignment();
  }, [assignmentId]);

  const handlePublish = async () => {
    try {
      setActionLoading(true);
      setActionError("");
      setSuccess("");

      const response = await api.patch(
        `/assignments/${assignmentId}/publish`
      );

      setAssignment(response.data.assignment || {
        ...assignment,
        status: "published",
      });

      setSuccess(
        response.data.message ||
          "Assignment published successfully."
      );
    } catch (err) {
      console.error("Failed to publish assignment:", err);

      setActionError(
        err.response?.data?.message ||
          "Unable to publish assignment."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleClose = async () => {
    try {
      setActionLoading(true);
      setActionError("");
      setSuccess("");

      const response = await api.patch(
        `/assignments/${assignmentId}/close`
      );

      setAssignment(response.data.assignment || {
        ...assignment,
        status: "closed",
      });

      setSuccess(
        response.data.message ||
          "Assignment closed successfully."
      );
    } catch (err) {
      console.error("Failed to close assignment:", err);

      setActionError(
        err.response?.data?.message ||
          "Unable to close assignment."
      );
    } finally {
      setActionLoading(false);
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

  const formatDateTime = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleString("en-NG", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getStatusClasses = (status) => {
    switch (status) {
      case "published":
        return "bg-emerald-100 text-emerald-700";

      case "closed":
        return "bg-slate-100 text-slate-600";

      case "draft":
      default:
        return "bg-amber-100 text-amber-700";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "published":
        return "Published";

      case "closed":
        return "Closed";

      case "draft":
        return "Draft";

      default:
        return status || "Unknown";
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex items-center gap-3 text-slate-600">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading assignment...</span>
        </div>
      </div>
    );
  }

  if (error || !assignment) {
    return (
      <div className="space-y-6">
        <Link
          href="/dashboard/school-admin/assignments"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-emerald-600"
        >
          <ArrowLeft size={16} />
          Back to Assignments
        </Link>

        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
          <XCircle className="mx-auto h-10 w-10 text-red-500" />

          <h2 className="mt-4 text-lg font-semibold text-red-800">
            Unable to load assignment
          </h2>

          <p className="mt-2 text-sm text-red-700">
            {error || "Assignment not found."}
          </p>

          <button
            type="button"
            onClick={fetchAssignment}
            className="mt-5 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const teacherName = assignment.teacher
    ? `${assignment.teacher.firstName || ""} ${
        assignment.teacher.lastName || ""
      }`.trim()
    : "—";

  const className = assignment.schoolClass?.name || "—";

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Back */}
      <Link
        href="/dashboard/school-admin/assignments"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-emerald-600"
      >
        <ArrowLeft size={16} />
        Back to Assignments
      </Link>

      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
              <ClipboardList size={23} />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-900">
                  {assignment.title}
                </h1>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                    assignment.status
                  )}`}
                >
                  {getStatusLabel(assignment.status)}
                </span>
              </div>

              <p className="mt-2 text-sm text-slate-500">
                Review this assignment before making it available to
                students.
              </p>
            </div>
          </div>

          {/* Admin action */}
          <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
            {assignment.status === "draft" && (
              <button
                type="button"
                onClick={handlePublish}
                disabled={actionLoading}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {actionLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 size={17} />
                )}

                {actionLoading
                  ? "Publishing..."
                  : "Publish Assignment"}
              </button>
            )}

            {assignment.status === "published" && (
              <button
                type="button"
                onClick={handleClose}
                disabled={actionLoading}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {actionLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <XCircle size={17} />
                )}

                {actionLoading
                  ? "Closing..."
                  : "Close Assignment"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Action feedback */}
      {actionError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {actionError}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          <CheckCircle2 size={17} />
          {success}
        </div>
      )}

      {/* Assignment overview */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <BookOpen size={19} />
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Subject
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-900">
                {assignment.subject?.name || "—"}
              </p>

              {assignment.subject?.code && (
                <p className="mt-0.5 text-xs text-slate-400">
                  {assignment.subject.code}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
              <GraduationCap size={19} />
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Class
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-900">
                {className}
              </p>

              {assignment.schoolClass?.arm && (
                <p className="mt-0.5 text-xs text-slate-400">
                  {assignment.schoolClass.arm}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <User size={19} />
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Teacher
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-900">
                {teacherName}
              </p>

              {assignment.teacher?.email && (
                <p className="mt-0.5 truncate text-xs text-slate-400">
                  {assignment.teacher.email}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
              <CalendarDays size={19} />
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Due Date
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-900">
                {formatDate(assignment.dueDate)}
              </p>

              <p className="mt-0.5 text-xs text-slate-400">
                {new Date(assignment.dueDate).toLocaleTimeString(
                  "en-NG",
                  {
                    hour: "numeric",
                    minute: "2-digit",
                  }
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Academic information */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-slate-900">
            Academic Information
          </h2>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Academic Session
            </p>

            <p className="mt-1 text-sm font-semibold text-slate-800">
              {assignment.academicSession?.name || "—"}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Academic Term
            </p>

            <p className="mt-1 text-sm font-semibold text-slate-800">
              {assignment.term?.name || "—"}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Created
            </p>

            <p className="mt-1 text-sm font-semibold text-slate-800">
              {formatDateTime(assignment.createdAt)}
            </p>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
            <FileText size={18} />
          </div>

          <h2 className="text-lg font-semibold text-slate-900">
            Description
          </h2>
        </div>

        {assignment.description ? (
          <div className="whitespace-pre-wrap text-sm leading-7 text-slate-600">
            {assignment.description}
          </div>
        ) : (
          <p className="text-sm italic text-slate-400">
            No description was provided.
          </p>
        )}
      </div>

      {/* Instructions */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
            <ClipboardList size={18} />
          </div>

          <h2 className="text-lg font-semibold text-slate-900">
            Instructions
          </h2>
        </div>

        {assignment.instructions ? (
          <div className="whitespace-pre-wrap text-sm leading-7 text-slate-600">
            {assignment.instructions}
          </div>
        ) : (
          <p className="text-sm italic text-slate-400">
            No specific instructions were provided.
          </p>
        )}
      </div>

      {/* Attachment */}
      {assignment.attachmentUrl && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
              <FileText size={18} />
            </div>

            <h2 className="text-lg font-semibold text-slate-900">
              Attachment
            </h2>
          </div>

          <a
            href={assignment.attachmentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <FileText size={16} />

            {assignment.attachmentName ||
              "Open Assignment Attachment"}
          </a>
        </div>
      )}

      {/* Status information */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <Clock className="mt-0.5 h-5 w-5 shrink-0 text-slate-500" />

          <div>
            <h2 className="font-semibold text-slate-900">
              Assignment Status
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              {assignment.status === "draft" &&
                "This assignment was created by a teacher and is waiting for administrative review and publication."}

              {assignment.status === "published" &&
                "This assignment has been published and is currently available to the appropriate students."}

              {assignment.status === "closed" &&
                "This assignment has been closed and is no longer accepting student submissions."}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom action */}
      {assignment.status === "draft" && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-emerald-900">
                Ready to publish?
              </h2>

              <p className="mt-1 text-sm text-emerald-700">
                Publishing this assignment will make it available to
                students in the assigned class.
              </p>
            </div>

            <button
              type="button"
              onClick={handlePublish}
              disabled={actionLoading}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {actionLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 size={17} />
              )}

              Publish Assignment
            </button>
          </div>
        </div>
      )}
    </div>
  );
}