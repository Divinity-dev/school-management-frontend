"use client";

import { useSelector } from "react-redux";

import SchoolAdminDashboard from "../../../components/dashboard/SchoolAdminDashboard";

export default function DashboardPage() {
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

  if (user.role === "schoolAdmin") {
    return (
      <main className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
        <SchoolAdminDashboard user={user} />
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50">
      <p className="text-sm text-slate-500">
        No dashboard available for your role yet.
      </p>
    </main>
  );
}