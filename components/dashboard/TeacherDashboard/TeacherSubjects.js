"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CalendarDays,
  GraduationCap,
  UserRound,
  AlertCircle,
  ClipboardList,
  FileText,
} from "lucide-react";

import api from "@/lib/api";

export default function TeacherSubjects({ user }) {
  const [subjectAssignments, setSubjectAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadSubjects = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/subject-assignments");

        setSubjectAssignments(
          response.data?.subjectAssignments ||
            response.data?.assignments ||
            []
        );
      } catch (err) {
        console.error("Failed to load teacher subjects:", err);

        setError(
          err.response?.data?.message ||
            "Unable to load your subject assignments."
        );
      } finally {
        setLoading(false);
      }
    };

    loadSubjects();
  }, []);

  const teacherId = user?._id || user?.id;

  const mySubjects = useMemo(() => {
    if (!teacherId) return [];

    return subjectAssignments.filter((assignment) => {
      const teacher = assignment.teacher;

      const assignmentTeacherId =
        teacher?._id ||
        teacher?.id ||
        teacher;

      return (
        assignmentTeacherId?.toString() === teacherId?.toString() &&
        assignment.isActive !== false
      );
    });
  }, [subjectAssignments, teacherId]);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard/teacher"
            className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-emerald-600"
          >
            <ArrowLeft size={17} />
            Back to Dashboard
          </Link>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-600">
                Teacher Portal
              </p>

              <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                My Subjects
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Subjects and classes assigned to you.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
              <BookOpen size={18} className="text-emerald-600" />

              <span className="text-sm font-medium text-slate-700">
                {loading ? "—" : mySubjects.length}{" "}
                {mySubjects.length === 1
                  ? "Assignment"
                  : "Assignments"}
              </span>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="h-72 animate-pulse rounded-2xl border border-slate-200 bg-white"
              />
            ))}
          </div>
        ) : mySubjects.length === 0 ? (
          /* Empty state */
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <BookOpen size={28} />
            </div>

            <h2 className="mt-5 text-lg font-semibold text-slate-900">
              No subjects assigned yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              You currently don't have any active subject assignment.
              Once a school administrator assigns a subject to you, it
              will appear here.
            </p>

            <Link
              href="/dashboard/teacher"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700"
            >
              Return to Dashboard
              <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          /* Subject cards */
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {mySubjects.map((assignment) => {
              const subject = assignment.subject;
              const schoolClass = assignment.schoolClass;
              const session = assignment.academicSession;

              const subjectName =
                subject?.name || "Subject";

              const subjectCode = subject?.code;

              const className = schoolClass?.name || "Class";

              const displayClass = schoolClass?.arm
                ? `${className} ${schoolClass.arm}`
                : className;

              return (
                <div
                  key={assignment._id}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  {/* Header */}
                  <div className="border-b border-slate-100 p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                          <BookOpen size={22} />
                        </div>

                        <div className="min-w-0">
                          <h2 className="truncate font-semibold text-slate-900">
                            {subjectName}
                          </h2>

                          {subjectCode && (
                            <p className="mt-1 text-xs font-medium text-slate-400">
                              {subjectCode}
                            </p>
                          )}
                        </div>
                      </div>

                      <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
                        Active
                      </span>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-4 p-5">
                    <div className="flex items-start gap-3">
                      <GraduationCap
                        size={17}
                        className="mt-0.5 shrink-0 text-slate-400"
                      />

                      <div className="min-w-0">
                        <p className="text-[11px] text-slate-400">
                          Class
                        </p>

                        <p className="truncate text-sm font-medium text-slate-700">
                          {displayClass}
                        </p>

                        {schoolClass?.section && (
                          <p className="mt-0.5 text-xs text-slate-400">
                            {schoolClass.section}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <CalendarDays
                        size={17}
                        className="mt-0.5 shrink-0 text-slate-400"
                      />

                      <div>
                        <p className="text-[11px] text-slate-400">
                          Academic Session
                        </p>

                        <p className="text-sm font-medium text-slate-700">
                          {session?.name || "Not specified"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <UserRound
                        size={17}
                        className="mt-0.5 shrink-0 text-slate-400"
                      />

                      <div>
                        <p className="text-[11px] text-slate-400">
                          Teaching Role
                        </p>

                        <p className="text-sm font-medium text-slate-700">
                          Subject Teacher
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-2 border-t border-slate-100 bg-slate-50 p-4">
                    <Link
                      href={`/dashboard/teacher/assignments?subjectAssignmentId=${assignment._id}`}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-medium text-slate-700 transition hover:border-emerald-200 hover:text-emerald-700"
                    >
                      <ClipboardList size={15} />
                      Assignments
                    </Link>

                    <Link
                      href={`/dashboard/teacher/results?subjectAssignmentId=${assignment._id}`}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 py-2.5 text-xs font-medium text-white transition hover:bg-emerald-700"
                    >
                      <FileText size={15} />
                      Results
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Explanation */}
        {!loading && mySubjects.length > 0 && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4">
            <BookOpen
              size={18}
              className="mt-0.5 shrink-0 text-blue-600"
            />

            <div>
              <p className="text-sm font-medium text-blue-900">
                About your subject assignments
              </p>

              <p className="mt-1 text-xs leading-5 text-blue-700">
                Each card represents a subject you are officially
                assigned to teach for a specific class and academic
                session. Your assignment and result activities will be
                tied to these assignments.
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}