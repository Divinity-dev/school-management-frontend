"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
ArrowRight,
Banknote,
CalendarDays,
CheckCircle2,
Clock3,
CreditCard,
Eye,
FileText,
Search,
Wallet,
XCircle,
} from "lucide-react";

import api from "@/lib/api";

const formatCurrency = (amount) => {
const value = Number(amount) || 0;

return new Intl.NumberFormat("en-NG", {
style: "currency",
currency: "NGN",
maximumFractionDigits: 0,
}).format(value);
};

const formatDate = (date) => {
if (!date) return "—";

return new Intl.DateTimeFormat("en-NG", {
day: "numeric",
month: "short",
year: "numeric",
}).format(new Date(date));
};

const getStudentName = (student) => {
if (!student) return "Unknown student";

return [
student.firstName,
student.middleName,
student.lastName,
]
.filter(Boolean)
.join(" ");
};

const getPaymentMethodLabel = (payment) => {
if (payment?.provider === "offline") {
const methods = {
cash: "Cash",
bank_transfer: "Bank Transfer",
pos: "POS",
other: "Other",
};

return (
  methods[payment.paymentMethod] ||
  "Offline"
);


}

if (
payment?.provider === "paystack" ||
payment?.paymentMethod === "paystack"
) {
return "Paystack";
}

return payment?.paymentMethod || "—";
};

const getStatusClasses = (status) => {
switch (status) {
case "successful":
return "bg-emerald-50 text-emerald-700 ring-emerald-200";

case "pending":
  return "bg-amber-50 text-amber-700 ring-amber-200";

case "failed":
  return "bg-red-50 text-red-700 ring-red-200";

case "cancelled":
  return "bg-slate-100 text-slate-600 ring-slate-200";

default:
  return "bg-slate-100 text-slate-600 ring-slate-200";

}
};

const capitalize = (value) => {
if (!value) return "—";

return value.charAt(0).toUpperCase() + value.slice(1);
};

