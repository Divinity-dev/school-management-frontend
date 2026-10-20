"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Users,
  UserCheck,
  UserX,
  Eye,
  Loader2,
} from "lucide-react";

import api from "@/lib/api";

export default function TeachersPage() {
  const [teachers, setTeachers] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/teachers");

        setTeachers(response.data?.teachers || []);
      } catch (err) {
        console.error("Failed to fetch teachers:", err);

        setError(
          err?.response?.data?.message ||
            "Unable to load teachers."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTeachers();
  }, []);

  const filteredTeachers = useMemo(() => {
    return teachers.filter((teacher) => {
      const fullName = `${teacher.firstName || ""} ${
        teacher.lastName || ""
      }`.trim();

      const searchValue = search.toLowerCase().trim();

      const matchesSearch =
        !searchValue ||
        fullName.toLowerCase().includes(searchValue) ||
        teacher.email?.toLowerCase().includes(searchValue) ||
        teacher.phone?.toLowerCase().includes(searchValue);

      const isActive = teacher.isActive !== false;

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && isActive) ||
        (statusFilter === "inactive" && !isActive);

      return matchesSearch && matchesStatus;
    });
  }, [teachers, search, statusFilter]);

  const totalTeachers = teachers.length;

  const activeTeachers = teachers.filter(
    (teacher) => teacher.isActive !== false
  ).length;

  const inactiveTeachers = teachers.filter(
    (teacher) => teacher.isActive === false
  ).length;

  const getInitials = (teacher) => {
    const first = teacher.firstName?.charAt(0) || "";
    const last = teacher.lastName?.charAt(0) || "";

    return `${first}${last}`.toUpperCase() || "T";
  };

  return (
    <main className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-emerald-600">
              School Administration
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
              Teachers
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage your school&apos;s teaching staff.
            </p>
          </div>

          <Link
            href="/dashboard/school-admin/teachers/new"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4" />
            Add Teacher
          </Link>
        </section>

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Summary Cards */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <SummaryCard
            title="Total Teachers"
            value={loading ? "—" : totalTeachers}
            description="All teaching staff"
            icon={<Users className="h-5 w-5" />}
          />

          <SummaryCard
            title="Active Teachers"
            value={loading ? "—" : activeTeachers}
            description="Currently active"
            icon={<UserCheck className="h-5 w-5" />}
          />

          <SummaryCard
            title="Inactive Teachers"
            value={loading ? "—" : inactiveTeachers}
            description="Currently inactive"
            icon={<UserX className="h-5 w-5" />}
          />
        </section>

        {/* Filters */}
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name, email or phone..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
            >
              <option value="all">All Teachers</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </section>

        {/* Teachers Table */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Teacher
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Email
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Phone
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading teachers...
                      </div>
                    </td>
                  </tr>
                ) : filteredTeachers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="mx-auto flex max-w-sm flex-col items-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                          <Users className="h-5 w-5 text-slate-400" />
                        </div>

                        <h3 className="mt-4 text-sm font-semibold text-slate-900">
                          No teachers found
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          {search || statusFilter !== "all"
                            ? "Try adjusting your search or filter."
                            : "No teachers have been added yet."}
                        </p>

                        {!search && statusFilter === "all" && (
                          <Link
                            href="/dashboard/school-admin/teachers/new"
                            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
                          >
                            <Plus className="h-4 w-4" />
                            Add Teacher
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredTeachers.map((teacher) => {
                    const fullName = `${teacher.firstName || ""} ${
                      teacher.lastName || ""
                    }`.trim();

                    const isActive = teacher.isActive !== false;

                    return (
                      <tr
                        key={teacher._id}
                        className="transition hover:bg-slate-50"
                      >
                        <td className="px-6 py-4">
                          <Link
                            href={`/dashboard/school-admin/teachers/${teacher._id}`}
                            className="group flex items-center gap-3"
                          >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-sm font-bold text-emerald-700">
                              {getInitials(teacher)}
                            </div>

                            <div>
                              <p className="text-sm font-semibold text-slate-900 transition group-hover:text-emerald-600">
                                {fullName || "Unnamed Teacher"}
                              </p>

                              <p className="mt-0.5 text-xs text-slate-400">
                                Teacher
                              </p>
                            </div>
                          </Link>
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-600">
                          {teacher.email || "—"}
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-600">
                          {teacher.phone || "—"}
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                              isActive
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {isActive ? "Active" : "Inactive"}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-right">
                          <Link
                            href={`/dashboard/school-admin/teachers/${teacher._id}`}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            View
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {!loading && filteredTeachers.length > 0 && (
            <div className="border-t border-slate-100 px-6 py-4">
              <p className="text-sm text-slate-500">
                Showing{" "}
                <span className="font-semibold text-slate-700">
                  {filteredTeachers.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-700">
                  {teachers.length}
                </span>{" "}
                teachers
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function SummaryCard({ title, value, description, icon }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>

          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            {value}
          </p>

          <p className="mt-1 text-xs text-slate-400">{description}</p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
          {icon}
        </div>
      </div>
    </div>
  );
}

