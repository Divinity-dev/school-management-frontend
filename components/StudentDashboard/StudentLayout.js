"use client";

import { useState } from "react";

import StudentSidebar from "./StudentSidebar";
import StudentHeader from "./StudentHeader";

export default function StudentLayout({
user,
children,
onLogout,
}) {
const [mobileOpen, setMobileOpen] =
useState(false);

return ( <div className="flex min-h-screen bg-slate-50">
<StudentSidebar
user={user}
mobileOpen={mobileOpen}
onClose={() => setMobileOpen(false)}
onLogout={onLogout}
/>


  <div className="flex min-w-0 flex-1 flex-col">
    <StudentHeader
      user={user}
      onMenuClick={() => setMobileOpen(true)}
    />

    <main className="flex-1 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto w-full max-w-7xl">
        {children}
      </div>
    </main>
  </div>
</div>


);
}
