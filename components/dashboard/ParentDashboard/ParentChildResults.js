"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  Award,
  BookOpen,
  CalendarDays,
  ChevronDown,
  GraduationCap,
  Loader2,
  Trophy,
  TrendingUp,
} from "lucide-react";

import api from "@/lib/api";

const getFullName = (student) => {
  return [
    student?.firstName,
    student?.middleName,
    student?.lastName,
  ]
    .filter(Boolean)
    .join(" ");
};

const getScore = (value) => {
  const score = Number(value);

  return Number.isFinite(score) ? score : 0;
};

const getGradeClass = (grade) => {
  if (!grade) {
    return "bg-slate-100 text-slate-600";
  }

  const normalizedGrade = String(grade).toUpperCase();

  if (normalizedGrade.startsWith("A")) {
    return "bg-emerald-50 text-emerald-700";
  }

  if (normalizedGrade.startsWith("B")) {
    return "bg-blue-50 text-blue-700";
  }

  if (normalizedGrade.startsWith("C")) {
    return "bg-amber-50 text-amber-700";
  }

  if (
    normalizedGrade.startsWith("D") ||
    normalizedGrade.startsWith("E")
  ) {
    return "bg-orange-50 text-orange-700";
  }

  if (normalizedGrade.startsWith("F")) {
    return "bg-red-50 text-red-700";
  }

  return "bg-slate-100 text-slate-600";
};

export default function ParentChildResultsPage() {
  const { id } = useParams();

  const [results, setResults] = useState([]);
  const [student, setStudent] = useState(null);

  const [selectedSession, setSelectedSession] = useState("all");
  const [selectedTerm, setSelectedTerm] = useState("all");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    const fetchResults = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          `/parents/children/${id}/results`
        );


