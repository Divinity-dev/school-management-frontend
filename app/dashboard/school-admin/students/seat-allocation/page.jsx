"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Save, Users } from "lucide-react";
import api from "@/lib/api";

export default function StudentSeatAllocationPage() {
  const [students, setStudents] = useState([]);
  const [studentLimit, setStudentLimit] = useState(0);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadAllocation = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/students/seat-allocation");
      const data = response.data || {};
      setStudents(Array.isArray(data.students) ? data.students : []);
      setStudentLimit(Number(data.studentLimit) || 0);
      setSelectedIds(
        Array.isArray(data.allocatedStudentIds)
          ? data.allocatedStudentIds
          : []
      );
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Unable to load student seat assignments."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllocation();
  }, []);

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const availableSeats = Math.max(0, studentLimit - selectedIds.length);

  const toggleStudent = (studentId) => {
    setError("");
    setSuccess("");

    if (selectedIds.includes(studentId)) {
      setSelectedIds(selectedIds.filter((id) => id !== studentId));
      return;
    }

    if (selectedIds.length >= studentLimit) {
      setError(
        `Your subscription covers ${studentLimit} student seat(s). Remove a selection or upgrade to assign more seats.`
      );
      return;
    }

    setSelectedIds([...selectedIds, studentId]);
  };

  const saveAllocation = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");
      const response = await api.put("/students/seat-allocation", {
        studentIds: selectedIds,
      });
      setSelectedIds(response.data?.allocatedStudentIds || selectedIds);
      setSuccess(response.data?.message || "Student seat assignments saved.");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Unable to save student seat assignments."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <Link
        href="/dashboard/school-admin/students"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-emerald-700"
      >
        <ArrowLeft size={16} />
        Back to students
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-600">School Administration</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Student Seat Allocation
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Choose exactly which active students are covered by your current subscription.
            Only students assigned a seat can have results entered, submitted, or published.
          </p>
        </div>
        <button
          type="button"
          onClick={saveAllocation}
          disabled={loading || saving || selectedIds.length > studentLimit}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Save size={17} />
          {saving ? "Saving assignments..." : "Save assignments"}
        </button>
      </div>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Purchased seats</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{loading ? "—" : studentLimit}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Assigned seats</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{loading ? "—" : selectedIds.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Seats remaining</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{loading ? "—" : availableSeats}</p>
        </div>
      </section>

      {error && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div role="status" className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
          {success}
        </div>
      )}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
            <Users size={19} />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900">Active students</h2>
            <p className="text-xs text-slate-500">Select up to {studentLimit} student(s) for this term.</p>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-sm text-slate-500">Loading students and subscription seats...</div>
        ) : students.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">There are no active students to assign.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {students.map((student) => {
              const selected = selectedSet.has(student._id);
              const fullName = [student.firstName, student.middleName, student.lastName].filter(Boolean).join(" ");
              const className = student.schoolClass
                ? [student.schoolClass.name, student.schoolClass.arm].filter(Boolean).join(" ")
                : "Class not assigned";
              const disableNewSelection = !selected && selectedIds.length >= studentLimit;
              return (
                <label
                  key={student._id}
                  className={`flex items-center gap-4 px-5 py-4 transition ${selected ? "bg-emerald-50/60" : "hover:bg-slate-50"} ${disableNewSelection ? "cursor-not-allowed" : "cursor-pointer"}`}
                >
                  <input
                    type="checkbox"
                    checked={selected}
                    disabled={saving || disableNewSelection}
                    onChange={() => toggleStudent(student._id)}
                    className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 disabled:opacity-50"
                  />
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-600">
                    {student.firstName?.charAt(0)}{student.lastName?.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-800">{fullName}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{student.studentId} · {className}</p>
                  </div>
                  {selected && (
                    <span className="shrink-0 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                      Seat assigned
                    </span>
                  )}
                </label>
              );
            })}
          </div>
        )}
        <div className="border-t border-slate-100 bg-slate-50/70 px-5 py-4 text-xs leading-5 text-slate-500">
          Seat assignments apply to the current academic term subscription. You can change the selected students later, as long as the total does not exceed the number of purchased seats.
        </div>
      </section>
    </div>
  );
}
