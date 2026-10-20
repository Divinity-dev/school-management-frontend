"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  GraduationCap,
  Loader2,
  TrendingUp,
  XCircle,
} from "lucide-react";

import api from "@/lib/api";

export default function ParentChildAttendance({ studentId }) {
  const [student, setStudent] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [summary, setSummary] = useState(null);
  const [terms, setTerms] = useState([]);
  const [selectedTerm, setSelectedTerm] = useState("");

  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [error, setError] = useState("");

  // ---------------------------------------------------------
  // Fetch child, academic terms and attendance
  // ---------------------------------------------------------
  useEffect(() => {
    if (!studentId) return;

    const fetchAttendanceData = async () => {
      try {
        setLoading(true);
        setError("");

        const [childResponse, attendanceResponse] = await Promise.all([
          api.get(`/parents/children/${studentId}`),
          api.get(`/parents/children/${studentId}/attendance`),
        ]);

        const child = childResponse.data?.child || null;
        const records = attendanceResponse.data?.attendance || [];

        setStudent(child);
        setAttendance(records);

        // ---------------------------------------------------
        // Fetch actual academic terms for the child's session
        // ---------------------------------------------------
        const sessionId =
          child?.academicSession?._id || child?.academicSession;

        if (!sessionId) {
          setTerms([]);
          setSelectedTerm("");
          return;
        }

        const termsResponse = await api.get(
          `/academic-terms/session/${sessionId}`
        );

        const fetchedTerms =
          termsResponse.data?.terms ||
          termsResponse.data?.academicTerms ||
          [];

        setTerms(fetchedTerms);

        // Prefer the current term if one exists.
        const currentTerm = fetchedTerms.find(
          (term) => term.isCurrent === true
        );

        const firstTerm = fetchedTerms[0];

        const defaultTerm = currentTerm || firstTerm;

        if (defaultTerm?._id) {
          setSelectedTerm(defaultTerm._id);
        }
      } catch (err) {
        console.error("Failed to fetch parent attendance:", err);

        setError(
          err.response?.data?.message ||
            "Failed to load attendance information."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceData();
  }, [studentId]);

  // ---------------------------------------------------------
  // Fetch summary whenever selected term changes
  // ---------------------------------------------------------
  useEffect(() => {
    if (!studentId || !selectedTerm) {
      setSummary(null);
      return;
    }

    const fetchSummary = async () => {
      try {
        setSummaryLoading(true);

        const response = await api.get(
          `/parents/children/${studentId}/attendance/summary`,
          {
            params: {
              term: selectedTerm,
            },
          }
        );

        setSummary(response.data?.summary || null);
      } catch (err) {
        console.error("Failed to fetch attendance summary:", err);

        setSummary(null);

        setError(
          err.response?.data?.message ||
            "Failed to load attendance summary."
        );
      } finally {
        setSummaryLoading(false);
      }
    };

    fetchSummary();
  }, [studentId, selectedTerm]);

  // ---------------------------------------------------------
  // Filter attendance by selected term
  // ---------------------------------------------------------
  const filteredAttendance = useMemo(() => {
    if (!selectedTerm) return [];

    return attendance.filter(
      (record) => record.term?._id?.toString() === selectedTerm.toString()
    );
  }, [attendance, selectedTerm]);

  // ---------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------
  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "present":
        return "Present";
      case "absent":
        return "Absent";
      case "late":
        return "Late";
      case "excused":
        return "Excused";
      default:
        return status || "Unknown";
    }
  };

  const getStatusClasses = (status) => {
    switch (status) {
      case "present":
        return "bg-emerald-50 text-emerald-700";

      case "absent":
        return "bg-red-50 text-red-700";

      case "late":
        return "bg-amber-50 text-amber-700";

      case "excused":
        return "bg-blue-50 text-blue-700";

      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "present":
        return <CheckCircle2 className="h-4 w-4" />;

      case "absent":
        return <XCircle className="h-4 w-4" />;

      case "late":
        return <Clock3 className="h-4 w-4" />;

      case "excused":
        return <AlertCircle className="h-4 w-4" />;

      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  // ---------------------------------------------------------
  // Loading state
  // ---------------------------------------------------------
  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="flex items-center gap-3 text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading attendance...</span>
          </div>
        </div>
      </main>
    );
  }

  // ---------------------------------------------------------
  // Error state
  // ---------------------------------------------------------
  if (error && !student) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="rounded-2xl border border-red-100 bg-red-50 p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 text-red-600" />

              <div>
                <h2 className="font-semibold text-red-800">
                  Unable to load attendance
                </h2>

                <p className="mt-1 text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const attendancePercentage = summary?.attendancePercentage ?? 0;

  return (
    <main className="min-h-screen bg-slate-50">
      {/* ---------------------------------------------------
          Header
      --------------------------------------------------- */}
      <section className="bg-slate-900">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2 text-sm text-slate-400">
                <GraduationCap className="h-4 w-4" />
                <span>Parent Portal</span>
                <span>/</span>
                <span>Attendance</span>
              </div>

              <h1 className="text-2xl font-bold text-white sm:text-3xl">
                {student
                  ? `${student.firstName} ${student.lastName}`
                  : "Student Attendance"}
              </h1>

              <p className="mt-2 text-sm text-slate-400">
                View your child's attendance records and attendance summary.
              </p>
            </div>

            {student?.studentId && (
              <div className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-3">
                <p className="text-xs text-slate-400">Student ID</p>
                <p className="mt-1 font-semibold text-white">
                  {student.studentId}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* ---------------------------------------------------
            Term selector
        --------------------------------------------------- */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-slate-700" />

                <h2 className="font-semibold text-slate-900">
                  Attendance by Term
                </h2>
              </div>

              <p className="mt-1 text-sm text-slate-500">
                Select an academic term to view attendance.
              </p>
            </div>

            <div className="w-full sm:w-64">
              <select
                value={selectedTerm}
                onChange={(e) => setSelectedTerm(e.target.value)}
                disabled={terms.length === 0}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-100"
              >
                {terms.length === 0 ? (
                  <option value="">No terms available</option>
                ) : (
                  terms.map((term) => (
                    <option key={term._id} value={term._id}>
                      {term.name}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>
        </div>

        {/* ---------------------------------------------------
            Error banner
        --------------------------------------------------- */}
        {error && student && (
          <div className="mb-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* ---------------------------------------------------
            No academic terms
        --------------------------------------------------- */}
        {terms.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <CalendarDays className="mx-auto h-10 w-10 text-slate-300" />

            <h2 className="mt-4 text-lg font-semibold text-slate-900">
              No academic terms found
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              There are currently no academic terms available for this
              student's academic session.
            </p>
          </div>
        ) : (
          <>
            {/* -------------------------------------------------
                Summary cards
            ------------------------------------------------- */}
            <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <SummaryCard
                icon={<CheckCircle2 className="h-5 w-5" />}
                label="Present"
                value={summaryLoading ? "..." : summary?.present ?? 0}
                iconClass="bg-emerald-50 text-emerald-600"
              />

              <SummaryCard
                icon={<XCircle className="h-5 w-5" />}
                label="Absent"
                value={summaryLoading ? "..." : summary?.absent ?? 0}
                iconClass="bg-red-50 text-red-600"
              />

              <SummaryCard
                icon={<Clock3 className="h-5 w-5" />}
                label="Late"
                value={summaryLoading ? "..." : summary?.late ?? 0}
                iconClass="bg-amber-50 text-amber-600"
              />

              <SummaryCard
                icon={<FileText className="h-5 w-5" />}
                label="Total Days"
                value={summaryLoading ? "..." : summary?.total ?? 0}
                iconClass="bg-blue-50 text-blue-600"
              />

              <SummaryCard
                icon={<TrendingUp className="h-5 w-5" />}
                label="Attendance"
                value={
                  summaryLoading
                    ? "..."
                    : `${attendancePercentage}%`
                }
                iconClass="bg-violet-50 text-violet-600"
              />
            </div>

            {/* -------------------------------------------------
                Attendance records
            ------------------------------------------------- */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-5 py-5">
                <h2 className="font-semibold text-slate-900">
                  Attendance Records
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {selectedTerm
                    ? terms.find((term) => term._id === selectedTerm)?.name ||
                      "Selected term"
                    : "Selected term"}
                </p>
              </div>

              {filteredAttendance.length === 0 ? (
                <div className="px-6 py-14 text-center">
                  <CalendarDays className="mx-auto h-10 w-10 text-slate-300" />

                  <h3 className="mt-4 font-semibold text-slate-900">
                    No attendance records yet
                  </h3>

                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                    No attendance has been recorded for{" "}
                    {terms.find((term) => term._id === selectedTerm)?.name ||
                      "this term"}{" "}
                    yet.
                  </p>
                </div>
              ) : (
                <>
                  {/* Desktop table */}
                  <div className="hidden overflow-x-auto md:block">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                        <tr>
                          <th className="px-5 py-4 font-semibold">Date</th>
                          <th className="px-5 py-4 font-semibold">Class</th>
                          <th className="px-5 py-4 font-semibold">Status</th>
                          <th className="px-5 py-4 font-semibold">
                            Marked By
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-100">
                        {filteredAttendance.map((record) => (
                          <tr
                            key={record._id}
                            className="transition hover:bg-slate-50"
                          >
                            <td className="px-5 py-4 font-medium text-slate-800">
                              {formatDate(record.date)}
                            </td>

                            <td className="px-5 py-4 text-slate-600">
                              {record.class?.name || "—"}
                              {record.class?.arm
                                ? ` ${record.class.arm}`
                                : ""}
                            </td>

                            <td className="px-5 py-4">
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${getStatusClasses(
                                  record.status
                                )}`}
                              >
                                {getStatusIcon(record.status)}
                                {getStatusLabel(record.status)}
                              </span>
                            </td>

                            <td className="px-5 py-4 text-slate-600">
                              {record.markedBy
                                ? `${record.markedBy.firstName || ""} ${
                                    record.markedBy.lastName || ""
                                  }`.trim()
                                : "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile cards */}
                  <div className="divide-y divide-slate-100 md:hidden">
                    {filteredAttendance.map((record) => (
                      <div key={record._id} className="p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-semibold text-slate-900">
                              {formatDate(record.date)}
                            </p>

                            <p className="mt-1 text-sm text-slate-500">
                              {record.class?.name || "—"}
                              {record.class?.arm
                                ? ` ${record.class.arm}`
                                : ""}
                            </p>
                          </div>

                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${getStatusClasses(
                              record.status
                            )}`}
                          >
                            {getStatusIcon(record.status)}
                            {getStatusLabel(record.status)}
                          </span>
                        </div>

                        {record.markedBy && (
                          <p className="mt-4 text-xs text-slate-500">
                            Marked by{" "}
                            <span className="font-medium text-slate-700">
                              {`${record.markedBy.firstName || ""} ${
                                record.markedBy.lastName || ""
                              }`.trim()}
                            </span>
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}

// ---------------------------------------------------------
// Summary Card
// ---------------------------------------------------------
function SummaryCard({ icon, label, value, iconClass }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {value}
          </p>
        </div>

        <div className={`rounded-xl p-3 ${iconClass}`}>{icon}</div>
      </div>
    </div>
  );
}