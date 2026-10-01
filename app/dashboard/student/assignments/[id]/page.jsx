"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  Award,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Download,
  FileText,
  GraduationCap,
  Loader2,
  MessageSquare,
  Send,
  User,
  X,
} from "lucide-react";

import api from "@/lib/api";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB per file

const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "image/jpeg",
  "image/png",
];

const ALLOWED_FILE_EXTENSIONS = [
  ".pdf",
  ".doc",
  ".docx",
  ".ppt",
  ".pptx",
  ".jpg",
  ".jpeg",
  ".png",
];

function getFileExtension(fileName) {
  const parts = fileName.split(".");
  return parts.length > 1
    ? `.${parts[parts.length - 1].toLowerCase()}`
    : "";
}

function isAllowedFile(file) {
  const extension = getFileExtension(file.name);

  return (
    ALLOWED_FILE_TYPES.includes(file.type) ||
    ALLOWED_FILE_EXTENSIONS.includes(extension)
  );
}

function formatFileSize(bytes) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(date) {
  if (!date) return "Not available";

  return new Date(date).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(date) {
  if (!date) return "Not available";

  return new Date(date).toLocaleString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getSubjectName(subject) {
  if (!subject) return "Subject";

  if (typeof subject === "string") {
    return subject;
  }

  return subject.name || subject.title || "Subject";
}

function getTeacherName(teacher) {
  if (!teacher) return "Teacher";

  if (typeof teacher === "string") {
    return teacher;
  }

  const fullName = [
    teacher.firstName,
    teacher.lastName,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    fullName ||
    teacher.name ||
    teacher.fullName ||
    teacher.user?.name ||
    "Teacher"
  );
}

function getClassName(schoolClass) {
  if (!schoolClass) return "Class";

  if (typeof schoolClass === "string") {
    return schoolClass;
  }

  return schoolClass.name || schoolClass.title || "Class";
}

function getStatus(assignment) {
  const submission = assignment?.submission;

  if (
    submission?.score !== null &&
    submission?.score !== undefined
  ) {
    return "graded";
  }

  if (
    assignment?.submissionStatus === "submitted" ||
    submission?.status === "submitted" ||
    submission
  ) {
    return "submitted";
  }

  if (
    assignment?.dueDate &&
    new Date(assignment.dueDate).getTime() < Date.now()
  ) {
    return "overdue";
  }

  return "pending";
}

const statusConfig = {
  pending: {
    label: "Pending",
    className: "bg-amber-50 text-amber-700 border-amber-200",
    icon: Clock3,
  },
  submitted: {
    label: "Submitted",
    className: "bg-blue-50 text-blue-700 border-blue-200",
    icon: CheckCircle2,
  },
  graded: {
    label: "Graded",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: Award,
  },
  overdue: {
    label: "Overdue",
    className: "bg-red-50 text-red-700 border-red-200",
    icon: AlertCircle,
  },
};

export default function StudentAssignmentDetailPage() {
  const params = useParams();
  const assignmentId = params?.id;

  const [assignment, setAssignment] = useState(null);
  const [content, setContent] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [error, setError] = useState("");
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (!assignmentId) return;

    const fetchAssignment = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/assignments/student");

        const assignments = Array.isArray(response.data)
          ? response.data
          : response.data?.assignments || [];

        const foundAssignment = assignments.find(
          (item) => item._id === assignmentId
        );

        if (!foundAssignment) {
          setError("Assignment not found.");
          return;
        }

        setAssignment(foundAssignment);

        if (foundAssignment.submission?.content) {
          setContent(foundAssignment.submission.content);
        }
      } catch (err) {
        console.error("Failed to fetch assignment:", err);

        setError(
          err.response?.data?.message ||
            "Failed to load assignment."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAssignment();
  }, [assignmentId]);

  const submission = assignment?.submission;

  const submissionStatus =
    assignment?.submissionStatus || "not_submitted";

  const status = useMemo(() => {
    if (!assignment) return "pending";

    return getStatus(assignment);
  }, [assignment]);

  const statusInfo = statusConfig[status] || statusConfig.pending;
  const StatusIcon = statusInfo.icon;

  const isSubmitted =
    submissionStatus === "submitted" ||
    submissionStatus === "graded" ||
    status === "submitted" ||
    status === "graded";

  const isGraded =
    submissionStatus === "graded" ||
    status === "graded" ||
    (submission?.score !== null &&
      submission?.score !== undefined);

  const isPastDue =
    assignment?.dueDate &&
    new Date(assignment.dueDate).getTime() < Date.now();

  const canSubmit =
    assignment?.status === "published" &&
    !isSubmitted &&
    !isPastDue;

  const teacherName = getTeacherName(assignment?.teacher);

  const subjectName = getSubjectName(assignment?.subject);

  const className = getClassName(assignment?.schoolClass);

  const description =
    assignment?.description ||
    assignment?.instructions ||
    assignment?.content ||
    "No description provided.";

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files || []);

    if (!files.length) return;

    setSubmitError("");

    const validFiles = [];

    for (const file of files) {
      if (!isAllowedFile(file)) {
        setSubmitError(
          `${file.name} is not a supported file type.`
        );
        continue;
      }

      if (file.size > MAX_FILE_SIZE) {
        setSubmitError(
          `${file.name} is larger than the 10MB limit.`
        );
        continue;
      }

      validFiles.push(file);
    }

    setSelectedFiles((currentFiles) => {
      const existingKeys = new Set(
        currentFiles.map(
          (file) => `${file.name}-${file.size}-${file.lastModified}`
        )
      );

      const newFiles = validFiles.filter(
        (file) =>
          !existingKeys.has(
            `${file.name}-${file.size}-${file.lastModified}`
          )
      );

      return [...currentFiles, ...newFiles];
    });

    event.target.value = "";
  };

  const removeSelectedFile = (index) => {
    setSelectedFiles((files) =>
      files.filter((_, fileIndex) => fileIndex !== index)
    );
  };

  const uploadFilesToCloudinary = async () => {
    if (!selectedFiles.length) {
      return [];
    }

    const cloudName =
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

    const uploadPreset =
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      throw new Error(
        "Cloudinary upload configuration is missing."
      );
    }

    const uploadedUrls = [];

    setUploading(true);

    try {
      for (const file of selectedFiles) {
        const formData = new FormData();

        formData.append("file", file);
        formData.append("upload_preset", uploadPreset);

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.error?.message ||
              `Failed to upload ${file.name}.`
          );
        }

        if (!data.secure_url) {
          throw new Error(
            `Cloudinary did not return a URL for ${file.name}.`
          );
        }

        uploadedUrls.push(data.secure_url);
      }

      return uploadedUrls;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!canSubmit) return;

    if (!content.trim() && selectedFiles.length === 0) {
      setSubmitError(
        "Please provide an answer or attach at least one file."
      );
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError("");

      const attachmentUrls =
        await uploadFilesToCloudinary();

      const response = await api.post(
        `/assignments/${assignmentId}/submit`,
        {
          content: content.trim(),
          attachments: attachmentUrls,
        }
      );

      const newSubmission =
        response.data?.submission || {
          content: content.trim(),
          attachments: attachmentUrls,
          status: "submitted",
          submittedAt: new Date().toISOString(),
        };

      setAssignment((currentAssignment) => ({
        ...currentAssignment,
        submission: newSubmission,
        submissionStatus: "submitted",
      }));

      setSelectedFiles([]);
    } catch (err) {
      console.error("Failed to submit assignment:", err);

      setSubmitError(
        err.response?.data?.message ||
          err.message ||
          "Failed to submit assignment. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="flex min-h-[70vh] items-center justify-center px-5">
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading assignment...
          </div>
        </div>
      </main>
    );
  }

  if (error || !assignment) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto flex min-h-[70vh] max-w-5xl items-center justify-center px-5">
          <div className="w-full max-w-md rounded-2xl border border-red-100 bg-white p-6 text-center shadow-sm">
            <AlertCircle className="mx-auto mb-3 h-10 w-10 text-red-500" />

            <h1 className="text-lg font-semibold text-slate-900">
              Unable to load assignment
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              {error || "Assignment not found."}
            </p>

            <Link
              href="/dashboard/student/assignments"
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to assignments
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="w-full px-5 pt-10 pb-12 sm:px-8 sm:pt-12 sm:pb-14 lg:px-10 lg:pt-14 lg:pb-16">
        <div className="mx-auto w-full max-w-5xl">
          <Link
            href="/dashboard/student/assignments"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to assignments
          </Link>

          {/* Assignment header */}
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-6 sm:p-8">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                      {subjectName}
                    </span>

                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${statusInfo.className}`}
                    >
                      <StatusIcon className="h-3.5 w-3.5" />
                      {statusInfo.label}
                    </span>
                  </div>

                  <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                    {assignment.title}
                  </h1>

                  <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">
                    <span className="inline-flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {teacherName}
                    </span>

                    <span className="inline-flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" />
                      {className}
                    </span>

                    <span className="inline-flex items-center gap-2">
                      <CalendarDays className="h-4 w-4" />
                      Due {formatDate(assignment.dueDate)}
                    </span>
                  </div>
                </div>

                {assignment.dueDate && (
                  <div className="shrink-0 rounded-xl bg-slate-50 px-4 py-3 text-sm">
                    <p className="text-xs font-medium text-slate-500">
                      Due date
                    </p>

                    <p className="mt-1 font-semibold text-slate-900">
                      {formatDate(assignment.dueDate)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Assignment content */}
            <div className="space-y-8 p-6 sm:p-8">
              <div>
                <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-slate-900">
                  <FileText className="h-5 w-5 text-slate-500" />
                  Assignment
                </h2>

                <div className="rounded-xl bg-slate-50 p-5">
                  <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
                    {description}
                  </p>
                </div>
              </div>

              {/* Assignment attachment */}
              {assignment.attachmentUrl && (
                <div>
                  <h2 className="mb-3 text-base font-semibold text-slate-900">
                    Assignment attachment
                  </h2>

                  <a
                    href={assignment.attachmentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:bg-slate-50"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                        <FileText className="h-5 w-5" />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-900">
                          {assignment.attachmentName ||
                            "Assignment attachment"}
                        </p>

                        <p className="text-xs text-slate-500">
                          Open attachment
                        </p>
                      </div>
                    </div>

                    <Download className="h-5 w-5 shrink-0 text-slate-400" />
                  </a>
                </div>
              )}

              {/* Grade */}
              {isGraded && (
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5 sm:p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                      <Award className="h-5 w-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h2 className="font-semibold text-slate-900">
                        Assignment graded
                      </h2>

                      <div className="mt-2 text-3xl font-bold text-emerald-700">
                        {submission.score}
                      </div>

                      {submission.feedback && (
                        <div className="mt-4 rounded-xl bg-white p-4">
                          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
                            <MessageSquare className="h-4 w-4" />
                            Teacher feedback
                          </div>

                          <p className="whitespace-pre-wrap text-sm leading-6 text-slate-600">
                            {submission.feedback}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Existing submission */}
              {isSubmitted && (
                <div>
                  <h2 className="mb-3 text-base font-semibold text-slate-900">
                    Your submission
                  </h2>

                  <div className="rounded-2xl border border-slate-200 bg-white">
                    <div className="border-b border-slate-100 px-5 py-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                          Submitted
                        </div>

                        {submission?.submittedAt && (
                          <span className="text-xs text-slate-500">
                            {formatDateTime(
                              submission.submittedAt
                            )}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-5 p-5">
                      {submission?.content && (
                        <div>
                          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Written answer
                          </p>

                          <div className="rounded-xl bg-slate-50 p-4">
                            <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
                              {submission.content}
                            </p>
                          </div>
                        </div>
                      )}

                      {submission?.attachments?.length > 0 && (
                        <div>
                          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Attached files
                          </p>

                          <div className="space-y-2">
                            {submission.attachments.map(
                              (attachment, index) => (
                                <a
                                  key={`${attachment}-${index}`}
                                  href={attachment}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-3 transition hover:bg-slate-50"
                                >
                                  <div className="flex min-w-0 items-center gap-3">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                                      <FileText className="h-4 w-4 text-slate-500" />
                                    </div>

                                    <p className="truncate text-sm font-medium text-slate-700">
                                      Attachment {index + 1}
                                    </p>
                                  </div>

                                  <Download className="h-4 w-4 shrink-0 text-slate-400" />
                                </a>
                              )
                            )}
                          </div>
                        </div>
                      )}

                      {!submission?.content &&
                        !submission?.attachments?.length && (
                          <p className="text-sm text-slate-500">
                            No submission content available.
                          </p>
                        )}
                    </div>
                  </div>
                </div>
              )}

              {/* Submit assignment */}
              {canSubmit && (
                <form
                  onSubmit={handleSubmit}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-6"
                >
                  <div className="mb-5">
                    <h2 className="text-base font-semibold text-slate-900">
                      Submit your assignment
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Write your answer, attach your work, or do both.
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="assignment-content"
                      className="mb-2 block text-sm font-medium text-slate-700"
                    >
                      Your answer
                    </label>

                    <textarea
                      id="assignment-content"
                      value={content}
                      onChange={(event) =>
                        setContent(event.target.value)
                      }
                      rows={8}
                      placeholder="Write your answer here..."
                      className="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                      disabled={submitting}
                    />
                  </div>

                  {/* File upload */}
                  <div className="mt-5">
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Attach files
                    </label>

                    <label
                      htmlFor="assignment-files"
                      className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-white px-5 py-8 text-center transition hover:border-indigo-400 hover:bg-indigo-50/30"
                    >
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                        <FileText className="h-5 w-5" />
                      </div>

                      <p className="mt-3 text-sm font-medium text-slate-700">
                        Click to choose files
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        PDF, Word, PowerPoint, JPG or PNG • Max 10MB per file
                      </p>

                      <input
                        id="assignment-files"
                        type="file"
                        multiple
                        accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png"
                        onChange={handleFileChange}
                        className="hidden"
                        disabled={submitting}
                      />
                    </label>
                  </div>

                  {/* Selected files */}
                  {selectedFiles.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Selected files
                      </p>

                      {selectedFiles.map((file, index) => (
                        <div
                          key={`${file.name}-${file.size}-${file.lastModified}`}
                          className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                              <FileText className="h-4 w-4 text-slate-500" />
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-slate-700">
                                {file.name}
                              </p>

                              <p className="text-xs text-slate-400">
                                {formatFileSize(file.size)}
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              removeSelectedFile(index)
                            }
                            disabled={submitting}
                            className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                            aria-label={`Remove ${file.name}`}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {submitError && (
                    <div className="mt-4 flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

                      <p>{submitError}</p>
                    </div>
                  )}

                  <div className="mt-6 flex justify-end">
                    <button
                      type="submit"
                      disabled={submitting || uploading}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {submitting || uploading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />

                          {uploading
                            ? "Uploading files..."
                            : "Submitting..."}
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          Submit assignment
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* Submission unavailable */}
              {!canSubmit && !isSubmitted && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" />

                    <div>
                      <h2 className="text-sm font-semibold text-slate-800">
                        Submission unavailable
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        {isPastDue
                          ? "The submission deadline has passed."
                          : assignment.status !== "published"
                            ? "This assignment is not currently open for submissions."
                            : "This assignment cannot be submitted at this time."}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}


