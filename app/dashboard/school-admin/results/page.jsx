"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  CheckCircle2,
  Clock3,
  FileText,
  Lock,
  RefreshCw,
  Search,
  XCircle,
} from "lucide-react";
import api from "@/lib/api";

const statusOptions = [
  { value: "", label: "All Statuses" },
  { value: "draft", label: "Draft" },
  { value: "pending_review", label: "Pending Review" },
  { value: "published", label: "Published" },
  { value: "locked", label: "Locked" },
];

const statusStyles = {
  draft: "bg-slate-100 text-slate-700",
  pending_review: "bg-amber-100 text-amber-700",
  published: "bg-emerald-100 text-emerald-700",
  locked: "bg-blue-100 text-blue-700",
};

const statusLabels = {
  draft: "Draft",
  pending_review: "Pending Review",
  published: "Published",
  locked: "Locked",
};

const formatName = (person) => {
  if (!person) return "—";

  return [
    person.firstName,
    person.middleName,
    person.lastName,
  ]
    .filter(Boolean)
    .join(" ");
};

const formatScore = (result) => {
  const total =
    typeof result.total === "number"
      ? result.total
      : Number(result.caScore || 0) + Number(result.examScore || 0);

  return Number.isFinite(total) ? total : "—";
};

export default function SchoolAdminResultsPage() {
  const router = useRouter();

  const [sessions, setSessions] = useState([]);
  const [terms, setTerms] = useState([]);
  const [classes, setClasses] = useState([]);

  const [results, setResults] = useState([]);
  const [summary, setSummary] = useState({
    totalResults: 0,
    draft: 0,
    pendingReview: 0,
    published: 0,
    locked: 0,
  });

  const [academicSession, setAcademicSession] = useState("");
  const [academicTerm, setAcademicTerm] = useState("");
  const [schoolClass, setSchoolClass] = useState("");
  const [status, setStatus] = useState("pending_review");

  const [loading, setLoading] = useState(true);
  const [loadingFilters, setLoadingFilters] = useState(true);
  const [error, setError] = useState("");

  // --------------------------------------------------
  // Load academic sessions
  // --------------------------------------------------
  const fetchSessions = async () => {
    try {
      const response = await api.get("/academic-sessions");

      const sessionData = response.data?.sessions || [];

      setSessions(sessionData);

      const currentSession = sessionData.find(
        (session) => session.isCurrent
      );

      if (currentSession) {
        setAcademicSession(currentSession._id);
      }
    } catch (err) {
      console.error("Failed to load academic sessions:", err);
      setError(
        err.response?.data?.message ||
          "Unable to load academic sessions."
      );
    }
  };

  // --------------------------------------------------
  // Load terms for selected session
  // --------------------------------------------------
  const fetchTerms = async (sessionId) => {
    if (!sessionId) {
      setTerms([]);
      setAcademicTerm("");
      return;
    }

    try {
      const response = await api.get(
        `/academic-terms/session/${sessionId}`
      );

      const termData = response.data?.terms || [];

      setTerms(termData);

      const currentTerm = termData.find(
        (term) => term.isCurrent
      );

      if (currentTerm) {
        setAcademicTerm(currentTerm._id);
      } else if (termData.length > 0) {
        setAcademicTerm(termData[0]._id);
      } else {
        setAcademicTerm("");
      }
    } catch (err) {
      console.error("Failed to load academic terms:", err);
      setTerms([]);
      setAcademicTerm("");
    }
  };

  // --------------------------------------------------
  // Load classes for selected session
  // --------------------------------------------------
  const fetchClasses = async (sessionId) => {
    if (!sessionId) {
      setClasses([]);
      setSchoolClass("");
      return;
    }

    try {
      const response = await api.get(
        `/classes/session/${sessionId}`
      );

      const classData = response.data?.classes || [];

      setClasses(classData);
      setSchoolClass("");
    } catch (err) {
      console.error("Failed to load classes:", err);
      setClasses([]);
      setSchoolClass("");
    }
  };

  // --------------------------------------------------
  // Initial filter loading
  // --------------------------------------------------
  useEffect(() => {
    const loadFilters = async () => {
      setLoadingFilters(true);

      await fetchSessions();

      setLoadingFilters(false);
    };

    loadFilters();
  }, []);

  // --------------------------------------------------
  // Load terms and classes whenever session changes
  // --------------------------------------------------
  useEffect(() => {
    if (!academicSession) return;

    const loadSessionData = async () => {
      await Promise.all([
        fetchTerms(academicSession),
        fetchClasses(academicSession),
      ]);
    };

    loadSessionData();
  }, [academicSession]);

  // --------------------------------------------------
  // Fetch results
  // --------------------------------------------------
  const fetchResults = async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (academicSession) {
        params.append("academicSession", academicSession);
      }

      if (academicTerm) {
        params.append("academicTerm", academicTerm);
      }

      if (schoolClass) {
        params.append("schoolClass", schoolClass);
      }

      if (status) {
        params.append("status", status);
      }

      const query = params.toString();

      const response = await api.get(
        `/results/admin-results${query ? `?${query}` : ""}`
      );

      setResults(response.data?.results || []);

      setSummary(
        response.data?.summary || {
          totalResults: 0,
          draft: 0,
          pendingReview: 0,
          published: 0,
          locked: 0,
        }
      );
    } catch (err) {
      console.error("Failed to load results:", err);

      setResults([]);

      setError(
        err.response?.data?.message ||
          "Unable to load results."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (loadingFilters) return;

    fetchResults();
  }, [
    academicSession,
    academicTerm,
    schoolClass,
    status,
    loadingFilters,
  ]);

  const handleRefresh = () => {
    fetchResults();
  };

  const handleSessionChange = (event) => {
    setAcademicSession(event.target.value);
  };

  const handleStatusChange = (event) => {
    setStatus(event.target.value);
  };

  const clearFilters = () => {
    setSchoolClass("");
    setStatus("pending_review");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
              <BarChart3 size={23} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Results
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Review and manage student academic results.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            size={17}
            className={loading ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-4 flex items-center gap-2">
          <Search size={18} className="text-emerald-600" />

          <h2 className="font-semibold text-slate-900">
            Filter Results
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Academic Session */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Academic Session
            </label>

            <select
              value={academicSession}
              onChange={handleSessionChange}
              disabled={loadingFilters}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-50"
            >
              <option value="">All Sessions</option>

              {sessions.map((session) => (
                <option
                  key={session._id}
                  value={session._id}
                >
                  {session.name}
                </option>
              ))}
            </select>
          </div>

          {/* Academic Term */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Academic Term
            </label>

            <select
              value={academicTerm}
              onChange={(event) =>
                setAcademicTerm(event.target.value)
              }
              disabled={!academicSession || loadingFilters}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-50"
            >
              <option value="">All Terms</option>

              {terms.map((term) => (
                <option
                  key={term._id}
                  value={term._id}
                >
                  {term.name}
                </option>
              ))}
            </select>
          </div>

          {/* Class */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Class
            </label>

            <select
              value={schoolClass}
              onChange={(event) =>
                setSchoolClass(event.target.value)
              }
              disabled={!academicSession || loadingFilters}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-50"
            >
              <option value="">All Classes</option>

              {classes.map((schoolClassItem) => (
                <option
                  key={schoolClassItem._id}
                  value={schoolClassItem._id}
                >
                  {schoolClassItem.name}
                  {schoolClassItem.arm
                    ? ` ${schoolClassItem.arm}`
                    : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Status
            </label>

            <select
              value={status}
              onChange={handleStatusChange}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            >
              {statusOptions.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-800"
          >
            <XCircle size={16} />
            Clear class/status filters
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <SummaryCard
          title="Total Results"
          value={summary.totalResults}
          icon={FileText}
          iconClass="bg-slate-100 text-slate-600"
        />

        <SummaryCard
          title="Draft"
          value={summary.draft}
          icon={Clock3}
          iconClass="bg-slate-100 text-slate-600"
        />

        <SummaryCard
          title="Pending Review"
          value={summary.pendingReview}
          icon={Clock3}
          iconClass="bg-amber-100 text-amber-600"
        />

        <SummaryCard
          title="Published"
          value={summary.published}
          icon={CheckCircle2}
          iconClass="bg-emerald-100 text-emerald-600"
        />

        <SummaryCard
          title="Locked"
          value={summary.locked}
          icon={Lock}
          iconClass="bg-blue-100 text-blue-600"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Results */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-4 py-4 sm:px-6">
          <div>
            <h2 className="font-semibold text-slate-900">
              Student Results
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {status === "pending_review"
                ? "Results waiting for your review."
                : "Results matching your selected filters."}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-[280px] items-center justify-center">
            <div className="flex items-center gap-3 text-sm text-slate-500">
              <RefreshCw
                size={18}
                className="animate-spin text-emerald-600"
              />
              Loading results...
            </div>
          </div>
        ) : results.length === 0 ? (
          <div className="flex min-h-[280px] flex-col items-center justify-center px-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <FileText size={26} />
            </div>

            <h3 className="mt-4 font-semibold text-slate-900">
              No results found
            </h3>

            <p className="mt-1 max-w-md text-sm text-slate-500">
              {status === "pending_review"
                ? "There are currently no results waiting for review."
                : "No results match the selected filters."}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <TableHeader>Student</TableHeader>
                    <TableHeader>Subject</TableHeader>
                    <TableHeader>Class</TableHeader>
                    <TableHeader>Score</TableHeader>
                    <TableHeader>Grade</TableHeader>
                    <TableHeader>Teacher</TableHeader>
                    <TableHeader>Status</TableHeader>
                    <TableHeader>Action</TableHeader>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200 bg-white">
                  {results.map((result) => (
                    <tr
                      key={result._id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="whitespace-nowrap px-4 py-4 sm:px-6">
                        <div className="font-medium text-slate-900">
                          {formatName(result.student)}
                        </div>

                        {result.student?.studentId && (
                          <div className="mt-0.5 text-xs text-slate-500">
                            {result.student.studentId}
                          </div>
                        )}
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-700">
                        <div>
                          {result.subject?.name || "—"}
                        </div>

                        {result.subject?.code && (
                          <div className="mt-0.5 text-xs text-slate-400">
                            {result.subject.code}
                          </div>
                        )}
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-700">
                        {result.schoolClass?.name || "—"}
                        {result.schoolClass?.arm
                          ? ` ${result.schoolClass.arm}`
                          : ""}
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 text-sm font-semibold text-slate-900">
                        {formatScore(result)}
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 text-sm font-semibold text-slate-700">
                        {result.grade || "—"}
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-700">
                        {formatName(result.enteredBy)}
                      </td>

                      <td className="whitespace-nowrap px-4 py-4">
                        <StatusBadge status={result.status} />
                      </td>

                      <td className="whitespace-nowrap px-4 py-4">
                        <button
                          type="button"
                          onClick={() =>
                            router.push(
                              `/dashboard/school-admin/results/${result._id}`
                            )
                          }
                          className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="divide-y divide-slate-200 md:hidden">
              {results.map((result) => (
                <div
                  key={result._id}
                  className="space-y-4 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-slate-900">
                        {formatName(result.student)}
                      </h3>

                      {result.student?.studentId && (
                        <p className="mt-0.5 text-xs text-slate-500">
                          {result.student.studentId}
                        </p>
                      )}
                    </div>

                    <StatusBadge status={result.status} />
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <InfoItem
                      label="Subject"
                      value={result.subject?.name || "—"}
                    />

                    <InfoItem
                      label="Class"
                      value={`${result.schoolClass?.name || "—"}${
                        result.schoolClass?.arm
                          ? ` ${result.schoolClass.arm}`
                          : ""
                      }`}
                    />

                    <InfoItem
                      label="Score"
                      value={formatScore(result)}
                    />

                    <InfoItem
                      label="Grade"
                      value={result.grade || "—"}
                    />

                    <InfoItem
                      label="Teacher"
                      value={formatName(result.enteredBy)}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        `/dashboard/school-admin/results/${result._id}`
                      )
                    }
                    className="w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
                  >
                    Review Result
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  icon: Icon,
  iconClass,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {value}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}
        >
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
        statusStyles[status] ||
        "bg-slate-100 text-slate-700"
      }`}
    >
      {statusLabels[status] || status || "Unknown"}
    </span>
  );
}

function TableHeader({ children }) {
  return (
    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-6">
      {children}
    </th>
  );
}

function InfoItem({ label, value }) {
  return (
    <div>
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-1 font-medium text-slate-700">
        {value}
      </p>
    </div>
  );
}