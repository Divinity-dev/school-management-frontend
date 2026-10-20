"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Globe2,
  GraduationCap,
  Newspaper,
} from "lucide-react";

export default function SettingsLayout({ children }) {
  const pathname = usePathname();

  const isWebsite =
    pathname.includes("/settings/website");

  const isPosts =
    pathname.includes("/settings/posts");

  const isGrading =
    pathname.includes("/settings/grading");

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* PAGE HEADER */}

        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Settings
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage your school website, website content
            and academic settings.
          </p>
        </div>

        {/* TABS */}

        <div className="mb-8 border-b border-slate-200">
          <div className="flex gap-6 overflow-x-auto">
            {/* SCHOOL WEBSITE */}

            <Link
              href="/dashboard/school-admin/settings/website"
              className={`relative flex shrink-0 items-center gap-2 pb-4 text-sm font-semibold transition ${
                isWebsite
                  ? "text-emerald-700"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Globe2 size={18} />

              School Website

              {isWebsite && (
                <span className="absolute bottom-0 left-0 h-0.5 w-full rounded-full bg-emerald-600" />
              )}
            </Link>

            {/* NEWS & EVENTS */}

            <Link
              href="/dashboard/school-admin/settings/posts"
              className={`relative flex shrink-0 items-center gap-2 pb-4 text-sm font-semibold transition ${
                isPosts
                  ? "text-emerald-700"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Newspaper size={18} />

              News & Events

              {isPosts && (
                <span className="absolute bottom-0 left-0 h-0.5 w-full rounded-full bg-emerald-600" />
              )}
            </Link>

            {/* GRADING SYSTEM */}

            <Link
              href="/dashboard/school-admin/settings/grading"
              className={`relative flex shrink-0 items-center gap-2 pb-4 text-sm font-semibold transition ${
                isGrading
                  ? "text-emerald-700"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <GraduationCap size={18} />

              Grading System

              {isGrading && (
                <span className="absolute bottom-0 left-0 h-0.5 w-full rounded-full bg-emerald-600" />
              )}
            </Link>
          </div>
        </div>

        {/* PAGE CONTENT */}

        {children}
      </div>
    </div>
  );
}