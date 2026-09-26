"use client";

import { useEffect, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  GraduationCap,
  Loader2,
  RefreshCw,
  Users,
  XCircle,
} from "lucide-react";

import api from "@/lib/api";

const getToday = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset();

  return new Date(now.getTime() - offset * 60000)
    .toISOString()
    .split("T")[0];
};

const getStatusStyles = (status) => {
  switch (status) {
    case "present":
      return "bg-emerald-100 text-emerald-700";

    case "absent":
      return "bg-red-100 text-red-700";

    case "late":
      return "bg-amber-100 text-amber-700";

    case "excused":
      return "bg-blue-100 text-blue-700";

    default:
      return "bg-slate-100 text-slate-600";
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case "present":
      return <CheckCircle2 size={14} />;

    case "absent":
      return <XCircle size={14} />;

    case "late":
      return <Clock3 size={14} />;

    default:
      return null;
  }
};

const formatStatus = (status) => {
  if (!status) return "Not recorded";

  return status.charAt(0).toUpperCase() + status.slice(1);
};

const formatDate = (date) => {
  if (!date) return "";

  return new Date(`${date}T00:00:00`).toLocaleDateString("en-NG", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export default function AttendancePage() {
  const [sessions, setSessions] = useState([]);
  const [terms, setTerms] = useState([]);
  const [classes, setClasses] = useState([]);

  const [selectedSession, setSelectedSession] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedDate, setSelectedDate] = useState(getToday());

  const [summary, setSummary] = useState(null);
  const [dailyAttendance, setDailyAttendance] = useState([]);

  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingFilters, setLoadingFilters] = useState(false);
  const [loadingAttendance, setLoadingAttendance] = useState(false);

  const [error, setError] = useState("");

  // ---------------------------------------------------------
  // Load academic sessions
  // ---------------------------------------------------------
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoadingSessions(true);
        setError("");

        const response = await api.get("/academic-sessions");

        const sessionList = response.data?.sessions || [];

        setSessions(sessionList);

        if (sessionList.length > 0) {
          const currentSession =
            sessionList.find(
              (session) => session.isCurrent && session.isActive
            ) ||
            sessionList.find((session) => session.isActive) ||
            sessionList[0];

          setSelectedSession(currentSession._id);
        }
      } catch (err) {
        console.error("Failed to load academic sessions:", err);

        setError(
          err.response?.data?.message ||
            "Unable to load academic sessions."
        );
      } finally {
        setLoadingSessions(false);
      }
    };

    fetchSessions();
  }, []);

  // ---------------------------------------------------------
  // Load terms and classes when session changes
  // ---------------------------------------------------------
  useEffect(() => {
    if (!selectedSession) return;

    const fetchFilters = async () => {
      try {
        setLoadingFilters(true);
        setError("");

        setTerms([]);
        setClasses([]);
        setSelectedTerm("");
        setSelectedClass("");
        setSummary(null);
        setDailyAttendance([]);

        const [termsResponse, classesResponse] = await Promise.all([
          api.get(`/academic-terms/session/${selectedSession}`),
          api.get(`/classes/session/${selectedSession}`),
        ]);

        const termList = termsResponse.data?.terms || [];
        const classList = classesResponse.data?.classes || [];

        setTerms(termList);
        setClasses(classList);

        if (termList.length > 0) {
          const currentTerm =
            termList.find(
              (term) => term.isCurrent && term.isActive
            ) ||
            termList.find((term) => term.isActive) ||
            termList[0];

          setSelectedTerm(currentTerm._id);
        }

        if (classList.length > 0) {
          setSelectedClass(classList[0]._id);
        }
      } catch (err) {
        console.error("Failed to load attendance filters:", err);

        setError(
          err.response?.data?.message ||
            "Unable to load academic terms and classes."
        );
      } finally {
        setLoadingFilters(false);
      }
    };

    fetchFilters();
  }, [selectedSession]);

  // ---------------------------------------------------------
  // Load attendance
  // ---------------------------------------------------------
  useEffect(() => {
    if (!selectedClass || !selectedTerm || !selectedDate) {
      return;
    }

    const fetchAttendance = async () => {
      try {
        setLoadingAttendance(true);
        setError("");

        const [summaryResponse, dailyResponse] = await Promise.all([
          api.get("/attendance/class/summary", {
            params: {
              classId: selectedClass,
              term: selectedTerm,
            },
          }),

          api.get("/attendance/class", {
            params: {
              classId: selectedClass,
              date: selectedDate,
              term: selectedTerm,
            },
          }),
        ]);

        setSummary(summaryResponse.data || null);
        setDailyAttendance(dailyResponse.data?.attendance || []);
      } catch (err) {
        console.error("Failed to load attendance:", err);

        setSummary(null);
        setDailyAttendance([]);

        setError(
          err.response?.data?.message ||
            "Unable to load attendance records."
        );
      } finally {
        setLoadingAttendance(false);
      }
    };

    fetchAttendance();
  }, [selectedClass, selectedTerm, selectedDate]);

  // ---------------------------------------------------------
  // Refresh
  // ---------------------------------------------------------
  const handleRefresh = async () => {
    if (!selectedClass || !selectedTerm || !selectedDate) return;

    try {
      setLoadingAttendance(true);
      setError("");

      const [summaryResponse, dailyResponse] = await Promise.all([
        api.get("/attendance/class/summary", {
          params: {
            classId: selectedClass,
            term: selectedTerm,
          },
        }),

        api.get("/attendance/class", {
          params: {
            classId: selectedClass,
            date: selectedDate,
            term: selectedTerm,
          },
        }),
      ]);

      setSummary(summaryResponse.data || null);
      setDailyAttendance(dailyResponse.data?.attendance || []);
    } catch (err) {
      console.error("Failed to refresh attendance:", err);

      setError(
        err.response?.data?.message ||
          "Unable to refresh attendance records."
      );
    } finally {
      setLoadingAttendance(false);
    }
  };

  // ---------------------------------------------------------
  // Derived values
  // ---------------------------------------------------------
  const summaryStudents = summary?.students || [];

  const totalPresent = summaryStudents.reduce(
    (total, item) => total + (item.attendance?.present || 0),
    0
  );

  const totalAbsent = summaryStudents.reduce(
    (total, item) => total + (item.attendance?.absent || 0),
    0
  );

  const totalLate = summaryStudents.reduce(
    (total, item) => total + (item.attendance?.late || 0),
    0
  );

  const totalExcused = summaryStudents.reduce(
    (total, item) => total + (item.attendance?.excused || 0),
    0
  );

  const totalAttendanceRecords =
    totalPresent + totalAbsent + totalLate + totalExcused;

  const overallAttendanceRate =
    totalAttendanceRecords > 0
      ? Math.round(
          ((totalPresent + totalLate) / totalAttendanceRecords) * 100
        )
      : 0;

  const selectedClassData = classes.find(
    (schoolClass) => schoolClass._id === selectedClass
  );

  const selectedTermData = terms.find(
    (term) => term._id === selectedTerm
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
              <CalendarDays size={22} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Attendance
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                View and review student attendance records.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={
            loadingAttendance ||
            !selectedClass ||
            !selectedTerm ||
            !selectedDate
          }
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={loadingAttendance ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-slate-900">
            Attendance Filters
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Select an academic period, class, and date to review attendance.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {/* Academic Session */}
          <div>
            <label
              htmlFor="academicSession"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Academic Session
            </label>

            <select
              id="academicSession"
              value={selectedSession}
              onChange={(e) => setSelectedSession(e.target.value)}
              disabled={loadingSessions || loadingFilters}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-50"
            >
              <option value="">
                {loadingSessions
                  ? "Loading sessions..."
                  : "Select session"}
              </option>

              {sessions.map((session) => (
                <option key={session._id} value={session._id}>
                  {session.name}
                  {session.isCurrent ? " — Current" : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Academic Term */}
          <div>
            <label
              htmlFor="academicTerm"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Academic Term
            </label>

            <select
              id="academicTerm"
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
              disabled={
                loadingFilters ||
                !selectedSession ||
                terms.length === 0
              }
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-50"
            >
              <option value="">
                {loadingFilters
                  ? "Loading terms..."
                  : "Select term"}
              </option>

              {terms.map((term) => (
                <option key={term._id} value={term._id}>
                  {term.name}
                  {term.isCurrent ? " — Current" : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Class */}
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
              onChange={(e) => setSelectedClass(e.target.value)}
              disabled={
                loadingFilters ||
                !selectedSession ||
                classes.length === 0
              }
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-50"
            >
              <option value="">
                {loadingFilters
                  ? "Loading classes..."
                  : "Select class"}
              </option>

              {classes.map((schoolClass) => (
                <option key={schoolClass._id} value={schoolClass._id}>
                  {schoolClass.name}
                  {schoolClass.arm ? ` ${schoolClass.arm}` : ""}
                  {schoolClass.section
                    ? ` — ${schoolClass.section}`
                    : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label
              htmlFor="attendanceDate"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Attendance Date
            </label>

            <input
              id="attendanceDate"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>
        </div>
      </div>

      {/* Selected context */}
      {selectedClassData && selectedTermData && (
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-800">
                {selectedClassData.name}
                {selectedClassData.arm
                  ? ` ${selectedClassData.arm}`
                  : ""}
                {selectedClassData.section
                  ? ` — ${selectedClassData.section}`
                  : ""}
              </p>

              <p className="mt-1 text-xs text-emerald-700">
                {selectedTermData.name}
                {selectedDate && ` • ${formatDate(selectedDate)}`}
              </p>
            </div>

            {selectedClassData.classTeacher && (
              <div className="text-sm text-emerald-700">
                Class Teacher:{" "}
                <span className="font-medium">
                  {selectedClassData.classTeacher.firstName}{" "}
                  {selectedClassData.classTeacher.lastName}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Loading */}
      {loadingAttendance && (
        <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white py-16 shadow-sm">
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <Loader2
              size={20}
              className="animate-spin text-emerald-600"
            />
            Loading attendance records...
          </div>
        </div>
      )}

      {/* Attendance overview */}
      {!loadingAttendance && summary && (
        <>
          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">
                    Students
                  </p>

                  <p className="mt-2 text-2xl font-bold text-slate-900">
                    {summary.totalStudents || 0}
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                  <Users size={20} />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">
                    Present Records
                  </p>

                  <p className="mt-2 text-2xl font-bold text-emerald-600">
                    {totalPresent}
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                  <CheckCircle2 size={20} />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">
                    Absent Records
                  </p>

                  <p className="mt-2 text-2xl font-bold text-red-600">
                    {totalAbsent}
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-600">
                  <XCircle size={20} />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">
                    Late Records
                  </p>

                  <p className="mt-2 text-2xl font-bold text-amber-600">
                    {totalLate}
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                  <Clock3 size={20} />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">
                    Attendance Rate
                  </p>

                  <p className="mt-2 text-2xl font-bold text-emerald-600">
                    {overallAttendanceRate}%
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                  <GraduationCap size={20} />
                </div>
              </div>
            </div>
          </div>

          {/* Term summary */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-5 sm:p-6">
              <h2 className="text-lg font-semibold text-slate-900">
                Term Attendance Summary
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Student attendance performance for the selected term.
              </p>
            </div>

            {summaryStudents.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <Users
                  size={32}
                  className="mx-auto text-slate-300"
                />

                <p className="mt-3 text-sm font-medium text-slate-700">
                  No students found
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  There are no active students in this class.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px]">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-left">
                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Student
                      </th>

                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Student ID
                      </th>

                      <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Present
                      </th>

                      <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Absent
                      </th>

                      <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Late
                      </th>

                      <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Excused
                      </th>

                      <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Attendance
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {summaryStudents.map((item) => {
                      const student = item.student;
                      const attendance = item.attendance || {};

                      return (
                        <tr
                          key={student.id}
                          className="transition hover:bg-slate-50"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-700">
                                {student.firstName?.charAt(0)}
                                {student.lastName?.charAt(0)}
                              </div>

                              <div>
                                <p className="text-sm font-medium text-slate-900">
                                  {student.firstName}{" "}
                                  {student.middleName
                                    ? `${student.middleName} `
                                    : ""}
                                  {student.lastName}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-4 text-sm text-slate-600">
                            {student.studentId || "—"}
                          </td>

                          <td className="px-5 py-4 text-center text-sm font-medium text-emerald-600">
                            {attendance.present || 0}
                          </td>

                          <td className="px-5 py-4 text-center text-sm font-medium text-red-600">
                            {attendance.absent || 0}
                          </td>

                          <td className="px-5 py-4 text-center text-sm font-medium text-amber-600">
                            {attendance.late || 0}
                          </td>

                          <td className="px-5 py-4 text-center text-sm font-medium text-blue-600">
                            {attendance.excused || 0}
                          </td>

                          <td className="px-5 py-4 text-right">
                            <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                              {Math.round(
                                attendance.attendancePercentage || 0
                              )}
                              %
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Daily attendance */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-5 sm:p-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Daily Attendance
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Attendance records for {formatDate(selectedDate)}.
                  </p>
                </div>

                <span className="inline-flex w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                  {dailyAttendance.length} record
                  {dailyAttendance.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>

            {dailyAttendance.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <CalendarDays
                  size={32}
                  className="mx-auto text-slate-300"
                />

                <p className="mt-3 text-sm font-medium text-slate-700">
                  No attendance marked
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  No attendance records were found for this date.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px]">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-left">
                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Student
                      </th>

                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Student ID
                      </th>

                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Status
                      </th>

                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Remarks
                      </th>

                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Marked By
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {dailyAttendance.map((record) => (
                      <tr
                        key={record._id}
                        className="transition hover:bg-slate-50"
                      >
                        <td className="px-5 py-4">
                          <p className="text-sm font-medium text-slate-900">
                            {record.student?.firstName}{" "}
                            {record.student?.lastName}
                          </p>
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-600">
                          {record.student?.studentId || "—"}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyles(
                              record.status
                            )}`}
                          >
                            {getStatusIcon(record.status)}
                            {formatStatus(record.status)}
                          </span>
                        </td>

                        <td className="max-w-xs px-5 py-4 text-sm text-slate-600">
                          {record.remarks || "—"}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-600">
                          {record.markedBy
                            ? `${record.markedBy.firstName || ""} ${
                                record.markedBy.lastName || ""
                              }`.trim()
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Empty state before filters are ready */}
      {!loadingSessions &&
        !loadingFilters &&
        !loadingAttendance &&
        (!selectedSession ||
          !selectedTerm ||
          !selectedClass) && (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
            <CalendarDays
              size={36}
              className="mx-auto text-slate-300"
            />

            <h2 className="mt-4 text-lg font-semibold text-slate-900">
              Attendance records
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              Select an academic session, term, and class to view
              attendance records.
            </p>
          </div>
        )}
    </div>
  );
}