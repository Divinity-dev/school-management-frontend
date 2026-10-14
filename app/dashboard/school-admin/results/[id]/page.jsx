"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
ArrowLeft,
BookOpen,
CalendarDays,
CheckCircle2,
ClipboardCheck,
GraduationCap,
LoaderCircle,
Mail,
RefreshCw,
UserRound,
XCircle,
} from "lucide-react";

import api from "@/lib/api";

const STATUS_STYLES = {
draft: "bg-gray-100 text-gray-700",
pending_review: "bg-amber-100 text-amber-800",
published: "bg-emerald-100 text-emerald-800",
locked: "bg-purple-100 text-purple-800",
};

const STATUS_LABELS = {
draft: "Draft",
pending_review: "Pending Review",
published: "Published",
locked: "Locked",
};

function formatName(person) {
if (!person) return "Not available";

const name = [
person.firstName,
person.middleName,
person.lastName,
]
.filter(Boolean)
.join(" ")
.trim();

return name || "Not available";
}

function formatScore(value) {
if (value === null || value === undefined || value === "") {
return "—";
}

const number = Number(value);

if (!Number.isFinite(number)) return "—";

return Number.isInteger(number)
? String(number)
: number.toFixed(2).replace(/.?0+$/, "");
}

function formatDate(value) {
if (!value) return "Not available";

const date = new Date(value);

if (Number.isNaN(date.getTime())) return "Not available";

return date.toLocaleDateString("en-NG", {
day: "numeric",
month: "long",
year: "numeric",
});
}

function getInitials(name) {
if (!name || name === "Not available") return "ST";

return name
.split(/\s+/)
.filter(Boolean)
.slice(0, 2)
.map((part) => part[0].toUpperCase())
.join("");
}

function DetailItem({ label, value }) {
return ( <div className="min-w-0"> <p className="text-sm text-gray-500">{label}</p> <p className="mt-1 break-words font-medium text-gray-900">
{value || "Not available"} </p> </div>
);
}

function SectionCard({ title, description, icon: Icon, children }) {
return ( <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"> <div className="flex items-start gap-3 border-b border-gray-100 px-5 py-4 sm:px-6"> <div className="rounded-xl bg-emerald-50 p-2 text-emerald-700"> <Icon size={20} /> </div>


    <div>
      <h2 className="font-semibold text-gray-900">{title}</h2>
      {description && (
        <p className="mt-1 text-sm text-gray-500">
          {description}
        </p>
      )}
    </div>
  </div>

  <div className="p-5 sm:p-6">{children}</div>
</section>


);
}

function ScoreCard({ label, score, maximum, color = "gray" }) {
const colors = {
gray: "border-gray-200 bg-gray-50",
emerald: "border-emerald-200 bg-emerald-50",
blue: "border-blue-200 bg-blue-50",
amber: "border-amber-200 bg-amber-50",
};

return (
<div
className={`rounded-xl border p-4 ${
        colors[color] || colors.gray
      }`}
> <p className="text-sm text-gray-600">{label}</p>


  <p className="mt-2 text-2xl font-bold text-gray-900">
    {formatScore(score)}

    {maximum !== null && maximum !== undefined && (
      <span className="ml-1 text-sm font-medium text-gray-500">
        / {formatScore(maximum)}
      </span>
    )}
  </p>
</div>


);
}

