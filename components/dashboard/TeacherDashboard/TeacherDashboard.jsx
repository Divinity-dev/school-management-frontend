"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  ClipboardCheck,
  FileText,
  GraduationCap,
  Users,
  ClipboardList,
  ArrowRight,
  CheckCircle2,
  Clock3,
  AlertCircle,
  UserRound,
  Megaphone,
} from "lucide-react";

import api from "@/lib/api";

export default function TeacherDashboard({ user }) {
  const [classes, setClasses] = useState([]);
  const [subjectAssignments, setSubjectAssignments] = useState([]);
  const [assignments, setAssignments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const [classesResponse, subjectsResponse, assignmentsResponse] =
          await Promise.all([
            api.get("/classes"),
            api.get("/subject-assignments"),
            api.get("/assignments/teacher"),
          ]);

        setClasses(classesResponse.data?.classes || []);
        setSubjectAssignments(
          subjectsResponse.data?.subjectAssignments ||
            subjectsResponse.data?.assignments ||
            []
        );
        setAssignments(assignmentsResponse.data?.assignments || []);
      } catch (err) {
        console.error("Failed to load teacher dashboard:", err);

        setError(
          err.response?.data?.message ||
            "Unable to load your dashboard information."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const teacherId = user?._id || user?.id;

  const myClasses = useMemo(() => {
    if (!teacherId) return [];

    return classes.filter((schoolClass) => {
      const classTeacher = schoolClass.classTeacher;

      const classTeacherId =
        classTeacher?._id || classTeacher?.id || classTeacher;

      return classTeacherId?.toString() === teacherId?.toString();
    });
  }, [classes, teacherId]);

  const mySubjects = useMemo(() => {
    if (!teacherId) return [];

    return subjectAssignments.filter((assignment) => {
      const teacher = assignment.teacher;

      const assignmentTeacherId =
        teacher?._id || teacher?.id || teacher;

      return (
        assignmentTeacherId?.toString() === teacherId?.toString() &&
        assignment.isActive !== false
      );
    });
  }, [subjectAssignments, teacherId]);

  const myAssignments = useMemo(() => {
    if (!teacherId) return assignments;

    return assignments.filter((assignment) => {
      const assignmentTeacher =
        assignment.teacher?._id ||
        assignment.teacher?.id ||
        assignment.teacher;

      return assignmentTeacher
        ? assignmentTeacher.toString() === teacherId.toString()
        : true;
    });
  }, [assignments, teacherId]);

  const publishedAssignments = myAssignments.filter(
    (assignment) => assignment.status === "published"
  );

  const draftAssignments = myAssignments.filter(
    (assignment) => assignment.status === "draft"
  );

  const closedAssignments = myAssignments.filter(
    (assignment) => assignment.status === "closed"
  );

  const teacherName =
    user?.firstName ||
    user?.name ||
    "Teacher";

  const stats = [
    {
      title: "My Classes",
      value: myClasses.length,
      icon: Users,
      href: "/dashboard/teacher/classes",
      description: "Classes you manage",
    },
    {
      title: "My Subjects",
      value: mySubjects.length,
      icon: BookOpen,
      href: "/dashboard/teacher/subjects",
      description: "Assigned subjects",
    },
    {
      title: "Assignments",
      value: myAssignments.length,
      icon: FileText,
      href: "/dashboard/teacher/assignments",
      description: "Your assignments",
    },
    {
      title: "Published",
      value: publishedAssignments.length,
      icon: CheckCircle2,
      href: "/dashboard/teacher/assignments",
      description: "Active assignments",
    },
  ];

  const quickActions = [
  {
    title: "Announcements",
    description: "View important school announcements",
    icon: Megaphone,
    href: "/dashboard/teacher/announcements",
  },
  {
    title: "Create Assignment",
    description: "Give your students a new assignment",
    icon: FileText,
    href: "/dashboard/teacher/assignments/create",
  },
  {
    title: "Mark Attendance",
    description: "Record today's class attendance",
    icon: ClipboardCheck,
    href: "/dashboard/teacher/attendance",
  },
  {
    title: "Enter Results",
    description: "Enter and submit student results",
    icon: GraduationCap,
    href: "/dashboard/teacher/results",
  },
  {
    title: "View My Subjects",
    description: "See the subjects assigned to you",
    icon: BookOpen,
    href: "/dashboard/teacher/subjects",
  },
];

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-600">
                Teacher Portal
              </p>

              <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Welcome back, {teacherName} 👋
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Here&apos;s an overview of your teaching activities.
              </p>
            </div>

            <Link
              href="/dashboard/teacher/profile"
              className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <UserRound size={17} />
              My Profile
            </Link>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle className="mt-0.5 shrink-0" size={18} />
            <p>{error}</p>
          </div>
        )}

        {/* Stats */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <Link
                key={stat.title}
                href={stat.href}
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                    <Icon size={21} />
                  </div>

                  <ArrowRight
                    size={18}
                    className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-emerald-600"
                  />
                </div>

                <div className="mt-5">
                  <p className="text-sm text-slate-500">{stat.title}</p>

                  <p className="mt-1 text-3xl font-bold text-slate-900">
                    {loading ? "—" : stat.value}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {stat.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </section>

        {/* Main content */}
        <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* My Classes */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm lg:col-span-2">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h2 className="font-semibold text-slate-900">My Classes</h2>
                <p className="mt-1 text-xs text-slate-500">
                  Classes where you are the class teacher
                </p>
              </div>

              <Link
                href="/dashboard/teacher/classes"
                className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
              >
                View all
              </Link>
            </div>

            <div className="p-5">
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((item) => (
                    <div
                      key={item}
                      className="h-16 animate-pulse rounded-xl bg-slate-100"
                    />
                  ))}
                </div>
              ) : myClasses.length === 0 ? (
                <div className="py-10 text-center">
                  <Users
                    size={32}
                    className="mx-auto text-slate-300"
                  />

                  <p className="mt-3 text-sm font-medium text-slate-600">
                    No classes assigned yet
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Classes where you are the class teacher will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {myClasses.slice(0, 5).map((schoolClass) => (
                    <div
                      key={schoolClass._id}
                      className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-white p-2 text-emerald-600 shadow-sm">
                          <GraduationCap size={18} />
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            {schoolClass.name}
                            {schoolClass.arm ? ` ${schoolClass.arm}` : ""}
                          </p>

                          <p className="text-xs text-slate-500">
                            {schoolClass.section || "Class"}
                          </p>
                        </div>
                      </div>

                      <ArrowRight
                        size={17}
                        className="text-slate-400"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="font-semibold text-slate-900">
                Quick Actions
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Common teacher activities
              </p>
            </div>

            <div className="space-y-3 p-5">
              {quickActions.map((action) => {
                const Icon = action.icon;

                return (
                  <Link
                    key={action.title}
                    href={action.href}
                    className="group flex items-center gap-3 rounded-xl border border-slate-100 p-3 transition hover:border-emerald-100 hover:bg-emerald-50/50"
                  >
                    <div className="rounded-lg bg-emerald-50 p-2.5 text-emerald-600">
                      <Icon size={18} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-800">
                        {action.title}
                      </p>

                      <p className="mt-0.5 text-xs text-slate-400">
                        {action.description}
                      </p>
                    </div>

                    <ArrowRight
                      size={16}
                      className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-emerald-600"
                    />
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* Assignments + Subjects */}
        <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Recent Assignments */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h2 className="font-semibold text-slate-900">
                  Recent Assignments
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Your latest assignment activities
                </p>
              </div>

              <Link
                href="/dashboard/teacher/assignments"
                className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
              >
                View all
              </Link>
            </div>

            <div className="p-5">
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((item) => (
                    <div
                      key={item}
                      className="h-16 animate-pulse rounded-xl bg-slate-100"
                    />
                  ))}
                </div>
              ) : myAssignments.length === 0 ? (
                <div className="py-10 text-center">
                  <FileText
                    size={32}
                    className="mx-auto text-slate-300"
                  />

                  <p className="mt-3 text-sm font-medium text-slate-600">
                    No assignments yet
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Your assignments will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {myAssignments.slice(0, 5).map((assignment) => (
                    <div
                      key={assignment._id}
                      className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 p-3"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="rounded-lg bg-slate-50 p-2 text-slate-600">
                          <ClipboardList size={18} />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-slate-800">
                            {assignment.title}
                          </p>

                          <p className="mt-1 truncate text-xs text-slate-400">
                            {assignment.subject?.name || "Subject"} •{" "}
                            {assignment.schoolClass?.name || "Class"}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium ${
                          assignment.status === "published"
                            ? "bg-emerald-50 text-emerald-700"
                            : assignment.status === "closed"
                            ? "bg-slate-100 text-slate-600"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {assignment.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* My Subjects */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h2 className="font-semibold text-slate-900">
                  My Subjects
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Subjects and classes assigned to you
                </p>
              </div>

              <Link
                href="/dashboard/teacher/subjects"
                className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
              >
                View all
              </Link>
            </div>

            <div className="p-5">
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((item) => (
                    <div
                      key={item}
                      className="h-16 animate-pulse rounded-xl bg-slate-100"
                    />
                  ))}
                </div>
              ) : mySubjects.length === 0 ? (
                <div className="py-10 text-center">
                  <BookOpen
                    size={32}
                    className="mx-auto text-slate-300"
                  />

                  <p className="mt-3 text-sm font-medium text-slate-600">
                    No subjects assigned yet
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Your subject assignments will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {mySubjects.slice(0, 5).map((assignment) => (
                    <div
                      key={assignment._id}
                      className="flex items-center gap-3 rounded-xl border border-slate-100 p-3"
                    >
                      <div className="rounded-lg bg-emerald-50 p-2.5 text-emerald-600">
                        <BookOpen size={18} />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-800">
                          {assignment.subject?.name || "Subject"}
                        </p>

                        <p className="mt-1 truncate text-xs text-slate-400">
                          {assignment.schoolClass?.name || "Class"}
                          {assignment.schoolClass?.arm
                            ? ` ${assignment.schoolClass.arm}`
                            : ""}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Assignment status */}
        <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-white p-2.5 text-amber-600 shadow-sm">
                <Clock3 size={19} />
              </div>

              <div>
                <p className="text-xs text-amber-700">
                  Draft Assignments
                </p>

                <p className="mt-1 text-2xl font-bold text-amber-900">
                  {loading ? "—" : draftAssignments.length}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-white p-2.5 text-emerald-600 shadow-sm">
                <CheckCircle2 size={19} />
              </div>

              <div>
                <p className="text-xs text-emerald-700">
                  Published Assignments
                </p>

                <p className="mt-1 text-2xl font-bold text-emerald-900">
                  {loading ? "—" : publishedAssignments.length}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-100 p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-white p-2.5 text-slate-600 shadow-sm">
                <ClipboardList size={19} />
              </div>

              <div>
                <p className="text-xs text-slate-600">
                  Closed Assignments
                </p>

                <p className="mt-1 text-2xl font-bold text-slate-800">
                  {loading ? "—" : closedAssignments.length}
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}