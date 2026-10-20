"use client";

import { useSelector } from "react-redux";

import StudentDashboard from "@/components/StudentDashboard/StudentDashboard";

export default function StudentDashboardPage() {
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

  if (user.role !== "student") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">
          You are not authorized to access the student portal.
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <StudentDashboard user={user} />
    </main>
  );
}