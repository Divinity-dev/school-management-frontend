"use client";

import { useEffect, useState } from "react";

import {
  AlertCircle,
  ArrowUpRight,
  Building2,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  GraduationCap,
  Loader2,
  ShieldCheck,
  UserCog,
  UserRound,
  Users,
  WalletCards,
  XCircle,
} from "lucide-react";

import api from "@/lib/api";

/* =========================================================
   HELPERS
========================================================= */

function formatCurrency(amount, currency = "NGN") {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

function formatDate(date) {
  if (!date) return "—";

  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function getStatusClasses(status) {
  switch (status) {
    case "active":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";

    case "expired":
      return "bg-amber-50 text-amber-700 border-amber-200";

    case "cancelled":
      return "bg-red-50 text-red-700 border-red-200";

    default:
      return "bg-slate-50 text-slate-600 border-slate-200";
  }
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  iconClassName,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            {value}
          </p>

          {description && (
            <p className="mt-1 text-xs text-slate-500">
              {description}
            </p>
          )}
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconClassName}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   SCHOOL STAT
========================================================= */

function SchoolMetric({
  icon: Icon,
  label,
  value,
  iconClassName,
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-lg ${iconClassName}`}
        >
          <Icon className="h-4 w-4" />
        </div>

        <div>
          <p className="text-xs font-medium text-slate-500">
            {label}
          </p>

          <p className="mt-0.5 text-lg font-bold text-slate-900">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   SCHOOL PERFORMANCE CARD
========================================================= */

function SchoolPerformanceCard({ schoolData }) {
  const {
    school,
    schoolAdmins,
    teachers,
    students,
    parents,
    revenue,
    currency,
  } = schoolData;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      {/* School Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
            <Building2 className="h-6 w-6" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900">
                {school.name}
              </h3>

              <span
                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${
                  school.isActive
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-red-200 bg-red-50 text-red-700"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    school.isActive
                      ? "bg-emerald-500"
                      : "bg-red-500"
                  }`}
                />

                {school.isActive
                  ? "Active"
                  : "Inactive"}
              </span>
            </div>

            <p className="mt-1 text-sm text-slate-500">
              {school.city}
              {school.city && school.state
                ? ", "
                : ""}
              {school.state}
            </p>
          </div>
        </div>

        {/* Revenue */}
        <div className="sm:text-right">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Subscription Revenue
          </p>

          <p className="mt-1 text-xl font-bold text-emerald-700">
            {formatCurrency(revenue, currency)}
          </p>
        </div>
      </div>

      {/* Metrics */}
      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SchoolMetric
          icon={GraduationCap}
          label="Students"
          value={students}
          iconClassName="bg-blue-50 text-blue-600"
        />

        <SchoolMetric
          icon={Users}
          label="Teachers"
          value={teachers}
          iconClassName="bg-violet-50 text-violet-600"
        />

        <SchoolMetric
          icon={UserRound}
          label="Parents"
          value={parents}
          iconClassName="bg-amber-50 text-amber-600"
        />

        <SchoolMetric
          icon={ShieldCheck}
          label="School Admins"
          value={schoolAdmins}
          iconClassName="bg-emerald-50 text-emerald-600"
        />
      </div>

      {/* Footer */}
      <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xs text-slate-500">
          School registered{" "}
          <span className="font-medium text-slate-700">
            {formatDate(school.createdAt)}
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>Slug:</span>

          <span className="rounded-md bg-slate-100 px-2 py-1 font-medium text-slate-700">
            {school.slug}
          </span>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   REVENUE BAR
========================================================= */

function RevenueBar({ school, revenue, maxRevenue }) {
  const percentage =
    maxRevenue > 0
      ? Math.max((revenue / maxRevenue) * 100, 3)
      : 3;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
            <Building2 className="h-4 w-4" />
          </div>

          <span className="truncate text-sm font-medium text-slate-700">
            {school.name}
          </span>
        </div>

        <span className="shrink-0 text-sm font-semibold text-slate-900">
          {formatCurrency(revenue)}
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all"
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>
    </div>
  );
}

/* =========================================================
   MAIN DASHBOARD
========================================================= */

export default function SuperAdminDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          "/super-admin/dashboard"
        );

        setDashboard(response.data);
      } catch (error) {
        console.error(
          "Failed to load Super Admin dashboard:",
          error
        );

        setError(
          error?.response?.data?.message ||
            "Failed to load dashboard statistics."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />

          <p className="text-sm text-slate-500">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  /* =========================================================
     ERROR
  ========================================================= */

  if (error) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

            <div>
              <h2 className="font-semibold text-red-800">
                Unable to load dashboard
              </h2>

              <p className="mt-1 text-sm text-red-700">
                {error}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================
     DATA
  ========================================================= */

  const statistics =
    dashboard?.statistics || {};

  const schools =
    statistics.schools || {};

  const users =
    statistics.users || {};

  const subscriptions =
    statistics.subscriptions || {};

  const revenue =
    statistics.revenue || {};

  const schoolStatistics =
    dashboard?.schoolStatistics || [];

  const recentSchools =
    dashboard?.recentSchools || [];

  const recentSubscriptions =
    dashboard?.recentSubscriptions || [];

  const maxRevenue =
    schoolStatistics.length > 0
      ? Math.max(
          ...schoolStatistics.map(
            (item) => item.revenue || 0
          )
        )
      : 0;

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Super Admin Dashboard
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Overview of your school management platform
        </p>
      </div>

      {/* =====================================================
          PLATFORM OVERVIEW
      ===================================================== */}

      <section>
        <div className="mb-4">
          <h2 className="text-lg font-bold text-slate-900">
            Platform Overview
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Overall performance across all schools.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Schools"
            value={schools.total || 0}
            description={`${schools.active || 0} active schools`}
            icon={Building2}
            iconClassName="bg-emerald-50 text-emerald-600"
          />

          <StatCard
            title="Total Students"
            value={users.students || 0}
            description="Across all schools"
            icon={GraduationCap}
            iconClassName="bg-blue-50 text-blue-600"
          />

          <StatCard
            title="Total Teachers"
            value={users.teachers || 0}
            description="Across all schools"
            icon={Users}
            iconClassName="bg-violet-50 text-violet-600"
          />

          <StatCard
            title="Total Revenue"
            value={formatCurrency(
              revenue.total,
              revenue.currency
            )}
            description="Subscription revenue"
            icon={WalletCards}
            iconClassName="bg-amber-50 text-amber-600"
          />
        </div>
      </section>

      {/* =====================================================
          SCHOOL PERFORMANCE
      ===================================================== */}

      <section>
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              School Performance
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Student, teacher, parent and revenue statistics
              for each school.
            </p>
          </div>

          <div className="text-sm text-slate-500">
            {schoolStatistics.length}{" "}
            {schoolStatistics.length === 1
              ? "school"
              : "schools"}
          </div>
        </div>

        {schoolStatistics.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <Building2 className="mx-auto h-8 w-8 text-slate-400" />

            <p className="mt-3 font-medium text-slate-700">
              No school statistics available
            </p>

            <p className="mt-1 text-sm text-slate-500">
              School statistics will appear here when
              schools are available.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {schoolStatistics.map((schoolData) => (
              <SchoolPerformanceCard
                key={schoolData.school._id}
                schoolData={schoolData}
              />
            ))}
          </div>
        )}
      </section>

      {/* =====================================================
          REVENUE BY SCHOOL
      ===================================================== */}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Revenue by School
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Subscription revenue generated by each school.
            </p>
          </div>

          <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
            <WalletCards className="h-4 w-4" />

            {formatCurrency(
              revenue.total,
              revenue.currency
            )}
          </div>
        </div>

        {schoolStatistics.length === 0 ? (
          <div className="py-10 text-center text-sm text-slate-500">
            No revenue data available.
          </div>
        ) : (
          <div className="mt-6 space-y-5">
            {schoolStatistics.map((schoolData) => (
              <RevenueBar
                key={schoolData.school._id}
                school={schoolData.school}
                revenue={schoolData.revenue || 0}
                maxRevenue={maxRevenue}
              />
            ))}
          </div>
        )}
      </section>

      {/* =====================================================
          LOWER GRID
      ===================================================== */}

      <div className="grid gap-6 xl:grid-cols-2">
        {/* ===================================================
            SUBSCRIPTION OVERVIEW
        =================================================== */}

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Subscription Overview
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Current subscription status across the
                platform.
              </p>
            </div>

            <CreditCard className="h-5 w-5 text-slate-400" />
          </div>

          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between rounded-xl bg-emerald-50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-emerald-600">
                  <CheckCircle2 className="h-5 w-5" />
                </div>

                <span className="text-sm font-medium text-emerald-800">
                  Active
                </span>
              </div>

              <span className="text-lg font-bold text-emerald-800">
                {subscriptions.active || 0}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-amber-50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-amber-600">
                  <CalendarDays className="h-5 w-5" />
                </div>

                <span className="text-sm font-medium text-amber-800">
                  Expired
                </span>
              </div>

              <span className="text-lg font-bold text-amber-800">
                {subscriptions.expired || 0}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-red-50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-red-600">
                  <XCircle className="h-5 w-5" />
                </div>

                <span className="text-sm font-medium text-red-800">
                  Cancelled
                </span>
              </div>

              <span className="text-lg font-bold text-red-800">
                {subscriptions.cancelled || 0}
              </span>
            </div>
          </div>
        </section>

        {/* ===================================================
            PLATFORM USER SUMMARY
        =================================================== */}

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Platform Users
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Total users across all registered schools.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <SchoolMetric
              icon={GraduationCap}
              label="Students"
              value={users.students || 0}
              iconClassName="bg-blue-50 text-blue-600"
            />

            <SchoolMetric
              icon={Users}
              label="Teachers"
              value={users.teachers || 0}
              iconClassName="bg-violet-50 text-violet-600"
            />

            <SchoolMetric
              icon={UserRound}
              label="Parents"
              value={users.parents || 0}
              iconClassName="bg-amber-50 text-amber-600"
            />

            <SchoolMetric
              icon={UserCog}
              label="School Admins"
              value={users.schoolAdmins || 0}
              iconClassName="bg-emerald-50 text-emerald-600"
            />
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
            <span className="text-sm font-medium text-slate-500">
              Total platform users
            </span>

            <span className="text-lg font-bold text-slate-900">
              {users.total || 0}
            </span>
          </div>
        </section>
      </div>

      {/* =====================================================
          RECENT SCHOOLS
      ===================================================== */}

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Recent Schools
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Recently registered schools on the platform.
            </p>
          </div>

          <Building2 className="h-5 w-5 text-slate-400" />
        </div>

        {recentSchools.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            No schools found.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentSchools.map((school) => (
              <div
                key={school._id}
                className="flex flex-col gap-3 p-5 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                    <Building2 className="h-5 w-5" />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-900">
                      {school.name}
                    </p>

                    <p className="mt-0.5 truncate text-xs text-slate-500">
                      {school.city}
                      {school.city && school.state
                        ? ", "
                        : ""}
                      {school.state}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 sm:text-right">
                  <div>
                    <p className="text-xs text-slate-400">
                      Registered
                    </p>

                    <p className="mt-0.5 text-sm font-medium text-slate-700">
                      {formatDate(school.createdAt)}
                    </p>
                  </div>

                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${
                      school.isActive
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-red-200 bg-red-50 text-red-700"
                    }`}
                  >
                    {school.isActive
                      ? "Active"
                      : "Inactive"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* =====================================================
          RECENT SUBSCRIPTIONS
      ===================================================== */}

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Recent Subscriptions
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Latest school subscription activity.
            </p>
          </div>

          <CreditCard className="h-5 w-5 text-slate-400" />
        </div>

        {recentSubscriptions.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            No subscriptions found.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentSubscriptions.map((subscription) => (
              <div
                key={subscription._id}
                className="flex flex-col gap-4 p-5 transition hover:bg-slate-50 lg:flex-row lg:items-center lg:justify-between"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <CreditCard className="h-5 w-5" />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-900">
                      {subscription.school?.name ||
                        "Unknown School"}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {subscription.academicSession
                        ?.name || "—"}{" "}
                      ·{" "}
                      {subscription.academicTerm
                        ?.name || "—"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:min-w-[520px]">
                  <div>
                    <p className="text-xs text-slate-400">
                      Student Limit
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {subscription.studentLimit || 0}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">
                      Amount
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {formatCurrency(
                        subscription.amount
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">
                      Expires
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {formatDate(
                        subscription.expiresAt
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">
                      Status
                    </p>

                    <span
                      className={`mt-1 inline-flex rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${getStatusClasses(
                        subscription.status
                      )}`}
                    >
                      {subscription.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* =====================================================
          FOOTER SUMMARY
      ===================================================== */}

      <div className="flex flex-col gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">
            <WalletCards className="h-5 w-5" />
          </div>

          <div>
            <p className="font-semibold text-emerald-900">
              Platform Revenue
            </p>

            <p className="mt-0.5 text-sm text-emerald-700">
              Total subscription revenue generated across
              all schools.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-emerald-800">
            {formatCurrency(
              revenue.total,
              revenue.currency
            )}
          </span>

          <ArrowUpRight className="h-5 w-5 text-emerald-600" />
        </div>
      </div>
    </div>
  );
}

