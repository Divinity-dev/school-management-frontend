"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
Bell,
CalendarDays,
ChevronRight,
Edit,
Megaphone,
Plus,
Search,
Trash2,
Users,
UserRound,
GraduationCap,
BriefcaseBusiness,
X,
} from "lucide-react";
import api from "@/lib/api";

const audienceLabels = {
all: "Everyone",
parents: "Parents",
teachers: "Teachers",
students: "Students",
};

const audienceIcons = {
all: Users,
parents: UserRound,
teachers: BriefcaseBusiness,
students: GraduationCap,
};

const formatDate = (date) => {
if (!date) return "—";

return new Date(date).toLocaleDateString("en-NG", {
year: "numeric",
month: "short",
day: "numeric",
});
};

const formatDateTime = (date) => {
if (!date) return "—";

return new Date(date).toLocaleString("en-NG", {
year: "numeric",
month: "short",
day: "numeric",
hour: "numeric",
minute: "2-digit",
});
};

const getAudienceClasses = (audience) => {
switch (audience) {
case "parents":
return "bg-purple-50 text-purple-700 border-purple-200";
case "teachers":
return "bg-blue-50 text-blue-700 border-blue-200";
case "students":
return "bg-amber-50 text-amber-700 border-amber-200";
default:
return "bg-emerald-50 text-emerald-700 border-emerald-200";
}
};

