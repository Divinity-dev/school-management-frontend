"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp, Database, Plus, RefreshCw } from "lucide-react";
import api from "@/lib/api";

export default function QuestionBankPicker({ subjectAssignmentId, questions, setQuestions }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState([]);
  const [classFilter, setClassFilter] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [topicFilter, setTopicFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      // The school bank is shared across all teachers and assignments.
      const response = await api.get("/question-bank");
      setItems(response.data?.questions || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load the question bank.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && items.length === 0) load();
  }, [open]);

  const classOptions = useMemo(
    () => [...new Set(items.map(item => item.className || item.schoolClass?.name).filter(Boolean))].sort(),
    [items]
  );
  const subjectOptions = useMemo(
    () => [...new Set(items.map(item => item.subjectName || item.subject?.name).filter(Boolean))].sort(),
    [items]
  );
  const topicOptions = useMemo(
    () => [...new Set(items.map(item => item.topic).filter(Boolean))].sort(),
    [items]
  );
  const visibleItems = useMemo(() => items.filter(item => {
    const className = item.className || item.schoolClass?.name || "";
    const subjectName = item.subjectName || item.subject?.name || "";
    return (!classFilter || className === classFilter)
      && (!subjectFilter || subjectName === subjectFilter)
      && (!topicFilter || item.topic === topicFilter);
  }), [items, classFilter, subjectFilter, topicFilter]);

  const selectedQuestions = useMemo(
    () => visibleItems.filter(item => selected.includes(String(item._id))),
    [visibleItems, selected]
  );

  const appendQuestions = chosen => {
    const additions = chosen.map(({ question, type, options, correctAnswer, acceptedAnswers, explanation, marks }) => ({
      question, type, options: options || [], correctAnswer: correctAnswer || "",
      acceptedAnswers: acceptedAnswers || [], explanation: explanation || "",
      marks: Math.max(1, Math.trunc(Number(marks) || 1)),
    }));
    setQuestions(current => [...current, ...additions]);
    setSelected([]);
    setOpen(false);
  };

  return (
    <section className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-blue-700" />
          <div>
            <h4 className="text-sm font-bold text-slate-900">Reuse questions from the school bank</h4>
            <p className="text-xs text-slate-500">Browse every approved question in your school, then filter by class, subject and topic.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/dashboard/teacher/question-bank" className="rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs font-semibold text-blue-800">Manage bank</Link>
          <button type="button" onClick={() => setOpen(value => !value)} aria-expanded={open} className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-3 py-2 text-xs font-semibold text-white">
            {open ? <ChevronUp className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {open ? "Collapse bank" : "Browse questions"}
          </button>
        </div>
      </div>
      {open && (
        <div className="mt-4 space-y-3">
          <div className="grid gap-2 sm:grid-cols-3">
            <select value={classFilter} onChange={event => setClassFilter(event.target.value)} className="rounded-lg border bg-white px-3 py-2 text-sm">
              <option value="">All classes</option>
              {classOptions.map(value => <option key={value} value={value}>{value}</option>)}
            </select>
            <select value={subjectFilter} onChange={event => setSubjectFilter(event.target.value)} className="rounded-lg border bg-white px-3 py-2 text-sm">
              <option value="">All subjects</option>
              {subjectOptions.map(value => <option key={value} value={value}>{value}</option>)}
            </select>
            <select value={topicFilter} onChange={event => setTopicFilter(event.target.value)} className="rounded-lg border bg-white px-3 py-2 text-sm">
              <option value="">All topics</option>
              {topicOptions.map(value => <option key={value} value={value}>{value}</option>)}
            </select>
          </div>
          <div className="flex justify-end">
            <button type="button" onClick={load} disabled={loading} className="inline-flex items-center gap-2 rounded-lg border bg-white px-3 py-2 text-xs text-slate-600 disabled:opacity-50" aria-label="Refresh questions">
              <RefreshCw className="h-4 w-4" /> Refresh
            </button>
          </div>
          {error && <p className="rounded-lg bg-red-50 p-3 text-xs text-red-700">{error}</p>}
          {loading ? <p className="py-5 text-center text-sm text-slate-500">Loading questions…</p> : visibleItems.length === 0 ? (
            <p className="rounded-lg bg-white p-5 text-center text-sm text-slate-500">{items.length ? "No questions match these filters." : "No approved questions have been added to your school bank yet."}</p>
          ) : (
            <div className="max-h-80 space-y-2 overflow-y-auto">
              {visibleItems.map(item => (
                <label key={item._id} className="flex cursor-pointer gap-3 rounded-lg border bg-white p-3">
                  <input type="checkbox" checked={selected.includes(String(item._id))} onChange={event => setSelected(current => event.target.checked ? [...current, String(item._id)] : current.filter(id => id !== String(item._id)))} className="mt-1 h-4 w-4 accent-blue-700" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-slate-800">{item.question}</span>
                    <span className="mt-1 block text-xs text-slate-500">{item.className || item.schoolClass?.name || "Class"} · {item.subjectName || item.subject?.name || "Subject"} · {item.topic || "General"} · {item.difficulty} · {item.type.replaceAll("_", " ")} · {item.marks} mark(s)</span>
                    <span className="mt-1 block text-[11px] text-slate-400">Added by {item.createdBy?.firstName || ""} {item.createdBy?.lastName || ""}</span>
                  </span>
                </label>
              ))}
            </div>
          )}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-blue-100 pt-3">
            <span className="text-xs text-slate-500">{selectedQuestions.length} selected</span>
            <button type="button" disabled={!selectedQuestions.length} onClick={() => appendQuestions(selectedQuestions)} className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50">Add selected</button>
          </div>
        </div>
      )}
    </section>
  );
}
