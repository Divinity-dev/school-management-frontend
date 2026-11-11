"use client";

import { useEffect, useState } from "react";
import { BookOpen, Plus, RefreshCw, Trash2 } from "lucide-react";
import api from "@/lib/api";

const initial = { subjectName: "", className: "", topic: "", question: "", type: "multiple_choice", optionsText: "", correctAnswer: "A", marks: 1, difficulty: "medium", explanation: "" };

export default function SuperAdminQuestionBankPage() {
  const [form,setForm]=useState(initial);
  const [questions,setQuestions]=useState([]);
  const [loading,setLoading]=useState(true);
  const [saving,setSaving]=useState(false);
  const [error,setError]=useState("");
  const [notice,setNotice]=useState("");

  const load=async()=>{setLoading(true);try{const r=await api.get("/question-bank");setQuestions((r.data?.questions||[]).filter(q=>q.visibility==="shared"));}catch(e){setError(e.response?.data?.message||"Unable to load shared questions.");}finally{setLoading(false);}};
  useEffect(()=>{load();},[]);

  const submit=async event=>{
    event.preventDefault();setError("");setNotice("");
    const options=["multiple_choice","true_false"].includes(form.type)?form.optionsText.split("\n").map((text,index)=>({text:text.trim(),value:String.fromCharCode(65+index)})).filter(o=>o.text):[];
    setSaving(true);
    try{
      const r=await api.post("/question-bank",{...form,options,marks:Math.max(1,Math.trunc(Number(form.marks)||1)),visibility:"shared",source:"manual"});
      setNotice(r.data?.message||"Shared question published.");setForm(initial);await load();
    }catch(e){setError(e.response?.data?.message||"Unable to publish question.");}
    finally{setSaving(false);}
  };
  const archive=async id=>{try{await api.delete("/question-bank/"+id);await load();setNotice("Question archived from the shared bank.");}catch(e){setError(e.response?.data?.message||"Unable to archive question.");}};

  return <main className="min-h-screen bg-slate-50 px-4 py-7 sm:px-6"><div className="mx-auto max-w-6xl space-y-6">
    <header className="rounded-2xl bg-slate-950 p-6 text-white"><div className="flex items-center gap-3"><BookOpen className="h-7 w-7 text-emerald-300"/><div><p className="text-sm font-semibold text-emerald-300">SchoolPilot Platform Administration</p><h1 className="text-2xl font-bold">Shared Question Bank</h1></div></div><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">Publish curriculum-ready questions that schools can reuse. Questions are matched to the subject and class name, not to a specific school's private records.</p></header>
    {error&&<p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}{notice&&<p className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">{notice}</p>}
    <section className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
      <form onSubmit={submit} className="space-y-4 rounded-2xl border bg-white p-5 shadow-sm">
        <h2 className="font-bold text-slate-900">Publish a shared question</h2>
        <div className="grid grid-cols-2 gap-3"><label className="text-xs font-semibold">Subject<input required value={form.subjectName} onChange={e=>setForm(v=>({...v,subjectName:e.target.value}))} placeholder="Mathematics" className="mt-1 w-full rounded-lg border p-2 text-sm font-normal"/></label><label className="text-xs font-semibold">Class<input required value={form.className} onChange={e=>setForm(v=>({...v,className:e.target.value}))} placeholder="Basic 5" className="mt-1 w-full rounded-lg border p-2 text-sm font-normal"/></label></div>
        <label className="block text-xs font-semibold">Topic<input required value={form.topic} onChange={e=>setForm(v=>({...v,topic:e.target.value}))} className="mt-1 w-full rounded-lg border p-2 text-sm font-normal"/></label>
        <label className="block text-xs font-semibold">Question<textarea required rows={3} value={form.question} onChange={e=>setForm(v=>({...v,question:e.target.value}))} className="mt-1 w-full rounded-lg border p-3 text-sm font-normal"/></label>
        <div className="grid grid-cols-2 gap-3"><label className="text-xs font-semibold">Type<select value={form.type} onChange={e=>setForm(v=>({...v,type:e.target.value,optionsText:e.target.value==="true_false"?"True\nFalse":""}))} className="mt-1 w-full rounded-lg border p-2 text-sm font-normal"><option value="multiple_choice">Multiple choice</option><option value="true_false">True / False</option><option value="short_answer">Short answer</option><option value="essay">Essay</option></select></label><label className="text-xs font-semibold">Marks (whole number)<input type="number" min="1" step="1" value={form.marks} onChange={e=>setForm(v=>({...v,marks:Math.max(1,Math.trunc(Number(e.target.value)||1))}))} className="mt-1 w-full rounded-lg border p-2 text-sm font-normal"/></label></div>
        {["multiple_choice","true_false"].includes(form.type)&&<><label className="block text-xs font-semibold">Options (one per line)<textarea rows={4} value={form.optionsText} onChange={e=>setForm(v=>({...v,optionsText:e.target.value}))} className="mt-1 w-full rounded-lg border p-3 text-sm font-normal"/></label><label className="block text-xs font-semibold">Correct option<select value={form.correctAnswer} onChange={e=>setForm(v=>({...v,correctAnswer:e.target.value}))} className="mt-1 w-full rounded-lg border p-2 text-sm font-normal"><option value="A">A</option><option value="B">B</option><option value="C">C</option><option value="D">D</option></select></label></>}
        {form.type==="short_answer"&&<label className="block text-xs font-semibold">Correct answer<input value={form.correctAnswer} onChange={e=>setForm(v=>({...v,correctAnswer:e.target.value}))} className="mt-1 w-full rounded-lg border p-2 text-sm font-normal"/></label>}
        <label className="block text-xs font-semibold">Difficulty<select value={form.difficulty} onChange={e=>setForm(v=>({...v,difficulty:e.target.value}))} className="mt-1 w-full rounded-lg border p-2 text-sm font-normal"><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Difficult</option></select></label>
        <textarea rows={3} value={form.explanation} onChange={e=>setForm(v=>({...v,explanation:e.target.value}))} placeholder="Answer explanation / worked solution" className="w-full rounded-lg border p-3 text-sm"/>
        <button disabled={saving} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"><Plus className="h-4 w-4"/>{saving?"Publishing…":"Publish to shared bank"}</button>
      </form>
      <section className="rounded-2xl border bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><h2 className="font-bold text-slate-900">Published questions</h2><button onClick={load} className="rounded-lg border p-2" aria-label="Refresh"><RefreshCw className="h-4 w-4"/></button></div>{loading?<p className="py-8 text-center text-sm text-slate-500">Loading…</p>:questions.length===0?<p className="py-8 text-center text-sm text-slate-500">No shared questions published yet.</p>:<div className="mt-4 divide-y">{questions.map(q=><article key={q._id} className="flex items-start justify-between gap-3 py-4"><div><p className="text-sm font-medium text-slate-900">{q.question}</p><p className="mt-1 text-xs text-slate-500">{q.subjectName} · {q.className} · {q.topic} · {q.marks} mark(s)</p></div><button onClick={()=>archive(q._id)} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600" aria-label="Archive"><Trash2 className="h-4 w-4"/></button></article>)}</div>}</section>
    </section>
  </div></main>;
}
