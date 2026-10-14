
"use client";

import Link from "next/link";
import { ArrowLeft, GraduationCap, Printer } from "lucide-react";

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString("en-NG", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
};

const formatScore = (value) => {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  const number = Number(value);

  return Number.isFinite(number)
    ? Number(number.toFixed(2)).toString()
    : "—";
};

const formatPercentage = (value) =>
  `${Number(value || 0).toFixed(2)}%`;

const joinAddress = (school) =>
  [
    school?.address,
    school?.city,
    school?.state,
    school?.country,
  ]
    .filter(Boolean)
    .join(", ");

function SectionHeading({ title }) {
  return (
    <h2 className="border-b border-slate-300 pb-2 text-sm font-extrabold uppercase tracking-wide text-slate-800">
      {title}
    </h2>
  );
}

function InfoField({ label, value }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-1 break-words border-b border-dotted border-slate-300 pb-1 text-xs font-semibold text-slate-900">
        {value || "—"}
      </p>
    </div>
  );
}

function Metric({ label, value, shaded = false }) {
  return (
    <div
      className={`border border-slate-300 p-2 text-center ${
        shaded ? "bg-slate-50" : ""
      }`}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-sm font-extrabold text-slate-900">
        {value}
      </p>
    </div>
  );
}

/**
 * Gets an individual CA score from the assessment components.
 *
 * Expected data:
 * subject.assessmentScores = [
 *   { name: "First CA", score: 15 },
 *   { name: "Second CA", score: 20 }
 * ]
 *
 * The configured component names can also be supplied through
 * subject.gradingSystem.caComponents or gradingSystem.caComponents.
 */
const getCaComponentScore = (
  subject,
  position,
  fallbackGradingSystem
) => {
  const assessmentScores = Array.isArray(subject?.assessmentScores)
    ? subject.assessmentScores
    : [];

  const components =
    subject?.gradingSystem?.caComponents ??
    fallbackGradingSystem?.caComponents ??
    [];

  const configuredComponent = components[position];

  if (configuredComponent?.name) {
    const matchingScore = assessmentScores.find(
      (item) =>
        item?.name === configuredComponent.name ||
        item?.component === configuredComponent.name
    );

    if (matchingScore) {
      return matchingScore.score;
    }
  }

  // Fallback when scores are already ordered by CA component.
  return assessmentScores[position]?.score;
};

