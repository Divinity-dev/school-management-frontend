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
import ReportCardDocument from "@/components/results/ReportCardDocument";

export default function TeacherResults() {
const searchParams = useSearchParams();

const classId = searchParams.get("classId");
const subjectAssignmentId = searchParams.get("subjectAssignmentId");

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
const [scores, setScores] = useState({});

const [loadingInitial, setLoadingInitial] = useState(true);
const [loadingRoster, setLoadingRoster] = useState(false);
const [saving, setSaving] = useState(false);
const [submitting, setSubmitting] = useState(false);

const [reportCard, setReportCard] = useState(null);
const [loadingReportCardStudentId, setLoadingReportCardStudentId] =
useState("");
const [reportCardError, setReportCardError] = useState("");

const [error, setError] = useState("");
const [message, setMessage] = useState("");

const isBusy = saving || submitting;

const getId = (value) => {
if (!value) return "";
return (value._id || value).toString();
};

const getErrorMessage = (err, fallback) =>
err.response?.data?.message || fallback;

const getResultStatus = (item) => item?.result?.status || "new";

const isEditable = (item) =>
["new", "draft"].includes(getResultStatus(item));

const hasSelection = Boolean(
selectedClass &&
selectedSubject &&
selectedSession &&
selectedTerm
);

/* =========================================================
LOAD INITIAL DATA
========================================================= */

useEffect(() => {
let cancelled = false;


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

    if (cancelled) return;

    const loadedClasses = classesResponse.data?.classes || [];

    const loadedAssignments =
      assignmentsResponse.data?.subjectAssignments ||
      assignmentsResponse.data?.assignments ||
      [];

    const loadedSessions = sessionsResponse.data?.sessions || [];
    const loadedTerms = termsResponse.data?.terms || [];

    setClasses(loadedClasses);
    setSubjectAssignments(loadedAssignments);
    setSessions(loadedSessions);
    setTerms(loadedTerms);

    if (subjectAssignmentId) {
      const assignment = loadedAssignments.find(
        (item) => getId(item._id) === subjectAssignmentId
      );

      if (assignment) {
        setSelectedClass(getId(assignment.schoolClass));
        setSelectedSubject(getId(assignment.subject));
        setSelectedSession(getId(assignment.academicSession));
      }
    }

    if (classId) {
      const selectedClassRecord = loadedClasses.find(
        (item) => getId(item._id) === classId
      );

      if (selectedClassRecord) {
        setSelectedClass(classId);

        const classSession = getId(
          selectedClassRecord.academicSession
        );

        if (classSession) {
          setSelectedSession(classSession);
        }
      }
    }
  } catch (err) {
    if (!cancelled) {
      setError(
        getErrorMessage(
          err,
          "Unable to load the result setup data."
        )
      );
    }
  } finally {
    if (!cancelled) setLoadingInitial(false);
  }
};

loadInitialData();

return () => {
  cancelled = true;
};


}, [classId, subjectAssignmentId]);

/* =========================================================
ASSIGNMENTS AND TERMS
========================================================= */

const myAssignments = useMemo(
() =>
subjectAssignments.filter(
(assignment) => assignment.isActive !== false
),
[subjectAssignments]
);

const availableSubjects = useMemo(() => {
if (!selectedClass) return [];


return myAssignments.filter((assignment) => {
  const classMatches =
    getId(assignment.schoolClass) === selectedClass;

  const sessionMatches =
    !selectedSession ||
    getId(assignment.academicSession) === selectedSession;

  return classMatches && sessionMatches;
});


}, [myAssignments, selectedClass, selectedSession]);

const availableTerms = useMemo(() => {
if (!selectedSession) return terms;


return terms.filter(
  (term) => getId(term.academicSession) === selectedSession
);


}, [terms, selectedSession]);

const selectedClassRecord = classes.find(
(item) => getId(item._id) === selectedClass
);

const selectedAssignment = myAssignments.find(
(assignment) =>
getId(assignment.schoolClass) === selectedClass &&
getId(assignment.subject) === selectedSubject &&
(!selectedSession ||
getId(assignment.academicSession) === selectedSession)
);

