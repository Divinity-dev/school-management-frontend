"use client";

import { useParams } from "next/navigation";

import TeacherAssignmentSubmissions from "@/components/dashboard/TeacherDashboard/TeacherAssignmentSubmissions";

export default function TeacherAssignmentSubmissionsPage() {
  const { id } = useParams();

  if (!id) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">
          Assignment information is missing.
        </p>
      </main>
    );
  }

  return <TeacherAssignmentSubmissions />;
}