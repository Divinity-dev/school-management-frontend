"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  Save,
  FileText,
  Hash,
} from "lucide-react";
import api from "@/lib/api";

export default function SubjectForm({ subjectId = null }) {
  const router = useRouter();
  const isEditMode = Boolean(subjectId);

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditMode);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isEditMode) return;

    const fetchSubject = async () => {
      try {
        setFetching(true);
        setError("");

        const response = await api.get(`/subjects/${subjectId}`);

        const subject = response.data.subject;

        setFormData({
          name: subject.name || "",
          code: subject.code || "",
          description: subject.description || "",
        });
      } catch (error) {
        console.error("Failed to fetch subject:", error);

        setError(
          error.response?.data?.message ||
            "Failed to load subject."
        );
      } finally {
        setFetching(false);
      }
    };

    fetchSubject();
  }, [subjectId, isEditMode]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!formData.name.trim()) {
      setError("Subject name is required.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        name: formData.name.trim(),
        code: formData.code.trim(),
        description: formData.description.trim(),
      };

      if (isEditMode) {
        await api.put(`/subjects/${subjectId}`, payload);
      } else {
        await api.post("/subjects", payload);
      }

      router.push("/dashboard/school-admin/subjects");
      router.refresh();
    } catch (error) {
      console.error("Failed to save subject:", error);

      setError(
        error.response?.data?.message ||
          "Failed to save subject."
      );
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50">
            <BookOpen
              size={20}
              className="text-emerald-600"
            />
          </div>

          <p className="text-sm text-gray-500">
            Loading subject...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-2xl">
        {/* Back */}
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-gray-900"
        >
          <ArrowLeft size={17} />
          Back to Subjects
        </button>

        {/* Page Header */}
        <div className="mb-7 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <BookOpen size={27} />
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            {isEditMode
              ? "Edit Subject"
              : "Create Subject"}
          </h1>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
            {isEditMode
              ? "Update the details of this subject."
              : "Add a new subject to your school's curriculum."}
          </p>
        </div>

        {/* Form Card */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          {/* Card Header */}
          <div className="border-b border-gray-100 bg-gray-50/70 px-6 py-5 sm:px-8">
            <h2 className="text-base font-semibold text-gray-900">
              Subject Information
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Enter the basic information for this subject.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="px-6 py-6 sm:px-8 sm:py-8"
          >
            {/* Error */}
            {error && (
              <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm text-red-700">
                <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-red-500" />

                <p>{error}</p>
              </div>
            )}

            <div className="space-y-6">
              {/* Subject Name */}
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Subject Name
                  <span className="ml-1 text-red-500">*</span>
                </label>

                <div className="relative">
                  <BookOpen
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Mathematics"
                    disabled={loading}
                    className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-11 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 disabled:cursor-not-allowed disabled:bg-gray-50"
                  />
                </div>
              </div>

              {/* Code */}
              <div>
                <label
                  htmlFor="code"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Subject Code
                </label>

                <div className="relative">
                  <Hash
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    id="code"
                    name="code"
                    type="text"
                    value={formData.code}
                    onChange={handleChange}
                    placeholder="e.g. MATH"
                    disabled={loading}
                    className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-11 pr-4 text-sm uppercase text-gray-900 outline-none transition placeholder:normal-case placeholder:text-gray-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 disabled:cursor-not-allowed disabled:bg-gray-50"
                  />
                </div>

                <p className="mt-1.5 text-xs text-gray-400">
                  A short code used to identify the subject.
                </p>
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="description"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Description
                </label>

                <div className="relative">
                  <FileText
                    size={18}
                    className="absolute left-3.5 top-3.5 text-gray-400"
                  />

                  <textarea
                    id="description"
                    name="description"
                    rows={4}
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Add a short description of this subject..."
                    disabled={loading}
                    className="w-full resize-none rounded-xl border border-gray-300 bg-white py-3 pl-11 pr-4 text-sm leading-6 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 disabled:cursor-not-allowed disabled:bg-gray-50"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 flex flex-col-reverse gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() =>
                  router.push(
                    "/dashboard/school-admin/subjects"
                  )
                }
                disabled={loading}
                className="rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Save size={17} />

                {loading
                  ? "Saving..."
                  : isEditMode
                  ? "Update Subject"
                  : "Create Subject"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}