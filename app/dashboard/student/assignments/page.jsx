"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  Search,
  Send,
  GraduationCap,
  ChevronRight,
} from "lucide-react";

import api from "@/lib/api";

const getStatus = (assignment) => {
  const submission = assignment.submission;

  if (submission?.score !== undefined && submission?.score !== null) {
    return "graded";
  }

  if (
    assignment.submissionStatus === "submitted" ||
    submission?.status === "submitted" ||
    submission
  ) {
    return "submitted";
  }

  const dueDate = assignment.dueDate
    ? new Date(assignment.dueDate)
    : null;

  if (
    dueDate &&
    !Number.isNaN(dueDate.getTime()) &&
    dueDate < new Date()
  ) {
    return "overdue";
  }

  return "pending";
};

const statusConfig = {
  pending: {
    label: "Pending",
    className: "bg-amber-50 text-amber-700 border-amber-200",
    icon: Clock3,
  },
  submitted: {
    label: "Submitted",
    className: "bg-blue-50 text-blue-700 border-blue-200",
    icon: Send,
  },
  graded: {
    label: "Graded",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: CheckCircle2,
  },
  overdue: {
    label: "Overdue",
    className: "bg-red-50 text-red-700 border-red-200",
    icon: Clock3,
  },
};

const formatDate = (date) => {
  if (!date) return "No due date";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "No due date";
  }

  return parsedDate.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const getSubjectName = (assignment) => {
  if (typeof assignment.subject === "string") {
    return assignment.subject;
  }

  return (
    assignment.subject?.name ||
    assignment.subject?.title ||
    assignment.subjectName ||
    "Subject"
  );
};

const getTeacherName = (assignment) => {
  const teacher = assignment.teacher || assignment.createdBy;

  if (typeof teacher === "string") {
    return teacher;
  }

  if (!teacher) {
    return "Teacher";
  }

  const fullName = `${teacher.firstName || ""} ${
    teacher.lastName || ""
  }`.trim();

  return (
    fullName ||
    teacher.name ||
    teacher.fullName ||
    teacher.user?.name ||
    "Teacher"
  );
};

const getDescription = (assignment) => {
  return (
    assignment.description ||
    assignment.instructions ||
    assignment.content ||
    "No description provided."
  );
};

