"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  FileText,
  Search,
  Users,
  XCircle,
} from "lucide-react";

import api from "@/lib/api";

export default function TeacherAssignmentSubmissions() {
  const { id } = useParams();
  const router = useRouter();

  const [assignment, setAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          `/assignments/${id}/submissions`
        );

        setAssignment(response.data?.assignment || null);
        setSubmissions(response.data?.submissions || []);
      } catch (err) {
        console.error("Failed to fetch submissions:", err);

        setError(
          err.response?.data?.message ||
            "Failed to load assignment submissions."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [id]);

  const counts = useMemo(() => {
    const graded = submissions.filter(
      (submission) => submission.status === "graded"
    ).length;

    const submitted = submissions.filter(
      (submission) => submission.status === "submitted"
    ).length;

    return {
      total: submissions.length,
      graded,
      submitted,
    };
  }, [submissions]);

  const filteredSubmissions = useMemo(() => {
    return submissions.filter((submission) => {
      const student = submission.student;

      const name = [
        student?.firstName,
        student?.middleName,
        student?.lastName,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const studentId =
        student?.studentId?.toLowerCase() || "";

      const search = searchTerm.toLowerCase();

      const matchesSearch =
        name.includes(search) || studentId.includes(search);

      const matchesFilter =
        filter === "all" || submission.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [submissions, searchTerm, filter]);

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-72 rounded-lg bg-slate-200" />
            <div className="h-32 rounded-2xl bg-white" />
            <div className="h-96 rounded-2xl bg-white" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <section className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={() => router.back()}
            className="w-fit rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 transition hover:bg-slate-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div>
            <p className="text-sm font-medium text-emerald-600">
              Teacher Portal
            </p>

            <h1 className="mt-1 text-2xl font-bold text-slate-900">
              Assignment Submissions
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Review and grade student submissions.
            </p>
          </div>
        </section>

        {error ? (
          <div className="rounded-2xl border border-red-100 bg-red-50 p-5 text-sm text-red-600">
            {error}
          </div>
        ) : (
          <>
            {/* Assignment Summary */}
            <section className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-emerald-50 p-3">
                      <FileText className="h-5 w-5 text-emerald-600" />
                    </div>

                    <div>
                      <h2 className="text-lg font-bold text-slate-900">
                        {assignment?.title}
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        Due{" "}
                        {assignment?.dueDate
                          ? new Date(
                              assignment.dueDate
                            ).toLocaleDateString("en-NG", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "No due date"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <div className="rounded-xl bg-slate-50 px-4 py-3">
                    <p className="text-xs text-slate-500">
                      Submissions
                    </p>

                    <p className="mt-1 text-lg font-bold text-slate-900">
                      {counts.total}
                    </p>
                  </div>

                  <div className="rounded-xl bg-emerald-50 px-4 py-3">
                    <p className="text-xs text-emerald-600">
                      Graded
                    </p>

                    <p className="mt-1 text-lg font-bold text-emerald-700">
                      {counts.graded}
                    </p>
                  </div>

                  <div className="rounded-xl bg-amber-50 px-4 py-3">
                    <p className="text-xs text-amber-600">
                      Awaiting Grade
                    </p>

                    <p className="mt-1 text-lg font-bold text-amber-700">
                      {counts.submitted}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Filters */}
            <section className="rounded-2xl bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(event) =>
                      setSearchTerm(event.target.value)
                    }
                    placeholder="Search by student name or ID..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>

                <select
                  value={filter}
                  onChange={(event) =>
                    setFilter(event.target.value)
                  }
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-emerald-500"
                >
                  <option value="all">All submissions</option>
                  <option value="submitted">
                    Awaiting grade
                  </option>
                  <option value="graded">Graded</option>
                </select>
              </div>
            </section>

            {/* Submissions */}
            <section className="overflow-hidden rounded-2xl bg-white shadow-sm">
              {filteredSubmissions.length === 0 ? (
                <div className="px-6 py-16 text-center">
                  <Users className="mx-auto h-10 w-10 text-slate-300" />

                  <h3 className="mt-4 font-semibold text-slate-900">
                    No submissions found
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    There are no submissions matching your
                    current filter.
                  </p>
                </div>
              ) : (
                <>
                  {/* Desktop */}
                  <div className="hidden overflow-x-auto md:block">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/70 text-left">
                          <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Student
                          </th>

                          <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Submitted
                          </th>

                          <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Status
                          </th>

                          <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Score
                          </th>

                          <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Action
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {filteredSubmissions.map(
                          (submission) => {
                            const student =
                              submission.student;

                            const studentName = [
                              student?.firstName,
                              student?.middleName,
                              student?.lastName,
                            ]
                              .filter(Boolean)
                              .join(" ");

                            const graded =
                              submission.status ===
                              "graded";

                            return (
                              <tr
                                key={submission._id}
                                className="border-b border-slate-100 last:border-0"
                              >
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-sm font-semibold text-emerald-700">
                                      {student?.firstName?.[0]}
                                      {student?.lastName?.[0]}
                                    </div>

                                    <div>
                                      <p className="font-medium text-slate-900">
                                        {studentName ||
                                          "Unknown student"}
                                      </p>

                                      <p className="text-xs text-slate-500">
                                        {student?.studentId ||
                                          "No student ID"}
                                      </p>
                                    </div>
                                  </div>
                                </td>

                                <td className="px-6 py-4 text-sm text-slate-600">
                                  {formatDate(
                                    submission.submittedAt
                                  )}
                                </td>

                                <td className="px-6 py-4">
                                  {graded ? (
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                                      <CheckCircle2 className="h-3.5 w-3.5" />
                                      Graded
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                                      <Clock3 className="h-3.5 w-3.5" />
                                      Awaiting grade
                                    </span>
                                  )}
                                </td>

                                <td className="px-6 py-4">
                                  {submission.score !==
                                  undefined &&
                                  submission.score !==
                                    null ? (
                                    <span className="font-semibold text-slate-900">
                                      {submission.score}/100
                                    </span>
                                  ) : (
                                    <span className="text-sm text-slate-400">
                                      —
                                    </span>
                                  )}
                                </td>

                                <td className="px-6 py-4 text-right">
                                  <Link
                                    href={`/dashboard/teacher/assignments/${id}/submissions/${submission._id}`}
                                    className="inline-flex rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
                                  >
                                    {graded
                                      ? "View Grade"
                                      : "Grade"}
                                  </Link>
                                </td>
                              </tr>
                            );
                          }
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile */}
                  <div className="divide-y divide-slate-100 md:hidden">
                    {filteredSubmissions.map(
                      (submission) => {
                        const student = submission.student;

                        const studentName = [
                          student?.firstName,
                          student?.middleName,
                          student?.lastName,
                        ]
                          .filter(Boolean)
                          .join(" ");

                        const graded =
                          submission.status === "graded";

                        return (
                          <div
                            key={submission._id}
                            className="p-5"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-sm font-semibold text-emerald-700">
                                  {student?.firstName?.[0]}
                                  {student?.lastName?.[0]}
                                </div>

                                <div>
                                  <p className="font-semibold text-slate-900">
                                    {studentName ||
                                      "Unknown student"}
                                  </p>

                                  <p className="text-xs text-slate-500">
                                    {student?.studentId}
                                  </p>
                                </div>
                              </div>

                              {graded ? (
                                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                              ) : (
                                <Clock3 className="h-5 w-5 text-amber-500" />
                              )}
                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                              <div className="rounded-xl bg-slate-50 p-3">
                                <p className="text-xs text-slate-400">
                                  Submitted
                                </p>

                                <p className="mt-1 text-slate-700">
                                  {formatDate(
                                    submission.submittedAt
                                  )}
                                </p>
                              </div>

                              <div className="rounded-xl bg-slate-50 p-3">
                                <p className="text-xs text-slate-400">
                                  Score
                                </p>

                                <p className="mt-1 font-semibold text-slate-900">
                                  {submission.score !==
                                    undefined &&
                                  submission.score !== null
                                    ? `${submission.score}/100`
                                    : "Not graded"}
                                </p>
                              </div>
                            </div>

                            <Link
                              href={`/dashboard/teacher/assignments/${id}/submissions/${submission._id}`}
                              className="mt-4 block rounded-xl bg-emerald-600 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-emerald-700"
                            >
                              {graded
                                ? "View Grade"
                                : "Grade Submission"}
                            </Link>
                          </div>
                        );
                      }
                    )}
                  </div>
                </>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}