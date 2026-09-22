"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
ArrowRight,
BookOpen,
CheckCircle2,
GraduationCap,
Plus,
Search,
Users,
XCircle,
} from "lucide-react";

import api from "@/lib/api";

export default function ClassesPage() {
const router = useRouter();

const [classes, setClasses] = useState([]);
const [sessions, setSessions] = useState([]);

const [search, setSearch] = useState("");
const [sessionFilter, setSessionFilter] = useState("all");
const [statusFilter, setStatusFilter] = useState("all");

const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

// --------------------------------------------------
// Load classes and academic sessions
// --------------------------------------------------

useEffect(() => {
const loadData = async () => {
try {
setLoading(true);
setError("");


    const [classesResponse, sessionsResponse] =
      await Promise.all([
        api.get("/classes"),
        api.get("/academic-sessions"),
      ]);

    setClasses(
      classesResponse.data?.classes || []
    );

    setSessions(
      sessionsResponse.data?.sessions || []
    );
  } catch (err) {
    console.error(
      "Failed to load classes:",
      err
    );

    setError(
      err?.response?.data?.message ||
        "Failed to load classes. Please try again."
    );
  } finally {
    setLoading(false);
  }
};

loadData();


}, []);

// --------------------------------------------------
// Helpers
// --------------------------------------------------

const getSessionId = (schoolClass) => {
return (
schoolClass.academicSession?._id ||
schoolClass.academicSession ||
""
);
};

const getSessionName = (schoolClass) => {
if (
schoolClass.academicSession &&
typeof schoolClass.academicSession ===
"object"
) {
return (
schoolClass.academicSession.name ||
"—"
);
}


const session = sessions.find(
  (item) =>
    item._id ===
    schoolClass.academicSession
);

return session?.name || "—";


};

const getStudentCount = (schoolClass) => {
if (
typeof schoolClass.studentCount ===
"number"
) {
return schoolClass.studentCount;
}


if (Array.isArray(schoolClass.students)) {
  return schoolClass.students.length;
}

if (
  typeof schoolClass.studentsCount ===
  "number"
) {
  return schoolClass.studentsCount;
}

return 0;


};

const getClassName = (schoolClass) => {
return (
schoolClass.name ||
schoolClass.className ||
"Unnamed Class"
);
};

const getLevel = (schoolClass) => {
return (
schoolClass.level ||
schoolClass.section ||
"—"
);
};

const getArm = (schoolClass) => {
return schoolClass.arm || "—";
};

// --------------------------------------------------
// Filter classes
// --------------------------------------------------

const filteredClasses = useMemo(() => {
const query = search.trim().toLowerCase();


return classes.filter((schoolClass) => {
  const className = getClassName(
    schoolClass
  ).toLowerCase();

  const level = getLevel(
    schoolClass
  ).toLowerCase();

  const arm = getArm(
    schoolClass
  ).toLowerCase();

  const sessionName = getSessionName(
    schoolClass
  ).toLowerCase();

  const matchesSearch =
    !query ||
    className.includes(query) ||
    level.includes(query) ||
    arm.includes(query) ||
    sessionName.includes(query);

  const matchesSession =
    sessionFilter === "all" ||
    getSessionId(schoolClass) ===
      sessionFilter;

  const isActive =
    schoolClass.isActive !== false;

  const matchesStatus =
    statusFilter === "all" ||
    (statusFilter === "active" &&
      isActive) ||
    (statusFilter === "inactive" &&
      !isActive);

  return (
    matchesSearch &&
    matchesSession &&
    matchesStatus
  );
});


}, [
classes,
search,
sessionFilter,
statusFilter,
sessions,
]);

// --------------------------------------------------
// Summary statistics
// --------------------------------------------------

const totalClasses = classes.length;

const activeClasses = classes.filter(
(schoolClass) =>
schoolClass.isActive !== false
).length;

const inactiveClasses =
totalClasses - activeClasses;

// --------------------------------------------------
// Loading state
// --------------------------------------------------

if (loading) {
return ( <div className="flex min-h-[60vh] items-center justify-center"> <div className="flex items-center gap-3 text-slate-600"> <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-600" /> <span>Loading classes...</span> </div> </div>
);
}

return ( <div className="space-y-6 p-4 sm:p-6 lg:p-8">
{/* Header */} <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"> <div> <h1 className="text-2xl font-bold text-slate-900">
Classes </h1>


      <p className="mt-1 text-sm text-slate-500">
        Manage the classes in your school.
      </p>
    </div>

    <button
      type="button"
      onClick={() =>
        router.push(
          "/dashboard/school-admin/classes/new"
        )
      }
      className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
    >
      <Plus className="h-4 w-4" />
      Add Class
    </button>
  </div>

  {/* Error */}
  {error && (
    <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
      <span>{error}</span>

      <button
        type="button"
        onClick={() =>
          window.location.reload()
        }
        className="text-red-700 underline underline-offset-2 hover:text-red-900"
      >
        Retry
      </button>
    </div>
  )}

  {/* Summary Cards */}
  <div className="grid gap-4 sm:grid-cols-3">
    <SummaryCard
      label="Total Classes"
      value={totalClasses}
      icon={GraduationCap}
      iconClass="bg-slate-100 text-slate-600"
    />

    <SummaryCard
      label="Active Classes"
      value={activeClasses}
      icon={CheckCircle2}
      iconClass="bg-emerald-50 text-emerald-600"
    />

    <SummaryCard
      label="Inactive Classes"
      value={inactiveClasses}
      icon={XCircle}
      iconClass="bg-red-50 text-red-600"
    />
  </div>

  {/* Filters */}
  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
    <div className="grid gap-4 lg:grid-cols-[1fr_220px_180px]">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

        <input
          type="text"
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="Search classes..."
          className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
        />
      </div>

      {/* Academic Session */}
      <select
        value={sessionFilter}
        onChange={(event) =>
          setSessionFilter(event.target.value)
        }
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
      >
        <option value="all">
          All Sessions
        </option>

        {sessions
          .filter(
            (session) => session.isActive
          )
          .map((session) => (
            <option
              key={session._id}
              value={session._id}
            >
              {session.name}
              {session.isCurrent
                ? " (Current)"
                : ""}
            </option>
          ))}
      </select>

      {/* Status */}
      <select
        value={statusFilter}
        onChange={(event) =>
          setStatusFilter(event.target.value)
        }
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
      >
        <option value="all">
          All Status
        </option>
        <option value="active">
          Active
        </option>
        <option value="inactive">
          Inactive
        </option>
      </select>
    </div>
  </div>

  {/* Classes Table */}
  <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-semibold text-slate-900">
            All Classes
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            {filteredClasses.length}{" "}
            {filteredClasses.length === 1
              ? "class"
              : "classes"}{" "}
            shown
          </p>
        </div>
      </div>
    </div>

    {filteredClasses.length === 0 ? (
      <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
          <BookOpen className="h-6 w-6" />
        </div>

        <h3 className="font-semibold text-slate-900">
          No classes found
        </h3>

        <p className="mt-1 max-w-sm text-sm text-slate-500">
          {search ||
          sessionFilter !== "all" ||
          statusFilter !== "all"
            ? "Try adjusting your search or filters."
            : "No classes have been created yet."}
        </p>

        {!search &&
          sessionFilter === "all" &&
          statusFilter === "all" && (
            <button
              type="button"
              onClick={() =>
                router.push(
                  "/dashboard/school-admin/classes/new"
                )
              }
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              <Plus className="h-4 w-4" />
              Add Class
            </button>
          )}
      </div>
    ) : (
      <div className="overflow-x-auto">
        <table className="w-full min-w-[850px]">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Class
              </th>

              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Academic Session
              </th>

              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Level
              </th>

              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Arm
              </th>

              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Students
              </th>

              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Status
              </th>

              <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                Action
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {filteredClasses.map(
              (schoolClass) => {
                const isActive =
                  schoolClass.isActive !== false;

                return (
                  <tr
                    key={schoolClass._id}
                    className="transition hover:bg-slate-50"
                  >
                    {/* Class */}
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() =>
                          router.push(
                            `/dashboard/school-admin/classes/${schoolClass._id}`
                          )
                        }
                        className="flex items-center gap-3 text-left"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                          <GraduationCap className="h-5 w-5" />
                        </div>

                        <div>
                          <p className="font-semibold text-slate-900 transition hover:text-emerald-600">
                            {getClassName(
                              schoolClass
                            )}
                          </p>

                          <p className="text-xs text-slate-500">
                            Class
                          </p>
                        </div>
                      </button>
                    </td>

                    {/* Session */}
                    <td className="px-5 py-4 text-sm text-slate-600">
                      {getSessionName(
                        schoolClass
                      )}
                    </td>

                    {/* Level */}
                    <td className="px-5 py-4 text-sm text-slate-600">
                      {getLevel(schoolClass)}
                    </td>

                    {/* Arm */}
                    <td className="px-5 py-4 text-sm text-slate-600">
                      {getArm(schoolClass)}
                    </td>

                    {/* Students */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Users className="h-4 w-4 text-slate-400" />

                        {getStudentCount(
                          schoolClass
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                          isActive
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {isActive
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() =>
                          router.push(
                            `/dashboard/school-admin/classes/${schoolClass._id}`
                          )
                        }
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                      >
                        View
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              }
            )}
          </tbody>
        </table>
      </div>
    )}
  </section>
</div>


);
}

// --------------------------------------------------
// Summary Card
// --------------------------------------------------

function SummaryCard({
label,
value,
icon: Icon,
iconClass,
}) {
return ( <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"> <div className="flex items-center justify-between"> <div> <p className="text-sm font-medium text-slate-500">
{label} </p>


      <p className="mt-2 text-2xl font-bold text-slate-900">
        {value}
      </p>
    </div>

    <div
      className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}
    >
      <Icon className="h-5 w-5" />
    </div>
  </div>
</div>


);
}
