"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Plus,
  Search,
  Pencil,
  Eye,
  Power,
} from "lucide-react";
import api from "@/lib/api";

export default function SubjectsPage() {
  const router = useRouter();

  const [subjects, setSubjects] = useState([]);
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/subjects");

      const data = response.data.subjects || [];

      setSubjects(data);
      setFilteredSubjects(data);
    } catch (error) {
      console.error("Failed to fetch subjects:", error);

      setError(
        error.response?.data?.message ||
          "Unable to load subjects."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      setFilteredSubjects(subjects);
      return;
    }

    const filtered = subjects.filter((subject) => {
      return (
        subject.name?.toLowerCase().includes(query) ||
        subject.code?.toLowerCase().includes(query) ||
        subject.description?.toLowerCase().includes(query)
      );
    });

    setFilteredSubjects(filtered);
  }, [search, subjects]);

  const handleDeactivate = async (subjectId, subjectName) => {
    const confirmed = window.confirm(
      `Are you sure you want to deactivate ${subjectName}?`
    );

    if (!confirmed) return;

    try {
      await api.patch(
        `/subjects/${subjectId}/deactivate`
      );

      fetchSubjects();
    } catch (error) {
      console.error(
        "Failed to deactivate subject:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to deactivate subject."
      );
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <BookOpen size={22} />
            </div>

            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Subjects
              </h1>

              <p className="text-sm text-gray-500">
                Manage the subjects offered by your school.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            router.push(
              "/dashboard/school-admin/subjects/new"
            )
          }
          className="flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700"
        >
          <Plus size={18} />
          Add Subject
        </button>
      </div>

      {/* Search */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="relative max-w-md">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search subjects..."
            className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Content */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <p className="text-sm text-gray-500">
              Loading subjects...
            </p>
          </div>
        ) : filteredSubjects.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400">
              <BookOpen size={26} />
            </div>

            <h3 className="text-base font-semibold text-gray-900">
              {search
                ? "No subjects found"
                : "No subjects yet"}
            </h3>

            <p className="mt-1 max-w-sm text-sm text-gray-500">
              {search
                ? "Try adjusting your search."
                : "Create your first subject to get started."}
            </p>

            {!search && (
              <button
                type="button"
                onClick={() =>
                  router.push(
                    "/dashboard/school-admin/subjects/new"
                  )
                }
                className="mt-5 flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
              >
                <Plus size={17} />
                Add Subject
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Subject
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Code
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Description
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Status
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredSubjects.map((subject) => (
                    <tr
                      key={subject._id}
                      className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                            <BookOpen size={17} />
                          </div>

                          <span className="font-medium text-gray-900">
                            {subject.name}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm font-medium text-gray-600">
                        {subject.code || "—"}
                      </td>

                      <td className="max-w-xs px-6 py-4 text-sm text-gray-500">
                        <span className="line-clamp-2">
                          {subject.description || "—"}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                            subject.isActive
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {subject.isActive
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            title="View subject"
                            onClick={() =>
                              router.push(
                                `/dashboard/school-admin/subjects/${subject._id}`
                              )
                            }
                            className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
                          >
                            <Eye size={17} />
                          </button>

                          <button
                            type="button"
                            title="Edit subject"
                            onClick={() =>
                              router.push(
                                `/dashboard/school-admin/subjects/${subject._id}/edit`
                              )
                            }
                            className="rounded-lg p-2 text-gray-500 transition hover:bg-emerald-50 hover:text-emerald-600"
                          >
                            <Pencil size={17} />
                          </button>

                          {subject.isActive && (
                            <button
                              type="button"
                              title="Deactivate subject"
                              onClick={() =>
                                handleDeactivate(
                                  subject._id,
                                  subject.name
                                )
                              }
                              className="rounded-lg p-2 text-gray-500 transition hover:bg-red-50 hover:text-red-600"
                            >
                              <Power size={17} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="divide-y divide-gray-100 md:hidden">
              {filteredSubjects.map((subject) => (
                <div
                  key={subject._id}
                  className="p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                        <BookOpen size={18} />
                      </div>

                      <div className="min-w-0">
                        <h3 className="truncate font-medium text-gray-900">
                          {subject.name}
                        </h3>

                        <p className="text-xs text-gray-500">
                          {subject.code || "No code"}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
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

                  {subject.description && (
                    <p className="mt-3 text-sm text-gray-500">
                      {subject.description}
                    </p>
                  )}

                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          `/dashboard/school-admin/subjects/${subject._id}`
                        )
                      }
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      <Eye size={16} />
                      View
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          `/dashboard/school-admin/subjects/${subject._id}/edit`
                        )
                      }
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      <Pencil size={16} />
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}