"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CreditCard,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock3,
  Receipt,
  ChevronRight,
} from "lucide-react";

import api from "@/lib/api";

export default function ParentChildFees({ studentId }) {
  const [student, setStudent] = useState(null);
  const [feeAccounts, setFeeAccounts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const [error, setError] = useState("");
  const [paymentError, setPaymentError] = useState("");

  const [selectedFeeAccount, setSelectedFeeAccount] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState("");

  const fetchFees = async () => {
    if (!studentId) return;

    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `/parents/children/${studentId}/fees`
      );

      setStudent(response.data.student);
      setFeeAccounts(response.data.feeAccounts || []);
    } catch (err) {
      console.error("Failed to fetch child fees:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load fee information."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFees();
  }, [studentId]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(Number(amount || 0));
  };

  const formatDate = (date) => {
    if (!date) return "Not available";

    return new Date(date).toLocaleDateString("en-NG", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getFullName = () => {
    if (!student) return "";

    return [
      student.firstName,
      student.middleName,
      student.lastName,
    ]
      .filter(Boolean)
      .join(" ");
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case "paid":
        return {
          label: "Paid",
          className: "bg-emerald-50 text-emerald-700",
        };

      case "partial":
        return {
          label: "Partially Paid",
          className: "bg-amber-50 text-amber-700",
        };

      case "unpaid":
        return {
          label: "Unpaid",
          className: "bg-red-50 text-red-700",
        };

      default:
        return {
          label: status || "Unknown",
          className: "bg-slate-100 text-slate-600",
        };
    }
  };

  const openPaymentModal = (feeAccount) => {
    if (!feeAccount || Number(feeAccount.balance) <= 0) {
      return;
    }

    setSelectedFeeAccount(feeAccount);
    setPaymentAmount(String(feeAccount.balance));
    setPaymentError("");
  };

  const closePaymentModal = () => {
    if (paymentLoading) return;

    setSelectedFeeAccount(null);
    setPaymentAmount("");
    setPaymentError("");
  };

  const handleAmountChange = (event) => {
    const value = event.target.value;

    if (!/^\d*\.?\d*$/.test(value)) {
      return;
    }

    setPaymentAmount(value);
  };

  const handlePayment = async () => {
    if (!selectedFeeAccount) return;

    const amount = Number(paymentAmount);
    const balance = Number(selectedFeeAccount.balance || 0);

    if (!Number.isFinite(amount) || amount <= 0) {
      setPaymentError("Please enter a valid payment amount.");
      return;
    }

    if (amount > balance) {
      setPaymentError(
        `Payment cannot exceed the outstanding balance of ${formatCurrency(
          balance
        )}.`
      );
      return;
    }

    try {
      setPaymentLoading(true);
      setPaymentError("");

      const response = await api.post(
        "/parent-payments/school-fees/initialize",
        {
          studentFeeAccountId: selectedFeeAccount._id,
          amount,
        }
      );

      const authorizationUrl = response.data?.authorizationUrl;

      if (!authorizationUrl) {
        throw new Error(
          "Paystack authorization URL was not returned."
        );
      }

      /*
       * The backend supplies the Paystack callback URL.
       * Paystack will redirect the parent to the callback page
       * after the payment is completed.
       */
      window.location.href = authorizationUrl;
    } catch (err) {
      console.error("Failed to initialize payment:", err);

      setPaymentError(
        err.response?.data?.message ||
          err.message ||
          "Unable to initialize payment."
      );

      setPaymentLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin" />

          <span className="text-sm">
            Loading fee information...
          </span>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-2xl border border-red-100 bg-white p-6 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
            <AlertCircle className="h-6 w-6 text-red-500" />
          </div>

          <h1 className="text-lg font-semibold text-slate-900">
            Unable to load fees
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            {error}
          </p>
        </div>
      </main>
    );
  }

  const totalDue = feeAccounts.reduce(
    (sum, account) =>
      sum + Number(account.totalAmountDue || 0),
    0
  );

  const totalPaid = feeAccounts.reduce(
    (sum, account) =>
      sum + Number(account.amountPaid || 0),
    0
  );

  const totalBalance = feeAccounts.reduce(
    (sum, account) =>
      sum + Number(account.balance || 0),
    0
  );

  const overallProgress =
    totalDue > 0
      ? Math.min((totalPaid / totalDue) * 100, 100)
      : 0;

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href={`/dashboard/parent/children/${studentId}`}
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Child Overview
          </Link>

          <p className="text-sm font-medium text-emerald-600">
            School Fees
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {getFullName()}
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Student ID: {student?.studentId}
          </p>
        </div>

        {paymentError && !selectedFeeAccount && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 px-5 py-4">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

            <p className="text-sm text-red-700">
              {paymentError}
            </p>
          </div>
        )}

        {/* Summary */}
        <section className="grid gap-4 sm:grid-cols-3">
          <SummaryCard
            title="Total Fees"
            value={formatCurrency(totalDue)}
            icon={CreditCard}
            iconClass="bg-blue-50 text-blue-600"
          />

          <SummaryCard
            title="Amount Paid"
            value={formatCurrency(totalPaid)}
            icon={CheckCircle2}
            iconClass="bg-emerald-50 text-emerald-600"
          />

          <SummaryCard
            title="Outstanding"
            value={formatCurrency(totalBalance)}
            icon={Receipt}
            iconClass="bg-amber-50 text-amber-600"
          />
        </section>

        {/* Overall Progress */}
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-semibold text-slate-900">
                Payment Progress
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {formatCurrency(totalPaid)} paid of{" "}
                {formatCurrency(totalDue)}
              </p>
            </div>

            <span className="text-sm font-semibold text-slate-900">
              {Math.round(overallProgress)}%
            </span>
          </div>

          <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all"
              style={{
                width: `${overallProgress}%`,
              }}
            />
          </div>
        </section>

        {/* Fee Accounts */}
        <section className="mt-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-slate-900">
              Fee Accounts
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              View your child's school fees and make payments.
            </p>
          </div>

          {feeAccounts.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                <CreditCard className="h-6 w-6 text-slate-500" />
              </div>

              <h3 className="mt-4 font-semibold text-slate-900">
                No fee accounts yet
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                There are currently no school fee accounts
                for this student.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {feeAccounts.map((account) => {
                const status = getStatusStyles(account.status);

                const progress =
                  account.totalAmountDue > 0
                    ? Math.min(
                        (account.amountPaid /
                          account.totalAmountDue) *
                          100,
                        100
                      )
                    : 0;

                return (
                  <div
                    key={account._id}
                    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                  >
                    {/* Account Header */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">
                          {account.feeStructure?.name ||
                            "School Fees"}
                        </h3>

                        {account.feeStructure?.description && (
                          <p className="mt-1 text-sm text-slate-500">
                            {account.feeStructure.description}
                          </p>
                        )}

                        <div className="mt-3 flex flex-wrap gap-2">
                          {account.academicSession?.name && (
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                              {account.academicSession.name}
                            </span>
                          )}

                          {account.academicTerm?.name && (
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                              {account.academicTerm.name}
                            </span>
                          )}
                        </div>
                      </div>

                      <span
                        className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}
                      >
                        {status.label}
                      </span>
                    </div>

                    {/* Amounts */}
                    <div className="mt-6 grid gap-4 sm:grid-cols-3">
                      <AmountCard
                        label="Total Due"
                        value={formatCurrency(
                          account.totalAmountDue
                        )}
                      />

                      <AmountCard
                        label="Amount Paid"
                        value={formatCurrency(
                          account.amountPaid
                        )}
                      />

                      <AmountCard
                        label="Balance"
                        value={formatCurrency(
                          account.balance
                        )}
                        highlight={
                          Number(account.balance) > 0
                        }
                      />
                    </div>

                    {/* Progress */}
                    <div className="mt-6">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">
                          Payment progress
                        </span>

                        <span className="font-medium text-slate-700">
                          {Math.round(progress)}%
                        </span>
                      </div>

                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-emerald-500 transition-all"
                          style={{
                            width: `${progress}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Fee Breakdown */}
                    {account.feeStructure?.items?.length > 0 && (
                      <div className="mt-6 border-t border-slate-100 pt-5">
                        <h4 className="text-sm font-semibold text-slate-900">
                          Fee Breakdown
                        </h4>

                        <div className="mt-3 divide-y divide-slate-100">
                          {account.feeStructure.items.map(
                            (item, index) => (
                              <div
                                key={item._id || index}
                                className="flex items-center justify-between gap-4 py-3"
                              >
                                <span className="text-sm text-slate-600">
                                  {item.name}
                                </span>

                                <span className="text-sm font-medium text-slate-900">
                                  {formatCurrency(item.amount)}
                                </span>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                    {/* Account Footer */}
                    <div className="mt-6 flex flex-col gap-4 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                      <div className="text-sm text-slate-500">
                        <span>
                          Last updated:{" "}
                          {formatDate(account.updatedAt)}
                        </span>
                      </div>

                      {Number(account.balance) > 0 ? (
                        <button
                          type="button"
                          onClick={() =>
                            openPaymentModal(account)
                          }
                          disabled={paymentLoading}
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <CreditCard className="h-4 w-4" />
                          Pay Fees
                        </button>
                      ) : (
                        <div className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600">
                          <CheckCircle2 className="h-4 w-4" />
                          Fully Paid
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Payments Link */}
        <div className="mt-6">
          <Link
            href={`/dashboard/parent/children/${studentId}/payments`}
            className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50">
                <Receipt className="h-5 w-5 text-purple-600" />
              </div>

              <div>
                <h3 className="font-semibold text-slate-900">
                  Payment History
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  View all payments made for this student.
                </p>
              </div>
            </div>

            <ChevronRight className="h-5 w-5 text-slate-400 transition group-hover:translate-x-1" />
          </Link>
        </div>
      </div>

      {/* Payment Modal */}
      {selectedFeeAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50">
                  <CreditCard className="h-5 w-5 text-emerald-600" />
                </div>

                <h2 className="mt-4 text-xl font-bold text-slate-900">
                  Pay School Fees
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Enter the amount you want to pay.
                </p>
              </div>

              <button
                type="button"
                onClick={closePaymentModal}
                disabled={paymentLoading}
                className="text-2xl leading-none text-slate-400 transition hover:text-slate-700 disabled:opacity-50"
              >
                ×
              </button>
            </div>

            <div className="mt-6 rounded-2xl bg-slate-50 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">
                  Outstanding balance
                </span>

                <span className="font-semibold text-slate-900">
                  {formatCurrency(selectedFeeAccount.balance)}
                </span>
              </div>
            </div>

            <div className="mt-5">
              <label
                htmlFor="paymentAmount"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Payment amount
              </label>

              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-500">
                  ₦
                </span>

                <input
                  id="paymentAmount"
                  type="text"
                  inputMode="decimal"
                  value={paymentAmount}
                  onChange={handleAmountChange}
                  disabled={paymentLoading}
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-9 pr-4 text-sm font-medium text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-50"
                  placeholder="Enter amount"
                />
              </div>

              <button
                type="button"
                onClick={() =>
                  setPaymentAmount(
                    String(selectedFeeAccount.balance)
                  )
                }
                disabled={paymentLoading}
                className="mt-2 text-xs font-medium text-emerald-600 hover:text-emerald-700"
              >
                Pay full balance
              </button>
            </div>

            {paymentError && (
              <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 p-3">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />

                <p className="text-xs text-red-700">
                  {paymentError}
                </p>
              </div>
            )}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closePaymentModal}
                disabled={paymentLoading}
                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handlePayment}
                disabled={paymentLoading}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {paymentLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Connecting to Paystack...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4" />
                    Continue to Paystack
                  </>
                )}
              </button>
            </div>

            <div className="mt-5 flex items-center justify-center gap-2 text-xs text-slate-400">
              <Clock3 className="h-3.5 w-3.5" />

              You will be redirected to Paystack to complete
              your payment.
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function SummaryCard({
  title,
  value,
  icon: Icon,
  iconClass,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconClass}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <p className="mt-4 text-sm text-slate-500">
        {title}
      </p>

      <p className="mt-1 text-xl font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
}

function AmountCard({
  label,
  value,
  highlight = false,
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <p className="text-xs text-slate-500">
        {label}
      </p>

      <p
        className={`mt-1 text-lg font-bold ${
          highlight
            ? "text-amber-600"
            : "text-slate-900"
        }`}
      >
        {value}
      </p>
    </div>
  );
}