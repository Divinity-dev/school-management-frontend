"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";

import api from "@/lib/api";

function ParentFeePaymentCallbackContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const { id } = params;
  const reference =
    searchParams.get("reference") || searchParams.get("trxref");

  const verificationStarted = useRef(false);

  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState(
    "Verifying your payment with Paystack..."
  );

  useEffect(() => {
    if (!reference || verificationStarted.current) {
      return;
    }

    verificationStarted.current = true;

    const verifyPayment = async () => {
      try {
        setStatus("verifying");
        setMessage(
          "Verifying your payment with Paystack..."
        );

        const response = await api.get(
          `/parent-payments/school-fees/verify/${encodeURIComponent(
            reference
          )}`
        );

        setStatus("success");

        setMessage(
          response.data?.message ||
            "Your school fee payment was successful."
        );

        /*
         * Give the user a moment to see the success state,
         * then return to the child's fees page.
         */
        setTimeout(() => {
          router.replace(
            `/dashboard/parent/children/${id}/fees`
          );
        }, 1800);
      } catch (error) {
        console.error(
          "Payment verification failed:",
          error
        );

        setStatus("error");

        setMessage(
          error.response?.data?.message ||
            "We could not verify this payment."
        );
      }
    };

    verifyPayment();
  }, [reference, id, router]);

  /*
   * If Paystack returns without a reference.
   */
  if (!reference) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-3xl border border-red-100 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
            <AlertCircle className="h-7 w-7 text-red-500" />
          </div>

          <h1 className="mt-5 text-xl font-bold text-slate-900">
            Payment Reference Missing
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            We could not find the payment reference
            required to verify this transaction.
          </p>

          <button
            type="button"
            onClick={() =>
              router.replace(
                `/dashboard/parent/children/${id}/fees`
              )
            }
            className="mt-6 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            Return to School Fees
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        {status === "verifying" && (
          <>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">
              <Loader2 className="h-7 w-7 animate-spin text-blue-600" />
            </div>

            <h1 className="mt-5 text-xl font-bold text-slate-900">
              Verifying Payment
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              {message}
            </p>

            <p className="mt-4 text-xs text-slate-400">
              Please don&apos;t close this page.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
              <CheckCircle2 className="h-7 w-7 text-emerald-600" />
            </div>

            <h1 className="mt-5 text-xl font-bold text-slate-900">
              Payment Successful
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              {message}
            </p>

            <p className="mt-4 text-xs text-slate-400">
              Returning to the school fees page...
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
              <AlertCircle className="h-7 w-7 text-red-500" />
            </div>

            <h1 className="mt-5 text-xl font-bold text-slate-900">
              Payment Verification Failed
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              {message}
            </p>

            <button
              type="button"
              onClick={() =>
                router.replace(
                  `/dashboard/parent/children/${id}/fees`
                )
              }
              className="mt-6 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              Return to School Fees
            </button>
          </>
        )}
      </div>
    </main>
  );
}

export default function ParentFeePaymentCallbackPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
          <Loader2 className="h-7 w-7 animate-spin text-blue-600" />
        </main>
      }
    >
      <ParentFeePaymentCallbackContent />
    </Suspense>
  );
}