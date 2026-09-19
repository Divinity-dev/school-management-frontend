"use client";

import { useEffect, useState } from "react";

import {
  BookOpen,
  ChevronRight,
} from "lucide-react";

import api from "@/lib/api";

const formatDate = (date) => {
  if (!date) return "";

  const assignmentDate = new Date(date);

  if (Number.isNaN(assignmentDate.getTime())) {
    return "";
  }

  const now = new Date();

  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

  const startOfAssignmentDay = new Date(
    assignmentDate.getFullYear(),
    assignmentDate.getMonth(),
    assignmentDate.getDate()
  );

  const difference =
    startOfToday.getTime() -
    startOfAssignmentDay.getTime();

  const oneDay = 24 * 60 * 60 * 1000;

  if (difference === 0) {
    return "Today";
  }

  if (difference === oneDay) {
    return "Yesterday";
  }

  if (difference > 0 && difference < 7 * oneDay) {
    return `${Math.floor(difference / oneDay)} days ago`;
  }

  return assignmentDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year:
      assignmentDate.getFullYear() !== now.getFullYear()
        ? "numeric"
        : undefined,
  });
};

const getStatusClasses = (status) => {
  switch (status) {
    case "published":
      return "bg-emerald-50 text-emerald-600";

    case "closed":
      return "bg-slate-100 text-slate-500";

    case "draft":
    default:
      return "bg-amber-50 text-amber-600";
  }
};

const formatStatus = (status) => {
  if (!status) return "Unknown";

  return (
    status.charAt(0).toUpperCase() +
    status.slice(1)
  );
};

export default function RecentAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRecentAssignments = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/assignments/teacher");

        const data = response.data?.assignments || [];

        setAssignments(data.slice(0, 5));
      } catch (err) {
        console.error(
          "Failed to fetch recent assignments:",
          err
        );

        setError(
          err?.response?.data?.message ||
            "Unable to load recent assignments."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRecentAssignments();
  }, []);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Recent Assignments
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Latest assignments created by teachers
          </p>
        </div>

        <button
          type="button"
          className="flex items-center gap-1 text-xs font-medium text-emerald-600 hover:text-emerald-700"
        >
          View all
          <ChevronRight size={14} />
        </button>
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-600">
          {error}
        </div>
      )}

      <div className="mt-5 divide-y divide-slate-100">
        {loading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
            >
              <div className="h-10 w-10 shrink-0 animate-pulse rounded-lg bg-slate-100" />

              <div className="min-w-0 flex-1">
                <div className="h-4 w-2/3 animate-pulse rounded bg-slate-100" />

                <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-slate-100" />
              </div>

              <div className="hidden sm:block">
                <div className="h-5 w-16 animate-pulse rounded-full bg-slate-100" />

                <div className="mt-2 h-3 w-14 animate-pulse rounded bg-slate-100" />
              </div>
            </div>
          ))
        ) : assignments.length === 0 ? (
          <div className="py-8 text-center">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50 text-slate-400">
              <BookOpen size={20} />
            </div>

            <p className="mt-3 text-sm font-medium text-slate-700">
              No assignments yet
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Assignments created by teachers will appear here.
            </p>
          </div>
        ) : (
          assignments.map((assignment) => (
            <div
              key={assignment._id}
              className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <BookOpen size={18} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-800">
                  {assignment.title}
                </p>

                <p className="mt-0.5 truncate text-xs text-slate-400">
                  {assignment.subject?.name || "Unknown Subject"}{" "}
                  ·{" "}
                  {assignment.schoolClass?.name || "Unknown Class"}
                  {assignment.schoolClass?.arm
                    ? ` ${assignment.schoolClass.arm}`
                    : ""}
                </p>
              </div>

              <div className="hidden text-right sm:block">
                <span
                  className={`rounded-full px-2 py-1 text-[10px] font-semibold ${getStatusClasses(
                    assignment.status
                  )}`}
                >
                  {formatStatus(assignment.status)}
                </span>

                <p className="mt-1 text-[10px] text-slate-400">
                  {formatDate(assignment.createdAt)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}