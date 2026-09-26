"use client";

import { useEffect, useState } from "react";

import {
  BookOpen,
  CalendarCheck,
  CheckCircle2,
  Clock3,
  GraduationCap,
  User,
  XCircle,
} from "lucide-react";

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

const getFullName = (student) => {
  return [
    student?.firstName,
    student?.middleName,
    student?.lastName,
  ]
    .filter(Boolean)
    .join(" ");
};

export default function StudentDashboard({ user }) {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStudentDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          "/student-portal/dashboard"
        );

        setDashboard(response.data);
      } catch (err) {
        console.error(
          "Failed to fetch student dashboard:",
          err
        );

        setError(
          err?.response?.data?.message ||
            "Unable to load your dashboard."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStudentDashboard();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-24 animate-pulse rounded-2xl bg-white" />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-28 animate-pulse rounded-2xl bg-white"
            />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div className="h-80 animate-pulse rounded-2xl bg-white" />
          <div className="h-80 animate-pulse rounded-2xl bg-white" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4">
        <p className="text-sm font-medium text-red-700">
          Unable to load dashboard
        </p>

        <p className="mt-1 text-xs text-red-600">
          {error}
        </p>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white px-5 py-8 text-center shadow-sm">
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
    recentAssignments,
    recentAttendance,
  } = dashboard;

  const studentName = getFullName(student);

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-medium text-emerald-600">
              Student Portal
            </p>

            <h1 className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">
              Welcome, {student?.firstName || user?.firstName || "Student"}
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Stay up to date with your academic activities and
              progress.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-emerald-50">
              {student?.profileImage ? (
                <img
                  src={student.profileImage}
                  alt={studentName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <User
                  size={20}
                  className="text-emerald-500"
                />
              )}
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-900">
                {studentName || "Student"}
              </p>

              <p className="text-xs text-slate-400">
                {student?.studentId || "—"}
              </p>
            </div>
          </div>
        </div>

        {/* Academic information */}
        <div className="mt-5 grid grid-cols-1 gap-3 border-t border-slate-100 pt-5 sm:grid-cols-3">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
              Class
            </p>

            <p className="mt-1 text-sm font-semibold text-slate-800">
              {schoolClass?.name || "—"}
              {schoolClass?.arm
                ? ` ${schoolClass.arm}`
                : ""}
            </p>
          </div>

          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
              Academic Session
            </p>

            <p className="mt-1 text-sm font-semibold text-slate-800">
              {academicSession?.name || "—"}
            </p>
          </div>

          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
              Current Term
            </p>

            <p className="mt-1 text-sm font-semibold text-slate-800">
              {currentTerm?.name || "No current term"}
            </p>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardStat
          title="Assignments"
          value={assignmentStats?.total ?? 0}
          description="Published this term"
          icon={BookOpen}
        />

        <DashboardStat
          title="Pending"
          value={assignmentStats?.pending ?? 0}
          description="Awaiting submission"
          icon={Clock3}
        />

        <DashboardStat
          title="Graded"
          value={assignmentStats?.graded ?? 0}
          description="Assignments graded"
          icon={CheckCircle2}
        />

        <DashboardStat
          title="Attendance"
          value={`${attendance?.percentage ?? 0}%`}
          description="Current term attendance"
          icon={CalendarCheck}
        />
      </section>

      {/* Main content */}
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Recent Assignments */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  Recent Assignments
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Your latest published assignments
                </p>
              </div>

              <BookOpen
                size={18}
                className="text-emerald-500"
              />
            </div>
          </div>

          {recentAssignments?.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {recentAssignments.map((assignment) => (
                <div
                  key={assignment._id}
                  className="px-5 py-4 sm:px-6"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-800">
                        {assignment.title}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {assignment.subject?.name ||
                          "Subject not specified"}
                      </p>
                    </div>

                    <AssignmentStatus
                      status={
                        assignment.submissionStatus
                      }
                    />
                  </div>

                  <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
                    <span>
                      Due {formatDate(assignment.dueDate)}
                    </span>

                    {assignment.submission?.score !==
                      undefined &&
                      assignment.submission?.score !==
                        null && (
                        <span className="font-medium text-slate-600">
                          Score:{" "}
                          {assignment.submission.score}
                        </span>
                      )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={BookOpen}
              message="No assignments available yet."
            />
          )}
        </div>

        {/* Attendance */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  Recent Attendance
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Your latest attendance records
                </p>
              </div>

              <CalendarCheck
                size={18}
                className="text-emerald-500"
              />
            </div>
          </div>

          {recentAttendance?.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {recentAttendance.map((record) => (
                <div
                  key={record._id}
                  className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      {formatDate(record.date)}
                    </p>

                    {record.remarks && (
                      <p className="mt-1 text-xs text-slate-400">
                        {record.remarks}
                      </p>
                    )}
                  </div>

                  <AttendanceStatus
                    status={record.status}
                  />
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={CalendarCheck}
              message="No attendance records yet."
            />
          )}

          {/* Attendance summary */}
          <div className="grid grid-cols-3 border-t border-slate-100">
            <AttendanceSummary
              label="Present"
              value={attendance?.present ?? 0}
            />

            <AttendanceSummary
              label="Late"
              value={attendance?.late ?? 0}
            />

            <AttendanceSummary
              label="Absent"
              value={attendance?.absent ?? 0}
            />
          </div>
        </div>
      </section>

      {/* School / Parent information */}
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <InfoCard
          icon={GraduationCap}
          title="School Information"
        >
          <InfoRow
            label="School"
            value={school?.name}
          />

          <InfoRow
            label="Email"
            value={school?.email}
          />

          <InfoRow
            label="Phone"
            value={school?.phone}
          />

          <InfoRow
            label="Admission Date"
            value={formatDate(student?.admissionDate)}
          />
        </InfoCard>

        <InfoCard
          icon={User}
          title="Parent / Guardian"
        >
          {parent ? (
            <>
              <InfoRow
                label="Name"
                value={[
                  parent.firstName,
                  parent.lastName,
                ]
                  .filter(Boolean)
                  .join(" ")}
              />

              <InfoRow
                label="Email"
                value={parent.email}
              />

              <InfoRow
                label="Phone"
                value={parent.phone}
              />
            </>
          ) : (
            <p className="text-sm text-slate-400">
              No parent information available.
            </p>
          )}
        </InfoCard>
      </section>
    </div>
  );
}

function DashboardStat({
  title,
  value,
  description,
  icon: Icon,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {value}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            {description}
          </p>
        </div>

        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50">
          <Icon
            size={17}
            className="text-emerald-500"
          />
        </div>
      </div>
    </div>
  );
}

function AssignmentStatus({ status }) {
  const config = {
    not_submitted: {
      label: "Pending",
      className:
        "bg-amber-50 text-amber-600",
    },

    submitted: {
      label: "Submitted",
      className:
        "bg-blue-50 text-blue-600",
    },

    graded: {
      label: "Graded",
      className:
        "bg-emerald-50 text-emerald-600",
    },

    returned: {
      label: "Returned",
      className:
        "bg-purple-50 text-purple-600",
    },
  };

  const current =
    config[status] || config.not_submitted;

  return (
    <span
      className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${current.className}`}
    >
      {current.label}
    </span>
  );
}

function AttendanceStatus({ status }) {
  const config = {
    present: {
      label: "Present",
      icon: CheckCircle2,
      className:
        "bg-emerald-50 text-emerald-600",
    },

    late: {
      label: "Late",
      icon: Clock3,
      className:
        "bg-amber-50 text-amber-600",
    },

    absent: {
      label: "Absent",
      icon: XCircle,
      className:
        "bg-red-50 text-red-600",
    },

    excused: {
      label: "Excused",
      icon: CheckCircle2,
      className:
        "bg-blue-50 text-blue-600",
    },
  };

  const current =
    config[status] || config.absent;

  const Icon = current.icon;

  return (
    <span
      className={`flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold ${current.className}`}
    >
      <Icon size={12} />
      {current.label}
    </span>
  );
}

function AttendanceSummary({ label, value }) {
  return (
    <div className="px-3 py-3 text-center">
      <p className="text-lg font-bold text-slate-900">
        {value}
      </p>

      <p className="mt-0.5 text-[11px] text-slate-400">
        {label}
      </p>
    </div>
  );
}

function InfoCard({ icon: Icon, title, children }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
          <Icon
            size={16}
            className="text-emerald-500"
          />
        </div>

        <h2 className="text-base font-semibold text-slate-900">
          {title}
        </h2>
      </div>

      <div className="mt-5 space-y-4">
        {children}
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
      <span className="text-xs text-slate-400">
        {label}
      </span>

      <span className="max-w-[65%] text-right text-sm font-medium text-slate-700">
        {value || "—"}
      </span>
    </div>
  );
}

function EmptyState({ icon: Icon, message }) {
  return (
    <div className="flex min-h-48 items-center justify-center px-5 text-center">
      <div>
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-50">
          <Icon
            size={18}
            className="text-slate-300"
          />
        </div>

        <p className="mt-3 text-sm text-slate-500">
          {message}
        </p>
      </div>
    </div>
  );
}

"use client";

import { useSelector } from "react-redux";

import SchoolAdminDashboard from "../../../components/dashboard/SchoolAdminDashboard";
import StudentDashboard from "../../../components/dashboard/StudentDashboard";

export default function DashboardPage() {
  const { user } = useSelector((state) => state.auth);

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">
          No authenticated user found.
        </p>
      </main>
    );
  }

  if (user.role === "schoolAdmin") {
    return (
      <main className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
        <SchoolAdminDashboard user={user} />
      </main>
    );
  }

  if (user.role === "student") {
    return (
      <main className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
        <StudentDashboard user={user} />
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50">
      <p className="text-sm text-slate-500">
        No dashboard available for your role yet.
      </p>
    </main>
  );
}

