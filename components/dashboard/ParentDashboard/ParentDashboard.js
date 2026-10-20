
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Users,
  GraduationCap,
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  CreditCard,
  Wallet,
  ChevronRight,
  UserRound,
  RefreshCw,
  AlertCircle,
  Mail,
  Phone,
  School,
  ArrowUpRight,
  User,
} from "lucide-react";

import api from "@/lib/api";

export default function ParentDashboard({ user }) {
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchChildren = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/parents/children");

        const data = response.data;
        const childrenData = Array.isArray(data)
          ? data
          : data?.children || data?.data?.children || data?.data || [];

        if (isMounted) {
          setChildren(Array.isArray(childrenData) ? childrenData : []);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err.response?.data?.message ||
              "We couldn't load your children's information. Please try again."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchChildren();

    return () => {
      isMounted = false;
    };
  }, []);

  const activeChildren = useMemo(
    () => children.filter((child) => child.isActive !== false),
    [children]
  );

  const classCount = useMemo(() => {
    const classes = children
      .map((child) => {
        const schoolClass = child.schoolClass;

        if (!schoolClass) return null;

        if (typeof schoolClass === "string") return schoolClass;

        return schoolClass._id || schoolClass.name || null;
      })
      .filter(Boolean);

    return new Set(classes).size;
  }, [children]);

  const firstName =
    user?.firstName ||
    user?.name?.split(" ")[0] ||
    user?.fullName?.split(" ")[0] ||
    "Parent";

  const fullName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.name ||
    user?.fullName ||
    "Parent";

  const initials = fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Welcome hero */}
        <section className="relative isolate overflow-hidden rounded-3xl bg-slate-900 px-6 py-8 text-white shadow-sm sm:px-8 sm:py-10">
          <div className="absolute -right-16 -top-24 -z-10 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />
          <div className="absolute -bottom-32 left-1/3 -z-10 h-64 w-64 rounded-full bg-teal-400/10 blur-3xl" />

          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-center">
            <div className="max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-emerald-300">
                <Users size={14} />
                Parent Portal
              </div>

              <p className="text-sm text-slate-300">
                Welcome back, {firstName}
              </p>

              <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                Stay connected to their progress.
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
                Keep track of your children&apos;s academic journey, review
                published results, monitor attendance, and manage school fee
                payments from one place.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href="#my-children"
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
                >
                  View my children
                  <ChevronRight size={17} />
                </a>

                <Link
                  href="/dashboard/parent/profile"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  <UserRound size={16} />
                  My profile
                </Link>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 md:min-w-64">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-400 text-lg font-bold text-slate-950">
                {initials || <User size={24} />}
              </div>

              <div className="min-w-0">
                <p className="truncate font-semibold">{fullName}</p>

                {user?.email && (
                  <p className="mt-1 flex items-center gap-2 truncate text-sm text-slate-300">
                    <Mail size={14} className="shrink-0" />
                    <span className="truncate">{user.email}</span>
                  </p>
                )}

                {user?.phone && (
                  <p className="mt-1 flex items-center gap-2 text-sm text-slate-300">
                    <Phone size={14} className="shrink-0" />
                    {user.phone}
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Summary cards */}
        <section>
          <div className="mb-4">
            <h2 className="text-lg font-bold text-slate-900">
              Family overview
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              A quick overview of the children linked to your account.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              title="My children"
              value={loading ? "—" : children.length}
              description="Linked to your account"
              icon={Users}
              color="emerald"
            />

            <SummaryCard
              title="Active students"
              value={loading ? "—" : activeChildren.length}
              description="Currently marked active"
              icon={GraduationCap}
              color="blue"
            />

            <SummaryCard
              title="Classes represented"
              value={loading ? "—" : classCount}
              description="Across your children's records"
              icon={School}
              color="violet"
            />

            <SummaryCard
              title="Portal access"
              value="Available"
              description="Results, attendance and fees"
              icon={BookOpen}
              color="amber"
            />
          </div>
        </section>

        {/* Quick links */}
        <section>
          <div className="mb-4">
            <h2 className="text-lg font-bold text-slate-900">Quick access</h2>
            <p className="mt-1 text-sm text-slate-500">
              Choose a child below to open their records, or use these shortcuts.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <QuickLink
              href="#my-children"
              title="My children"
              description="View linked student profiles"
              icon={Users}
              iconColor="text-emerald-600"
              iconBg="bg-emerald-50"
            />

            <QuickLink
              href="#my-children"
              title="Academic results"
              description="Open a child's published results"
              icon={BookOpen}
              iconColor="text-blue-600"
              iconBg="bg-blue-50"
            />

            <QuickLink
              href="#my-children"
              title="Attendance"
              description="Review attendance records"
              icon={ClipboardCheck}
              iconColor="text-violet-600"
              iconBg="bg-violet-50"
            />

            <QuickLink
              href="#my-children"
              title="Fees and payments"
              description="View balances and payment history"
              icon={Wallet}
              iconColor="text-amber-600"
              iconBg="bg-amber-50"
            />
          </div>
        </section>

        {/* Children list */}
        <section id="my-children" className="scroll-mt-6">
          <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-xl font-bold text-slate-900">My children</h2>
              <p className="mt-1 text-sm text-slate-500">
                Select a child to access their academic and financial records.
              </p>
            </div>

            {!loading && !error && (
              <span className="inline-flex w-fit items-center rounded-full bg-white px-3 py-1.5 text-sm font-medium text-slate-600 ring-1 ring-slate-200">
                {children.length} {children.length === 1 ? "child" : "children"}
              </span>
            )}
          </div>

          {loading ? (
            <LoadingState />
          ) : error ? (
            <ErrorState message={error} onRetry={() => {
              setLoading(true);
              setError("");

              api
                .get("/parents/children")
                .then((response) => {
                  const data = response.data;
                  const result = Array.isArray(data)
                    ? data
                    : data?.children || data?.data?.children || data?.data || [];

                  setChildren(Array.isArray(result) ? result : []);
                })
                .catch((err) => {
                  setError(
                    err.response?.data?.message ||
                      "We couldn't load your children's information. Please try again."
                  );
                })
                .finally(() => setLoading(false));
            }} />
          ) : children.length === 0 ? (
            <EmptyChildrenState />
          ) : (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {children.map((child) => (
                <ChildCard key={child._id} child={child} />
              ))}
            </div>
          )}
        </section>

        {/* Footer note */}
        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-emerald-50 p-2 text-emerald-700">
              <AlertCircle size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">
                Your child&apos;s information
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Results shown in the parent portal are published by the school.
                If a child is missing from this list or their information needs
                correction, please contact the school administrator.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function SummaryCard({ title, value, description, icon: Icon, color }) {
  const colors = {
    emerald: "bg-emerald-50 text-emerald-700",
    blue: "bg-blue-50 text-blue-700",
    violet: "bg-violet-50 text-violet-700",
    amber: "bg-amber-50 text-amber-700",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
            {value}
          </p>
          <p className="mt-2 text-xs text-slate-500">{description}</p>
        </div>

        <div className={`rounded-xl p-3 ${colors[color]}`}>
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
}

function QuickLink({
  href,
  title,
  description,
  icon: Icon,
  iconColor,
  iconBg,
}) {
  return (
    <a
      href={href}
      className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-emerald-200 hover:shadow-md"
    >
      <div className={`shrink-0 rounded-xl p-3 ${iconBg} ${iconColor}`}>
        <Icon size={21} />
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="font-semibold text-slate-900">{title}</h3>
        <p className="mt-1 text-sm leading-5 text-slate-500">{description}</p>
      </div>

      <ChevronRight
        size={18}
        className="shrink-0 text-slate-400 transition group-hover:translate-x-1 group-hover:text-emerald-600"
      />
    </a>
  );
}

function ChildCard({ child }) {
  const schoolClass = child.schoolClass;
  const className =
    typeof schoolClass === "string"
      ? schoolClass
      : [
          schoolClass?.name,
          schoolClass?.arm,
        ]
          .filter(Boolean)
          .join(" ") || "Class not assigned";

  const session =
    typeof child.academicSession === "string"
      ? child.academicSession
      : child.academicSession?.name || "Session not assigned";

  const studentName =
    [child.firstName, child.middleName, child.lastName]
      .filter(Boolean)
      .join(" ") ||
    child.name ||
    "Student";

  const isActive = child.isActive !== false;

  const studentId = child._id;

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      <div className="border-b border-slate-100 p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-emerald-50 text-emerald-700">
            {child.profileImage ? (
              <img
                src={child.profileImage}
                alt={studentName}
                className="h-full w-full object-cover"
              />
            ) : (
              <GraduationCap size={27} />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="break-words text-lg font-bold text-slate-900">
                {studentName}
              </h3>

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
              Student ID: {child.studentId || "Not assigned"}
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <ChildInfo
            icon={School}
            label="Class"
            value={className}
          />
          <ChildInfo
            icon={CalendarDays}
            label="Academic session"
            value={session}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-px bg-slate-100 sm:grid-cols-4">
        <ChildAction
          href={`/dashboard/parent/children/${studentId}/results`}
          label="Results"
          icon={BookOpen}
        />

        <ChildAction
          href={`/dashboard/parent/children/${studentId}/attendance`}
          label="Attendance"
          icon={ClipboardCheck}
        />

        <ChildAction
          href={`/dashboard/parent/children/${studentId}/fees`}
          label="School fees"
          icon={CreditCard}
        />

        <ChildAction
          href={`/dashboard/parent/children/${studentId}/payments`}
          label="Payments"
          icon={Wallet}
        />
      </div>

      <div className="border-t border-slate-100 p-4">
        <Link
          href={`/dashboard/parent/children/${studentId}`}
          className="flex items-center justify-between rounded-xl px-2 py-2 text-sm font-semibold text-slate-700 transition hover:text-emerald-700"
        >
          View student profile
          <ArrowUpRight size={17} />
        </Link>
      </div>
    </article>
  );
}

function ChildInfo({ icon: Icon, label, value }) {
  return (
    <div className="flex min-w-0 items-start gap-3 rounded-xl bg-slate-50 p-3">
      <Icon size={17} className="mt-0.5 shrink-0 text-slate-400" />

      <div className="min-w-0">
        <p className="text-xs text-slate-500">{label}</p>
        <p className="mt-1 break-words text-sm font-semibold text-slate-800">
          {value}
        </p>
      </div>
    </div>
  );
}

function ChildAction({ href, label, icon: Icon }) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center justify-center gap-2 bg-white px-2 py-4 text-center transition hover:bg-emerald-50"
    >
      <Icon size={19} className="text-emerald-700" />
      <span className="text-xs font-semibold text-slate-600">{label}</span>
    </Link>
  );
}

function LoadingState() {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 text-center">
      <div className="rounded-full bg-emerald-50 p-4 text-emerald-700">
        <RefreshCw size={24} className="animate-spin" />
      </div>
      <h3 className="mt-4 font-semibold text-slate-900">
        Loading your children
      </h3>
      <p className="mt-2 text-sm text-slate-500">
        Please wait while we retrieve their information.
      </p>
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="rounded-2xl border border-red-200 bg-white p-8 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
        <AlertCircle size={23} />
      </div>

      <h3 className="mt-4 font-semibold text-slate-900">
        Unable to load children
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        {message}
      </p>

      <button
        type="button"
        onClick={onRetry}
        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
      >
        <RefreshCw size={15} />
        Try again
      </button>
    </div>
  );
}

function EmptyChildrenState() {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
        <Users size={30} />
      </div>

      <h3 className="mt-5 text-lg font-bold text-slate-900">
        No children linked yet
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        Your children&apos;s profiles will appear here once the school
        administrator links them to your parent account.
      </p>
    </div>
  );
}