"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  Plus,
  Search,
  Users,
  XCircle,
} from "lucide-react";

import api from "@/lib/api";
import { useSelector } from "react-redux";

export default function TeacherAssignments() {
  const { user } = useSelector((state) => state.auth);

  const [assignments, setAssignments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/assignments/teacher");

        setAssignments(response.data?.assignments || []);
      } catch (err) {
        console.error("Failed to fetch teacher assignments:", err);

        setError(
          err.response?.data?.message ||
            "Failed to load your assignments. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchAssignments();
    }
  }, [user]);

  const filteredAssignments = useMemo(() => {
    return assignments.filter((assignment) => {
      const title = assignment.title?.toLowerCase() || "";
      const subject = assignment.subject?.name?.toLowerCase() || "";
      const className = assignment.schoolClass?.name?.toLowerCase() || "";

      const search = searchTerm.toLowerCase();

      const matchesSearch =
        title.includes(search) ||
        subject.includes(search) ||
        className.includes(search);

      const matchesStatus =
        statusFilter === "all" || assignment.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [assignments, searchTerm, statusFilter]);

  const counts = useMemo(
    () => ({
      all: assignments.length,
      draft: assignments.filter(
        (assignment) => assignment.status === "draft"
      ).length,
      published: assignments.filter(
        (assignment) => assignment.status === "published"
      ).length,
      closed: assignments.filter(
        (assignment) => assignment.status === "closed"
      ).length,
    }),
    [assignments]
  );

  const formatDate = (date) => {
    if (!date) return "No due date";

    return new Date(date).toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case "published":
        return {
          label: "Published",
          className: "bg-emerald-50 text-emerald-700",
          icon: CheckCircle2,
        };

      case "closed":
        return {
          label: "Closed",
          className: "bg-slate-100 text-slate-600",
          icon: XCircle,
        };

      default:
        return {
          label: "Draft",
          className: "bg-amber-50 text-amber-700",
          icon: Clock3,
        };
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="animate-pulse space-y-6">
            <div className="h-10 w-64 rounded-lg bg-slate-200" />
            <div className="h-24 rounded-2xl bg-white" />
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-64 rounded-2xl bg-white"
                />
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <section className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-emerald-600">
              Teacher Portal
            </p>

            <h1 className="mt-1 text-2xl font-bold text-slate-900">
              Assignments
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Create, manage, and review assignments for your students.
            </p>
          </div>

          <Link
            href="/dashboard/teacher/assignments/create"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4" />
            Create Assignment
          </Link>
        </section>

        {/* Stats */}
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <button
            onClick={() => setStatusFilter("all")}
            className={`rounded-2xl bg-white p-5 text-left shadow-sm transition hover:shadow ${
              statusFilter === "all"
                ? "ring-2 ring-emerald-500"
                : ""
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">All Assignments</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {counts.all}
                </p>
              </div>

              <div className="rounded-xl bg-slate-100 p-3">
                <FileText className="h-5 w-5 text-slate-600" />
              </div>
            </div>
          </button>

          <button
            onClick={() => setStatusFilter("draft")}
            className={`rounded-2xl bg-white p-5 text-left shadow-sm transition hover:shadow ${
              statusFilter === "draft"
                ? "ring-2 ring-amber-500"
                : ""
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Drafts</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {counts.draft}
                </p>
              </div>

              <div className="rounded-xl bg-amber-50 p-3">
                <Clock3 className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </button>

          <button
            onClick={() => setStatusFilter("published")}
            className={`rounded-2xl bg-white p-5 text-left shadow-sm transition hover:shadow ${
              statusFilter === "published"
                ? "ring-2 ring-emerald-500"
                : ""
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Published</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {counts.published}
                </p>
              </div>

              <div className="rounded-xl bg-emerald-50 p-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </button>

          <button
            onClick={() => setStatusFilter("closed")}
            className={`rounded-2xl bg-white p-5 text-left shadow-sm transition hover:shadow ${
              statusFilter === "closed"
                ? "ring-2 ring-slate-400"
                : ""
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Closed</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {counts.closed}
                </p>
              </div>

              <div className="rounded-xl bg-slate-100 p-3">
                <XCircle className="h-5 w-5 text-slate-600" />
              </div>
            </div>
          </button>
        </section>

        {/* Search */}
        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search assignments, subjects or classes..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-emerald-500"
            >
              <option value="all">All statuses</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </section>

        {/* Error */}
        {error && (
          <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Assignment List */}
        {!error && filteredAssignments.length === 0 ? (
          <section className="rounded-2xl bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
              <FileText className="h-7 w-7 text-slate-400" />
            </div>

            <h2 className="mt-4 text-lg font-semibold text-slate-900">
              No assignments found
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              {assignments.length === 0
                ? "You haven't created any assignments yet."
                : "No assignments match your current search or filter."}
            </p>

            {assignments.length === 0 && (
              <Link
                href="/dashboard/teacher/assignments/create"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                <Plus className="h-4 w-4" />
                Create Assignment
              </Link>
            )}
          </section>
        ) : (
          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredAssignments.map((assignment) => {
              const status = getStatusStyles(assignment.status);
              const StatusIcon = status.icon;

              const subjectName =
                assignment.subject?.name || "Subject";

              const className =
                assignment.schoolClass?.name || "Class";

              const arm = assignment.schoolClass?.arm;

              return (
                <article
                  key={assignment._id}
                  className="flex flex-col rounded-2xl bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="rounded-xl bg-emerald-50 p-3">
                        <BookOpen className="h-5 w-5 text-emerald-600" />
                      </div>

                      <div className="min-w-0">
                        <h2 className="truncate font-semibold text-slate-900">
                          {assignment.title}
                        </h2>

                        <p className="mt-0.5 text-xs text-slate-500">
                          {subjectName}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${status.className}`}
                    >
                      <StatusIcon className="h-3.5 w-3.5" />
                      {status.label}
                    </span>
                  </div>

                  {assignment.description && (
                    <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-500">
                      {assignment.description}
                    </p>
                  )}

                  <div className="mt-5 space-y-3 border-t border-slate-100 pt-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Users className="h-4 w-4 text-slate-400" />

                      <span>
                        {className}
                        {arm ? ` ${arm}` : ""}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <CalendarDays className="h-4 w-4 text-slate-400" />

                      <span>
                        Due {formatDate(assignment.dueDate)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 flex gap-2">
                    <Link
                      href={`/dashboard/teacher/assignments/${assignment._id}`}
                      className="flex-1 rounded-xl border border-slate-200 px-3 py-2.5 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      View
                    </Link>

                    {assignment.status === "published" && (
                      <Link
                        href={`/dashboard/teacher/assignments/${assignment._id}/submissions`}
                        className="flex-1 rounded-xl bg-emerald-600 px-3 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-emerald-700"
                      >
                        Submissions
                      </Link>
                    )}
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
}