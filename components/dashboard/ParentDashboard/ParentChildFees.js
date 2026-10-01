"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  FileText,
  GraduationCap,
  Loader2,
  Wallet,
} from "lucide-react";

import api from "@/lib/api";

export default function ParentChildFees({ studentId }) {
  const [student, setStudent] = useState(null);
  const [feeAccounts, setFeeAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!studentId) return;

    const fetchFees = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          `/parents/children/${studentId}/fees`
        );

        setStudent(response.data?.student || null);
        setFeeAccounts(response.data?.feeAccounts || []);
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

    fetchFees();
  }, [studentId]);

  const totals = useMemo(() => {
    return feeAccounts.reduce(
      (acc, account) => {
        acc.totalDue += Number(account.totalAmountDue || 0);
        acc.amountPaid += Number(account.amountPaid || 0);
        acc.balance += Number(account.balance || 0);

        return acc;
      },
      {
        totalDue: 0,
        amountPaid: 0,
        balance: 0,
      }
    );
  }, [feeAccounts]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Number(amount || 0));
  };

  const getStatusClasses = (status) => {
    switch (status) {
      case "paid":
        return "bg-emerald-50 text-emerald-700";

      case "partial":
        return "bg-amber-50 text-amber-700";

      case "unpaid":
        return "bg-red-50 text-red-700";

      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "paid":
        return "Paid";

      case "partial":
        return "Partially Paid";

      case "unpaid":
        return "Unpaid";

      default:
        return status || "Unknown";
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="flex items-center gap-3 text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading fee information...</span>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-red-100 bg-red-50 p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 text-red-600" />

              <div>
                <h2 className="font-semibold text-red-800">
                  Unable to load fees
                </h2>

                <p className="mt-1 text-sm text-red-700">
                  {error}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <section className="bg-slate-900">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2 text-sm text-slate-400">
                <GraduationCap className="h-4 w-4" />
                <span>Parent Portal</span>
                <span>/</span>
                <span>Fees</span>
              </div>

              <h1 className="text-2xl font-bold text-white sm:text-3xl">
                {student
                  ? `${student.firstName} ${student.lastName}`
                  : "Student Fees"}
              </h1>

              <p className="mt-2 text-sm text-slate-400">
                View your child's school fees and payment balance.
              </p>
            </div>

            {student?.studentId && (
              <div className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-3">
                <p className="text-xs text-slate-400">
                  Student ID
                </p>

                <p className="mt-1 font-semibold text-white">
                  {student.studentId}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Summary cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <SummaryCard
            icon={<FileText className="h-5 w-5" />}
            label="Total Fees"
            value={formatCurrency(totals.totalDue)}
            iconClass="bg-blue-50 text-blue-600"
          />

          <SummaryCard
            icon={<CheckCircle2 className="h-5 w-5" />}
            label="Amount Paid"
            value={formatCurrency(totals.amountPaid)}
            iconClass="bg-emerald-50 text-emerald-600"
          />

          <SummaryCard
            icon={<Wallet className="h-5 w-5" />}
            label="Outstanding Balance"
            value={formatCurrency(totals.balance)}
            iconClass="bg-amber-50 text-amber-600"
          />
        </div>

        {/* No fee accounts */}
        {feeAccounts.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <FileText className="mx-auto h-10 w-10 text-slate-300" />

            <h2 className="mt-4 text-lg font-semibold text-slate-900">
              No fee records found
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              There are currently no active fee records for this
              student.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {feeAccounts.map((account) => (
              <FeeAccountCard
                key={account._id}
                account={account}
                formatCurrency={formatCurrency}
                getStatusClasses={getStatusClasses}
                getStatusLabel={getStatusLabel}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

/* ---------------------------------------------------------
   Summary Card
--------------------------------------------------------- */

function SummaryCard({
  icon,
  label,
  value,
  iconClass,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {label}
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {value}
          </p>
        </div>

        <div className={`rounded-xl p-3 ${iconClass}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   Fee Account Card
--------------------------------------------------------- */

function FeeAccountCard({
  account,
  formatCurrency,
  getStatusClasses,
  getStatusLabel,
}) {
  const feeStructure = account.feeStructure;
  const academicSession = account.academicSession;
  const academicTerm = account.academicTerm;

  const totalDue = Number(account.totalAmountDue || 0);
  const amountPaid = Number(account.amountPaid || 0);
  const balance = Number(account.balance || 0);

  const paymentPercentage =
    totalDue > 0
      ? Math.min(
          100,
          Math.round((amountPaid / totalDue) * 100)
        )
      : 0;

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Fee header */}
      <div className="border-b border-slate-200 p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-slate-100 p-3">
                <CreditCard className="h-5 w-5 text-slate-700" />
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {feeStructure?.name || "School Fees"}
                </h2>

                {feeStructure?.description && (
                  <p className="mt-1 text-sm text-slate-500">
                    {feeStructure.description}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-500">
              {academicSession?.name && (
                <span className="inline-flex items-center gap-1.5">
                  <GraduationCap className="h-4 w-4" />
                  {academicSession.name}
                </span>
              )}

              {academicTerm?.name && (
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="h-4 w-4" />
                  {academicTerm.name}
                </span>
              )}
            </div>
          </div>

          <span
            className={`inline-flex w-fit rounded-full px-3 py-1.5 text-xs font-semibold ${getStatusClasses(
              account.status
            )}`}
          >
            {getStatusLabel(account.status)}
          </span>
        </div>
      </div>

      {/* Fee breakdown */}
      {feeStructure?.items?.length > 0 && (
        <div className="border-b border-slate-200 p-5 sm:p-6">
          <h3 className="mb-4 font-semibold text-slate-900">
            Fee Breakdown
          </h3>

          <div className="divide-y divide-slate-100 rounded-xl border border-slate-200">
            {feeStructure.items.map((item, index) => (
              <div
                key={item._id || `${item.name}-${index}`}
                className="flex items-center justify-between gap-4 px-4 py-4"
              >
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    {item.name}
                  </p>

                  {item.description && (
                    <p className="mt-1 text-xs text-slate-500">
                      {item.description}
                    </p>
                  )}
                </div>

                <p className="whitespace-nowrap text-sm font-semibold text-slate-900">
                  {formatCurrency(item.amount)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment summary */}
      <div className="p-5 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <AmountBox
            label="Total Due"
            value={formatCurrency(totalDue)}
          />

          <AmountBox
            label="Amount Paid"
            value={formatCurrency(amountPaid)}
          />

          <AmountBox
            label="Balance"
            value={formatCurrency(balance)}
            highlight
          />
        </div>

        {/* Progress */}
        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium text-slate-600">
              Payment Progress
            </span>

            <span className="font-semibold text-slate-900">
              {paymentPercentage}%
            </span>
          </div>

          <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all"
              style={{
                width: `${paymentPercentage}%`,
              }}
            />
          </div>
        </div>

        {balance > 0 && (
          <div className="mt-6 rounded-xl border border-amber-100 bg-amber-50 p-4">
            <div className="flex items-start gap-3">
              <Wallet className="mt-0.5 h-5 w-5 text-amber-600" />

              <div>
                <p className="text-sm font-semibold text-amber-800">
                  Outstanding balance
                </p>

                <p className="mt-1 text-sm leading-6 text-amber-700">
                  There is an outstanding balance of{" "}
                  <span className="font-semibold">
                    {formatCurrency(balance)}
                  </span>{" "}
                  for this fee account.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/* ---------------------------------------------------------
   Amount Box
--------------------------------------------------------- */

function AmountBox({
  label,
  value,
  highlight = false,
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        highlight
          ? "border-amber-200 bg-amber-50"
          : "border-slate-200 bg-slate-50"
      }`}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p
        className={`mt-2 text-xl font-bold ${
          highlight ? "text-amber-700" : "text-slate-900"
        }`}
      >
        {value}
      </p>
    </div>
  );
}