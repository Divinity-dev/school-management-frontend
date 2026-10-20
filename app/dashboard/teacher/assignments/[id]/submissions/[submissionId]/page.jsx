"use client";

import { useParams } from "next/navigation";

import TeacherGradeSubmission from "@/components/dashboard/TeacherDashboard/TeacherGradeSubmission";

export default function TeacherGradeSubmissionPage() {
  const { id, submissionId } = useParams();

  if (!id || !submissionId) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">
          Submission information is missing.
        </p>
      </main>
    );
  }

  return <TeacherGradeSubmission />;
}