"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
ArrowLeft,
Loader2,
Megaphone,
} from "lucide-react";
import AnnouncementForm from "@/components/dashboard/AnnouncementForm";
import api from "@/lib/api";

export default function EditAnnouncementPage() {
const params = useParams();
const router = useRouter();

const announcementId = params?.id;

const [announcement, setAnnouncement] =
useState(null);

const [loading, setLoading] = useState(true);
const [submitting, setSubmitting] = useState(false);
const [error, setError] = useState("");

useEffect(() => {
if (!announcementId) return;


const fetchAnnouncement = async () => {
  try {
    setLoading(true);
    setError("");

    const response = await api.get(
      `/announcements/${announcementId}`
    );

    const data =
      response.data?.announcement || null;

    if (!data) {
      setError("Announcement not found.");
      return;
    }

    setAnnouncement(data);
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

const handleSubmit = async (formData) => {
try {
setSubmitting(true);
setError("");


  const response = await api.put(
    `/announcements/${announcementId}`,
    formData
  );

  const updatedAnnouncement =
    response.data?.announcement;

  if (updatedAnnouncement?._id) {
    router.push(
      `/dashboard/school-admin/announcements/${updatedAnnouncement._id}`
    );
    return;
  }

  router.push(
    `/dashboard/school-admin/announcements/${announcementId}`
  );
} catch (err) {
  console.error(
    "Failed to update announcement:",
    err
  );

  setError(
    err.response?.data?.message ||
      "Unable to update announcement."
  );
} finally {
  setSubmitting(false);
}


};

if (loading) {
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


    <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
      <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#166534]" />

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
        <Megaphone className="h-7 w-7" />
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

return ( <div className="space-y-6 p-4 sm:p-6 lg:p-8">
{/* Header */} <div>
<button
type="button"
onClick={() =>
router.push(
`/dashboard/school-admin/announcements/${announcementId}`
)
}
className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-gray-900"
> <ArrowLeft className="h-4 w-4" />
Back to Announcement </button>


    <div className="flex items-start gap-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
        <Megaphone className="h-6 w-6" />
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          Edit Announcement
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Update the announcement details, audience,
          or status.
        </p>
      </div>
    </div>
  </div>

  {/* Form */}
  <div className="mx-auto max-w-4xl">
    <AnnouncementForm
      mode="edit"
      initialData={announcement}
      onSubmit={handleSubmit}
      submitting={submitting}
      error={error}
    />
  </div>
</div>


);
}
