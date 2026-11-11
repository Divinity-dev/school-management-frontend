"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Database, Plus, RefreshCw, Search } from "lucide-react";
import api from "@/lib/api";

export default function QuestionBankPicker({ subjectAssignmentId, questions, setQuestions }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState("");
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [randomCount, setRandomCount] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    if (!subjectAssignmentId) return;
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/question-bank", { params: { subjectAssignmentId, search: search || undefined, topic: topic || undefined, difficulty: difficulty || undefined } });
      setItems(response.data?.questions || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load the question bank.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) load();
  }, [open, subjectAssignmentId]);

  const selectedQuestions = useMemo(
    () => items.filter(item => selected.includes(String(item._id))),
    [items, selected]
  );

  const appendQuestions = chosen => {
    const additions = chosen.map(({ question, type, options, correctAnswer, acceptedAnswers, explanation, marks }) => ({
      question, type, options: options || [], correctAnswer: correctAnswer || "",
      acceptedAnswers: acceptedAnswers || [], explanation: explanation || "", marks: Math.max(1, Math.trunc(Number(marks) || 1)),
    }));
    setQuestions(current => [...current, ...additions]);
    setSelected([]);
    setOpen(false);
  };

  const addSelected = () => {
    appendQuestions(selectedQuestions);
  };

  return (
    <section className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-blue-700" />
          <div>
            <h4 className="text-sm font-bold text-slate-900">Reuse questions from your bank</h4>
            <p className="text-xs text-slate-500">Add approved questions without typing them again.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/dashboard/teacher/question-bank" className="rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs font-semibold text-blue-800">Manage bank</Link>
          <button type="button" disabled={!subjectAssignmentId} onClick={() => setOpen(value => !value)} className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">
            <Plus className="h-4 w-4" /> {open ? "Close bank" : "Browse questions"}
          </button>
        </div>
      </div>
      {!subjectAssignmentId && <p className="mt-3 text-xs text-amber-700">Select a class and subject before browsing questions.</p>}
      {open && (
        <div className="mt-4 space-y-3">
          <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={event => setSearch(event.target.value)} onKeyDown={event => event.key === "Enter" && load()} placeholder="Search question text or topic" className="w-full rounded-lg border bg-white py-2 pl-9 pr-3 text-sm" />
            </div>
            <input value={topic} onChange={event => setTopic(event.target.value)} onKeyDown={event => event.key === "Enter" && load()} placeholder="Filter topic" className="w-full rounded-lg border bg-white px-3 py-2 text-sm" />
            <select value={difficulty} onChange={event => { setDifficulty(event.target.value); }} className="rounded-lg border bg-white px-3 py-2 text-sm"><option value="">Any difficulty</option><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Difficult</option></select>
            <button type="button" onClick={load} className="rounded-lg border bg-white px-3 text-slate-600" aria-label="Refresh questions"><RefreshCw className="h-4 w-4" /></button>
          </div>
          {error && <p className="rounded-lg bg-red-50 p-3 text-xs text-red-700">{error}</p>}
          {loading ? <p className="py-5 text-center text-sm text-slate-500">Loading questions…</p> : items.length === 0 ? <p className="rounded-lg bg-white p-5 text-center text-sm text-slate-500">No matching questions yet. Add questions or generate them in the question bank.</p> : (
            <div className="max-h-80 space-y-2 overflow-y-auto">
              {items.map(item => (
                <label key={item._id} className="flex cursor-pointer gap-3 rounded-lg border bg-white p-3">
                  <input type="checkbox" checked={selected.includes(String(item._id))} onChange={event => setSelected(current => event.target.checked ? [...current, String(item._id)] : current.filter(id => id !== String(item._id)))} className="mt-1 h-4 w-4 accent-blue-700" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-slate-800">{item.question}</span>
                    <span className="mt-1 block text-xs text-slate-500">{item.topic} · {item.difficulty} · {item.type.replaceAll("_", " ")} · {item.marks} mark(s)</span>
                  </span>
                </label>
              ))}
            </div>
          )}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-blue-100 pt-3">
            <span className="text-xs text-slate-500">{selected.length} selected</span>
            <div className="flex flex-wrap gap-2">
              <input type="number" min="1" max="100" step="1" value={randomCount} onChange={event => setRandomCount(Math.min(100, Math.max(1, Math.trunc(Number(event.target.value) || 1))))} className="w-16 rounded-lg border px-2 py-2 text-xs" aria-label="Number of random questions" />
              <button type="button" disabled={!items.length} onClick={() => appendQuestions([...items].sort(() => Math.random() - 0.5).slice(0, randomCount))} className="rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs font-semibold text-blue-800 disabled:opacity-50">Auto-select random</button>
              <button type="button" disabled={!selected.length} onClick={addSelected} className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50">Add selected</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
