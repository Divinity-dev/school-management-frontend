"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Clock3,
  FileText,
  LoaderCircle,
  LockKeyhole,
  RefreshCw,
  Save,
  Send,
  Users,
} from "lucide-react";
import api from "@/lib/api";

const emptyOverride = () => ({
  enabled: false,
  present: 0,
  absent: 0,
  late: 0,
  excused: 0,
});

function getId(value) {
  if (!value) return "";
  return typeof value === "object" ? value._id || value.id || "" : value;
}

function getSessionId(schoolClass) {
  return getId(schoolClass?.academicSession);
}

function getClassLabel(schoolClass) {
  return [schoolClass?.name, schoolClass?.arm].filter(Boolean).join(" ");
}

function getErrorMessage(error) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    "Something went wrong. Please try again."
  );
}

function extractList(data, keys) {
  for (const key of keys) {
    if (Array.isArray(data?.[key])) return data[key];
  }

  return Array.isArray(data) ? data : [];
}

function formatPercentage(value) {
  return `${Number(value || 0).toFixed(1)}%`;
}

function getEffectiveAttendance(entry) {
  const override = {
    ...emptyOverride(),
    ...(entry.attendanceOverride || {}),
  };

  if (!override.enabled) {
    return {
      ...(entry.onlineAttendance || emptyOverride()),
      source: "Website attendance",
    };
  }

  const total =
    Number(override.present) +
    Number(override.absent) +
    Number(override.late) +
    Number(override.excused);

  return {
    ...override,
    total,
    attendancePercentage:
      total > 0
        ? Number(((Number(override.present) / total) * 100).toFixed(1))
        : 0,
    source: "Manual override",
  };
}

function AttendanceStat({ label, value }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-slate-900">
        {value ?? 0}
      </p>
    </div>
  );
}

