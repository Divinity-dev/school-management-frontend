"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  GraduationCap,
  Users,
  UserRound,
  Save,
  Loader2,
  AlertCircle,
} from "lucide-react";

import api from "@/lib/api";

export default function SubjectAssignmentForm({ assignmentId = null }) {
  const router = useRouter();

  const isEditMode = Boolean(assignmentId);

  const [formData, setFormData] = useState({
    academicSession: "",
    schoolClass: "",
    subject: "",
    teacher: "",
    isActive: true,
  });

  const [sessions, setSessions] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [loadingClasses, setLoadingClasses] = useState(false);

  const [error, setError] = useState("");

  /*
   * Load initial data
   */
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoadingData(true);
        setError("");

        const [sessionsRes, subjectsRes, teachersRes] = await Promise.all([
          api.get("/academic-sessions"),
          api.get("/subjects"),
          api.get("/teachers"),
        ]);

        setSessions(sessionsRes.data?.sessions || []);
        setSubjects(subjectsRes.data?.subjects || []);
        setTeachers(teachersRes.data?.teachers || []);

        if (isEditMode) {
          const assignmentRes = await api.get(
            `/subject-assignments/${assignmentId}`
          );

          const assignment = assignmentRes.data?.assignment;

          if (!assignment) {
            throw new Error("Subject assignment not found.");
          }

          const sessionId =
            assignment.academicSession?._id ||
            assignment.academicSession ||
            "";

          const classId =
            assignment.schoolClass?._id ||
            assignment.schoolClass ||
            "";

          const subjectId =
            assignment.subject?._id || assignment.subject || "";

          const teacherId =
            assignment.teacher?._id || assignment.teacher || "";

          setFormData({
            academicSession: sessionId,
            schoolClass: classId,
            subject: subjectId,
            teacher: teacherId,
            isActive: assignment.isActive ?? true,
          });

          /*
           * Load classes for the assignment's session
           */
          if (sessionId) {
            setLoadingClasses(true);

            const classesRes = await api.get(
              `/classes/session/${sessionId}`
            );

            setClasses(classesRes.data?.classes || []);
          }
        }
      } catch (err) {
        console.error("Failed to load subject assignment data:", err);

        setError(
          err.response?.data?.message ||
            err.message ||
            "Unable to load subject assignment data."
        );
      } finally {
        setLoadingClasses(false);
        setLoadingData(false);
      }
    };

    loadInitialData();
  }, [assignmentId, isEditMode]);

  /*
   * Handle academic session change
   */
  const handleSessionChange = async (e) => {
    const sessionId = e.target.value;

    setFormData((prev) => ({
      ...prev,
      academicSession: sessionId,
      schoolClass: "",
    }));

    setClasses([]);

    if (!sessionId) {
      return;
    }

    try {
      setLoadingClasses(true);
      setError("");

      const response = await api.get(`/classes/session/${sessionId}`);

      setClasses(response.data?.classes || []);
    } catch (err) {
      console.error("Failed to load classes:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load classes for the selected session."
      );
    } finally {
      setLoadingClasses(false);
    }
  };

  /*
   * Handle normal input changes
   */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  /*
   * Submit form
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!formData.academicSession) {
      setError("Please select an academic session.");
      return;
    }

    if (!formData.schoolClass) {
      setError("Please select a class.");
      return;
    }

    if (!formData.subject) {
      setError("Please select a subject.");
      return;
    }

    if (!formData.teacher) {
      setError("Please select a teacher.");
      return;
    }

    try {
      setLoading(true);

      if (isEditMode) {
        await api.put(`/subject-assignments/${assignmentId}`, {
          subject: formData.subject,
          teacher: formData.teacher,
          isActive: formData.isActive,
        });
      } else {
        await api.post("/subject-assignments", {
          academicSession: formData.academicSession,
          schoolClass: formData.schoolClass,
          subject: formData.subject,
          teacher: formData.teacher,
        });
      }

      router.push("/dashboard/school-admin/subject-assignments");
    } catch (err) {
      console.error("Failed to save subject assignment:", err);

      setError(
        err.response?.data?.message ||
          "Unable to save subject assignment. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="min-h-full px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[500px] w-full max-w-2xl items-center justify-center">
          <div className="flex items-center gap-3 text-gray-500">
            <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
            <span>Loading assignment...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-2xl">
        {/* Back */}
        <div className="mb-6 flex justify-center">
          <Link
            href="/dashboard/school-admin/subject-assignments"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-emerald-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Subject Assignments
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50">
            <BookOpen className="h-7 w-7 text-emerald-600" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900">
            {isEditMode
              ? "Edit Subject Assignment"
              : "Create Subject Assignment"}
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            {isEditMode
              ? "Update the subject or teacher for this assignment."
              : "Assign a subject to a class and teacher."}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
        >
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Assignment Information
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Connect a subject, class, and teacher for an academic session.
            </p>
          </div>

          <div className="space-y-6">
            {/* Academic Session */}
            <div>
              <label
                htmlFor="academicSession"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Academic Session
              </label>

              <div className="relative">
                <GraduationCap className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

                <select
                  id="academicSession"
                  name="academicSession"
                  value={formData.academicSession}
                  onChange={handleSessionChange}
                  disabled={isEditMode}
                  className="w-full appearance-none rounded-xl border border-gray-300 bg-white py-3 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-gray-100"
                >
                  <option value="">Select academic session</option>

                  {sessions.map((session) => (
                    <option key={session._id} value={session._id}>
                      {session.name}
                    </option>
                  ))}
                </select>
              </div>

              {isEditMode && (
                <p className="mt-2 text-xs text-gray-500">
                  Academic session cannot be changed after an assignment is
                  created.
                </p>
              )}
            </div>

            {/* Class */}
            <div>
              <label
                htmlFor="schoolClass"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Class
              </label>

              <div className="relative">
                <Users className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

                <select
                  id="schoolClass"
                  name="schoolClass"
                  value={formData.schoolClass}
                  onChange={handleChange}
                  disabled={
                    isEditMode ||
                    !formData.academicSession ||
                    loadingClasses
                  }
                  className="w-full appearance-none rounded-xl border border-gray-300 bg-white py-3 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-gray-100"
                >
                  <option value="">
                    {loadingClasses ? "Loading classes..." : "Select class"}
                  </option>

                  {classes.map((schoolClass) => (
                    <option key={schoolClass._id} value={schoolClass._id}>
                      {schoolClass.name}
                      {schoolClass.arm ? ` ${schoolClass.arm}` : ""}
                      {schoolClass.section ? ` - ${schoolClass.section}` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {isEditMode && (
                <p className="mt-2 text-xs text-gray-500">
                  Class cannot be changed after an assignment is created.
                </p>
              )}
            </div>

            {/* Subject */}
            <div>
              <label
                htmlFor="subject"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Subject
              </label>

              <div className="relative">
                <BookOpen className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full appearance-none rounded-xl border border-gray-300 bg-white py-3 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                >
                  <option value="">Select subject</option>

                  {subjects.map((subject) => (
                    <option key={subject._id} value={subject._id}>
                      {subject.name}
                      {subject.code ? ` (${subject.code})` : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Teacher */}
            <div>
              <label
                htmlFor="teacher"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Teacher
              </label>

              <div className="relative">
                <UserRound className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

                <select
                  id="teacher"
                  name="teacher"
                  value={formData.teacher}
                  onChange={handleChange}
                  className="w-full appearance-none rounded-xl border border-gray-300 bg-white py-3 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                >
                  <option value="">Select teacher</option>

                  {teachers
                    .filter((teacher) => teacher.isActive !== false)
                    .map((teacher) => (
                      <option key={teacher._id} value={teacher._id}>
                        {teacher.firstName} {teacher.lastName}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            {/* Status - Edit only */}
            {isEditMode && (
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <label className="flex cursor-pointer items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Assignment Status
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      Deactivate this assignment if it should no longer be
                      used.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        isActive: !prev.isActive,
                      }))
                    }
                    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition ${
                      formData.isActive
                        ? "bg-emerald-600"
                        : "bg-gray-300"
                    }`}
                    aria-label="Toggle assignment status"
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition ${
                        formData.isActive
                          ? "translate-x-6"
                          : "translate-x-1"
                      }`}
                    />
                  </button>
                </label>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:justify-end">
            <Link
              href="/dashboard/school-admin/subject-assignments"
              className="inline-flex items-center justify-center rounded-xl border border-gray-300 px-5 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {isEditMode ? "Save Changes" : "Create Assignment"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}