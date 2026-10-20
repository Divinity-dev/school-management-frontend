"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
ArrowLeft,
Bell,
CalendarDays,
Edit,
Mail,
Megaphone,
Trash2,
User,
Users,
UserRound,
GraduationCap,
BriefcaseBusiness,
Clock,
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

const formatDateTime = (date) => {
if (!date) return "—";

return new Date(date).toLocaleString("en-NG", {
year: "numeric",
month: "long",
day: "numeric",
hour: "numeric",
minute: "2-digit",
});
};

const getCreatorName = (createdBy) => {
if (!createdBy) return "School Admin";

const name =
`${createdBy.firstName || ""} ${
      createdBy.lastName || ""
    }`.trim();

return name || createdBy.email || "School Admin";
};

export default function AnnouncementDetailsPage() {
const params = useParams();
const router = useRouter();

const announcementId = params?.id;

const [announcement, setAnnouncement] =
useState(null);

const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

const [deleteTarget, setDeleteTarget] =
useState(false);

const [deleting, setDeleting] = useState(false);

useEffect(() => {
if (!announcementId) return;


const fetchAnnouncement = async () => {
  try {
    setLoading(true);
    setError("");

    const response = await api.get(
      `/announcements/${announcementId}`
    );

    setAnnouncement(
      response.data?.announcement || null
    );
  } catch (err) {
    console.error(
      "Failed to load announcement:",
      err
    );

    setError(
      err.response?.data?.message ||
        "Unable to load announcement."
    );
  } finally {
    setLoading(false);
  }
};

fetchAnnouncement();


}, [announcementId]);

const handleDelete = async () => {
if (!announcement?._id) return;


try {
  setDeleting(true);
  setError("");

  await api.delete(
    `/announcements/${announcement._id}`
  );

  router.push(
    "/dashboard/school-admin/announcements"
  );
} catch (err) {
  console.error(
    "Failed to delete announcement:",
    err
  );

  setError(
    err.response?.data?.message ||
      "Unable to delete announcement."
  );

  setDeleting(false);
  setDeleteTarget(false);
}


};

if (loading) {
return ( <div className="space-y-6 p-4 sm:p-6 lg:p-8"> <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm"> <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#166534]" />


      <p className="mt-4 text-sm text-gray-500">
        Loading announcement...
      </p>
    </div>
  </div>
);


}

if (error || !announcement) {
return ( <div className="space-y-6 p-4 sm:p-6 lg:p-8">
<button
type="button"
onClick={() =>
router.push(
"/dashboard/school-admin/announcements"
)
}
className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-gray-900"
> <ArrowLeft className="h-4 w-4" />
Back to Announcements </button>


    <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-12 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-red-100 text-red-600">
        <Bell className="h-7 w-7" />
      </div>

      <h2 className="mt-4 text-lg font-semibold text-red-900">
        Unable to load announcement
      </h2>

      <p className="mt-2 text-sm text-red-700">
        {error || "Announcement not found."}
      </p>

      <button
        type="button"
        onClick={() =>
          router.push(
            "/dashboard/school-admin/announcements"
          )
        }
        className="mt-6 rounded-xl bg-[#166534] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#14532d]"
      >
        Back to Announcements
      </button>
    </div>
  </div>
);


}

const AudienceIcon =
audienceIcons[announcement.targetAudience] ||
Users;

const creatorName = getCreatorName(
announcement.createdBy
);

return ( <div className="space-y-6 p-4 sm:p-6 lg:p-8">
{/* Header */} <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"> <div>
<button
type="button"
onClick={() =>
router.push(
"/dashboard/school-admin/announcements"
)
}
className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-gray-900"
> <ArrowLeft className="h-4 w-4" />
Back to Announcements </button>


      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
          <Megaphone className="h-6 w-6" />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Announcement Details
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            View the full announcement and its
            publication information.
          </p>
        </div>
      </div>
    </div>

    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() =>
          router.push(
            `/dashboard/school-admin/announcements/${announcement._id}/edit`
          )
        }
        className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
      >
        <Edit className="h-4 w-4" />
        Edit
      </button>

      <button
        type="button"
        onClick={() => setDeleteTarget(true)}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
      >
        <Trash2 className="h-4 w-4" />
        Delete
      </button>
    </div>
  </div>

  {/* Announcement */}
  <div className="mx-auto max-w-4xl">
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      {/* Announcement header */}
      <div className="border-b border-gray-100 bg-gray-50/70 p-5 sm:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${getAudienceClasses(
              announcement.targetAudience
            )}`}
          >
            <AudienceIcon className="h-3.5 w-3.5" />
            {audienceLabels[
              announcement.targetAudience
            ] || "Everyone"}
          </span>

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
        </div>

        <h2 className="mt-5 text-2xl font-bold leading-tight text-gray-900 sm:text-3xl">
          {announcement.title}
        </h2>

        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-500">
          <span className="inline-flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            {formatDateTime(
              announcement.createdAt
            )}
          </span>

          {announcement.updatedAt &&
            announcement.updatedAt !==
              announcement.createdAt && (
              <span className="inline-flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Updated{" "}
                {formatDateTime(
                  announcement.updatedAt
                )}
              </span>
            )}
        </div>
      </div>

      {/* Message */}
      <div className="p-5 sm:p-8">
        <div className="mb-3 flex items-center gap-2">
          <Bell className="h-5 w-5 text-emerald-700" />
          <h3 className="font-semibold text-gray-900">
            Message
          </h3>
        </div>

        <div className="whitespace-pre-wrap rounded-xl bg-gray-50 p-5 text-sm leading-7 text-gray-700 sm:p-6 sm:text-base">
          {announcement.message}
        </div>
      </div>

      {/* Creator */}
      <div className="border-t border-gray-100 p-5 sm:p-8">
        <h3 className="mb-4 font-semibold text-gray-900">
          Announcement Information
        </h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                <User className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Created By
                </p>

                <p className="mt-1 truncate text-sm font-semibold text-gray-900">
                  {creatorName}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                <Mail className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Creator Email
                </p>

                <p className="mt-1 truncate text-sm font-semibold text-gray-900">
                  {announcement.createdBy?.email ||
                    "—"}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                <Users className="h-5 w-5" />
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Target Audience
                </p>

                <p className="mt-1 text-sm font-semibold text-gray-900">
                  {audienceLabels[
                    announcement.targetAudience
                  ] || "Everyone"}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                <CalendarDays className="h-5 w-5" />
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Created
                </p>

                <p className="mt-1 text-sm font-semibold text-gray-900">
                  {formatDateTime(
                    announcement.createdAt
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  {/* Delete confirmation */}
  {deleteTarget && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
            <Trash2 className="h-6 w-6" />
          </div>

          <button
            type="button"
            onClick={() => setDeleteTarget(false)}
            disabled={deleting}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <h2 className="mt-5 text-lg font-semibold text-gray-900">
          Delete announcement?
        </h2>

        <p className="mt-2 text-sm leading-6 text-gray-500">
          You are about to permanently delete{" "}
          <span className="font-semibold text-gray-700">
            “{announcement.title}”
          </span>
          . This action cannot be undone.
        </p>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => setDeleteTarget(false)}
            disabled={deleting}
            className="rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {deleting ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Delete Announcement
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
