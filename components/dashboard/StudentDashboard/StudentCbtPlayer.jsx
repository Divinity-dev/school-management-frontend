"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, ArrowLeft, CheckCircle2, Clock3, Loader2, Send } from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remaining).padStart(2, "0")}`;
};

export default function StudentCbtPlayer({ assignment }) {
  const [attempt, setAttempt] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [activeIndex, setActiveIndex] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [autoSubmitAttempted, setAutoSubmitAttempted] = useState(false);

  const answeredCount = useMemo(
    () => Object.values(answers).filter((answer) => String(answer).trim()).length,
    [answers]
  );

  useEffect(() => {
    let mounted = true;
    const start = async () => {
      try {
        const response = await api.post(`/assignments/${assignment._id}/cbt/start`);
        if (!mounted) return;
        const data = response.data;
        if (data.alreadySubmitted) {
          setResult(data.submission || {});
          return;
        }
        setAttempt(data.attempt);
        setQuestions(data.assignment?.questions || []);
        const saved = {};
        (data.attempt?.answers || []).forEach((item) => {
          saved[String(item.questionId)] = item.answer;
        });
        setAnswers(saved);
        setSecondsRemaining(Math.max(0, Math.ceil((new Date(data.attempt.expiresAt).getTime() - Date.now()) / 1000)));
      } catch (err) {
        if (mounted) setError(err.response?.data?.message || "Unable to start this CBT.");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    start();
    return () => { mounted = false; };
  }, [assignment._id]);

  useEffect(() => {
    if (!attempt?.expiresAt || result) return undefined;
    const timer = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((new Date(attempt.expiresAt).getTime() - Date.now()) / 1000));
      setSecondsRemaining(remaining);
    }, 1000);
    return () => clearInterval(timer);
  }, [attempt?.expiresAt, result]);

  const saveAnswers = async (nextAnswers) => {
    setSaving(true);
    try {
      await api.patch(`/assignments/${assignment._id}/cbt/answers`, {
        answers: questions.map((question) => ({
          questionId: question._id,
          answer: nextAnswers[String(question._id)] || "",
        })),
      });
    } catch (err) {
      setError(err.response?.data?.message || "Your answer could not be saved. Check your connection.");
    } finally {
      setSaving(false);
    }
  };

  const changeAnswer = (questionId, value) => {
    const next = { ...answers, [String(questionId)]: value };
    setAnswers(next);
    saveAnswers(next);
  };

  const submitAnswers = async (automatic = false) => {
    if (submitting || result) return;
    setSubmitting(true);
    setError("");
    try {
      const response = await api.post(`/assignments/${assignment._id}/cbt/submit`, {
        answers: questions.map((question) => ({
          questionId: question._id,
          answer: answers[String(question._id)] || "",
        })),
        automatic,
      });
      setResult(response.data?.submission || {});
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit your test.");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (secondsRemaining === 0 && attempt?.status === "in_progress" && !result && !submitting && !autoSubmitAttempted) {
      setAutoSubmitAttempted(true);
      submitAnswers(true);
    }
  }, [secondsRemaining, attempt?.status, result, submitting, autoSubmitAttempted]);

  if (loading) {
    return <div className="flex min-h-[55vh] items-center justify-center gap-3 text-sm text-slate-500"><Loader2 className="h-5 w-5 animate-spin" /> Preparing your test...</div>;
  }

  if (error && !attempt) {
    return <section className="mx-auto max-w-3xl rounded-2xl border border-red-100 bg-white p-8 text-center"><AlertCircle className="mx-auto h-10 w-10 text-red-500" /><h2 className="mt-3 text-lg font-semibold text-slate-900">Unable to start CBT</h2><p className="mt-2 text-sm text-slate-600">{error}</p><Link href="/dashboard/student/assignments" className="mt-5 inline-flex rounded-lg bg-slate-900 px-4 py-2 text-sm text-white">Back to assignments</Link></section>;
  }

  if (result) {
    return (
      <section className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"><CheckCircle2 className="h-7 w-7" /></div>
        <h1 className="mt-4 text-center text-2xl font-bold text-slate-900">Test submitted</h1>
        <p className="mt-2 text-center text-sm text-slate-600">{result.gradingStatus === "pending_manual" ? "Your objective answers have been marked. Your written answers are awaiting teacher review." : "Your answers have been marked automatically."}</p>
        {assignment.showResultsImmediately && result.score !== null && result.score !== undefined && <p className="mt-5 text-center text-4xl font-bold text-emerald-700">{result.score}%</p>}
        <div className="mt-7 flex flex-wrap justify-center gap-3">{assignment.showResultsImmediately && <Link href={`/dashboard/student/assignments/${assignment._id}/review`} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white">Review answers and solutions</Link>}<Link href="/dashboard/student/assignments" className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white"><ArrowLeft className="h-4 w-4" /> Back to assignments</Link></div>
      </section>
    );
  }

  const question = questions[activeIndex];
  if (!question) return <p className="text-sm text-slate-600">This test has no questions.</p>;

  return (
    <main className="mx-auto max-w-5xl space-y-5">
      <header className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
        <div><Link href="/dashboard/student/assignments" className="mb-2 inline-flex items-center gap-2 text-xs font-medium text-slate-500"><ArrowLeft className="h-3.5 w-3.5" /> Exit test</Link><h1 className="text-xl font-bold text-slate-900">{assignment.title}</h1><p className="mt-1 text-xs text-slate-500">{questions.length} questions · {assignment.durationMinutes} minutes</p></div>
        <div className={`inline-flex items-center gap-2 rounded-xl px-4 py-3 font-mono text-lg font-bold ${secondsRemaining <= 60 ? "bg-red-50 text-red-700" : "bg-slate-100 text-slate-900"}`}><Clock3 className="h-5 w-5" />{formatTime(secondsRemaining || 0)}</div>
      </header>

      {error && <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">{error}</div>}

      <div className="grid gap-5 lg:grid-cols-[1fr_260px]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
          <div className="mb-6 flex items-center justify-between text-xs text-slate-500"><span>Question {activeIndex + 1} of {questions.length}</span><span>{question.marks} mark(s)</span></div>
          <h2 className="text-lg font-semibold leading-7 text-slate-900">{question.question}</h2>
          <div className="mt-7 space-y-3">
            {["multiple_choice", "true_false"].includes(question.type) ? question.options.map((option) => (
              <label key={option.value} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 text-sm transition ${answers[String(question._id)] === option.value ? "border-emerald-500 bg-emerald-50" : "border-slate-200 hover:bg-slate-50"}`}>
                <input type="radio" name={String(question._id)} checked={answers[String(question._id)] === option.value} onChange={() => changeAnswer(question._id, option.value)} className="h-4 w-4 accent-emerald-600" />
                <span>{option.text}</span>
              </label>
            )) : question.type === "short_answer" ? (
              <input value={answers[String(question._id)] || ""} onChange={(event) => changeAnswer(question._id, event.target.value)} placeholder="Type your answer" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500" />
            ) : (
              <textarea value={answers[String(question._id)] || ""} onChange={(event) => changeAnswer(question._id, event.target.value)} rows={8} placeholder="Write your answer here..." className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500" />
            )}
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
            <button type="button" disabled={activeIndex === 0} onClick={() => setActiveIndex((value) => value - 1)} className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 disabled:opacity-40">Previous</button>
            {activeIndex < questions.length - 1 ? <button type="button" onClick={() => setActiveIndex((value) => value + 1)} className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700">Next question</button> : <button type="button" onClick={() => submitAnswers(false)} disabled={submitting} className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"><Send className="h-4 w-4" />{submitting ? "Submitting..." : "Submit test"}</button>}
          </div>
        </section>

        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between"><h3 className="text-sm font-semibold text-slate-900">Question navigator</h3><span className="text-xs text-slate-500">{answeredCount}/{questions.length} answered</span></div>
          <div className="mt-4 grid grid-cols-5 gap-2">
            {questions.map((item, index) => <button key={item._id} type="button" onClick={() => setActiveIndex(index)} className={`h-10 rounded-lg text-sm font-semibold ${index === activeIndex ? "bg-slate-900 text-white" : answers[String(item._id)]?.trim() ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>{index + 1}</button>)}
          </div>
          <p className="mt-4 text-xs text-slate-500">{saving ? "Saving your answers..." : "Your answers are saved as you work."}</p>
          <button type="button" onClick={() => submitAnswers(false)} disabled={submitting} className="mt-5 w-full rounded-lg border border-red-200 px-3 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50">Finish and submit</button>
        </aside>
      </div>
    </main>
  );
}
