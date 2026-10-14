
"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  FileUp,
  LoaderCircle,
  RefreshCw,
  ShieldCheck,
  Upload,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import api from "@/lib/api";

export default function StudentImportPage() {
 const fileInputRef = useRef(null);
const previewSectionRef = useRef(null);

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loadingTemplate, setLoadingTemplate] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [loadingImport, setLoadingImport] = useState(false);
  const [loadingReport, setLoadingReport] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const getErrorMessage = (err) =>
    err?.response?.data?.message ||
    err?.message ||
    "Something went wrong. Please try again.";

  const downloadBlob = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = filename;

    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(url);
  };

  const handleDownloadTemplate = async () => {
    setError("");
    setSuccess("");
    setLoadingTemplate(true);

    try {
      const response = await api.get("/students/import/template", {
        responseType: "blob",
      });

      downloadBlob(
        response.data,
        "student-import-template.xlsx"
      );
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Unable to download the template. Please try again."
      );
    } finally {
      setLoadingTemplate(false);
    }
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0];

    setError("");
    setSuccess("");
    setPreview(null);
    setResult(null);

    if (!selectedFile) {
      setFile(null);
      return;
    }

    const extension = selectedFile.name
      .split(".")
      .pop()
      .toLowerCase();

    if (!["xlsx", "xls", "csv"].includes(extension)) {
      setFile(null);
      setError("Choose an Excel (.xlsx, .xls) or CSV (.csv) file.");
      event.target.value = "";
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setFile(null);
      setError("The file must not exceed 5 MB.");
      event.target.value = "";
      return;
    }

    setFile(selectedFile);
  };