export default function ClassTeacherRemarksPage() {
  const [sessions, setSessions] = useState([]);
  const [terms, setTerms] = useState([]);
  const [classes, setClasses] = useState([]);

  const [selectedSession, setSelectedSession] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("");

  const [roster, setRoster] = useState([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [canEdit, setCanEdit] = useState(true);

  const [initialLoading, setInitialLoading] = useState(true);
  const [termsLoading, setTermsLoading] = useState(false);
  const [rosterLoading, setRosterLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const [notice, setNotice] = useState({
    type: "",
    message: "",
  });

  const showNotice = useCallback((type, message) => {
    setNotice({ type, message });
  }, []);

  // Load sessions and the teacher's assigned classes.
  useEffect(() => {
    let cancelled = false;

    async function loadInitialData() {
      setInitialLoading(true);

      try {
        const [sessionsResponse, classesResponse] = await Promise.all([
          api.get("/academic-sessions"),
          api.get("/classes"),
        ]);

        if (cancelled) return;

        const loadedSessions = extractList(sessionsResponse.data, [
          "academicSessions",
          "sessions",
        ]);

        const loadedClasses = extractList(classesResponse.data, ["classes"]);

        setSessions(loadedSessions);
        setClasses(
          loadedClasses.filter((schoolClass) => schoolClass?.isActive !== false)
        );

        const currentSession =
          loadedSessions.find(
            (session) =>
              session.isCurrent ||
              session.current ||
              session.isCurrentSession
          ) || loadedSessions[0];

        if (currentSession) {
          setSelectedSession(getId(currentSession));
        } else {
          showNotice("error", "No academic sessions were found.");
        }
      } catch (error) {
        if (!cancelled) showNotice("error", getErrorMessage(error));
      } finally {
        if (!cancelled) setInitialLoading(false);
      }
    }

    loadInitialData();

    return () => {
      cancelled = true;
    };
  }, [showNotice]);

  // Load terms for the selected session.
  useEffect(() => {
    if (!selectedSession) {
      setTerms([]);
      setSelectedTerm("");
      return;
    }

    let cancelled = false;

    async function loadTerms() {
      setTermsLoading(true);
      setTerms([]);
      setSelectedTerm("");
      setSelectedClass("");
      setRoster([]);
      setIsSubmitted(false);
      setIsLocked(false);
      setCanEdit(true);

      try {
        const response = await api.get(
          `/academic-terms/session/${selectedSession}`
        );

        if (cancelled) return;

        const loadedTerms = extractList(response.data, [
          "academicTerms",
          "terms",
        ]);

        setTerms(loadedTerms);

        const currentTerm =
          loadedTerms.find(
            (term) => term.isCurrent || term.current || term.isCurrentTerm
          ) || loadedTerms[0];

        if (currentTerm) {
          setSelectedTerm(getId(currentTerm));
        } else {
          showNotice("error", "No academic terms were found for this session.");
        }
      } catch (error) {
        if (!cancelled) showNotice("error", getErrorMessage(error));
      } finally {
        if (!cancelled) setTermsLoading(false);
      }
    }

    loadTerms();

    return () => {
      cancelled = true;
    };
  }, [selectedSession, showNotice]);

  const availableClasses = useMemo(
    () =>
      classes.filter((schoolClass) => {
        const classSession = getSessionId(schoolClass);
        return !classSession || classSession === selectedSession;
      }),
    [classes, selectedSession]
  );

  useEffect(() => {
    if (
      selectedClass &&
      !availableClasses.some(
        (schoolClass) => getId(schoolClass) === selectedClass
      )
    ) {
      setSelectedClass("");
      setRoster([]);
    }
  }, [availableClasses, selectedClass]);

  // Fetch remarks, finalized results and attendance from the backend.
  useEffect(() => {
    if (!selectedClass || !selectedSession || !selectedTerm) {
      setRoster([]);
      setIsSubmitted(false);
      setIsLocked(false);
      setCanEdit(true);
      return;
    }

    let cancelled = false;

    async function loadRemarks() {
      setRosterLoading(true);
      setRoster([]);
      setNotice({ type: "", message: "" });

      try {
        const response = await api.get("/class-teacher-remarks/class", {
          params: {
            schoolClass: selectedClass,
            academicSession: selectedSession,
            academicTerm: selectedTerm,
          },
        });

        if (cancelled) return;

        const data = response.data;

        const loadedRoster = (data?.roster || []).map((entry) => ({
          ...entry,
          remark: entry.remark || "",
          results: entry.results || [],
          onlineAttendance: entry.onlineAttendance || {
            present: 0,
            absent: 0,
            late: 0,
            excused: 0,
            total: 0,
            attendancePercentage: 0,
          },
          attendanceOverride: {
            ...emptyOverride(),
            ...(entry.attendanceOverride || {}),
          },
          previewOpen: false,
        }));

        setRoster(loadedRoster);
        setIsSubmitted(Boolean(data?.isSubmitted));
        setIsLocked(Boolean(data?.isLocked));
        setCanEdit(data?.canEdit !== false);

        if (data?.isLocked) {
          showNotice(
            "error",
            "These remarks are locked because results for this class and term have been locked."
          );
        }
      } catch (error) {
        if (!cancelled) {
          setRoster([]);
          showNotice("error", getErrorMessage(error));
        }
      } finally {
        if (!cancelled) setRosterLoading(false);
      }
    }

    loadRemarks();

    return () => {
      cancelled = true;
    };
  }, [
    selectedClass,
    selectedSession,
    selectedTerm,
    refreshKey,
    showNotice,
  ]);

  function handleRemarkChange(studentId, value) {
    setRoster((current) =>
      current.map((entry) =>
        getId(entry.student) === studentId
          ? { ...entry, remark: value.slice(0, 1000) }
          : entry
      )
    );

    setIsSubmitted(false);
    setNotice({ type: "", message: "" });
  }

  function handleAttendanceOverrideToggle(studentId, enabled) {
    setRoster((current) =>
      current.map((entry) =>
        getId(entry.student) === studentId
          ? {
            ...entry,
            attendanceOverride: {
              ...emptyOverride(),
              ...(entry.attendanceOverride || {}),
              enabled,
            },
          }
          : entry
      )
    );

    setIsSubmitted(false);
    setNotice({ type: "", message: "" });
  }

  function handleAttendanceCountChange(studentId, field, rawValue) {
    const parsed = rawValue === "" ? 0 : Number(rawValue);
    const value = Number.isFinite(parsed)
      ? Math.max(0, Math.min(10000, Math.floor(parsed)))
      : 0;

    setRoster((current) =>
      current.map((entry) =>
        getId(entry.student) === studentId
          ? {
            ...entry,
            attendanceOverride: {
              ...emptyOverride(),
              ...(entry.attendanceOverride || {}),
              [field]: value,
            },
          }
          : entry
      )
    );

    setIsSubmitted(false);
    setNotice({ type: "", message: "" });
  }

  function togglePreview(studentId) {
    setRoster((current) =>
      current.map((entry) =>
        getId(entry.student) === studentId
          ? { ...entry, previewOpen: !entry.previewOpen }
          : entry
      )
    );
  }

  const completedCount = roster.filter((entry) =>
    entry.remark?.trim()
  ).length;

  const allRemarksCompleted =
    roster.length > 0 && completedCount === roster.length;

  const editingDisabled =
    initialLoading ||
    termsLoading ||
    rosterLoading ||
    saving ||
    submitting ||
    isLocked ||
    !canEdit;

  function getSavePayload() {
    return roster.map((entry) => ({
      student: getId(entry.student),
      remark: entry.remark.trim(),
      attendanceOverride: {
        ...emptyOverride(),
        ...(entry.attendanceOverride || {}),
      },
    }));
  }

  async function handleSave() {
    if (!selectedClass || !selectedSession || !selectedTerm) {
      showNotice("error", "Select a class, academic session and term.");
      return;
    }

    if (isLocked || !canEdit) {
      showNotice("error", "These remarks cannot be edited because they are locked.");
      return;
    }

    if (roster.length === 0) {
      showNotice("error", "There are no student remarks to save.");
      return;
    }

    setSaving(true);
    setNotice({ type: "", message: "" });

    try {
      const response = await api.put(
        `/class-teacher-remarks/class/${selectedClass}`,
        {
          academicSession: selectedSession,
          academicTerm: selectedTerm,
          remarks: getSavePayload(),
        }
      );

      setIsSubmitted(false);
      showNotice(
        "success",
        response.data?.message ||
        "Remarks and attendance settings saved successfully."
      );
    } catch (error) {
      showNotice("error", getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmit() {
    if (!allRemarksCompleted) {
      showNotice(
        "error",
        "Enter a remark for every student before submitting."
      );
      return;
    }

    if (isLocked || !canEdit) {
      showNotice("error", "These remarks can no longer be submitted.");
      return;
    }

    setSubmitting(true);
    setNotice({ type: "", message: "" });

    try {
      // Save remarks and attendance overrides before submitting.
      await api.put(`/class-teacher-remarks/class/${selectedClass}`, {
        academicSession: selectedSession,
        academicTerm: selectedTerm,
        remarks: getSavePayload(),
      });

      const response = await api.put(
        `/class-teacher-remarks/class/${selectedClass}/submit`,
        {
          academicSession: selectedSession,
          academicTerm: selectedTerm,
        }
      );

      setIsSubmitted(Boolean(response.data?.isSubmitted));

      showNotice(
        "success",
        response.data?.message || "Class teacher remarks submitted successfully."
      );
    } catch (error) {
      showNotice("error", getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  function handleRefresh() {
    if (selectedClass && selectedSession && selectedTerm) {
      setRefreshKey((current) => current + 1);
    }
  }

  if (initialLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 text-sm text-slate-600">
          <LoaderCircle className="h-5 w-5 animate-spin" />
          Loading class teacher remarks...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <Link
          href="/dashboard/teacher"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-teal-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>

        <section className="overflow-hidden rounded-2xl bg-gradient-to-r from-teal-800 to-teal-600 p-6 text-white shadow-sm sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white/15">
                <FileText className="h-6 w-6" />
              </div>
              <h1 className="text-2xl font-bold sm:text-3xl">
                Class Teacher Remarks
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-teal-50 sm:text-base">
                Preview academic results, review term attendance and write
                constructive comments for your students. Attendance overrides
                are saved separately from daily attendance records.
              </p>
            </div>

            <button
              type="button"
              onClick={handleRefresh}
              disabled={!selectedClass || !selectedSession || !selectedTerm || rosterLoading}
              className="inline-flex items-center justify-center gap-2 self-start rounded-lg border border-white/30 px-4 py-2.5 text-sm font-medium transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50 sm:self-center"
            >
              <RefreshCw
                className={`h-4 w-4 ${rosterLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>
        </section>

        {notice.message && (
          <div
            role="status"
            className={`flex items-start gap-3 rounded-xl border p-4 text-sm ${notice.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-red-200 bg-red-50 text-red-700"
              }`}
          >
            {notice.type === "success" ? (
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
            ) : (
              <Clock3 className="mt-0.5 h-5 w-5 shrink-0" />
            )}
            <p>{notice.message}</p>
          </div>
        )}

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-slate-900">
              Select class and academic period
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Choose the period for which you want to preview reports and
              manage remarks.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label
                htmlFor="academicSession"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Academic session
              </label>
              <select
                id="academicSession"
                value={selectedSession}
                onChange={(event) => setSelectedSession(event.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm text-slate-800 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              >
                <option value="">Select academic session</option>
                {sessions.map((session) => (
                  <option key={getId(session)} value={getId(session)}>
                    {session.name}
                    {session.isCurrent || session.current ? " (Current)" : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="academicTerm"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Academic term
              </label>
              <select
                id="academicTerm"
                value={selectedTerm}
                onChange={(event) => setSelectedTerm(event.target.value)}
                disabled={!selectedSession || termsLoading}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm text-slate-800 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100 disabled:bg-slate-100"
              >
                <option value="">
                  {termsLoading ? "Loading terms..." : "Select academic term"}
                </option>
                {terms.map((term) => (
                  <option key={getId(term)} value={getId(term)}>
                    {term.name}
                    {term.isCurrent || term.current ? " (Current)" : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="schoolClass"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Class
              </label>
              <select
                id="schoolClass"
                value={selectedClass}
                onChange={(event) => setSelectedClass(event.target.value)}
                disabled={!selectedSession || !selectedTerm}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm text-slate-800 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100 disabled:bg-slate-100"
              >
                <option value="">Select class</option>
                {availableClasses.map((schoolClass) => (
                  <option key={getId(schoolClass)} value={getId(schoolClass)}>
                    {getClassLabel(schoolClass)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedSession && selectedTerm && availableClasses.length === 0 && (
            <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
              No classes are available for this session. Confirm that a class
              is assigned to you and belongs to the selected session.
            </p>
          )}
        </section>

        {selectedClass && selectedSession && selectedTerm && (
          <>
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-500">Students</p>
                  <Users className="h-5 w-5 text-teal-700" />
                </div>
                <p className="mt-3 text-3xl font-bold text-slate-900">
                  {roster.length}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Students in the class roster
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-500">
                    Remarks completed
                  </p>
                  <BookOpen className="h-5 w-5 text-blue-600" />
                </div>
                <p className="mt-3 text-3xl font-bold text-slate-900">
                  {completedCount}
                  <span className="ml-1 text-base font-medium text-slate-400">
                    / {roster.length}
                  </span>
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Students with a non-empty remark
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-500">
                    Submission status
                  </p>
                  {isLocked ? (
                    <LockKeyhole className="h-5 w-5 text-red-600" />
                  ) : isSubmitted ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  ) : (
                    <Clock3 className="h-5 w-5 text-amber-600" />
                  )}
                </div>
                <p className="mt-3 text-lg font-bold text-slate-900">
                  {isLocked
                    ? "Locked"
                    : isSubmitted
                      ? "Submitted"
                      : "Draft / Pending"}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {isLocked
                    ? "Editing is disabled"
                    : isSubmitted
                      ? "Editable until results are locked"
                      : "Save and submit when ready"}
                </p>
              </div>
            </section>

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
                <h2 className="text-lg font-semibold text-slate-900">
                  Student reports and class teacher remarks
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Open each student's preview to check finalized subject
                  scores and attendance before saving the class teacher remark.
                </p>
              </div>

              {rosterLoading ? (
                <div className="flex items-center justify-center gap-3 px-5 py-16 text-sm text-slate-500">
                  <LoaderCircle className="h-5 w-5 animate-spin" />
                  Loading student reports and attendance...
                </div>
              ) : roster.length === 0 ? (
                <div className="px-5 py-16 text-center">
                  <Users className="mx-auto h-10 w-10 text-slate-300" />
                  <h3 className="mt-4 font-semibold text-slate-800">
                    No students found
                  </h3>
                  <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                    There are no active students in this class roster. Check
                    the selected class and try refreshing.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {roster.map((entry, index) => {
                    const student = entry.student || {};
                    const studentId = getId(student);
                    const fullName = [
                      student.firstName,
                      student.middleName,
                      student.lastName,
                    ]
                      .filter(Boolean)
                      .join(" ");

                    const displayName =
                      [
                        student.firstName,
                        student.middleName,
                        student.lastName,
                      ]
                        .filter((part) => typeof part === "string" && part.trim())
                        .map((part) => part.trim())
                        .join(" ") ||
                      student.fullName ||
                      student.name ||
                      `Student ${index + 1}`;

                    const attendance = getEffectiveAttendance(entry);
                    const override = {
                      ...emptyOverride(),
                      ...(entry.attendanceOverride || {}),
                    };

                    return (
                      <article
                        key={studentId || entry.remarkId || index}
                        className="p-5 sm:p-6"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <h3 className="font-semibold text-slate-900">
                              {displayName}
                            </h3>
                            <p className="mt-1 text-xs text-slate-500">
                              {student.admissionNumber ||
                                student.studentId ||
                                "No admission number"}
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-medium ${entry.remark?.trim()
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-amber-50 text-amber-700"
                                }`}
                            >
                              {entry.remark?.trim()
                                ? "Remark entered"
                                : "Remark required"}
                            </span>
                            <button
                              type="button"
                              onClick={() => togglePreview(studentId)}
                              className="rounded-lg border border-teal-200 px-3 py-2 text-xs font-semibold text-teal-800 transition hover:bg-teal-50"
                            >
                              {entry.previewOpen
                                ? "Hide report preview"
                                : "Preview report"}
                            </button>
                          </div>
                        </div>

                        {entry.previewOpen && (
                          <div className="mt-5 space-y-5 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
                            <div>
                              <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                <h4 className="font-semibold text-slate-900">
                                  Academic results
                                </h4>
                                <span className="text-xs text-slate-500">
                                  Published and locked results only
                                </span>
                              </div>

                              {entry.results.length === 0 ? (
                                <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                                  No finalized subject results are available
                                  for this student in the selected term.
                                </p>
                              ) : (
                                <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
                                  <table className="min-w-full divide-y divide-slate-200 text-sm">
                                    <thead className="bg-slate-100 text-left text-xs uppercase tracking-wide text-slate-600">
                                      <tr>
                                        <th className="px-3 py-3">Subject</th>
                                        <th className="px-3 py-3">CA</th>
                                        <th className="px-3 py-3">Exam</th>
                                        <th className="px-3 py-3">Total</th>
                                        <th className="px-3 py-3">Grade</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                      {entry.results.map((result) => (
                                        <tr key={result._id}>
                                          <td className="px-3 py-3 font-medium text-slate-800">
                                            {result.subject?.name ||
                                              "Unnamed subject"}
                                            {result.subject?.code ? (
                                              <span className="ml-1 text-xs text-slate-400">
                                                ({result.subject.code})
                                              </span>
                                            ) : null}
                                          </td>
                                          <td className="px-3 py-3 text-slate-700">
                                            {result.caScore}
                                          </td>
                                          <td className="px-3 py-3 text-slate-700">
                                            {result.examScore}
                                          </td>
                                          <td className="px-3 py-3 font-semibold text-slate-900">
                                            {result.total}
                                          </td>
                                          <td className="px-3 py-3">
                                            <span className="rounded-md bg-teal-50 px-2 py-1 font-semibold text-teal-800">
                                              {result.grade}
                                            </span>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </div>

                            <div>
                              <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <h4 className="font-semibold text-slate-900">
                                  Term attendance
                                </h4>
                                <span
                                  className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${override.enabled
                                      ? "bg-amber-100 text-amber-800"
                                      : "bg-emerald-100 text-emerald-800"
                                    }`}
                                >
                                  {override.enabled
                                    ? "Manual override in use"
                                    : "Using website attendance"}
                                </span>
                              </div>

                              <p className="mb-3 text-sm text-slate-600">
                                The default values come from the existing
                                attendance records for this term. Enable manual
                                override only when you need the report to use
                                different figures.
                              </p>

                              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                                <AttendanceStat
                                  label="Present"
                                  value={attendance.present}
                                />
                                <AttendanceStat
                                  label="Absent"
                                  value={attendance.absent}
                                />
                                <AttendanceStat
                                  label="Late"
                                  value={attendance.late}
                                />
                                <AttendanceStat
                                  label="Excused"
                                  value={attendance.excused}
                                />
                                <AttendanceStat
                                  label="Total days"
                                  value={attendance.total}
                                />
                                <AttendanceStat
                                  label="Attendance"
                                  value={formatPercentage(
                                    attendance.attendancePercentage
                                  )}
                                />
                              </div>

                              <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 bg-white p-4">
                                <input
                                  type="checkbox"
                                  checked={override.enabled}
                                  disabled={editingDisabled}
                                  onChange={(event) =>
                                    handleAttendanceOverrideToggle(
                                      studentId,
                                      event.target.checked
                                    )
                                  }
                                  className="mt-1 h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-600"
                                />
                                <span>
                                  <span className="block text-sm font-semibold text-slate-800">
                                    Use manual attendance override
                                  </span>
                                  <span className="mt-1 block text-xs leading-5 text-slate-500">
                                    When enabled, these counts replace the
                                    website attendance values in this preview.
                                    The original attendance records remain
                                    unchanged.
                                  </span>
                                </span>
                              </label>

                              {override.enabled && (
                                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                                  {[
                                    ["present", "Present days"],
                                    ["absent", "Absent days"],
                                    ["late", "Late days"],
                                    ["excused", "Excused days"],
                                  ].map(([field, label]) => (
                                    <div key={field}>
                                      <label
                                        htmlFor={`${studentId}-${field}`}
                                        className="mb-1 block text-xs font-medium text-slate-700"
                                      >
                                        {label}
                                      </label>
                                      <input
                                        id={`${studentId}-${field}`}
                                        type="number"
                                        min="0"
                                        max="10000"
                                        step="1"
                                        value={override[field]}
                                        disabled={editingDisabled}
                                        onChange={(event) =>
                                          handleAttendanceCountChange(
                                            studentId,
                                            field,
                                            event.target.value
                                          )
                                        }
                                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100 disabled:bg-slate-100"
                                      />
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="mt-5">
                          <label
                            htmlFor={`remark-${studentId}`}
                            className="mb-2 block text-sm font-medium text-slate-700"
                          >
                            Class teacher remark
                          </label>
                          <textarea
                            id={`remark-${studentId}`}
                            value={entry.remark}
                            onChange={(event) =>
                              handleRemarkChange(studentId, event.target.value)
                            }
                            disabled={editingDisabled}
                            maxLength={1000}
                            rows={3}
                            placeholder={`Write a class teacher remark for ${displayName}...`}
                            className="w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                          />
                          <div className="mt-2 text-right text-xs text-slate-400">
                            {entry.remark.length}/1000 characters
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}

              <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <p className="text-sm text-slate-500">
                  {isLocked
                    ? "These remarks are locked. Contact your school administrator if a correction is needed."
                    : "Save your remarks and any manual attendance overrides before leaving this page."}
                </p>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={editingDisabled || roster.length === 0}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {saving ? (
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    {saving ? "Saving..." : "Save remarks"}
                  </button>

                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={editingDisabled || !allRemarksCompleted}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {submitting ? (
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    {submitting
                      ? "Submitting..."
                      : isSubmitted
                        ? "Resubmit remarks"
                        : "Submit remarks"}
                  </button>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}