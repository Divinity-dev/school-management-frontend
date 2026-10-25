"use client";

import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import {
  AlertCircle,
  BookOpen,
  CalendarDays,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  Loader2,
  Save,
  UserCheck,
  UserX,
  Users,
  X,
} from "lucide-react";

import api from "@/lib/api";

const getToday = () => {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const STATUS_OPTIONS = [
  { value: "present", label: "Present" },
  { value: "absent", label: "Absent" },
  { value: "late", label: "Late" },
  { value: "excused", label: "Excused" },
];

const getAttendanceErrorMessage = (err) => {
  const code = err.response?.data?.code;
  const message = err.response?.data?.message;
  const status = err.response?.status;

  if (code === "STUDENT_SEAT_LIMIT_EXCEEDED") {
    return (
      message ||
      "This student is outside your school's purchased student-seat allowance. " +
        "The school administrator must purchase additional seats or deactivate an eligible student."
    );
  }

  if (code === "STUDENT_SEAT_LIMIT_UNAVAILABLE") {
    return (
      message ||
      "The student's paid-seat eligibility could not be verified. " +
        "Please check the school's active subscription and try again."
    );
  }

  if (status === 403) {
    return (
      message ||
      "You are not authorized to perform this attendance action."
    );
  }

  if (status === 401) {
    return "Your session may have expired. Please sign in again.";
  }

  return (
    message ||
    err.message ||
    "An unexpected attendance error occurred. Please try again."
  );
};

const getStudentName = (student) =>
  [
    student.firstName,
    student.middleName,
    student.lastName,
  ]
    .filter(Boolean)
    .join(" ");

const getClassName = (schoolClass) =>
  [schoolClass.name, schoolClass.arm]
    .filter(Boolean)
    .join(" ");

const getTermList = (responseData) => {
  if (Array.isArray(responseData)) {
    return responseData;
  }

  if (Array.isArray(responseData?.terms)) {
    return responseData.terms;
  }

  if (Array.isArray(responseData?.academicTerms)) {
    return responseData.academicTerms;
  }

  if (Array.isArray(responseData?.data)) {
    return responseData.data;
  }

  return [];
};

const getInitialAttendance = (students) => {
  const initialAttendance = {};

  students.forEach((student) => {
    initialAttendance[student._id] = {
      status: "present",
      remarks: "",
      attendanceId: null,
      existing: false,
    };
  });

  return initialAttendance;
};

export default function TeacherAttendancePage() {
  const { user } = useSelector((state) => state.auth);

  const [sessions, setSessions] = useState([]);
  const [terms, setTerms] = useState([]);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);

  const [selectedSession, setSelectedSession] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedDate, setSelectedDate] = useState(getToday());

  const [attendance, setAttendance] = useState({});

  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingTerms, setLoadingTerms] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingAttendance, setLoadingAttendance] = useState(false);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /*
   * Load academic sessions.
   */
  useEffect(() => {
    let cancelled = false;

    const loadSessions = async () => {
      try {
        setLoadingSessions(true);
        setError("");

        const response = await api.get("/academic-sessions");

        const sessionList = response.data?.sessions || [];

        if (cancelled) return;

        setSessions(sessionList);

        const currentSession = sessionList.find(
          (session) => session.isCurrent && session.isActive
        );

        const activeSession = sessionList.find(
          (session) => session.isActive
        );

        const sessionToSelect =
          currentSession || activeSession || sessionList[0];

        setSelectedSession(sessionToSelect?._id || "");
      } catch (err) {
        if (cancelled) return;

        setError(
          err.response?.data?.message ||
            "Failed to load academic sessions."
        );
      } finally {
        if (!cancelled) {
          setLoadingSessions(false);
        }
      }
    };

    loadSessions();

    return () => {
      cancelled = true;
    };
  }, []);

  /*
   * Load academic terms whenever the selected session changes.
   *
   * The endpoint follows the routes you shared:
   * GET /academic-terms/session/:sessionId
   */
  useEffect(() => {
    let cancelled = false;

    const loadTerms = async () => {
      if (!selectedSession) {
        setTerms([]);
        setSelectedTerm("");
        setLoadingTerms(false);
        return;
      }

      setTerms([]);
      setSelectedTerm("");
      setLoadingTerms(true);
      setError("");
      setSuccess("");

      try {
        const response = await api.get(
          `/academic-terms/session/${selectedSession}`
        );

        const termList = getTermList(response.data);

        if (cancelled) return;

        setTerms(termList);

        const activeTerms = termList.filter(
          (term) => term.isActive !== false
        );

        const currentTerm = activeTerms.find(
          (term) => term.isCurrent === true
        );

        const termToSelect = currentTerm || activeTerms[0];

        setSelectedTerm(termToSelect?._id || "");

        if (termList.length === 0) {
          setError(
            "No academic terms were found for the selected session."
          );
        }
      } catch (err) {
        if (cancelled) return;

        setTerms([]);
        setSelectedTerm("");

        setError(
          err.response?.data?.message ||
            "Failed to load academic terms."
        );
      } finally {
        if (!cancelled) {
          setLoadingTerms(false);
        }
      }
    };

    loadTerms();

    return () => {
      cancelled = true;
    };
  }, [selectedSession]);

  /*
   * Load classes assigned to the logged-in teacher.
   */
  useEffect(() => {
    let cancelled = false;

    const loadClasses = async () => {
      const teacherId = user?._id || user?.id;

      if (!selectedSession || !teacherId) {
        setClasses([]);
        setSelectedClass("");
        setLoadingClasses(false);
        return;
      }

      setClasses([]);
      setSelectedClass("");
      setLoadingClasses(true);

      try {
        const response = await api.get(
          `/classes/session/${selectedSession}`
        );

        const allClasses = response.data?.classes || [];

        const teacherClasses = allClasses.filter((schoolClass) => {
          const classTeacherId =
            typeof schoolClass.classTeacher === "object"
              ? schoolClass.classTeacher?._id
              : schoolClass.classTeacher;

          return (
            String(classTeacherId || "") === String(teacherId)
          );
        });

        if (cancelled) return;

        setClasses(teacherClasses);
        setSelectedClass(teacherClasses[0]?._id || "");

        if (teacherClasses.length === 0) {
          setError(
            "No classes are currently assigned to you for this academic session."
          );
        }
      } catch (err) {
        if (cancelled) return;

        setClasses([]);
        setSelectedClass("");

        setError(
          err.response?.data?.message ||
            "Failed to load your assigned classes."
        );
      } finally {
        if (!cancelled) {
          setLoadingClasses(false);
        }
      }
    };

    loadClasses();

    return () => {
      cancelled = true;
    };
  }, [selectedSession, user?._id, user?.id]);

  /*
   * Load students whenever the selected class changes.
   */
  useEffect(() => {
    let cancelled = false;

    const loadStudents = async () => {
      if (!selectedClass) {
        setStudents([]);
        setAttendance({});
        setLoadingStudents(false);
        return;
      }

      setLoadingStudents(true);
      setError("");
      setSuccess("");

      try {
        const response = await api.get(
          `/students/class/${selectedClass}`
        );

        const studentList = response.data?.students || [];

        if (cancelled) return;

        setStudents(studentList);
        setAttendance(getInitialAttendance(studentList));
      } catch (err) {
        if (cancelled) return;

        setStudents([]);
        setAttendance({});

        setError(
          err.response?.data?.message ||
            "Failed to load students for this class."
        );
      } finally {
        if (!cancelled) {
          setLoadingStudents(false);
        }
      }
    };

    loadStudents();

    return () => {
      cancelled = true;
    };
  }, [selectedClass]);

  /*
   * Load existing attendance for the selected class, term and date.
   */
  useEffect(() => {
    let cancelled = false;

    const loadExistingAttendance = async () => {
      if (!selectedClass || !selectedTerm || !selectedDate) {
        setLoadingAttendance(false);
        return;
      }

      setLoadingAttendance(true);
      setError("");
      setSuccess("");

      try {
        const response = await api.get("/attendance/class", {
          params: {
            classId: selectedClass,
            date: selectedDate,
            term: selectedTerm,
          },
        });

        const existingRecords = response.data?.attendance || [];

        if (cancelled) return;

        setAttendance((current) => {
          const updated = {
            ...getInitialAttendance(students),
          };

          existingRecords.forEach((record) => {
            const studentId =
              typeof record.student === "object"
                ? record.student?._id
                : record.student;

            if (!studentId) return;

            updated[studentId] = {
              status: record.status || "present",
              remarks: record.remarks || "",
              attendanceId: record._id,
              existing: true,
            };
          });

          return updated;
        });
      } catch (err) {
        if (cancelled) return;

       setError(
  `Failed to load existing attendance. ${getAttendanceErrorMessage(err)}`
);
      } finally {
        if (!cancelled) {
          setLoadingAttendance(false);
        }
      }
    };

    loadExistingAttendance();

    return () => {
      cancelled = true;
    };
  }, [selectedClass, selectedTerm, selectedDate, students]);

  /*
   * Update one student's attendance status.
   */
  const updateStudentStatus = (studentId, status) => {
    setAttendance((current) => ({
      ...current,
      [studentId]: {
        ...current[studentId],
        status,
      },
    }));

    setSuccess("");
  };

  /*
   * Update a student's remarks.
   */
  const updateStudentRemarks = (studentId, remarks) => {
    setAttendance((current) => ({
      ...current,
      [studentId]: {
        ...current[studentId],
        remarks,
      },
    }));

    setSuccess("");
  };

  /*
   * Mark all students present.
   */
  const markAllPresent = () => {
    setAttendance((current) => {
      const updated = { ...current };

      students.forEach((student) => {
        updated[student._id] = {
          ...updated[student._id],
          status: "present",
        };
      });

      return updated;
    });

    setSuccess("");
  };

  /*
   * Reset only new, unsaved attendance records.
   */
  const resetNewRecords = () => {
    setAttendance((current) => {
      const updated = { ...current };

      students.forEach((student) => {
        const record = updated[student._id];

        if (!record?.existing) {
          updated[student._id] = {
            ...record,
            status: "present",
            remarks: "",
          };
        }
      });

      return updated;
    });

    setSuccess("");
  };

  /*
   * Save attendance.
   *
   * Existing records are updated with PATCH.
   * New records are created with POST.
   */
  const handleSaveAttendance = async () => {
    if (!selectedSession) {
      setError("Please select an academic session.");
      return;
    }

    if (!selectedTerm) {
      setError("Please select an academic term.");
      return;
    }

    if (!selectedClass) {
      setError("Please select a class.");
      return;
    }

    if (!selectedDate) {
      setError("Please select an attendance date.");
      return;
    }

    if (students.length === 0) {
      setError("There are no students in this class.");
      return;
    }

    const selectedSchoolClass = classes.find(
      (schoolClass) => schoolClass._id === selectedClass
    );

    if (!selectedSchoolClass) {
      setError("The selected class could not be found.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      for (const student of students) {
        const record = attendance[student._id];

        if (!record) continue;

        const payload = {
          school:
            typeof selectedSchoolClass.school === "object"
              ? selectedSchoolClass.school?._id
              : selectedSchoolClass.school,
          academicSession: selectedSession,
          term: selectedTerm,
          class: selectedClass,
          student: student._id,
          date: selectedDate,
          status: record.status,
          remarks: record.remarks || "",
        };

        if (record.existing && record.attendanceId) {
          await api.patch(
            `/attendance/${record.attendanceId}`,
            {
              status: record.status,
              remarks: record.remarks || "",
            }
          );
        } else {
          const response = await api.post(
            "/attendance",
            payload
          );

          const createdAttendance = response.data?.attendance;

          setAttendance((current) => ({
            ...current,
            [student._id]: {
              ...current[student._id],
              attendanceId: createdAttendance?._id || null,
              existing: true,
            },
          }));
        }
      }

      setSuccess("Attendance has been saved successfully.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to save attendance."
      );
    } finally {
      setSaving(false);
    }
  };

  /*
   * Attendance statistics.
   */
  const stats = useMemo(() => {
    const result = {
      present: 0,
      absent: 0,
      late: 0,
      excused: 0,
      total: students.length,
    };

    students.forEach((student) => {
      const status =
        attendance[student._id]?.status || "present";

      if (result[status] !== undefined) {
        result[status] += 1;
      }
    });

    return result;
  }, [students, attendance]);

  const selectedClassData = classes.find(
    (schoolClass) => schoolClass._id === selectedClass
  );

  const selectedSessionData = sessions.find(
    (session) => session._id === selectedSession
  );

  const selectedTermData = terms.find(
    (term) => term._id === selectedTerm
  );

  const isLoading =
    loadingSessions ||
    loadingTerms ||
    loadingClasses ||
    loadingStudents ||
    loadingAttendance;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Page header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <ClipboardCheck className="h-6 w-6" />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Mark Attendance
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Record and manage daily attendance for your class.
              </p>
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

            <div className="flex-1">
              <p className="font-medium">{error}</p>
            </div>

            <button
              type="button"
              onClick={() => setError("")}
              className="text-red-400 transition hover:text-red-600"
              aria-label="Dismiss error"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Success message */}
        {success && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
            <p className="font-medium">{success}</p>
          </div>
        )}

        {/* Selection panel */}
        <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-emerald-600" />

            <h2 className="text-base font-semibold text-slate-900">
              Attendance Details
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {/* Academic session */}
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
                onChange={(event) => {
                  setSelectedSession(event.target.value);
                  setError("");
                  setSuccess("");
                }}
                disabled={loadingSessions}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-100"
              >
                <option value="">
                  {loadingSessions
                    ? "Loading sessions..."
                    : "Select session"}
                </option>

                {sessions.map((session) => (
                  <option key={session._id} value={session._id}>
                    {session.name ||
                      session.sessionName ||
                      session.academicYear ||
                      "Academic Session"}
                  </option>
                ))}
              </select>
            </div>

            {/* Academic term */}
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
                onChange={(event) => {
                  setSelectedTerm(event.target.value);
                  setError("");
                  setSuccess("");
                }}
                disabled={!selectedSession || loadingTerms}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-100"
              >
                <option value="">
                  {loadingTerms
                    ? "Loading terms..."
                    : "Select term"}
                </option>

                {terms.map((term) => (
                  <option key={term._id} value={term._id}>
                    {term.name ||
                      term.termName ||
                      term.title ||
                      "Academic Term"}
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
                onChange={(event) => {
                  setSelectedClass(event.target.value);
                  setError("");
                  setSuccess("");
                }}
                disabled={!selectedSession || loadingClasses}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-100"
              >
                <option value="">
                  {loadingClasses
                    ? "Loading classes..."
                    : "Select class"}
                </option>

                {classes.map((schoolClass) => (
                  <option
                    key={schoolClass._id}
                    value={schoolClass._id}
                  >
                    {getClassName(schoolClass)}
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
                onChange={(event) => {
                  setSelectedDate(event.target.value);
                  setError("");
                  setSuccess("");
                }}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
          </div>

          {/* Current selection summary */}
          {(selectedSessionData ||
            selectedTermData ||
            selectedClassData) && (
            <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
              {selectedSessionData && (
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {selectedSessionData.name ||
                    selectedSessionData.sessionName ||
                    selectedSessionData.academicYear}
                </span>
              )}

              {selectedTermData && (
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
                  <BookOpen className="h-3.5 w-3.5" />
                  {selectedTermData.name ||
                    selectedTermData.termName ||
                    selectedTermData.title}
                </span>
              )}

              {selectedClassData && (
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700">
                  <Users className="h-3.5 w-3.5" />
                  {getClassName(selectedClassData)}
                </span>
              )}
            </div>
          )}
        </section>

        {/* Attendance statistics */}
        <section className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-slate-500">
                Total Students
              </p>

              <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                <Users className="h-5 w-5" />
              </div>
            </div>

            <p className="mt-3 text-2xl font-bold text-slate-900">
              {stats.total}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Students in this class
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-slate-500">
                Present
              </p>

              <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
                <UserCheck className="h-5 w-5" />
              </div>
            </div>

            <p className="mt-3 text-2xl font-bold text-emerald-600">
              {stats.present}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Marked present
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-slate-500">
                Absent
              </p>

              <div className="rounded-lg bg-red-50 p-2 text-red-600">
                <UserX className="h-5 w-5" />
              </div>
            </div>

            <p className="mt-3 text-2xl font-bold text-red-600">
              {stats.absent}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Marked absent
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-slate-500">
                Late / Excused
              </p>

              <div className="rounded-lg bg-amber-50 p-2 text-amber-600">
                <Clock3 className="h-5 w-5" />
              </div>
            </div>

            <p className="mt-3 text-2xl font-bold text-amber-600">
              {stats.late + stats.excused}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              {stats.late} late · {stats.excused} excused
            </p>
          </div>
        </section>

        {/* Student attendance */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Student Attendance
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Select each student's status and add remarks if necessary.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={markAllPresent}
                disabled={students.length === 0 || isLoading || saving}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Check className="h-4 w-4" />
                Mark All Present
              </button>

              <button
                type="button"
                onClick={resetNewRecords}
                disabled={students.length === 0 || isLoading || saving}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Reset New
              </button>
            </div>
          </div>

          {/* Loading state */}
          {(loadingSessions ||
            loadingTerms ||
            loadingClasses ||
            loadingStudents ||
            loadingAttendance) && (
            <div className="flex items-center justify-center gap-3 px-5 py-12 text-sm text-slate-500">
              <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
              Loading attendance information...
            </div>
          )}

          {/* No class selected */}
          {!isLoading && !selectedClass && (
            <div className="px-5 py-12 text-center">
              <Users className="mx-auto h-10 w-10 text-slate-300" />

              <h3 className="mt-3 font-semibold text-slate-800">
                No class selected
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Select an academic session with a class assigned to you.
              </p>
            </div>
          )}

          {/* No students */}
          {!isLoading &&
            selectedClass &&
            students.length === 0 && (
              <div className="px-5 py-12 text-center">
                <Users className="mx-auto h-10 w-10 text-slate-300" />

                <h3 className="mt-3 font-semibold text-slate-800">
                  No students found
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  There are no students available in this class.
                </p>
              </div>
            )}

          {/* Desktop attendance table */}
          {!isLoading && students.length > 0 && (
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[760px] text-left">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      #
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Student
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Status
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Remarks
                    </th>

                    <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Record
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {students.map((student, index) => {
                    const record = attendance[student._id] || {
                      status: "present",
                      remarks: "",
                      existing: false,
                    };

                    return (
                      <tr
                        key={student._id}
                        className="transition hover:bg-slate-50/70"
                      >
                        <td className="px-6 py-4 text-sm text-slate-400">
                          {index + 1}
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
                              {student.firstName
                                ?.charAt(0)
                                ?.toUpperCase()}
                              {student.lastName
                                ?.charAt(0)
                                ?.toUpperCase()}
                            </div>

                            <div>
                              <p className="text-sm font-semibold text-slate-900">
                                {getStudentName(student) ||
                                  "Unnamed Student"}
                              </p>

                              <p className="mt-0.5 text-xs text-slate-500">
                                {student.studentId || "No student ID"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <select
                            value={record.status}
                            onChange={(event) =>
                              updateStudentStatus(
                                student._id,
                                event.target.value
                              )
                            }
                            disabled={saving}
                            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-100"
                          >
                            {STATUS_OPTIONS.map((option) => (
                              <option
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </td>

                        <td className="px-6 py-4">
                          <input
                            type="text"
                            value={record.remarks || ""}
                            onChange={(event) =>
                              updateStudentRemarks(
                                student._id,
                                event.target.value
                              )
                            }
                            disabled={saving}
                            placeholder="Optional"
                            className="w-full min-w-[180px] rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-100"
                          />
                        </td>

                        <td className="px-6 py-4 text-center">
                          {record.existing ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                              <Check className="h-3.5 w-3.5" />
                              Saved
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400">
                              New
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Mobile attendance cards */}
          {!isLoading && students.length > 0 && (
            <div className="divide-y divide-slate-100 md:hidden">
              {students.map((student, index) => {
                const record = attendance[student._id] || {
                  status: "present",
                  remarks: "",
                  existing: false,
                };

                return (
                  <div key={student._id} className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
                          {student.firstName
                            ?.charAt(0)
                            ?.toUpperCase()}
                          {student.lastName
                            ?.charAt(0)
                            ?.toUpperCase()}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900">
                            {index + 1}.{" "}
                            {getStudentName(student) ||
                              "Unnamed Student"}
                          </p>

                          <p className="mt-0.5 text-xs text-slate-500">
                            {student.studentId || "No student ID"}
                          </p>
                        </div>
                      </div>

                      {record.existing && (
                        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                          <Check className="h-3 w-3" />
                          Saved
                        </span>
                      )}
                    </div>

                    <div className="mt-4">
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Attendance Status
                      </label>

                      <select
                        value={record.status}
                        onChange={(event) =>
                          updateStudentStatus(
                            student._id,
                            event.target.value
                          )
                        }
                        disabled={saving}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-100"
                      >
                        {STATUS_OPTIONS.map((option) => (
                          <option
                            key={option.value}
                            value={option.value}
                          >
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mt-4">
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Remarks
                      </label>

                      <input
                        type="text"
                        value={record.remarks || ""}
                        onChange={(event) =>
                          updateStudentRemarks(
                            student._id,
                            event.target.value
                          )
                        }
                        disabled={saving}
                        placeholder="Optional remark"
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-100"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Save footer */}
          {!isLoading && students.length > 0 && (
            <div className="border-t border-slate-200 bg-slate-50 px-5 py-4 sm:px-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-700">
                    {students.length} student
                    {students.length !== 1 ? "s" : ""} in this class
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {stats.present} present, {stats.absent} absent,{" "}
                    {stats.late} late and {stats.excused} excused.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleSaveAttendance}
                  disabled={saving || loadingStudents || loadingAttendance}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving Attendance...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Attendance
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}