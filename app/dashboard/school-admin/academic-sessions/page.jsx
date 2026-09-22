"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Plus,
  Search,
  XCircle,
} from "lucide-react";

import api from "@/lib/api";

export default function AcademicSessionsPage() {
  const router = useRouter();

  const [sessions, setSessions] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // --------------------------------------------------
  // Load academic sessions
  // --------------------------------------------------

  useEffect(() => {
    const loadSessions = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/academic-sessions");

        setSessions(response.data?.sessions || []);
      } catch (err) {
        console.error(
          "Failed to load academic sessions:",
          err
        );

        setError(
          err?.response?.data?.message ||
            "Failed to load academic sessions. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    loadSessions();
  }, []);

  // --------------------------------------------------
  // Filter sessions
  // --------------------------------------------------

  const filteredSessions = useMemo(() => {
    const query = search.trim().toLowerCase();

    return sessions.filter((session) => {
      const name = session.name?.toLowerCase() || "";

      const matchesSearch =
        !query || name.includes(query);

      const isActive = session.isActive !== false;

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && isActive) ||
        (statusFilter === "inactive" && !isActive);

      return matchesSearch && matchesStatus;
    });
  }, [sessions, search, statusFilter]);

  // --------------------------------------------------
  // Summary statistics
  // --------------------------------------------------

  const totalSessions = sessions.length;

  const activeSessions = sessions.filter(
    (session) => session.isActive !== false
  ).length;

  const inactiveSessions =
    totalSessions - activeSessions;

  // --------------------------------------------------
  // Date helper
  // --------------------------------------------------

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString(
      "en-NG",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  };

  // --------------------------------------------------
  // Loading state
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 text-slate-600">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-600" />
          <span>Loading academic sessions...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Academic Sessions
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage the academic sessions in your school.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            router.push(
              "/dashboard/school-admin/academic-sessions/new"
            )
          }
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4" />
          Add Session
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          <span>{error}</span>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="text-red-700 underline underline-offset-2 hover:text-red-900"
          >
            Retry
          </button>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard
          label="Total Sessions"
          value={totalSessions}
          icon={CalendarDays}
          iconClass="bg-slate-100 text-slate-600"
        />

        <SummaryCard
          label="Active Sessions"
          value={activeSessions}
          icon={CheckCircle2}
          iconClass="bg-emerald-50 text-emerald-600"
        />

        <SummaryCard
          label="Inactive Sessions"
          value={inactiveSessions}
          icon={XCircle}
          iconClass="bg-red-50 text-red-600"
        />
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="grid gap-4 lg:grid-cols-[1fr_200px]">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search academic sessions..."
              className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          {/* Status */}
          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          >
            <option value="all">
              All Status
            </option>

            <option value="active">
              Active
            </option>

            <option value="inactive">
              Inactive
            </option>
          </select>
        </div>
      </div>

      {/* Sessions Table */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
          <div>
            <h2 className="font-semibold text-slate-900">
              All Academic Sessions
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              {filteredSessions.length}{" "}
              {filteredSessions.length === 1
                ? "session"
                : "sessions"}{" "}
              shown
            </p>
          </div>
        </div>

        {filteredSessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
              <CalendarDays className="h-6 w-6" />
            </div>

            <h3 className="font-semibold text-slate-900">
              No academic sessions found
            </h3>

            <p className="mt-1 max-w-sm text-sm text-slate-500">
              {search ||
              statusFilter !== "all"
                ? "Try adjusting your search or filters."
                : "No academic sessions have been created yet."}
            </p>

            {!search &&
              statusFilter === "all" && (
                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      "/dashboard/school-admin/academic-sessions/new"
                    )
                  }
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
                >
                  <Plus className="h-4 w-4" />
                  Add Session
                </button>
              )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Academic Session
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Start Date
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    End Date
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Current
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredSessions.map((session) => {
                  const isActive =
                    session.isActive !== false;

                  return (
                    <tr
                      key={session._id}
                      className="transition hover:bg-slate-50"
                    >
                      {/* Session */}
                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() =>
                            router.push(
                              `/dashboard/school-admin/academic-sessions/${session._id}`
                            )
                          }
                          className="flex items-center gap-3 text-left"
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                            <CalendarDays className="h-5 w-5" />
                          </div>

                          <div>
                            <p className="font-semibold text-slate-900 transition hover:text-emerald-600">
                              {session.name}
                            </p>

                            <p className="text-xs text-slate-500">
                              Academic Session
                            </p>
                          </div>
                        </button>
                      </td>

                      {/* Start Date */}
                      <td className="px-5 py-4 text-sm text-slate-600">
                        {formatDate(session.startDate)}
                      </td>

                      {/* End Date */}
                      <td className="px-5 py-4 text-sm text-slate-600">
                        {formatDate(session.endDate)}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                            isActive
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {isActive
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </td>

                      {/* Current */}
                      <td className="px-5 py-4">
                        {session.isCurrent ? (
                          <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                            Current
                          </span>
                        ) : (
                          <span className="text-sm text-slate-400">
                            —
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            router.push(
                              `/dashboard/school-admin/academic-sessions/${session._id}`
                            )
                          }
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                        >
                          View
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

// --------------------------------------------------
// Summary Card
// --------------------------------------------------

function SummaryCard({
  label,
  value,
  icon: Icon,
  iconClass,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {label}
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {value}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}