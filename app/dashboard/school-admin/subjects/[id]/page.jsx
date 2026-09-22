"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  Pencil,
  Power,
} from "lucide-react";
import api from "@/lib/api";

export default function SubjectDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const [subject, setSubject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSubject = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          `/subjects/${params.id}`
        );

        setSubject(response.data.subject);
      } catch (error) {
        console.error(
          "Failed to fetch subject:",
          error
        );

        setError(
          error.response?.data?.message ||
            "Unable to load subject."
        );
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchSubject();
    }
  }, [params.id]);

  const handleDeactivate = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to deactivate ${subject.name}?`
    );

    if (!confirmed) return;

    try {
      await api.patch(
        `/subjects/${subject._id}/deactivate`
      );

      setSubject((prev) => ({
        ...prev,
        isActive: false,
      }));
    } catch (error) {
      console.error(
        "Failed to deactivate subject:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to deactivate subject."
      );
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-sm text-gray-500">
          Loading subject...
        </p>
      </div>
    );
  }

  if (error && !subject) {
    return (
      <div className="space-y-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={17} />
          Back to Subjects
        </button>

        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50"
          >
            <ArrowLeft size={19} />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <BookOpen
                size={22}
                className="text-emerald-600"
              />

              <h1 className="text-2xl font-semibold text-gray-900">
                {subject.name}
              </h1>
            </div>

            <p className="mt-1 text-sm text-gray-500">
              Subject details
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() =>
              router.push(
                `/dashboard/school-admin/subjects/${subject._id}/edit`
              )
            }
            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            <Pencil size={17} />
            Edit
          </button>

          {subject.isActive && (
            <button
              type="button"
              onClick={handleDeactivate}
              className="flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
            >
              <Power size={17} />
              Deactivate
            </button>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Subject card */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 bg-gray-50 px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
              <BookOpen size={27} />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {subject.name}
              </h2>

              <span
                className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                  subject.isActive
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {subject.isActive
                  ? "Active"
                  : "Inactive"}
              </span>
            </div>
          </div>
        </div>

        <div className="grid gap-6 p-6 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Subject Name
            </p>

            <p className="mt-2 text-sm font-medium text-gray-900">
              {subject.name}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Subject Code
            </p>

            <p className="mt-2 text-sm font-medium text-gray-900">
              {subject.code || "Not provided"}
            </p>
          </div>

          <div className="sm:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Description
            </p>

            <p className="mt-2 text-sm leading-6 text-gray-700">
              {subject.description ||
                "No description provided."}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Status
            </p>

            <p className="mt-2 text-sm font-medium text-gray-900">
              {subject.isActive
                ? "Active"
                : "Inactive"}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Created
            </p>

            <p className="mt-2 text-sm font-medium text-gray-900">
              {subject.createdAt
                ? new Date(
                    subject.createdAt
                  ).toLocaleDateString()
                : "—"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}