export default function AnnouncementsPage() {
const router = useRouter();

const [announcements, setAnnouncements] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

const [search, setSearch] = useState("");
const [audienceFilter, setAudienceFilter] = useState("all");
const [statusFilter, setStatusFilter] = useState("all");

const [deletingId, setDeletingId] = useState(null);
const [deleteTarget, setDeleteTarget] = useState(null);

const fetchAnnouncements = async () => {
try {
setLoading(true);
setError("");


  const response = await api.get("/announcements");

  setAnnouncements(response.data?.announcements || []);
} catch (err) {
  console.error("Failed to load announcements:", err);

  setError(
    err.response?.data?.message ||
      "Unable to load announcements."
  );
} finally {
  setLoading(false);
}


};

useEffect(() => {
fetchAnnouncements();
}, []);

const filteredAnnouncements = useMemo(() => {
const normalizedSearch = search.trim().toLowerCase();


return announcements.filter((announcement) => {
  const matchesSearch =
    !normalizedSearch ||
    announcement.title?.toLowerCase().includes(normalizedSearch) ||
    announcement.message
      ?.toLowerCase()
      .includes(normalizedSearch);

  const matchesAudience =
    audienceFilter === "all" ||
    announcement.targetAudience === audienceFilter;

  const matchesStatus =
    statusFilter === "all" ||
    (statusFilter === "active" && announcement.isActive) ||
    (statusFilter === "inactive" && !announcement.isActive);

  return (
    matchesSearch &&
    matchesAudience &&
    matchesStatus
  );
});


}, [
announcements,
search,
audienceFilter,
statusFilter,
]);

const stats = useMemo(() => {
const active = announcements.filter(
(announcement) => announcement.isActive
).length;


const inactive = announcements.length - active;

const forEveryone = announcements.filter(
  (announcement) =>
    announcement.targetAudience === "all"
).length;

return {
  total: announcements.length,
  active,
  inactive,
  forEveryone,
};


}, [announcements]);

const handleDelete = async () => {
if (!deleteTarget?._id) return;


try {
  setDeletingId(deleteTarget._id);
  setError("");

  await api.delete(
    `/announcements/${deleteTarget._id}`
  );

  setAnnouncements((current) =>
    current.filter(
      (announcement) =>
        announcement._id !== deleteTarget._id
    )
  );

  setDeleteTarget(null);
} catch (err) {
  console.error("Failed to delete announcement:", err);

  setError(
    err.response?.data?.message ||
      "Unable to delete announcement."
  );
} finally {
  setDeletingId(null);
}


};

const clearFilters = () => {
setSearch("");
setAudienceFilter("all");
setStatusFilter("all");
};

const hasFilters =
search ||
audienceFilter !== "all" ||
statusFilter !== "all";

return ( <div className="space-y-6 p-4 sm:p-6 lg:p-8">
{/* Header */} <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"> <div> <div className="mb-2 flex items-center gap-2 text-sm text-gray-500"> <Megaphone className="h-4 w-4" /> <span>School Administration</span> <ChevronRight className="h-4 w-4" /> <span>Announcements</span> </div>


      <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
        Announcements
      </h1>

      <p className="mt-1 text-sm text-gray-500">
        Create and manage announcements for your school
        community.
      </p>
    </div>

    <button
      type="button"
      onClick={() =>
        router.push(
          "/dashboard/school-admin/announcements/new"
        )
      }
      className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#166534] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#14532d]"
    >
      <Plus className="h-5 w-5" />
      Create Announcement
    </button>
  </div>

  {/* Error */}
  {error && (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      <div>{error}</div>

      <button
        type="button"
        onClick={() => setError("")}
        className="shrink-0 rounded-md p-1 hover:bg-red-100"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )}

  {/* Stats */}
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">
            Total Announcements
          </p>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {stats.total}
          </p>
        </div>

        <div className="rounded-xl bg-emerald-50 p-3 text-emerald-700">
          <Bell className="h-6 w-6" />
        </div>
      </div>
    </div>

    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">
            Active
          </p>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {stats.active}
          </p>
        </div>

        <div className="rounded-xl bg-green-50 p-3 text-green-700">
          <Megaphone className="h-6 w-6" />
        </div>
      </div>
    </div>

    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">
            Inactive
          </p>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {stats.inactive}
          </p>
        </div>

        <div className="rounded-xl bg-gray-100 p-3 text-gray-600">
          <Bell className="h-6 w-6" />
        </div>
      </div>
    </div>

    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">
            For Everyone
          </p>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {stats.forEveryone}
          </p>
        </div>

        <div className="rounded-xl bg-blue-50 p-3 text-blue-700">
          <Users className="h-6 w-6" />
        </div>
      </div>
    </div>
  </div>

  {/* Filters */}
  <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search announcements..."
          className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-[#166534] focus:ring-2 focus:ring-[#166534]/10"
        />
      </div>

      <select
        value={audienceFilter}
        onChange={(e) =>
          setAudienceFilter(e.target.value)
        }
        className="rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-700 outline-none focus:border-[#166534] focus:ring-2 focus:ring-[#166534]/10"
      >
        <option value="all">
          All Audiences
        </option>
        <option value="parents">Parents</option>
        <option value="teachers">Teachers</option>
        <option value="students">Students</option>
      </select>

      <select
        value={statusFilter}
        onChange={(e) =>
          setStatusFilter(e.target.value)
        }
        className="rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-700 outline-none focus:border-[#166534] focus:ring-2 focus:ring-[#166534]/10"
      >
        <option value="all">All Statuses</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>

      {hasFilters && (
        <button
          type="button"
          onClick={clearFilters}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 px-4 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
        >
          <X className="h-4 w-4" />
          Clear
        </button>
      )}
    </div>
  </div>

  {/* Content */}
  {loading ? (
    <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
      <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#166534]" />
      <p className="mt-4 text-sm text-gray-500">
        Loading announcements...
      </p>
    </div>
  ) : filteredAnnouncements.length === 0 ? (
    <div className="rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center shadow-sm">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
        <Megaphone className="h-8 w-8" />
      </div>

      <h2 className="mt-5 text-lg font-semibold text-gray-900">
        {announcements.length === 0
          ? "No announcements yet"
          : "No announcements found"}
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
        {announcements.length === 0
          ? "Create your first announcement to communicate important information to your school community."
          : "Try changing your search or filters to find an announcement."}
      </p>

      {announcements.length === 0 ? (
        <button
          type="button"
          onClick={() =>
            router.push(
              "/dashboard/school-admin/announcements/new"
            )
          }
          className="mt-6 cursor-pointer inline-flex items-center gap-2 rounded-xl bg-[#166534] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#14532d]"
        >
          <Plus className="h-5 w-5" />
          Create Announcement
        </button>
      ) : hasFilters ? (
        <button
          type="button"
          onClick={clearFilters}
          className="mt-6 rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
        >
          Clear Filters
        </button>
      ) : null}
    </div>
  ) : (
    <>
      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm lg:block">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Announcement
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Audience
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Created
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {filteredAnnouncements.map(
                (announcement) => {
                  const AudienceIcon =
                    audienceIcons[
                      announcement.targetAudience
                    ] || Users;

                  return (
                    <tr
                      key={announcement._id}
                      className="transition hover:bg-gray-50/70"
                    >
                      <td className="px-6 py-5">
                        <button
                          type="button"
                          onClick={() =>
                            router.push(
                              `/dashboard/school-admin/announcements/${announcement._id}`
                            )
                          }
                          className="text-left"
                        >
                          <p className="font-semibold text-gray-900 hover:text-[#166534]">
                            {announcement.title}
                          </p>

                          <p className="mt-1 line-clamp-2 max-w-xl text-sm text-gray-500">
                            {announcement.message}
                          </p>
                        </button>
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${getAudienceClasses(
                            announcement.targetAudience
                          )}`}
                        >
                          <AudienceIcon className="h-3.5 w-3.5" />
                          {audienceLabels[
                            announcement.targetAudience
                          ] || "Everyone"}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${
                            announcement.isActive
                              ? "bg-green-50 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {announcement.isActive
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <CalendarDays className="h-4 w-4 text-gray-400" />
                          {formatDate(
                            announcement.createdAt
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              router.push(
                                `/dashboard/school-admin/announcements/${announcement._id}`
                              )
                            }
                            className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
                          >
                            View
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              router.push(
                                `/dashboard/school-admin/announcements/${announcement._id}/edit`
                              )
                            }
                            className="rounded-lg p-2 text-gray-500 transition hover:bg-emerald-50 hover:text-emerald-700"
                            title="Edit announcement"
                          >
                            <Edit className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setDeleteTarget(
                                announcement
                              )
                            }
                            className="rounded-lg p-2 text-gray-500 transition hover:bg-red-50 hover:text-red-600"
                            title="Delete announcement"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile / tablet cards */}
      <div className="grid gap-4 lg:hidden">
        {filteredAnnouncements.map(
          (announcement) => {
            const AudienceIcon =
              audienceIcons[
                announcement.targetAudience
              ] || Users;

            return (
              <div
                key={announcement._id}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        `/dashboard/school-admin/announcements/${announcement._id}`
                      )
                    }
                    className="min-w-0 text-left"
                  >
                    <h2 className="font-semibold text-gray-900 hover:text-[#166534]">
                      {announcement.title}
                    </h2>

                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-gray-500">
                      {announcement.message}
                    </p>
                  </button>

                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                      announcement.isActive
                        ? "bg-green-50 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {announcement.isActive
                      ? "Active"
                      : "Inactive"}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${getAudienceClasses(
                      announcement.targetAudience
                    )}`}
                  >
                    <AudienceIcon className="h-3.5 w-3.5" />
                    {audienceLabels[
                      announcement.targetAudience
                    ] || "Everyone"}
                  </span>

                  <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {formatDate(
                      announcement.createdAt
                    )}
                  </span>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
                  <span className="text-xs text-gray-400">
                    {announcement.createdBy
                      ? `By ${announcement.createdBy.firstName || ""} ${
                          announcement.createdBy.lastName || ""
                        }`.trim()
                      : "Created by school admin"}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          `/dashboard/school-admin/announcements/${announcement._id}`
                        )
                      }
                      className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
                    >
                      View
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          `/dashboard/school-admin/announcements/${announcement._id}/edit`
                        )
                      }
                      className="rounded-lg p-2 text-gray-500 hover:bg-emerald-50 hover:text-emerald-700"
                      title="Edit announcement"
                    >
                      <Edit className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setDeleteTarget(announcement)
                      }
                      className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600"
                      title="Delete announcement"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          }
        )}
      </div>
    </>
  )}

  {/* Delete confirmation */}
  {deleteTarget && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
          <Trash2 className="h-6 w-6" />
        </div>

        <h2 className="mt-5 text-lg font-semibold text-gray-900">
          Delete announcement?
        </h2>

        <p className="mt-2 text-sm leading-6 text-gray-500">
          You are about to permanently delete{" "}
          <span className="font-semibold text-gray-700">
            “{deleteTarget.title}”
          </span>
          . This action cannot be undone.
        </p>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => setDeleteTarget(null)}
            disabled={deletingId === deleteTarget._id}
            className="rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={deletingId === deleteTarget._id}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {deletingId === deleteTarget._id ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Delete
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )}
</div>


);
}
