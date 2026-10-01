"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  Bell,
  CalendarDays,
  Megaphone,
  RefreshCw,
  User,
} from "lucide-react";

import api from "@/lib/api";

const formatDate = (date) => {
  if (!date) return "Unknown date";

  return new Date(date).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const formatDateTime = (date) => {
  if (!date) return "";

  return new Date(date).toLocaleString("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

export default function StudentAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/announcements/my");

      setAnnouncements(response.data?.announcements || []);
    } catch (err) {
      console.error("Failed to fetch announcements:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load announcements. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/dashboard/student"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>

          <div className="mt-5 flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-emerald-600">
                Student Portal
              </p>

              <h1 className="mt-1 flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                <Bell className="h-7 w-7 text-emerald-600" />
                Announcements
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Stay updated with important information from your school.
              </p>
            </div>

            <button
              type="button"
              onClick={fetchAnnouncements}
              disabled={loading}
              className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />

              <div>
                <p className="text-sm font-semibold text-red-800">
                  Unable to load announcements
                </p>

                <p className="mt-1 text-sm text-red-600">{error}</p>

                <button
                  type="button"
                  onClick={fetchAnnouncements}
                  className="mt-3 text-sm font-semibold text-red-700 underline underline-offset-2"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && !error ? (
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100"
              >
                <div className="flex gap-4">
                  <div className="h-11 w-11 shrink-0 rounded-xl bg-slate-200" />

                  <div className="flex-1">
                    <div className="h-5 w-2/3 rounded bg-slate-200" />
                    <div className="mt-3 h-3 w-1/3 rounded bg-slate-200" />
                    <div className="mt-5 h-3 w-full rounded bg-slate-200" />
                    <div className="mt-2 h-3 w-5/6 rounded bg-slate-200" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : announcements.length === 0 && !error ? (
          /* Empty State */
          <div className="rounded-3xl bg-white px-6 py-16 text-center shadow-sm ring-1 ring-slate-100">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <Megaphone className="h-8 w-8" />
            </div>

            <h2 className="mt-5 text-lg font-semibold text-slate-900">
              No announcements yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              There are no announcements available for you at the moment.
              Check back later for updates from your school.
            </p>

            <Link
              href="/dashboard/student"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </div>
        ) : (
          /* Announcements */
          <div className="space-y-4">
            {announcements.map((announcement) => {
              const createdBy = announcement.createdBy;

              const authorName = createdBy
                ? [createdBy.firstName, createdBy.lastName]
                    .filter(Boolean)
                    .join(" ")
                : "School Administration";

              return (
                <article
                  key={announcement._id}
                  className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100 transition hover:shadow-md sm:p-6"
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                      <Megaphone className="h-5 w-5" />
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <h2 className="text-lg font-semibold text-slate-900">
                          {announcement.title}
                        </h2>

                        <span className="shrink-0 text-xs font-medium text-slate-400">
                          {formatDate(announcement.createdAt)}
                        </span>
                      </div>

                      <div className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-600">
                        {announcement.content}
                      </div>

                      {/* Meta */}
                      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-slate-100 pt-4">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <User className="h-3.5 w-3.5" />
                          <span>{authorName}</span>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <CalendarDays className="h-3.5 w-3.5" />
                          <span>
                            {formatDateTime(announcement.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}