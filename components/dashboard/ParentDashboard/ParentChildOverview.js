"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  User,
  GraduationCap,
  CalendarDays,
  Mail,
  Phone,
  MapPin,
  BookOpen,
  ClipboardCheck,
  CreditCard,
  Receipt,
  ChevronRight,
  Loader2,
} from "lucide-react";

import api from "@/lib/api";

export default function ParentChildOverview({ studentId }) {
  const [child, setChild] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!studentId) return;

    const fetchChild = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          `/parents/children/${studentId}`
        );

        setChild(response.data.child);
      } catch (err) {
        console.error("Failed to fetch child:", err);

        setError(
          err.response?.data?.message ||
            "Failed to load student information."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchChild();
  }, [studentId]);

  const getFullName = () => {
    if (!child) return "";

    return [
      child.firstName,
      child.middleName,
      child.lastName,
    ]
      .filter(Boolean)
      .join(" ");
  };

  const formatDate = (date) => {
    if (!date) return "Not available";

    return new Date(date).toLocaleDateString("en-NG", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">
            Loading student information...
          </span>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-2xl border border-red-100 bg-white p-6 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
            <User className="h-6 w-6 text-red-500" />
          </div>

          <h1 className="text-lg font-semibold text-slate-900">
            Unable to load student
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            {error}
          </p>
        </div>
      </main>
    );
  }

  if (!child) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">
          Student information is unavailable.
        </p>
      </main>
    );
  }

  const fullName = getFullName();

  const className = [
    child.schoolClass?.name,
    child.schoolClass?.arm,
  ]
    .filter(Boolean)
    .join(" ");

  const quickLinks = [
    {
      title: "Results",
      description: "View academic performance and results",
      href: `/dashboard/parent/children/${studentId}/results`,
      icon: BookOpen,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      title: "Attendance",
      description: "View attendance records and summary",
      href: `/dashboard/parent/children/${studentId}/attendance`,
      icon: ClipboardCheck,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
    {
      title: "Fees",
      description: "View fees and outstanding balance",
      href: `/dashboard/parent/children/${studentId}/fees`,
      icon: CreditCard,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
    },
    {
      title: "Payments",
      description: "View payment history",
      href: `/dashboard/parent/children/${studentId}/payments`,
      icon: Receipt,
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/dashboard/parent"
            className="mb-4 inline-flex items-center text-sm font-medium text-slate-500 transition hover:text-slate-900"
          >
            ← Back to Parent Dashboard
          </Link>

          <div>
            <p className="text-sm font-medium text-emerald-600">
              Child Overview
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              {fullName}
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Student ID: {child.studentId}
            </p>
          </div>
        </div>

        {/* Student Hero */}
        <section className="overflow-hidden rounded-3xl bg-slate-900 shadow-sm">
          <div className="p-6 sm:p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
              {/* Profile */}
              <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white/10 ring-1 ring-white/10">
                {child.profileImage ? (
                  <img
                    src={child.profileImage}
                    alt={fullName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <GraduationCap className="h-10 w-10 text-white/70" />
                )}
              </div>

              <div className="min-w-0">
                <p className="text-sm font-medium text-emerald-300">
                  Student Profile
                </p>

                <h2 className="mt-1 text-2xl font-bold text-white">
                  {fullName}
                </h2>

                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-300">
                  <span className="inline-flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    {className || "Class not assigned"}
                  </span>

                  <span className="inline-flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" />
                    {child.academicSession?.name ||
                      "Session not assigned"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Student Information */}
        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* Academic Information */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
                <GraduationCap className="h-5 w-5 text-emerald-600" />
              </div>

              <div>
                <h2 className="font-semibold text-slate-900">
                  Academic Information
                </h2>
                <p className="text-xs text-slate-500">
                  Current student details
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <InfoRow
                label="Student ID"
                value={child.studentId}
              />

              <InfoRow
                label="Class"
                value={className || "Not assigned"}
              />

              <InfoRow
                label="Academic Session"
                value={
                  child.academicSession?.name ||
                  "Not assigned"
                }
              />

              <InfoRow
                label="Gender"
                value={
                  child.gender
                    ? child.gender.charAt(0).toUpperCase() +
                      child.gender.slice(1)
                    : "Not available"
                }
              />

              <InfoRow
                label="Admission Date"
                value={formatDate(child.admissionDate)}
              />
            </div>
          </div>

          {/* Parent Information */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                <User className="h-5 w-5 text-blue-600" />
              </div>

              <div>
                <h2 className="font-semibold text-slate-900">
                  Parent Information
                </h2>
                <p className="text-xs text-slate-500">
                  Registered parent contact
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <InfoRow
                icon={User}
                label="Name"
                value={
                  child.parent
                    ? [
                        child.parent.firstName,
                        child.parent.lastName,
                      ]
                        .filter(Boolean)
                        .join(" ")
                    : "Not available"
                }
              />

              <InfoRow
                icon={Mail}
                label="Email"
                value={child.parent?.email || "Not available"}
              />

              <InfoRow
                icon={Phone}
                label="Phone"
                value={child.parent?.phone || "Not available"}
              />
            </div>
          </div>
        </section>

        {/* Quick Links */}
        <section className="mt-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-slate-900">
              Child Records
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Quickly access your child's academic and financial
              records.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {quickLinks.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${item.iconBg}`}
                    >
                      <Icon
                        className={`h-5 w-5 ${item.iconColor}`}
                      />
                    </div>

                    <div className="min-w-0">
                      <h3 className="font-semibold text-slate-900">
                        {item.title}
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <ChevronRight className="ml-4 h-5 w-5 shrink-0 text-slate-400 transition group-hover:translate-x-1 group-hover:text-slate-700" />
                </Link>
              );
            })}
          </div>
        </section>

        {/* Status */}
        <div className="mt-6 flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <div>
            <p className="text-sm font-medium text-slate-900">
              Student Status
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Current enrollment status
            </p>
          </div>

          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              child.isActive
                ? "bg-emerald-50 text-emerald-700"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {child.isActive ? "Active" : "Inactive"}
          </span>
        </div>
      </div>
    </main>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        {Icon && <Icon className="h-4 w-4 shrink-0" />}
        <span>{label}</span>
      </div>

      <span className="text-right text-sm font-medium text-slate-900">
        {value}
      </span>
    </div>
  );
}