"use client";

import { useEffect, useState } from "react";
import {
Bell,
FileText,
Megaphone,
Save,
Users,
UserRound,
GraduationCap,
BriefcaseBusiness,
Loader2,
} from "lucide-react";

const audienceOptions = [
{
value: "all",
label: "Everyone",
description: "Parents, teachers, and students",
icon: Users,
},
{
value: "parents",
label: "Parents",
description: "Parents only",
icon: UserRound,
},
{
value: "teachers",
label: "Teachers",
description: "Teachers only",
icon: BriefcaseBusiness,
},
{
value: "students",
label: "Students",
description: "Students only",
icon: GraduationCap,
},
];

export default function AnnouncementForm({
initialData = null,
onSubmit,
submitting = false,
error = "",
mode = "create",
}) {
const isEditMode = mode === "edit";

const [formData, setFormData] = useState({
title: "",
message: "",
targetAudience: "all",
isActive: true,
});

const [validationError, setValidationError] =
useState("");

useEffect(() => {
if (!initialData) return;


setFormData({
  title: initialData.title || "",
  message: initialData.message || "",
  targetAudience:
    initialData.targetAudience || "all",
  isActive:
    initialData.isActive !== undefined
      ? initialData.isActive
      : true,
});


}, [initialData]);

const handleChange = (event) => {
const { name, value } = event.target;


setFormData((current) => ({
  ...current,
  [name]: value,
}));

if (validationError) {
  setValidationError("");
}


};

const handleSubmit = async (event) => {
event.preventDefault();


const title = formData.title.trim();
const message = formData.message.trim();

if (!title) {
  setValidationError(
    "Please enter an announcement title."
  );
  return;
}

if (title.length > 200) {
  setValidationError(
    "The title cannot exceed 200 characters."
  );
  return;
}

if (!message) {
  setValidationError(
    "Please enter an announcement message."
  );
  return;
}

if (message.length > 5000) {
  setValidationError(
    "The message cannot exceed 5,000 characters."
  );
  return;
}

if (
  ![
    "all",
    "parents",
    "teachers",
    "students",
  ].includes(formData.targetAudience)
) {
  setValidationError(
    "Please select a valid target audience."
  );
  return;
}

setValidationError("");

await onSubmit({
  title,
  message,
  targetAudience: formData.targetAudience,
  ...(isEditMode
    ? { isActive: formData.isActive }
    : {}),
});


};

const selectedAudience =
audienceOptions.find(
(option) =>
option.value === formData.targetAudience
) || audienceOptions[0];

return ( <form onSubmit={handleSubmit} className="space-y-6">
{(validationError || error) && ( <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
{validationError || error} </div>
)}


  {/* Basic information */}
  <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
    <div className="border-b border-gray-100 px-5 py-4 sm:px-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
          <FileText className="h-5 w-5" />
        </div>

        <div>
          <h2 className="font-semibold text-gray-900">
            Announcement Details
          </h2>
          <p className="text-sm text-gray-500">
            Provide the information you want to
            communicate.
          </p>
        </div>
      </div>
    </div>

    <div className="space-y-5 p-5 sm:p-6">
      {/* Title */}
      <div>
        <div className="mb-2 flex items-center justify-between gap-3">
          <label
            htmlFor="title"
            className="text-sm font-semibold text-gray-700"
          >
            Title
            <span className="ml-1 text-red-500">
              *
            </span>
          </label>

          <span className="text-xs text-gray-400">
            {formData.title.length}/200
          </span>
        </div>

        <input
          id="title"
          name="title"
          type="text"
          value={formData.title}
          onChange={handleChange}
          maxLength={200}
          placeholder="e.g. Parent-Teacher Meeting"
          disabled={submitting}
          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#166534] focus:ring-2 focus:ring-[#166534]/10 disabled:cursor-not-allowed disabled:bg-gray-50"
        />
      </div>

      {/* Message */}
      <div>
        <div className="mb-2 flex items-center justify-between gap-3">
          <label
            htmlFor="message"
            className="text-sm font-semibold text-gray-700"
          >
            Message
            <span className="ml-1 text-red-500">
              *
            </span>
          </label>

          <span className="text-xs text-gray-400">
            {formData.message.length}/5000
          </span>
        </div>

        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          maxLength={5000}
          rows={8}
          placeholder="Write your announcement here..."
          disabled={submitting}
          className="w-full resize-y rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm leading-6 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#166534] focus:ring-2 focus:ring-[#166534]/10 disabled:cursor-not-allowed disabled:bg-gray-50"
        />

        <p className="mt-2 text-xs text-gray-400">
          Keep your message clear and informative.
        </p>
      </div>
    </div>
  </div>

  {/* Audience */}
  <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
    <div className="border-b border-gray-100 px-5 py-4 sm:px-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
          <Users className="h-5 w-5" />
        </div>

        <div>
          <h2 className="font-semibold text-gray-900">
            Target Audience
          </h2>
          <p className="text-sm text-gray-500">
            Choose who should see this announcement.
          </p>
        </div>
      </div>
    </div>

    <div className="p-5 sm:p-6">
      <div className="grid gap-3 sm:grid-cols-2">
        {audienceOptions.map((option) => {
          const Icon = option.icon;
          const selected =
            formData.targetAudience ===
            option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() =>
                setFormData((current) => ({
                  ...current,
                  targetAudience: option.value,
                }))
              }
              disabled={submitting}
              className={`flex items-start gap-3 rounded-xl border p-4 text-left transition ${
                selected
                  ? "border-[#166534] bg-emerald-50 ring-1 ring-[#166534]"
                  : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
              } disabled:cursor-not-allowed disabled:opacity-60`}
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                  selected
                    ? "bg-[#166534] text-white"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                <Icon className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900">
                  {option.label}
                </p>
                <p className="mt-1 text-xs leading-5 text-gray-500">
                  {option.description}
                </p>
              </div>

              <div className="ml-auto pt-1">
                <span
                  className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                    selected
                      ? "border-[#166534]"
                      : "border-gray-300"
                  }`}
                >
                  {selected && (
                    <span className="h-2 w-2 rounded-full bg-[#166534]" />
                  )}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-4 rounded-xl bg-gray-50 px-4 py-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Bell className="h-4 w-4 text-gray-400" />
          <span>
            This announcement will be visible to{" "}
            <span className="font-semibold text-gray-800">
              {selectedAudience.label.toLowerCase()}
            </span>
            .
          </span>
        </div>
      </div>
    </div>
  </div>

  {/* Status — edit only */}
  {isEditMode && (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-5 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
            <Megaphone className="h-5 w-5" />
          </div>

          <div>
            <h2 className="font-semibold text-gray-900">
              Announcement Status
            </h2>
            <p className="text-sm text-gray-500">
              Control whether users can currently
              see this announcement.
            </p>
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-gray-200 p-4 transition hover:bg-gray-50">
          <div>
            <p className="text-sm font-semibold text-gray-900">
              Active announcement
            </p>
            <p className="mt-1 text-xs leading-5 text-gray-500">
              Inactive announcements will not appear
              to parents, teachers, or students.
            </p>
          </div>

          <input
            type="checkbox"
            checked={formData.isActive}
            onChange={(event) =>
              setFormData((current) => ({
                ...current,
                isActive: event.target.checked,
              }))
            }
            disabled={submitting}
            className="h-5 w-5 rounded border-gray-300 text-[#166534] focus:ring-[#166534]"
          />
        </label>
      </div>
    </div>
  )}

  {/* Submit */}
  <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
    <button
      type="submit"
      disabled={submitting}
      className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#166534] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#14532d] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {submitting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          {isEditMode
            ? "Saving Changes..."
            : "Creating Announcement..."}
        </>
      ) : (
        <>
          <Save className="h-4 w-4" />
          {isEditMode
            ? "Save Changes"
            : "Create Announcement"}
        </>
      )}
    </button>
  </div>
</form>


);
}
