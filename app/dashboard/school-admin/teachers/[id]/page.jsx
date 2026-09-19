"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Edit3,
  Mail,
  Phone,
  User,
  ShieldCheck,
  ShieldX,
  Loader2,
} from "lucide-react";

import api from "@/lib/api";

export default function TeacherProfilePage() {
  const params = useParams();
  const teacherId = params?.id;

  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!teacherId) return;

    const fetchTeacher = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(`/teachers/${teacherId}`);

        setTeacher(response.data?.teacher || response.data);
      } catch (err) {
        console.error("Failed to fetch teacher:", err);

        setError(
          err?.response?.data?.message ||
            "Unable to load teacher information."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTeacher();
  }, [teacherId]);

  const getInitials = () => {
    if (!teacher) return "T";

    const first = teacher.firstName?.charAt(0) || "";
    const last = teacher.lastName?.charAt(0) || "";

    return `${first}${last}`.toUpperCase() || "T";
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
        <div className="flex min-h-[500px] items-center justify-center">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading teacher...
          </div>
        </div>
      </main>
    );
  }

  if (error || !teacher) {
    return (
      <main className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-5xl">
          <Link
            href="/dashboard/school-admin/teachers"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-emerald-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Teachers
          </Link>

          <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-600">
            {error || "Teacher not found."}
          </div>
        </div>
      </main>
    );
  }

  const fullName =
    `${teacher.firstName || ""} ${teacher.lastName || ""}`.trim() ||
    "Unnamed Teacher";

  const isActive = teacher.isActive !== false;

  return (
    <main className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Back */}
        <Link
          href="/dashboard/school-admin/teachers"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-emerald-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Teachers
        </Link>

        {/* Profile Header */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-slate-50 px-5 py-6 sm:px-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-xl font-bold text-emerald-700">
                  {getInitials()}
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                      {fullName}
                    </h1>

                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        isActive
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <p className="mt-1 text-sm text-slate-500">
                    Teacher
                  </p>
                </div>
              </div>

              <Link
                href={`/dashboard/school-admin/teachers/${teacher._id}/edit`}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
              >
                <Edit3 className="h-4 w-4" />
                Edit Teacher
              </Link>
            </div>
          </div>

          {/* Contact Summary */}
          <div className="grid grid-cols-1 divide-y divide-slate-100 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
            <div className="flex items-center gap-3 px-5 py-5 sm:px-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                <Mail className="h-4 w-4" />
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Email
                </p>

                <p className="mt-1 break-all text-sm font-semibold text-slate-700">
                  {teacher.email || "Not provided"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 px-5 py-5 sm:px-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                <Phone className="h-4 w-4" />
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Phone
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-700">
                  {teacher.phone || "Not provided"}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Information */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
          <SectionHeader
            icon={<User className="h-4 w-4" />}
            title="Teacher Information"
          />

          <div className="mt-6 grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
            <InfoItem
              label="First Name"
              value={teacher.firstName}
            />

            <InfoItem
              label="Last Name"
              value={teacher.lastName}
            />

            <InfoItem
              label="Email Address"
              value={teacher.email}
            />

            <InfoItem
              label="Phone Number"
              value={teacher.phone}
            />
          </div>
        </section>

        {/* Account Status */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
          <SectionHeader
            icon={
              isActive ? (
                <ShieldCheck className="h-4 w-4" />
              ) : (
                <ShieldX className="h-4 w-4" />
              )
            }
            title="Account Status"
          />

          <div className="mt-6">
            <div
              className={`flex items-center gap-4 rounded-xl border p-4 ${
                isActive
                  ? "border-emerald-100 bg-emerald-50"
                  : "border-slate-200 bg-slate-50"
              }`}
            >
              {isActive ? (
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
              ) : (
                <ShieldX className="h-5 w-5 text-slate-500" />
              )}

              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {isActive
                    ? "Teacher account is active"
                    : "Teacher account is inactive"}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {isActive
                    ? "This teacher can access their account."
                    : "This teacher currently cannot access their account."}
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function SectionHeader({ icon, title }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
        {icon}
      </div>

      <h2 className="text-base font-bold text-slate-900">
        {title}
      </h2>
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-slate-700">
        {value || "Not provided"}
      </p>
    </div>
  );
}
