"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  CreditCard,
  ChevronRight,
} from "lucide-react";

import api from "@/lib/api";

const formatDate = (date) => {
  if (!date) return "";

  const paymentDate = new Date(date);

  if (Number.isNaN(paymentDate.getTime())) {
    return "";
  }

  const now = new Date();

  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

  const startOfPaymentDay = new Date(
    paymentDate.getFullYear(),
    paymentDate.getMonth(),
    paymentDate.getDate()
  );

  const difference =
    startOfToday.getTime() -
    startOfPaymentDay.getTime();

  const oneDay = 24 * 60 * 60 * 1000;

  if (difference === 0) {
    return "Today";
  }

  if (difference === oneDay) {
    return "Yesterday";
  }

  if (difference > 0 && difference < 7 * oneDay) {
    return `${Math.floor(difference / oneDay)} days ago`;
  }

  return paymentDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year:
      paymentDate.getFullYear() !== now.getFullYear()
        ? "numeric"
        : undefined,
  });
};

const formatAmount = (amount) => {
  return `₦${Number(amount || 0).toLocaleString()}`;
};

export default function RecentPayments() {
  const router = useRouter();

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRecentPayments = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          "/payments/school-fees"
        );

        const data =
          response.data?.payments || [];

        setPayments(data.slice(0, 5));
      } catch (err) {
        console.error(
          "Failed to fetch recent payments:",
          err
        );

        setError(
          err?.response?.data?.message ||
            "Unable to load recent payments."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRecentPayments();
  }, []);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Recent Payments
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Latest school fee payments
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            router.push(
              "/dashboard/school-admin/payments"
            )
          }
          className="flex items-center gap-1 text-xs font-medium text-emerald-600 transition hover:text-emerald-700"
        >
          View all
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-4 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-600">
          {error}
        </div>
      )}

      {/* Payments */}
      <div className="mt-5 divide-y divide-slate-100">
        {loading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
            >
              <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-slate-100" />

              <div className="min-w-0 flex-1">
                <div className="h-4 w-2/3 animate-pulse rounded bg-slate-100" />

                <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-slate-100" />
              </div>

              <div className="h-4 w-16 animate-pulse rounded bg-slate-100" />
            </div>
          ))
        ) : payments.length === 0 ? (
          <div className="py-8 text-center">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50 text-slate-400">
              <CreditCard size={20} />
            </div>

            <p className="mt-3 text-sm font-medium text-slate-700">
              No payments yet
            </p>

            <p className="mt-1 text-xs text-slate-400">
              School fee payments will appear here.
            </p>
          </div>
        ) : (
          payments.map((payment) => {
            const student =
              payment.studentFeeAccount?.student;

            const studentName = student
              ? [
                  student.firstName,
                  student.middleName,
                  student.lastName,
                ]
                  .filter(Boolean)
                  .join(" ")
              : "Unknown Student";

            return (
              <div
                key={payment._id}
                className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
              >
                {/* Icon */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <CreditCard size={17} />
                </div>

                {/* Student + Reference */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-800">
                    {studentName}
                  </p>

                  <p className="mt-0.5 truncate text-xs text-slate-400">
                    {payment.paymentReference} ·{" "}
                    {formatDate(
                      payment.paidAt ||
                        payment.createdAt
                    )}
                  </p>
                </div>

                {/* Amount */}
                <p className="whitespace-nowrap text-sm font-semibold text-slate-800">
                  {formatAmount(payment.amount)}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}