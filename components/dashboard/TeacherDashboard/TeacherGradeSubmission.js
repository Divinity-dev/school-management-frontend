"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  Loader2,
  Save,
  User,
} from "lucide-react";

import api from "@/lib/api";

export default function TeacherGradeSubmission() {
  const { id, submissionId } = useParams();
  const router = useRouter();

  const [submission, setSubmission] = useState(null);
  const [score, setScore] = useState("");
  const [feedback, setFeedback] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchSubmission = async () => {
      if (!id || !submissionId) return;

      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          `/assignments/${id}/submissions/${submissionId}`
        );

        const data = response.data?.submission;

        setSubmission(data);

        if (data?.score !== undefined && data?.score !== null) {
          setScore(data.score);
        }

        setFeedback(data?.feedback || "");
      } catch (err) {
        console.error("Failed to fetch submission:", err);

        setError(
          err.response?.data?.message ||
            "Failed to load this submission."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSubmission();
  }, [id, submissionId]);

  const student = submission?.student;

  const studentName = [
    student?.firstName,
    student?.middleName,
    student?.lastName,
  ]
    .filter(Boolean)
    .join(" ");

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleString("en-NG", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const handleGrade = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (score === "") {
      setError("Please enter a score.");
      return;
    }

    const numericScore = Number(score);

    if (Number.isNaN(numericScore)) {
      setError("Score must be a valid number.");
      return;
    }

    if (numericScore < 0 || numericScore > 100) {
      setError("Score must be between 0 and 100.");
      return;
    }

    try {
      setSaving(true);

      const response = await api.patch(
        `/assignments/${id}/submissions/${submissionId}/grade`,
        {
          score: numericScore,
          feedback,
        }
      );

      setSubmission(response.data?.submission || submission);
      setSuccess("Submission graded successfully.");
    } catch (err) {
      console.error("Failed to grade submission:", err);

      setError(
        err.response?.data?.message ||
          "Failed to grade this submission."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl animate-pulse space-y-6">
          <div className="h-8 w-72 rounded-lg bg-slate-200" />
          <div className="h-48 rounded-2xl bg-white" />
          <div className="h-80 rounded-2xl bg-white" />
        </div>
      </main>
    );
  }

  if (error && !submission) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md rounded-2xl border border-red-100 bg-red-50 p-6 text-center">
          <p className="text-sm text-red-600">{error}</p>

          <button
            type="button"
            onClick={() => router.back()}
            className="mt-4 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-700"
          >
            Go Back
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <section className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 hover:bg-slate-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div>
            <p className="text-sm font-medium text-emerald-600">
              Teacher Portal
            </p>

            <h1 className="mt-1 text-2xl font-bold text-slate-900">
              Grade Submission
            </h1>
          </div>
        </section>

        {/* Student */}
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
              <User className="h-6 w-6 text-emerald-600" />
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {studentName || "Unknown student"}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Student ID: {student?.studentId || "—"}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Submitted {formatDate(submission?.submittedAt)}
              </p>
            </div>
          </div>
        </section>

        {/* Assignment */}
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-slate-100 p-3">
              <FileText className="h-5 w-5 text-slate-600" />
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Assignment
              </p>

              <h2 className="mt-1 text-lg font-bold text-slate-900">
                {submission?.assignment?.title}
              </h2>
            </div>
          </div>
        </section>

        {/* Student Answer */}
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">
            Student Submission
          </h2>

          {submission?.content ? (
            <div className="mt-4 whitespace-pre-wrap rounded-xl bg-slate-50 p-5 text-sm leading-7 text-slate-700">
              {submission.content}
            </div>
          ) : (
            <div className="mt-4 rounded-xl bg-slate-50 p-5 text-sm text-slate-500">
              The student did not provide a written answer.
            </div>
          )}

          {/* Attachments */}
          {Array.isArray(submission?.attachments) &&
            submission.attachments.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-slate-700">
                  Attachments
                </h3>

                <div className="mt-3 space-y-2">
                  {submission.attachments.map(
                    (attachment, index) => {
                      const url =
                        typeof attachment === "string"
                          ? attachment
                          : attachment?.url;

                      const name =
                        typeof attachment === "string"
                          ? `Attachment ${index + 1}`
                          : attachment?.name ||
                            `Attachment ${index + 1}`;

                      if (!url) return null;

                      return (
                        <a
                          key={`${url}-${index}`}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 text-sm text-slate-700 transition hover:bg-slate-50"
                        >
                          <FileText className="h-4 w-4 text-emerald-600" />

                          <span className="truncate">
                            {name}
                          </span>
                        </a>
                      );
                    }
                  )}
                </div>
              </div>
            )}
        </section>

        {/* Grading */}
        <form
          onSubmit={handleGrade}
          className="rounded-2xl bg-white p-6 shadow-sm"
        >
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Grade
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Enter a score between 0 and 100 and optionally
              provide feedback.
            </p>
          </div>

          <div className="mt-6 space-y-5">
            {/* Score */}
            <div className="max-w-xs">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Score
              </label>

              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={score}
                  onChange={(event) =>
                    setScore(event.target.value)
                  }
                  placeholder="0 - 100"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-16 text-lg font-semibold text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />

                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                  / 100
                </span>
              </div>
            </div>

            {/* Feedback */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Feedback
                <span className="ml-1 font-normal text-slate-400">
                  (optional)
                </span>
              </label>

              <textarea
                value={feedback}
                onChange={(event) =>
                  setFeedback(event.target.value)
                }
                rows={5}
                placeholder="Give the student feedback about their work..."
                className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700 outline-none placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            {error && (
              <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                <CheckCircle2 className="h-4 w-4" />
                {success}
              </div>
            )}

            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => router.back()}
                disabled={saving}
                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Back
              </button>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    {submission?.status === "graded"
                      ? "Update Grade"
                      : "Save Grade"}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}