const selectedSubjectRecord = selectedAssignment?.subject;

const displayClassName = selectedClassRecord
? `${selectedClassRecord.name || ""}${
        selectedClassRecord.arm
          ? ` ${selectedClassRecord.arm}`
          : ""
      }`.trim()
: "";

/* =========================================================
SELECTION HANDLERS
========================================================= */

const clearResults = () => {
setRoster([]);
setGradingSystem(null);
setScores({});
setError("");
setMessage("");
setReportCardError("");
};

const handleClassChange = (value) => {
setSelectedClass(value);
setSelectedSubject("");
clearResults();


const selected = classes.find(
  (item) => getId(item._id) === value
);

const session = getId(selected?.academicSession);

if (session) {
  setSelectedSession(session);
} else {
  setSelectedSession("");
  setSelectedTerm("");
}


};

const handleSessionChange = (value) => {
setSelectedSession(value);
setSelectedSubject("");
setSelectedTerm("");
clearResults();
};

/* =========================================================
LOAD ROSTER AND EXISTING RESULTS
========================================================= */

const loadRoster = async () => {
if (!hasSelection) {
setError(
"Please select a class, subject, academic session and academic term."
);
return;
}


try {
  setLoadingRoster(true);
  setError("");
  setMessage("");
  setReportCardError("");

  const response = await api.get("/results/teacher-roster", {
    params: {
      schoolClass: selectedClass,
      subject: selectedSubject,
      academicSession: selectedSession,
      academicTerm: selectedTerm,
    },
  });

  const loadedRoster = response.data?.roster || [];
  const loadedGradingSystem = response.data?.gradingSystem || null;

  const initialScores = {};

  loadedRoster.forEach((item) => {
    const studentId = getId(item.student);

    if (!studentId) return;

    const assessments = {};

    (item.result?.assessmentScores || []).forEach((assessment) => {
      const matchingComponent =
        loadedGradingSystem?.caComponents?.find(
          (component) =>
            component.name?.trim().toLowerCase() ===
            assessment.name?.trim().toLowerCase()
        );

      if (matchingComponent) {
        assessments[matchingComponent.name] =
          assessment.score ?? "";
      }
    });

    initialScores[studentId] = {
      assessments,
      examScore: item.result?.examScore ?? "",
    };
  });

  setRoster(loadedRoster);
  setGradingSystem(loadedGradingSystem);
  setScores(initialScores);

  if (!loadedRoster.length) {
    setMessage("No active students were found for this class.");
  }
} catch (err) {
  setRoster([]);
  setGradingSystem(null);
  setScores({});
  setError(
    getErrorMessage(
      err,
      "Unable to load the student roster."
    )
  );
} finally {
  setLoadingRoster(false);
}


};

/* =========================================================
VIEW AND PRINT PUBLISHED REPORT CARD
========================================================= */

const handleViewReportCard = async (item) => {
const studentId = getId(item.student);
const status = getResultStatus(item);


if (!studentId) {
  setReportCardError("Unable to identify this student.");
  return;
}

if (!["published", "locked"].includes(status)) {
  setReportCardError(
    "This student's report card is unavailable until the school administrator publishes the results."
  );
  return;
}

if (!selectedSession || !selectedTerm) {
  setReportCardError(
    "Select an academic session and term before viewing a report card."
  );
  return;
}

try {
  setLoadingReportCardStudentId(studentId);
  setReportCardError("");
  setError("");

  const response = await api.get("/results/report-card", {
    params: {
      studentId,
      academicSession: selectedSession,
      academicTerm: selectedTerm,
    },
  });

  const report = response.data?.data;

  if (!report) {
    throw new Error("The report card data was not returned.");
  }

  setReportCard(report);
} catch (err) {
  setReportCardError(
    getErrorMessage(
      err,
      "Unable to load this student's report card."
    )
  );
} finally {
  setLoadingReportCardStudentId("");
}


};

/* =========================================================
SCORE STATE
========================================================= */

