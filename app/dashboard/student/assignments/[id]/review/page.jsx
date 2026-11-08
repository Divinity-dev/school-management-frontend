"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, XCircle, Loader2, BookOpen } from "lucide-react";
import api from "@/lib/api";

export default function CbtReviewPage(){
 const params=useParams(); const router=useRouter();
 const assignmentId=params?.id;
 const [data,setData]=useState(null); const [loading,setLoading]=useState(true); const [error,setError]=useState("");
 useEffect(()=>{let active=true;(async()=>{try{const response=await api.get("/assignments/"+assignmentId+"/cbt/review");if(active)setData(response.data);}catch(err){if(active)setError(err.response?.data?.message||"Unable to load your answer review.");}finally{if(active)setLoading(false);}})();return()=>{active=false};},[assignmentId]);
 if(loading)return <div className="flex min-h-[50vh] items-center justify-center gap-3"><Loader2 className="animate-spin"/>Loading answer review...</div>;
 if(error)return <main className="mx-auto max-w-3xl p-6"><Link href="/dashboard/student/assignments" className="text-sm text-blue-700">← Back to assignments and exams</Link><div className="mt-5 rounded-xl border bg-white p-6"><h1 className="text-lg font-bold">Answer review unavailable</h1><p className="mt-2 text-sm text-slate-600">{error}</p></div></main>;
 const result=data?.result||{};
 return <main className="mx-auto max-w-4xl space-y-5 px-4 py-7"><button onClick={()=>router.back()} className="inline-flex items-center gap-2 text-sm font-semibold text-blue-800"><ArrowLeft size={16}/> Back</button><header className="rounded-2xl bg-gradient-to-r from-blue-950 to-teal-800 p-6 text-white"><p className="text-xs font-bold uppercase tracking-widest text-teal-200">Examination review</p><h1 className="mt-2 text-2xl font-black">{data?.assignment?.title}</h1><p className="mt-2 text-sm text-blue-100">Score: {result.score??result.autoScore??"Awaiting teacher grading"} / 100</p></header>
 {(data?.review||[]).map((item,index)=><article key={item.questionId} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-3"><h2 className="font-bold text-slate-900">Question {item.number||index+1}</h2>{item.isCorrect===true?<span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700"><CheckCircle2 size={15}/> Correct</span>:item.isCorrect===false?<span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700"><XCircle size={15}/> Incorrect</span>:<span className="text-xs font-bold text-amber-700">Teacher graded</span>}</div><p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-800">{item.question}</p><div className="mt-4 grid gap-3 sm:grid-cols-2"><div className="rounded-xl bg-slate-50 p-3"><p className="text-[10px] font-bold uppercase text-slate-500">Your answer</p><p className="mt-1 whitespace-pre-wrap text-sm">{item.studentAnswer||"No answer"}</p></div><div className="rounded-xl bg-emerald-50 p-3"><p className="text-[10px] font-bold uppercase text-emerald-700">Correct answer</p><p className="mt-1 whitespace-pre-wrap text-sm text-emerald-950">{item.correctAnswer||"Awaiting teacher grading"}</p></div></div>{item.explanation&&<div className="mt-3 rounded-xl border border-blue-100 bg-blue-50 p-4"><p className="flex items-center gap-2 text-xs font-bold uppercase text-blue-900"><BookOpen size={14}/> Explanation / worked solution</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-blue-950">{item.explanation}</p></div>}</article>)}
 <Link href="/dashboard/student/assignments" className="inline-flex rounded-xl bg-blue-950 px-4 py-3 text-sm font-semibold text-white">Return to assignments and exams</Link></main>;
}
