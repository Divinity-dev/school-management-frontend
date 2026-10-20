"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  Bell,
  CalendarDays,
  CheckCircle2,
  GraduationCap,
  Loader2,
  Megaphone,
  Users,
} from "lucide-react";

import api from "@/lib/api";

export default function TeacherAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAnnouncements = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/announcements/my");

        setAnnouncements(response.data?.announcements || []);
      } catch (err) {
        console.error(
          "Failed to load teacher announcements:",
          err
        );

        setError(
          err.response?.data?.message ||
            "Unable to load announcements."
        );
      } finally {
        setLoading(false);
      }
    };

    loadAnnouncements();
  }, []);

  const formatDate = (date) => {
    if (!date) return "Date unavailable";

    return new Date(date).toLocaleDateString("en-NG", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleTimeString("en-NG", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[400px] max-w-5xl items-center justify-center">
          <div className="flex items-center gap-3 text-slate-500">
            <Loader2
              size={20}
              className="animate-spin text-emerald-600"
            />
            <span>Loading announcements...</span>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
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
                Announcements
              </h1>

              <p className="mt-2 max-w-2xl text-sm text-slate-500">
                Stay updated with important announcements
                from your school.
              </p>
            </div>

            <div className="flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
              <Bell
                size={17}
                className="text-emerald-600"
              />

              <span className="text-sm font-medium text-slate-600">
                {announcements.length}{" "}
                {announcements.length === 1
                  ? "Announcement"
                  : "Announcements"}
              </span>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle
              size={18}
              className="mt-0.5 shrink-0"
            />

            <p>{error}</p>
          </div>
        )}

        {/* Empty state */}
        {!error && announcements.length === 0 && (
          <section className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <Megaphone size={28} />
            </div>

            <h2 className="mt-5 text-lg font-semibold text-slate-900">
              No announcements yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              There are no announcements available for
              you at the moment. New school announcements
              will appear here.
            </p>
          </section>
        )}

        {/* Announcements */}
        {announcements.length > 0 && (
          <div className="space-y-5">
            {announcements.map((announcement) => (
              <AnnouncementCard
                key={announcement._id}
                announcement={announcement}
                formatDate={formatDate}
                formatTime={formatTime}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

/* =========================================================
   ANNOUNCEMENT CARD
========================================================= */

function AnnouncementCard({
  announcement,
  formatDate,
  formatTime,
}) {
  const isTeacherAnnouncement =
    announcement.targetAudience === "teachers";

  const creator = announcement.createdBy;

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      {/* Accent */}
      <div className="h-1 bg-emerald-500" />

      <div className="p-6 sm:p-7">
        {/* Top row */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Megaphone size={20} />
            </div>

            <div>
              <h2 className="text-lg font-semibold leading-6 text-slate-900">
                {announcement.title}
              </h2>

              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <CalendarDays size={14} />

                  <span>
                    {formatDate(announcement.createdAt)}
                  </span>

                  {formatTime(announcement.createdAt) && (
                    <span>
                      · {formatTime(announcement.createdAt)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <span
            className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${
              isTeacherAnnouncement
                ? "bg-emerald-50 text-emerald-700"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {isTeacherAnnouncement ? (
              <Users size={13} />
            ) : (
              <GraduationCap size={13} />
            )}

            {isTeacherAnnouncement
              ? "For Teachers"
              : "School-wide"}
          </span>
        </div>

        {/* Message */}
        <div className="mt-6 rounded-xl border border-slate-100 bg-slate-50 p-5">
          <p className="whitespace-pre-wrap text-sm leading-7 text-slate-600">
            {announcement.message}
          </p>
        </div>

        {/* Footer */}
        {creator && (
          <div className="mt-5 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-xs font-semibold text-emerald-700">
              {creator.firstName?.[0] || ""}
              {creator.lastName?.[0] || ""}
            </div>

            <div>
              <p className="text-xs font-medium text-slate-700">
                {creator.firstName} {creator.lastName}
              </p>

              <p className="text-xs text-slate-400">
                School Administrator
              </p>
            </div>

            <div className="ml-auto flex items-center gap-1.5 text-xs text-emerald-600">
              <CheckCircle2 size={14} />
              <span>Published</span>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}