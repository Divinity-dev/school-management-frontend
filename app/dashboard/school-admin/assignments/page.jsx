"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ClipboardList,
  Eye,
  RefreshCw,
  CalendarDays,
  User,
  BookOpen,
} from "lucide-react";
import api from "@/lib/api";

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/assignments/teacher");

      setAssignments(response.data.assignments || []);
    } catch (err) {
      console.error("Failed to load assignments:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load assignments."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Created Assignments
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Review assignments created by teachers and publish them for
          students.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between">
          <p>{error}</p>

          <button
            type="button"
            onClick={fetchAssignments}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 font-medium text-red-700 hover:bg-red-100"
          >
            <RefreshCw size={16} />
            Try Again
          </button>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600" />

          <p className="mt-4 text-sm text-slate-500">
            Loading assignments...
          </p>
        </div>
      ) : assignments.length === 0 ? (
        /* Empty state */
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <ClipboardList size={26} />
          </div>

          <h2 className="mt-4 text-lg font-semibold text-slate-900">
            No assignments found
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
            Assignments created by teachers will appear here for
            review and publication.
          </p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:block">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Assignment
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Class
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Subject
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Teacher
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Due Date
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Status
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {assignments.map((assignment) => (
                    <tr
                      key={assignment._id}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                    >
                      {/* Assignment */}
                      <td className="px-6 py-4">
                        <div className="max-w-xs">
                          <p className="font-semibold text-slate-900">
                            {assignment.title}
                          </p>

                          <p className="mt-1 line-clamp-1 text-xs text-slate-500">
                            {assignment.academicSession?.name ||
                              "No session"}{" "}
                            ·{" "}
                            {assignment.term?.name ||
                              "No term"}
                          </p>
                        </div>
                      </td>

                      {/* Class */}
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {assignment.schoolClass?.name || "—"}

                        {assignment.schoolClass?.arm && (
                          <span className="text-slate-400">
                            {" "}
                            {assignment.schoolClass.arm}
                          </span>
                        )}
                      </td>

                      {/* Subject */}
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-slate-700">
                          {assignment.subject?.name || "—"}
                        </p>

                        {assignment.subject?.code && (
                          <p className="text-xs text-slate-400">
                            {assignment.subject.code}
                          </p>
                        )}
                      </td>

                      {/* Teacher */}
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {assignment.teacher?.firstName || ""}{" "}
                        {assignment.teacher?.lastName || ""}
                      </td>

                      {/* Due date */}
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {formatDate(assignment.dueDate)}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${getStatusClasses(
                            assignment.status
                          )}`}
                        >
                          {assignment.status}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="px-6 py-4">
                        <div className="flex justify-end">
                          <Link
                            href={`/dashboard/school-admin/assignments/${assignment._id}`}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                          >
                            <Eye size={16} />
                            Review
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile cards */}
          <div className="space-y-4 md:hidden">
            {assignments.map((assignment) => (
              <div
                key={assignment._id}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="font-semibold text-slate-900">
                      {assignment.title}
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      {assignment.subject?.name || "No subject"}
                    </p>
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${getStatusClasses(
                      assignment.status
                    )}`}
                  >
                    {assignment.status}
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <BookOpen
                      size={16}
                      className="text-slate-400"
                    />

                    <span>
                      {assignment.schoolClass?.name || "No class"}
                      {assignment.schoolClass?.arm
                        ? ` ${assignment.schoolClass.arm}`
                        : ""}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <User
                      size={16}
                      className="text-slate-400"
                    />

                    <span>
                      {assignment.teacher?.firstName || ""}{" "}
                      {assignment.teacher?.lastName || ""}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <CalendarDays
                      size={16}
                      className="text-slate-400"
                    />

                    <span>
                      Due {formatDate(assignment.dueDate)}
                    </span>
                  </div>

                  <div className="text-sm text-slate-500">
                    {assignment.academicSession?.name || "No session"}{" "}
                    · {assignment.term?.name || "No term"}
                  </div>
                </div>

                <div className="mt-4">
                  <Link
                    href={`/dashboard/school-admin/assignments/${assignment._id}`}
                    className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                  >
                    <Eye size={16} />
                    Review Assignment
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}