"use client";

import {
Users,
GraduationCap,
UserRound,
School,
BookOpen,
UserCheck,
CalendarDays,
CalendarRange,
ClipboardList,
ClipboardCheck,
BarChart3,
WalletCards,
CreditCard,
Megaphone,
ArrowRight,
} from "lucide-react";
import { useRouter } from "next/navigation";

const actionGroups = [
{
title: "People",
items: [
{
label: "Students",
description: "Manage enrolled students",
icon: Users,
href: "/dashboard/school-admin/students",
},
{
label: "Teachers",
description: "Manage teaching staff",
icon: GraduationCap,
href: "/dashboard/school-admin/teachers",
},
{
label: "Parents",
description: "Manage parents and guardians",
icon: UserRound,
href: "/dashboard/school-admin/parents",
},
],
},
{
title: "Academic",
items: [
{
label: "Classes",
description: "Manage school classes",
icon: School,
href: "/dashboard/school-admin/classes",
},
{
label: "Subjects",
description: "Manage school subjects",
icon: BookOpen,
href: "/dashboard/school-admin/subjects",
},
{
label: "Subject Assignments",
description: "Assign subjects to teachers",
icon: UserCheck,
href: "/dashboard/school-admin/subject-assignments",
},
{
label: "Academic Sessions",
description: "Manage academic sessions",
icon: CalendarDays,
href: "/dashboard/school-admin/academic-sessions",
},
{
label: "Academic Terms",
description: "Manage academic terms",
icon: CalendarRange,
href: "/dashboard/school-admin/academic-terms",
},
],
},
{
title: "Learning",
items: [
{
label: "Assignments",
description: "Manage student assignments",
icon: ClipboardList,
href: "/dashboard/school-admin/assignments",
},
{
label: "Attendance",
description: "Record and manage attendance",
icon: ClipboardCheck,
href: "/dashboard/school-admin/attendance",
},
{
label: "Results",
description: "Manage student results",
icon: BarChart3,
href: "/dashboard/school-admin/results",
},
],
},
{
title: "Finance",
items: [
{
label: "Fees",
description: "Manage fee structures",
icon: WalletCards,
href: "/dashboard/school-admin/fees",
},
{
label: "Payments",
description: "View school payments",
icon: CreditCard,
href: "/dashboard/school-admin/payments",
},
],
},
{
title: "Communication",
items: [
{
label: "Announcements",
description: "Manage school announcements",
icon: Megaphone,
href: "/dashboard/school-admin/announcements",
},
],
},
];

export default function QuickActions() {
const router = useRouter();

return ( <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white shadow-sm"> <div className="border-b border-slate-100 px-5 py-4"> <h2 className="text-base font-bold text-slate-800">
Quick Links </h2>

    <p className="mt-1 text-xs font-medium text-slate-400">
      Navigate to school management pages
    </p>
  </div>

  <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
    <div className="space-y-5">
      {actionGroups.map((group) => (
        <div key={group.title}>
          <p className="mb-2 px-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            {group.title}
          </p>

          <div className="space-y-1">
            {group.items.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => router.push(item.href)}
                  className="group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-emerald-50"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-500 transition group-hover:bg-white group-hover:text-emerald-600">
                    <Icon size={17} strokeWidth={1.8} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-700 transition group-hover:text-emerald-700">
                      {item.label}
                    </p>

                    <p className="truncate text-xs font-medium text-slate-400">
                      {item.description}
                    </p>
                  </div>

                  <ArrowRight
                    size={15}
                    className="shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-emerald-500"
                  />
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  </div>
</div>


);
}