export default function SchoolAdminPaymentsPage() {
const router = useRouter();

const [payments, setPayments] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

const [search, setSearch] = useState("");
const [status, setStatus] = useState("all");

const fetchPayments = async () => {
try {
setLoading(true);
setError("");

  const response = await api.get(
    "/payments/school-fees"
  );

  setPayments(
    Array.isArray(response.data?.payments)
      ? response.data.payments
      : []
  );
} catch (err) {
  console.error(
    "Failed to fetch school fee payments:",
    err
  );

  setError(
    err.response?.data?.message ||
      "Unable to load payment history."
  );
} finally {
  setLoading(false);
}

};

useEffect(() => {
fetchPayments();
}, []);

const filteredPayments = useMemo(() => {
const query = search.trim().toLowerCase();

return payments.filter((payment) => {
  const student =
    payment.studentFeeAccount?.student;

  const studentName =
    getStudentName(student).toLowerCase();

  const studentId =
    student?.studentId?.toLowerCase() || "";

  const reference =
    payment.paymentReference?.toLowerCase() || "";

  const matchesSearch =
    !query ||
    studentName.includes(query) ||
    studentId.includes(query) ||
    reference.includes(query);

  const matchesStatus =
    status === "all" ||
    payment.status === status;

  return (
    matchesSearch &&
    matchesStatus
  );
});


}, [payments, search, status]);

const stats = useMemo(() => {
const successfulPayments =
payments.filter(
(payment) =>
payment.status === "successful"
);

const pendingPayments =
  payments.filter(
    (payment) =>
      payment.status === "pending"
  );

const failedPayments =
  payments.filter(
    (payment) =>
      payment.status === "failed" ||
      payment.status === "cancelled"
  );

const totalCollected =
  successfulPayments.reduce(
    (total, payment) =>
      total + Number(payment.amount || 0),
    0
  );

return {
  total: payments.length,
  successful: successfulPayments.length,
  pending: pendingPayments.length,
  failed: failedPayments.length,
  totalCollected,
};


}, [payments]);

return ( <div className="space-y-6 p-4 sm:p-6 lg:p-8">
{/* Header */} <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"> <div> <div className="mb-2 flex items-center gap-2 text-sm text-slate-500"> <Wallet className="h-4 w-4" /> <span>Finance</span> <ArrowRight className="h-3.5 w-3.5" /> <span>Payments</span> </div>

      <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
        Payments
      </h1>

      <p className="mt-1 text-sm text-slate-500">
        View and manage student fee payments.
      </p>
    </div>

    <button
      type="button"
      onClick={() =>
        router.push(
          "/dashboard/school-admin/payments/record"
        )
      }
      className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
    >
      <Banknote className="h-4 w-4" />
      Record Payment
    </button>
  </div>

  {/* Stats */}
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            Total Payments
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {stats.total}
          </p>
        </div>

        <div className="rounded-xl bg-slate-100 p-2.5">
          <CreditCard className="h-5 w-5 text-slate-600" />
        </div>
      </div>
    </div>

    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            Successful
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {stats.successful}
          </p>
        </div>

        <div className="rounded-xl bg-emerald-50 p-2.5">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
        </div>
      </div>
    </div>

    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            Pending
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {stats.pending}
          </p>
        </div>

        <div className="rounded-xl bg-amber-50 p-2.5">
          <Clock3 className="h-5 w-5 text-amber-600" />
        </div>
      </div>
    </div>

    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            Amount Collected
          </p>

          <p className="mt-2 text-xl font-bold text-slate-900 sm:text-2xl">
            {formatCurrency(
              stats.totalCollected
            )}
          </p>
        </div>

        <div className="rounded-xl bg-blue-50 p-2.5">
          <Wallet className="h-5 w-5 text-blue-600" />
        </div>
      </div>
    </div>
  </div>

  {/* Payment history */}
  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div className="border-b border-slate-200 p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Payment History
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {filteredPayments.length}{" "}
            {filteredPayments.length === 1
              ? "payment"
              : "payments"}{" "}
            found
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          {/* Search */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search student or reference..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 sm:w-72"
            />
          </div>

          {/* Status */}
          <select
            value={status}
            onChange={(event) =>
              setStatus(event.target.value)
            }
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          >
            <option value="all">
              All statuses
            </option>
            <option value="successful">
              Successful
            </option>
            <option value="pending">
              Pending
            </option>
            <option value="failed">
              Failed
            </option>
            <option value="cancelled">
              Cancelled
            </option>
          </select>
        </div>
      </div>
    </div>

    {loading ? (
      <div className="flex min-h-[300px] items-center justify-center p-8">
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-600" />
          Loading payment history...
        </div>
      </div>
    ) : error ? (
      <div className="p-8">
        <div className="mx-auto max-w-md rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-red-100">
            <XCircle className="h-5 w-5 text-red-600" />
          </div>

          <h3 className="mt-4 font-semibold text-red-900">
            Unable to load payments
          </h3>

          <p className="mt-1 text-sm text-red-700">
            {error}
          </p>

          <button
            type="button"
            onClick={fetchPayments}
            className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    ) : payments.length === 0 ? (
      <div className="flex min-h-[360px] flex-col items-center justify-center px-6 py-12 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50">
          <CreditCard className="h-7 w-7 text-emerald-600" />
        </div>

        <h3 className="mt-5 text-lg font-semibold text-slate-900">
          No payments yet
        </h3>

        <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
          Student fee payments will appear here once
          payments are recorded or successfully
          processed through Paystack.
        </p>

        <button
          type="button"
          onClick={() =>
            router.push(
              "/dashboard/school-admin/payments/record"
            )
          }
          className="mt-5 inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
        >
          <Banknote className="h-4 w-4" />
          Record Payment
        </button>
      </div>
    ) : filteredPayments.length === 0 ? (
      <div className="flex min-h-[280px] flex-col items-center justify-center px-6 py-12 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
          <Search className="h-6 w-6 text-slate-500" />
        </div>

        <h3 className="mt-4 font-semibold text-slate-900">
          No matching payments
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          Try changing your search or payment
          status filter.
        </p>
      </div>
    ) : (
      <>
        {/* Desktop table */}
        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full min-w-[1050px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-left">
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Student
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Period
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Amount
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Method
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Date
                </th>

                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredPayments.map(
                (payment) => {
                  const student =
                    payment
                      .studentFeeAccount
                      ?.student;

                  return (
                    <tr
                      key={payment._id}
                      className="transition hover:bg-slate-50/70"
                    >
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-medium text-slate-900">
                            {getStudentName(
                              student
                            )}
                          </p>

                          <p className="mt-0.5 text-xs text-slate-500">
                            {student?.studentId ||
                              "No student ID"}
                          </p>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-slate-700">
                          {payment
                            .academicSession
                            ?.name ||
                            "—"}
                        </p>

                        <p className="mt-0.5 text-xs text-slate-500">
                          {payment
                            .academicTerm
                            ?.name ||
                            "—"}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-900">
                          {formatCurrency(
                            payment.amount
                          )}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1.5 text-sm text-slate-600">
                          <CreditCard className="h-4 w-4 text-slate-400" />
                          {getPaymentMethodLabel(
                            payment
                          )}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${getStatusClasses(
                            payment.status
                          )}`}
                        >
                          {capitalize(
                            payment.status
                          )}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-sm text-slate-600">
                          <CalendarDays className="h-4 w-4 text-slate-400" />
                          {formatDate(
                            payment.paidAt ||
                              payment.createdAt
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            router.push(
                              `/dashboard/school-admin/payments/${payment._id}`
                            )
                          }
                          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </button>
                      </td>
                    </tr>
                  );
                }
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile / tablet cards */}
        <div className="divide-y divide-slate-100 lg:hidden">
          {filteredPayments.map(
            (payment) => {
              const student =
                payment
                  .studentFeeAccount
                  ?.student;

              return (
                <div
                  key={payment._id}
                  className="p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-900">
                        {getStudentName(
                          student
                        )}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {student?.studentId ||
                          "No student ID"}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${getStatusClasses(
                        payment.status
                      )}`}
                    >
                      {capitalize(
                        payment.status
                      )}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-400">
                        Amount
                      </p>

                      <p className="mt-1 font-semibold text-slate-900">
                        {formatCurrency(
                          payment.amount
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-400">
                        Method
                      </p>

                      <p className="mt-1 text-sm font-medium text-slate-700">
                        {getPaymentMethodLabel(
                          payment
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-400">
                        Session
                      </p>

                      <p className="mt-1 text-sm text-slate-700">
                        {payment
                          .academicSession
                          ?.name || "—"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-400">
                        Term
                      </p>

                      <p className="mt-1 text-sm text-slate-700">
                        {payment
                          .academicTerm
                          ?.name || "—"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {formatDate(
                        payment.paidAt ||
                          payment.createdAt
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          `/dashboard/school-admin/payments/${payment._id}`
                        )
                      }
                      className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </button>
                  </div>
                </div>
              );
            }
          )}
        </div>
      </>
    )}
  </div>
</div>


);
}
