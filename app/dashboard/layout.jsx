"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSelector } from "react-redux";

import {
  getDashboardPath,
  getSchoolHomePath,
} from "../../lib/dashboardNavigation";

const dashboardRoutes = [
  "/dashboard/school-admin",
  "/dashboard/super-admin",
  "/dashboard/student",
  "/dashboard/teacher",
  "/dashboard/parent",
];

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isInitialized } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isInitialized, router]);

  if (!isInitialized || !isAuthenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">Checking your session...</p>
      </main>
    );
  }

  const dashboardPath = getDashboardPath(user);
  const isMainDashboard = dashboardRoutes.includes(pathname);
  const isSchoolAdmin = user?.role === "schoolAdmin";
  const isSuperAdmin = user?.role === "superAdmin";
  const schoolHomePath = getSchoolHomePath(user);

  return (
    <>
      <nav className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
        <div className="flex flex-wrap items-center gap-2">
          {!isMainDashboard && (
            <Link
              href={dashboardPath}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Main dashboard
            </Link>
          )}

          {isMainDashboard && isSuperAdmin && (
            <Link
              href="/"
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Platform home
            </Link>
          )}

          {isMainDashboard && isSchoolAdmin && (
            <>
              <Link
                href="/"
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Platform home
              </Link>
              {schoolHomePath && (
                <Link
                  href={schoolHomePath}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  School home
                </Link>
              )}
            </>
          )}

          {isMainDashboard && !isSchoolAdmin && !isSuperAdmin && (
            schoolHomePath && (
              <Link
                href={schoolHomePath}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                School home
              </Link>
            )
          )}
        </div>
      </nav>
      {children}
    </>
  );
}
