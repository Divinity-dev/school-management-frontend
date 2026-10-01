"use client";

import { useParams } from "next/navigation";

import ParentChildResults from "@/components/dashboard/ParentDashboard/ParentChildResults";

export default function ParentChildResultsPage() {
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

  return <ParentChildResults studentId={id} />;
}