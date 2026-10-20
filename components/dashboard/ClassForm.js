"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  GraduationCap,
  UserRound,
  Loader2,
} from "lucide-react";
import api from "@/lib/api";

export default function ClassForm({
  classId = null,
  isEditMode = false,
}) {
  const router = useRouter();

  const [sessions, setSessions] = useState([]);
  const [teachers, setTeachers] = useState([]);

  const [formData, setFormData] = useState({
    academicSession: "",
    name: "",
    arm: "",
    section: "",
    classTeacher: "",
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

        const requests = [
          api.get("/academic-sessions"),
          api.get("/teachers"),
        ];

        if (isEditMode && classId) {
          requests.push(api.get(`/classes/${classId}`));
        }

        const responses = await Promise.all(requests);

        const sessionsResponse = responses[0];
        const teachersResponse = responses[1];
        const classResponse = responses[2];

        const sessionData =
          sessionsResponse.data?.sessions ||
          sessionsResponse.data?.data ||
          sessionsResponse.data ||
          [];

        const teacherData =
          teachersResponse.data?.teachers ||
          teachersResponse.data?.data ||
          teachersResponse.data ||
          [];

        setSessions(Array.isArray(sessionData) ? sessionData : []);
        setTeachers(Array.isArray(teacherData) ? teacherData : []);

        if (isEditMode && classResponse) {
          const classData =
            classResponse.data?.schoolClass ||
            classResponse.data?.class ||
            classResponse.data?.data ||
            classResponse.data;

          setFormData({
            academicSession:
              typeof classData?.academicSession === "object"
                ? classData.academicSession?._id || ""
                : classData?.academicSession || "",
            name: classData?.name || "",
            arm: classData?.arm || "",
            section: classData?.section || "",
            classTeacher:
              typeof classData?.classTeacher === "object"
                ? classData.classTeacher?._id || ""
                : classData?.classTeacher || "",
          });
        } else {
          const activeSession =
            sessionData.find(
              (session) =>
                session.isCurrent === true ||
                session.isActive === true
            ) || sessionData[0];

          if (activeSession?._id) {
            setFormData((prev) => ({
              ...prev,
              academicSession: activeSession._id,
            }));
          }
        }
      } catch (err) {
        console.error("Failed to load class form data:", err);

        setError(
          err.response?.data?.message ||
            `Failed to load ${
              isEditMode ? "class information" : "form information"
            }.`
        );
      } finally {
        setLoading(false);
      }
    };

    loadFormData();
  }, [classId, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
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
      setError("Please enter a class name.");
      return;
    }

    if (!formData.section) {
      setError("Please select a section.");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        academicSession: formData.academicSession,
        name: formData.name.trim(),
        arm: formData.arm.trim(),
        section: formData.section,
      };

      if (formData.classTeacher) {
        payload.classTeacher = formData.classTeacher;
      } else if (isEditMode) {
        payload.classTeacher = null;
      }

      if (isEditMode) {
        await api.put(`/classes/${classId}`, payload);

        setSuccess("Class updated successfully.");

        setTimeout(() => {
          router.push(`/dashboard/school-admin/classes/${classId}`);
        }, 1000);
      } else {
        await api.post("/classes", payload);

        setSuccess("Class created successfully.");

        setTimeout(() => {
          router.push("/dashboard/school-admin/classes");
        }, 1000);
      }
    } catch (err) {
      console.error(
        `Failed to ${isEditMode ? "update" : "create"} class:`,
        err
      );

      setError(
        err.response?.data?.message ||
          `Failed to ${
            isEditMode ? "update" : "create"
          } class. Please try again.`
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div>
        <button
          type="button"
          onClick={() =>
            router.push(
              isEditMode
                ? `/dashboard/school-admin/classes/${classId}`
                : "/dashboard/school-admin/classes"
            )
          }
          className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-emerald-600"
        >
          <ArrowLeft className="h-4 w-4" />
          {isEditMode ? "Back to Class" : "Back to Classes"}
        </button>

        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
            <BookOpen className="h-5 w-5" />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {isEditMode ? "Edit Class" : "Create Class"}
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              {isEditMode
                ? "Update this class's information."
                : "Add a new class to your school."}
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
        {/* Class Information */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
              <GraduationCap className="h-5 w-5" />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900">
                Class Information
              </h2>

              <p className="text-sm text-slate-500">
                Enter the basic details for this class.
              </p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {/* Academic Session */}
            <div>
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

                {sessions.map((session) => (
                  <option key={session._id} value={session._id}>
                    {session.name ||
                      session.sessionName ||
                      session.title ||
                      "Academic Session"}
                  </option>
                ))}
              </select>
            </div>

            {/* Class Name */}
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Class Name{" "}
                <span className="text-red-500">*</span>
              </label>

              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. JSS 1"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            {/* Arm */}
            <div>
              <label
                htmlFor="arm"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Arm
              </label>

              <input
                id="arm"
                name="arm"
                type="text"
                value={formData.arm}
                onChange={handleChange}
                placeholder="e.g. A"
                maxLength={10}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm uppercase text-slate-900 outline-none transition placeholder:normal-case placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />

              <p className="mt-2 text-xs text-slate-500">
                Leave blank if the class has no arm.
              </p>
            </div>

            {/* Section */}
            <div>
              <label
                htmlFor="section"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Section <span className="text-red-500">*</span>
              </label>

              <select
                id="section"
                name="section"
                value={formData.section}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              >
                <option value="">Select section</option>
                <option value="Nursery">Nursery</option>
                <option value="Primary">Primary</option>
                <option value="Junior Secondary">
                  Junior Secondary
                </option>
                <option value="Senior Secondary">
                  Senior Secondary
                </option>
              </select>
            </div>
          </div>
        </section>

        {/* Class Teacher */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
              <UserRound className="h-5 w-5" />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900">
                Class Teacher
              </h2>

              <p className="text-sm text-slate-500">
                Assign a teacher to this class.
              </p>
            </div>
          </div>

          <div>
            <label
              htmlFor="classTeacher"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Class Teacher
            </label>

            <select
              id="classTeacher"
              name="classTeacher"
              value={formData.classTeacher}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            >
              <option value="">No class teacher</option>

              {teachers
                .filter((teacher) => teacher.isActive !== false)
                .map((teacher) => (
                  <option key={teacher._id} value={teacher._id}>
                    {teacher.firstName} {teacher.lastName}
                  </option>
                ))}
            </select>

            <p className="mt-2 text-xs text-slate-500">
              Only active teachers are available for selection.
            </p>
          </div>
        </section>

        {/* Actions */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() =>
              router.push(
                isEditMode
                  ? `/dashboard/school-admin/classes/${classId}`
                  : "/dashboard/school-admin/classes"
              )
            }
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
              "Create Class"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

