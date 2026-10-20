"use client";

import {
Menu,
Bell,
User,
} from "lucide-react";

export default function StudentHeader({
user,
onMenuClick,
}) {
return ( <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6"> <button
     type="button"
     onClick={onMenuClick}
     className="rounded-xl p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-700 lg:hidden"
     aria-label="Open navigation"
   > <Menu size={21} /> </button>


  <div className="hidden lg:block">
    <p className="text-sm font-semibold text-slate-800">
      Student Portal
    </p>

    <p className="text-xs text-slate-400">
      Manage your academic activities
    </p>
  </div>

  <div className="ml-auto flex items-center gap-2">
    <button
      type="button"
      className="relative rounded-xl p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600"
      aria-label="Notifications"
    >
      <Bell size={19} />

      <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500" />
    </button>

    <div className="flex items-center gap-2 border-l border-slate-100 pl-3">
      <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-emerald-50">
        {user?.profileImage ? (
          <img
            src={user.profileImage}
            alt={user?.firstName || "Student"}
            className="h-full w-full object-cover"
          />
        ) : (
          <User
            size={15}
            className="text-emerald-500"
          />
        )}
      </div>

      <div className="hidden sm:block">
        <p className="text-xs font-semibold text-slate-700">
          {user?.firstName || "Student"}
        </p>

        <p className="text-[10px] text-slate-400">
          Student
        </p>
      </div>
    </div>
  </div>
</header>


);
}
