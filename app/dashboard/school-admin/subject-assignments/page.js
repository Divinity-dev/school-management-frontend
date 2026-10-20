"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Plus,
  Search,
  Eye,
  Pencil,
  UserRound,
  GraduationCap,
  Users,
  Loader2,
  AlertCircle,
} from "lucide-react";

import api from "@/lib/api";

export default function SubjectAssignmentsPage() {
  const [assignments, setAssignments] = useState([]);
  const [filteredAssignments, setFilteredAssignments] = useState([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/subject-assignments");

        const data = response.data?.assignments || [];

        setAssignments(data);
        setFilteredAssignments(data);
      } catch (err) {
        console.error("Failed to fetch subject assignments:", err);

        setError(
          err.response?.data?.message ||
            "Unable to load subject assignments."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, []);

  useEffect(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      setFilteredAssignments(assignments);
      return;
    }

    const filtered = assignments.filter((assignment) => {
      const subjectName = assignment.subject?.name || "";
      const subjectCode = assignment.subject?.code || "";

      const className = assignment.schoolClass?.name || "";
      const classArm = assignment.schoolClass?.arm || "";
      const classSection = assignment.schoolClass?.section || "";

      const teacherName = `${assignment.teacher?.firstName || ""} ${
        assignment.teacher?.lastName || ""
      }`;

      const sessionName = assignment.academicSession?.name || "";

      const searchableText = `
        ${subjectName}
        ${subjectCode}
        ${className}
        ${classArm}
        ${classSection}
        ${teacherName}
        ${sessionName}
      `.toLowerCase();

      return searchableText.includes(query);
    });

    setFilteredAssignments(filtered);
  }, [search, assignments]);

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50">
              <BookOpen className="h-6 w-6 text-emerald-600" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Subject Assignments
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Assign subjects to classes and teachers.
              </p>
            </div>
          </div>
        </div>

        <Link
          href="/dashboard/school-admin/subject-assignments/new"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4" />
          Create Assignment
        </Link>
      </div>

      {/* Search */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="relative max-w-xl">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

          <input
            type="text"
            placeholder="Search by subject, class, teacher, or session..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-10 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Content */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
              Loading subject assignments...
            </div>
          </div>
        ) : filteredAssignments.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
              <BookOpen className="h-7 w-7 text-gray-400" />
            </div>

            <h3 className="mt-4 text-base font-semibold text-gray-900">
              {search
                ? "No assignments found"
                : "No subject assignments yet"}
            </h3>

            <p className="mt-2 max-w-md text-sm text-gray-500">
              {search
                ? "Try adjusting your search."
                : "Create your first subject assignment to connect a subject, class, and teacher."}
            </p>

            {!search && (
              <Link
                href="/dashboard/school-admin/subject-assignments/new"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                <Plus className="h-4 w-4" />
                Create Assignment
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-left">
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Subject
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Class
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Teacher
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Academic Session
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Status
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filteredAssignments.map((assignment) => {
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

                    return (
                      <tr
                        key={assignment._id}
                        className="transition hover:bg-gray-50"
                      >
                        {/* Subject */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
                              <BookOpen className="h-5 w-5 text-emerald-600" />
                            </div>

                            <div>
                              <p className="font-medium text-gray-900">
                                {subject?.name || "—"}
                              </p>

                              {subject?.code && (
                                <p className="text-xs text-gray-500">
                                  {subject.code}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Class */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-gray-400" />

                            <span className="text-sm text-gray-700">
                              {classDisplay || "—"}
                            </span>
                          </div>
                        </td>

                        {/* Teacher */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <UserRound className="h-4 w-4 text-gray-400" />

                            <span className="text-sm text-gray-700">
                              {teacher
                                ? `${teacher.firstName || ""} ${
                                    teacher.lastName || ""
                                  }`.trim()
                                : "—"}
                            </span>
                          </div>
                        </td>

                        {/* Session */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <GraduationCap className="h-4 w-4 text-gray-400" />

                            <span className="text-sm text-gray-700">
                              {session?.name || "—"}
                            </span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                              assignment.isActive
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {assignment.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            <Link
                              href={`/dashboard/school-admin/subject-assignments/${assignment._id}`}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600"
                              title="View assignment"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>

                            <Link
                              href={`/dashboard/school-admin/subject-assignments/${assignment._id}/edit`}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600"
                              title="Edit assignment"
                            >
                              <Pencil className="h-4 w-4" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="divide-y divide-gray-100 md:hidden">
              {filteredAssignments.map((assignment) => {
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
                  ? `${teacher.firstName || ""} ${
                      teacher.lastName || ""
                    }`.trim()
                  : "—";

                return (
                  <div key={assignment._id} className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50">
                          <BookOpen className="h-5 w-5 text-emerald-600" />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate font-semibold text-gray-900">
                            {subject?.name || "—"}
                          </p>

                          {subject?.code && (
                            <p className="text-xs text-gray-500">
                              {subject.code}
                            </p>
                          )}
                        </div>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                          assignment.isActive
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {assignment.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>

                    <div className="mt-4 space-y-3">
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span>{classDisplay || "—"}</span>
                      </div>

                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <UserRound className="h-4 w-4 text-gray-400" />
                        <span>{teacherName}</span>
                      </div>

                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <GraduationCap className="h-4 w-4 text-gray-400" />
                        <span>{session?.name || "—"}</span>
                      </div>
                    </div>

                    <div className="mt-5 flex gap-2">
                      <Link
                        href={`/dashboard/school-admin/subject-assignments/${assignment._id}`}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </Link>

                      <Link
                        href={`/dashboard/school-admin/subject-assignments/${assignment._id}/edit`}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100"
                      >
                        <Pencil className="h-4 w-4" />
                        Edit
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}