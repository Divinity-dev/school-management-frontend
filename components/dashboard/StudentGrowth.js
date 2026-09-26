"use client";

import { useEffect, useState } from "react";

import { TrendingUp } from "lucide-react";

import api from "@/lib/api";

export default function StudentGrowth() {
  const [growthData, setGrowthData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sessionName, setSessionName] = useState("");

  useEffect(() => {
    const fetchStudentGrowth = async () => {
      try {
        setLoading(true);
        setError("");

        const termsResponse = await api.get("/academic-terms");
        const terms = termsResponse.data?.terms || [];

        const currentTerm =
          terms.find((term) => term.isCurrent) || null;

        if (!currentTerm?.academicSession) {
          setGrowthData([]);
          return;
        }

        const sessionId =
          typeof currentTerm.academicSession === "object"
            ? currentTerm.academicSession._id
            : currentTerm.academicSession;

        const response = await api.get(
          `/students/growth?academicSession=${sessionId}`
        );

        setGrowthData(response.data?.growth || []);

        setSessionName(
          response.data?.academicSession?.name || ""
        );
      } catch (error) {
        console.error(
          "Failed to fetch student growth:",
          error
        );

        setError(
          error?.response?.data?.message ||
            "Unable to load student growth."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStudentGrowth();
  }, []);

  const maxStudents = Math.max(
    ...growthData.map((item) => item.students),
    1
  );

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      {/* Header */}
      <div className="shrink-0">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Student Growth
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Enrollment growth
              {sessionName ? ` for ${sessionName}` : ""}
            </p>
          </div>

          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50">
            <TrendingUp
              size={16}
              className="text-emerald-500"
            />
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-600">
            {error}
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="mt-6 min-h-0 flex-1">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-xs text-slate-400">
              Loading student growth...
            </p>
          </div>
        ) : growthData.length === 0 ? (
          <div className="flex h-full items-center justify-center text-center">
            <div>
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-50">
                <TrendingUp
                  size={18}
                  className="text-slate-300"
                />
              </div>

              <p className="mt-3 text-sm font-medium text-slate-600">
                No enrollment data yet
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Student growth will appear here as students are
                registered.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex h-full items-stretch justify-between gap-2 sm:gap-3">
            {growthData.map((item) => (
              <div
                key={item.month}
                className="flex min-w-0 flex-1 flex-col items-center"
              >
                {/* Count */}
                <span className="mb-3 shrink-0 text-xs font-semibold text-slate-600">
                  {item.students}
                </span>

                {/* Bar */}
                <div className="flex min-h-0 w-full flex-1 items-end justify-center">
                  <div className="h-full w-full max-w-12 overflow-hidden rounded-xl bg-slate-100">
                    <div
                      className="w-full rounded-xl bg-emerald-400 transition-all duration-500"
                      style={{
                        height: `${Math.max(
                          (item.students / maxStudents) * 100,
                          item.students > 0 ? 3 : 0
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Month */}
                <span className="mt-3 shrink-0 text-xs font-medium text-slate-400">
                  {item.month}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="mt-6 shrink-0 border-t border-slate-100 pt-5">
        <div className="text-center">
          <p className="text-xl font-bold text-slate-900">
            {loading
              ? "—"
              : growthData.length > 0
              ? growthData[growthData.length - 1].students
              : 0}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Total enrolled
          </p>
        </div>
      </div>
    </div>
  );
}