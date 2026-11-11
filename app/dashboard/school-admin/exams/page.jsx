"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function SchoolAdminExamsPage() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const [notes, setNotes] = useState({});

  const load = async () => {
    try {
      const response = await api.get("/exams/admin");
      setExams(response.data?.exams || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load examinations.");
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const action = async (exam, decision) => {
    setBusy(exam._id);
    setError("");
    try {
      await api.patch("/exams/" + exam._id + "/" + decision, decision === "reject" ? { note: notes[exam._id] || "" } : {});
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update examination.");
    } finally { setBusy(""); }
  };

  const pending = exams.filter(exam => ["pending_approval", "draft"].includes(exam.status));
  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-7 sm:px-6">
      <header className="rounded-2xl bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold text-emerald-700">School Administration</p>
        <h1 className="mt-1 text-2xl font-bold">Formal Examination Approval</h1>
        <p className="mt-2 text-sm text-slate-500">Review teacher-created examinations. Students can only access examinations after you approve them.</p>
      </header>
      {error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
      {loading ? <p className="p-8 text-center">Loading examinations...</p> :
        pending.length === 0 ? <div className="rounded-2xl bg-white p-10 text-center text-sm text-slate-500">There are no examinations awaiting approval.</div> :
        <section className="space-y-4">{pending.map(exam => (
          <article key={exam._id} className="space-y-4 rounded-2xl border bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-lg bg-emerald-50 px-2 py-1 text-emerald-700">{exam.subject?.name}</span>
              <span className="rounded-lg bg-slate-100 px-2 py-1">{exam.schoolClass?.name}</span>
              <span className="rounded-lg bg-amber-50 px-2 py-1 text-amber-700">Pending approval</span>
            </div>
            <div>
              <h2 className="text-lg font-semibold">{exam.title}</h2>
              <p className="mt-1 text-sm text-slate-500">Created by {exam.createdBy?.firstName || "Teacher"} {exam.createdBy?.lastName || ""} · {exam.academicTerm?.name} · {exam.totalMarks} marks · {exam.durationMinutes} minutes</p>
              <p className="mt-1 text-xs text-slate-500">Scheduled: {new Date(exam.startsAt).toLocaleString("en-NG")} – {new Date(exam.endsAt).toLocaleString("en-NG")}</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button disabled={busy === exam._id} onClick={() => action(exam, "approve")} className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{busy === exam._id ? "Processing..." : "Approve and publish"}</button>
              <div className="flex flex-1 gap-2">
                <input value={notes[exam._id] || ""} onChange={e => setNotes(v => ({ ...v, [exam._id]: e.target.value }))} placeholder="Reason for rejection (optional)" className="min-w-0 flex-1 rounded-xl border px-3 py-2 text-sm" />
                <button disabled={busy === exam._id} onClick={() => action(exam, "reject")} className="rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-700 disabled:opacity-50">Reject</button>
              </div>
            </div>
          </article>
        ))}</section>}
    </main>
  );
}
