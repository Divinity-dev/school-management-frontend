"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, LoaderCircle, XCircle } from "lucide-react";
import api from "@/lib/api";

export default function PaymentCallbackPage() {
const router = useRouter();
const searchParams = useSearchParams();

const [status, setStatus] = useState("processing");
const [message, setMessage] = useState(
"Verifying your payment..."
);

useEffect(() => {
const verifyPayment = async () => {
const reference =
searchParams.get("reference") ||
searchParams.get("trxref");


  if (!reference) {
    setStatus("failed");
    setMessage(
      "No payment reference was found."
    );
    return;
  }

  try {
    /*
     * Subscription payment
     */
    if (reference.startsWith("SUB-")) {
      const response = await api.get(
        `/subscriptions/payment/verify/${encodeURIComponent(
          reference
        )}`
      );

      setStatus("success");
      setMessage(
        response.data?.message ||
          "Your subscription payment was successful."
      );

      setTimeout(() => {
        router.replace(
          "/dashboard/school-admin/subscription"
        );
      }, 2500);

      return;
    }

    /*
     * Additional student seats
     */
    if (reference.startsWith("SEAT-")) {
      const response = await api.get(
        `/subscriptions/add-seats/payment/verify/${encodeURIComponent(
          reference
        )}`
      );

      setStatus("success");
      setMessage(
        response.data?.message ||
          "Your additional-seat payment was successful."
      );

      setTimeout(() => {
        router.replace(
          "/dashboard/school-admin/subscription"
        );
      }, 2500);

      return;
    }

    /*
     * School fees
     *
     * We will connect this to the fee verification
     * endpoint when the fee payment flow is completed.
     */
    if (reference.startsWith("FEES-")) {
      setStatus("failed");
      setMessage(
        "School fee payment verification is not connected to this callback yet."
      );
      return;
    }

    setStatus("failed");
    setMessage(
      "Unknown payment reference."
    );
  } catch (error) {
    console.error(
      "Payment callback verification error:",
      error
    );

    setStatus("failed");
    setMessage(
      error.response?.data?.message ||
        "We could not verify your payment. Please contact support if money was deducted."
    );
  }
};

verifyPayment();


}, [router, searchParams]);

return ( <main className="flex min-h-[70vh] items-center justify-center px-6"> <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
{status === "processing" && (
<> <LoaderCircle className="mx-auto h-12 w-12 animate-spin text-emerald-600" />


        <h1 className="mt-5 text-xl font-semibold text-slate-900">
          Verifying payment
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Please wait while we confirm your transaction with Paystack.
        </p>
      </>
    )}

    {status === "success" && (
      <>
        <CheckCircle className="mx-auto h-14 w-14 text-emerald-600" />

        <h1 className="mt-5 text-xl font-semibold text-slate-900">
          Payment successful
        </h1>

        <p className="mt-2 text-sm text-slate-600">
          {message}
        </p>

        <p className="mt-4 text-xs text-slate-400">
          Redirecting you to your subscription...
        </p>
      </>
    )}

    {status === "failed" && (
      <>
        <XCircle className="mx-auto h-14 w-14 text-red-500" />

        <h1 className="mt-5 text-xl font-semibold text-slate-900">
          Payment verification failed
        </h1>

        <p className="mt-2 text-sm text-slate-600">
          {message}
        </p>

        <button
          type="button"
          onClick={() =>
            router.replace(
              "/dashboard/school-admin/subscription"
            )
          }
          className="mt-6 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          Back to Subscription
        </button>
      </>
    )}
  </div>
</main>


);
}



