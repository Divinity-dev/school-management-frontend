"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Edit3,
  User,
  GraduationCap,
  Users,
  CalendarDays,
  Phone,
  Mail,
  MapPin,
  Hash,
  Loader2,
  ClipboardCheck,
  ClipboardList,
  FileText,
  Wallet,
} from "lucide-react";

import api from "@/lib/api";

export default function StudentPage() {
  const params = useParams();
  const router = useRouter();

  const studentId = params?.id;

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStudent = async () => {
      if (!studentId) {
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await api.get(`/students/${studentId}`);

        setStudent(response.data?.student || null);
      } catch (err) {
        console.error("Failed to fetch student:", err);

        setError(
          err?.response?.data?.message ||
            "Unable to load student information."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [studentId]);

  const getStudentName = () => {
    if (!student) {
      return "";
    }

    return [
      student.firstName,
      student.middleName,
      student.lastName,
    ]
      .filter(Boolean)
      .join(" ");
  };

  const getInitials = () => {
    if (!student) {
      return "";
    }

    return `${student.firstName?.charAt(0) || ""}${
      student.lastName?.charAt(0) || ""
    }`;
  };

  const getClassName = () => {
    if (!student?.schoolClass) {
      return "—";
    }

    return [
      student.schoolClass.name,
      student.schoolClass.arm,
    ]
      .filter(Boolean)
      .join(" ");
  };

  const formatDate = (value) => {
    if (!value) {
      return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 text-slate-600">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading student...</span>
        </div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        <button
          type="button"
          onClick={() =>
            router.push("/dashboard/school-admin/students")
          }
          className="flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-emerald-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Students
        </button>

        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
          {error || "Student could not be found."}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-5">
        <button
          type="button"
          onClick={() =>
            router.push("/dashboard/school-admin/students")
          }
          className="flex w-fit items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-emerald-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Students
        </button>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-lg font-bold text-emerald-600 sm:h-20 sm:w-20 sm:text-xl">
                {getInitials()}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                    {getStudentName()}
                  </h1>

                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                      student.isActive
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {student.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <Hash className="h-4 w-4 text-slate-400" />
                    {student.studentId || "No student ID"}
                  </span>

                  <span className="flex items-center gap-1.5">
                    <GraduationCap className="h-4 w-4 text-slate-400" />
                    {getClassName()}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                router.push(
                  `/dashboard/school-admin/students/${student._id}/edit`
                )
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
            >
              <Edit3 className="h-4 w-4" />
              Edit Student
            </button>
          </div>
        </section>
      </div>

      {/* Overview cards */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <OverviewCard
          icon={ClipboardCheck}
          title="Attendance"
          value="View records"
          href={`/dashboard/school-admin/attendance?student=${student._id}`}
        />

        <OverviewCard
          icon={ClipboardList}
          title="Assignments"
          value="View assignments"
          href={`/dashboard/school-admin/assignments?student=${student._id}`}
        />

        <OverviewCard
          icon={FileText}
          title="Results"
          value="View results"
          href={`/dashboard/school-admin/results?student=${student._id}`}
        />

        <OverviewCard
          icon={Wallet}
          title="School Fees"
          value="View account"
          href={`/dashboard/school-admin/payments?student=${student._id}`}
        />
      </section>

      {/* Student information */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <SectionHeader
          icon={User}
          title="Student Information"
          description="Personal information for this student."
        />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <InfoItem
            label="First Name"
            value={student.firstName}
          />

          <InfoItem
            label="Middle Name"
            value={student.middleName}
          />

          <InfoItem
            label="Last Name"
            value={student.lastName}
          />

          <InfoItem
            label="Date of Birth"
            value={formatDate(student.dateOfBirth)}
          />

          <InfoItem
            label="Gender"
            value={
              student.gender
                ? student.gender.charAt(0).toUpperCase() +
                  student.gender.slice(1)
                : "—"
            }
          />

          <InfoItem
            label="Phone"
            value={student.phone}
            icon={Phone}
          />

          <div className="sm:col-span-2 lg:col-span-3">
            <InfoItem
              label="Address"
              value={student.address}
              icon={MapPin}
            />
          </div>
        </div>
      </section>

      {/* Academic information */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <SectionHeader
          icon={GraduationCap}
          title="Academic Information"
          description="Current academic placement and admission details."
        />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <InfoItem
            label="Academic Session"
            value={
              student.academicSession?.name ||
              "—"
            }
          />

          <InfoItem
            label="Class"
            value={getClassName()}
          />

          <InfoItem
            label="Admission Date"
            value={formatDate(student.admissionDate)}
            icon={CalendarDays}
          />
        </div>
      </section>

      {/* Parent / Guardian */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <SectionHeader
          icon={Users}
          title="Parent / Guardian"
          description="Parent or guardian linked to this student."
        />

        {student.parent ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <InfoItem
              label="Name"
              value={[
                student.parent.firstName,
                student.parent.lastName,
              ]
                .filter(Boolean)
                .join(" ")}
            />

            <InfoItem
              label="Email"
              value={student.parent.email}
              icon={Mail}
            />

            <InfoItem
              label="Phone"
              value={student.parent.phone}
              icon={Phone}
            />
          </div>
        ) : (
          <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-4">
            <p className="text-sm font-medium text-slate-600">
              No parent or guardian linked
            </p>

            <p className="mt-1 text-xs text-slate-400">
              You can link a parent account by editing this
              student's information.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

function SectionHeader({
  icon: Icon,
  title,
  description,
}) {
  return (
    <div className="mb-6 flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
        <Icon className="h-5 w-5" />
      </div>

      <div>
        <h2 className="font-semibold text-slate-900">
          {title}
        </h2>

        <p className="text-sm text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}

function InfoItem({
  label,
  value,
  icon: Icon,
}) {
  return (
    <div>
      <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
        {Icon && <Icon className="h-3.5 w-3.5" />}
        {label}
      </p>

      <p className="text-sm font-medium text-slate-800">
        {value || "—"}
      </p>
    </div>
  );
}

function OverviewCard({
  icon: Icon,
  title,
  value,
  href,
}) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.push(href)}
      className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-emerald-200 hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-sm font-semibold text-slate-800 transition group-hover:text-emerald-600">
            {value}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition group-hover:bg-emerald-100">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </button>
  );
}

