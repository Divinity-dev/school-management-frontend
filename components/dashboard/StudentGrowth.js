"use client";

import { useEffect, useState } from "react";
import { TrendingUp } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import api from "@/lib/api";

export default function StudentGrowth() {
  const [growthData, setGrowthData] = useState([]);
  const [totalStudents, setTotalStudents] = useState(0);
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
          setTotalStudents(0);
          setSessionName("");
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
        setTotalStudents(response.data?.totalStudents || 0);

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
              New student registrations
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
      <div className="mt-5 min-h-0 flex-1">
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
                Student registrations will appear here.
              </p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={growthData}
              margin={{
                top: 10,
                right: 10,
                left: -20,
                bottom: 0,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#e2e8f0"
              />

              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{
                  fontSize: 11,
                  fill: "#94a3b8",
                }}
                dy={8}
              />

              <YAxis
                allowDecimals={false}
                domain={[0, "auto"]}
                axisLine={false}
                tickLine={false}
                tick={{
                  fontSize: 11,
                  fill: "#94a3b8",
                }}
                width={30}
              />

              <Tooltip
                cursor={{
                  stroke: "#cbd5e1",
                  strokeDasharray: "4 4",
                }}
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  boxShadow:
                    "0 8px 24px rgba(15, 23, 42, 0.08)",
                  fontSize: "12px",
                }}
                labelStyle={{
                  color: "#475569",
                  fontWeight: 600,
                  marginBottom: "4px",
                }}
                formatter={(value) => [
                  `${value} ${
                    Number(value) === 1
                      ? "student"
                      : "students"
                  }`,
                  "Registered",
                ]}
              />

              <Line
                type="monotone"
                dataKey="students"
                stroke="#10b981"
                strokeWidth={3}
                dot={{
                  r: 4,
                  fill: "#10b981",
                  strokeWidth: 2,
                  stroke: "#ffffff",
                }}
                activeDot={{
                  r: 6,
                  strokeWidth: 2,
                  stroke: "#ffffff",
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Total */}
      <div className="mt-5 shrink-0 border-t border-slate-100 pt-4">
        <div className="text-center">
          <p className="text-xl font-bold text-slate-900">
            {loading ? "—" : totalStudents}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Total enrolled
          </p>
        </div>
      </div>
    </div>
  );
}

