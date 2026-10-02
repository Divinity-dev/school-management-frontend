"use client";

import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Loader2,
  Save,
  UserCheck,
  Users,
  X,
  Clock3,
  UserX,
  CalendarDays,
  BookOpen,
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
  {
    value: "present",
    label: "Present",
  },
  {
    value: "absent",
    label: "Absent",
  },
  {
    value: "late",
    label: "Late",
  },
  {
    value: "excused",
    label: "Excused",
  },
];

const getStudentName = (student) =>
  [student.firstName, student.middleName, student.lastName]
    .filter(Boolean)
    .join(" ");

const getClassName = (schoolClass) =>
  [schoolClass.name, schoolClass.arm]
    .filter(Boolean)
    .join(" ");

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
   * ---------------------------------------------------------
   * Load academic sessions
   * ---------------------------------------------------------
   */
  useEffect(() => {
    const loadSessions = async () => {
      try {
        setLoadingSessions(true);
        setError("");

        const response = await api.get("/academic-sessions");

        const sessionList = response.data?.sessions || [];

        setSessions(sessionList);

        const currentSession = sessionList.find(
          (session) => session.isCurrent && session.isActive
        );

        if (currentSession) {
          setSelectedSession(currentSession._id);
        } else if (sessionList.length > 0) {
          const activeSession = sessionList.find(
            (session) => session.isActive
          );

          if (activeSession) {
            setSelectedSession(activeSession._id);
          }
        }
      } catch (err) {
        console.error("Load academic sessions error:", err);

        setError(
          err.response?.data?.message ||
            "Failed to load academic sessions."
        );
      } finally {
        setLoadingSessions(false);
      }
    };

    loadSessions();
  }, []);

  /*
   * ---------------------------------------------------------
   * Load terms whenever session changes
   * ---------------------------------------------------------
   */