export default function ReportCardDocument({
  report,
  backHref,
  backLabel = "Back",
  showToolbar = true,
}) {
  if (!report) return null;

  const {
    school,
    student,
    academicPeriod,
    attendance,
    subjects = [],
    summary,
    gradingSystem,
    classTeacherRemark,
  } = report;

  const schoolAddress = joinAddress(school);

  const aggregateScore = subjects.reduce(
    (total, subject) => total + (Number(subject.total) || 0),
    0
  );

  const maximumPossibleScore = subjects.reduce((total, subject) => {
    const maximum =
      subject.totalMaximum ??
      subject.maximumScore ??
      subject.gradingSystem?.totalMaximum ??
      gradingSystem?.totalMaximum ??
      100;

    return total + (Number(maximum) || 0);
  }, 0);

  const formatAggregateScore = (value) =>
    Number(value || 0).toLocaleString("en-NG", {
      maximumFractionDigits: 2,
    });

  const studentClass = [
    student?.class?.name,
    student?.class?.arm,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="report-card-page min-h-screen bg-slate-100 px-3 py-6 sm:px-6 lg:px-8">
      <style jsx global>{`
        @page {
          size: A4 portrait;
          margin: 10mm;
        }

        @media print {
          html,
          body {
            background: #fff !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          body * {
            visibility: hidden;
          }

          .report-card-paper,
          .report-card-paper * {
            visibility: visible;
          }

          .report-card-page {
            background: #fff !important;
            padding: 0 !important;
            margin: 0 !important;
            min-height: 0 !important;
          }

          .report-card-toolbar {
            display: none !important;
          }

          .report-card-paper {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            max-width: none !important;
            min-height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            overflow: visible !important;
          }

          .report-card-paper table {
            width: 100%;
          }

          .report-card-paper tr,
          .report-card-paper section,
          .report-card-paper header {
            break-inside: avoid;
          }

          .report-card-paper img {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>

      {showToolbar && (
        <div className="report-card-toolbar mx-auto mb-5 flex max-w-[210mm] flex-wrap items-center justify-between gap-3">
          {backHref ? (
            <Link
              href={backHref}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4" />
              {backLabel}
            </Link>
          ) : (
            <span />
          )}

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
          >
            <Printer className="h-4 w-4" />
            Print / Save as PDF
          </button>
        </div>
      )}

      <article className="report-card-paper mx-auto min-h-[297mm] w-full max-w-[210mm] overflow-hidden rounded-sm border border-slate-200 bg-white p-5 text-slate-900 shadow-lg sm:p-8">
        {/* School header */}
        <header className="border-b-2 border-slate-900 pb-4">
          <div className="flex items-center gap-4">
            {school?.logo ? (
              <img
                src={school.logo}
                alt={`${school.name || "School"} logo`}
                className="h-20 w-20 shrink-0 object-contain"
              />
            ) : (
              <div className="flex h-20 w-20 shrink-0 items-center justify-center border border-slate-200 bg-slate-50">
                <GraduationCap className="h-10 w-10 text-slate-400" />
              </div>
            )}

            <div className="min-w-0 flex-1 text-center">
              <h1 className="text-xl font-extrabold uppercase leading-tight tracking-wide sm:text-2xl">
                {school?.name || "School Name"}
              </h1>

              {schoolAddress && (
                <p className="mt-2 text-xs leading-5 text-slate-600">
                  {schoolAddress}
                </p>
              )}

              <div className="mt-1 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-slate-600">
                {school?.phone && <span>{school.phone}</span>}
                {school?.email && <span>{school.email}</span>}
              </div>
            </div>
          </div>

          <div className="mt-4 bg-slate-900 px-3 py-2 text-center text-white">
            <h2 className="text-base font-bold uppercase tracking-[0.15em]">
              Student Academic Report Card
            </h2>

            <p className="mt-1 text-xs font-medium">
              {academicPeriod?.sessionName || "Academic Session"}{" "}
              • {academicPeriod?.termName || "Academic Term"}
            </p>
          </div>
        </header>

        {/* Student information */}
        <section className="mt-5">
          <SectionHeading title="Student Information" />

          <div className="mt-3 flex items-start gap-4">
            <div className="shrink-0">
              {student?.profileImage ? (
                <img
                  src={student.profileImage}
                  alt={`${student?.name || "Student"} passport photograph`}
                  className="h-28 w-24 rounded-md border border-slate-300 bg-white p-1 object-cover"
                />
              ) : (
                <div className="flex h-28 w-24 flex-col items-center justify-center rounded-md border border-dashed border-slate-300 bg-slate-50 text-slate-400">
                  <GraduationCap className="h-8 w-8" />
                  <span className="mt-1 text-center text-[9px]">
                    No Photo
                  </span>
                </div>
              )}
            </div>

            <div className="grid min-w-0 flex-1 grid-cols-2 gap-x-4 gap-y-3">
              <InfoField label="Student Name" value={student?.name} />
              <InfoField label="Student Number" value={student?.studentId} />
              <InfoField label="Class" value={studentClass} />
              <InfoField label="Section" value={student?.class?.section} />

              <InfoField
                label="Date of Birth"
                value={formatDate(student?.dateOfBirth)}
              />

              <InfoField
                label="Academic Session"
                value={academicPeriod?.sessionName}
              />

              <InfoField
                label="Academic Term"
                value={academicPeriod?.termName}
              />
            </div>
          </div>
        </section>

        {/* Attendance summary and performance metrics */}
        <section className="mt-5">
          <SectionHeading title="Attendance Summary" />

          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Metric
              label="Subjects Offered"
              value={summary?.subjectCount ?? subjects.length}
              shaded
            />

            <Metric
              label="Aggregate Score"
              value={`${formatAggregateScore(aggregateScore)} / ${formatAggregateScore(maximumPossibleScore)}`}
              shaded
            />

            <Metric
              label="Average"
              value={formatPercentage(
                summary?.averagePercentage ??
                  (maximumPossibleScore > 0
                    ? (aggregateScore / maximumPossibleScore) * 100
                    : 0)
              )}
              shaded
            />

            <Metric
              label="Overall Grade"
              value={summary?.overallGrade || "—"}
              shaded
            />
          </div>
        </section>

        {/* Subject results */}
        <section className="mt-6">
          <SectionHeading title="Academic Performance" />

          <div className="mt-3">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border border-slate-300 px-2 py-2 text-center">
                    S/N
                  </th>

                  <th className="border border-slate-300 px-2 py-2">
                    Subject
                  </th>

                  <th className="border border-slate-300 px-2 py-2 text-center">
                    First CA
                  </th>

                  <th className="border border-slate-300 px-2 py-2 text-center">
                    Second CA
                  </th>

                  <th className="border border-slate-300 px-2 py-2 text-center">
                    Exam
                  </th>

                  <th className="border border-slate-300 px-2 py-2 text-center">
                    Total
                  </th>

                  <th className="border border-slate-300 px-2 py-2 text-center">
                    Grade
                  </th>

                  <th className="border border-slate-300 px-2 py-2">
                    Remark
                  </th>
                </tr>
              </thead>

              <tbody>
                {subjects.map((subject, index) => (
                  <tr
                    key={subject.resultId || `${subject.subject}-${index}`}
                  >
                    <td className="border border-slate-300 px-2 py-2 text-center">
                      {index + 1}
                    </td>

                    <td className="border border-slate-300 px-2 py-2 font-medium">
                      {subject.subject}
                    </td>

                    <td className="border border-slate-300 px-2 py-2 text-center">
                      {formatScore(
                        getCaComponentScore(subject, 0, gradingSystem)
                      )}
                    </td>

                    <td className="border border-slate-300 px-2 py-2 text-center">
                      {formatScore(
                        getCaComponentScore(subject, 1, gradingSystem)
                      )}
                    </td>

                    <td className="border border-slate-300 px-2 py-2 text-center">
                      {formatScore(subject.examScore)}
                    </td>

                    <td className="border border-slate-300 px-2 py-2 text-center font-bold">
                      {formatScore(subject.total)}
                    </td>

                    <td className="border border-slate-300 px-2 py-2 text-center font-bold">
                      {subject.grade || "—"}
                    </td>

                    <td className="border border-slate-300 px-2 py-2">
                      {subject.remark || "—"}
                    </td>
                  </tr>
                ))}

                {subjects.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="border border-slate-300 px-3 py-6 text-center text-slate-500"
                    >
                      No subject results available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Metric
              label="Subjects"
              value={summary?.subjectCount ?? subjects.length}
              shaded
            />

            <Metric
              label="Total Score"
              value={formatScore(summary?.totalScore)}
              shaded
            />

            <Metric
              label="Average"
              value={formatPercentage(summary?.averagePercentage)}
              shaded
            />

            <Metric
              label="Overall Grade"
              value={summary?.overallGrade || "—"}
              shaded
            />
          </div>

          {summary?.overallRemark && (
            <p className="mt-2 text-xs">
              <strong>Overall Remark:</strong> {summary.overallRemark}
            </p>
          )}
        </section>

        {/* Grading scale and class teacher's remark */}
        <section className="mt-6">
          <SectionHeading title="Grading Scale & Class Teacher's Remark" />

          <div className="mt-3 grid grid-cols-1 items-start gap-4 sm:grid-cols-2">
            <div>
              <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-600">
                Grading Scale
              </h3>

              {gradingSystem?.gradingScale?.length ? (
                <table className="w-full border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="border border-slate-300 px-2 py-1.5 text-center">
                        Score (%)
                      </th>

                      <th className="border border-slate-300 px-2 py-1.5 text-center">
                        Grade
                      </th>

                      <th className="border border-slate-300 px-2 py-1.5">
                        Remark
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {gradingSystem.gradingScale.map((range, index) => (
                      <tr key={`${range.grade}-${index}`}>
                        <td className="border border-slate-300 px-2 py-1.5 text-center">
                          {range.min}–{range.max}
                        </td>

                        <td className="border border-slate-300 px-2 py-1.5 text-center font-semibold">
                          {range.grade}
                        </td>

                        <td className="border border-slate-300 px-2 py-1.5">
                          {range.remark || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="rounded border border-slate-200 p-3 text-xs text-slate-500">
                  No grading scale has been configured.
                </p>
              )}
            </div>

            <div>
              <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-600">
                Class Teacher's Remark
              </h3>

              <div className="min-h-32 rounded border border-slate-300 p-3">
                <p className="whitespace-pre-wrap text-sm leading-6 text-slate-800">
                  {classTeacherRemark ||
                    "No class teacher's remark has been submitted."}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Principal's signature and official stamp */}
        <section className="mt-10 flex flex-wrap items-end justify-end gap-8">
          <div className="w-48 text-center">
            {school?.principalSignature ? (
              <img
                src={school.principalSignature}
                alt="Principal's signature"
                className="mx-auto h-16 max-w-full object-contain"
              />
            ) : (
              <div className="h-16" />
            )}

            <div className="border-t border-slate-500 pt-2">
              <p className="text-sm font-bold">
                {school?.principalName || "Principal"}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Principal's Signature
              </p>
            </div>
          </div>

          {school?.principalStamp && (
            <div className="w-28 text-center">
              <img
                src={school.principalStamp}
                alt="School official stamp"
                className="mx-auto h-24 w-24 object-contain"
              />

              <p className="mt-1 text-xs text-slate-500">
                Official School Stamp
              </p>
            </div>
          )}
        </section>

        <footer className="mt-6 border-t border-slate-200 pt-3 text-center">
          <p className="text-[10px] text-slate-500">
            Official student report card • {school?.name || "School"}
          </p>
        </footer>
      </article>
    </div>
  );
}