const getStudentScores = (studentId) =>
scores[studentId] || {
assessments: {},
examScore: "",
};

const updateAssessmentScore = (
studentId,
componentName,
value
) => {
setScores((current) => ({
...current,
[studentId]: {
...(current[studentId] || {
assessments: {},
examScore: "",
}),
assessments: {
...(current[studentId]?.assessments || {}),
[componentName]: value,
},
},
}));


setMessage("");
setError("");


};

const updateExamScore = (studentId, value) => {
setScores((current) => ({
...current,
[studentId]: {
...(current[studentId] || {
assessments: {},
examScore: "",
}),
examScore: value,
},
}));


setMessage("");
setError("");


};

/* =========================================================
CALCULATIONS
========================================================= */

const calculateCa = (studentId) => {
const studentScores = getStudentScores(studentId);


return (gradingSystem?.caComponents || []).reduce(
  (total, component) => {
    const raw = studentScores.assessments[component.name];

    if (raw === "" || raw === null || raw === undefined) {
      return total;
    }

    const value = Number(raw);
    return total + (Number.isFinite(value) ? value : 0);
  },
  0
);


};

const calculateTotal = (studentId) => {
const rawExam = getStudentScores(studentId).examScore;
const exam =
rawExam === "" || rawExam === null ? 0 : Number(rawExam);


return (
  calculateCa(studentId) +
  (Number.isFinite(exam) ? exam : 0)
);


};

const calculateGrade = (studentId) => {
if (!gradingSystem?.gradingScale) return null;


const total = calculateTotal(studentId);

return (
  gradingSystem.gradingScale.find(
    (rule) =>
      total >= Number(rule.min) &&
      total <= Number(rule.max)
  ) || null
);


};

const formatScore = (value) => {
if (!Number.isFinite(value)) return "—";


return Number.isInteger(value)
  ? value
  : Number(value.toFixed(2));


};

/* =========================================================
VALIDATE SCORES
========================================================= */

const validateResults = () => {
if (!roster.length) {
return "There are no students in this class.";
}


if (!gradingSystem?.caComponents?.length) {
  return "The school's CA grading configuration is unavailable.";
}

for (const item of roster) {
  const studentId = getId(item.student);
  if (!studentId) continue;
  if (!isEditable(item)) continue;

  const studentName =
    `${item.student.firstName || ""} ${
      item.student.lastName || ""
    }`.trim() || "This student";

  const studentScores = getStudentScores(studentId);

  for (const component of gradingSystem.caComponents) {
    const raw = studentScores.assessments[component.name];

    if (raw === "" || raw === null || raw === undefined) {
      return `Enter a score for ${studentName} - ${component.name}.`;
    }

    const value = Number(raw);

    if (
      !Number.isFinite(value) ||
      value < 0 ||
      value > Number(component.maximum)
    ) {
      return `${component.name} for ${studentName} must be between 0 and ${component.maximum}.`;
    }
  }

  const rawExam = studentScores.examScore;

  if (rawExam === "" || rawExam === null || rawExam === undefined) {
    return `Enter an exam score for ${studentName}.`;
  }

  const exam = Number(rawExam);

  if (
    !Number.isFinite(exam) ||
    exam < 0 ||
    exam > Number(gradingSystem.examMaximum)
  ) {
    return `Exam score for ${studentName} must be between 0 and ${gradingSystem.examMaximum}.`;
  }
}

return null;


};

/* =========================================================
SAVE DRAFTS / SUBMIT FOR REVIEW
========================================================= */

