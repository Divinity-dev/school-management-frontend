"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  GraduationCap,
  Users,
  UserRound,
  Pencil,
  Power,
  Loader2,
  AlertCircle,
  CheckCircle2,
  CalendarDays,
} from "lucide-react";

import api from "@/lib/api";

export default function SubjectAssignmentDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const assignmentId = params?.id;

  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deactivating, setDeactivating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAssignment = async () => {
      if (!assignmentId) return;

      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          `/subject-assignments/${assignmentId}`
        );

        setAssignment(response.data?.assignment || null);
      } catch (err) {
        console.error("Failed to fetch subject assignment:", err);

        setError(
          err.response?.data?.message ||
            "Unable to load subject assignment."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAssignment();
  }, [assignmentId]);

  const handleDeactivate = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to deactivate this subject assignment?"
    );

    if (!confirmed) return;

    try {
      setDeactivating(true);
      setError("");

      const response = await api.patch(
        `/subject-assignments/${assignmentId}/deactivate`
      );

      setAssignment(response.data?.assignment || {
        ...assignment,
        isActive: false,
      });
    } catch (err) {
      console.error("Failed to deactivate assignment:", err);

      setError(
        err.response?.data?.message ||
          "Unable to deactivate subject assignment."
      );
    } finally {
      setDeactivating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-full px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[500px] w-full max-w-3xl items-center justify-center">
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
            Loading assignment...
          </div>
        </div>
      </div>
    );
  }

  if (error && !assignment) {
    return (
      <div className="min-h-full px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-3xl">
          <Link
            href="/dashboard/school-admin/subject-assignments"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-emerald-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Subject Assignments
          </Link>

          <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="min-h-full px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-3xl">
          <Link
            href="/dashboard/school-admin/subject-assignments"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-emerald-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Subject Assignments
          </Link>

          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
            <BookOpen className="mx-auto h-10 w-10 text-gray-400" />

            <h2 className="mt-4 text-lg font-semibold text-gray-900">
              Assignment not found
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              The subject assignment you're looking for does not exist.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const subject = assignment.subject;
  const schoolClass = assignment.schoolClass;
  const teacher = assignment.teacher;
  const session = assignment.academicSession;

  const classDisplay = [
    schoolClass?.name,
    schoolClass?.arm,
    schoolClass?.section,
  ]
    .filter(Boolean)
    .join(" ");

  const teacherName = teacher
    ? `${teacher.firstName || ""} ${teacher.lastName || ""}`.trim()
    : "—";

  return (
    <div className="min-h-full px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-3xl">
        {/* Back */}
        <div className="mb-6">
          <Link
            href="/dashboard/school-admin/subject-assignments"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-emerald-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Subject Assignments
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50">
            <BookOpen className="h-8 w-8 text-emerald-600" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900">
            {subject?.name || "Subject Assignment"}
          </h1>

          {subject?.code && (
            <p className="mt-1 text-sm font-medium text-gray-500">
              {subject.code}
            </p>
          )}

          <div className="mt-3 flex justify-center">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                assignment.isActive
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {assignment.isActive ? (
                <CheckCircle2 className="h-3.5 w-3.5" />
              ) : (
                <Power className="h-3.5 w-3.5" />
              )}

              {assignment.isActive ? "Active" : "Inactive"}
            </span>
          </div>
        </div>

        {/* Error after action */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Assignment Details */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-6 py-5 sm:px-8">
            <h2 className="text-lg font-semibold text-gray-900">
              Assignment Information
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Details about this subject assignment.
            </p>
          </div>

          <div className="divide-y divide-gray-100">
            {/* Subject */}
            <div className="flex items-start gap-4 px-6 py-5 sm:px-8">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
                <BookOpen className="h-5 w-5 text-emerald-600" />
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Subject
                </p>

                <p className="mt-1 font-semibold text-gray-900">
                  {subject?.name || "—"}
                </p>

                {subject?.code && (
                  <p className="mt-1 text-sm text-gray-500">
                    Code: {subject.code}
                  </p>
                )}
              </div>
            </div>

            {/* Class */}
            <div className="flex items-start gap-4 px-6 py-5 sm:px-8">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50">
                <Users className="h-5 w-5 text-blue-600" />
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Class
                </p>

                <p className="mt-1 font-semibold text-gray-900">
                  {classDisplay || "—"}
                </p>
              </div>
            </div>

            {/* Teacher */}
            <div className="flex items-start gap-4 px-6 py-5 sm:px-8">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-50">
                <UserRound className="h-5 w-5 text-purple-600" />
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Teacher
                </p>

                <p className="mt-1 font-semibold text-gray-900">
                  {teacherName}
                </p>

                {teacher?.email && (
                  <p className="mt-1 text-sm text-gray-500">
                    {teacher.email}
                  </p>
                )}
              </div>
            </div>

            {/* Academic Session */}
            <div className="flex items-start gap-4 px-6 py-5 sm:px-8">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50">
                <GraduationCap className="h-5 w-5 text-orange-600" />
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Academic Session
                </p>

                <p className="mt-1 font-semibold text-gray-900">
                  {session?.name || "—"}
                </p>

                {(session?.startDate || session?.endDate) && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                    <CalendarDays className="h-4 w-4" />

                    <span>
                      {session?.startDate
                        ? new Date(session.startDate).toLocaleDateString()
                        : "—"}
                      {" — "}
                      {session?.endDate
                        ? new Date(session.endDate).toLocaleDateString()
                        : "—"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 border-t border-gray-200 bg-gray-50 px-6 py-5 sm:flex-row sm:justify-end sm:px-8">
            <Link
              href={`/dashboard/school-admin/subject-assignments/${assignment._id}/edit`}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
            >
              <Pencil className="h-4 w-4" />
              Edit Assignment
            </Link>

            {assignment.isActive && (
              <button
                type="button"
                onClick={handleDeactivate}
                disabled={deactivating}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-5 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deactivating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Deactivating...
                  </>
                ) : (
                  <>
                    <Power className="h-4 w-4" />
                    Deactivate
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}