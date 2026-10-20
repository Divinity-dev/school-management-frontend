"use client";

import { useEffect, useState } from "react";
import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  User,
  Users,
  Trophy,
  TrendingUp,
  ChevronRight,
  Megaphone,
} from "lucide-react";
import Link from "next/link";

import api from "@/lib/api";

const formatDate = (date) => {
  if (!date) return "—";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "—";
  }

  return parsedDate.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const getFullName = (user) => {
  return [user?.firstName, user?.middleName, user?.lastName]
    .filter(Boolean)
    .join(" ");
};

export default function StudentDashboard({ user }) {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/student-portal/dashboard");

        setDashboard(response.data);
      } catch (err) {
        console.error("Failed to fetch student dashboard:", err);

        setError(
          err.response?.data?.message ||
            "Failed to load your dashboard."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-800" />

          <p className="mt-3 text-sm text-slate-500">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
        <p className="text-sm font-medium text-red-700">
          {error}
        </p>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <p className="text-sm text-slate-500">
          No dashboard data available.
        </p>
      </div>
    );
  }

  const {
    student,
    school,
    schoolClass,
    academicSession,
    currentTerm,
    parent,
    assignmentStats,
    attendance,
    results,
    recentAssignments,
    recentAttendance,
  } = dashboard;

  const studentName =
    getFullName(student) ||
    getFullName(user) ||
    "Student";

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <section className="overflow-hidden rounded-3xl bg-slate-900 p-6 text-white shadow-sm sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-300">
              Student Portal
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
              Welcome, {student?.firstName || user?.firstName}
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              View your academic progress, assignments,
              attendance and results.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-white/10 ring-1 ring-white/10">
              {student?.profileImage ? (
                <img
                  src={student.profileImage}
                  alt={studentName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <GraduationCap className="h-8 w-8 text-white" />
              )}
            </div>

            <div>
              <p className="font-semibold">
                {studentName}
              </p>

              <p className="mt-1 text-sm text-slate-300">
                {student?.studentId || "—"}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <HeaderInfo
            icon={<BookOpen className="h-4 w-4" />}
            label="Class"
            value={
              schoolClass?.name
                ? `${schoolClass.name}${
                    schoolClass.arm
                      ? ` ${schoolClass.arm}`
                      : ""
                  }`
                : "—"
            }
          />

          <HeaderInfo
            icon={<CalendarDays className="h-4 w-4" />}
            label="Academic Session"
            value={academicSession?.name || "—"}
          />

          <HeaderInfo
            icon={<Clock3 className="h-4 w-4" />}
            label="Current Term"
            value={currentTerm?.name || "No current term"}
          />
        </div>
      </section>

      {/* Statistics */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardStat
          icon={<FileText className="h-5 w-5" />}
          label="Assignments"
          value={assignmentStats?.total || 0}
          description="Published assignments"
        />

        <DashboardStat
          icon={<Clock3 className="h-5 w-5" />}
          label="Pending"
          value={assignmentStats?.pending || 0}
          description="Awaiting submission"
        />

        <DashboardStat
          icon={<CheckCircle2 className="h-5 w-5" />}
          label="Graded"
          value={assignmentStats?.graded || 0}
          description="Graded submissions"
        />

        <DashboardStat
          icon={<CalendarDays className="h-5 w-5" />}
          label="Attendance"
          value={`${attendance?.percentage || 0}%`}
          description={`${attendance?.attended || 0} days attended`}
        />
      </section>

      {/* Quick Links */}
      <StudentQuickLinks />

      {/* Results */}
      <StudentResultsCard
        results={results}
        currentTerm={currentTerm}
      />

      {/* Main content */}
      <div className="grid gap-6 xl:grid-cols-2">
        {/* Recent Assignments */}
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <h2 className="font-semibold text-slate-900">
                Recent Assignments
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Your latest published assignments
              </p>
            </div>

            <Link
              href="/dashboard/student/assignments"
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            >
              View all
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {recentAssignments?.length > 0 ? (
              recentAssignments.map((assignment) => (
                <Link
                  key={assignment._id}
                  href={`/dashboard/student/assignments/${assignment._id}`}
                  className="group block px-5 py-4 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-slate-300"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-slate-900 group-hover:text-slate-700">
                            {assignment.title}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {assignment.subject?.name ||
                              "Subject not specified"}
                          </p>
                        </div>

                        <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-500" />
                      </div>
                    </div>

                    <AssignmentStatus
                      status={assignment.submissionStatus}
                    />
                  </div>

                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                    <span>
                      Due: {formatDate(assignment.dueDate)}
                    </span>

                    {assignment.teacher && (
                      <span>
                        Teacher:{" "}
                        {getFullName(assignment.teacher)}
                      </span>
                    )}
                  </div>
                </Link>
              ))
            ) : (
              <EmptyState
                icon={<FileText className="h-6 w-6" />}
                title="No assignments"
                description="You don't have any published assignments yet."
              />
            )}
          </div>
        </section>

        {/* Recent Attendance */}
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <h2 className="font-semibold text-slate-900">
                Recent Attendance
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Your latest attendance records
              </p>
            </div>

            <CalendarDays className="h-5 w-5 text-slate-400" />
          </div>

          <div className="divide-y divide-slate-100">
            {recentAttendance?.length > 0 ? (
              recentAttendance.map((record) => (
                <div
                  key={record._id}
                  className="flex items-center justify-between gap-4 px-5 py-4"
                >
                  <div>
                    <p className="font-medium text-slate-900">
                      {formatDate(record.date)}
                    </p>

                    {record.remarks && (
                      <p className="mt-1 text-xs text-slate-500">
                        {record.remarks}
                      </p>
                    )}
                  </div>

                  <AttendanceStatus
                    status={record.status}
                  />
                </div>
              ))
            ) : (
              <EmptyState
                icon={<CalendarDays className="h-6 w-6" />}
                title="No attendance records"
                description="Attendance records will appear here once they are added."
              />
            )}
          </div>

          <div className="border-t border-slate-100 p-5">
            <AttendanceSummary
              attendance={attendance}
            />
          </div>
        </section>
      </div>

      {/* School and Parent */}
      <div className="grid gap-6 xl:grid-cols-2">
        <InfoCard
          icon={<GraduationCap className="h-5 w-5" />}
          title="School Information"
        >
          <InfoRow
            icon={<GraduationCap className="h-4 w-4" />}
            label="School"
            value={school?.name || "—"}
          />

          <InfoRow
            icon={<MapPin className="h-4 w-4" />}
            label="Address"
            value={school?.address || "—"}
          />

          <InfoRow
            icon={<Phone className="h-4 w-4" />}
            label="Phone"
            value={school?.phone || "—"}
          />

          <InfoRow
            icon={<Mail className="h-4 w-4" />}
            label="Email"
            value={school?.email || "—"}
          />
        </InfoCard>

        <InfoCard
          icon={<Users className="h-5 w-5" />}
          title="Parent / Guardian"
        >
          {parent ? (
            <>
              <InfoRow
                icon={<User className="h-4 w-4" />}
                label="Name"
                value={getFullName(parent)}
              />

              <InfoRow
                icon={<Mail className="h-4 w-4" />}
                label="Email"
                value={parent.email || "—"}
              />

              <InfoRow
                icon={<Phone className="h-4 w-4" />}
                label="Phone"
                value={parent.phone || "—"}
              />
            </>
          ) : (
            <EmptyState
              icon={<Users className="h-6 w-6" />}
              title="No parent linked"
              description="No parent or guardian has been linked to your student record."
            />
          )}
        </InfoCard>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Student Quick Links                                                        */
/* -------------------------------------------------------------------------- */

function StudentQuickLinks() {
  const links = [
    {
      href: "/dashboard/student/assignments",
      icon: <FileText className="h-5 w-5" />,
      title: "Assignments",
      description: "View and submit your assignments",
    },
    {
      href: "/dashboard/student/results",
      icon: <Trophy className="h-5 w-5" />,
      title: "Results",
      description: "View your academic results",
    },
    {
      href: "/dashboard/student/attendance",
      icon: <CalendarDays className="h-5 w-5" />,
      title: "Attendance",
      description: "View your attendance records",
    },
    {
      href: "/dashboard/student/profile",
      icon: <User className="h-5 w-5" />,
      title: "My Profile",
      description: "View your personal information",
    },
    {
      href: "/dashboard/student/announcements",
      icon: <Megaphone className="h-5 w-5" />,
      title: "Announcements",
      description: "View school announcements",
    },
  ];

  return (
    <section>
      <div className="mb-4">
        <h2 className="font-semibold text-slate-900">
          Quick Links
        </h2>

        <p className="mt-1 text-xs text-slate-500">
          Quickly access your student portal sections.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition group-hover:bg-slate-900 group-hover:text-white">
                {link.icon}
              </div>

              <ChevronRight className="h-5 w-5 text-slate-300 transition group-hover:translate-x-1 group-hover:text-slate-600" />
            </div>

            <h3 className="mt-4 font-semibold text-slate-900">
              {link.title}
            </h3>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              {link.description}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Header Info                                                                */
/* -------------------------------------------------------------------------- */

function HeaderInfo({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white/5 px-4 py-3 ring-1 ring-white/10">
      <div className="text-slate-300">{icon}</div>

      <div className="min-w-0">
        <p className="text-xs text-slate-400">
          {label}
        </p>

        <p className="truncate text-sm font-medium text-white">
          {value}
        </p>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Dashboard Stat                                                             */
/* -------------------------------------------------------------------------- */

function DashboardStat({
  icon,
  label,
  value,
  description,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
          {icon}
        </div>
      </div>

      <p className="mt-4 text-sm font-medium text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-2xl font-bold text-slate-900">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {description}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Results                                                                    */
/* -------------------------------------------------------------------------- */

function StudentResultsCard({
  results,
  currentTerm,
}) {
  const resultItems = results?.items || [];
  const stats = results?.stats || {};

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
            <Trophy className="h-5 w-5" />
          </div>

          <div>
            <h2 className="font-semibold text-slate-900">
              Academic Results
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              {currentTerm?.name || "Current Term"} results
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {resultItems.length > 0 && (
            <>
              <ResultSummary
                label="Subjects"
                value={stats.totalSubjects || 0}
              />

              <ResultSummary
                label="Average"
                value={`${stats.average || 0}%`}
              />
            </>
          )}

          <Link
            href="/dashboard/student/results"
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
          >
            View all
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {resultItems.length === 0 ? (
        <EmptyState
          icon={<Trophy className="h-6 w-6" />}
          title="No published results"
          description="Your results will appear here once they are published."
        />
      ) : (
        <>
          <div className="grid gap-4 p-5 sm:grid-cols-3">
            <ResultMetric
              icon={<TrendingUp className="h-5 w-5" />}
              label="Average Score"
              value={`${stats.average || 0}%`}
            />

            <ResultMetric
              icon={<Trophy className="h-5 w-5" />}
              label="Highest Score"
              value={`${stats.highest || 0}%`}
            />

            <ResultMetric
              icon={<BookOpen className="h-5 w-5" />}
              label="Subjects"
              value={stats.totalSubjects || 0}
            />
          </div>

          <div className="overflow-x-auto border-t border-slate-100">
            <table className="w-full min-w-[700px] text-left">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Subject
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    CA
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Exam
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Total
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Grade
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Remark
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {resultItems.map((result) => (
                  <tr
                    key={result._id}
                    className="hover:bg-slate-50"
                  >
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-medium text-slate-900">
                          {result.subject?.name ||
                            "Unknown Subject"}
                        </p>

                        {result.subject?.code && (
                          <p className="mt-1 text-xs text-slate-500">
                            {result.subject.code}
                          </p>
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600">
                      {result.caScore}
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600">
                      {result.examScore}
                    </td>

                    <td className="px-5 py-4">
                      <span className="font-semibold text-slate-900">
                        {result.total}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <GradeBadge
                        grade={result.grade}
                      />
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600">
                      {result.remark || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}

function ResultSummary({ label, value }) {
  return (
    <div className="rounded-lg bg-slate-50 px-3 py-2">
      <span className="text-xs text-slate-500">
        {label}
      </span>

      <span className="ml-2 text-sm font-semibold text-slate-900">
        {value}
      </span>
    </div>
  );
}

function ResultMetric({
  icon,
  label,
  value,
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-slate-700 shadow-sm">
          {icon}
        </div>

        <div>
          <p className="text-xs font-medium text-slate-500">
            {label}
          </p>

          <p className="mt-1 text-lg font-bold text-slate-900">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function GradeBadge({ grade }) {
  if (!grade) {
    return (
      <span className="text-sm text-slate-500">
        —
      </span>
    );
  }

  return (
    <span className="inline-flex min-w-10 items-center justify-center rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
      {grade}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* Assignment Status                                                          */
/* -------------------------------------------------------------------------- */

function AssignmentStatus({ status }) {
  const config = {
    not_submitted: {
      label: "Not submitted",
      className: "bg-amber-50 text-amber-700",
    },
    submitted: {
      label: "Submitted",
      className: "bg-blue-50 text-blue-700",
    },
    graded: {
      label: "Graded",
      className: "bg-emerald-50 text-emerald-700",
    },
    returned: {
      label: "Returned",
      className: "bg-purple-50 text-purple-700",
    },
  };

  const current =
    config[status] || config.not_submitted;

  return (
    <span
      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${current.className}`}
    >
      {current.label}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* Attendance Status                                                          */
/* -------------------------------------------------------------------------- */

function AttendanceStatus({ status }) {
  const config = {
    present: {
      label: "Present",
      className: "bg-emerald-50 text-emerald-700",
    },
    absent: {
      label: "Absent",
      className: "bg-red-50 text-red-700",
    },
    late: {
      label: "Late",
      className: "bg-amber-50 text-amber-700",
    },
    excused: {
      label: "Excused",
      className: "bg-blue-50 text-blue-700",
    },
  };

  const current = config[status] || {
    label: status || "Unknown",
    className: "bg-slate-100 text-slate-600",
  };

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${current.className}`}
    >
      {current.label}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* Attendance Summary                                                         */
/* -------------------------------------------------------------------------- */

function AttendanceSummary({ attendance }) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-medium text-slate-700">
          Attendance rate
        </span>

        <span className="text-sm font-bold text-slate-900">
          {attendance?.percentage || 0}%
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-slate-800"
          style={{
            width: `${Math.min(
              attendance?.percentage || 0,
              100
            )}%`,
          }}
        />
      </div>

      <div className="mt-3 grid grid-cols-4 gap-2 text-center">
        <AttendanceCount
          label="Present"
          value={attendance?.present || 0}
        />

        <AttendanceCount
          label="Absent"
          value={attendance?.absent || 0}
        />

        <AttendanceCount
          label="Late"
          value={attendance?.late || 0}
        />

        <AttendanceCount
          label="Excused"
          value={attendance?.excused || 0}
        />
      </div>
    </div>
  );
}

function AttendanceCount({ label, value }) {
  return (
    <div className="rounded-lg bg-slate-50 px-2 py-2">
      <p className="text-sm font-bold text-slate-900">
        {value}
      </p>

      <p className="mt-1 text-[10px] text-slate-500">
        {label}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Info Card                                                                  */
/* -------------------------------------------------------------------------- */

function InfoCard({ icon, title, children }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
          {icon}
        </div>

        <h2 className="font-semibold text-slate-900">
          {title}
        </h2>
      </div>

      <div className="space-y-4">{children}</div>
    </section>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex gap-3">
      <div className="mt-0.5 text-slate-400">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-xs text-slate-500">
          {label}
        </p>

        <p className="mt-1 break-words text-sm font-medium text-slate-900">
          {value}
        </p>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Empty State                                                                */
/* -------------------------------------------------------------------------- */

function EmptyState({
  icon,
  title,
  description,
}) {
  return (
    <div className="flex flex-col items-center justify-center px-5 py-10 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
        {icon}
      </div>

      <p className="mt-3 text-sm font-semibold text-slate-700">
        {title}
      </p>

      <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">
        {description}
      </p>
    </div>
  );
}