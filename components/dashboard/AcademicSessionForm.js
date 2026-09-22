"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
ArrowLeft,
CalendarDays,
GraduationCap,
Loader2,
} from "lucide-react";
import api from "@/lib/api";

export default function AcademicSessionForm({
sessionId = null,
isEditMode = false,
}) {
const router = useRouter();

const [formData, setFormData] = useState({
name: "",
startDate: "",
endDate: "",
isCurrent: false,
});

const [loading, setLoading] = useState(isEditMode);
const [submitting, setSubmitting] = useState(false);
const [error, setError] = useState("");
const [success, setSuccess] = useState("");

useEffect(() => {
const loadSession = async () => {
if (!isEditMode || !sessionId) {
setLoading(false);
return;
}


  try {
    setLoading(true);
    setError("");

    const response = await api.get(
      `/academic-sessions/${sessionId}`
    );

    const sessionData =
      response.data?.academicSession ||
      response.data?.session ||
      response.data?.data ||
      response.data;

    setFormData({
      name: sessionData?.name || "",
      startDate: sessionData?.startDate
        ? new Date(sessionData.startDate)
            .toISOString()
            .split("T")[0]
        : "",
      endDate: sessionData?.endDate
        ? new Date(sessionData.endDate)
            .toISOString()
            .split("T")[0]
        : "",
      isCurrent: sessionData?.isCurrent === true,
    });
  } catch (err) {
    console.error(
      "Failed to load academic session:",
      err
    );

    setError(
      err.response?.data?.message ||
        "Failed to load academic session information."
    );
  } finally {
    setLoading(false);
  }
};

loadSession();


}, [sessionId, isEditMode]);

const handleChange = (e) => {
const { name, value, type, checked } = e.target;


setFormData((prev) => ({
  ...prev,
  [name]: type === "checkbox" ? checked : value,
}));

if (error) setError("");
if (success) setSuccess("");


};

const handleSubmit = async (e) => {
e.preventDefault();


setError("");
setSuccess("");

if (!formData.name.trim()) {
  setError("Please enter an academic session name.");
  return;
}

if (!formData.startDate) {
  setError("Please select a start date.");
  return;
}

if (!formData.endDate) {
  setError("Please select an end date.");
  return;
}

if (
  new Date(formData.endDate) <=
  new Date(formData.startDate)
) {
  setError("End date must be after the start date.");
  return;
}

try {
  setSubmitting(true);

  const payload = {
    name: formData.name.trim(),
    startDate: formData.startDate,
    endDate: formData.endDate,
    isCurrent: formData.isCurrent,
  };

  if (isEditMode) {
    await api.put(
      `/academic-sessions/${sessionId}`,
      payload
    );

    setSuccess(
      "Academic session updated successfully."
    );

    setTimeout(() => {
      router.push(
        `/dashboard/school-admin/academic-sessions/${sessionId}`
      );
    }, 1000);
  } else {
    await api.post("/academic-sessions", payload);

    setSuccess(
      "Academic session created successfully."
    );

    setTimeout(() => {
      router.push(
        "/dashboard/school-admin/academic-sessions"
      );
    }, 1000);
  }
} catch (err) {
  console.error(
    `Failed to ${
      isEditMode ? "update" : "create"
    } academic session:`,
    err
  );

  setError(
    err.response?.data?.message ||
      `Failed to ${
        isEditMode ? "update" : "create"
      } academic session. Please try again.`
  );
} finally {
  setSubmitting(false);
}


};

const handleBack = () => {
router.push(
isEditMode
? `/dashboard/school-admin/academic-sessions/${sessionId}`
: "/dashboard/school-admin/academic-sessions"
);
};

if (loading) {
return ( <div className="flex min-h-[60vh] items-center justify-center"> <Loader2 className="h-7 w-7 animate-spin text-emerald-600" /> </div>
);
}

return ( <div className="space-y-6 p-4 sm:p-6 lg:p-8">
{/* Header */} <div> <button
       type="button"
       onClick={handleBack}
       className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-emerald-600"
     > <ArrowLeft className="h-4 w-4" />
{isEditMode
? "Back to Academic Session"
: "Back to Academic Sessions"} </button>


    <div className="flex items-center gap-4">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
        <CalendarDays className="h-5 w-5" />
      </div>

      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          {isEditMode
            ? "Edit Academic Session"
            : "Create Academic Session"}
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          {isEditMode
            ? "Update this academic session's information."
            : "Add a new academic session to your school."}
        </p>
      </div>
    </div>
  </div>

  {/* Error */}
  {error && (
    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      {error}
    </div>
  )}

  {/* Success */}
  {success && (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
      {success}
    </div>
  )}

  <form onSubmit={handleSubmit} className="space-y-6">
    {/* Session Information */}
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
          <GraduationCap className="h-5 w-5" />
        </div>

        <div>
          <h2 className="font-semibold text-slate-900">
            Session Information
          </h2>

          <p className="text-sm text-slate-500">
            Enter the basic details for this academic session.
          </p>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {/* Session Name */}
        <div className="sm:col-span-2">
          <label
            htmlFor="name"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Academic Session Name{" "}
            <span className="text-red-500">*</span>
          </label>

          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. 2028/2029"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />

          <p className="mt-2 text-xs text-slate-500">
            Enter the academic session in a format such as
            2028/2029.
          </p>
        </div>

        {/* Start Date */}
        <div>
          <label
            htmlFor="startDate"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Start Date{" "}
            <span className="text-red-500">*</span>
          </label>

          <input
            id="startDate"
            name="startDate"
            type="date"
            value={formData.startDate}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
        </div>

        {/* End Date */}
        <div>
          <label
            htmlFor="endDate"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            End Date{" "}
            <span className="text-red-500">*</span>
          </label>

          <input
            id="endDate"
            name="endDate"
            type="date"
            value={formData.endDate}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
        </div>
      </div>
    </section>

    {/* Current Session */}
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
          <CalendarDays className="h-5 w-5" />
        </div>

        <div>
          <h2 className="font-semibold text-slate-900">
            Current Session
          </h2>

          <p className="text-sm text-slate-500">
            Choose whether this should be the school's current
            academic session.
          </p>
        </div>
      </div>

      <label
        htmlFor="isCurrent"
        className="flex cursor-pointer items-start gap-3"
      >
        <input
          id="isCurrent"
          name="isCurrent"
          type="checkbox"
          checked={formData.isCurrent}
          onChange={handleChange}
          className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
        />

        <div>
          <span className="text-sm font-medium text-slate-700">
            Set as current academic session
          </span>

          <p className="mt-1 text-xs text-slate-500">
            Selecting this will make this session the current
            session for your school.
          </p>
        </div>
      </label>
    </section>

    {/* Actions */}
    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
      <button
        type="button"
        onClick={handleBack}
        disabled={submitting}
        className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        Cancel
      </button>

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {isEditMode ? "Saving..." : "Creating..."}
          </>
        ) : isEditMode ? (
          "Save Changes"
        ) : (
          "Create Session"
        )}
      </button>
    </div>
  </form>
</div>


);
}
