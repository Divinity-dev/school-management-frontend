"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  FileText,
  GraduationCap,
  Loader2,
  Save,
} from "lucide-react";

import { useSelector } from "react-redux";

import api from "@/lib/api";

export default function TeacherCreateAssignment() {
  const router = useRouter();

  const { user } = useSelector((state) => state.auth);

  const [subjectAssignments, setSubjectAssignments] = useState([]);
  const [terms, setTerms] = useState([]);

  const [form, setForm] = useState({
    subjectAssignment: "",
    term: "",
    title: "",
    description: "",
    instructions: "",
    dueDate: "",
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const [subjectAssignmentsResponse, termsResponse] =
          await Promise.all([
            api.get("/subject-assignments"),
            api.get("/academic-terms"),
          ]);

        const assignments =
          subjectAssignmentsResponse.data?.subjectAssignments ||
          subjectAssignmentsResponse.data?.assignments ||
          subjectAssignmentsResponse.data ||
          [];

        const fetchedTerms =
          termsResponse.data?.terms ||
          termsResponse.data ||
          [];

        const teacherId = user?._id || user?.id;

        const teacherAssignments = assignments.filter(
          (assignment) => {
            const teacher = assignment.teacher;

            const assignmentTeacherId =
              teacher?._id || teacher?.id || teacher;

            return (
              assignmentTeacherId?.toString() ===
                teacherId?.toString() &&
              assignment.isActive !== false
            );
          }
        );

        setSubjectAssignments(teacherAssignments);
        setTerms(fetchedTerms);
      } catch (err) {
        console.error("Failed to load assignment data:", err);

        setError(
          err.response?.data?.message ||
            "Failed to load assignment information."
        );
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  const selectedSubjectAssignment = useMemo(() => {
    return subjectAssignments.find(
      (assignment) =>
        (assignment._id || assignment.id)?.toString() ===
        form.subjectAssignment?.toString()
    );
  }, [subjectAssignments, form.subjectAssignment]);

  const selectedSession =
    selectedSubjectAssignment?.academicSession;

  const selectedClass =
    selectedSubjectAssignment?.schoolClass;

  const selectedSubject =
    selectedSubjectAssignment?.subject;

  const availableTerms = useMemo(() => {
    if (!selectedSession) return terms;

    const sessionId =
      selectedSession?._id || selectedSession?.id;

    return terms.filter((term) => {
      const termSession =
        term.academicSession?._id ||
        term.academicSession?.id ||
        term.academicSession;

      return (
        termSession?.toString() === sessionId?.toString()
      );
    });
  }, [terms, selectedSession]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");

    if (name === "subjectAssignment") {
      setForm((previous) => ({
        ...previous,
        subjectAssignment: value,
        term: "",
      }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!form.subjectAssignment) {
      setError("Please select a subject assignment.");
      return;
    }

    if (!form.term) {
      setError("Please select an academic term.");
      return;
    }

    if (!form.title.trim()) {
      setError("Please enter an assignment title.");
      return;
    }

    if (!form.dueDate) {
      setError("Please select a due date.");
      return;
    }

    try {
      setSubmitting(true);

      /*
       * IMPORTANT:
       *
       * The backend createAssignment controller expects:
       *
       * subjectAssignmentId
       * term
       * title
       * description
       * instructions
       * dueDate
       *
       * The backend derives:
       * - school
       * - academicSession
       * - schoolClass
       * - subject
       * - teacher
       *
       * from the SubjectAssignment.
       */
      const payload = {
        subjectAssignmentId: form.subjectAssignment,
        term: form.term,
        title: form.title.trim(),
        description: form.description.trim(),
        instructions: form.instructions.trim(),
        dueDate: form.dueDate,
      };

      const response = await api.post(
        "/assignments",
        payload
      );

      setSuccess(
        response.data?.message ||
          "Assignment created successfully."
      );

      setTimeout(() => {
        router.push("/dashboard/teacher/assignments");
      }, 700);
    } catch (err) {
      console.error("Failed to create assignment:", err);

      setError(
        err.response?.data?.message ||
          "Failed to create assignment."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="animate-pulse space-y-5">
            <div className="h-8 w-72 rounded-lg bg-slate-200" />
            <div className="h-24 rounded-2xl bg-white" />
            <div className="h-[500px] rounded-2xl bg-white" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <section className="flex items-start gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 transition hover:bg-slate-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div>
            <p className="text-sm font-medium text-emerald-600">
              Teacher Portal
            </p>

            <h1 className="mt-1 text-2xl font-bold text-slate-900">
              Create Assignment
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Create an assignment for one of your assigned
              subjects.
            </p>
          </div>
        </section>

        {/* Messages */}
        {error && (
          <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-700">
            {success}
          </div>
        )}

        {/* Assignment Context */}
        {selectedSubjectAssignment && (
          <section className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-white p-3 shadow-sm">
                <GraduationCap className="h-5 w-5 text-emerald-600" />
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-emerald-600">
                  Subject Assignment
                </p>

                <h2 className="mt-1 font-semibold text-slate-900">
                  {selectedSubject?.name || "Subject"}
                </h2>

                <p className="mt-1 text-sm text-slate-600">
                  {selectedClass?.name || "Class"}
                  {selectedClass?.arm
                    ? ` ${selectedClass.arm}`
                    : ""}
                  {selectedClass?.section
                    ? ` • ${selectedClass.section}`
                    : ""}
                </p>

                {selectedSession?.name && (
                  <p className="mt-1 text-xs text-slate-500">
                    Academic Session:{" "}
                    {selectedSession.name}
                  </p>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl bg-white p-6 shadow-sm sm:p-8"
        >
          <div className="space-y-6">
            {/* Subject Assignment */}
            <div>
              <label
                htmlFor="subjectAssignment"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Subject & Class
              </label>

              <select
                id="subjectAssignment"
                name="subjectAssignment"
                value={form.subjectAssignment}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              >
                <option value="">
                  Select subject and class
                </option>

                {subjectAssignments.map((assignment) => {
                  const assignmentId =
                    assignment._id || assignment.id;

                  const subject = assignment.subject;
                  const schoolClass =
                    assignment.schoolClass;

                  return (
                    <option
                      key={assignmentId}
                      value={assignmentId}
                    >
                      {subject?.name || "Subject"} —{" "}
                      {schoolClass?.name || "Class"}
                      {schoolClass?.arm
                        ? ` ${schoolClass.arm}`
                        : ""}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Term */}
            <div>
              <label
                htmlFor="term"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Academic Term
              </label>

              <select
                id="term"
                name="term"
                value={form.term}
                onChange={handleChange}
                disabled={!form.subjectAssignment}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-50"
              >
                <option value="">
                  {form.subjectAssignment
                    ? "Select term"
                    : "Select subject and class first"}
                </option>

                {availableTerms.map((term) => {
                  const termId = term._id || term.id;

                  return (
                    <option key={termId} value={termId}>
                      {term.name}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Title */}
            <div>
              <label
                htmlFor="title"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Assignment Title
              </label>

              <input
                id="title"
                name="title"
                type="text"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Algebraic Expressions"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Description
              </label>

              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                placeholder="Give students a brief description of the assignment..."
                className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            {/* Instructions */}
            <div>
              <label
                htmlFor="instructions"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Instructions
              </label>

              <textarea
                id="instructions"
                name="instructions"
                value={form.instructions}
                onChange={handleChange}
                rows={5}
                placeholder="Tell students exactly what they need to do..."
                className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            {/* Due Date */}
            <div>
              <label
                htmlFor="dueDate"
                className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700"
              >
                <CalendarDays className="h-4 w-4 text-slate-400" />
                Due Date
              </label>

              <input
                id="dueDate"
                name="dueDate"
                type="datetime-local"
                value={form.dueDate}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            {/* Notice */}
            <div className="rounded-xl bg-slate-50 p-4">
              <div className="flex gap-3">
                <FileText className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" />

                <div>
                  <p className="text-sm font-medium text-slate-700">
                    Assignment status
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    New assignments are created as drafts. You
                    can publish the assignment after reviewing
                    it. Students will only see published
                    assignments.
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => router.back()}
                disabled={submitting}
                className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
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
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Create Assignment
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}