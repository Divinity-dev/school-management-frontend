"use client";

import { useEffect, useMemo, useState } from "react";
import {
Search,
UserPlus,
Users,
ChevronRight,
MoreHorizontal,
} from "lucide-react";

import api from "@/lib/api";
import Link from "next/link";

export default function StudentsPage() {
const [students, setStudents] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

const [search, setSearch] = useState("");
const [statusFilter, setStatusFilter] = useState("all");

useEffect(() => {
const fetchStudents = async () => {
try {
setLoading(true);
setError("");


    const response = await api.get("/students");

    setStudents(response.data?.students || []);
  } catch (err) {
    console.error("Failed to fetch students:", err);

    setError(
      err?.response?.data?.message ||
        "Unable to load students."
    );
  } finally {
    setLoading(false);
  }
};

fetchStudents();


}, []);

const filteredStudents = useMemo(() => {
const searchValue = search.trim().toLowerCase();


return students.filter((student) => {
  const fullName = [
    student.firstName,
    student.middleName,
    student.lastName,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const matchesSearch =
    !searchValue ||
    fullName.includes(searchValue) ||
    student.studentId?.toLowerCase().includes(searchValue) ||
    student.email?.toLowerCase().includes(searchValue);

  const matchesStatus =
    statusFilter === "all" ||
    (statusFilter === "active" && student.isActive) ||
    (statusFilter === "inactive" && !student.isActive);

  return matchesSearch && matchesStatus;
});


}, [students, search, statusFilter]);

const activeStudents = students.filter(
(student) => student.isActive
).length;

const inactiveStudents = students.length - activeStudents;

const getStudentName = (student) => {
return [
student.firstName,
student.middleName,
student.lastName,
]
.filter(Boolean)
.join(" ");
};

const getClassName = (student) => {
const schoolClass = student.schoolClass;


if (!schoolClass) {
  return "—";
}

return [schoolClass.name, schoolClass.arm]
  .filter(Boolean)
  .join(" ");


};

return ( <div className="space-y-6 p-4 sm:p-6 lg:p-8">
{/* Header */} <div> <p className="text-sm font-medium text-emerald-600">
School Administration </p>


    <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
      Students
    </h1>

    <p className="mt-1 text-sm text-slate-500">
      Manage students enrolled in your school.
    </p>
  </div>

  {/* Summary cards */}
  <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            Total Students
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {loading ? "—" : students.length}
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
          <Users size={21} />
        </div>
      </div>
    </div>

    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">
        Active Students
      </p>

      <p className="mt-2 text-2xl font-bold text-slate-900">
        {loading ? "—" : activeStudents}
      </p>

      <p className="mt-1 text-xs text-slate-400">
        Currently enrolled
      </p>
    </div>

    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">
        Inactive Students
      </p>

      <p className="mt-2 text-2xl font-bold text-slate-900">
        {loading ? "—" : inactiveStudents}
      </p>

      <p className="mt-1 text-xs text-slate-400">
        Deactivated accounts
      </p>
    </div>
  </section>

  {/* Students list */}
  <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
    {/* Search and filters */}
    <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative w-full sm:max-w-sm">
        <Search
          size={17}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          type="text"
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="Search students..."
          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
        />
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value)
          }
          className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-600 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
        >
          <option value="all">All Students</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        <Link
          href="/dashboard/school-admin/students/new"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
        >
          <UserPlus size={17} />
          Add Student
        </Link>
      </div>
    </div>

    {/* Error */}
    {error && (
      <div className="m-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
        {error}
      </div>
    )}

    {/* Table */}
    <div className="overflow-x-auto">
      <table className="w-full min-w-[700px]">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/70">
            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
              Student
            </th>

            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
              Student ID
            </th>

            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
              Class
            </th>

            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
              Status
            </th>

            <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-400">
              Action
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {loading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <tr key={index}>
                <td className="px-5 py-4">
                  <div className="h-4 w-40 animate-pulse rounded bg-slate-100" />
                </td>

                <td className="px-5 py-4">
                  <div className="h-4 w-24 animate-pulse rounded bg-slate-100" />
                </td>

                <td className="px-5 py-4">
                  <div className="h-4 w-20 animate-pulse rounded bg-slate-100" />
                </td>

                <td className="px-5 py-4">
                  <div className="h-6 w-16 animate-pulse rounded-full bg-slate-100" />
                </td>

                <td className="px-5 py-4">
                  <div className="ml-auto h-8 w-8 animate-pulse rounded-lg bg-slate-100" />
                </td>
              </tr>
            ))
          ) : filteredStudents.length === 0 ? (
            <tr>
              <td
                colSpan={5}
                className="px-5 py-12 text-center"
              >
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 text-slate-400">
                  <Users size={21} />
                </div>

                <p className="mt-3 text-sm font-medium text-slate-700">
                  No students found
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Try adjusting your search or filter.
                </p>
              </td>
            </tr>
          ) : (
            filteredStudents.map((student) => (
              <tr
                key={student._id}
                className="transition hover:bg-slate-50/60"
              >
                {/* Student */}
                <td className="px-5 py-4">
                  <Link
                    href={`/dashboard/school-admin/students/${student._id}`}
                    className="group flex items-center gap-3"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-sm font-semibold text-emerald-600">
                      {student.firstName?.charAt(0)}
                      {student.lastName?.charAt(0)}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-800 transition group-hover:text-emerald-600">
                        {getStudentName(student)}
                      </p>

                      {student.email && (
                        <p className="truncate text-xs text-slate-400">
                          {student.email}
                        </p>
                      )}
                    </div>
                  </Link>
                </td>

                {/* Student ID */}
                <td className="px-5 py-4 text-sm text-slate-600">
                  {student.studentId || "—"}
                </td>

                {/* Class */}
                <td className="px-5 py-4 text-sm text-slate-600">
                  {getClassName(student)}
                </td>

                {/* Status */}
                <td className="px-5 py-4">
                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                      student.isActive
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {student.isActive
                      ? "Active"
                      : "Inactive"}
                  </span>
                </td>

                {/* Action */}
                <td className="px-5 py-4 text-right">
                  <button
                    type="button"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    aria-label={`Actions for ${getStudentName(
                      student
                    )}`}
                  >
                    <MoreHorizontal size={18} />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>

    {/* Footer */}
    {!loading && filteredStudents.length > 0 && (
      <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3">
        <p className="text-xs text-slate-400">
          Showing {filteredStudents.length} of{" "}
          {students.length} students
        </p>

        <button
          type="button"
          className="flex items-center gap-1 text-xs font-medium text-emerald-600 hover:text-emerald-700"
        >
          View all
          <ChevronRight size={14} />
        </button>
      </div>
    )}
  </section>
</div>


);
}
