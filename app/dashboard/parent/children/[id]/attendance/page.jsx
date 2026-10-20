"use client";

import { useParams } from "next/navigation";

import ParentChildAttendance from "@/components/dashboard/ParentDashboard/ParentChildAttendance";

export default function ParentChildAttendancePage() {
  const { id } = useParams();

  if (!id) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">
          Student information is missing.
        </p>
      </main>
    );
  }

  return <ParentChildAttendance studentId={id} />;
}