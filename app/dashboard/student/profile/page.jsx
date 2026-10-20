"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  School,
  User,
  Users,
} from "lucide-react";

import api from "@/lib/api";

const formatDate = (date) => {
  if (!date) return "Not provided";

  return new Date(date).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const getFullName = (person) => {
  if (!person) return "Not provided";

  return [person.firstName, person.middleName, person.lastName]
    .filter(Boolean)
    .join(" ");
};

export default function StudentProfilePage() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/student-portal/dashboard");

        setDashboard(response.data);
      } catch (err) {
        console.error("Failed to fetch student profile:", err);

        setError(
          err.response?.data?.message ||
            "Unable to load your profile. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-8">
        <div className="mx-auto max-w-5xl">
          <div className="animate-pulse space-y-6">
            <div className="h-5 w-32 rounded bg-slate-200" />
            <div className="h-48 rounded-3xl bg-slate-200" />

            <div className="grid gap-6 md:grid-cols-2">
              <div className="h-72 rounded-3xl bg-white shadow-sm" />
              <div className="h-72 rounded-3xl bg-white shadow-sm" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-2xl border border-red-100 bg-white p-6 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
            <User className="h-6 w-6" />
          </div>

          <h1 className="text-lg font-semibold text-slate-900">
            Unable to load profile
          </h1>

          <p className="mt-2 text-sm text-slate-500">{error}</p>

          <button
            onClick={() => window.location.reload()}
            className="mt-5 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  const {
    student,
    school,
    schoolClass,
    academicSession,
    currentTerm,
    parent,
  } = dashboard || {};

  const studentName = getFullName(student);
  const parentName = getFullName(parent);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/dashboard/student"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>

          <div className="mt-5">
            <p className="text-sm font-medium text-emerald-600">
              Student Portal
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              My Profile
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              View your personal and academic information.
            </p>
          </div>
        </div>

        {/* Profile Header */}
        <section className="overflow-hidden rounded-3xl bg-slate-900 shadow-sm">
          <div className="p-6 sm:p-8">
            <div className="flex flex-col items-center gap-5 sm:flex-row">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-3xl bg-white/10 ring-1 ring-white/10">
                {student?.profileImage ? (
                  <img
                    src={student.profileImage}
                    alt={studentName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <GraduationCap className="h-11 w-11 text-white" />
                )}
              </div>

              <div className="text-center sm:text-left">
                <h2 className="text-2xl font-bold text-white">
                  {studentName}
                </h2>

                <p className="mt-1 text-sm text-slate-300">
                  Student ID: {student?.studentId || "Not provided"}
                </p>

                <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
                  {schoolClass && (
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-slate-200">
                      {schoolClass.name}
                      {schoolClass.arm ? ` ${schoolClass.arm}` : ""}
                    </span>
                  )}

                  {currentTerm?.name && (
                    <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-medium text-emerald-300">
                      {currentTerm.name}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Personal Information */}
        <section className="mt-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100 sm:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <User className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Personal Information
              </h2>
              <p className="text-sm text-slate-500">
                Your basic personal details
              </p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <InfoItem
              label="Full Name"
              value={studentName}
              icon={User}
            />

            <InfoItem
              label="Student ID"
              value={student?.studentId}
              icon={GraduationCap}
            />

            <InfoItem
              label="Date of Birth"
              value={formatDate(student?.dateOfBirth)}
              icon={CalendarDays}
            />

            <InfoItem
              label="Gender"
              value={
                student?.gender
                  ? student.gender.charAt(0).toUpperCase() +
                    student.gender.slice(1)
                  : "Not provided"
              }
              icon={User}
            />

            <InfoItem
              label="Admission Date"
              value={formatDate(student?.admissionDate)}
              icon={CalendarDays}
            />

            <InfoItem
              label="Phone"
              value={student?.phone}
              icon={Phone}
            />

            <InfoItem
              label="Address"
              value={student?.address}
              icon={MapPin}
              fullWidth
            />
          </div>
        </section>

        {/* Academic Information */}
        <section className="mt-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100 sm:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <GraduationCap className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Academic Information
              </h2>
              <p className="text-sm text-slate-500">
                Your current academic details
              </p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <InfoItem
              label="Class"
              value={
                schoolClass
                  ? `${schoolClass.name}${schoolClass.arm ? ` ${schoolClass.arm}` : ""}${schoolClass.section ? ` - ${schoolClass.section}` : ""}`
                  : "Not provided"
              }
              icon={GraduationCap}
            />

            <InfoItem
              label="Academic Session"
              value={academicSession?.name}
              icon={CalendarDays}
            />

            <InfoItem
              label="Current Term"
              value={currentTerm?.name}
              icon={CalendarDays}
            />

            <InfoItem
              label="School"
              value={school?.name}
              icon={School}
            />
          </div>
        </section>

        {/* Parent / Guardian */}
        <section className="mt-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100 sm:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <Users className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Parent / Guardian
              </h2>
              <p className="text-sm text-slate-500">
                Your registered parent or guardian information
              </p>
            </div>
          </div>

          {parent ? (
            <div className="grid gap-5 sm:grid-cols-2">
              <InfoItem
                label="Name"
                value={parentName}
                icon={Users}
              />

              <InfoItem
                label="Email"
                value={parent.email}
                icon={Mail}
              />

              <InfoItem
                label="Phone"
                value={parent.phone}
                icon={Phone}
              />
            </div>
          ) : (
            <div className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-500">
              No parent or guardian information is currently available.
            </div>
          )}
        </section>

        {/* School Information */}
        <section className="mt-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100 sm:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <School className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                School Information
              </h2>
              <p className="text-sm text-slate-500">
                Your school details
              </p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <InfoItem
              label="School Name"
              value={school?.name}
              icon={School}
            />

            <InfoItem
              label="School Email"
              value={school?.email}
              icon={Mail}
            />

            <InfoItem
              label="School Phone"
              value={school?.phone}
              icon={Phone}
            />

            <InfoItem
              label="School Address"
              value={school?.address}
              icon={MapPin}
            />
          </div>
        </section>
      </div>
    </main>
  );
}

function InfoItem({ label, value, icon: Icon, fullWidth = false }) {
  return (
    <div className={fullWidth ? "sm:col-span-2" : ""}>
      <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
        <div className="mt-0.5 text-slate-400">
          <Icon className="h-4 w-4" />
        </div>

        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            {label}
          </p>

          <p className="mt-1 break-words text-sm font-medium text-slate-800">
            {value || "Not provided"}
          </p>
        </div>
      </div>
    </div>
  );
}