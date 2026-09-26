"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Banknote,
  User,
  Wallet,
  AlertCircle,
} from "lucide-react";
import api from "@/lib/api";

export default function EditOfflinePaymentPage() {
  const params = useParams();
  const router = useRouter();

  const paymentId = params?.id;

  const [payment, setPayment] = useState(null);

  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [note, setNote] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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

        const data = response.data.payment;

        if (
          data.provider !== "offline" ||
          data.status !== "successful"
        ) {
          setError(
            "Only successful offline payments can be edited."
          );
          return;
        }

        setPayment(data);
        setAmount(String(data.amount || ""));
        setPaymentMethod(
          data.paymentMethod === "paystack"
            ? "cash"
            : data.paymentMethod || "cash"
        );
        setNote(data.metadata?.note || "");
      } catch (err) {
        console.error("Failed to fetch payment:", err);

        setError(
          err.response?.data?.message ||
            "Unable to load payment."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPayment();
  }, [paymentId]);

  const formatCurrency = (value) => {
    return `₦${Number(value || 0).toLocaleString("en-NG")}`;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    const numericAmount = Number(amount);

    if (!numericAmount || numericAmount <= 0) {
      setError("Enter a valid payment amount.");
      return;
    }

    if (!paymentMethod) {
      setError("Select a payment method.");
      return;
    }

    try {
      setSaving(true);

      await api.put(
        `/payments/school-fees/${paymentId}/offline`,
        {
          amount: numericAmount,
          paymentMethod,
          note: note.trim(),
        }
      );

      router.push(
        `/dashboard/school-admin/payments/${paymentId}`
      );
    } catch (err) {
      console.error("Failed to update payment:", err);

      setError(
        err.response?.data?.message ||
          "Unable to update payment."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-3xl">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-48 rounded bg-gray-200" />
            <div className="h-32 rounded-2xl bg-white" />
            <div className="h-96 rounded-2xl bg-white" />
          </div>
        </div>
      </div>
    );
  }

  if (error && !payment) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-3xl">
          <button
            onClick={() =>
              router.push(
                `/dashboard/school-admin/payments/${paymentId}`
              )
            }
            className="mb-6 flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={18} />
            Back to Payment
          </button>

          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <div className="flex items-start gap-3">
              <AlertCircle
                className="mt-0.5 shrink-0 text-red-600"
                size={20}
              />

              <p className="text-sm text-red-700">
                {error}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const student =
    payment?.studentFeeAccount?.student;

  const feeAccount =
    payment?.studentFeeAccount;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-3xl space-y-6">

        {/* Header */}
        <div>
          <button
            onClick={() =>
              router.push(
                `/dashboard/school-admin/payments/${paymentId}`
              )
            }
            className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-gray-900"
          >
            <ArrowLeft size={18} />
            Back to Payment
          </button>

          <h1 className="text-2xl font-bold text-gray-900">
            Edit Offline Payment
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Update the payment amount, payment method, or note.
          </p>
        </div>

        {/* Payment / Student Summary */}
        <div className="grid gap-4 sm:grid-cols-2">

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <User size={19} />
              </div>

              <div>
                <p className="text-xs text-gray-500">
                  Student
                </p>

                <p className="font-semibold text-gray-900">
                  {student
                    ? `${student.firstName || ""} ${
                        student.lastName || ""
                      }`.trim()
                    : "—"}
                </p>
              </div>
            </div>

            <p className="text-sm text-gray-500">
              {student?.studentId || "No student ID"}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                <Wallet size={19} />
              </div>

              <div>
                <p className="text-xs text-gray-500">
                  Current Balance
                </p>

                <p className="font-semibold text-gray-900">
                  {formatCurrency(feeAccount?.balance)}
                </p>
              </div>
            </div>

            <p className="text-sm text-gray-500">
              Total due:{" "}
              {formatCurrency(
                feeAccount?.totalAmountDue
              )}
            </p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle
                className="mt-0.5 shrink-0 text-red-600"
                size={18}
              />

              <p className="text-sm text-red-700">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
        >
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <Banknote size={20} />
            </div>

            <div>
              <h2 className="font-semibold text-gray-900">
                Payment Information
              </h2>

              <p className="text-sm text-gray-500">
                Make the necessary changes below.
              </p>
            </div>
          </div>

          <div className="space-y-5">

            {/* Amount */}
            <div>
              <label
                htmlFor="amount"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Payment Amount
              </label>

              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-500">
                  ₦
                </span>

                <input
                  id="amount"
                  type="number"
                  min="1"
                  step="0.01"
                  value={amount}
                  onChange={(e) =>
                    setAmount(e.target.value)
                  }
                  className="w-full rounded-xl border border-gray-300 py-3 pl-8 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  placeholder="Enter amount"
                  required
                />
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <label
                htmlFor="paymentMethod"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Payment Method
              </label>

              <select
                id="paymentMethod"
                value={paymentMethod}
                onChange={(e) =>
                  setPaymentMethod(e.target.value)
                }
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                required
              >
                <option value="cash">Cash</option>
                <option value="bank_transfer">
                  Bank Transfer
                </option>
                <option value="pos">POS</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Note */}
            <div>
              <label
                htmlFor="note"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Note
                <span className="ml-1 font-normal text-gray-400">
                  (optional)
                </span>
              </label>

              <textarea
                id="note"
                rows={4}
                value={note}
                onChange={(e) =>
                  setNote(e.target.value)
                }
                className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                placeholder="Add a note about this payment..."
              />
            </div>
          </div>

          {/* Locked information */}
          <div className="mt-6 rounded-xl bg-gray-50 p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Payment Reference
            </p>

            <p className="break-all font-mono text-sm text-gray-700">
              {payment.paymentReference}
            </p>

            <p className="mt-3 text-xs leading-5 text-gray-500">
              Student, fee account, academic session, academic
              term, payment reference, provider, and payment
              status cannot be changed.
            </p>
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() =>
                router.push(
                  `/dashboard/school-admin/payments/${paymentId}`
                )
              }
              disabled={saving}
              className="rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save size={17} />

              {saving
                ? "Saving..."
                : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}