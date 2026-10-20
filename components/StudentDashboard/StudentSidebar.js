"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
BookOpen,
CalendarCheck,
CreditCard,
GraduationCap,
LayoutDashboard,
User,
LogOut,
X,
} from "lucide-react";

const navigation = [
{
name: "Dashboard",
href: "/dashboard",
icon: LayoutDashboard,
},
{
name: "Assignments",
href: "/dashboard/student/assignments",
icon: BookOpen,
},
{
name: "Attendance",
href: "/dashboard/student/attendance",
icon: CalendarCheck,
},
{
name: "Results",
href: "/dashboard/student/results",
icon: GraduationCap,
},
{
name: "Fees",
href: "/dashboard/student/fees",
icon: CreditCard,
},
{
name: "My Profile",
href: "/dashboard/student/profile",
icon: User,
},
];

export default function StudentSidebar({
user,
mobileOpen,
onClose,
onLogout,
}) {
const pathname = usePathname();

return (
<>
{mobileOpen && ( <button
       type="button"
       aria-label="Close sidebar"
       onClick={onClose}
       className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
     />
)}


  <aside
    className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:static lg:z-auto lg:translate-x-0 ${
      mobileOpen
        ? "translate-x-0"
        : "-translate-x-full"
    }`}
  >
    {/* Logo / school branding */}
    <div className="flex h-16 items-center justify-between border-b border-slate-100 px-5">
      <Link
        href="/dashboard"
        onClick={onClose}
        className="flex items-center gap-3"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50">
          <GraduationCap
            size={19}
            className="text-emerald-500"
          />
        </div>

        <div>
          <p className="text-sm font-bold text-slate-900">
            Student Portal
          </p>

          <p className="text-[10px] text-slate-400">
            Academic Management
          </p>
        </div>
      </Link>

      <button
        type="button"
        onClick={onClose}
        className="rounded-lg p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 lg:hidden"
      >
        <X size={18} />
      </button>
    </div>

    {/* Navigation */}
    <nav className="flex-1 overflow-y-auto px-3 py-5">
      <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
        Portal
      </p>

      <div className="space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon;

          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname === item.href ||
                pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Icon
                size={17}
                className={
                  isActive
                    ? "text-emerald-500"
                    : "text-slate-400"
                }
              />

              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>

    {/* Student account */}
    <div className="border-t border-slate-100 p-3">
      <div className="mb-2 flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-emerald-50">
          {user?.profileImage ? (
            <img
              src={user.profileImage}
              alt={user?.firstName || "Student"}
              className="h-full w-full object-cover"
            />
          ) : (
            <User
              size={16}
              className="text-emerald-500"
            />
          )}
        </div>

        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-slate-800">
            {user?.firstName || "Student"}{" "}
            {user?.lastName || ""}
          </p>

          <p className="truncate text-[10px] text-slate-400">
            {user?.email || "Student account"}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onLogout}
        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-red-50 hover:text-red-600"
      >
        <LogOut size={17} />
        <span>Logout</span>
      </button>
    </div>
  </aside>
</>


);
}
