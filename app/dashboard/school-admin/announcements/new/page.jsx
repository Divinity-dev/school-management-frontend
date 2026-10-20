"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
ArrowLeft,
Megaphone,
} from "lucide-react";
import AnnouncementForm from "@/components/dashboard/AnnouncementForm";
import api from "@/lib/api";

export default function CreateAnnouncementPage() {
const router = useRouter();

const [submitting, setSubmitting] = useState(false);
const [error, setError] = useState("");

const handleSubmit = async (formData) => {
try {
setSubmitting(true);
setError("");


  const response = await api.post(
    "/announcements",
    formData
  );

  const createdAnnouncement =
    response.data?.announcement;

  if (createdAnnouncement?._id) {
    router.push(
      `/dashboard/school-admin/announcements/${createdAnnouncement._id}`
    );
    return;
  }

  router.push(
    "/dashboard/school-admin/announcements"
  );
} catch (err) {
  console.error(
    "Failed to create announcement:",
    err
  );

  setError(
    err.response?.data?.message ||
      "Unable to create announcement."
  );
} finally {
  setSubmitting(false);
}


};

return ( <div className="space-y-6 p-4 sm:p-6 lg:p-8">
{/* Header */} <div>
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
          Create Announcement
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Share important information with your
          school community.
        </p>
      </div>
    </div>
  </div>

  {/* Form */}
  <div className="mx-auto max-w-4xl">
    <AnnouncementForm
      mode="create"
      onSubmit={handleSubmit}
      submitting={submitting}
      error={error}
    />
  </div>
</div>


);
}
