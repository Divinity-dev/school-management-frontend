"use client";

import { Plus, Trash2 } from "lucide-react";

const createQuestion = () => ({
  question: "",
  type: "multiple_choice",
  marks: 1,
  options: [
    { text: "", value: "A" },
    { text: "", value: "B" },
    { text: "", value: "C" },
    { text: "", value: "D" },
  ],
  correctAnswer: "A",
  acceptedAnswers: [],
});

export default function CbtQuestionBuilder({ questions, setQuestions }) {
  const updateQuestion = (index, updates) => {
    setQuestions((current) =>
      current.map((question, i) => i === index ? { ...question, ...updates } : question)
    );
  };

  const updateOption = (questionIndex, optionIndex, text) => {
    setQuestions((current) => current.map((question, i) => {
      if (i !== questionIndex) return question;
      return {
        ...question,
        options: question.options.map((option, j) =>
          j === optionIndex ? { ...option, text } : option
        ),
      };
    }));
  };

  const addQuestion = () => setQuestions((current) => [...current, createQuestion()]);
  const removeQuestion = (index) =>
    setQuestions((current) => current.filter((_, i) => i !== index));

  return (
    <section className="space-y-5 rounded-2xl border border-emerald-100 bg-emerald-50/40 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold text-slate-900">CBT questions</h3>
          <p className="mt-1 text-xs text-slate-500">Objective questions are marked automatically. Essay answers are marked by the teacher.</p>
        </div>
        <button type="button" onClick={addQuestion} className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
          <Plus className="h-4 w-4" /> Add question
        </button>
      </div>

      {questions.map((question, index) => (
        <div key={index} className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-slate-800">Question {index + 1}</p>
            {questions.length > 1 && (
              <button type="button" onClick={() => removeQuestion(index)} className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700">
                <Trash2 className="h-4 w-4" /> Remove
              </button>
            )}
          </div>

          <textarea
            value={question.question}
            onChange={(event) => updateQuestion(index, { question: event.target.value })}
            rows={3}
            placeholder="Enter the question..."
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
          />

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-xs font-medium text-slate-600">
              Question type
              <select value={question.type} onChange={(event) => {
                const type = event.target.value;
                const options = type === "true_false"
                  ? [{ text: "True", value: "true" }, { text: "False", value: "false" }]
                  : type === "multiple_choice"
                    ? [{ text: "", value: "A" }, { text: "", value: "B" }, { text: "", value: "C" }, { text: "", value: "D" }]
                    : [];
                updateQuestion(index, { type, options, correctAnswer: type === "true_false" ? "true" : type === "multiple_choice" ? "A" : "", acceptedAnswers: [] });
              }} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800">
                <option value="multiple_choice">Multiple choice</option>
                <option value="true_false">True / False</option>
                <option value="short_answer">Short answer</option>
                <option value="essay">Essay / Written</option>
              </select>
            </label>
            <label className="text-xs font-medium text-slate-600">
              Marks
              <input type="number" min="0.01" step="0.5" value={question.marks} onChange={(event) => updateQuestion(index, { marks: Number(event.target.value) })} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800" />
            </label>
          </div>

          {["multiple_choice", "true_false"].includes(question.type) && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-600">Answer options</p>
              {question.options.map((option, optionIndex) => (
                <div key={option.value} className="flex items-center gap-2">
                  <span className="w-6 text-xs font-semibold text-slate-500">{option.value.toUpperCase()}</span>
                  <input value={option.text} disabled={question.type === "true_false"} onChange={(event) => updateOption(index, optionIndex, event.target.value)} placeholder={question.type === "true_false" ? option.text : `Option ${option.value}`} className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm disabled:bg-slate-50" />
                  <input type="radio" name={`correct-${index}`} checked={question.correctAnswer === option.value} onChange={() => updateQuestion(index, { correctAnswer: option.value })} aria-label={`Mark option ${option.value} correct`} className="h-4 w-4 accent-emerald-600" />
                </div>
              ))}
              <p className="text-xs text-slate-500">Select the radio button beside the correct answer.</p>
            </div>
          )}

          {question.type === "short_answer" && (
            <label className="block text-xs font-medium text-slate-600">
              Correct answer
              <input value={question.correctAnswer} onChange={(event) => updateQuestion(index, { correctAnswer: event.target.value })} placeholder="Enter the expected answer" className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            </label>
          )}

          {question.type === "essay" && (
            <p className="rounded-lg bg-amber-50 p-3 text-xs leading-5 text-amber-800">Students will type their written response during the test. The teacher will review and enter the final score.</p>
          )}
        </div>
      ))}
    </section>
  );
}