console.log("PARENT RESULTS RESPONSE:", response.data);
console.log(
  "FIRST RESULT:",
  response.data?.results?.[0]
);

        setStudent(response.data?.student || null);

        setResults(
          Array.isArray(response.data?.results)
            ? response.data.results
            : []
        );
      } catch (err) {
        console.error(
          "Failed to fetch child results:",
          err
        );

        setError(
          err.response?.data?.message ||
            "Failed to load this child's results."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [id]);

  

  const sessions = useMemo(() => {
    const map = new Map();

    results.forEach((result) => {
      const session = result.academicSession;

      if (!session?._id) return;

      if (!map.has(session._id)) {
        map.set(session._id, session);
      }
    });

    return Array.from(map.values()).sort((a, b) => {
      const aDate = new Date(
        a.startDate || 0
      ).getTime();

      const bDate = new Date(
        b.startDate || 0
      ).getTime();

      return bDate - aDate;
    });
  }, [results]);

  const terms = useMemo(() => {
    const map = new Map();

    results
      .filter((result) => {
        if (selectedSession === "all") {
          return true;
        }

        return (
          result.academicSession?._id ===
          selectedSession
        );
      })
      .forEach((result) => {
        const term = result.academicTerm;

        if (!term?._id) return;

        if (!map.has(term._id)) {
          map.set(term._id, term);
        }
      });

    return Array.from(map.values()).sort((a, b) => {
      const aDate = new Date(
        a.startDate || 0
      ).getTime();

      const bDate = new Date(
        b.startDate || 0
      ).getTime();

      return aDate - bDate;
    });
  }, [results, selectedSession]);

  const filteredResults = useMemo(() => {
    return results.filter((result) => {
      const matchesSession =
        selectedSession === "all" ||
        result.academicSession?._id ===
          selectedSession;

      const matchesTerm =
        selectedTerm === "all" ||
        result.academicTerm?._id === selectedTerm;

      return matchesSession && matchesTerm;
    });
  }, [results, selectedSession, selectedTerm]);

  const stats = useMemo(() => {
    if (!filteredResults.length) {
      return {
        totalSubjects: 0,
        average: 0,
        highest: 0,
        lowest: 0,
      };
    }

    const scores = filteredResults.map((result) =>
      getScore(result.total)
    );

    const totalScore = scores.reduce(
      (sum, score) => sum + score,
      0
    );

    const average =
      totalScore / scores.length;

    return {
      totalSubjects: filteredResults.length,
      average,
      highest: Math.max(...scores),
      lowest: Math.min(...scores),
    };
  }, [filteredResults]);

  useEffect(() => {
    if (
      selectedTerm !== "all" &&
      !terms.some(
        (term) => term._id === selectedTerm
      )
    ) {
      setSelectedTerm("all");
    }
  }, [terms, selectedTerm]);

  const currentSession =
    selectedSession !== "all"
      ? sessions.find(
          (session) =>
            session._id === selectedSession
        )
      : null;

  const currentTerm =
    selectedTerm !== "all"
      ? terms.find(
          (term) => term._id === selectedTerm
        )
      : null;

  const childName =
    getFullName(student) || "Student";

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-slate-500" />

          <p className="mt-3 text-sm text-slate-500">
            Loading {childName}'s results...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <div className="mx-auto max-w-7xl rounded-2xl border border-red-200 bg-red-50 p-6">
          <p className="text-sm font-medium text-red-700">
            {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <section className="overflow-hidden rounded-3xl bg-slate-900 p-6 text-white shadow-sm sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/10">
                  <GraduationCap className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-sm font-medium text-slate-300">
                    Parent Portal
                  </p>

                  <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                    Academic Results
                  </h1>
                </div>
              </div>

              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300">
                View {childName}'s published academic
                results and track performance across
                subjects, terms, and academic sessions.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/10">
                <Trophy className="h-8 w-8 text-white" />
              </div>

              <div>
                <p className="font-semibold">
                  {childName}
                </p>

                <p className="mt-1 text-sm text-slate-300">
                  {student?.studentId || "—"}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4">
            <h2 className="font-semibold text-slate-900">
              View Results
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Select an academic session and term to
              view your child's results.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FilterSelect
              label="Academic Session"
              icon={
                <CalendarDays className="h-4 w-4" />
              }
              value={selectedSession}
              onChange={(event) => {
                setSelectedSession(
                  event.target.value
                );
                setSelectedTerm("all");
              }}
            >
              <option value="all">
                All Sessions
              </option>

              {sessions.map((session) => (
                <option
                  key={session._id}
                  value={session._id}
                >
                  {session.name}
                </option>
              ))}
            </FilterSelect>

            <FilterSelect
              label="Academic Term"
              icon={
                <BookOpen className="h-4 w-4" />
              }
              value={selectedTerm}
              onChange={(event) =>
                setSelectedTerm(event.target.value)
              }
            >
              <option value="all">
                All Terms
              </option>

              {terms.map((term) => (
                <option
                  key={term._id}
                  value={term._id}
                >
                  {term.name}
                </option>
              ))}
            </FilterSelect>
          </div>
        </section>

        {/* Selected period */}
        {(currentSession || currentTerm) && (
          <section className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
              {currentSession && (
                <div>
                  <span className="text-slate-500">
                    Session:
                  </span>{" "}
                  <span className="font-semibold text-slate-900">
                    {currentSession.name}
                  </span>
                </div>
              )}

              {currentTerm && (
                <div>
                  <span className="text-slate-500">
                    Term:
                  </span>{" "}
                  <span className="font-semibold text-slate-900">
                    {currentTerm.name}
                  </span>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Summary */}
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <ResultMetric
            icon={
              <BookOpen className="h-5 w-5" />
            }
            label="Subjects"
            value={stats.totalSubjects}
          />

          <ResultMetric
            icon={
              <TrendingUp className="h-5 w-5" />
            }
            label="Average Score"
            value={`${stats.average.toFixed(1)}%`}
          />

          <ResultMetric
            icon={
              <Trophy className="h-5 w-5" />
            }
            label="Highest Score"
            value={`${stats.highest}%`}
          />

          <ResultMetric
            icon={
              <Award className="h-5 w-5" />
            }
            label="Lowest Score"
            value={`${stats.lowest}%`}
          />
        </section>

        {/* Results */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-5">
            <div>
              <h2 className="font-semibold text-slate-900">
                Subject Results
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                {filteredResults.length > 0
                  ? `${filteredResults.length} subject${
                      filteredResults.length === 1
                        ? ""
                        : "s"
                    }`
                  : "No results available"}
              </p>
            </div>
          </div>

          {filteredResults.length === 0 ? (
            <EmptyResults />
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[760px] text-left">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Subject
                      </th>

                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        CA
                      </th>

                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Exam
                      </th>

                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Total
                      </th>

                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Grade
                      </th>

                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Remark
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {filteredResults.map(
                      (result) => (
                        <tr
                          key={result._id}
                          className="transition hover:bg-slate-50"
                        >
                          <td className="px-5 py-4">
                            <p className="font-medium text-slate-900">
                              {result.subject?.name ||
                                "Unknown Subject"}
                            </p>

                            {result.subject?.code && (
                              <p className="mt-1 text-xs text-slate-500">
                                {result.subject.code}
                              </p>
                            )}
                          </td>

                          <td className="px-5 py-4 text-sm text-slate-600">
                            {result.caScore ?? "—"}
                          </td>

                          <td className="px-5 py-4 text-sm text-slate-600">
                            {result.examScore ?? "—"}
                          </td>

                          <td className="px-5 py-4">
                            <span className="font-semibold text-slate-900">
                              {result.total ?? "—"}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <GradeBadge
                              grade={result.grade}
                            />
                          </td>

                          <td className="max-w-xs px-5 py-4 text-sm text-slate-600">
                            {result.remark || "—"}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="divide-y divide-slate-100 md:hidden">
                {filteredResults.map((result) => (
                  <div
                    key={result._id}
                    className="p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900">
                          {result.subject?.name ||
                            "Unknown Subject"}
                        </p>

                        {result.subject?.code && (
                          <p className="mt-1 text-xs text-slate-500">
                            {result.subject.code}
                          </p>
                        )}
                      </div>

                      <GradeBadge
                        grade={result.grade}
                      />
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-2">
                      <ScoreItem
                        label="CA"
                        value={result.caScore}
                      />

                      <ScoreItem
                        label="Exam"
                        value={result.examScore}
                      />

                      <ScoreItem
                        label="Total"
                        value={result.total}
                        emphasis
                      />
                    </div>

                    <div className="mt-3 rounded-xl bg-slate-50 p-3">
                      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                        Remark
                      </p>

                      <p className="mt-1 text-sm text-slate-700">
                        {result.remark || "—"}
                      </p>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                      {result.academicSession?.name && (
                        <span>
                          Session:{" "}
                          {
                            result.academicSession.name
                          }
                        </span>
                      )}

                      {result.academicTerm?.name && (
                        <span>
                          Term:{" "}
                          {result.academicTerm.name}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>

        {/* Result information */}
        {filteredResults.length > 0 && (
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                <GraduationCap className="h-4 w-4" />
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Result Information
                </h3>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  These results have been published by
                  the school and are available for
                  viewing in the parent portal.
                </p>

                {currentSession && (
                  <p className="mt-2 text-xs text-slate-500">
                    Academic session:{" "}
                    <span className="font-medium text-slate-700">
                      {currentSession.name}
                    </span>
                  </p>
                )}

                {currentTerm && (
                  <p className="mt-1 text-xs text-slate-500">
                    Academic term:{" "}
                    <span className="font-medium text-slate-700">
                      {currentTerm.name}
                    </span>
                  </p>
                )}
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Filter Select                                                              */
/* -------------------------------------------------------------------------- */

function FilterSelect({
  label,
  icon,
  value,
  onChange,
  children,
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold text-slate-600">
        {label}
      </label>

      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
          {icon}
        </div>

        <select
          value={value}
          onChange={onChange}
          className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-10 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
        >
          {children}
        </select>

        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Result Metric                                                              */
/* -------------------------------------------------------------------------- */

function ResultMetric({
  icon,
  label,
  value,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
        {icon}
      </div>

      <p className="mt-4 text-sm font-medium text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-2xl font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Grade Badge                                                                */
/* -------------------------------------------------------------------------- */

function GradeBadge({ grade }) {
  if (!grade) {
    return (
      <span className="text-sm text-slate-500">
        —
      </span>
    );
  }

  return (
    <span
      className={`inline-flex min-w-10 items-center justify-center rounded-full px-3 py-1 text-xs font-bold ${getGradeClass(
        grade
      )}`}
    >
      {grade}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* Score Item                                                                 */
/* -------------------------------------------------------------------------- */

function ScoreItem({
  label,
  value,
  emphasis = false,
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p
        className={`mt-1 text-lg font-bold ${
          emphasis
            ? "text-slate-900"
            : "text-slate-700"
        }`}
      >
        {value ?? "—"}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Empty Results                                                              */
/* -------------------------------------------------------------------------- */

function EmptyResults() {
  return (
    <div className="flex flex-col items-center justify-center px-5 py-14 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        <Trophy className="h-7 w-7" />
      </div>

      <p className="mt-4 text-sm font-semibold text-slate-700">
        No published results
      </p>

      <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">
        Your child's results will appear here once
        the school publishes them.
      </p>
    </div>
  );
}