export default function ResultReviewPage() {
const params = useParams();
const router = useRouter();

const resultId = params?.id;

const [result, setResult] = useState(null);
const [loading, setLoading] = useState(true);
const [loadError, setLoadError] = useState("");
const [actionError, setActionError] = useState("");
const [successMessage, setSuccessMessage] = useState("");
const [actionLoading, setActionLoading] = useState("");

const fetchResult = useCallback(async ({ showLoading = true } = {}) => {
if (!resultId) {
setLoading(false);
setLoadError("A result ID was not provided.");
return null;
}


if (showLoading) setLoading(true);

setLoadError("");

try {
  const response = await api.get(
    `/results/admin-review/${resultId}`
  );

  const fetchedResult = response.data?.result || null;

  if (!fetchedResult) {
    setResult(null);
    setLoadError("The result could not be found.");
    return null;
  }

  setResult(fetchedResult);
  return fetchedResult;
} catch (error) {
  const message =
    error.response?.data?.message ||
    "Unable to load this result. Please try again.";

  setLoadError(message);

  if (showLoading) setResult(null);

  return null;
} finally {
  if (showLoading) setLoading(false);
}


}, [resultId]);

useEffect(() => {
fetchResult();
}, [fetchResult]);

const handleResultAction = async (action) => {
if (!result?._id || actionLoading) return;


if (result.status !== "pending_review") {
  setActionError(
    "Only results pending review can be published or returned for correction."
  );
  return;
}

const isPublish = action === "publish";

const confirmed = window.confirm(
  isPublish
    ? "Publish this result? The student will be able to view it in their portal."
    : "Return this result to draft status so the teacher can correct and resubmit it?"
);

if (!confirmed) return;

setActionLoading(action);
setActionError("");
setSuccessMessage("");

try {
  const response = await api.post(
    `/results/${result._id}/${action}`
  );

  const actionMessage =
    response.data?.message ||
    (isPublish
      ? "Result published successfully."
      : "Result returned to draft successfully.");

  setSuccessMessage(actionMessage);

  // Always retrieve the saved record to display its authoritative status.
  const refreshedResult = await fetchResult({
    showLoading: false,
  });

  if (!refreshedResult) {
    setActionError(
      "The action succeeded, but the latest result details could not be reloaded. Use Refresh to try again."
    );
  }
} catch (error) {
  setActionError(
    error.response?.data?.message ||
      `Unable to ${action} this result. Please try again.`
  );
} finally {
  setActionLoading("");
}


};

if (loading) {
return ( <div className="flex min-h-[60vh] items-center justify-center"> <div className="flex flex-col items-center gap-3 text-gray-500"> <LoaderCircle
         size={36}
         className="animate-spin text-emerald-600"
       /> <p className="text-sm">Loading result for review...</p> </div> </div>
);
}

if (loadError || !result) {
return ( <div className="mx-auto max-w-3xl px-4 py-12">
<button
type="button"
onClick={() =>
router.push("/dashboard/school-admin/results")
}
className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-emerald-700"
> <ArrowLeft size={18} />
Back to Results </button>


    <div className="rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
      <XCircle size={42} className="mx-auto text-red-500" />

      <h1 className="mt-4 text-xl font-bold text-gray-900">
        Unable to Load Result
      </h1>

      <p className="mt-2 text-sm text-gray-600">
        {loadError || "The requested result was not found."}
      </p>

      <button
        type="button"
        onClick={() => fetchResult()}
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
      >
        <RefreshCw size={17} />
        Try Again
      </button>
    </div>
  </div>
);


}

const student = result.student;
const studentUser = student?.user;

const studentName = formatName(studentUser);
const teacherName = formatName(result.enteredBy);

const status = result.status || "draft";
const canReview = status === "pending_review";

const gradingSystem = result.gradingSystem || {};

const assessmentScores = Array.isArray(result.assessmentScores)
? result.assessmentScores
: [];

const caMaximum = gradingSystem.caMaximum ?? null;
const examMaximum = gradingSystem.examMaximum ?? null;
const totalMaximum = gradingSystem.totalMaximum ?? null;

const gradingScale = Array.isArray(gradingSystem.gradingScale)
? gradingSystem.gradingScale
: [];

return ( <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8"> <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"> <div>
<button
type="button"
onClick={() =>
router.push("/dashboard/school-admin/results")
}
className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-emerald-700"
> <ArrowLeft size={18} />
Back to Results </button>


      <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
        Result Review
      </h1>

      <p className="mt-2 text-sm text-gray-500">
        Inspect the student's scores and review the submitted result.
      </p>
    </div>

    <div className="flex flex-wrap items-center gap-3">
      <span
        className={`inline-flex items-center rounded-full px-3 py-1.5 text-sm font-semibold ${
          STATUS_STYLES[status] || STATUS_STYLES.draft
        }`}
      >
        {STATUS_LABELS[status] || status.replaceAll("_", " ")}
      </span>

      <button
        type="button"
        onClick={() => fetchResult()}
        disabled={Boolean(actionLoading)}
        className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <RefreshCw
          size={16}
          className={actionLoading ? "animate-spin" : ""}
        />
        Refresh
      </button>
    </div>
  </div>

  {successMessage && (
    <div
      role="status"
      className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
    >
      <CheckCircle2 size={20} className="mt-0.5 shrink-0" />
      <p>{successMessage}</p>
    </div>
  )}

  {actionError && (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
    >
      <XCircle size={20} className="mt-0.5 shrink-0" />
      <p>{actionError}</p>
    </div>
  )}

  <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
    <div className="border-b border-gray-100 bg-gradient-to-r from-emerald-50 to-white p-5 sm:p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-emerald-700 text-xl font-bold text-white">
          {getInitials(studentName)}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-emerald-800">
            Student Result
          </p>

          <h2 className="mt-1 text-xl font-bold text-gray-900 sm:text-2xl">
            {studentName}
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Admission No.:{" "}
            {student?.admissionNumber ||
              student?.studentId ||
              "Not available"}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:min-w-64">
          <div className="rounded-xl border border-gray-200 bg-white p-3">
            <p className="text-xs text-gray-500">Total Score</p>
            <p className="mt-1 text-xl font-bold text-gray-900">
              {formatScore(result.total)}
              {totalMaximum !== null && (
                <span className="ml-1 text-sm font-medium text-gray-500">
                  / {formatScore(totalMaximum)}
                </span>
              )}
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-3">
            <p className="text-xs text-gray-500">Grade</p>
            <p className="mt-1 text-xl font-bold text-emerald-700">
              {result.grade || "—"}
            </p>
          </div>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-3">
      <DetailItem
        label="Class"
        value={[
          result.schoolClass?.name,
          result.schoolClass?.arm,
        ]
          .filter(Boolean)
          .join(" ")}
      />

      <DetailItem
        label="Subject"
        value={
          result.subject?.name
            ? `${result.subject.name}${
                result.subject.code
                  ? ` (${result.subject.code})`
                  : ""
              }`
            : null
        }
      />

      <DetailItem
        label="Academic Session"
        value={result.academicSession?.name}
      />

      <DetailItem
        label="Academic Term"
        value={result.academicTerm?.name}
      />

      <DetailItem label="Entered By" value={teacherName} />

      <DetailItem
        label="Last Updated"
        value={formatDate(result.updatedAt || result.createdAt)}
      />

      {studentUser?.email && (
        <div className="sm:col-span-2 lg:col-span-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Mail size={16} />
            <span className="break-all">{studentUser.email}</span>
          </div>
        </div>
      )}
    </div>
  </section>

  <SectionCard
    title="Score Breakdown"
    description="Review the continuous assessment, examination, and final score."
    icon={ClipboardCheck}
  >
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <ScoreCard
        label="Continuous Assessment"
        score={result.caScore}
        maximum={caMaximum}
        color="blue"
      />

      <ScoreCard
        label="Examination"
        score={result.examScore}
        maximum={examMaximum}
        color="amber"
      />

      <ScoreCard
        label="Total Score"
        score={result.total}
        maximum={totalMaximum}
        color="emerald"
      />
    </div>

    {assessmentScores.length > 0 && (
      <div className="mt-7">
        <h3 className="mb-3 font-semibold text-gray-900">
          Continuous Assessment Components
        </h3>

        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full min-w-[420px] text-left text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3 font-semibold">
                  Assessment
                </th>
                <th className="px-4 py-3 text-right font-semibold">
                  Score
                </th>
                <th className="px-4 py-3 text-right font-semibold">
                  Maximum
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {assessmentScores.map((assessment, index) => (
                <tr key={`${assessment.name || "assessment"}-${index}`}>
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {assessment.name || `Assessment ${index + 1}`}
                  </td>

                  <td className="px-4 py-3 text-right text-gray-800">
                    {formatScore(assessment.score)}
                  </td>

                  <td className="px-4 py-3 text-right text-gray-500">
                    {formatScore(assessment.maximum)}
                  </td>
                </tr>
              ))}
            </tbody>

            <tfoot className="bg-gray-50">
              <tr>
                <td className="px-4 py-3 font-semibold text-gray-800">
                  Total CA
                </td>
                <td className="px-4 py-3 text-right font-semibold text-gray-900">
                  {formatScore(result.caScore)}
                </td>
                <td className="px-4 py-3 text-right font-semibold text-gray-700">
                  {formatScore(caMaximum)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    )}

    <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
      <div>
        <p className="text-sm text-gray-500">Final Grade</p>
        <p className="mt-1 text-lg font-bold text-gray-900">
          {result.grade || "Not assigned"}
        </p>
      </div>

      <div>
        <p className="text-sm text-gray-500">Teacher's Remark</p>
        <p className="mt-1 font-medium text-gray-900">
          {result.remark || "No remark provided"}
        </p>
      </div>
    </div>
  </SectionCard>

  {gradingScale.length > 0 && (
    <SectionCard
      title="Grading Scale"
      description="The grading scale saved with this result."
      icon={BookOpen}
    >
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-3 font-semibold">Grade</th>
              <th className="px-4 py-3 font-semibold">Minimum</th>
              <th className="px-4 py-3 font-semibold">Maximum</th>
              <th className="px-4 py-3 font-semibold">Remark</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {gradingScale.map((grade, index) => (
              <tr key={`${grade.grade || "grade"}-${index}`}>
                <td className="px-4 py-3 font-semibold text-gray-900">
                  {grade.grade || "—"}
                </td>
                <td className="px-4 py-3 text-gray-700">
                  {formatScore(grade.min)}
                </td>
                <td className="px-4 py-3 text-gray-700">
                  {formatScore(grade.max)}
                </td>
                <td className="px-4 py-3 text-gray-700">
                  {grade.remark || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  )}

  <SectionCard
    title="Review Information"
    description="Check the current status before taking action."
    icon={GraduationCap}
  >
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
      <DetailItem
        label="Current Status"
        value={STATUS_LABELS[status] || status}
      />

      <DetailItem
        label="Last Updated"
        value={formatDate(result.updatedAt)}
      />

      {result.publishedAt && (
        <DetailItem
          label="Published On"
          value={formatDate(result.publishedAt)}
        />
      )}

      {result.lockedAt && (
        <DetailItem
          label="Locked On"
          value={formatDate(result.lockedAt)}
        />
      )}
    </div>

    {status === "draft" && (
      <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
        This result is still a draft. It must be submitted for review
        before it can be published.
      </div>
    )}

    {status === "published" && (
      <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
        This result has been published and is available to the student
        through the student portal.
      </div>
    )}

    {status === "locked" && (
      <div className="mt-5 rounded-xl border border-purple-200 bg-purple-50 p-4 text-sm text-purple-800">
        This result is locked. No review actions are available on this page.
      </div>
    )}

    {canReview && (
      <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <div className="flex items-start gap-3">
          <CalendarDays
            size={20}
            className="mt-0.5 shrink-0 text-amber-700"
          />

          <div>
            <h3 className="font-semibold text-amber-900">
              Ready for your decision
            </h3>

            <p className="mt-1 text-sm text-amber-800">
              Verify the student, subject, and scores before publishing.
              If corrections are needed, return the result to draft.
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => handleResultAction("reject")}
            disabled={Boolean(actionLoading)}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-5 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {actionLoading === "reject" ? (
              <LoaderCircle size={18} className="animate-spin" />
            ) : (
              <XCircle size={18} />
            )}
            Return for Correction
          </button>

          <button
            type="button"
            onClick={() => handleResultAction("publish")}
            disabled={Boolean(actionLoading)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {actionLoading === "publish" ? (
              <LoaderCircle size={18} className="animate-spin" />
            ) : (
              <CheckCircle2 size={18} />
            )}
            Publish Result
          </button>
        </div>
      </div>
    )}
  </SectionCard>
</div>


);
}
