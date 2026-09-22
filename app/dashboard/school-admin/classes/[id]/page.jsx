"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
ArrowLeft,
BookOpen,
Edit,
GraduationCap,
Users,
User,
CalendarDays,
CheckCircle2,
XCircle,
Loader2,
} from "lucide-react";

import api from "@/lib/api";

export default function ClassProfilePage() {
const params = useParams();
const router = useRouter();

const classId = params?.id;

const [schoolClass, setSchoolClass] =
useState(null);

const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

// --------------------------------------------------
// Load class
// --------------------------------------------------

useEffect(() => {
const loadClass = async () => {
if (!classId) {
return;
}


  try {
    setLoading(true);
    setError("");

    const response = await api.get(
      `/classes/${classId}`
    );

    const classData =
      response.data?.schoolClass ||
      response.data?.class ||
      response.data;

    if (!classData) {
      throw new Error(
        "Class information was not found."
      );
    }

    setSchoolClass(classData);
  } catch (err) {
    console.error(
      "Failed to load class:",
      err
    );

    setError(
      err?.response?.data?.message ||
        err?.message ||
        "Failed to load class information."
    );
  } finally {
    setLoading(false);
  }
};

loadClass();


}, [classId]);

// --------------------------------------------------
// Helpers
// --------------------------------------------------

const getClassName = () => {
return (
schoolClass?.name ||
schoolClass?.className ||
"Unnamed Class"
);
};

const getSessionName = () => {
const session =
schoolClass?.academicSession;


if (!session) {
  return "—";
}

if (typeof session === "object") {
  return session.name || "—";
}

return "—";


};

const getLevel = () => {
return (
schoolClass?.level ||
schoolClass?.section ||
"—"
);
};

const getArm = () => {
return schoolClass?.arm || "—";
};

const getStudents = () => {
if (Array.isArray(schoolClass?.students)) {
return schoolClass.students;
}


return [];


};

const students = getStudents();

const studentCount =
typeof schoolClass?.studentCount ===
"number"
? schoolClass.studentCount
: typeof schoolClass?.studentsCount ===
"number"
? schoolClass.studentsCount
: students.length;

const isActive =
schoolClass?.isActive !== false;

// --------------------------------------------------
// Loading
// --------------------------------------------------

if (loading) {
return ( <div className="flex min-h-[60vh] items-center justify-center"> <div className="flex items-center gap-3 text-slate-600"> <Loader2 className="h-5 w-5 animate-spin" /> <span>
Loading class information... </span> </div> </div>
);
}

// --------------------------------------------------
// Error
// --------------------------------------------------

if (error || !schoolClass) {
return ( <div className="space-y-6 p-4 sm:p-6 lg:p-8">
<button
type="button"
onClick={() =>
router.push(
"/dashboard/school-admin/classes"
)
}
className="flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-emerald-600"
> <ArrowLeft className="h-4 w-4" />
Back to Classes </button>


    <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
      {error ||
        "Class information could not be found."}
    </div>
  </div>
);


}

return ( <div className="space-y-6 p-4 sm:p-6 lg:p-8">
{/* Back */}
<button
type="button"
onClick={() =>
router.push(
"/dashboard/school-admin/classes"
)
}
className="flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-emerald-600"
> <ArrowLeft className="h-4 w-4" />
Back to Classes </button>


  {/* Profile Header */}
  <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
          <GraduationCap className="h-8 w-8" />
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">
              {getClassName()}
            </h1>

            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                isActive
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              {isActive ? (
                <CheckCircle2 className="h-3.5 w-3.5" />
              ) : (
                <XCircle className="h-3.5 w-3.5" />
              )}

              {isActive
                ? "Active"
                : "Inactive"}
            </span>
          </div>

          <p className="mt-1 text-sm text-slate-500">
            {getLevel()}
            {getArm() !== "—"
              ? ` ${getArm()}`
              : ""}
          </p>
        </div>
      </div>

      <Link
        href={`/dashboard/school-admin/classes/${classId}/edit`}
        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
      >
        <Edit className="h-4 w-4" />
        Edit Class
      </Link>
    </div>
  </section>

  {/* Overview Cards */}
  <div className="grid gap-4 sm:grid-cols-3">
    <InfoCard
      label="Academic Session"
      value={getSessionName()}
      icon={CalendarDays}
      iconClass="bg-emerald-50 text-emerald-600"
    />

    <InfoCard
      label="Students"
      value={studentCount}
      icon={Users}
      iconClass="bg-slate-100 text-slate-600"
    />

    <InfoCard
      label="Status"
      value={isActive ? "Active" : "Inactive"}
      icon={
        isActive
          ? CheckCircle2
          : XCircle
      }
      iconClass={
        isActive
          ? "bg-emerald-50 text-emerald-600"
          : "bg-slate-100 text-slate-500"
      }
    />
  </div>

  {/* Class Information */}
  <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
    <div className="mb-6 flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
        <BookOpen className="h-5 w-5" />
      </div>

      <div>
        <h2 className="font-semibold text-slate-900">
          Class Information
        </h2>

        <p className="text-sm text-slate-500">
          Details about this class.
        </p>
      </div>
    </div>

    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <DetailItem
        label="Class Name"
        value={getClassName()}
      />

      <DetailItem
        label="Level"
        value={getLevel()}
      />

      <DetailItem
        label="Arm"
        value={getArm()}
      />

      <DetailItem
        label="Academic Session"
        value={getSessionName()}
      />

      <DetailItem
        label="Student Count"
        value={studentCount}
      />

      <DetailItem
        label="Status"
        value={isActive ? "Active" : "Inactive"}
      />
    </div>
  </section>

  {/* Students */}
  <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
          <Users className="h-5 w-5" />
        </div>

        <div>
          <h2 className="font-semibold text-slate-900">
            Students
          </h2>

          <p className="text-sm text-slate-500">
            Students currently assigned to this
            class.
          </p>
        </div>
      </div>
    </div>

    {students.length === 0 ? (
      <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
          <User className="h-6 w-6" />
        </div>

        <h3 className="font-semibold text-slate-900">
          No students in this class
        </h3>

        <p className="mt-1 max-w-sm text-sm text-slate-500">
          Students assigned to this class will
          appear here.
        </p>
      </div>
    ) : (
      <div className="overflow-x-auto">
        <table className="w-full min-w-[650px]">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Student
              </th>

              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Student ID
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
            {students.map((student, index) => {
              const studentId =
                typeof student === "object"
                  ? student._id
                  : student;

              const studentName =
                typeof student === "object"
                  ? [
                      student.firstName,
                      student.middleName,
                      student.lastName,
                    ]
                      .filter(Boolean)
                      .join(" ")
                  : "Student";

              const admissionId =
                typeof student === "object"
                  ? student.studentId ||
                    "—"
                  : "—";

              const active =
                typeof student ===
                  "object" &&
                student.isActive === false
                  ? false
                  : true;

              return (
                <tr
                  key={
                    studentId ||
                    `student-${index}`
                  }
                  className="transition hover:bg-slate-50"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-600">
                        {studentName
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <span className="font-semibold text-slate-900">
                        {studentName}
                      </span>
                    </div>
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-600">
                    {admissionId}
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                        active
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {active
                        ? "Active"
                        : "Inactive"}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-right">
                    {studentId ? (
                      <button
                        type="button"
                        onClick={() =>
                          router.push(
                            `/dashboard/school-admin/students/${studentId}`
                          )
                        }
                        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                      >
                        View Student
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400">
                        —
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    )}
  </section>
</div>


);
}

// --------------------------------------------------
// Info Card
// --------------------------------------------------

function InfoCard({
label,
value,
icon: Icon,
iconClass,
}) {
return ( <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"> <div className="flex items-center justify-between gap-4"> <div> <p className="text-sm font-medium text-slate-500">
{label} </p>


      <p className="mt-2 text-lg font-bold text-slate-900">
        {value}
      </p>
    </div>

    <div
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
    >
      <Icon className="h-5 w-5" />
    </div>
  </div>
</div>


);
}

// --------------------------------------------------
// Detail Item
// --------------------------------------------------

function DetailItem({ label, value }) {
return ( <div className="rounded-xl border border-slate-100 bg-slate-50 p-4"> <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
{label} </p>


  <p className="mt-1 text-sm font-semibold text-slate-900">
    {value || "—"}
  </p>
</div>


);
}
