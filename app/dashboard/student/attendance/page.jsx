"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  Loader2,
  XCircle,
  CircleAlert,
} from "lucide-react";

import api from "@/lib/api";

const statusConfig = {
  present: {
    label: "Present",
    className:
      "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    icon: CheckCircle2,
  },
  absent: {
    label: "Absent",
    className: "bg-red-50 text-red-700 ring-red-600/20",
    icon: XCircle,
  },
  late: {
    label: "Late",
    className: "bg-amber-50 text-amber-700 ring-amber-600/20",
    icon: Clock3,
  },
  excused: {
    label: "Excused",
    className:
      "bg-blue-50 text-blue-700 ring-blue-600/20",
    icon: FileText,
  },
};

const formatDate = (date) => {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export default function StudentAttendancePage() {
  const [attendance, setAttendance] = useState([]);
  const [summary, setSummary] = useState(null);
  const [student, setStudent] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true);
        setError("");

        const [attendanceResponse, summaryResponse] =
          await Promise.all([
            api.get("/attendance/my"),
            api.get("/attendance/my/summary"),
          ]);

        setAttendance(
          attendanceResponse.data?.attendance || []
        );

        setStudent(
          attendanceResponse.data?.student ||
            summaryResponse.data?.student ||
            null
        );

        setSummary(summaryResponse.data?.summary || null);
      } catch (err) {
        console.error(
          "Fetch student attendance error:",
          err
        );

        setError(
          err.response?.data?.message ||
            "Unable to load your attendance records."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, []);

  const attendancePercentage = useMemo(() => {
    return Number(summary?.percentage || 0);
  }, [summary]);

  const stats = [
    {
      label: "Total Records",
      value: summary?.total ?? 0,
      icon: CalendarDays,
      iconClass: "text-slate-600",
      bgClass: "bg-slate-100",
    },
    {
      label: "Present",
      value: summary?.present ?? 0,
      icon: CheckCircle2,
      iconClass: "text-emerald-600",
      bgClass: "bg-emerald-50",
    },
    {
      label: "Late",
      value: summary?.late ?? 0,
      icon: Clock3,
      iconClass: "text-amber-600",
      bgClass: "bg-amber-50",
    },
    {
      label: "Absent",
      value: summary?.absent ?? 0,
      icon: XCircle,
      iconClass: "text-red-600",
      bgClass: "bg-red-50",
    },
    {
      label: "Excused",
      value: summary?.excused ?? 0,
      icon: FileText,
      iconClass: "text-blue-600",
      bgClass: "bg-blue-50",
    },
  ];

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[70vh] max-w-6xl items-center justify-center">
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading your attendance...
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <Link
            href="/dashboard/student"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </Link>

          <div className="rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
            <CircleAlert className="mx-auto mb-3 h-10 w-10 text-red-500" />

            <h1 className="text-lg font-semibold text-slate-900">
              Unable to load attendance
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              {error}
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard/student"
            className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </Link>

          <div>
            <p className="text-sm font-medium text-emerald-600">
              Student Portal
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Attendance
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              View your attendance record and attendance
              summary.
            </p>
          </div>
        </div>

        {/* Student information */}
        {student && (
          <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-semibold text-slate-900">
                  {[
                    student.firstName,
                    student.middleName,
                    student.lastName,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Student ID: {student.studentId || "—"}
                </p>
              </div>

              <div className="mt-3 text-sm text-slate-500 sm:mt-0">
                Attendance records
              </div>
            </div>
          </div>
        )}

        {/* Attendance percentage */}
        <div className="mb-6 overflow-hidden rounded-2xl bg-slate-900 p-6 shadow-sm">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-300">
                Attendance Percentage
              </p>

              <p className="mt-2 text-4xl font-bold tracking-tight text-white">
                {attendancePercentage}%
              </p>

              <p className="mt-2 text-sm text-slate-400">
                Late attendance is counted as attended.
              </p>
            </div>

            <div className="w-full max-w-xs">
              <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
                <span>Attendance</span>
                <span>{attendancePercentage}%</span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-emerald-400 transition-all"
                  style={{
                    width: `${Math.min(
                      Math.max(attendancePercentage, 0),
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Summary cards */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div
                  className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${stat.bgClass}`}
                >
                  <Icon
                    className={`h-5 w-5 ${stat.iconClass}`}
                  />
                </div>

                <p className="text-2xl font-bold text-slate-900">
                  {stat.value}
                </p>

                <p className="mt-1 text-xs font-medium text-slate-500">
                  {stat.label}
                </p>
              </div>
            );
          })}
        </div>

        {/* Attendance history */}
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
            <h2 className="text-lg font-semibold text-slate-900">
              Attendance History
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Your recorded attendance history.
            </p>
          </div>

          {attendance.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <CalendarDays className="mx-auto h-10 w-10 text-slate-300" />

              <h3 className="mt-4 text-sm font-semibold text-slate-900">
                No attendance records
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Your attendance records will appear here
                once they are recorded by the school.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-left">
                  <thead className="border-b border-slate-200 bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Date
                      </th>

                      <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Term
                      </th>

                      <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Status
                      </th>

                      <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Remarks
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {attendance.map((record) => {
                      const config =
                        statusConfig[record.status] ||
                        statusConfig.present;

                      const StatusIcon = config.icon;

                      return (
                        <tr
                          key={record._id}
                          className="transition hover:bg-slate-50"
                        >
                          <td className="px-6 py-4 text-sm font-medium text-slate-900">
                            {formatDate(record.date)}
                          </td>

                          <td className="px-6 py-4 text-sm text-slate-600">
                            {record.term?.name || "—"}
                          </td>

                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${config.className}`}
                            >
                              <StatusIcon className="h-3.5 w-3.5" />
                              {config.label}
                            </span>
                          </td>

                          <td className="px-6 py-4 text-sm text-slate-500">
                            {record.remarks || "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile list */}
              <div className="divide-y divide-slate-100 md:hidden">
                {attendance.map((record) => {
                  const config =
                    statusConfig[record.status] ||
                    statusConfig.present;

                  const StatusIcon = config.icon;

                  return (
                    <div
                      key={record._id}
                      className="p-5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {formatDate(record.date)}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {record.term?.name || "—"}
                          </p>
                        </div>

                        <span
                          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${config.className}`}
                        >
                          <StatusIcon className="h-3.5 w-3.5" />
                          {config.label}
                        </span>
                      </div>

                      {record.remarks && (
                        <p className="mt-3 text-sm text-slate-500">
                          {record.remarks}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}

