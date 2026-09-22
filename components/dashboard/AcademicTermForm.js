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

export default function AcademicTermForm({
termId = null,
isEditMode = false,
}) {
const router = useRouter();

const [sessions, setSessions] = useState([]);

const [formData, setFormData] = useState({
academicSession: "",
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
const loadFormData = async () => {
try {
setLoading(true);
setError("");


    const requests = [api.get("/academic-sessions")];

    if (isEditMode && termId) {
      requests.push(api.get(`/academic-terms/${termId}`));
    }

    const responses = await Promise.all(requests);

    const sessionsResponse = responses[0];
    const termResponse = responses[1];

    const sessionData =
      sessionsResponse.data?.sessions ||
      sessionsResponse.data?.data ||
      sessionsResponse.data ||
      [];

    setSessions(
      Array.isArray(sessionData) ? sessionData : []
    );

    if (isEditMode && termResponse) {
      const termData =
        termResponse.data?.term ||
        termResponse.data?.academicTerm ||
        termResponse.data?.data ||
        termResponse.data;

      setFormData({
        academicSession:
          typeof termData?.academicSession === "object"
            ? termData.academicSession?._id || ""
            : termData?.academicSession || "",
        name: termData?.name || "",
        startDate: termData?.startDate
          ? new Date(termData.startDate)
              .toISOString()
              .split("T")[0]
          : "",
        endDate: termData?.endDate
          ? new Date(termData.endDate)
              .toISOString()
              .split("T")[0]
          : "",
        isCurrent: termData?.isCurrent === true,
      });
    } else {
      const currentSession =
        sessionData.find(
          (session) =>
            session.isCurrent === true ||
            session.isActive === true
        ) || sessionData[0];

      if (currentSession?._id) {
        setFormData((prev) => ({
          ...prev,
          academicSession: currentSession._id,
        }));
      }
    }
  } catch (err) {
    console.error(
      "Failed to load academic term form data:",
      err
    );

    setError(
      err.response?.data?.message ||
        `Failed to load ${
          isEditMode
            ? "term information"
            : "form information"
        }.`
    );
  } finally {
    setLoading(false);
  }
};

loadFormData();


}, [termId, isEditMode]);

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

if (!formData.academicSession) {
  setError("Please select an academic session.");
  return;
}

if (!formData.name.trim()) {
  setError("Please enter a term name.");
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
  new Date(formData.startDate) >=
  new Date(formData.endDate)
) {
  setError("End date must be after start date.");
  return;
}

const selectedSession = sessions.find(
  (session) => session._id === formData.academicSession
);

if (selectedSession) {
  if (
    new Date(formData.startDate) <
      new Date(selectedSession.startDate) ||
    new Date(formData.endDate) >
      new Date(selectedSession.endDate)
  ) {
    setError(
      "Term dates must fall within the academic session dates."
    );
    return;
  }
}

try {
  setSubmitting(true);

  const payload = {
    academicSession: formData.academicSession,
    name: formData.name.trim(),
    startDate: formData.startDate,
    endDate: formData.endDate,
    isCurrent: formData.isCurrent,
  };

  if (isEditMode) {
    await api.put(
      `/academic-terms/${termId}`,
      payload
    );

    setSuccess("Academic term updated successfully.");

    setTimeout(() => {
      router.push(
        `/dashboard/school-admin/academic-terms/${termId}`
      );
    }, 1000);
  } else {
    await api.post("/academic-terms", payload);

    setSuccess("Academic term created successfully.");

    setTimeout(() => {
      router.push(
        "/dashboard/school-admin/academic-terms"
      );
    }, 1000);
  }
} catch (err) {
  console.error(
    `Failed to ${
      isEditMode ? "update" : "create"
    } academic term:`,
    err
  );

  setError(
    err.response?.data?.message ||
      `Failed to ${
        isEditMode ? "update" : "create"
      } academic term. Please try again.`
  );
} finally {
  setSubmitting(false);
}


};

const handleBack = () => {
router.push(
isEditMode
? `/dashboard/school-admin/academic-terms/${termId}`
: "/dashboard/school-admin/academic-terms"
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
? "Back to Academic Term"
: "Back to Academic Terms"} </button>


    <div className="flex items-center gap-4">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
        <CalendarDays className="h-5 w-5" />
      </div>

      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          {isEditMode
            ? "Edit Academic Term"
            : "Create Academic Term"}
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          {isEditMode
            ? "Update this academic term's information."
            : "Add a new academic term to your school."}
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
    {/* Term Information */}
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
          <GraduationCap className="h-5 w-5" />
        </div>

        <div>
          <h2 className="font-semibold text-slate-900">
            Term Information
          </h2>

          <p className="text-sm text-slate-500">
            Enter the basic details for this academic term.
          </p>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {/* Academic Session */}
        <div className="sm:col-span-2">
          <label
            htmlFor="academicSession"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Academic Session{" "}
            <span className="text-red-500">*</span>
          </label>

          <select
            id="academicSession"
            name="academicSession"
            value={formData.academicSession}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          >
            <option value="">
              Select academic session
            </option>

            {sessions
              .filter(
                (session) =>
                  session.isActive !== false
              )
              .map((session) => (
                <option
                  key={session._id}
                  value={session._id}
                >
                  {session.name ||
                    session.sessionName ||
                    session.title ||
                    "Academic Session"}
                </option>
              ))}
          </select>
        </div>

        {/* Term Name */}
        <div className="sm:col-span-2">
          <label
            htmlFor="name"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Term Name{" "}
            <span className="text-red-500">*</span>
          </label>

          <select
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          >
            <option value="">Select term</option>
            <option value="First Term">First Term</option>
            <option value="Second Term">Second Term</option>
            <option value="Third Term">Third Term</option>
          </select>
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
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
        </div>
      </div>
    </section>

    {/* Current Term */}
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
          <CalendarDays className="h-5 w-5" />
        </div>

        <div>
          <h2 className="font-semibold text-slate-900">
            Current Term
          </h2>

          <p className="text-sm text-slate-500">
            Choose whether this should be the school's current
            academic term.
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
            Set as current academic term
          </span>

          <p className="mt-1 text-xs text-slate-500">
            Only one academic term can be current at a time.
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
          "Create Term"
        )}
      </button>
    </div>
  </form>
</div>


);
}
