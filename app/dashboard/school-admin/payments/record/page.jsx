"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Banknote,
  CreditCard,
  Loader2,
  Save,
  Search,
  User,
  WalletCards,
} from "lucide-react";
import api from "@/lib/api";

const paymentMethods = [
  {
    value: "cash",
    label: "Cash",
    icon: Banknote,
  },
  {
    value: "bank_transfer",
    label: "Bank Transfer",
    icon: CreditCard,
  },
  {
    value: "pos",
    label: "POS",
    icon: CreditCard,
  },
  {
    value: "other",
    label: "Other",
    icon: WalletCards,
  },
];

const formatCurrency = (amount) => {
  return `₦${Number(amount || 0).toLocaleString("en-NG")}`;
};

const getStudentName = (student) => {
  if (!student) return "Unknown Student";

  return [
    student.firstName,
    student.middleName,
    student.lastName,
  ]
    .filter(Boolean)
    .join(" ");
};

const getClassName = (student) => {
  const schoolClass = student?.schoolClass;

  if (!schoolClass) return "—";

  if (typeof schoolClass === "string") {
    return schoolClass;
  }

  return [
    schoolClass.name,
    schoolClass.arm,
    schoolClass.section,
  ]
    .filter(Boolean)
    .join(" ");
};

export default function RecordOfflinePaymentPage() {
  const router = useRouter();

  const [feeAccounts, setFeeAccounts] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [search, setSearch] = useState("");

  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [note, setNote] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchFeeAccounts = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          "/student-fee-accounts",
          {
            params: {
              isActive: true,
            },
          }
        );

        setFeeAccounts(
          response.data?.studentFeeAccounts || []
        );
      } catch (err) {
        console.error(
          "Failed to load student fee accounts:",
          err
        );

        setError(
          err.response?.data?.message ||
            "Failed to load student fee accounts."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchFeeAccounts();
  }, []);

  const filteredAccounts = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return feeAccounts;
    }

    return feeAccounts.filter((account) => {
      const student = account.student;

      const studentName = getStudentName(student).toLowerCase();

      const studentId = String(
        student?.studentId || ""
      ).toLowerCase();

      return (
        studentName.includes(query) ||
        studentId.includes(query)
      );
    });
  }, [feeAccounts, search]);

  const selectedAccount = useMemo(() => {
    return feeAccounts.find(
      (account) => account._id === selectedAccountId
    );
  }, [feeAccounts, selectedAccountId]);

  const outstandingBalance = Number(
    selectedAccount?.balance || 0
  );

  const enteredAmount = Number(amount || 0);

  const amountError = useMemo(() => {
    if (!selectedAccount || !amount) {
      return "";
    }

    if (
      !Number.isFinite(enteredAmount) ||
      enteredAmount <= 0
    ) {
      return "Enter a valid payment amount.";
    }

    if (enteredAmount > outstandingBalance) {
      return `Payment cannot exceed the outstanding balance of ${formatCurrency(
        outstandingBalance
      )}.`;
    }

    return "";
  }, [
    selectedAccount,
    amount,
    enteredAmount,
    outstandingBalance,
  ]);

  const canSubmit =
    selectedAccount &&
    enteredAmount > 0 &&
    enteredAmount <= outstandingBalance &&
    !amountError &&
    !submitting;

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedAccount) {
      setError("Please select a student fee account.");
      return;
    }

    if (
      !Number.isFinite(enteredAmount) ||
      enteredAmount <= 0
    ) {
      setError("Please enter a valid payment amount.");
      return;
    }

    if (enteredAmount > outstandingBalance) {
      setError(
        `Payment cannot exceed the outstanding balance of ${formatCurrency(
          outstandingBalance
        )}.`
      );
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const response = await api.post(
        "/payments/school-fees/offline",
        {
          studentFeeAccountId: selectedAccount._id,
          amount: enteredAmount,
          paymentMethod,
          note: note.trim(),
        }
      );

      const createdPayment = response.data?.payment;

      if (createdPayment?._id) {
        router.push(
          `/dashboard/school-admin/payments/${createdPayment._id}`
        );
      } else {
        router.push(
          "/dashboard/school-admin/payments"
        );
      }
    } catch (err) {
      console.error(
        "Failed to record offline payment:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to record offline payment."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-4xl space-y-6">

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <button
              type="button"
              onClick={() =>
                router.push(
                  "/dashboard/school-admin/payments"
                )
              }
              className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Payments
            </button>

            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Record Offline Payment
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Record a cash, bank transfer, POS, or other
              offline school fee payment.
            </p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* Student Fee Account */}
          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5">
              <h2 className="text-base font-semibold text-gray-900">
                Student Fee Account
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Select the student whose school fees you are
                recording.
              </p>
            </div>

            <div className="space-y-4">

              {/* Search */}
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search by student name or student ID..."
                  className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              {/* Account Selector */}
              {loading ? (
                <div className="flex items-center justify-center rounded-xl border border-gray-200 bg-gray-50 py-10">
                  <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />

                  <span className="ml-2 text-sm text-gray-500">
                    Loading fee accounts...
                  </span>
                </div>
              ) : filteredAccounts.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-5 py-10 text-center">
                  <User className="mx-auto h-8 w-8 text-gray-400" />

                  <p className="mt-3 text-sm font-medium text-gray-700">
                    No student fee accounts found
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    Create student fee accounts before recording
                    payments.
                  </p>
                </div>
              ) : (
                <div className="max-h-72 space-y-2 overflow-y-auto rounded-xl border border-gray-200 p-2">
                  {filteredAccounts.map((account) => {
                    const student = account.student;

                    const isSelected =
                      account._id === selectedAccountId;

                    return (
                      <button
                        key={account._id}
                        type="button"
                        onClick={() => {
                          setSelectedAccountId(
                            account._id
                          );
                          setAmount("");
                          setError("");
                        }}
                        className={`w-full rounded-xl border p-4 text-left transition ${
                          isSelected
                            ? "border-emerald-500 bg-emerald-50"
                            : "border-transparent bg-gray-50 hover:border-gray-200 hover:bg-white"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-gray-900">
                              {getStudentName(student)}
                            </p>

                            <p className="mt-1 text-xs text-gray-500">
                              {student?.studentId ||
                                "No ID"}
                            </p>

                            <p className="mt-1 text-xs text-gray-500">
                              {getClassName(student)}
                            </p>
                          </div>

                          <div className="shrink-0 text-right">
                            <p className="text-xs text-gray-500">
                              Outstanding
                            </p>

                            <p className="mt-1 font-semibold text-gray-900">
                              {formatCurrency(
                                account.balance
                              )}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          {/* Selected Account Summary */}
          {selectedAccount && (
            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5">
                <h2 className="text-base font-semibold text-gray-900">
                  Fee Account Summary
                </h2>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Total Due
                  </p>

                  <p className="mt-2 text-lg font-bold text-gray-900">
                    {formatCurrency(
                      selectedAccount.totalAmountDue
                    )}
                  </p>
                </div>

                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Amount Paid
                  </p>

                  <p className="mt-2 text-lg font-bold text-gray-900">
                    {formatCurrency(
                      selectedAccount.amountPaid
                    )}
                  </p>
                </div>

                <div className="rounded-xl bg-emerald-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">
                    Outstanding
                  </p>

                  <p className="mt-2 text-lg font-bold text-emerald-700">
                    {formatCurrency(
                      selectedAccount.balance
                    )}
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-4 border-t border-gray-100 pt-5 sm:grid-cols-3">
                <div>
                  <p className="text-xs text-gray-500">
                    Student
                  </p>

                  <p className="mt-1 text-sm font-medium text-gray-900">
                    {getStudentName(
                      selectedAccount.student
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">
                    Academic Session
                  </p>

                  <p className="mt-1 text-sm font-medium text-gray-900">
                    {selectedAccount.academicSession
                      ?.name || "—"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">
                    Academic Term
                  </p>

                  <p className="mt-1 text-sm font-medium text-gray-900">
                    {selectedAccount.academicTerm
                      ?.name || "—"}
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* Payment Details */}
          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5">
              <h2 className="text-base font-semibold text-gray-900">
                Payment Details
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Enter the amount received and how it was
                received.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">

              {/* Amount */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Amount
                </label>

                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                    ₦
                  </span>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={amount}
                    onChange={(event) => {
                      setAmount(event.target.value);
                      setError("");
                    }}
                    disabled={!selectedAccount}
                    placeholder="0.00"
                    className="w-full rounded-xl border border-gray-300 py-3 pl-8 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-gray-100"
                  />
                </div>

                {selectedAccount && (
                  <p className="mt-2 text-xs text-gray-500">
                    Maximum payment:{" "}
                    <span className="font-medium text-gray-700">
                      {formatCurrency(
                        selectedAccount.balance
                      )}
                    </span>
                  </p>
                )}

                {amountError && (
                  <p className="mt-2 text-xs text-red-600">
                    {amountError}
                  </p>
                )}
              </div>

              {/* Payment Method */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Payment Method
                </label>

                <select
                  value={paymentMethod}
                  onChange={(event) =>
                    setPaymentMethod(event.target.value)
                  }
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                >
                  {paymentMethods.map((method) => (
                    <option
                      key={method.value}
                      value={method.value}
                    >
                      {method.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Note */}
              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Note
                  <span className="ml-1 font-normal text-gray-400">
                    (optional)
                  </span>
                </label>

                <textarea
                  value={note}
                  onChange={(event) =>
                    setNote(event.target.value)
                  }
                  rows={4}
                  placeholder="Add any relevant payment note..."
                  className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>
            </div>
          </section>

          {/* Actions */}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() =>
                router.push(
                  "/dashboard/school-admin/payments"
                )
              }
              disabled={submitting}
              className="rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!canSubmit}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Recording Payment...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Record Payment
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

