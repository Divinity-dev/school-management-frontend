"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  GraduationCap,
  Loader2,
  Lock,
  RefreshCw,
  Search,
  Users,
} from "lucide-react";

import api from "@/lib/api";
import ReportCardDocument from "@/components/results/ReportCardDocument";

function getId(value) {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    return value._id || value.id || "";
  }
  return "";
}

function getErrorMessage(error, fallback = "Something went wrong.") {
  return (
    error?.response?.data?.message ||
    error?.message ||
    fallback
  );
}

function getStudentName(student) {
  if (!student) return "Unknown student";

  if (student.fullName) return student.fullName;
  if (student.name) return student.name;

  const firstName = student.firstName || "";
  const middleName = student.middleName || "";
  const lastName = student.lastName || "";

  const fullName = [firstName, middleName, lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  return fullName || "Unknown student";
}

function getSubjectName(subject) {
  if (!subject) return "Subject";

  if (typeof subject === "string") return subject;

  return (
    subject.name ||
    subject.subjectName ||
    subject.title ||
    "Subject"
  );
}

function getStatus(result) {
  return result?.status || "not_started";
}

function formatStatus(status) {
  const labels = {
    draft: "Draft",
    pending_review: "Pending review",
    published: "Published",
    locked: "Locked",
    not_started: "Not started",
  };

  return labels[status] || String(status).replaceAll("_", " ");
}

function getStatusClasses(status) {
  const styles = {
    draft: "bg-gray-100 text-gray-700",
    pending_review: "bg-amber-100 text-amber-800",
    published: "bg-emerald-100 text-emerald-800",
    locked: "bg-indigo-100 text-indigo-800",
    not_started: "bg-slate-100 text-slate-600",
  };

  return styles[status] || "bg-gray-100 text-gray-700";
}

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClasses(
        status
      )}`}
    >
      {formatStatus(status)}
    </span>
  );
}

function Notice({ type = "info", children }) {
  const styles = {
    info: "border-blue-200 bg-blue-50 text-blue-800",
    error: "border-red-200 bg-red-50 text-red-800",
    success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  };

  return (
    <div
      role={type === "error" ? "alert" : "status"}
      className={`rounded-xl border p-4 text-sm ${styles[type] || styles.info}`}
    >
      {children}
    </div>
  );
}

export default function SchoolAdminResultsPage() {
  const [sessions, setSessions] = useState([]);
  const [terms, setTerms] = useState([]);
  const [classes, setClasses] = useState([]);

  const [sessionId, setSessionId] = useState("");
  const [termId, setTermId] = useState("");
  const [classId, setClassId] = useState("");

  const [matrixData, setMatrixData] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [initialLoading, setInitialLoading] = useState(true);
  const [filtersLoading, setFiltersLoading] = useState(false);
  const [matrixLoading, setMatrixLoading] = useState(false);

  const [actionLoading, setActionLoading] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  const [reportCard, setReportCard] = useState(null);
  const [reportCardLoadingId, setReportCardLoadingId] = useState("");
  const [reportCardError, setReportCardError] = useState("");

  const loadSessions = useCallback(async () => {
    try {
      const response = await api.get("/academic-sessions");
      const payload = response.data?.data;

      const list = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.sessions)
          ? payload.sessions
          : Array.isArray(response.data?.sessions)
            ? response.data.sessions
            : [];

      setSessions(list);

      const currentSession =
        list.find(
          (session) =>
            session.isCurrent === true ||
            session.isActive === true ||
            session.status === "current"
        ) || list[0];

      if (currentSession) {
        setSessionId(getId(currentSession));
      }
    } catch (error) {
      setActionError(
        getErrorMessage(error, "Unable to load academic sessions.")
      );
    } finally {
      setInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  useEffect(() => {
    if (!sessionId) {
      setTerms([]);
      setClasses([]);
      setTermId("");
      setClassId("");
      setMatrixData(null);
      return;
    }

    let cancelled = false;

    async function loadSessionFilters() {
      setFiltersLoading(true);
      setActionError("");
      setMatrixData(null);

      try {
        const [termsResponse, classesResponse] = await Promise.all([
          api.get(`/academic-terms/session/${sessionId}`),
          api.get(`/classes/session/${sessionId}`),
        ]);

        if (cancelled) return;

        const termsPayload = termsResponse.data?.data;
        const termsList = Array.isArray(termsPayload)
          ? termsPayload
          : Array.isArray(termsPayload?.terms)
            ? termsPayload.terms
            : Array.isArray(termsResponse.data?.terms)
              ? termsResponse.data.terms
              : [];

        const classesPayload = classesResponse.data?.data;
        const classesList = Array.isArray(classesPayload)
          ? classesPayload
          : Array.isArray(classesPayload?.classes)
            ? classesPayload.classes
            : Array.isArray(classesResponse.data?.classes)
              ? classesResponse.data.classes
              : [];

        setTerms(termsList);
        setClasses(classesList);

        const currentTerm =
          termsList.find(
            (term) =>
              term.isCurrent === true ||
              term.isActive === true ||
              term.status === "current"
          ) || termsList[0];

        setTermId(getId(currentTerm));
        setClassId("");
      } catch (error) {
        if (!cancelled) {
          setActionError(
            getErrorMessage(
              error,
              "Unable to load the terms and classes for this session."
            )
          );
        }
      } finally {
        if (!cancelled) setFiltersLoading(false);
      }
    }

    loadSessionFilters();

    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  const loadMatrix = useCallback(async () => {
    if (!sessionId || !termId || !classId) {
      setMatrixData(null);
      return;
    }

    setMatrixLoading(true);
    setActionError("");
    setActionSuccess("");

    try {
      const response = await api.get("/results/admin-class-matrix", {
        params: {
          schoolClass: classId,
          academicSession: sessionId,
          academicTerm: termId,
        },
      });

      const payload = response.data?.data ?? response.data;

setMatrixData(
  payload && typeof payload === "object"
    ? payload
    : null
);
    } catch (error) {
      setMatrixData(null);
      setActionError(
        getErrorMessage(error, "Unable to load the results matrix.")
      );
    } finally {
      setMatrixLoading(false);
    }
  }, [sessionId, termId, classId]);

  const matrix = useMemo(() => {
    if (Array.isArray(matrixData?.matrix)) {
      return matrixData.matrix;
    }

    if (Array.isArray(matrixData?.students)) {
      return matrixData.students;
    }

    return [];
  }, [matrixData]);

  const filteredMatrix = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) return matrix;

    return matrix.filter((row) => {
      const student = row.student || row;
      const name = getStudentName(student).toLowerCase();
      const studentId = String(
        student.studentId || student.admissionNumber || ""
      ).toLowerCase();

      return name.includes(query) || studentId.includes(query);
    });
  }, [matrix, searchTerm]);

  const allResults = useMemo(() => {
    return matrix.flatMap((row) => {
      const subjects = Array.isArray(row.subjects)
        ? row.subjects
        : [];

      return subjects
        .map((entry) => entry?.result)
        .filter(Boolean);
    });
  }, [matrix]);

  const statusCounts = useMemo(() => {
    return {
      total: allResults.length,
      draft: allResults.filter(
        (result) => result.status === "draft"
      ).length,
      pending: allResults.filter(
        (result) => result.status === "pending_review"
      ).length,
      published: allResults.filter(
        (result) => result.status === "published"
      ).length,
      locked: allResults.filter(
        (result) => result.status === "locked"
      ).length,
    };
  }, [allResults]);

  const pendingResults = useMemo(
    () =>
      allResults.filter(
        (result) => result.status === "pending_review"
      ),
    [allResults]
  );

  const publishedResults = useMemo(
    () =>
      allResults.filter(
        (result) => result.status === "published"
      ),
    [allResults]
  );

  const handleBulkAction = async (action) => {
    const results =
      action === "publish" ? pendingResults : publishedResults;

    if (!results.length) {
      setActionError(
        action === "publish"
          ? "There are no results pending review to publish."
          : "There are no published results available to lock."
      );
      return;
    }

    const actionLabel = action === "publish" ? "publish" : "lock";

    const confirmed = window.confirm(
      `Are you sure you want to ${actionLabel} ${results.length} result(s) for this class?`
    );

    if (!confirmed) return;

    setActionLoading(action);
    setActionError("");
    setActionSuccess("");

    const failures = [];

    try {
      for (const result of results) {
        const resultId = getId(result);

        if (!resultId) {
          failures.push("A result is missing its ID.");
          continue;
        }

        try {
          await api.post(`/results/${resultId}/${action}`);
        } catch (error) {
          failures.push(
            `${getStudentName(result.student)}: ${getErrorMessage(
              error,
              `Could not ${actionLabel} result.`
            )}`
          );
        }
      }

      await loadMatrix();

      if (failures.length) {
        setActionError(
          `${results.length - failures.length} result(s) processed successfully. Some results could not be processed: ${failures.slice(0, 3).join(" ")}`
        );
      } else {
        setActionSuccess(
          `Successfully ${action === "publish" ? "published" : "locked"} ${results.length} result(s).`
        );
      }
    } catch (error) {
      setActionError(
        getErrorMessage(error, `Unable to ${actionLabel} results.`)
      );
    } finally {
      setActionLoading("");
    }
  };

  const handleViewReportCard = async (row) => {
    const student = row.student || row;
    const studentId = getId(student);

    if (!studentId || !sessionId || !termId) {
      setReportCardError(
        "Student, academic session, or academic term information is missing."
      );
      return;
    }

    setReportCardLoadingId(studentId);
    setReportCardError("");
    setReportCard(null);

    try {
      const response = await api.get("/results/report-card", {
        params: {
          studentId,
          academicSession: sessionId,
          academicTerm: termId,
        },
      });

      const report = response.data?.data;

      if (!report) {
        throw new Error("The report card could not be found.");
      }

      setReportCard(report);
    } catch (error) {
      setReportCardError(
        getErrorMessage(
          error,
          "Unable to load this student's report card."
        )
      );
    } finally {
      setReportCardLoadingId("");
    }
  };

  if (reportCard) {
    return (
      <main className="min-h-screen bg-slate-100 px-4 py-6 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <button
            type="button"
            onClick={() => {
              setReportCard(null);
              setReportCardError("");
            }}
            className="mb-5 inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            <ArrowLeft size={17} />
            Back to Results Management
          </button>

          <ReportCardDocument
            report={reportCard}
            showToolbar
            backHref={null}
          />
        </div>
      </main>
    );
  }

  if (initialLoading) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <Loader2 className="animate-spin" size={20} />
          Loading results management...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">
              <BookOpen size={16} />
              Academic Management
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              Results Management
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-gray-600">
              Review students' results, publish approved results, lock
              published results, and view printable report cards.
            </p>
          </div>

          <button
            type="button"
            onClick={loadMatrix}
            disabled={!classId || !termId || matrixLoading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={matrixLoading ? "animate-spin" : ""}
            />
            Refresh Results
          </button>
        </div>

        {actionError && (
          <Notice type="error">
            <div className="flex items-start gap-2">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <div className="flex-1">{actionError}</div>
              <button
                type="button"
                onClick={() => setActionError("")}
                className="font-semibold underline"
              >
                Dismiss
              </button>
            </div>
          </Notice>
        )}

        {actionSuccess && (
          <Notice type="success">
            <div className="flex items-start gap-2">
              <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
              <div className="flex-1">{actionSuccess}</div>
              <button
                type="button"
                onClick={() => setActionSuccess("")}
                className="font-semibold underline"
              >
                Dismiss
              </button>
            </div>
          </Notice>
        )}

        {reportCardError && (
          <Notice type="error">
            <div className="flex items-start gap-2">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <div className="flex-1">{reportCardError}</div>
              <button
                type="button"
                onClick={() => setReportCardError("")}
                className="font-semibold underline"
              >
                Dismiss
              </button>
            </div>
          </Notice>
        )}

        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <ClipboardList size={19} className="text-emerald-700" />
            <h2 className="font-semibold text-gray-900">
              Select Academic Period and Class
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label
                htmlFor="academic-session"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Academic Session
              </label>

              <div className="relative">
                <select
                  id="academic-session"
                  value={sessionId}
                  onChange={(event) => {
                    setSessionId(event.target.value);
                    setTermId("");
                    setClassId("");
                    setMatrixData(null);
                    setActionError("");
                    setActionSuccess("");
                  }}
                  className="w-full appearance-none rounded-xl border border-gray-300 bg-white px-3 py-3 pr-10 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                >
                  <option value="">Select academic session</option>
                  {sessions.map((session) => (
                    <option
                      key={getId(session)}
                      value={getId(session)}
                    >
                      {session.name ||
                        session.sessionName ||
                        session.title ||
                        "Academic Session"}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="academic-term"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Academic Term
              </label>

              <div className="relative">
                <select
                  id="academic-term"
                  value={termId}
                  onChange={(event) => {
                    setTermId(event.target.value);
                    setMatrixData(null);
                    setActionError("");
                    setActionSuccess("");
                  }}
                  disabled={!sessionId || filtersLoading}
                  className="w-full appearance-none rounded-xl border border-gray-300 bg-white px-3 py-3 pr-10 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 disabled:bg-gray-100"
                >
                  <option value="">Select academic term</option>
                  {terms.map((term) => (
                    <option key={getId(term)} value={getId(term)}>
                      {term.name ||
                        term.termName ||
                        term.title ||
                        "Academic Term"}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="school-class"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Class
              </label>

              <div className="relative">
                <select
                  id="school-class"
                  value={classId}
                  onChange={(event) => {
                    setClassId(event.target.value);
                    setMatrixData(null);
                    setActionError("");
                    setActionSuccess("");
                  }}
                  disabled={!sessionId || filtersLoading}
                  className="w-full appearance-none rounded-xl border border-gray-300 bg-white px-3 py-3 pr-10 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 disabled:bg-gray-100"
                >
                  <option value="">Select class</option>
                  {classes.map((schoolClass) => (
                    <option
                      key={getId(schoolClass)}
                      value={getId(schoolClass)}
                    >
                      {schoolClass.name ||
                        schoolClass.className ||
                        schoolClass.title ||
                        "Class"}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                />
              </div>
            </div>
          </div>

          {filtersLoading && (
            <p className="mt-4 flex items-center gap-2 text-sm text-gray-500">
              <Loader2 size={15} className="animate-spin" />
              Loading terms and classes...
            </p>
          )}

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-5">
            <p className="text-xs text-gray-500">
              Select a session, term and class to load the results matrix.
            </p>

            <button
              type="button"
              onClick={loadMatrix}
              disabled={
                !sessionId ||
                !termId ||
                !classId ||
                matrixLoading ||
                filtersLoading
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {matrixLoading ? (
                <Loader2 size={17} className="animate-spin" />
              ) : (
                <Search size={17} />
              )}
              {matrixLoading ? "Loading Results..." : "Load Results"}
            </button>
          </div>
        </section>

        {matrixData && (
          <>
            <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Users size={16} />
                  Students
                </div>
                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {matrix.length}
                </p>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <p className="text-sm text-gray-500">Total Results</p>
                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {statusCounts.total}
                </p>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <p className="text-sm text-gray-500">Pending Review</p>
                <p className="mt-2 text-2xl font-bold text-amber-600">
                  {statusCounts.pending}
                </p>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <p className="text-sm text-gray-500">Published</p>
                <p className="mt-2 text-2xl font-bold text-emerald-700">
                  {statusCounts.published}
                </p>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <p className="text-sm text-gray-500">Locked</p>
                <p className="mt-2 text-2xl font-bold text-indigo-700">
                  {statusCounts.locked}
                </p>
              </div>
            </section>

            <section className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-semibold text-gray-900">
                  Class Result Actions
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Publish results awaiting review or lock results that
                  have already been published.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleBulkAction("publish")}
                  disabled={
                    !pendingResults.length ||
                    Boolean(actionLoading)
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {actionLoading === "publish" ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <CheckCircle2 size={16} />
                  )}
                  Publish Pending ({pendingResults.length})
                </button>

                <button
                  type="button"
                  onClick={() => handleBulkAction("lock")}
                  disabled={
                    !publishedResults.length ||
                    Boolean(actionLoading)
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm font-semibold text-indigo-800 transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {actionLoading === "lock" ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Lock size={16} />
                  )}
                  Lock Published ({publishedResults.length})
                </button>
              </div>
            </section>

            <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="flex flex-col gap-3 border-b border-gray-200 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-semibold text-gray-900">
                    Class Results Matrix
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Open an individual result to review its details.
                    Published and locked results can also be printed as
                    report cards.
                  </p>
                </div>

                <div className="relative w-full sm:max-w-xs">
                  <Search
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="search"
                    value={searchTerm}
                    onChange={(event) =>
                      setSearchTerm(event.target.value)
                    }
                    placeholder="Search student..."
                    className="w-full rounded-xl border border-gray-300 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>
              </div>

              {matrixLoading ? (
                <div className="flex min-h-56 items-center justify-center gap-3 text-sm text-gray-500">
                  <Loader2
                    size={20}
                    className="animate-spin text-emerald-700"
                  />
                  Loading class results...
                </div>
              ) : filteredMatrix.length === 0 ? (
                <div className="flex min-h-56 flex-col items-center justify-center px-6 text-center">
                  <div className="mb-3 rounded-full bg-gray-100 p-3">
                    <ClipboardList
                      size={24}
                      className="text-gray-400"
                    />
                  </div>

                  <h3 className="font-semibold text-gray-900">
                    No results found
                  </h3>

                  <p className="mt-1 max-w-md text-sm text-gray-500">
                    {matrix.length === 0
                      ? "No students or subject results were returned for this class and academic period."
                      : "No students match your search."}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[900px] border-collapse text-left">
                    <thead>
                      <tr className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                        <th className="px-5 py-4 font-semibold">
                          Student
                        </th>
                        <th className="px-5 py-4 font-semibold">
                          Subject
                        </th>
                        <th className="px-5 py-4 font-semibold">
                          Score
                        </th>
                        <th className="px-5 py-4 font-semibold">
                          Grade
                        </th>
                        <th className="px-5 py-4 font-semibold">
                          Status
                        </th>
                        <th className="px-5 py-4 text-right font-semibold">
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                      {filteredMatrix.map((row, rowIndex) => {
                        const student = row.student || row;
                        const studentSubjects = Array.isArray(row.subjects)
                          ? row.subjects
                          : [];

                        const studentId = getId(student);

                        const hasPrintableResult =
                          studentSubjects.some((entry) =>
                            ["published", "locked"].includes(
                              getStatus(entry?.result)
                            )
                          );

                        return (
                          <tr
                            key={studentId || rowIndex}
                            className="align-top transition hover:bg-gray-50/70"
                          >
                            <td className="px-5 py-4">
                              <div className="min-w-48">
                                <p className="font-semibold text-gray-900">
                                  {getStudentName(student)}
                                </p>

                                {(student.studentId ||
                                  student.admissionNumber) && (
                                  <p className="mt-1 text-xs text-gray-500">
                                    ID:{" "}
                                    {student.studentId ||
                                      student.admissionNumber}
                                  </p>
                                )}

                                {hasPrintableResult && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleViewReportCard(row)
                                    }
                                    disabled={Boolean(
                                      reportCardLoadingId
                                    )}
                                    className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
                                  >
                                    {reportCardLoadingId ===
                                    studentId ? (
                                      <Loader2
                                        size={14}
                                        className="animate-spin"
                                      />
                                    ) : (
                                      <GraduationCap size={14} />
                                    )}

                                    {reportCardLoadingId ===
                                    studentId
                                      ? "Loading report..."
                                      : "View Report Card"}
                                  </button>
                                )}
                              </div>
                            </td>

                            <td
                              colSpan={5}
                              className="p-0 align-top"
                            >
                              {studentSubjects.length === 0 ? (
                                <div className="px-5 py-4 text-sm text-gray-500">
                                  No subject results available.
                                </div>
                              ) : (
                                <table className="w-full border-collapse">
                                  <tbody className="divide-y divide-gray-100">
                                    {studentSubjects.map(
                                      (entry, subjectIndex) => {
                                        const result = entry?.result;
                                        const subject =
                                          entry?.subject ||
                                          result?.subject;

                                        const resultId = getId(result);
                                        const status =
                                          getStatus(result);

                                        const score =
                                          result?.totalScore ??
                                          result?.total ??
                                          result?.totalMarks;

                                        const grade =
                                          result?.grade ||
                                          result?.letterGrade ||
                                          "—";

                                        return (
                                          <tr
                                            key={
                                              resultId ||
                                              `${studentId}-${subjectIndex}`
                                            }
                                            className="hover:bg-gray-50"
                                          >
                                            <td className="w-[25%] px-5 py-4 text-sm text-gray-700">
                                              {getSubjectName(subject)}
                                            </td>

                                            <td className="w-[12%] px-5 py-4 text-sm text-gray-700">
                                              {score === undefined ||
                                              score === null
                                                ? "—"
                                                : score}
                                            </td>

                                            <td className="w-[10%] px-5 py-4 text-sm font-semibold text-gray-800">
                                              {grade}
                                            </td>

                                            <td className="w-[18%] px-5 py-4">
                                              <StatusBadge
                                                status={status}
                                              />
                                            </td>

                                            <td className="px-5 py-4 text-right">
                                              {resultId ? (
                                                <Link
                                                  href={`/dashboard/school-admin/results/${resultId}`}
                                                  className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800"
                                                >
                                                  Review Result
                                                </Link>
                                              ) : (
                                                <span className="text-xs text-gray-400">
                                                  No result record
                                                </span>
                                              )}
                                            </td>
                                          </tr>
                                        );
                                      }
                                    )}
                                  </tbody>
                                </table>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="flex flex-col gap-2 border-t border-gray-200 bg-gray-50 px-5 py-3 text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between">
                <span>
                  Showing {filteredMatrix.length} of {matrix.length}{" "}
                  students
                </span>
                <span>
                  Only published or locked results are eligible for
                  report-card printing.
                </span>
              </div>
            </section>
          </>
        )}

        {!matrixData && !matrixLoading && (
          <section className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50">
              <ClipboardList
                size={26}
                className="text-emerald-700"
              />
            </div>

            <h2 className="font-semibold text-gray-900">
              Select a class to manage results
            </h2>

            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-gray-500">
              Choose the academic session, term and class above, then
              click Load Results to review result statuses and access
              report cards.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}