const saveResults = async (submitForReview = false) => {
if (isBusy) return;


const editableItems = roster.filter(isEditable);

if (!editableItems.length) {
  setError(
    "There are no editable draft results. Submitted or published results cannot be changed here."
  );
  return;
}

const validationError = validateResults();

if (validationError) {
  setError(validationError);
  return;
}

try {
  if (submitForReview) {
    setSubmitting(true);
  } else {
    setSaving(true);
  }

  setError("");
  setMessage("");

  const results = editableItems.map((item) => {
    const studentId = getId(item.student);
    const studentScores = getStudentScores(studentId);

    return {
      student: studentId,
      assessmentScores: gradingSystem.caComponents.map(
        (component) => ({
          name: component.name,
          score: Number(
            studentScores.assessments[component.name]
          ),
        })
      ),
      examScore: Number(studentScores.examScore),
    };
  });

  const saveResponse = await api.post(
    "/results/teacher-results/submit",
    {
      schoolClass: selectedClass,
      subject: selectedSubject,
      academicSession: selectedSession,
      academicTerm: selectedTerm,
      results,
    }
  );

  if (!submitForReview) {
    setMessage(
      saveResponse.data?.message ||
        "Results saved as drafts successfully."
    );
    await loadRoster();
    return;
  }

  const rosterResponse = await api.get(
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

  const savedRoster = rosterResponse.data?.roster || [];

  const drafts = savedRoster.filter(
    (item) =>
      item.result?._id &&
      item.result.status === "draft" &&
      editableItems.some(
        (editable) =>
          getId(editable.student) === getId(item.student)
      )
  );

  if (!drafts.length) {
    await loadRoster();
    setError(
      "The results were saved, but no draft results were found to submit. Check that the backend saves teacher results with status 'draft'."
    );
    return;
  }

  const submissionResults = await Promise.allSettled(
    drafts.map((item) =>
      api.post(`/results/${item.result._id}/submit`)
    )
  );

  const successful = submissionResults.filter(
    (result) => result.status === "fulfilled"
  ).length;

  const failed = submissionResults.length - successful;

  await loadRoster();

  if (failed === 0) {
    setMessage(
      `Successfully submitted ${successful} result${
        successful === 1 ? "" : "s"
      } for administrator review.`
    );
  } else {
    setError(
      `${successful} result${
        successful === 1 ? "" : "s"
      } submitted successfully; ${failed} could not be submitted. Reload the roster and check their statuses.`
    );
  }
} catch (err) {
  setError(
    getErrorMessage(
      err,
      "Failed to save or submit results."
    )
  );
} finally {
  setSaving(false);
  setSubmitting(false);
}


};

/* =========================================================
LOADING SCREEN
========================================================= */

if (loadingInitial) {
return ( <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8"> <div className="mx-auto flex min-h-[400px] max-w-7xl items-center justify-center"> <div className="flex items-center gap-3 text-slate-500"> <Loader2 className="h-5 w-5 animate-spin" /> <span>Loading result setup...</span> </div> </div> </main>
);
}

/* =========================================================
REPORT CARD PREVIEW
========================================================= */

if (reportCard) {
return ( <main className="min-h-screen bg-slate-100 px-4 py-6 sm:px-6"> <div className="mx-auto max-w-5xl">
<button
type="button"
onClick={() => {
setReportCard(null);
setReportCardError("");
}}
className="mb-5 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
> <ArrowLeft size={17} />
Back to Teacher Results </button>


      <ReportCardDocument
        report={reportCard}
        showToolbar
        backHref={null}
      />
    </div>
  </main>
);


}

/* =========================================================
PAGE
========================================================= */

return ( <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8"> <div className="mx-auto max-w-[1500px]"> <div className="mb-8"> <Link
         href="/dashboard/teacher"
         className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-emerald-600"
       > <ArrowLeft size={17} />
Back to Dashboard </Link>


      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-600">
            Teacher Portal
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Student Results
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Enter scores, save drafts, submit completed results
            for administrator review, and print published report
            cards.
          </p>
        </div>

        {roster.length > 0 && (
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
            <Users size={18} className="text-emerald-600" />
            <span className="text-sm font-medium text-slate-700">
              {roster.length}{" "}
              {roster.length === 1 ? "Student" : "Students"}
            </span>
          </div>
        )}
      </div>
    </div>

    {error && (
      <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        <AlertCircle size={18} className="mt-0.5 shrink-0" />
        <p>{error}</p>
      </div>
    )}

    {reportCardError && (
      <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        <AlertCircle size={18} className="mt-0.5 shrink-0" />
        <div className="flex-1">
          <p>{reportCardError}</p>
        </div>
        <button
          type="button"
          onClick={() => setReportCardError("")}
          className="font-semibold hover:underline"
        >
          Dismiss
        </button>
      </div>
    )}

    {message && (
      <div className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
        <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
        <p>{message}</p>
      </div>
    )}

    {/* RESULT SETUP */}

    <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex items-center gap-3">
        <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
          <BookOpen size={20} />
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
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Class
          </label>
          <div className="relative">
            <select
              value={selectedClass}
              onChange={(event) =>
                handleClassChange(event.target.value)
              }
              className="w-full appearance-none rounded-xl border border-slate-300 bg-white px-4 py-3 pr-10 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            >
              <option value="">Select class</option>
              {classes
                .filter((item) => item.isActive !== false)
                .map((schoolClass) => (
                  <option
                    key={schoolClass._id}
                    value={schoolClass._id}
                  >
                    {schoolClass.name}
                    {schoolClass.arm ? ` ${schoolClass.arm}` : ""}
                  </option>
                ))}
            </select>
            <ChevronDown
              size={17}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Subject
          </label>
          <div className="relative">
            <select
              value={selectedSubject}
              onChange={(event) => {
                setSelectedSubject(event.target.value);
                clearResults();
              }}
              disabled={!selectedClass}
              className="w-full appearance-none rounded-xl border border-slate-300 bg-white px-4 py-3 pr-10 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-100"
            >
              <option value="">Select subject</option>
              {availableSubjects.map((assignment) => (
                <option
                  key={assignment._id}
                  value={getId(assignment.subject)}
                >
                  {assignment.subject?.name || "Subject"}
                </option>
              ))}
            </select>
            <ChevronDown
              size={17}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Academic Session
          </label>
          <div className="relative">
            <select
              value={selectedSession}
              onChange={(event) =>
                handleSessionChange(event.target.value)
              }
              className="w-full appearance-none rounded-xl border border-slate-300 bg-white px-4 py-3 pr-10 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            >
              <option value="">Select session</option>
              {sessions
                .filter((session) => session.isActive !== false)
                .map((session) => (
                  <option key={session._id} value={session._id}>
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

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Academic Term
          </label>
          <div className="relative">
            <select
              value={selectedTerm}
              onChange={(event) => {
                setSelectedTerm(event.target.value);
                clearResults();
              }}
              disabled={!selectedSession}
              className="w-full appearance-none rounded-xl border border-slate-300 bg-white px-4 py-3 pr-10 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-100"
            >
              <option value="">Select term</option>
              {availableTerms
                .filter((term) => term.isActive !== false)
                .map((term) => (
                  <option key={term._id} value={term._id}>
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
          disabled={loadingRoster || isBusy || !hasSelection}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loadingRoster ? (
            <>
              <Loader2 size={16} className="animate-spin" />
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

    {/* GRADING SUMMARY */}

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

    {/* RESULTS TABLE */}

    {roster.length > 0 && gradingSystem && (
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
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
                {gradingSystem.caComponents?.length || 0}
              </span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] border-collapse">
            <thead>
              <tr className="bg-slate-50 text-left">
                <th className="sticky left-0 z-20 min-w-[230px] border-b border-r border-slate-200 bg-slate-50 px-4 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Student
                </th>

                {gradingSystem.caComponents.map((component) => (
                  <th
                    key={component.name}
                    className="min-w-[130px] border-b border-slate-200 px-4 py-4 text-center text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
                    <div>{component.name}</div>
                    <div className="mt-1 text-[10px] font-normal normal-case text-slate-400">
                      Max {component.maximum}
                    </div>
                  </th>
                ))}

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

                <th className="min-w-[130px] border-b border-slate-200 px-4 py-4 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </th>
              </tr>
            </thead>

            <tbody>
              {roster.map((item) => {
                const student = item.student;
                const studentId = getId(student);
                const studentScores = getStudentScores(studentId);
                const gradeRule = calculateGrade(studentId);
                const ca = calculateCa(studentId);
                const total = calculateTotal(studentId);
                const status = getResultStatus(item);
                const editable = isEditable(item);
                const canPrintReportCard = [
                  "published",
                  "locked",
                ].includes(status);

                return (
                  <tr
                    key={studentId}
                    className="border-b border-slate-100 last:border-b-0"
                  >
                    <td className="sticky left-0 z-10 border-r border-slate-100 bg-white px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-sm font-semibold text-emerald-700">
                          {student.firstName?.[0] || ""}
                          {student.lastName?.[0] || ""}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-800">
                            {student.firstName} {student.lastName}
                          </p>

                          <p className="mt-0.5 text-xs text-slate-400">
                            {student.studentId ||
                              student.admissionNumber ||
                              "Student"}
                          </p>

                          {canPrintReportCard && (
                            <button
                              type="button"
                              onClick={() =>
                                handleViewReportCard(item)
                              }
                              disabled={
                                isBusy ||
                                loadingRoster ||
                                Boolean(
                                  loadingReportCardStudentId
                                )
                              }
                              className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {loadingReportCardStudentId ===
                              studentId ? (
                                <Loader2
                                  size={13}
                                  className="animate-spin"
                                />
                              ) : (
                                <FileText size={13} />
                              )}

                              {loadingReportCardStudentId ===
                              studentId
                                ? "Loading..."
                                : "View Report Card"}
                            </button>
                          )}
                        </div>
                      </div>
                    </td>

                    {gradingSystem.caComponents.map((component) => (
                      <td
                        key={component.name}
                        className="px-4 py-4"
                      >
                        <input
                          type="number"
                          min="0"
                          max={component.maximum}
                          step="0.01"
                          value={
                            studentScores.assessments[
                              component.name
                            ] ?? ""
                          }
                          onChange={(event) =>
                            updateAssessmentScore(
                              studentId,
                              component.name,
                              event.target.value
                            )
                          }
                          disabled={!editable || isBusy}
                          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-center text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                        />
                      </td>
                    ))}

                    <td className="px-4 py-4 text-center">
                      <span className="font-semibold text-slate-800">
                        {formatScore(ca)}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <input
                        type="number"
                        min="0"
                        max={gradingSystem.examMaximum}
                        step="0.01"
                        value={studentScores.examScore ?? ""}
                        onChange={(event) =>
                          updateExamScore(
                            studentId,
                            event.target.value
                          )
                        }
                        disabled={!editable || isBusy}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-center text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                      />
                    </td>

                    <td className="px-4 py-4 text-center">
                      <span className="font-bold text-slate-900">
                        {formatScore(total)}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-center">
                      {gradeRule ? (
                        <span className="inline-flex min-w-9 items-center justify-center rounded-lg bg-emerald-50 px-2.5 py-1.5 text-sm font-bold text-emerald-700">
                          {gradeRule.grade}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    <td className="px-4 py-4 text-center">
                      <span className="text-xs font-medium text-slate-600">
                        {gradeRule?.remark || "—"}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-center">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${
                          status === "draft"
                            ? "bg-amber-50 text-amber-700"
                            : status === "pending_review"
                            ? "bg-blue-50 text-blue-700"
                            : status === "published"
                            ? "bg-emerald-50 text-emerald-700"
                            : status === "locked"
                            ? "bg-slate-200 text-slate-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {status === "new"
                          ? "New"
                          : status.replaceAll("_", " ")}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-4 border-t border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-xl text-xs leading-5 text-slate-500">
            Save your work as drafts while entering scores. When all
            scores are complete, submit the results for the school
            administrator to review and publish. Report cards become
            available after results are published or locked.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => saveResults(false)}
              disabled={isBusy || !roster.some(isEditable)}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />
                  Saving Draft...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save Draft
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => saveResults(true)}
              disabled={isBusy || !roster.some(isEditable)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />
                  Submitting...
                </>
              ) : (
                <>
                  <Send size={16} />
                  Submit for Review
                </>
              )}
            </button>
          </div>
        </div>
      </section>
    )}

    {!loadingRoster && hasSelection && roster.length === 0 && (
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
