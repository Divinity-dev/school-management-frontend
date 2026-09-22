"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  CalendarDays,
  Eye,
  Pencil,
  RefreshCw,
} from "lucide-react";
import api from "@/lib/api";

export default function AcademicTermsPage() {
  const [terms, setTerms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTerms = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/academic-terms");

      setTerms(response.data.terms || []);
    } catch (err) {
      console.error("Failed to load academic terms:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load academic terms."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTerms();
  }, []);

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Academic Terms
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage academic terms for your school.
          </p>
        </div>

        <Link
          href="/dashboard/school-admin/academic-terms/new"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
        >
          <Plus size={18} />
          Add Academic Term
        </Link>
      </div>

      {/* Error */}
      {error && (
        <div className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between">
          <p>{error}</p>

          <button
            type="button"
            onClick={fetchTerms}
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
            Loading academic terms...
          </p>
        </div>
      ) : terms.length === 0 ? (
        /* Empty state */
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <CalendarDays size={26} />
          </div>

          <h2 className="mt-4 text-lg font-semibold text-slate-900">
            No academic terms found
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
            Create your first academic term to start managing your
            school&apos;s academic calendar.
          </p>

          <Link
            href="/dashboard/school-admin/academic-terms/new"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            <Plus size={18} />
            Add Academic Term
          </Link>
        </div>
      ) : (
        /* Terms */
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* Desktop table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Term
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Academic Session
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Start Date
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    End Date
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {terms.map((term) => (
                  <tr
                    key={term._id}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                  >
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900">
                        {term.name}
                      </p>

                      {term.isCurrent && (
                        <span className="mt-1 inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                          Current Term
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {term.academicSession?.name || "—"}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {formatDate(term.startDate)}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {formatDate(term.endDate)}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          term.isActive
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {term.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/dashboard/school-admin/academic-terms/${term._id}`}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                        >
                          <Eye size={16} />
                          View
                        </Link>

                        <Link
                          href={`/dashboard/school-admin/academic-terms/${term._id}/edit`}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50"
                        >
                          <Pencil size={16} />
                          Edit
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="divide-y divide-slate-100 md:hidden">
            {terms.map((term) => (
              <div key={term._id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-semibold text-slate-900">
                      {term.name}
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      {term.academicSession?.name || "No session"}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        term.isActive
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {term.isActive ? "Active" : "Inactive"}
                    </span>

                    {term.isCurrent && (
                      <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
                        Current
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-slate-400">Start Date</p>
                    <p className="mt-1 font-medium text-slate-700">
                      {formatDate(term.startDate)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">End Date</p>
                    <p className="mt-1 font-medium text-slate-700">
                      {formatDate(term.endDate)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <Link
                    href={`/dashboard/school-admin/academic-terms/${term._id}`}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                  >
                    <Eye size={16} />
                    View
                  </Link>

                  <Link
                    href={`/dashboard/school-admin/academic-terms/${term._id}/edit`}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-emerald-200 px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50"
                  >
                    <Pencil size={16} />
                    Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}