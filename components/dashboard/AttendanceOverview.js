"use client";

import { useEffect, useState } from "react";

import {
  CheckCircle2,
  Clock3,
  XCircle,
} from "lucide-react";

import api from "@/lib/api";

const getMonday = () => {
  const date = new Date();
  const day = date.getDay();

  const difference = day === 0 ? -6 : 1 - day;

  date.setDate(date.getDate() + difference);
  date.setHours(0, 0, 0, 0);

  return date;
};

const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getWeekdays = () => {
  const monday = getMonday();

  return Array.from({ length: 5 }, (_, index) => {
    const date = new Date(monday);

    date.setDate(monday.getDate() + index);

    return {
      day: date.toLocaleDateString("en-US", {
        weekday: "short",
      }),
      date,
      dateString: formatDate(date),
    };
  });
};

export default function AttendanceOverview() {
  const [attendanceData, setAttendanceData] = useState([]);
  const [summary, setSummary] = useState({
    present: 0,
    late: 0,
    absent: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true);
        setError("");

        const [classesResponse, termsResponse] =
          await Promise.all([
            api.get("/classes"),
            api.get("/academic-terms"),
          ]);

        const classes =
          classesResponse.data?.classes || [];

        const terms =
          termsResponse.data?.terms || [];

        const currentTerm =
          terms.find((term) => term.isCurrent) || null;

        if (!currentTerm || classes.length === 0) {
          setAttendanceData(
            getWeekdays().map((item) => ({
              ...item,
              percentage: 0,
            }))
          );

          setSummary({
            present: 0,
            late: 0,
            absent: 0,
          });

          return;
        }

        const weekdays = getWeekdays();

        const dailyResults = await Promise.all(
          weekdays.map(async (day) => {
            const classResults = await Promise.all(
              classes.map(async (schoolClass) => {
                try {
                  const response = await api.get(
                    `/attendance/class?classId=${schoolClass._id}&date=${day.dateString}&term=${currentTerm._id}`
                  );

                  return (
                    response.data?.attendance || []
                  );
                } catch (error) {
                  console.error(
                    `Failed to fetch attendance for ${schoolClass.name} on ${day.dateString}:`,
                    error
                  );

                  return [];
                }
              })
            );

            const records = classResults.flat();

            const attended = records.filter(
              (record) =>
                record.status === "present" ||
                record.status === "late"
            ).length;

            const percentage =
              records.length > 0
                ? Math.round(
                    (attended / records.length) * 100
                  )
                : 0;

            return {
              ...day,
              percentage,
              records,
            };
          })
        );

        const allRecords = dailyResults.flatMap(
          (day) => day.records
        );

        const present = allRecords.filter(
          (record) => record.status === "present"
        ).length;

        const late = allRecords.filter(
          (record) => record.status === "late"
        ).length;

        const absent = allRecords.filter(
          (record) => record.status === "absent"
        ).length;

        const total = present + late + absent;

        setAttendanceData(dailyResults);

        setSummary({
          present:
            total > 0
              ? Math.round((present / total) * 100)
              : 0,

          late:
            total > 0
              ? Math.round((late / total) * 100)
              : 0,

          absent:
            total > 0
              ? Math.round((absent / total) * 100)
              : 0,
        });
      } catch (error) {
        console.error(
          "Failed to fetch attendance overview:",
          error
        );

        setError(
          error?.response?.data?.message ||
            "Unable to load attendance data."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, []);

  const chartData =
    attendanceData.length > 0
      ? attendanceData
      : getWeekdays().map((item) => ({
          ...item,
          percentage: 0,
        }));

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      {/* Header */}
      <div className="shrink-0">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Attendance Overview
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              School attendance for this week
            </p>
          </div>

          <div className="flex items-center gap-2 text-[11px]">
            <div className="flex items-center gap-1 text-slate-500">
              <CheckCircle2
                size={13}
                className="text-emerald-500"
              />
              Present
            </div>

            <div className="flex items-center gap-1 text-slate-500">
              <Clock3
                size={13}
                className="text-amber-500"
              />
              Late
            </div>

            <div className="flex items-center gap-1 text-slate-500">
              <XCircle
                size={13}
                className="text-red-400"
              />
              Absent
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-3 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-600">
            {error}
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="mt-4 min-h-0 flex-1">
        <div className="flex h-full items-stretch justify-between gap-3">
          {chartData.map((item) => (
            <div
              key={item.day}
              className="flex min-w-0 flex-1 flex-col items-center"
            >
              {/* Percentage */}
              <span className="mb-2 shrink-0 text-xs font-semibold text-slate-600">
                {loading
                  ? "—"
                  : `${item.percentage}%`}
              </span>

              {/* Bar */}
              <div className="flex min-h-0 w-full flex-1 items-end justify-center">
                <div className="h-full w-full max-w-10 overflow-hidden rounded-lg bg-slate-100">
                  <div
                    className="w-full rounded-lg bg-emerald-400 transition-all duration-500"
                    style={{
                      height: loading
                        ? "0%"
                        : `${item.percentage}%`,
                    }}
                  />
                </div>
              </div>

              {/* Day */}
              <span className="mt-2 shrink-0 text-[11px] font-medium text-slate-400">
                {item.day}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="mt-4 shrink-0 grid grid-cols-3 divide-x divide-slate-100 border-t border-slate-100 pt-3">
        <div className="text-center">
          <p className="text-lg font-bold text-slate-900">
            {loading
              ? "—"
              : `${summary.present}%`}
          </p>

          <p className="mt-0.5 text-[11px] text-slate-400">
            Present
          </p>
        </div>

        <div className="text-center">
          <p className="text-lg font-bold text-slate-900">
            {loading
              ? "—"
              : `${summary.late}%`}
          </p>

          <p className="mt-0.5 text-[11px] text-slate-400">
            Late
          </p>
        </div>

        <div className="text-center">
          <p className="text-lg font-bold text-slate-900">
            {loading
              ? "—"
              : `${summary.absent}%`}
          </p>

          <p className="mt-0.5 text-[11px] text-slate-400">
            Absent
          </p>
        </div>
      </div>
    </div>
  );
}

