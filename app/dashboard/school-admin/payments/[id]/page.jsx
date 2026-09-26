
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CreditCard,
  User,
  Wallet,
  CalendarDays,
  Receipt,
  Pencil,
  CheckCircle2,
  Clock3,
  XCircle,
  Banknote,
} from "lucide-react";
import api from "@/lib/api";

export default function PaymentDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const paymentId = params?.id;

  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!paymentId) return;

    const fetchPayment = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          `/payments/school-fees/${paymentId}`
        );

        setPayment(response.data.payment);
      } catch (err) {
        console.error("Failed to fetch payment:", err);

        setError(
          err.response?.data?.message ||
            "Unable to load payment details."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPayment();
  }, [paymentId]);

  const formatCurrency = (amount) => {
    return `₦${Number(amount || 0).toLocaleString("en-NG")}`;
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

  const getStatusConfig = (status) => {
    switch (status) {
      case "successful":
        return {
          label: "Successful",
          icon: CheckCircle2,
          className:
            "bg-emerald-50 text-emerald-700 border-emerald-200",
        };

      case "pending":
        return {
          label: "Pending",
          icon: Clock3,
          className:
            "bg-amber-50 text-amber-700 border-amber-200",
        };

      case "failed":
        return {
          label: "Failed",
          icon: XCircle,
          className:
            "bg-red-50 text-red-700 border-red-200",
        };

      case "cancelled":
        return {
          label: "Cancelled",
          icon: XCircle,
          className:
            "bg-gray-100 text-gray-700 border-gray-200",
        };

      default:
        return {
          label: status || "Unknown",
          icon: Clock3,
          className:
            "bg-gray-100 text-gray-700 border-gray-200",
        };
    }
  };

  const formatPaymentMethod = (method) => {
    switch (method) {
      case "paystack":
        return "Paystack";

      case "cash":
        return "Cash";

      case "bank_transfer":
        return "Bank Transfer";

      case "pos":
        return "POS";

      case "other":
        return "Other";

      default:
        return method || "—";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-5xl">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-48 rounded bg-gray-200" />
            <div className="h-40 rounded-2xl bg-white" />
            <div className="h-64 rounded-2xl bg-white" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !payment) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-5xl">
          <button
            onClick={() =>
              router.push("/dashboard/school-admin/payments")
            }
            className="mb-6 flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-gray-900"
          >
            <ArrowLeft size={18} />
            Back to Payments
          </button>

          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
            {error || "Payment not found."}
          </div>
        </div>
      </div>
    );
  }

  const status = getStatusConfig(payment.status);
  const StatusIcon = status.icon;

  const student = payment.studentFeeAccount?.student;
  const feeStructure = payment.studentFeeAccount?.feeStructure;

  const canEdit =
    payment.provider === "offline" &&
    payment.status === "successful";

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl space-y-6">

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <button
              onClick={() =>
                router.push("/dashboard/school-admin/payments")
              }
              className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-gray-900"
            >
              <ArrowLeft size={18} />
              Back to Payments
            </button>

            <h1 className="text-2xl font-bold text-gray-900">
              Payment Details
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              View payment and student fee information.
            </p>
          </div>

          {canEdit && (
            <button
              onClick={() =>
                router.push(
                  `/dashboard/school-admin/payments/${payment._id}/edit`
                )
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              <Pencil size={17} />
              Edit Payment
            </button>
          )}
        </div>

        {/* Payment Summary */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                {payment.provider === "offline" ? (
                  <Banknote size={24} />
                ) : (
                  <CreditCard size={24} />
                )}
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Payment Amount
                </p>

                <h2 className="mt-1 text-3xl font-bold text-gray-900">
                  {formatCurrency(payment.amount)}
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                  {payment.paymentReference}
                </p>
              </div>
            </div>

            <div
              className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium ${status.className}`}
            >
              <StatusIcon size={16} />
              {status.label}
            </div>
          </div>
        </div>

        {/* Payment Information */}
        <div className="grid gap-6 lg:grid-cols-2">

          {/* Payment Info */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-700">
                <Receipt size={20} />
              </div>

              <div>
                <h2 className="font-semibold text-gray-900">
                  Payment Information
                </h2>

                <p className="text-sm text-gray-500">
                  Transaction details
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <DetailRow
                label="Payment Type"
                value="School Fees"
              />

              <DetailRow
                label="Provider"
                value={
                  payment.provider === "offline"
                    ? "Offline"
                    : "Paystack"
                }
              />

              <DetailRow
                label="Payment Method"
                value={formatPaymentMethod(
                  payment.paymentMethod
                )}
              />

              <DetailRow
                label="Reference"
                value={payment.paymentReference}
              />

              {payment.paystackTransactionId && (
                <DetailRow
                  label="Paystack Transaction ID"
                  value={payment.paystackTransactionId}
                />
              )}

              <DetailRow
                label="Paid At"
                value={formatDateTime(payment.paidAt)}
              />

              <DetailRow
                label="Created"
                value={formatDateTime(payment.createdAt)}
              />
            </div>
          </div>

          {/* Student Info */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <User size={20} />
              </div>

              <div>
                <h2 className="font-semibold text-gray-900">
                  Student Information
                </h2>

                <p className="text-sm text-gray-500">
                  Student linked to this payment
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <DetailRow
                label="Student"
                value={
                  student
                    ? `${student.firstName || ""} ${
                        student.lastName || ""
                      }`.trim()
                    : "—"
                }
              />

              <DetailRow
                label="Student ID"
                value={student?.studentId || "—"}
              />

              <DetailRow
                label="Class"
                value={
                  student?.schoolClass?.name ||
                  student?.schoolClass?.className ||
                  "—"
                }
              />

              <DetailRow
                label="Session"
                value={
                  payment.academicSession?.name ||
                  payment.studentFeeAccount?.academicSession
                    ?.name ||
                  "—"
                }
              />

              <DetailRow
                label="Term"
                value={
                  payment.academicTerm?.name ||
                  payment.studentFeeAccount?.academicTerm
                    ?.name ||
                  "—"
                }
              />
            </div>
          </div>
        </div>

        {/* Fee Structure */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
              <Wallet size={20} />
            </div>

            <div>
              <h2 className="font-semibold text-gray-900">
                Fee Structure
              </h2>

              <p className="text-sm text-gray-500">
                Fees associated with this payment
              </p>
            </div>
          </div>

          {feeStructure ? (
            <div className="space-y-4">
              <DetailRow
                label="Fee Structure"
                value={
                  feeStructure.name ||
                  "School Fee Structure"
                }
              />

              <div className="border-t border-gray-100 pt-4">
                <p className="mb-3 text-sm font-medium text-gray-700">
                  Fee Items
                </p>

                <div className="space-y-2">
                  {(feeStructure.items || []).map(
                    (item, index) => (
                      <div
                        key={item._id || index}
                        className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3"
                      >
                        <span className="text-sm text-gray-700">
                          {item.name}
                        </span>

                        <span className="text-sm font-semibold text-gray-900">
                          {formatCurrency(item.amount)}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                <span className="font-semibold text-gray-900">
                  Total Fee
                </span>

                <span className="text-lg font-bold text-gray-900">
                  {formatCurrency(
                    feeStructure.totalAmount
                  )}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              Fee structure information is unavailable.
            </p>
          )}
        </div>

        {/* Fee Account Summary */}
        {payment.studentFeeAccount && (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                <Wallet size={20} />
              </div>

              <div>
                <h2 className="font-semibold text-gray-900">
                  Fee Account Summary
                </h2>

                <p className="text-sm text-gray-500">
                  Current account balance after this payment
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <SummaryCard
                label="Total Due"
                value={formatCurrency(
                  payment.studentFeeAccount.totalAmountDue
                )}
              />

              <SummaryCard
                label="Amount Paid"
                value={formatCurrency(
                  payment.studentFeeAccount.amountPaid
                )}
              />

              <SummaryCard
                label="Balance"
                value={formatCurrency(
                  payment.studentFeeAccount.balance
                )}
              />
            </div>
          </div>
        )}

        {/* Offline Note */}
        {payment.provider === "offline" &&
          payment.metadata?.note && (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-2 font-semibold text-gray-900">
                Payment Note
              </h2>

              <p className="text-sm leading-6 text-gray-600">
                {payment.metadata.note}
              </p>
            </div>
          )}

        {/* Dates */}
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <CalendarDays size={14} />
          Payment recorded on {formatDate(payment.createdAt)}
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex flex-col gap-1 border-b border-gray-100 pb-3 last:border-0 last:pb-0 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      <span className="text-sm text-gray-500">
        {label}
      </span>

      <span className="break-all text-sm font-medium text-gray-900 sm:text-right">
        {value}
      </span>
    </div>
  );
}

function SummaryCard({ label, value }) {
  return (
    <div className="rounded-xl bg-gray-50 p-4">
      <p className="text-sm text-gray-500">{label}</p>

      <p className="mt-1 text-xl font-bold text-gray-900">
        {value}
      </p>
    </div>
  );
}