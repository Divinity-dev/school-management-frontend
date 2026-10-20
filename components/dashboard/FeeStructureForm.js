"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  Plus,
  Trash2,
  WalletCards,
} from "lucide-react";
import api from "@/lib/api";

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

const getClassName = (schoolClass) => {
  if (!schoolClass) return "Unknown class";

  return [schoolClass.name, schoolClass.arm, schoolClass.section]
    .filter(Boolean)
    .join(" ");
};

const createEmptyFeeItem = () => ({
  id: `${Date.now()}-${Math.random()}`,
  name: "",
  amount: "",
});

export default function FeeStructureForm({
  mode = "create",
  initialData = null,
  onSubmit,
  onCancel,
  submitting = false,
}) {
  const isEditMode = mode === "edit";

  const [sessions, setSessions] = useState([]);
  const [terms, setTerms] = useState([]);
  const [classes, setClasses] = useState([]);

  const [academicSession, setAcademicSession] = useState(
    initialData?.academicSession?._id ||
      initialData?.academicSession ||
      ""
  );

  const [academicTerm, setAcademicTerm] = useState(
    initialData?.academicTerm?._id ||
      initialData?.academicTerm ||
      ""
  );

  const [selectedClasses, setSelectedClasses] = useState(
    initialData?.schoolClasses?.map((schoolClass) =>
      typeof schoolClass === "object"
        ? schoolClass._id
        : schoolClass
    ) || []
  );

  const [items, setItems] = useState(
    initialData?.items?.length
      ? initialData.items.map((item) => ({
          id: item._id || `${Date.now()}-${Math.random()}`,
          name: item.name || "",
          amount:
            item.amount !== undefined && item.amount !== null
              ? String(item.amount)
              : "",
        }))
      : [createEmptyFeeItem()]
  );

  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingSessionData, setLoadingSessionData] = useState(false);
  const [error, setError] = useState("");

  // Load academic sessions
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoadingSessions(true);
        setError("");

        const response = await api.get("/academic-sessions");

        setSessions(response.data?.sessions || []);
      } catch (err) {
        console.error("Failed to fetch academic sessions:", err);

        setError(
          err.response?.data?.message ||
            "Unable to load academic sessions."
        );
      } finally {
        setLoadingSessions(false);
      }
    };

    fetchSessions();
  }, []);

  // Load terms and classes for selected session
  useEffect(() => {
    if (!academicSession) {
      setTerms([]);
      setClasses([]);

      if (!isEditMode) {
        setAcademicTerm("");
        setSelectedClasses([]);
      }

      return;
    }

    const fetchSessionData = async () => {
      try {
        setLoadingSessionData(true);
        setError("");

        const [termsResponse, classesResponse] = await Promise.all([
          api.get(`/academic-terms/session/${academicSession}`),
          api.get(`/classes/session/${academicSession}`),
        ]);

        setTerms(termsResponse.data?.terms || []);
        setClasses(classesResponse.data?.classes || []);
      } catch (err) {
        console.error("Failed to fetch session data:", err);

        setTerms([]);
        setClasses([]);

        setError(
          err.response?.data?.message ||
            "Unable to load terms and classes for this session."
        );
      } finally {
        setLoadingSessionData(false);
      }
    };

    fetchSessionData();
  }, [academicSession, isEditMode]);

  const totalAmount = useMemo(() => {
    return items.reduce((total, item) => {
      const amount = Number(item.amount);

      return total + (Number.isFinite(amount) && amount >= 0 ? amount : 0);
    }, 0);
  }, [items]);

  const selectedSession = sessions.find(
    (session) => session._id === academicSession
  );

  const selectedTerm = terms.find(
    (term) => term._id === academicTerm
  );

  const allClassesSelected =
    classes.length > 0 &&
    selectedClasses.length === classes.length;

  const handleSessionChange = (event) => {
    const sessionId = event.target.value;

    setAcademicSession(sessionId);
    setAcademicTerm("");
    setSelectedClasses([]);
  };

  const handleTermChange = (event) => {
    setAcademicTerm(event.target.value);
  };

  const toggleClass = (classId) => {
    setSelectedClasses((current) => {
      if (current.includes(classId)) {
        return current.filter((id) => id !== classId);
      }

      return [...current, classId];
    });
  };

  const toggleAllClasses = () => {
    if (allClassesSelected) {
      setSelectedClasses([]);
      return;
    }

    setSelectedClasses(classes.map((schoolClass) => schoolClass._id));
  };

  const addFeeItem = () => {
    setItems((current) => [
      ...current,
      createEmptyFeeItem(),
    ]);
  };

  const removeFeeItem = (id) => {
    setItems((current) => {
      if (current.length === 1) {
        return current;
      }

      return current.filter((item) => item.id !== id);
    });
  };

  const updateFeeItem = (id, field, value) => {
    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  };

  const validateForm = () => {
    if (!academicSession) {
      return "Please select an academic session.";
    }

    if (!academicTerm) {
      return "Please select an academic term.";
    }

    if (selectedClasses.length === 0) {
      return "Please select at least one class.";
    }

    if (items.length === 0) {
      return "Please add at least one fee item.";
    }

    for (const item of items) {
      if (!item.name.trim()) {
        return "Every fee item must have a name.";
      }

      if (
        item.amount === "" ||
        Number.isNaN(Number(item.amount)) ||
        Number(item.amount) < 0
      ) {
        return "Every fee item must have a valid non-negative amount.";
      }
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    const payload = {
      academicSession,
      academicTerm,
      schoolClasses: selectedClasses,
      items: items.map((item) => ({
        name: item.name.trim(),
        amount: Number(item.amount),
      })),
    };

    try {
      await onSubmit(payload);
    } catch (err) {
      console.error(
        `${isEditMode ? "Update" : "Create"} fee structure error:`,
        err
      );

      setError(
        err.response?.data?.message ||
          `Unable to ${
            isEditMode ? "update" : "create"
          } fee structure.`
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="mb-3 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition hover:text-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ArrowLeft size={16} />
          Back to Fees
        </button>

        <div className="flex items-center gap-2">
          <WalletCards
            size={22}
            className="text-emerald-600"
            strokeWidth={1.8}
          />

          <h1 className="text-2xl font-bold text-slate-800">
            {isEditMode
              ? "Edit Fee Structure"
              : "Create Fee Structure"}
          </h1>
        </div>

        <p className="mt-1 text-sm font-medium text-slate-500">
          {isEditMode
            ? "Update the fees configured for selected classes."
            : "Configure the fees payable by students in selected classes."}
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Academic Period */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5">
            <h2 className="text-base font-bold text-slate-800">
              Academic Period
            </h2>

            <p className="mt-1 text-xs font-medium text-slate-400">
              Select the academic session and term this fee structure belongs
              to.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* Session */}
            <div>
              <label
                htmlFor="academicSession"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Academic Session
              </label>

              <div className="relative">
                <select
                  id="academicSession"
                  value={academicSession}
                  onChange={handleSessionChange}
                  disabled={loadingSessions || submitting}
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 pr-10 text-sm font-medium text-slate-700 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <option value="">
                    {loadingSessions
                      ? "Loading sessions..."
                      : "Select academic session"}
                  </option>

                  {sessions.map((session) => (
                    <option
                      key={session._id}
                      value={session._id}
                      disabled={!session.isActive}
                    >
                      {session.name}
                      {session.isCurrent ? " — Current" : ""}
                      {!session.isActive ? " — Inactive" : ""}
                    </option>
                  ))}
                </select>

                <ChevronDown
                  size={17}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>

              {selectedSession && (
                <p className="mt-2 text-xs font-medium text-slate-400">
                  {new Date(
                    selectedSession.startDate
                  ).toLocaleDateString("en-NG")}{" "}
                  —{" "}
                  {new Date(
                    selectedSession.endDate
                  ).toLocaleDateString("en-NG")}
                </p>
              )}
            </div>

            {/* Term */}
            <div>
              <label
                htmlFor="academicTerm"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Academic Term
              </label>

              <div className="relative">
                <select
                  id="academicTerm"
                  value={academicTerm}
                  onChange={handleTermChange}
                  disabled={
                    !academicSession ||
                    loadingSessionData ||
                    submitting
                  }
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 pr-10 text-sm font-medium text-slate-700 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <option value="">
                    {!academicSession
                      ? "Select a session first"
                      : loadingSessionData
                      ? "Loading terms..."
                      : terms.length === 0
                      ? "No terms available"
                      : "Select academic term"}
                  </option>

                  {terms.map((term) => (
                    <option
                      key={term._id}
                      value={term._id}
                      disabled={!term.isActive}
                    >
                      {term.name}
                      {term.isCurrent ? " — Current" : ""}
                      {!term.isActive ? " — Inactive" : ""}
                    </option>
                  ))}
                </select>

                <ChevronDown
                  size={17}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>

              {selectedTerm?.isCurrent && (
                <p className="mt-2 text-xs font-semibold text-emerald-600">
                  This is the current academic term.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Classes */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-800">
                Classes
              </h2>

              <p className="mt-1 text-xs font-medium text-slate-400">
                Select the classes that will use this fee structure.
              </p>
            </div>

            {classes.length > 0 && (
              <button
                type="button"
                onClick={toggleAllClasses}
                disabled={loadingSessionData || submitting}
                className="text-left text-xs font-bold text-emerald-600 transition hover:text-emerald-700 disabled:opacity-50 sm:text-right"
              >
                {allClassesSelected ? "Clear all" : "Select all"}
              </button>
            )}
          </div>

          {!academicSession ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center">
              <p className="text-sm font-medium text-slate-400">
                Select an academic session to view its classes.
              </p>
            </div>
          ) : loadingSessionData ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-8 text-center">
              <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-600" />

              <p className="mt-3 text-sm font-medium text-slate-400">
                Loading classes...
              </p>
            </div>
          ) : classes.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center">
              <p className="text-sm font-semibold text-slate-600">
                No active classes found
              </p>

              <p className="mt-1 text-xs font-medium text-slate-400">
                Create an active class for this academic session before
                creating a fee structure.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {classes.map((schoolClass) => {
                const selected = selectedClasses.includes(
                  schoolClass._id
                );

                return (
                  <button
                    key={schoolClass._id}
                    type="button"
                    onClick={() => toggleClass(schoolClass._id)}
                    disabled={submitting}
                    className={`flex items-center gap-3 rounded-xl border p-4 text-left transition ${
                      selected
                        ? "border-emerald-400 bg-emerald-50"
                        : "border-slate-200 bg-slate-50 hover:border-emerald-200 hover:bg-white"
                    }`}
                  >
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${
                        selected
                          ? "border-emerald-600 bg-emerald-600 text-white"
                          : "border-slate-300 bg-white text-transparent"
                      }`}
                    >
                      <Check size={13} strokeWidth={3} />
                    </span>

                    <span className="min-w-0">
                      <span
                        className={`block truncate text-sm font-bold ${
                          selected
                            ? "text-emerald-800"
                            : "text-slate-700"
                        }`}
                      >
                        {getClassName(schoolClass)}
                      </span>

                      <span className="mt-0.5 block text-[11px] font-medium text-slate-400">
                        {schoolClass.section || "—"}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {selectedClasses.length > 0 && (
            <p className="mt-4 text-xs font-semibold text-emerald-600">
              {selectedClasses.length}{" "}
              {selectedClasses.length === 1 ? "class" : "classes"} selected
            </p>
          )}
        </div>

        {/* Fee Items */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <h2 className="text-base font-bold text-slate-800">
                Fee Items
              </h2>

              <p className="mt-1 text-xs font-medium text-slate-400">
                Add each fee students are required to pay.
              </p>
            </div>

            <button
              type="button"
              onClick={addFeeItem}
              disabled={submitting}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-50"
            >
              <Plus size={15} />
              Add Fee Item
            </button>
          </div>

          <div className="space-y-4 p-5 sm:p-6">
            {items.map((item, index) => (
              <div
                key={item.id}
                className="rounded-xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    Fee Item {index + 1}
                  </p>

                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeFeeItem(item.id)}
                      disabled={submitting}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-red-500 transition hover:text-red-600 disabled:opacity-50"
                    >
                      <Trash2 size={14} />
                      Remove
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_220px]">
                  <div>
                    <label
                      htmlFor={`fee-name-${item.id}`}
                      className="mb-2 block text-xs font-semibold text-slate-600"
                    >
                      Fee Name
                    </label>

                    <input
                      id={`fee-name-${item.id}`}
                      type="text"
                      value={item.name}
                      onChange={(event) =>
                        updateFeeItem(
                          item.id,
                          "name",
                          event.target.value
                        )
                      }
                      placeholder="e.g. Tuition"
                      disabled={submitting}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 disabled:opacity-60"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor={`fee-amount-${item.id}`}
                      className="mb-2 block text-xs font-semibold text-slate-600"
                    >
                      Amount (₦)
                    </label>

                    <input
                      id={`fee-amount-${item.id}`}
                      type="number"
                      min="0"
                      step="1"
                      value={item.amount}
                      onChange={(event) =>
                        updateFeeItem(
                          item.id,
                          "amount",
                          event.target.value
                        )
                      }
                      placeholder="0"
                      disabled={submitting}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 disabled:opacity-60"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="border-t border-slate-100 bg-slate-50/70 px-5 py-5 sm:px-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Total Fee
                </p>

                <p className="mt-1 text-xs font-medium text-slate-400">
                  Calculated from all fee items.
                </p>
              </div>

              <p className="text-xl font-bold text-slate-800 sm:text-2xl">
                {formatCurrency(totalAmount)}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={
              submitting ||
              loadingSessions ||
              loadingSessionData ||
              classes.length === 0
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                {isEditMode ? "Updating..." : "Creating..."}
              </>
            ) : (
              <>
                <Check size={17} />
                {isEditMode
                  ? "Update Fee Structure"
                  : "Create Fee Structure"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

