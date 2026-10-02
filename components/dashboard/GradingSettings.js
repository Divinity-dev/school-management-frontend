"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2,
  GraduationCap,
  Loader2,
  Plus,
  Save,
  Settings2,
  Trash2,
} from "lucide-react";

import api from "@/lib/api";

const createEmptyComponent = () => ({
  name: "",
  maximum: "",
});

const createEmptyGradingRule = () => ({
  min: "",
  max: "",
  grade: "",
  remark: "",
});

export default function GradingSettings() {
  const [gradingSystem, setGradingSystem] = useState(null);

  const [caMaximum, setCaMaximum] = useState("");
  const [examMaximum, setExamMaximum] = useState("");
  const [totalMaximum, setTotalMaximum] = useState("");

  const [caComponents, setCaComponents] = useState([]);

  const [gradingScale, setGradingScale] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  /* =========================================================
     LOAD GRADING SYSTEM
  ========================================================= */

  useEffect(() => {
    const fetchGradingSystem = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/schools/grading-system");

        const system = response.data.gradingSystem;

        setGradingSystem(system);

        setCaMaximum(system.caMaximum);
        setExamMaximum(system.examMaximum);
        setTotalMaximum(system.totalMaximum);

        setCaComponents(
          (system.caComponents || []).map((component) => ({
            name: component.name,
            maximum: component.maximum,
          }))
        );

        setGradingScale(
          (system.gradingScale || []).map((rule) => ({
            min: rule.min,
            max: rule.max,
            grade: rule.grade,
            remark: rule.remark,
          }))
        );
      } catch (err) {
        console.error("Failed to fetch grading system:", err);

        setError(
          err.response?.data?.message ||
            "Failed to load the school's grading system."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchGradingSystem();
  }, []);

  /* =========================================================
     CA / EXAM
  ========================================================= */

  const handleCaMaximumChange = (value) => {
    setCaMaximum(value);
    setMessage("");
    setError("");
  };

  const handleExamMaximumChange = (value) => {
    setExamMaximum(value);
    setMessage("");
    setError("");
  };

  /* =========================================================
     CA COMPONENTS
  ========================================================= */

  const updateCaComponent = (index, field, value) => {
    setCaComponents((current) =>
      current.map((component, componentIndex) =>
        componentIndex === index
          ? {
              ...component,
              [field]: value,
            }
          : component
      )
    );

    setMessage("");
    setError("");
  };

  const addCaComponent = () => {
    setCaComponents((current) => [
      ...current,
      createEmptyComponent(),
    ]);

    setMessage("");
    setError("");
  };

  const removeCaComponent = (index) => {
    setCaComponents((current) =>
      current.filter((_, componentIndex) => componentIndex !== index)
    );

    setMessage("");
    setError("");
  };

  /* =========================================================
     GRADING SCALE
  ========================================================= */

  const updateGradingRule = (index, field, value) => {
    setGradingScale((current) =>
      current.map((rule, ruleIndex) =>
        ruleIndex === index
          ? {
              ...rule,
              [field]: value,
            }
          : rule
      )
    );

    setMessage("");
    setError("");
  };

  const addGradingRule = () => {
    setGradingScale((current) => [
      ...current,
      createEmptyGradingRule(),
    ]);

    setMessage("");
    setError("");
  };

  const removeGradingRule = (index) => {
    setGradingScale((current) =>
      current.filter((_, ruleIndex) => ruleIndex !== index)
    );

    setMessage("");
    setError("");
  };

  /* =========================================================
     VALIDATION
  ========================================================= */

  const validateForm = () => {
    const ca = Number(caMaximum);
    const exam = Number(examMaximum);
    const total = Number(totalMaximum);

    if (!Number.isFinite(ca) || ca < 0) {
      return "CA maximum must be a valid non-negative number.";
    }

    if (!Number.isFinite(exam) || exam < 0) {
      return "Exam maximum must be a valid non-negative number.";
    }

    if (!Number.isFinite(total) || total <= 0) {
      return "Total maximum must be greater than 0.";
    }

    if (ca + exam !== total) {
      return "CA maximum and exam maximum must add up to the total maximum.";
    }

    if (caComponents.length === 0 && ca > 0) {
      return "Add at least one CA component.";
    }

    const normalizedComponentNames = new Set();

    let componentTotal = 0;

    for (const component of caComponents) {
      const name = String(component.name || "").trim();
      const maximum = Number(component.maximum);

      if (!name) {
        return "Every CA component must have a name.";
      }

      if (!Number.isFinite(maximum) || maximum < 0) {
        return `Invalid maximum score for "${name}".`;
      }

      const normalizedName = name.toLowerCase();

      if (normalizedComponentNames.has(normalizedName)) {
        return `Duplicate CA component "${name}".`;
      }

      normalizedComponentNames.add(normalizedName);

      componentTotal += maximum;
    }

    if (componentTotal !== ca) {
      return `CA components total ${componentTotal}, but CA maximum is ${ca}.`;
    }

    if (gradingScale.length === 0) {
      return "Add at least one grading rule.";
    }

    const ranges = [];

    for (const rule of gradingScale) {
      const min = Number(rule.min);
      const max = Number(rule.max);
      const grade = String(rule.grade || "").trim();
      const remark = String(rule.remark || "").trim();

      if (!Number.isFinite(min) || !Number.isFinite(max)) {
        return "Every grading rule must have valid minimum and maximum scores.";
      }

      if (min < 0 || max < 0) {
        return "Grading scores cannot be negative.";
      }

      if (min > max) {
        return `Invalid grading range: ${min} cannot be greater than ${max}.`;
      }

      if (max > total) {
        return `A grading range cannot exceed the total maximum of ${total}.`;
      }

      if (!grade) {
        return "Every grading rule must have a grade.";
      }

      if (!remark) {
        return `Please provide a remark for grade ${grade}.`;
      }

      ranges.push({
        min,
        max,
      });
    }

    const hasZero = ranges.some((range) => range.min === 0);
    const hasTotal = ranges.some((range) => range.max === total);

    if (!hasZero) {
      return "The grading scale must start from 0.";
    }

    if (!hasTotal) {
      return `The grading scale must extend up to ${total}.`;
    }

    for (let i = 0; i < ranges.length; i += 1) {
      for (let j = i + 1; j < ranges.length; j += 1) {
        const first = ranges[i];
        const second = ranges[j];

        const overlaps =
          first.min <= second.max &&
          second.min <= first.max;

        if (overlaps) {
          return "Grading ranges cannot overlap.";
        }
      }
    }

    return null;
  };

  /* =========================================================
     SAVE
  ========================================================= */

  const handleSave = async () => {
    setMessage("");
    setError("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);

      const payload = {
        caMaximum: Number(caMaximum),
        examMaximum: Number(examMaximum),
        totalMaximum: Number(totalMaximum),

        caComponents: caComponents.map((component) => ({
          name: String(component.name).trim(),
          maximum: Number(component.maximum),
        })),

        gradingScale: gradingScale.map((rule) => ({
          min: Number(rule.min),
          max: Number(rule.max),
          grade: String(rule.grade).trim(),
          remark: String(rule.remark).trim(),
        })),
      };

      const response = await api.put(
        "/schools/grading-system",
        payload
      );

      const updatedSystem = response.data.gradingSystem;

      setGradingSystem(updatedSystem);

      setCaMaximum(updatedSystem.caMaximum);
      setExamMaximum(updatedSystem.examMaximum);
      setTotalMaximum(updatedSystem.totalMaximum);

      setCaComponents(
        updatedSystem.caComponents.map((component) => ({
          name: component.name,
          maximum: component.maximum,
        }))
      );

      setGradingScale(
        updatedSystem.gradingScale.map((rule) => ({
          min: rule.min,
          max: rule.max,
          grade: rule.grade,
          remark: rule.remark,
        }))
      );

      setMessage("Grading system updated successfully.");
    } catch (err) {
      console.error("Failed to update grading system:", err);

      setError(
        err.response?.data?.message ||
          "Failed to update the grading system."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     CALCULATIONS
  ========================================================= */

  const numericCa = Number(caMaximum) || 0;
  const numericExam = Number(examMaximum) || 0;

  const componentTotal = caComponents.reduce(
    (sum, component) =>
      sum + (Number(component.maximum) || 0),
    0
  );

  const isComponentTotalValid =
    componentTotal === numericCa;

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto flex min-h-[400px] max-w-6xl items-center justify-center">
          <div className="flex items-center gap-3 text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading grading settings...</span>
          </div>
        </div>
      </main>
    );
  }

  /* =========================================================
     UI
  ========================================================= */

  return (
    <main className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div>
          <div className="mb-2 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100">
              <Settings2 className="h-5 w-5 text-emerald-600" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Grading System
              </h1>

              <p className="text-sm text-slate-500">
                Configure how Continuous Assessment and examinations
                contribute to student results.
              </p>
            </div>
          </div>
        </div>

        {/* Current Configuration */}
        {gradingSystem && (
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-5">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Current Configuration
                </p>

                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <span className="rounded-lg bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700">
                    {gradingSystem.caMaximum} CA
                  </span>

                  <span className="text-slate-400">+</span>

                  <span className="rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-700">
                    {gradingSystem.examMaximum} Exam
                  </span>

                  <span className="text-slate-400">=</span>

                  <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-700">
                    {gradingSystem.totalMaximum} Total
                  </span>
                </div>
              </div>

              <GraduationCap className="h-9 w-9 text-slate-300" />
            </div>
          </section>
        )}

        {/* Score Structure */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-slate-900">
              Score Structure
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Define how the total score is divided between CA and the
              examination.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                CA Maximum
              </label>

              <input
                type="number"
                min="0"
                value={caMaximum}
                onChange={(e) =>
                  handleCaMaximumChange(e.target.value)
                }
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Exam Maximum
              </label>

              <input
                type="number"
                min="0"
                value={examMaximum}
                onChange={(e) =>
                  handleExamMaximumChange(e.target.value)
                }
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Total Maximum
              </label>

              <input
                type="number"
                min="1"
                value={totalMaximum}
                onChange={(e) =>
                  setTotalMaximum(e.target.value)
                }
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
          </div>

          <div className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
            <span className="font-medium">
              {numericCa} CA
            </span>{" "}
            +{" "}
            <span className="font-medium">
              {numericExam} Exam
            </span>{" "}
            ={" "}
            <span className="font-medium">
              {numericCa + numericExam}
            </span>
          </div>
        </section>

        {/* CA Components */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                CA Components
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Define the individual assessments that make up the CA.
              </p>
            </div>

            <button
              type="button"
              onClick={addCaComponent}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
            >
              <Plus className="h-4 w-4" />
              Add Component
            </button>
          </div>

          <div className="space-y-3">
            {caComponents.map((component, index) => (
              <div
                key={index}
                className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-[1fr_180px_auto]"
              >
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-500">
                    Component Name
                  </label>

                  <input
                    type="text"
                    value={component.name}
                    onChange={(e) =>
                      updateCaComponent(
                        index,
                        "name",
                        e.target.value
                      )
                    }
                    placeholder="e.g. 1st Test"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-500">
                    Maximum Score
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={component.maximum}
                    onChange={(e) =>
                      updateCaComponent(
                        index,
                        "maximum",
                        e.target.value
                      )
                    }
                    placeholder="15"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => removeCaComponent(index)}
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-red-200 bg-white text-red-500 transition hover:bg-red-50"
                    title="Remove component"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}

            {caComponents.length === 0 && (
              <div className="rounded-xl border border-dashed border-slate-300 px-5 py-8 text-center">
                <p className="text-sm text-slate-500">
                  No CA components added yet.
                </p>

                <button
                  type="button"
                  onClick={addCaComponent}
                  className="mt-3 text-sm font-semibold text-emerald-600 hover:text-emerald-700"
                >
                  Add your first component
                </button>
              </div>
            )}
          </div>

          <div
            className={`mt-4 rounded-xl px-4 py-3 text-sm ${
              isComponentTotalValid
                ? "bg-emerald-50 text-emerald-700"
                : "bg-amber-50 text-amber-700"
            }`}
          >
            CA components total:{" "}
            <span className="font-bold">
              {componentTotal}
            </span>{" "}
            / {numericCa}
          </div>
        </section>

        {/* Grading Scale */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Grading Scale
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Define the grade, score range and remark used when calculating
                student results.
              </p>
            </div>

            <button
              type="button"
              onClick={addGradingRule}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
            >
              <Plus className="h-4 w-4" />
              Add Grade
            </button>
          </div>

          <div className="space-y-3">
            {gradingScale.map((rule, index) => (
              <div
                key={index}
                className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2 lg:grid-cols-[110px_110px_120px_1fr_auto]"
              >
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-500">
                    Minimum
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={rule.min}
                    onChange={(e) =>
                      updateGradingRule(
                        index,
                        "min",
                        e.target.value
                      )
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-500">
                    Maximum
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={rule.max}
                    onChange={(e) =>
                      updateGradingRule(
                        index,
                        "max",
                        e.target.value
                      )
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-500">
                    Grade
                  </label>

                  <input
                    type="text"
                    value={rule.grade}
                    onChange={(e) =>
                      updateGradingRule(
                        index,
                        "grade",
                        e.target.value
                      )
                    }
                    placeholder="A"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-semibold uppercase outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-500">
                    Remark
                  </label>

                  <input
                    type="text"
                    value={rule.remark}
                    onChange={(e) =>
                      updateGradingRule(
                        index,
                        "remark",
                        e.target.value
                      )
                    }
                    placeholder="Excellent"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => removeGradingRule(index)}
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-red-200 bg-white text-red-500 transition hover:bg-red-50"
                    title="Remove grade"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}

            {gradingScale.length === 0 && (
              <div className="rounded-xl border border-dashed border-slate-300 px-5 py-8 text-center">
                <p className="text-sm text-slate-500">
                  No grading rules added yet.
                </p>

                <button
                  type="button"
                  onClick={addGradingRule}
                  className="mt-3 text-sm font-semibold text-emerald-600 hover:text-emerald-700"
                >
                  Add your first grade
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Feedback */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {message && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            {message}
          </div>
        )}

        {/* Save */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Grading System
              </>
            )}
          </button>
        </div>

        {/* Information */}
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="font-semibold text-amber-900">
            Important
          </h2>

          <p className="mt-2 text-sm leading-6 text-amber-800">
            Changes to the grading configuration affect new and updated
            results. Published results keep a snapshot of the grading system
            that was used when they were recorded.
          </p>
        </section>
      </div>
    </main>
  );
}