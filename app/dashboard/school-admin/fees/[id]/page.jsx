"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Edit,
  GraduationCap,
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

const formatDate = (date) => {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const getClassName = (schoolClass) => {
  if (!schoolClass) return "Unknown class";

  return [schoolClass.name, schoolClass.arm, schoolClass.section]
    .filter(Boolean)
    .join(" ");
};

export default function FeeStructureDetailsPage() {
  const router = useRouter();
  const params = useParams();

  const feeStructureId = params?.id;

  const [feeStructure, setFeeStructure] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!feeStructureId) return;

    // "create" is a reserved frontend route.
    // Never send it to the fee structure API as an ID.
    if (feeStructureId === "create") {
      router.replace("/dashboard/school-admin/fees/create");
      return;
    }

    const fetchFeeStructure = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          `/fee-structures/${feeStructureId}`
        );

        setFeeStructure(response.data?.feeStructure || null);
      } catch (err) {
        console.error("Failed to fetch fee structure:", err);

        setError(
          err.response?.data?.message ||
            "Unable to load this fee structure."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchFeeStructure();
  }, [feeStructureId, router]);

  const handleBack = () => {
    router.push("/dashboard/school-admin/fees");
  };

  const handleEdit = () => {
    router.push(
      `/dashboard/school-admin/fees/${feeStructureId}/edit`
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center p-6">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-600" />

          <p className="mt-3 text-sm font-medium text-slate-500">
            Loading fee structure...
          </p>
        </div>
      </div>
    );
  }

  if (error || !feeStructure) {
    return (
      <div className="space-y-4 p-4 sm:p-6 lg:p-8">
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition hover:text-emerald-600"
        >
          <ArrowLeft size={16} />
          Back to Fees
        </button>

        <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-6">
          <h2 className="text-base font-bold text-red-700">
            Unable to load fee structure
          </h2>

          <p className="mt-1 text-sm font-medium text-red-600">
            {error || "The requested fee structure could not be found."}
          </p>
        </div>
      </div>
    );
  }

  const session = feeStructure.academicSession;
  const term = feeStructure.academicTerm;
  const classes = feeStructure.schoolClasses || [];
  const items = feeStructure.items || [];

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <button
            type="button"
            onClick={handleBack}
            className="mb-3 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition hover:text-emerald-600"
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
              Fee Structure
            </h1>
          </div>

          <p className="mt-1 text-sm font-medium text-slate-500">
            View the complete fee configuration for this academic period.
          </p>
        </div>

        <button
          type="button"
          onClick={handleEdit}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
        >
          <Edit size={16} />
          Edit Fee Structure
        </button>
      </div>

      {/* Academic Period */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <CalendarDays size={19} />
          </div>

          <div>
            <h2 className="text-base font-bold text-slate-800">
              Academic Period
            </h2>

            <p className="text-xs font-medium text-slate-400">
              The academic session and term covered by this fee structure.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
              Academic Session
            </p>

            <p className="mt-1 text-sm font-bold text-slate-700">
              {session?.name || "—"}
            </p>

            {session?.startDate && session?.endDate && (
              <p className="mt-1 text-xs font-medium text-slate-400">
                {formatDate(session.startDate)} —{" "}
                {formatDate(session.endDate)}
              </p>
            )}
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
              Academic Term
            </p>

            <p className="mt-1 text-sm font-bold text-slate-700">
              {term?.name || "—"}
            </p>

            {term?.isCurrent && (
              <div className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                <CheckCircle2 size={13} />
                Current Term
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Classes */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <GraduationCap size={19} />
          </div>

          <div>
            <h2 className="text-base font-bold text-slate-800">
              Applicable Classes
            </h2>

            <p className="text-xs font-medium text-slate-400">
              Classes covered by this fee structure.
            </p>
          </div>
        </div>

        {classes.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center">
            <p className="text-sm font-medium text-slate-400">
              No classes assigned to this fee structure.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {classes.map((schoolClass) => (
              <div
                key={schoolClass._id}
                className="rounded-xl border border-slate-200 bg-slate-50 p-4"
              >
                <p className="text-sm font-bold text-slate-700">
                  {getClassName(schoolClass)}
                </p>

                <p className="mt-1 text-xs font-medium text-slate-400">
                  {schoolClass.section || "—"}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fee Items */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <WalletCards size={19} />
          </div>

          <div>
            <h2 className="text-base font-bold text-slate-800">
              Fee Items
            </h2>

            <p className="text-xs font-medium text-slate-400">
              Breakdown of the fees students are required to pay.
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {items.length === 0 ? (
            <div className="px-5 py-8 text-center sm:px-6">
              <p className="text-sm font-medium text-slate-400">
                No fee items found.
              </p>
            </div>
          ) : (
            items.map((item, index) => (
              <div
                key={item._id || `${item.name}-${index}`}
                className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6"
              >
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-700">
                    {item.name}
                  </p>

                  <p className="mt-0.5 text-xs font-medium text-slate-400">
                    Fee item {index + 1}
                  </p>
                </div>

                <p className="shrink-0 text-sm font-bold text-slate-800 sm:text-base">
                  {formatCurrency(item.amount)}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Total */}
        <div className="border-t border-slate-100 bg-slate-50/70 px-5 py-5 sm:px-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Total Fee
              </p>

              <p className="mt-1 text-xs font-medium text-slate-400">
                Total amount payable per student.
              </p>
            </div>

            <p className="text-xl font-bold text-emerald-600 sm:text-2xl">
              {formatCurrency(feeStructure.totalAmount)}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={handleBack}
          className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
        >
          Back to Fees
        </button>

        <button
          type="button"
          onClick={handleEdit}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
        >
          <Edit size={17} />
          Edit Fee Structure
        </button>
      </div>
    </div>
  );
}
