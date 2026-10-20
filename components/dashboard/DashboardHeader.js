"use client";

import { useEffect, useState } from "react";

import api from "@/lib/api";

export default function DashboardHeader({ user }) {
  const firstName = user?.firstName || "Admin";
  const schoolName = user?.school?.name || "Your School";

  const [academicPeriod, setAcademicPeriod] = useState({
    session: null,
    term: null,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAcademicPeriod = async () => {
      try {
        const [sessionsResponse, termsResponse] = await Promise.all([
          api.get("/academic-sessions"),
          api.get("/academic-terms"),
        ]);

        const sessions = sessionsResponse.data?.sessions || [];
        const terms = termsResponse.data?.terms || [];

        const currentSession =
          sessions.find((session) => session.isCurrent) || null;

        const currentTerm =
          terms.find((term) => term.isCurrent) || null;

        setAcademicPeriod({
          session: currentSession,
          term: currentTerm,
        });
      } catch (error) {
        console.error(
          "Failed to fetch academic period:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAcademicPeriod();
  }, []);

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-medium text-emerald-600">
          School Administration
        </p>

        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Welcome back, {firstName} 👋
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Here&apos;s what&apos;s happening at {schoolName}.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
          Current Academic Period
        </p>

        <p className="mt-1 text-sm font-semibold text-slate-800">
          {loading
            ? "Loading..."
            : academicPeriod.session || academicPeriod.term
              ? `${academicPeriod.session?.name || "Session"} · ${
                  academicPeriod.term?.name || "Term"
                }`
              : "No active academic period"}
        </p>
      </div>
    </div>
  );
}