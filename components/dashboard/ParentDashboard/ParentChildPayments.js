"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  FileText,
  GraduationCap,
  Loader2,
  Receipt,
  XCircle,
  Clock3,
  Printer,
} from "lucide-react";

import api from "@/lib/api";

export default function ParentChildPayments({ studentId }) {
  const [student, setStudent] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!studentId) return;

    const fetchPayments = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          `/parents/children/${studentId}/payments`
        );

        setStudent(response.data?.student || null);
        setPayments(response.data?.payments || []);
      } catch (err) {
        console.error("Failed to fetch child payments:", err);

        setError(
          err.response?.data?.message ||
            "Failed to load payment history."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [studentId]);

  const totals = useMemo(() => {
    return payments.reduce(
      (acc, payment) => {
        if (payment.status === "successful") {
          acc.successfulAmount += Number(payment.amount || 0);
          acc.successfulCount += 1;
        }

        if (payment.status === "pending") {
          acc.pendingAmount += Number(payment.amount || 0);
          acc.pendingCount += 1;
        }

        return acc;
      },
      {
        successfulAmount: 0,
        successfulCount: 0,
        pendingAmount: 0,
        pendingCount: 0,
      }
    );
  }, [payments]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Number(amount || 0));
  };

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getStatusClasses = (status) => {
    switch (status) {
      case "successful":
        return "bg-emerald-50 text-emerald-700";

      case "pending":
        return "bg-amber-50 text-amber-700";

      case "failed":
        return "bg-red-50 text-red-700";

      case "cancelled":
        return "bg-slate-100 text-slate-600";

      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "successful":
        return <CheckCircle2 className="h-4 w-4" />;

      case "pending":
        return <Clock3 className="h-4 w-4" />;

      case "failed":
        return <XCircle className="h-4 w-4" />;

      case "cancelled":
        return <XCircle className="h-4 w-4" />;

      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "successful":
        return "Successful";

      case "pending":
        return "Pending";

      case "failed":
        return "Failed";

      case "cancelled":
        return "Cancelled";

      default:
        return status || "Unknown";
    }
  };

  const getPaymentMethodLabel = (payment) => {
    if (payment.paymentMethod === "bank_transfer") {
      return "Bank Transfer";
    }

    if (payment.paymentMethod === "paystack") {
      return "Paystack";
    }

    if (payment.paymentMethod === "cash") {
      return "Cash";
    }

    if (payment.paymentMethod === "pos") {
      return "POS";
    }

    if (payment.paymentMethod === "other") {
      return "Other";
    }

    return payment.paymentMethod || "—";
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="flex items-center gap-3 text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading payment history...</span>
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
                  Unable to load payments
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
                <span>Payments</span>
              </div>

              <h1 className="text-2xl font-bold text-white sm:text-3xl">
                {student
                  ? `${student.firstName} ${student.lastName}`
                  : "Payment History"}
              </h1>

              <p className="mt-2 text-sm text-slate-400">
                View your child's school fee payment history.
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
        {/* Summary */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <SummaryCard
            icon={<Receipt className="h-5 w-5" />}
            label="Total Payments"
            value={payments.length}
            iconClass="bg-blue-50 text-blue-600"
          />

          <SummaryCard
            icon={<CheckCircle2 className="h-5 w-5" />}
            label="Successful Payments"
            value={formatCurrency(totals.successfulAmount)}
            iconClass="bg-emerald-50 text-emerald-600"
          />

          <SummaryCard
            icon={<Clock3 className="h-5 w-5" />}
            label="Pending Payments"
            value={formatCurrency(totals.pendingAmount)}
            iconClass="bg-amber-50 text-amber-600"
          />
        </div>

        {/* Empty state */}
        {payments.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <Receipt className="mx-auto h-10 w-10 text-slate-300" />

            <h2 className="mt-4 text-lg font-semibold text-slate-900">
              No payments yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              No school fee payments have been recorded for this
              student yet.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-5">
              <div className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-slate-700" />

                <h2 className="font-semibold text-slate-900">
                  Payment History
                </h2>
              </div>

              <p className="mt-1 text-sm text-slate-500">
                All recorded school fee payments for this student.
              </p>
            </div>

            {/* Desktop */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-4 font-semibold">
                      Reference
                    </th>

                    <th className="px-5 py-4 font-semibold">
                      Amount
                    </th>

                    <th className="px-5 py-4 font-semibold">
                      Session / Term
                    </th>

                    <th className="px-5 py-4 font-semibold">
                      Method
                    </th>

                    <th className="px-5 py-4 font-semibold">
                      Date
                    </th>

                    <th className="px-5 py-4 font-semibold">
                      Status
                    </th>

                    <th className="px-5 py-4 text-right font-semibold">
                      Receipt
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {payments.map((payment) => (
                    <tr
                      key={payment._id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <p className="font-medium text-slate-800">
                          {payment.paymentReference}
                        </p>

                        {payment.paystackTransactionId && (
                          <p className="mt-1 text-xs text-slate-400">
                            Transaction:{" "}
                            {payment.paystackTransactionId}
                          </p>
                        )}
                      </td>

                      <td className="px-5 py-4 font-semibold text-slate-900">
                        {formatCurrency(payment.amount)}
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-medium text-slate-700">
                          {payment.academicSession?.name || "—"}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {payment.academicTerm?.name || "—"}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {getPaymentMethodLabel(payment)}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {formatDate(
                          payment.paidAt || payment.createdAt
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${getStatusClasses(
                            payment.status
                          )}`}
                        >
                          {getStatusIcon(payment.status)}
                          {getStatusLabel(payment.status)}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right">
                        {payment.status === "successful" ? (
                          <Link
                            href={`/dashboard/parent/children/${studentId}/payments/${payment._id}/receipt`}
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                          >
                            <Printer className="h-4 w-4" />
                            Receipt
                          </Link>
                        ) : (
                          <span className="text-xs text-slate-400">
                            —
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="divide-y divide-slate-100 md:hidden">
              {payments.map((payment) => (
                <div key={payment._id} className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-slate-900">
                        {formatCurrency(payment.amount)}
                      </p>

                      <p className="mt-1 break-all text-xs text-slate-500">
                        {payment.paymentReference}
                      </p>
                    </div>

                    <span
                      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${getStatusClasses(
                        payment.status
                      )}`}
                    >
                      {getStatusIcon(payment.status)}
                      {getStatusLabel(payment.status)}
                    </span>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-4">
                    <InfoItem
                      icon={<GraduationCap className="h-4 w-4" />}
                      label="Session"
                      value={
                        payment.academicSession?.name || "—"
                      }
                    />

                    <InfoItem
                      icon={<CalendarDays className="h-4 w-4" />}
                      label="Term"
                      value={
                        payment.academicTerm?.name || "—"
                      }
                    />

                    <InfoItem
                      icon={<CreditCard className="h-4 w-4" />}
                      label="Method"
                      value={getPaymentMethodLabel(payment)}
                    />

                    <InfoItem
                      icon={<CalendarDays className="h-4 w-4" />}
                      label="Date"
                      value={formatDate(
                        payment.paidAt || payment.createdAt
                      )}
                    />
                  </div>

                  {payment.paidAt && (
                    <p className="mt-4 text-xs text-slate-400">
                      Paid at {formatDateTime(payment.paidAt)}
                    </p>
                  )}

                  {payment.status === "successful" && (
                    <Link
                      href={`/dashboard/parent/children/${studentId}/payments/${payment._id}/receipt`}
                      className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      <Printer className="h-4 w-4" />
                      View & Print Receipt
                    </Link>
                  )}
                </div>
              ))}
            </div>
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
   Mobile Info Item
--------------------------------------------------------- */

function InfoItem({ icon, label, value }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-xs text-slate-400">
        {icon}
        <span>{label}</span>
      </div>

      <p className="mt-1 text-sm font-medium text-slate-700">
        {value}
      </p>
    </div>
  );
}