const handlePreview = async () => {
  if (!file) {
    setError("Please select a file first.");
    return;
  }

  setError("");
  setSuccess("");
  setPreview(null);
  setResult(null);
  setLoadingPreview(true);

  try {
    const formData = new FormData();
    formData.append("file", file);

   const response = await api.post(
  "/students/import/preview",
  formData,
  {
    headers: {
      "Content-Type": undefined,
    },
  }
);

    setPreview(response.data);

    // Scroll to the preview after React renders it.
    requestAnimationFrame(() => {
      previewSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  } catch (err) {
    setError(getErrorMessage(err));
  } finally {
    setLoadingPreview(false);
  }
};


 
const handleConfirmImport = async () => {
  if (!file || !preview?.validCount) {
    setError("There are no valid student records to import.");
    return;
  }

  const confirmed = window.confirm(
    `You are about to import ${preview.validCount} valid student record(s).\n\n` +
      `${preview.invalidCount} invalid record(s) will be skipped.\n\n` +
      "This action creates student records but does not create portal accounts. Continue?"
  );

  if (!confirmed) return;

  setError("");
  setSuccess("");
  setLoadingImport(true);

  try {
    const formData = new FormData();
    formData.append("file", file, file.name);

    const response = await api.post(
      "/students/import/confirm",
      formData,
      {
        headers: {
          "Content-Type": undefined,
        },
      }
    );

    setResult(response.data);
    setSuccess(
      response.data.message || "Import processing completed."
    );
  } catch (err) {
    setError(getErrorMessage(err));
  } finally {
    setLoadingImport(false);
  }
};


  const handleDownloadErrorReport = async () => {
    const errors = result?.errors || preview?.errors || [];

    if (!errors.length) {
      setError("There are no errors to download.");
      return;
    }

    setError("");
    setLoadingReport(true);

    try {
      const response = await api.post(
        "/students/import/error-report",
        { errors },
        { responseType: "blob" }
      );

      downloadBlob(
        response.data,
        "student-import-errors.csv"
      );
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Unable to download the error report."
      );
    } finally {
      setLoadingReport(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError("");
    setSuccess("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const errors = result?.errors || preview?.errors || [];

  const formatDate = (value) => {
    if (!value) return "—";

    if (typeof value === "string") {
      return value;
    }

    return String(value);
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/dashboard/school-admin/students"
              className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-emerald-700"
            >
              <ArrowLeft size={16} />
              Back to Students
            </Link>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Import Students
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Upload your existing student records in bulk instead
              of entering them one at a time.
            </p>
          </div>

          <button
            type="button"
            onClick={handleDownloadTemplate}
            disabled={loadingTemplate}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm font-semibold text-emerald-700 shadow-sm transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loadingTemplate ? (
              <LoaderCircle size={18} className="animate-spin" />
            ) : (
              <Download size={18} />
            )}
            Download Excel Template
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <XCircle size={20} className="mt-0.5 shrink-0" />
            <p className="flex-1">{error}</p>
            <button
              type="button"
              onClick={() => setError("")}
              aria-label="Dismiss error"
              className="rounded-md p-1 hover:bg-red-100"
            >
              <XCircle size={16} />
            </button>
          </div>
        )}

        {success && (
          <div
            role="status"
            className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
          >
            <CheckCircle2 size={20} className="mt-0.5 shrink-0" />
            <p>{success}</p>
          </div>
        )}

        {/* Instructions */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <Download size={20} />
            </div>
            <h2 className="font-semibold text-slate-900">
              1. Download the template
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Use the supplied spreadsheet so your column names
              match the import system.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <FileSpreadsheet size={20} />
            </div>
            <h2 className="font-semibold text-slate-900">
              2. Fill in your records
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Enter student details and ensure the academic session,
              class, arm, and section match your school records.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-700">
              <ShieldCheck size={20} />
            </div>
            <h2 className="font-semibold text-slate-900">
              3. Preview and import
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Review validation results before confirming. Your
              subscription's available student capacity is enforced.
            </p>
          </div>
        </div>

        {/* Upload */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-slate-900">
              Upload student spreadsheet
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Excel and CSV files are supported. Maximum file size:
              5 MB. Maximum records: 2,000.
            </p>
          </div>

          <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center transition hover:border-emerald-400 sm:p-10">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
              <FileUp size={27} />
            </div>

            <h3 className="font-semibold text-slate-900">
              {file ? file.name : "Choose your student file"}
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              {file
                ? `${(file.size / 1024).toFixed(1)} KB selected`
                : "Select an .xlsx, .xls, or .csv file from your computer."}
            </p>

            <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                <Upload size={17} />
                Choose File
              </button>

              <button
                type="button"
                onClick={handlePreview}
                disabled={!file || loadingPreview || loadingImport}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loadingPreview ? (
                  <LoaderCircle size={18} className="animate-spin" />
                ) : (
                  <FileSpreadsheet size={18} />
                )}
                {loadingPreview ? "Validating File..." : "Preview Records"}
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          <div className="mt-4 flex items-start gap-2 text-xs leading-5 text-slate-500">
            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
            <p>
              Previewing a file does not save students. You must
              explicitly confirm the import after reviewing the
              validation results.
            </p>
          </div>
        </section>

        {/* Preview summary */}
        {preview && !result && (
  <section ref={previewSectionRef}
    className="scroll-mt-6 space-y-5"
  >
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Import Preview
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Review the valid and invalid records below before
                proceeding.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <StatCard
                label="Total Records"
                value={preview.totalRows}
                color="slate"
              />
              <StatCard
                label="Valid Records"
                value={preview.validCount}
                color="emerald"
              />
              <StatCard
                label="Invalid Records"
                value={preview.invalidCount}
                color="red"
              />
            </div>

            {preview.validRows?.length > 0 && (
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900">
                      Valid Student Records
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      These records passed the current validation
                      checks.
                    </p>
                  </div>
                  <span className="w-fit rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                    {preview.validCount} valid
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] text-left text-sm">
                    <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-5 py-3">Row</th>
                        <th className="px-5 py-3">Student ID</th>
                        <th className="px-5 py-3">Student Name</th>
                        <th className="px-5 py-3">Gender</th>
                        <th className="px-5 py-3">Academic Session</th>
                        <th className="px-5 py-3">Class</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {preview.validRows.map((student, index) => (
                        <tr
                          key={`${student.row}-${student.studentId}-${index}`}
                          className="hover:bg-slate-50"
                        >
                          <td className="px-5 py-3 text-slate-500">
                            {student.row}
                          </td>
                          <td className="px-5 py-3 font-medium text-slate-900">
                            {student.studentId}
                          </td>
                          <td className="px-5 py-3 text-slate-700">
                            {[
                              student.firstName,
                              student.middleName,
                              student.lastName,
                            ]
                              .filter(Boolean)
                              .join(" ")}
                          </td>
                          <td className="px-5 py-3 text-slate-600">
                            {student.gender}
                          </td>
                          <td className="px-5 py-3 text-slate-600">
                            {student.academicSession || "—"}
                          </td>
                          <td className="px-5 py-3 text-slate-600">
                            {student.className || "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {preview.errors?.length > 0 && (
              <ErrorTable errors={preview.errors} />
            )}

            <div className="flex flex-col gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-semibold text-emerald-950">
                  Ready to import?
                </h3>
                <p className="mt-1 text-sm leading-5 text-emerald-800">
                  {preview.validCount > 0
                    ? `${preview.validCount} valid record(s) will be processed. Invalid records will be skipped.`
                    : "No valid records are available. Correct the errors and upload the file again."}
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                {preview.errors?.length > 0 && (
                  <button
                    type="button"
                    onClick={handleDownloadErrorReport}
                    disabled={loadingReport}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-300 bg-white px-4 py-2.5 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100 disabled:opacity-60"
                  >
                    {loadingReport ? (
                      <LoaderCircle size={17} className="animate-spin" />
                    ) : (
                      <Download size={17} />
                    )}
                    Error Report
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleConfirmImport}
                  disabled={
                    !preview.validCount ||
                    loadingImport ||
                    loadingPreview
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loadingImport ? (
                    <LoaderCircle size={18} className="animate-spin" />
                  ) : (
                    <CheckCircle2 size={18} />
                  )}
                  {loadingImport ? "Importing..." : "Confirm Import"}
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Import result */}
        {result && (
          <section className="space-y-5">
            <div className="rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <CheckCircle2 size={26} />
                </div>

                <div className="flex-1">
                  <h2 className="text-xl font-bold text-slate-900">
                    Import Processing Complete
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {result.message}
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <StatCard
                  label="Total Records"
                  value={result.totalRows}
                  color="slate"
                />
                <StatCard
                  label="Successfully Imported"
                  value={result.importedCount}
                  color="emerald"
                />
                <StatCard
                  label="Skipped Records"
                  value={result.skippedCount}
                  color="red"
                />
              </div>

              {result.subscriptionUsage && (
                <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <h3 className="font-semibold text-slate-900">
                    Student Subscription Capacity
                  </h3>

                  <div className="mt-3 grid gap-4 sm:grid-cols-3">
                    <UsageValue
                      label="Student Limit"
                      value={result.subscriptionUsage.studentLimit}
                    />
                    <UsageValue
                      label="Active Students"
                      value={result.subscriptionUsage.activeStudents}
                    />
                    <UsageValue
                      label="Seats Available"
                      value={result.subscriptionUsage.availableSeats}
                    />
                  </div>
                </div>
              )}

              {result.imported?.length > 0 && (
                <div className="mt-6">
                  <h3 className="mb-3 font-semibold text-slate-900">
                    Successfully Imported Students
                  </h3>

                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full min-w-[480px] text-left text-sm">
                      <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                        <tr>
                          <th className="px-4 py-3">Row</th>
                          <th className="px-4 py-3">Student ID</th>
                          <th className="px-4 py-3">First Name</th>
                          <th className="px-4 py-3">Last Name</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {result.imported.map((student, index) => (
                          <tr
                            key={`${student.row}-${student.studentId}-${index}`}
                          >
                            <td className="px-4 py-3 text-slate-500">
                              {student.row}
                            </td>
                            <td className="px-4 py-3 font-medium text-slate-900">
                              {student.studentId}
                            </td>
                            <td className="px-4 py-3 text-slate-700">
                              {student.firstName}
                            </td>
                            <td className="px-4 py-3 text-slate-700">
                              {student.lastName}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {result.errors?.length > 0 && (
                <div className="mt-6">
                  <ErrorTable errors={result.errors} />
                </div>
              )}

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                {result.errors?.length > 0 && (
                  <button
                    type="button"
                    onClick={handleDownloadErrorReport}
                    disabled={loadingReport}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
                  >
                    {loadingReport ? (
                      <LoaderCircle size={17} className="animate-spin" />
                    ) : (
                      <Download size={17} />
                    )}
                    Download Error Report
                  </button>
                )}

                <Link
                  href="/dashboard/school-admin/students"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
                >
                  View Students
                </Link>

                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  <RefreshCw size={17} />
                  Import Another File
                </button>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, color = "slate" }) {
  const styles = {
    slate: "border-slate-200 bg-white text-slate-900",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-900",
    red: "border-red-200 bg-red-50 text-red-900",
  };

  return (
    <div className={`rounded-2xl border p-5 shadow-sm ${styles[color]}`}>
      <p className="text-sm font-medium opacity-75">{label}</p>
      <p className="mt-2 text-3xl font-bold">
        {value ?? 0}
      </p>
    </div>
  );
}

function UsageValue({ label, value }) {
  return (
    <div>
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-bold text-slate-900">
        {value ?? 0}
      </p>
    </div>
  );
}

function ErrorTable({ errors }) {
  if (!errors?.length) return null;

  return (
    <div className="overflow-hidden rounded-2xl border border-red-200 bg-white shadow-sm">
      <div className="flex items-start gap-3 border-b border-red-100 bg-red-50 p-5">
        <AlertTriangle
          size={21}
          className="mt-0.5 shrink-0 text-red-600"
        />
        <div>
          <h3 className="font-bold text-red-900">
            Records Requiring Attention
          </h3>
          <p className="mt-1 text-sm text-red-800">
            Correct these issues in your spreadsheet before
            attempting to import the affected records.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[540px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3">Row</th>
              <th className="px-5 py-3">Student ID</th>
              <th className="px-5 py-3">Validation Errors</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {errors.map((item, index) => (
              <tr
                key={`${item.row}-${item.studentId}-${index}`}
                className="align-top"
              >
                <td className="px-5 py-4 font-medium text-slate-700">
                  {item.row ?? "—"}
                </td>
                <td className="px-5 py-4 text-slate-700">
                  {item.studentId || "—"}
                </td>
                <td className="px-5 py-4">
                  <ul className="space-y-1.5">
                    {(Array.isArray(item.errors) ? item.errors : []).map(
                      (message, messageIndex) => (
                        <li
                          key={`${messageIndex}-${message}`}
                          className="flex items-start gap-2 text-red-700"
                        >
                          <XCircle
                            size={15}
                            className="mt-0.5 shrink-0"
                          />
                          <span>{message}</span>
                        </li>
                      )
                    )}
                  </ul>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
