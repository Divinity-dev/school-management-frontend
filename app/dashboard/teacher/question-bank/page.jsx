"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, FileUp, Plus, RefreshCw, Sparkles, Trash2, WandSparkles } from "lucide-react";
import api from "@/lib/api";

const emptyManual = () => ({
  question: "", topic: "", type: "multiple_choice", marks: 1, difficulty: "medium",
  optionsText: "", correctAnswer: "A", explanation: "",
});

export default function TeacherQuestionBankPage() {
  const [assignments, setAssignments] = useState([]);
  const [subjectAssignmentId, setSubjectAssignmentId] = useState("");
  const [questions, setQuestions] = useState([]);
  const [generated, setGenerated] = useState([]);
  const [topics, setTopics] = useState("");
  const [materialText, setMaterialText] = useState("");
  const [materialFile, setMaterialFile] = useState(null);
  const [count, setCount] = useState(10);
  const [difficulty, setDifficulty] = useState("medium");
  const [types, setTypes] = useState(["multiple_choice"]);
  const [manual, setManual] = useState(emptyManual());
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const selectedAssignment = useMemo(
    () => assignments.find(item => String(item._id) === subjectAssignmentId),
    [assignments, subjectAssignmentId]
  );

  const loadQuestions = async () => {
    if (!subjectAssignmentId) return;
    try {
      const response = await api.get("/question-bank", { params: { subjectAssignmentId, search: search || undefined } });
      setQuestions(response.data?.questions || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load questions.");
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        const response = await api.get("/subject-assignments");
        const items = response.data?.assignments || response.data?.subjectAssignments || [];
        const active = items.filter(item => item.isActive !== false);
        setAssignments(active);
        if (active.length) setSubjectAssignmentId(String(active[0]._id));
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load your subject assignments.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => { loadQuestions(); }, [subjectAssignmentId]);

  const toggleType = value => setTypes(current => current.includes(value) ? current.filter(item => item !== value) : [...current, value]);

  const generate = async event => {
    event.preventDefault();
    setError("");
    setNotice("");
    if (!subjectAssignmentId || (!topics.trim() && !materialText.trim() && !materialFile)) {
      setError("Select a subject and provide topics, notes or a learning-material file.");
      return;
    }
    const data = new FormData();
    data.append("subjectAssignmentId", subjectAssignmentId);
    data.append("topics", topics);
    data.append("materialText", materialText);
    data.append("count", String(count));
    data.append("difficulty", difficulty);
    types.forEach(type => data.append("types", type));
    if (materialFile) data.append("material", materialFile);
    setGenerating(true);
    try {
      const response = await api.post("/question-bank/generate", data);
      setGenerated(response.data?.questions || []);
      setNotice(response.data?.message || "Questions generated. Review before saving.");
    } catch (err) {
      setError(err.response?.data?.message || "AI question generation failed.");
    } finally {
      setGenerating(false);
    }
  };

  const saveQuestion = async (question, index, source = "ai") => {
    setSaving(true);
    setError("");
    try {
      await api.post("/question-bank", { ...question, subjectAssignmentId, source });
      setGenerated(current => current.filter((_, itemIndex) => itemIndex !== index));
      await loadQuestions();
      setNotice("Question saved to your school question bank.");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save question.");
    } finally {
      setSaving(false);
    }
  };

  const saveManual = async event => {
    event.preventDefault();
    setError("");
    const options = ["multiple_choice", "true_false"].includes(manual.type)
      ? manual.optionsText.split("\n").map((text, index) => ({ text: text.trim(), value: String.fromCharCode(65 + index) })).filter(option => option.text)
      : [];
    const payload = {
      question: manual.question, topic: manual.topic || "General", type: manual.type,
      marks: Math.max(1, Math.trunc(Number(manual.marks) || 1)), difficulty: manual.difficulty,
      options, correctAnswer: manual.correctAnswer, explanation: manual.explanation,
      subjectAssignmentId, source: "manual",
    };
    setSaving(true);
    try {
      await api.post("/question-bank", payload);
      setManual(emptyManual());
      await loadQuestions();
      setNotice("Question added to your bank.");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save manual question.");
    } finally {
      setSaving(false);
    }
  };

  const importFile = async event => {
    event.preventDefault();
    const file = event.currentTarget.elements.namedItem("questionFile")?.files?.[0];
    if (!file) return setError("Choose a CSV or Excel file to import.");
    const data = new FormData();
    data.append("file", file);
    data.append("subjectAssignmentId", subjectAssignmentId);
    setImporting(true);
    setError("");
    try {
      const response = await api.post("/question-bank/import", data);
      setNotice(response.data?.message || "Import completed.");
      await loadQuestions();
      event.currentTarget.reset();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to import questions.");
    } finally {
      setImporting(false);
    }
  };

  const archiveQuestion = async id => {
    if (!window.confirm("Archive this question? It will no longer appear in the question bank picker.")) return;
    try {
      await api.delete("/question-bank/" + id);
      await loadQuestions();
      setNotice("Question archived.");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to archive question.");
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-7 sm:px-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <Link href="/dashboard/teacher/exams" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-emerald-700"><ArrowLeft className="h-4 w-4"/> Back to examinations</Link>
        <header className="rounded-2xl bg-slate-950 p-6 text-white sm:p-8">
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-white/10 p-3"><BookOpen className="h-7 w-7 text-emerald-300"/></div>
            <div><p className="text-sm font-semibold text-emerald-300">SchoolPilot Assessments</p><h1 className="mt-1 text-2xl font-bold sm:text-3xl">Question Bank</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">Build a reusable collection of approved questions for formal examinations and assignment CBTs. Generate drafts with AI, import existing questions or create them manually.</p></div>
          </div>
        </header>

        {error && <p className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">{error}</p>}
        {notice && <p className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-800">{notice}</p>}

        <section className="rounded-2xl border bg-white p-5 shadow-sm">
          <label className="block text-sm font-semibold text-slate-700">Subject and class</label>
          {loading ? <p className="mt-2 text-sm text-slate-500">Loading your subjects…</p> : (
            <select value={subjectAssignmentId} onChange={event => setSubjectAssignmentId(event.target.value)} className="mt-2 w-full max-w-xl rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm">
              {assignments.map(item => <option key={item._id} value={item._id}>{item.subject?.name || "Subject"} — {item.schoolClass?.name || "Class"} {item.schoolClass?.arm || ""}</option>)}
            </select>
          )}
          {selectedAssignment && <p className="mt-2 text-xs text-slate-500">Questions are saved to your school's bank for {selectedAssignment.subject?.name} · {selectedAssignment.schoolClass?.name}.</p>}
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          <form onSubmit={generate} className="space-y-4 rounded-2xl border border-violet-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-violet-600"/><h2 className="font-bold text-slate-900">Generate with AI</h2></div>
            <p className="text-xs leading-5 text-slate-500">Generate original questions from topics, teacher notes or uploaded learning material. Every question is returned as a draft for teacher review.</p>
            <label className="block text-xs font-semibold text-slate-700">Topics<input value={topics} onChange={event => setTopics(event.target.value)} placeholder="e.g. Fractions, decimals and percentages" className="mt-1 w-full rounded-lg border p-3 text-sm font-normal"/></label>
            <label className="block text-xs font-semibold text-slate-700">Paste learning material (optional)<textarea rows={4} value={materialText} onChange={event => setMaterialText(event.target.value)} placeholder="Paste notes, a lesson summary or scheme-of-work content…" className="mt-1 w-full rounded-lg border p-3 text-sm font-normal"/></label>
            <label className="block text-xs font-semibold text-slate-700">Or upload notes (.txt, .md, .csv, .xlsx, .xls)<input type="file" accept=".txt,.md,.csv,.xlsx,.xls" onChange={event => setMaterialFile(event.target.files?.[0] || null)} className="mt-1 block w-full rounded-lg border p-2 text-xs font-normal"/></label>
            <div className="grid grid-cols-2 gap-3">
              <label className="text-xs font-semibold text-slate-700">Number of questions<input type="number" min="1" max="50" step="1" value={count} onChange={event => setCount(Math.min(50,Math.max(1,Math.trunc(Number(event.target.value)||1))))} className="mt-1 w-full rounded-lg border p-2 text-sm"/></label>
              <label className="text-xs font-semibold text-slate-700">Difficulty<select value={difficulty} onChange={event => setDifficulty(event.target.value)} className="mt-1 w-full rounded-lg border p-2 text-sm"><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Difficult</option></select></label>
            </div>
            <div><p className="text-xs font-semibold text-slate-700">Question types</p><div className="mt-2 flex flex-wrap gap-3 text-xs">{[["multiple_choice","Multiple choice"],["true_false","True / False"],["short_answer","Short answer"],["essay","Essay"]].map(([value,label])=><label key={value} className="flex items-center gap-2"><input type="checkbox" checked={types.includes(value)} onChange={()=>toggleType(value)} className="accent-violet-600"/>{label}</label>)}</div></div>
            <button disabled={generating || !subjectAssignmentId || types.length===0} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"><WandSparkles className="h-4 w-4"/>{generating?"Generating questions…":"Generate questions"}</button>
          </form>

          <div className="space-y-4 rounded-2xl border bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2"><FileUp className="h-5 w-5 text-emerald-600"/><h2 className="font-bold text-slate-900">Import existing questions</h2></div>
            <p className="text-xs leading-5 text-slate-500">Upload a CSV or Excel file with columns: Question, Type, Options, Correct Answer, Marks, Topic, Difficulty and Explanation. Separate multiple-choice options with a vertical bar (|).</p>
            <form onSubmit={importFile} className="space-y-4">
              <input name="questionFile" type="file" required accept=".csv,.xlsx,.xls" className="block w-full rounded-lg border p-3 text-xs"/>
              <button disabled={importing || !subjectAssignmentId} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"><FileUp className="h-4 w-4"/>{importing?"Importing…":"Import questions"}</button>
            </form>
            <div className="rounded-xl bg-slate-50 p-4">
              <h3 className="text-xs font-bold text-slate-700">Marking rules</h3>
              <p className="mt-1 text-xs leading-5 text-slate-500">Every question must have a positive whole-number mark. Decimal marks are rejected. Objective questions must include complete options and a correct answer.</p>
            </div>
            <form onSubmit={saveManual} className="space-y-3 border-t pt-4">
              <h3 className="font-semibold text-slate-900">Add a question manually</h3>
              <input required value={manual.question} onChange={event => setManual(current=>({...current,question:event.target.value}))} placeholder="Enter question text" className="w-full rounded-lg border p-3 text-sm"/>
              <div className="grid grid-cols-2 gap-2">
                <input value={manual.topic} onChange={event=>setManual(current=>({...current,topic:event.target.value}))} placeholder="Topic" className="rounded-lg border p-2 text-sm"/>
                <input type="number" min="1" step="1" value={manual.marks} onChange={event=>setManual(current=>({...current,marks:Math.max(1,Math.trunc(Number(event.target.value)||1))}))} className="rounded-lg border p-2 text-sm" aria-label="Whole-number marks"/>
                <select value={manual.type} onChange={event=>setManual(current=>({...current,type:event.target.value,optionsText:event.target.value==="true_false"?"True\nFalse":"",correctAnswer:event.target.value==="true_false"?"A":"A"}))} className="rounded-lg border p-2 text-sm"><option value="multiple_choice">Multiple choice</option><option value="true_false">True / False</option><option value="short_answer">Short answer</option><option value="essay">Essay</option></select>
                <select value={manual.difficulty} onChange={event=>setManual(current=>({...current,difficulty:event.target.value}))} className="rounded-lg border p-2 text-sm"><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Difficult</option></select>
              </div>
              {["multiple_choice","true_false"].includes(manual.type) && <><textarea rows={3} value={manual.optionsText} onChange={event=>setManual(current=>({...current,optionsText:event.target.value}))} placeholder={"One option per line\nOption A\nOption B"} className="w-full rounded-lg border p-3 text-sm"/><select value={manual.correctAnswer} onChange={event=>setManual(current=>({...current,correctAnswer:event.target.value}))} className="w-full rounded-lg border p-2 text-sm"><option value="A">Correct option: A</option><option value="B">Correct option: B</option><option value="C">Correct option: C</option><option value="D">Correct option: D</option></select></>}
              {manual.type==="short_answer" && <input value={manual.correctAnswer} onChange={event=>setManual(current=>({...current,correctAnswer:event.target.value}))} placeholder="Correct answer" className="w-full rounded-lg border p-2 text-sm"/>}
              <textarea rows={2} value={manual.explanation} onChange={event=>setManual(current=>({...current,explanation:event.target.value}))} placeholder="Explanation / worked solution (optional)" className="w-full rounded-lg border p-3 text-sm"/>
              <button disabled={saving || !subjectAssignmentId} className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 px-4 py-2 text-sm font-semibold text-emerald-700 disabled:opacity-50"><Plus className="h-4 w-4"/>Save question</button>
            </form>
          </div>
        </section>

        {generated.length > 0 && <section className="space-y-3 rounded-2xl border border-violet-100 bg-violet-50/50 p-5">
          <div className="flex items-center justify-between gap-3"><h2 className="font-bold text-slate-900">AI-generated drafts ({generated.length})</h2><span className="text-xs text-slate-500">Review before saving</span></div>
          {generated.map((question,index)=><article key={index} className="space-y-3 rounded-xl border bg-white p-4">
            <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-semibold text-violet-700">{question.topic} · {question.difficulty} · {question.marks} mark(s)</p><p className="mt-2 whitespace-pre-wrap text-sm font-medium text-slate-900">{question.question}</p></div><button type="button" onClick={()=>setGenerated(current=>current.filter((_,i)=>i!==index))} className="text-slate-400 hover:text-red-600" aria-label="Discard draft"><Trash2 className="h-4 w-4"/></button></div>
            {question.options?.map(option=><p key={option.value} className="text-xs text-slate-600">{option.value}. {option.text}</p>)}
            <p className="text-xs text-emerald-700">Correct answer: {question.correctAnswer || "Teacher marking"} </p>
            {question.explanation && <p className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600">{question.explanation}</p>}
            <button type="button" disabled={saving} onClick={()=>saveQuestion(question,index,"ai")} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">Approve & save to bank</button>
          </article>)}
        </section>}

        <section className="space-y-4 rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-bold text-slate-900">Saved questions ({questions.length})</h2><p className="mt-1 text-xs text-slate-500">Approved questions available to your examination and assignment builders.</p></div><button type="button" onClick={loadQuestions} className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold"><RefreshCw className="h-4 w-4"/>Refresh</button></div>
          <div className="flex gap-2"><input value={search} onChange={event=>setSearch(event.target.value)} onKeyDown={event=>event.key==="Enter"&&loadQuestions()} placeholder="Search by question or topic" className="min-w-0 flex-1 rounded-lg border p-2 text-sm"/><button type="button" onClick={loadQuestions} className="rounded-lg bg-slate-900 px-4 text-xs font-semibold text-white">Search</button></div>
          {questions.length===0 ? <p className="rounded-xl bg-slate-50 p-8 text-center text-sm text-slate-500">No saved questions for this subject and class yet.</p> : <div className="divide-y">{questions.map(question=><article key={question._id} className="flex items-start justify-between gap-3 py-4"><div className="min-w-0"><p className="text-sm font-medium text-slate-900">{question.question}</p><p className="mt-1 text-xs text-slate-500">{question.topic} · {question.type.replaceAll("_"," ")} · {question.difficulty} · {question.marks} mark(s) · {question.source}</p></div><button type="button" onClick={()=>archiveQuestion(question._id)} className="shrink-0 rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600" aria-label="Archive question"><Trash2 className="h-4 w-4"/></button></article>)}</div>}
        </section>
      </div>
    </main>
  );
}