useEffect(() => {
  const loadClasses = async () => {
    if (!selectedSession || !user?.id) {
      setClasses([]);
      setSelectedClass("");
      return;
    }

    try {
      setLoadingClasses(true);
      setError("");

      const response = await api.get(
        `/classes/session/${selectedSession}`
      );

      const allClasses = response.data?.classes || [];

      const teacherClasses = allClasses.filter(
        (schoolClass) =>
          schoolClass.classTeacher?._id?.toString() ===
          user.id.toString()
      );

      setClasses(teacherClasses);

      if (teacherClasses.length > 0) {
        setSelectedClass((currentClass) => {
          const stillExists = teacherClasses.some(
            (schoolClass) => schoolClass._id === currentClass
          );

          return stillExists
            ? currentClass
            : teacherClasses[0]._id;
        });
      } else {
        setSelectedClass("");
      }
    } catch (err) {
      console.error("Load teacher classes error:", err);

      setClasses([]);
      setSelectedClass("");

      setError(
        err.response?.data?.message ||
          "Failed to load your assigned classes."
      );
    } finally {
      setLoadingClasses(false);
    }
  };

  loadClasses();
}, [selectedSession, user?.id]);

  /*
   * ---------------------------------------------------------
   * Load classes for selected session
   *
   * Only show classes where the logged-in teacher
   * is the assigned class teacher.
   * ---------------------------------------------------------
   */
  useEffect(() => {
    const loadClasses = async () => {
      if (!selectedSession || !user?._id) {
        setClasses([]);
        setSelectedClass("");
        return;
      }

      try {
        setLoadingClasses(true);
        setError("");

        const response = await api.get(
          `/classes/session/${selectedSession}`
        );

        const allClasses = response.data?.classes || [];

        console.log("Logged-in user:", user);
console.log("Logged-in user ID:", user._id);
console.log("Classes returned:", allClasses);

       const teacherClasses = allClasses.filter((schoolClass) => {
  console.log("Class:", schoolClass.name, schoolClass.arm);
  console.log("Class teacher:", schoolClass.classTeacher);
  console.log(
    "Class teacher ID:",
    schoolClass.classTeacher?._id
  );
  console.log(
    "User ID:",
    user._id
  );

  return (
    schoolClass.classTeacher?._id?.toString() ===
    user._id?.toString()
  );
});

        setClasses(teacherClasses);

        if (teacherClasses.length > 0) {
          setSelectedClass((currentClass) => {
            const stillExists = teacherClasses.some(
              (schoolClass) => schoolClass._id === currentClass
            );

            return stillExists
              ? currentClass
              : teacherClasses[0]._id;
          });
        } else {
          setSelectedClass("");
        }
      } catch (err) {
        console.error("Load teacher classes error:", err);

        setClasses([]);
        setSelectedClass("");

        setError(
          err.response?.data?.message ||
            "Failed to load your assigned classes."
        );
      } finally {
        setLoadingClasses(false);
      }
    };

    loadClasses();
  }, [selectedSession, user?._id]);

  /*
   * ---------------------------------------------------------
   * Load students whenever class changes
   * ---------------------------------------------------------
   */
  useEffect(() => {
    const loadStudents = async () => {
      if (!selectedClass) {
        setStudents([]);
        setAttendance({});
        return;
      }

      try {
        setLoadingStudents(true);
        setError("");
        setSuccess("");

        const response = await api.get(
          `/students/class/${selectedClass}`
        );

        const studentList = response.data?.students || [];

        setStudents(studentList);

        const initialAttendance = {};

        studentList.forEach((student) => {
          initialAttendance[student._id] = {
            status: "present",
            remarks: "",
            attendanceId: null,
            existing: false,
          };
        });

        setAttendance(initialAttendance);
      } catch (err) {
        console.error("Load class students error:", err);

        setStudents([]);
        setAttendance({});

        setError(
          err.response?.data?.message ||
            "Failed to load students for this class."
        );
      } finally {
        setLoadingStudents(false);
      }
    };

    loadStudents();
  }, [selectedClass]);

  /*
   * ---------------------------------------------------------
   * Load attendance for selected date
   * ---------------------------------------------------------
   */
  useEffect(() => {
    const loadExistingAttendance = async () => {
      if (!selectedClass || !selectedTerm || !selectedDate) {
        return;
      }

      try {
        setLoadingAttendance(true);
        setError("");
        setSuccess("");

        const response = await api.get("/attendance/class", {
          params: {
            classId: selectedClass,
            date: selectedDate,
            term: selectedTerm,
          },
        });

        const existingRecords =
          response.data?.attendance || [];

        setAttendance((current) => {
          const updated = { ...current };

          existingRecords.forEach((record) => {
            if (!record.student?._id) {
              return;
            }

            const studentId = record.student._id;

            updated[studentId] = {
              status: record.status,
              remarks: record.remarks || "",
              attendanceId: record._id,
              existing: true,
            };
          });

          return updated;
        });
      } catch (err) {
        console.error(
          "Load existing attendance error:",
          err
        );

        setError(
          err.response?.data?.message ||
            "Failed to load existing attendance."
        );
      } finally {
        setLoadingAttendance(false);
      }
    };

    loadExistingAttendance();
  }, [selectedClass, selectedTerm, selectedDate]);

  /*
   * ---------------------------------------------------------
   * Update one student's attendance status
   * ---------------------------------------------------------
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
   * ---------------------------------------------------------
   * Update remarks
   * ---------------------------------------------------------
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
   * ---------------------------------------------------------
   * Mark everyone present
   * ---------------------------------------------------------
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
   * ---------------------------------------------------------
   * Reset unsaved records to Present
   *
   * Existing records remain unchanged.
   * ---------------------------------------------------------
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
   * ---------------------------------------------------------
   * Save attendance
   * ---------------------------------------------------------
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
      setError("There are no active students in this class.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const selectedSchoolClass = classes.find(
        (schoolClass) => schoolClass._id === selectedClass
      );

      if (!selectedSchoolClass) {
        throw new Error("Selected class could not be found.");
      }

      /*
       * We process each student individually because the backend
       * currently exposes one attendance record per POST/PATCH.
       */
      for (const student of students) {
        const record = attendance[student._id];

        if (!record) {
          continue;
        }

        const payload = {
          school: selectedSchoolClass.school,
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

          const createdAttendance =
            response.data?.attendance;

          setAttendance((current) => ({
            ...current,
            [student._id]: {
              ...current[student._id],
              attendanceId:
                createdAttendance?._id || null,
              existing: true,
            },
          }));
        }
      }

      setSuccess(
        "Attendance has been saved successfully."
      );
    } catch (err) {
      console.error("Save attendance error:", err);

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
   * ---------------------------------------------------------
   * Attendance statistics
   * ---------------------------------------------------------
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

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                  <ClipboardCheck className="h-6 w-6" />
                </div>

                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                    Mark Attendance
                  </h1>

                  <p className="text-sm text-slate-500">
                    Record daily attendance for your class.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Alerts */}
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
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {success && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />

            <p className="font-medium">{success}</p>
          </div>
        )}

        {/* Selection Card */}
        <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5">
            <h2 className="text-base font-semibold text-slate-900">
              Attendance Details
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Select the academic period, class and date.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {/* Academic Session */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Academic Session
              </label>

              <select
                value={selectedSession}
                onChange={(event) => {
                  setSelectedSession(event.target.value);
                  setSelectedClass("");
                  setStudents([]);
                  setAttendance({});
                }}
                disabled={loadingSessions}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-50"
              >
                <option value="">
                  {loadingSessions
                    ? "Loading sessions..."
                    : "Select session"}
                </option>

                {sessions
                  .filter((session) => session.isActive)
                  .map((session) => (
                    <option
                      key={session._id}
                      value={session._id}
                    >
                      {session.name}
                      {session.isCurrent ? " (Current)" : ""}
                    </option>
                  ))}
              </select>
            </div>

            {/* Term */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Academic Term
              </label>

              <select
                value={selectedTerm}
                onChange={(event) => {
                  setSelectedTerm(event.target.value);
                }}
                disabled={
                  !selectedSession || loadingTerms
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-50"
              >
                <option value="">
                  {loadingTerms
                    ? "Loading terms..."
                    : "Select term"}
                </option>

                {terms
                  .filter((term) => term.isActive)
                  .map((term) => (
                    <option
                      key={term._id}
                      value={term._id}
                    >
                      {term.name}
                      {term.isCurrent ? " (Current)" : ""}
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
                value={selectedClass}
                onChange={(event) => {
                  setSelectedClass(event.target.value);
                }}
                disabled={
                  !selectedSession ||
                  loadingClasses
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-50"
              >
                <option value="">
                  {loadingClasses
                    ? "Loading classes..."
                    : classes.length === 0
                    ? "No assigned classes"
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
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Attendance Date
              </label>

              <div className="relative">
                <CalendarDays className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  type="date"
                  value={selectedDate}
                  onChange={(event) => {
                    setSelectedDate(event.target.value);
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Empty State */}
        {!selectedClass && !loadingClasses && (
          <section className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <Users className="h-7 w-7" />
            </div>

            <h3 className="mt-4 text-base font-semibold text-slate-900">
              Select a class
            </h3>

            <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
              Select one of your assigned classes above to
              load the students and begin marking attendance.
            </p>
          </section>
        )}

        {/* No Assigned Classes */}
        {selectedSession &&
          !loadingClasses &&
          classes.length === 0 && (
            <section className="rounded-2xl border border-amber-200 bg-amber-50 px-6 py-12 text-center">
              <AlertCircle className="mx-auto h-8 w-8 text-amber-500" />

              <h3 className="mt-4 text-base font-semibold text-amber-900">
                No class assigned
              </h3>

              <p className="mx-auto mt-1 max-w-md text-sm text-amber-700">
                You are not currently assigned as the class
                teacher for any active class in this academic
                session.
              </p>
            </section>
          )}

        {/* Attendance Area */}
        {selectedClass && (
          <>
            {/* Class Information */}
            <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                    <BookOpen className="h-6 w-6" />
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      {selectedClassData
                        ? getClassName(selectedClassData)
                        : "Selected Class"}
                    </h2>

                    <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-sm text-slate-500">
                      <span>
                        {selectedSessionData?.name || "Session"}
                      </span>

                      <span className="hidden sm:inline">
                        •
                      </span>

                      <span>
                        {selectedTermData?.name || "Term"}
                      </span>

                      <span className="hidden sm:inline">
                        •
                      </span>

                      <span>{selectedDate}</span>
                    </div>
                  </div>
                </div>

                {loadingAttendance && (
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Checking attendance...
                  </div>
                )}
              </div>
            </section>

            {/* Statistics */}
            <section className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                    <Users className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-xs font-medium text-slate-500">
                      Total
                    </p>

                    <p className="text-xl font-bold text-slate-900">
                      {stats.total}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-emerald-600">
                    <UserCheck className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-xs font-medium text-emerald-700">
                      Present
                    </p>

                    <p className="text-xl font-bold text-emerald-900">
                      {stats.present}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-red-600">
                    <UserX className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-xs font-medium text-red-700">
                      Absent
                    </p>

                    <p className="text-xl font-bold text-red-900">
                      {stats.absent}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-amber-600">
                    <Clock3 className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-xs font-medium text-amber-700">
                      Late
                    </p>

                    <p className="text-xl font-bold text-amber-900">
                      {stats.late}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-blue-600">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-xs font-medium text-blue-700">
                      Excused
                    </p>

                    <p className="text-xl font-bold text-blue-900">
                      {stats.excused}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Student Attendance */}
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              {/* Toolbar */}
              <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-base font-semibold text-slate-900">
                      Students
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Select an attendance status for each
                      student.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={markAllPresent}
                      disabled={students.length === 0}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Check className="h-4 w-4" />
                      Mark All Present
                    </button>

                    <button
                      type="button"
                      onClick={resetNewRecords}
                      disabled={students.length === 0}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>

              {/* Loading */}
              {(loadingStudents || loadingAttendance) && (
                <div className="flex items-center justify-center px-6 py-16">
                  <div className="flex items-center gap-3 text-sm text-slate-500">
                    <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
                    Loading attendance...
                  </div>
                </div>
              )}

              {/* No Students */}
              {!loadingStudents &&
                !loadingAttendance &&
                students.length === 0 && (
                  <div className="px-6 py-16 text-center">
                    <Users className="mx-auto h-8 w-8 text-slate-300" />

                    <h3 className="mt-4 text-sm font-semibold text-slate-900">
                      No active students
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      There are currently no active students
                      in this class.
                    </p>
                  </div>
                )}

              {/* Desktop Table */}
              {!loadingStudents &&
                !loadingAttendance &&
                students.length > 0 && (
                  <div className="hidden overflow-x-auto md:block">
                    <table className="w-full">
                      <thead className="bg-slate-50">
                        <tr className="border-b border-slate-200">
                          <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                            #
                          </th>

                          <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Student
                          </th>

                          <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Student ID
                          </th>

                          <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Status
                          </th>

                          <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Remarks
                          </th>

                          <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Saved
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-100">
                        {students.map((student, index) => {
                          const record =
                            attendance[student._id] || {
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
                                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
                                    {student.firstName
                                      ?.charAt(0)
                                      ?.toUpperCase()}
                                    {student.lastName
                                      ?.charAt(0)
                                      ?.toUpperCase()}
                                  </div>

                                  <div>
                                    <p className="text-sm font-semibold text-slate-900">
                                      {getStudentName(
                                        student
                                      )}
                                    </p>
                                  </div>
                                </div>
                              </td>

                              <td className="px-6 py-4 text-sm text-slate-500">
                                {student.studentId}
                              </td>

                              <td className="px-6 py-4">
                                <select
                                  value={
                                    record.status
                                  }
                                  onChange={(event) =>
                                    updateStudentStatus(
                                      student._id,
                                      event.target.value
                                    )
                                  }
                                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                                >
                                  {STATUS_OPTIONS.map(
                                    (option) => (
                                      <option
                                        key={
                                          option.value
                                        }
                                        value={
                                          option.value
                                        }
                                      >
                                        {option.label}
                                      </option>
                                    )
                                  )}
                                </select>
                              </td>

                              <td className="px-6 py-4">
                                <input
                                  type="text"
                                  value={
                                    record.remarks || ""
                                  }
                                  onChange={(event) =>
                                    updateStudentRemarks(
                                      student._id,
                                      event.target.value
                                    )
                                  }
                                  placeholder="Optional"
                                  className="w-full min-w-[180px] rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
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

              {/* Mobile Cards */}
              {!loadingStudents &&
                !loadingAttendance &&
                students.length > 0 && (
                  <div className="divide-y divide-slate-100 md:hidden">
                    {students.map((student, index) => {
                      const record =
                        attendance[student._id] || {
                          status: "present",
                          remarks: "",
                          existing: false,
                        };

                      return (
                        <div
                          key={student._id}
                          className="p-5"
                        >
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
                                  {getStudentName(
                                    student
                                  )}
                                </p>

                                <p className="mt-0.5 text-xs text-slate-500">
                                  {student.studentId}
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
                              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                            >
                              {STATUS_OPTIONS.map(
                                (option) => (
                                  <option
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </option>
                                )
                              )}
                            </select>
                          </div>

                          <div className="mt-4">
                            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                              Remarks
                            </label>

                            <input
                              type="text"
                              value={
                                record.remarks || ""
                              }
                              onChange={(event) =>
                                updateStudentRemarks(
                                  student._id,
                                  event.target.value
                                )
                              }
                              placeholder="Optional remark"
                              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

              {/* Save Footer */}
              {students.length > 0 && (
                <div className="border-t border-slate-200 bg-slate-50 px-5 py-4 sm:px-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-slate-500">
                      {students.length} student
                      {students.length !== 1
                        ? "s"
                        : ""}{" "}
                      in this class
                    </p>

                    <button
                      type="button"
                      onClick={handleSaveAttendance}
                      disabled={
                        saving ||
                        loadingStudents ||
                        loadingAttendance
                      }
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
          </>
        )}
      </div>
    </main>
  );
}