export default function StudentAssignmentsPage() {
  const [assignments, setAssignments] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/assignments/student");

        const data = response.data;

        if (Array.isArray(data)) {
          setAssignments(data);
        } else if (Array.isArray(data?.assignments)) {
          setAssignments(data.assignments);
        } else {
          setAssignments([]);
        }
      } catch (err) {
        console.error("Failed to fetch student assignments:", err);

        setError(
          err.response?.data?.message ||
            "Unable to load your assignments. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, []);

  const assignmentsWithStatus = useMemo(() => {
    return assignments.map((assignment) => ({
      ...assignment,
      uiStatus: getStatus(assignment),
    }));
  }, [assignments]);

  const stats = useMemo(() => {
    return {
      total: assignmentsWithStatus.length,

      pending: assignmentsWithStatus.filter(
        (assignment) => assignment.uiStatus === "pending"
      ).length,

      submitted: assignmentsWithStatus.filter(
        (assignment) => assignment.uiStatus === "submitted"
      ).length,

      graded: assignmentsWithStatus.filter(
        (assignment) => assignment.uiStatus === "graded"
      ).length,
    };
  }, [assignmentsWithStatus]);

  const filteredAssignments = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();

    return assignmentsWithStatus.filter((assignment) => {
      const subject = getSubjectName(assignment).toLowerCase();
      const title = (assignment.title || "").toLowerCase();
      const description = getDescription(assignment).toLowerCase();

      const matchesSearch =
        !searchTerm ||
        title.includes(searchTerm) ||
        subject.includes(searchTerm) ||
        description.includes(searchTerm);

      const matchesFilter =
        filter === "all" || assignment.uiStatus === filter;

      return matchesSearch && matchesFilter;
    });
  }, [assignmentsWithStatus, search, filter]);

  return (
    <div className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
            Assignments
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            View your assignments, submit your work, and track your results.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            label="Total Assignments"
            value={stats.total}
            icon={BookOpen}
            iconClass="bg-gray-100 text-gray-700"
          />

          <StatCard
            label="Pending"
            value={stats.pending}
            icon={Clock3}
            iconClass="bg-amber-50 text-amber-600"
          />

          <StatCard
            label="Submitted"
            value={stats.submitted}
            icon={Send}
            iconClass="bg-blue-50 text-blue-600"
          />

          <StatCard
            label="Graded"
            value={stats.graded}
            icon={CheckCircle2}
            iconClass="bg-emerald-50 text-emerald-600"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search assignments..."
              className="h-11 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            className="h-11 rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          >
            <option value="all">All Assignments</option>
            <option value="pending">Pending</option>
            <option value="submitted">Submitted</option>
            <option value="graded">Graded</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>

        {/* Content */}
        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={error} />
        ) : filteredAssignments.length === 0 ? (
          <EmptyState
            hasFilters={Boolean(search || filter !== "all")}
            onClear={() => {
              setSearch("");
              setFilter("all");
            }}
          />
        ) : (
          <div className="space-y-4">
            {filteredAssignments.map((assignment) => (
              <AssignmentCard
                key={assignment._id}
                assignment={assignment}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, iconClass }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-gray-500">
            {label}
          </p>

          <p className="mt-1 text-2xl font-semibold text-gray-900">
            {value}
          </p>
        </div>

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconClass}`}
        >
          <Icon size={19} />
        </div>
      </div>
    </div>
  );
}

function AssignmentCard({ assignment }) {
  const status =
    statusConfig[assignment.uiStatus] || statusConfig.pending;

  const StatusIcon = status.icon;

  const subject = getSubjectName(assignment);
  const teacher = getTeacherName(assignment);
  const description = getDescription(assignment);

  const score =
    assignment.submission?.score ??
    assignment.score ??
    null;

  return (
    <div className="group rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:border-gray-200 hover:shadow-md sm:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        {/* Main information */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
              <BookOpen size={13} />
              {subject}
            </span>

            <span
              className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium ${status.className}`}
            >
              <StatusIcon size={13} />
              {status.label}
            </span>
          </div>

          <h2 className="mt-3 text-lg font-semibold text-gray-900">
            {assignment.title || "Untitled Assignment"}
          </h2>

          <p className="mt-2 line-clamp-2 max-w-3xl text-sm leading-6 text-gray-500">
            {description}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-gray-500">
            <span className="inline-flex items-center gap-1.5">
              <GraduationCap size={15} />
              {teacher}
            </span>

            {assignment.dueDate && (
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays size={15} />
                Due {formatDate(assignment.dueDate)}
              </span>
            )}

            {score !== null && (
              <span className="inline-flex items-center gap-1.5 font-medium text-emerald-700">
                <CheckCircle2 size={15} />
                Score: {score}
              </span>
            )}
          </div>
        </div>

        {/* Action */}
        <div className="shrink-0">
          <Link
            href={`/dashboard/student/assignments/${assignment._id}`}
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 text-sm font-medium text-white transition hover:bg-gray-800 sm:w-auto"
          >
            View Assignment
            <ChevronRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="animate-pulse rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
        >
          <div className="h-5 w-32 rounded bg-gray-100" />

          <div className="mt-4 h-6 w-2/3 rounded bg-gray-100" />

          <div className="mt-3 h-4 w-full rounded bg-gray-100" />

          <div className="mt-2 h-4 w-3/4 rounded bg-gray-100" />

          <div className="mt-5 h-4 w-1/3 rounded bg-gray-100" />
        </div>
      ))}
    </div>
  );
}

function ErrorState({ message }) {
  return (
    <div className="rounded-2xl border border-red-100 bg-red-50 p-8 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
        <FileText size={21} />
      </div>

      <h3 className="mt-4 text-sm font-semibold text-red-900">
        Unable to load assignments
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm text-red-700">
        {message}
      </p>
    </div>
  );
}

function EmptyState({ hasFilters, onClear }) {
  return (
    <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-14 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50 text-gray-400">
        <BookOpen size={25} />
      </div>

      <h3 className="mt-4 text-base font-semibold text-gray-900">
        {hasFilters ? "No assignments found" : "No assignments yet"}
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
        {hasFilters
          ? "Try changing your search or filter to find what you are looking for."
          : "Your published assignments will appear here when they are available."}
      </p>

      {hasFilters && (
        <button
          type="button"
          onClick={onClear}
          className="mt-5 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
        >
          Clear Filters
        </button>
      )}
    </div>
  );
}


