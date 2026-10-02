"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  GraduationCap,
  Loader2,
  Printer,
  Receipt,
} from "lucide-react";

import api from "@/lib/api";

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
    month: "long",
    year: "numeric",
  });
};

const formatDateTime = (date) => {
  if (!date) return "—";

  return new Date(date).toLocaleString("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
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

export default function ParentPaymentReceiptPage() {
  const { id, paymentId } = useParams();

  const [student, setStudent] = useState(null);
  const [payment, setPayment] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id || !paymentId) return;

    const fetchPayment = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          `/parents/children/${id}/payments`
        );

        const payments = Array.isArray(
          response.data?.payments
        )
          ? response.data.payments
          : [];

        const selectedPayment = payments.find(
          (item) => item._id === paymentId
        );

        if (!selectedPayment) {
          setError("Payment receipt could not be found.");
          return;
        }

        if (selectedPayment.status !== "successful") {
          setError(
            "A receipt is only available for successful payments."
          );
          return;
        }

        setStudent(response.data?.student || null);
        setPayment(selectedPayment);
      } catch (err) {
        console.error(
          "Failed to load payment receipt:",
          err
        );

        setError(
          err.response?.data?.message ||
            "Failed to load payment receipt."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPayment();
  }, [id, paymentId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-100">
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="flex items-center gap-3 text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading receipt...</span>
          </div>
        </div>
      </main>
    );
  }

  if (error || !payment) {
    return (
      <main className="min-h-screen bg-slate-100 px-4 py-10">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <h1 className="font-semibold text-red-800">
              Unable to load receipt
            </h1>

            <p className="mt-2 text-sm text-red-700">
              {error || "Receipt not found."}
            </p>

            <Link
              href={`/dashboard/parent/children/${id}/payments`}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Payments
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const feeAccount = payment.studentFeeAccount;

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 sm:px-6 lg:px-8 print:bg-white print:p-0">
      {/* Actions */}
      <div className="mx-auto mb-6 flex max-w-3xl items-center justify-between print:hidden">
        <Link
          href={`/dashboard/parent/children/${id}/payments`}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Payments
        </Link>

        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
        >
          <Printer className="h-4 w-4" />
          Print Receipt
        </button>
      </div>

      {/* Receipt */}
      <article className="mx-auto max-w-3xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm print:max-w-none print:rounded-none print:border-0 print:shadow-none">
        {/* Receipt Header */}
        <div className="border-b border-slate-200 px-6 py-8 sm:px-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-white">
                  <GraduationCap className="h-6 w-6" />
                </div>

                <div>
                  <p className="text-xl font-bold tracking-tight text-slate-900">
                    School Fee Receipt
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Official payment receipt
                  </p>
                </div>
              </div>
            </div>

            <div className="sm:text-right">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                <CheckCircle2 className="h-4 w-4" />
                PAYMENT SUCCESSFUL
              </div>

              <p className="mt-3 text-xs text-slate-400">
                Receipt date
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-700">
                {formatDate(payment.paidAt || payment.createdAt)}
              </p>
            </div>
          </div>
        </div>

        {/* Amount */}
        <div className="bg-slate-900 px-6 py-8 text-white sm:px-10">
          <p className="text-sm text-slate-400">
            Amount Paid
          </p>

          <p className="mt-2 text-4xl font-bold tracking-tight">
            {formatCurrency(payment.amount)}
          </p>

          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-400">
            <span>
              Reference:{" "}
              <span className="font-medium text-slate-200">
                {payment.paymentReference}
              </span>
            </span>

            {payment.paystackTransactionId && (
              <span>
                Transaction:{" "}
                <span className="font-medium text-slate-200">
                  {payment.paystackTransactionId}
                </span>
              </span>
            )}
          </div>
        </div>

        {/* Student Information */}
        <div className="px-6 py-8 sm:px-10">
          <SectionTitle
            icon={<GraduationCap className="h-4 w-4" />}
            title="Student Information"
          />

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <ReceiptField
              label="Student Name"
              value={`${student?.firstName || ""} ${
                student?.middleName || ""
              } ${student?.lastName || ""}`.replace(
                /\s+/g,
                " "
              ).trim()}
            />

            <ReceiptField
              label="Student ID"
              value={student?.studentId || "—"}
            />

            <ReceiptField
              label="Academic Session"
              value={
                payment.academicSession?.name || "—"
              }
            />

            <ReceiptField
              label="Academic Term"
              value={
                payment.academicTerm?.name || "—"
              }
            />
          </div>
        </div>

        {/* Payment Information */}
        <div className="border-t border-slate-100 px-6 py-8 sm:px-10">
          <SectionTitle
            icon={<CreditCard className="h-4 w-4" />}
            title="Payment Information"
          />

          <div className="mt-5 divide-y divide-slate-100 rounded-2xl border border-slate-200">
            <ReceiptRow
              label="Payment Reference"
              value={payment.paymentReference}
            />

            <ReceiptRow
              label="Payment Method"
              value={getPaymentMethodLabel(payment)}
            />

            <ReceiptRow
              label="Payment Date"
              value={formatDate(
                payment.paidAt || payment.createdAt
              )}
            />

            <ReceiptRow
              label="Payment Time"
              value={formatDateTime(
                payment.paidAt || payment.createdAt
              )}
            />

            {payment.paystackTransactionId && (
              <ReceiptRow
                label="Paystack Transaction ID"
                value={payment.paystackTransactionId}
              />
            )}
          </div>
        </div>

        {/* Fee Account */}
        {feeAccount && (
          <div className="border-t border-slate-100 px-6 py-8 sm:px-10">
            <SectionTitle
              icon={<Receipt className="h-4 w-4" />}
              title="Fee Account"
            />

            <div className="mt-5 rounded-2xl bg-slate-50 p-5">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-slate-500">
                  Total Fees
                </span>

                <span className="font-semibold text-slate-900">
                  {formatCurrency(
                    feeAccount.totalAmountDue
                  )}
                </span>
              </div>

              <div className="mt-3 flex items-center justify-between gap-4">
                <span className="text-sm text-slate-500">
                  Amount Paid
                </span>

                <span className="font-semibold text-emerald-700">
                  {formatCurrency(
                    feeAccount.amountPaid
                  )}
                </span>
              </div>

              <div className="mt-3 flex items-center justify-between gap-4 border-t border-slate-200 pt-3">
                <span className="text-sm font-semibold text-slate-700">
                  Balance
                </span>

                <span className="font-bold text-slate-900">
                  {formatCurrency(
                    feeAccount.balance
                  )}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-slate-200 bg-slate-50 px-6 py-6 text-center sm:px-10">
          <p className="text-sm font-semibold text-slate-700">
            Thank you for your payment.
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            This receipt confirms that the payment above was
            successfully recorded by the school.
          </p>

          <p className="mt-4 text-[11px] text-slate-400">
            Generated from the School Management Portal
          </p>
        </div>
      </article>
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/* Section Title                                                              */
/* -------------------------------------------------------------------------- */

function SectionTitle({ icon, title }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
        {icon}
      </div>

      <h2 className="text-sm font-semibold text-slate-900">
        {title}
      </h2>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Receipt Field                                                              */
/* -------------------------------------------------------------------------- */

function ReceiptField({ label, value }) {
  return (
    <div>
      <p className="text-xs font-medium text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-slate-800">
        {value}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Receipt Row                                                                */
/* -------------------------------------------------------------------------- */

function ReceiptRow({ label, value }) {
  return (
    <div className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <span className="text-xs font-medium text-slate-500">
        {label}
      </span>

      <span className="break-all text-sm font-semibold text-slate-800 sm:text-right">
        {value}
      </span>
    </div>
  );
}