"use client";

import { useSelector } from "react-redux";

import TeacherDashboard from "@/components/dashboard/TeacherDashboard/TeacherDashboard";

export default function TeacherDashboardPage() {
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

  return <TeacherDashboard user={user} />;
}