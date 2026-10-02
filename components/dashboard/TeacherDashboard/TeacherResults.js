"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  FileText,
  GraduationCap,
  Loader2,
  Save,
  Send,
  Users,
} from "lucide-react";

import api from "@/lib/api";

export default function TeacherResults() {
  const searchParams = useSearchParams();

  const classId = searchParams.get("classId");
  const subjectAssignmentId = searchParams.get(
    "subjectAssignmentId"
  );

  const [classes, setClasses] = useState([]);
  const [subjectAssignments, setSubjectAssignments] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [terms, setTerms] = useState([]);

  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedSession, setSelectedSession] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("");

  const [gradingSystem, setGradingSystem] = useState(null);
  const [roster, setRoster] = useState([]);

  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingRoster, setLoadingRoster] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [scores, setScores] = useState({});

  /* =========================================================
     LOAD INITIAL DATA
  ========================================================= */

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoadingInitial(true);
        setError("");

        const [
          classesResponse,
          assignmentsResponse,
          sessionsResponse,
          termsResponse,
        ] = await Promise.all([
          api.get("/classes"),
          api.get("/subject-assignments"),
          api.get("/academic-sessions"),
          api.get("/academic-terms"),
        ]);

        const loadedClasses =
          classesResponse.data?.classes || [];

        const loadedAssignments =
          assignmentsResponse.data?.subjectAssignments ||
          assignmentsResponse.data?.assignments ||
          [];

        const loadedSessions =
          sessionsResponse.data?.sessions || [];

        const loadedTerms =
          termsResponse.data?.terms || [];

        setClasses(loadedClasses);
        setSubjectAssignments(loadedAssignments);
        setSessions(loadedSessions);
        setTerms(loadedTerms);

        /* -----------------------------------------------------
           Subject assignment entry
        ----------------------------------------------------- */

        if (subjectAssignmentId) {
          const assignment = loadedAssignments.find(
            (item) =>
              item._id?.toString() ===
              subjectAssignmentId.toString()
          );

          if (assignment) {
            const assignmentClass =
              assignment.schoolClass?._id ||
              assignment.schoolClass;

            const assignmentSubject =
              assignment.subject?._id ||
              assignment.subject;

            const assignmentSession =
              assignment.academicSession?._id ||
              assignment.academicSession;

            setSelectedClass(
              assignmentClass?.toString() || ""
            );

            setSelectedSubject(
              assignmentSubject?.toString() || ""
            );

            setSelectedSession(
              assignmentSession?.toString() || ""
            );
          }
        }

        /* -----------------------------------------------------
           Class entry
        ----------------------------------------------------- */

        if (classId) {
          const selectedClassRecord = loadedClasses.find(
            (item) =>
              item._id?.toString() === classId.toString()
          );

          if (selectedClassRecord) {
            setSelectedClass(classId);

            const classSession =
              selectedClassRecord.academicSession?._id ||
              selectedClassRecord.academicSession;

            if (classSession) {
              setSelectedSession(
                classSession.toString()
              );
            }
          }
        }
      } catch (err) {
        console.error(
          "Failed to load teacher result data:",
          err
        );

        setError(
          err.response?.data?.message ||
            "Unable to load the result setup data."
        );
      } finally {
        setLoadingInitial(false);
      }
    };

    loadInitialData();
  }, [classId, subjectAssignmentId]);

  /* =========================================================
     TEACHER'S ACTIVE ASSIGNMENTS
  ========================================================= */

  const myAssignments = useMemo(() => {
    return subjectAssignments.filter(
      (assignment) => assignment.isActive !== false
    );
  }, [subjectAssignments]);

  /* =========================================================
     AVAILABLE SUBJECTS FOR SELECTED CLASS
  ========================================================= */

  const availableSubjects = useMemo(() => {
    if (!selectedClass) return [];

    return myAssignments.filter((assignment) => {
      const assignmentClass =
        assignment.schoolClass?._id ||
        assignment.schoolClass;

      const assignmentSession =
        assignment.academicSession?._id ||
        assignment.academicSession;

      const classMatches =
        assignmentClass?.toString() ===
        selectedClass.toString();

      const sessionMatches = selectedSession
        ? assignmentSession?.toString() ===
          selectedSession.toString()
        : true;

      return classMatches && sessionMatches;
    });
  }, [
    myAssignments,
    selectedClass,
    selectedSession,
  ]);

  /* =========================================================
     AVAILABLE TERMS
  ========================================================= */

  const availableTerms = useMemo(() => {
    if (!selectedSession) return terms;

    return terms.filter((term) => {
      const termSession =
        term.academicSession?._id ||
        term.academicSession;

      return (
        termSession?.toString() ===
        selectedSession.toString()
      );
    });
  }, [terms, selectedSession]);

  /* =========================================================
     SELECT HANDLERS
  ========================================================= */

  const handleClassChange = (value) => {
    setSelectedClass(value);

    setSelectedSubject("");
    setRoster([]);
    setGradingSystem(null);
    setScores({});
    setMessage("");
    setError("");

    const selectedClassRecord = classes.find(
      (item) => item._id?.toString() === value.toString()
    );

    const session =
      selectedClassRecord?.academicSession?._id ||
      selectedClassRecord?.academicSession;

    if (session) {
      setSelectedSession(session.toString());
    }
  };

  const handleSessionChange = (value) => {
    setSelectedSession(value);
    setSelectedSubject("");
    setSelectedTerm("");
    setRoster([]);
    setGradingSystem(null);
    setScores({});
    setMessage("");
    setError("");
  };

  /* =========================================================
     LOAD ROSTER
  ========================================================= */

  const loadRoster = async () => {
    if (
      !selectedClass ||
      !selectedSubject ||
      !selectedSession ||
      !selectedTerm
    ) {
      setError(
        "Please select class, subject, academic session and academic term."
      );
      return;
    }

    try {
      setLoadingRoster(true);
      setError("");
      setMessage("");

      const response = await api.get(
        "/results/teacher-roster",
        {
          params: {
            schoolClass: selectedClass,
            subject: selectedSubject,
            academicSession: selectedSession,
            academicTerm: selectedTerm,
          },
        }
      );

      const loadedRoster =
        response.data?.roster || [];

      const loadedGradingSystem =
        response.data?.gradingSystem || null;

      setRoster(loadedRoster);
      setGradingSystem(loadedGradingSystem);

      /* -----------------------------------------------------
         Build score state from existing results
      ----------------------------------------------------- */

      const initialScores = {};

      loadedRoster.forEach((item) => {
        const studentId = item.student?._id;

        if (!studentId) return;

        const existingResult = item.result;

        const assessmentScores =
          existingResult?.assessmentScores || [];

        const assessmentMap = {};

        assessmentScores.forEach((assessment) => {
          assessmentMap[assessment.name] =
            assessment.score;
        });

        initialScores[studentId] = {
          assessments: assessmentMap,
          examScore:
            existingResult?.examScore ?? "",
        };
      });

      setScores(initialScores);
    } catch (err) {
      console.error("Failed to load result roster:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load the student roster."
      );

      setRoster([]);
      setGradingSystem(null);
    } finally {
      setLoadingRoster(false);
    }
  };

  /* =========================================================
     SCORE HELPERS
  ========================================================= */

  const getStudentScores = (studentId) => {
    return (
      scores[studentId] || {
        assessments: {},
        examScore: "",
      }
    );
  };

  const updateAssessmentScore = (
    studentId,
    componentName,
    value
  ) => {
    setScores((current) => ({
      ...current,
      [studentId]: {
        ...getStudentScores(studentId),
        assessments: {
          ...getStudentScores(studentId).assessments,
          [componentName]: value,
        },
      },
    }));

    setMessage("");
  };

  const updateExamScore = (studentId, value) => {
    setScores((current) => ({
      ...current,
      [studentId]: {
        ...getStudentScores(studentId),
        examScore: value,
      },
    }));

    setMessage("");
  };

  /* =========================================================
     CALCULATIONS
  ========================================================= */

  const calculateCa = (studentId) => {
    const studentScores = getStudentScores(studentId);

    if (!gradingSystem?.caComponents) return 0;

    return gradingSystem.caComponents.reduce(
      (total, component) => {
        const value = Number(
          studentScores.assessments[component.name]
        );

        return total + (Number.isFinite(value) ? value : 0);
      },
      0
    );
  };

  const calculateTotal = (studentId) => {
    const ca = calculateCa(studentId);

    const exam = Number(
      getStudentScores(studentId).examScore
    );

    return ca + (Number.isFinite(exam) ? exam : 0);
  };

  const calculateGrade = (studentId) => {
    if (!gradingSystem?.gradingScale) return null;

    const total = calculateTotal(studentId);

    const rule = gradingSystem.gradingScale.find(
      (item) =>
        total >= Number(item.min) &&
        total <= Number(item.max)
    );

    return rule || null;
  };

  /* =========================================================
     VALIDATE
  ========================================================= */

  const validateResults = () => {
    if (!roster.length) {
      return "There are no students in this class.";
    }

    if (!gradingSystem) {
      return "Grading system information is unavailable.";
    }

    for (const studentItem of roster) {
      const studentId = studentItem.student?._id;

      if (!studentId) continue;

      const studentScores = getStudentScores(studentId);

      for (const component of gradingSystem.caComponents) {
        const value = Number(
          studentScores.assessments[component.name]
        );

        if (!Number.isFinite(value)) {
          return `Enter a score for ${studentItem.student.firstName} ${studentItem.student.lastName} - ${component.name}.`;
        }

        if (
          value < 0 ||
          value > Number(component.maximum)
        ) {
          return `${component.name} score for ${studentItem.student.firstName} ${studentItem.student.lastName} must be between 0 and ${component.maximum}.`;
        }
      }

      const exam = Number(studentScores.examScore);

      if (!Number.isFinite(exam)) {
        return `Enter an exam score for ${studentItem.student.firstName} ${studentItem.student.lastName}.`;
      }

      if (
        exam < 0 ||
        exam > Number(gradingSystem.examMaximum)
      ) {
        return `Exam score for ${studentItem.student.firstName} ${studentItem.student.lastName} must be between 0 and ${gradingSystem.examMaximum}.`;
      }
    }

    return null;
  };

  /* =========================================================
     SAVE RESULTS
  ========================================================= */

  const saveResults = async ({
    submitForReview = false,
  } = {}) => {
    const validationError = validateResults();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const results = roster.map((item) => {
        const studentId = item.student._id;
        const studentScores =
          getStudentScores(studentId);

        const assessmentScores =
          gradingSystem.caComponents.map(
            (component) => ({
              name: component.name,
              score: Number(
                studentScores.assessments[
                  component.name
                ]
              ),
            })
          );

        return {
          student: studentId,
          assessmentScores,
          examScore: Number(
            studentScores.examScore
          ),
        };
      });

      const response = await api.post(
        "/results/teacher-results/submit",
        {
          schoolClass: selectedClass,
          subject: selectedSubject,
          academicSession: selectedSession,
          academicTerm: selectedTerm,
          results,
        }
      );

      setMessage(
        response.data?.message ||
          "Results saved successfully."
      );

      /*
       * The backend saves results as draft.
       *
       * Individual submission for review is handled
       * after the results have been saved.
       */

      if (submitForReview) {
        setMessage(
          "Results saved successfully. You can now submit the individual results for review."
        );
      }

      await loadRoster();
    } catch (err) {
      console.error("Failed to save results:", err);

      setError(
        err.response?.data?.message ||
          "Failed to save results."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     DISPLAY HELPERS
  ========================================================= */

  const selectedClassRecord = classes.find(
    (item) =>
      item._id?.toString() ===
      selectedClass?.toString()
  );

  const selectedAssignment = myAssignments.find(
    (assignment) => {
      const assignmentClass =
        assignment.schoolClass?._id ||
        assignment.schoolClass;

      const assignmentSubject =
        assignment.subject?._id ||
        assignment.subject;

      return (
        assignmentClass?.toString() ===
          selectedClass?.toString() &&
        assignmentSubject?.toString() ===
          selectedSubject?.toString()
      );
    }
  );

  const selectedSubjectRecord =
    selectedAssignment?.subject ||
    subjectAssignments.find(
      (assignment) => {
        const subject =
          assignment.subject?._id ||
          assignment.subject;

        return (
          subject?.toString() ===
          selectedSubject?.toString()
        );
      }
    )?.subject;

  const displayClassName = selectedClassRecord
    ? `${selectedClassRecord.name || ""}${
        selectedClassRecord.arm
          ? ` ${selectedClassRecord.arm}`
          : ""
      }`.trim()
    : "";

  /* =========================================================
     LOADING
  ========================================================= */

  if (loadingInitial) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[400px] max-w-7xl items-center justify-center">
          <div className="flex items-center gap-3 text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading result setup...</span>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px]">
        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="mb-8">
          <Link
            href="/dashboard/teacher"
            className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-emerald-600"
          >
            <ArrowLeft size={17} />
            Back to Dashboard
          </Link>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-600">
                Teacher Portal
              </p>

              <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Student Results
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Enter and save student results for your assigned
                classes and subjects.
              </p>
            </div>

            {roster.length > 0 && (
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
                <Users
                  size={18}
                  className="text-emerald-600"
                />

                <span className="text-sm font-medium text-slate-700">
                  {roster.length}{" "}
                  {roster.length === 1
                    ? "Student"
                    : "Students"}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* =====================================================
            ERROR / SUCCESS
        ===================================================== */}

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle
              size={18}
              className="mt-0.5 shrink-0"
            />

            <p>{error}</p>
          </div>
        )}

        {message && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            <CheckCircle2
              size={18}
              className="mt-0.5 shrink-0"
            />

            <p>{message}</p>
          </div>
        )}

        {/* =====================================================
            SELECTION PANEL
        ===================================================== */}

        <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
              <FileText size={20} />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900">
                Result Setup
              </h2>

              <p className="text-sm text-slate-500">
                Select the class, subject, session and term.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Class */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Class
              </label>

              <div className="relative">
                <select
                  value={selectedClass}
                  onChange={(e) =>
                    handleClassChange(e.target.value)
                  }
                  className="w-full appearance-none rounded-xl border border-slate-300 bg-white px-4 py-3 pr-10 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                >
                  <option value="">
                    Select class
                  </option>

                  {classes
                    .filter(
                      (item) => item.isActive !== false
                    )
                    .map((schoolClass) => (
                      <option
                        key={schoolClass._id}
                        value={schoolClass._id}
                      >
                        {schoolClass.name}
                        {schoolClass.arm
                          ? ` ${schoolClass.arm}`
                          : ""}
                      </option>
                    ))}
                </select>

                <ChevronDown
                  size={17}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>
            </div>

            {/* Subject */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Subject
              </label>

              <div className="relative">
                <select
                  value={selectedSubject}
                  onChange={(e) => {
                    setSelectedSubject(
                      e.target.value
                    );
                    setRoster([]);
                    setGradingSystem(null);
                    setScores({});
                    setMessage("");
                    setError("");
                  }}
                  disabled={!selectedClass}
                  className="w-full appearance-none rounded-xl border border-slate-300 bg-white px-4 py-3 pr-10 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                >
                  <option value="">
                    Select subject
                  </option>

                  {availableSubjects.map(
                    (assignment) => {
                      const subject =
                        assignment.subject;

                      const subjectId =
                        subject?._id ||
                        subject;

                      return (
                        <option
                          key={assignment._id}
                          value={subjectId}
                        >
                          {subject?.name ||
                            "Subject"}
                        </option>
                      );
                    }
                  )}
                </select>

                <ChevronDown
                  size={17}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>
            </div>

            {/* Session */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Academic Session
              </label>

              <div className="relative">
                <select
                  value={selectedSession}
                  onChange={(e) =>
                    handleSessionChange(
                      e.target.value
                    )
                  }
                  className="w-full appearance-none rounded-xl border border-slate-300 bg-white px-4 py-3 pr-10 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                >
                  <option value="">
                    Select session
                  </option>

                  {sessions
                    .filter(
                      (session) =>
                        session.isActive !== false
                    )
                    .map((session) => (
                      <option
                        key={session._id}
                        value={session._id}
                      >
                        {session.name}
                      </option>
                    ))}
                </select>

                <ChevronDown
                  size={17}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>
            </div>

            {/* Term */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Academic Term
              </label>

              <div className="relative">
                <select
                  value={selectedTerm}
                  onChange={(e) => {
                    setSelectedTerm(
                      e.target.value
                    );
                    setRoster([]);
                    setGradingSystem(null);
                    setScores({});
                    setMessage("");
                    setError("");
                  }}
                  disabled={!selectedSession}
                  className="w-full appearance-none rounded-xl border border-slate-300 bg-white px-4 py-3 pr-10 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                >
                  <option value="">
                    Select term
                  </option>

                  {availableTerms
                    .filter(
                      (term) =>
                        term.isActive !== false
                    )
                    .map((term) => (
                      <option
                        key={term._id}
                        value={term._id}
                      >
                        {term.name}
                      </option>
                    ))}
                </select>

                <ChevronDown
                  size={17}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>
            </div>
          </div>

          <div className="mt-5 flex justify-end">
            <button
              type="button"
              onClick={loadRoster}
              disabled={
                loadingRoster ||
                !selectedClass ||
                !selectedSubject ||
                !selectedSession ||
                !selectedTerm
              }
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loadingRoster ? (
                <>
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />
                  Loading Students...
                </>
              ) : (
                <>
                  <Users size={16} />
                  Load Students
                </>
              )}
            </button>
          </div>
        </section>

        {/* =====================================================
            RESULT SUMMARY
        ===================================================== */}

        {gradingSystem && roster.length > 0 && (
          <section className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
              <p className="text-xs font-medium text-emerald-700">
                CA Maximum
              </p>

              <p className="mt-1 text-2xl font-bold text-emerald-900">
                {gradingSystem.caMaximum}
              </p>
            </div>

            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
              <p className="text-xs font-medium text-blue-700">
                Exam Maximum
              </p>

              <p className="mt-1 text-2xl font-bold text-blue-900">
                {gradingSystem.examMaximum}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-medium text-slate-500">
                Total Maximum
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-900">
                {gradingSystem.totalMaximum}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-medium text-slate-500">
                Students
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-900">
                {roster.length}
              </p>
            </div>
          </section>
        )}

        {/* =====================================================
            RESULTS TABLE
        ===================================================== */}

        {roster.length > 0 && gradingSystem && (
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {/* Table Header */}
            <div className="border-b border-slate-200 p-5 sm:p-6">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <GraduationCap
                      size={20}
                      className="text-emerald-600"
                    />

                    <h2 className="font-semibold text-slate-900">
                      Enter Results
                    </h2>
                  </div>

                  <p className="mt-1 text-sm text-slate-500">
                    {displayClassName}
                    {selectedSubjectRecord?.name
                      ? ` • ${selectedSubjectRecord.name}`
                      : ""}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <BookOpen size={15} />

                  <span>
                    CA components:{" "}
                    {gradingSystem.caComponents.length}
                  </span>
                </div>
              </div>
            </div>

            {/* Scrollable table */}
            <div className="overflow-x-auto">
              <table className="min-w-[1100px] w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-left">
                    <th className="sticky left-0 z-20 min-w-[230px] border-b border-r border-slate-200 bg-slate-50 px-4 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Student
                    </th>

                    {gradingSystem.caComponents.map(
                      (component) => (
                        <th
                          key={component.name}
                          className="min-w-[130px] border-b border-slate-200 px-4 py-4 text-center text-xs font-semibold uppercase tracking-wide text-slate-500"
                        >
                          <div>
                            {component.name}
                          </div>

                          <div className="mt-1 text-[10px] font-normal normal-case text-slate-400">
                            Max {component.maximum}
                          </div>
                        </th>
                      )
                    )}

                    <th className="min-w-[100px] border-b border-slate-200 px-4 py-4 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                      CA
                      <div className="mt-1 text-[10px] font-normal normal-case text-slate-400">
                        / {gradingSystem.caMaximum}
                      </div>
                    </th>

                    <th className="min-w-[130px] border-b border-slate-200 px-4 py-4 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Exam
                      <div className="mt-1 text-[10px] font-normal normal-case text-slate-400">
                        / {gradingSystem.examMaximum}
                      </div>
                    </th>

                    <th className="min-w-[100px] border-b border-slate-200 px-4 py-4 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Total
                    </th>

                    <th className="min-w-[100px] border-b border-slate-200 px-4 py-4 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Grade
                    </th>

                    <th className="min-w-[150px] border-b border-slate-200 px-4 py-4 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Remark
                    </th>

                    <th className="min-w-[120px] border-b border-slate-200 px-4 py-4 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {roster.map((item) => {
                    const student = item.student;

                    const studentId = student._id;

                    const gradeRule =
                      calculateGrade(studentId);

                    const ca = calculateCa(studentId);

                    const total =
                      calculateTotal(studentId);

                    const existingStatus =
                      item.result?.status;

                    return (
                      <tr
                        key={studentId}
                        className="border-b border-slate-100 last:border-b-0"
                      >
                        {/* Student */}
                        <td className="sticky left-0 z-10 border-r border-slate-100 bg-white px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-sm font-semibold text-emerald-700">
                              {student.firstName?.[0] ||
                                ""}
                              {student.lastName?.[0] ||
                                ""}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-slate-800">
                                {student.firstName}{" "}
                                {student.lastName}
                              </p>

                              <p className="mt-0.5 text-xs text-slate-400">
                                {student.studentId ||
                                  student.admissionNumber ||
                                  "Student"}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* CA components */}
                        {gradingSystem.caComponents.map(
                          (component) => {
                            const value =
                              getStudentScores(
                                studentId
                              ).assessments[
                                component.name
                              ];

                            return (
                              <td
                                key={component.name}
                                className="px-4 py-4"
                              >
                                <input
                                  type="number"
                                  min="0"
                                  max={
                                    component.maximum
                                  }
                                  step="0.01"
                                  value={
                                    value ?? ""
                                  }
                                  onChange={(e) =>
                                    updateAssessmentScore(
                                      studentId,
                                      component.name,
                                      e.target.value
                                    )
                                  }
                                  disabled={
                                    existingStatus ===
                                      "pending_review" ||
                                    existingStatus ===
                                      "published" ||
                                    existingStatus ===
                                      "locked"
                                  }
                                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-center text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                                />
                              </td>
                            );
                          }
                        )}

                        {/* CA */}
                        <td className="px-4 py-4 text-center">
                          <span className="font-semibold text-slate-800">
                            {ca}
                          </span>
                        </td>

                        {/* Exam */}
                        <td className="px-4 py-4">
                          <input
                            type="number"
                            min="0"
                            max={
                              gradingSystem.examMaximum
                            }
                            step="0.01"
                            value={
                              getStudentScores(
                                studentId
                              ).examScore ?? ""
                            }
                            onChange={(e) =>
                              updateExamScore(
                                studentId,
                                e.target.value
                              )
                            }
                            disabled={
                              existingStatus ===
                                "pending_review" ||
                              existingStatus ===
                                "published" ||
                              existingStatus ===
                                "locked"
                            }
                            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-center text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                          />
                        </td>

                        {/* Total */}
                        <td className="px-4 py-4 text-center">
                          <span className="font-bold text-slate-900">
                            {total}
                          </span>
                        </td>

                        {/* Grade */}
                        <td className="px-4 py-4 text-center">
                          {gradeRule ? (
                            <span className="inline-flex min-w-9 items-center justify-center rounded-lg bg-emerald-50 px-2.5 py-1.5 text-sm font-bold text-emerald-700">
                              {gradeRule.grade}
                            </span>
                          ) : (
                            <span className="text-slate-400">
                              —
                            </span>
                          )}
                        </td>

                        {/* Remark */}
                        <td className="px-4 py-4 text-center">
                          <span className="text-xs font-medium text-slate-600">
                            {gradeRule?.remark ||
                              "—"}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-4 text-center">
                          {existingStatus ? (
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${
                                existingStatus ===
                                "draft"
                                  ? "bg-amber-50 text-amber-700"
                                  : existingStatus ===
                                    "pending_review"
                                  ? "bg-blue-50 text-blue-700"
                                  : existingStatus ===
                                    "published"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {existingStatus.replace(
                                "_",
                                " "
                              )}
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

            {/* Footer */}
            <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-xs text-slate-500">
                Results are saved as drafts first. You can submit them
                for review after saving.
              </div>

              <button
                type="button"
                onClick={() =>
                  saveResults({
                    submitForReview: false,
                  })
                }
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Save Results
                  </>
                )}
              </button>
            </div>
          </section>
        )}

        {/* Empty state */}
        {!loadingRoster &&
          selectedClass &&
          selectedSubject &&
          selectedSession &&
          selectedTerm &&
          roster.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                <Users size={28} />
              </div>

              <h2 className="mt-5 text-lg font-semibold text-slate-900">
                No students found
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                There are currently no active students assigned to this
                class.
              </p>
            </div>
          )}
      </div>
    </main>
  );
}