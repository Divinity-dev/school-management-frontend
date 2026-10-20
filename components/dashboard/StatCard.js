"use client";

import {
  Users,
  GraduationCap,
  School,
  Wallet,
} from "lucide-react";

const iconMap = {
  students: Users,
  teachers: GraduationCap,
  classes: School,
  fees: Wallet,
};

export default function StatCard({
  title,
  value,
  description,
  icon,
}) {
  const Icon = iconMap[icon] || School;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            {value}
          </h2>

          <p className="mt-1 text-xs text-slate-400">
            {description}
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
          <Icon size={21} strokeWidth={2} />
        </div>
      </div>
    </div>
  );
}

