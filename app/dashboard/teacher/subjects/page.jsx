"use client";

import { useSelector } from "react-redux";

import TeacherSubjects from "@/components/dashboard/TeacherDashboard/TeacherSubjects";

export default function TeacherSubjectsPage() {
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

  return <TeacherSubjects user={user} />;
}