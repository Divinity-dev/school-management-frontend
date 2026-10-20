"use client";

import { useEffect, useState } from "react";

import api from "@/lib/api";

import DashboardHeader from "./DashboardHeader";
import StatCard from "./StatCard";
import AttendanceOverview from "./AttendanceOverview";
import StudentGrowth from "./StudentGrowth";
import QuickActions from "./QuickActions";
import RecentAssignments from "./RecentAssignments";
import RecentPayments from "./RecentPayments";

export default function SchoolAdminDashboard({ user }) {
  const [stats, setStats] = useState({
    students: 0,
    teachers: 0,
    classes: 0,
    outstandingFees: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          studentsResponse,
          teachersResponse,
          classesResponse,
          outstandingFeesResponse,
        ] = await Promise.all([
          api.get("/students"),
          api.get("/teachers"),
          api.get("/classes"),
          api.get("/student-fee-accounts/report/outstanding"),
        ]);

        const students =
          studentsResponse.data?.students || [];

        const teachers =
          teachersResponse.data?.teachers || [];

        const classes =
          classesResponse.data?.classes || [];

        const outstandingFees =
          outstandingFeesResponse.data?.summary
            ?.totalOutstanding || 0;

        setStats({
          students: students.length,
          teachers: teachers.length,
          classes: classes.length,
          outstandingFees,
        });
      } catch (err) {
        console.error(
          "Failed to fetch dashboard statistics:",
          err
        );

        setError(
          err?.response?.data?.message ||
            "Unable to load dashboard statistics."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  return (
    <div className="space-y-6">
      <DashboardHeader user={user} />

      {error && (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Statistics */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Students"
          value={loading ? "—" : stats.students}
          description="Currently enrolled"
          icon="students"
        />

        <StatCard
          title="Total Teachers"
          value={loading ? "—" : stats.teachers}
          description="Active teachers"
          icon="teachers"
        />

        <StatCard
          title="Total Classes"
          value={loading ? "—" : stats.classes}
          description="Active classes"
          icon="classes"
        />

        <StatCard
          title="Outstanding Fees"
          value={
            loading
              ? "—"
              : `₦${Number(
                  stats.outstandingFees
                ).toLocaleString()}`
          }
          description="Total outstanding"
          icon="fees"
        />
      </section>

     {/* Dashboard Charts + Quick Links */}
<section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
  <div className="flex min-h-0 flex-col gap-6 xl:col-span-2">
    <div className="h-[300px]">
      <AttendanceOverview />
    </div>

    <div className="h-[300px]">
      <StudentGrowth />
    </div>
  </div>

  <div className="xl:h-[620px]">
    <QuickActions />
  </div>
</section>

      {/* Recent Activity */}
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <RecentAssignments />
        <RecentPayments />
      </section>
    </div>
  );
}