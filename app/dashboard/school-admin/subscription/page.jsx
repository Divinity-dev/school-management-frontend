"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  CreditCard,
  Loader2,
  Plus,
  RefreshCw,
  ShieldCheck,
  Users,
  WalletCards,
} from "lucide-react";

import api from "@/lib/api";

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);
};

const formatDate = (date) => {
  if (!date) return "—";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "—";
  }

  return parsedDate.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const getStatusClasses = (status, isSubscribed) => {
  if (isSubscribed) {
    return "bg-emerald-100 text-emerald-700";
  }

  switch (status) {
    case "pending":
      return "bg-amber-100 text-amber-700";

    case "expired":
      return "bg-red-100 text-red-700";

    case "failed":
      return "bg-red-100 text-red-700";

    default:
      return "bg-slate-100 text-slate-600";
  }
};

export default function SubscriptionPage() {
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [pricing, setPricing] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [creating, setCreating] = useState(false);
  const [selectedSeats, setSelectedSeats] = useState("");

  const [additionalSeats, setAdditionalSeats] = useState(1);
  const [addingSeats, setAddingSeats] = useState(false);

  const [actionError, setActionError] = useState("");

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      setError("");

      const [subscriptionResponse, pricingResponse] =
        await Promise.all([
          api.get("/subscriptions/current"),
          api.get("/subscriptions/pricing"),
        ]);

      setSubscriptionData(subscriptionResponse.data);
      setPricing(pricingResponse.data?.pricing || null);
    } catch (err) {
      console.error(
        "Failed to load subscription information:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to load subscription information."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, []);

  /*
   * Current subscription information
   */
  const subscription = subscriptionData?.subscription;
  const usage = subscriptionData?.usage || {};
  const currentTerm = subscriptionData?.currentTerm;
  const isSubscribed = subscriptionData?.isSubscribed === true;

  const status =
    subscription?.status ||
    (isSubscribed ? "active" : "not_subscribed");

  /*
   * Current academic session
   */
  const currentSessionId =
    currentTerm?.academicSession?._id ||
    currentTerm?.academicSession ||
    subscription?.academicSession?._id ||
    subscription?.academicSession ||
    null;

  /*
   * Pricing
   */
  const pricePerStudent =
    Number(pricing?.pricePerStudent) || 0;

  /*
   * Initial subscription calculation
   */
  const seats = Number(selectedSeats);

  const activationAmount =
    Number.isInteger(seats) && seats > 0
      ? seats * pricePerStudent
      : 0;

  /*
   * Active subscription usage
   */
  const studentLimit =
    Number(usage.studentLimit) || 0;

  const activeStudents =
    Number(usage.activeStudents) || 0;

  const availableSeats =
    Number(usage.availableSeats) || 0;

  const usagePercentage =
    studentLimit > 0
      ? Math.min(
          (activeStudents / studentLimit) * 100,
          100
        )
      : 0;

  /*
   * Additional seats calculation
   */
  const additionalSeatsTotal =
    (Number(additionalSeats) || 0) *
    pricePerStudent;

  /*
   * Activate initial subscription
   */
  const handleActivateSubscription = async () => {
    const seatsToPurchase = Number(selectedSeats);

    if (
      !Number.isInteger(seatsToPurchase) ||
      seatsToPurchase < 1
    ) {
      setActionError(
        "Please enter a valid number of student seats."
      );
      return;
    }

    if (!currentTerm?._id) {
      setActionError(
        "A current academic term is required before activating your subscription."
      );
      return;
    }

    if (!currentSessionId) {
      setActionError(
        "A current academic session is required before activating your subscription."
      );
      return;
    }

    if (pricePerStudent <= 0) {
      setActionError(
        "Subscription pricing could not be loaded. Please refresh the page and try again."
      );
      return;
    }

    try {
      setCreating(true);
      setActionError("");

      const response = await api.post(
        "/subscriptions/pay",
        {
          academicSessionId: currentSessionId,
          academicTermId: currentTerm._id,
          studentLimit: seatsToPurchase,
        }
      );

      const authorizationUrl =
        response.data?.paystack?.authorizationUrl ||
        response.data?.authorizationUrl ||
        response.data?.payment?.authorizationUrl;

      if (!authorizationUrl) {
        throw new Error(
          "Paystack authorization URL was not returned."
        );
      }

      window.location.href = authorizationUrl;
    } catch (err) {
      console.error(
        "Failed to initialize subscription:",
        err
      );

      setActionError(
        err.response?.data?.message ||
          err.message ||
          "Failed to initialize subscription payment."
      );

      setCreating(false);
    }
  };

  /*
   * Purchase additional seats
   */
  const handleAddSeats = async () => {
    const subscriptionId =
      subscriptionData?.subscription?._id;

    const seatsToAdd = Number(additionalSeats);

    if (!subscriptionId) {
      setActionError(
        "No active subscription was found."
      );
      return;
    }

    if (
      !Number.isInteger(seatsToAdd) ||
      seatsToAdd < 1
    ) {
      setActionError(
        "Please enter a valid number of seats."
      );
      return;
    }

    if (pricePerStudent <= 0) {
      setActionError(
        "Subscription pricing could not be loaded. Please refresh the page and try again."
      );
      return;
    }

    try {
      setAddingSeats(true);
      setActionError("");

      const response = await api.post(
        "/subscriptions/add-seats/pay",
        {
          subscriptionId,
          additionalSeats: seatsToAdd,
        }
      );

      const authorizationUrl =
        response.data?.paystack?.authorizationUrl ||
        response.data?.authorizationUrl ||
        response.data?.payment?.authorizationUrl;

      if (!authorizationUrl) {
        throw new Error(
          "Paystack authorization URL was not returned."
        );
      }

      window.location.href = authorizationUrl;
    } catch (err) {
      console.error(
        "Failed to initialize additional seats payment:",
        err
      );

      setActionError(
        err.response?.data?.message ||
          err.message ||
          "Unable to initialize additional-seat payment."
      );

      setAddingSeats(false);
    }
  };

  /*
   * Loading state
   */
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-6 py-10">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-emerald-600" />

          <p className="mt-3 text-sm text-slate-500">
            Loading subscription...
          </p>
        </div>
      </div>
    );
  }

  /*
   * Loading error
   */
  if (error) {
    return (
      <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div>
          <a
            href="/dashboard/school-admin"
            className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-emerald-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </a>

          <h1 className="text-2xl font-bold text-slate-900">
            Subscription
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage your school subscription and student seats.
          </p>
        </div>

        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <p className="text-sm text-red-700">
            {error}
          </p>

          <button
            type="button"
            onClick={fetchSubscription}
            className="mt-4 inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-medium text-red-700 transition hover:bg-red-100"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      {/* Header */}
      <div>
        <a
          href="/dashboard/school-admin"
          className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-emerald-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </a>

        <h1 className="text-2xl font-bold text-slate-900">
          Subscription
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Manage your school subscription and student seats.
        </p>
      </div>

      {/* Action error */}
      {actionError && (
        <div className="flex items-start justify-between gap-4 rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm leading-6 text-red-700">
            {actionError}
          </p>

          <button
            type="button"
            onClick={() => setActionError("")}
            className="shrink-0 text-sm font-medium text-red-600 hover:text-red-800"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Current term */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
          <CalendarDays className="h-5 w-5" />
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Current Academic Term
          </p>

          <p className="mt-1 font-semibold text-slate-900">
            {currentTerm?.name || "No current term"}
          </p>
        </div>

        {subscription?.academicSession && (
          <div className="sm:ml-auto sm:text-right">
            <p className="text-xs text-slate-400">
              Academic Session
            </p>

            <p className="mt-1 text-sm font-semibold text-slate-700">
              {subscription.academicSession?.name || "—"}
            </p>
          </div>
        )}
      </div>

      {!isSubscribed ? (
        <>
          {/* No active subscription */}
          <div className="overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-sm">
            <div className="border-b border-emerald-100 bg-emerald-50/60 p-6 sm:p-8">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                    <ShieldCheck className="h-6 w-6" />
                  </div>

                  <h2 className="mt-5 text-xl font-bold text-slate-900">
                    Activate your school subscription
                  </h2>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                    Choose the number of student seats your
                    school needs for this academic term.
                  </p>
                </div>

                <span
                  className={`inline-flex w-fit rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${getStatusClasses(
                    status,
                    isSubscribed
                  )}`}
                >
                  {status.replace("_", " ")}
                </span>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <div className="grid gap-6 lg:grid-cols-3">
                {/* Student seats */}
                <div className="rounded-xl border border-slate-200 p-5">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-emerald-600" />

                    <span className="text-sm font-medium text-slate-500">
                      Student Seats
                    </span>
                  </div>

                  <input
                    id="selectedSeats"
                    type="number"
                    min="1"
                    step="1"
                    value={selectedSeats}
                    onChange={(event) =>
                      setSelectedSeats(event.target.value)
                    }
                    placeholder="Enter seats"
                    className="mt-3 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-lg font-bold text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />

                  <p className="mt-2 text-xs text-slate-500">
                    Enter the number of student seats your
                    school requires.
                  </p>
                </div>

                {/* Billing */}
                <div className="rounded-xl border border-slate-200 p-5">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-emerald-600" />

                    <span className="text-sm font-medium text-slate-500">
                      Total Billing
                    </span>
                  </div>

                  <p className="mt-3 text-2xl font-bold text-slate-900">
                    {formatCurrency(activationAmount)}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Per academic term
                  </p>
                </div>

                {/* Price per student */}
                <div className="rounded-xl border border-slate-200 p-5">
                  <div className="flex items-center gap-3">
                    <WalletCards className="h-5 w-5 text-emerald-600" />

                    <span className="text-sm font-medium text-slate-500">
                      Price Per Student
                    </span>
                  </div>

                  <p className="mt-3 text-2xl font-bold text-slate-900">
                    {formatCurrency(pricePerStudent)}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Per student seat
                  </p>
                </div>
              </div>

              {/* Activation summary */}
              <div className="mt-6 rounded-xl bg-slate-50 p-5">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">
                      Subscription Summary
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {Number.isInteger(seats) && seats > 0
                        ? `${seats} student seat${
                            seats === 1 ? "" : "s"
                          } × ${formatCurrency(
                            pricePerStudent
                          )}`
                        : "Enter your required number of student seats."}
                    </p>
                  </div>

                  <p className="text-xl font-bold text-slate-900">
                    {formatCurrency(activationAmount)}
                  </p>
                </div>
              </div>

              {/* Activation */}
              <div className="mt-6 flex flex-col gap-4 rounded-xl bg-slate-50 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-slate-900">
                    Ready to activate?
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    You will be redirected to Paystack to
                    complete your payment securely.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleActivateSubscription}
                  disabled={
                    creating ||
                    !Number.isInteger(seats) ||
                    seats < 1
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#166534] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#14532d] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {creating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Preparing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4" />
                      Activate Subscription
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Active subscription */}
          <div className="rounded-2xl border border-emerald-200 bg-white shadow-sm">
            <div className="flex flex-col gap-5 border-b border-slate-100 p-6 sm:flex-row sm:items-start sm:justify-between sm:p-8">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                    <BadgeCheck className="h-6 w-6" />
                  </div>

                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      Active Subscription
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Your school subscription is currently active.
                    </p>
                  </div>
                </div>
              </div>

              <span
                className={`inline-flex w-fit rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${getStatusClasses(
                  status,
                  isSubscribed
                )}`}
              >
                {status}
              </span>
            </div>

            <div className="p-6 sm:p-8">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-slate-200 p-5">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Student Limit
                  </p>

                  <p className="mt-2 text-2xl font-bold text-slate-900">
                    {studentLimit}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-5">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Active Students
                  </p>

                  <p className="mt-2 text-2xl font-bold text-slate-900">
                    {activeStudents}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-5">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Available Seats
                  </p>

                  <p className="mt-2 text-2xl font-bold text-emerald-600">
                    {availableSeats}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-5">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Subscription Amount
                  </p>

                  <p className="mt-2 text-2xl font-bold text-slate-900">
                    {formatCurrency(subscription?.amount)}
                  </p>
                </div>
              </div>

              {/* Usage */}
              <div className="mt-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">
                      Student Seat Usage
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {activeStudents} of {studentLimit} seats used
                    </p>
                  </div>

                  <span className="text-sm font-semibold text-slate-700">
                    {Math.round(usagePercentage)}%
                  </span>
                </div>

                <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all"
                    style={{
                      width: `${usagePercentage}%`,
                    }}
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Starts
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {formatDate(subscription?.startsAt)}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Expires
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {formatDate(subscription?.expiresAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Add seats */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <Plus className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Add Student Seats
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Need room for more students? Purchase
                    additional seats for{" "}
                    {formatCurrency(pricePerStudent)} each.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                <div className="w-full sm:max-w-xs">
                  <label
                    htmlFor="additionalSeats"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Additional seats
                  </label>

                  <input
                    id="additionalSeats"
                    type="number"
                    min="1"
                    step="1"
                    value={additionalSeats}
                    onChange={(event) =>
                      setAdditionalSeats(
                        event.target.value
                      )
                    }
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>

                <div className="rounded-xl bg-slate-50 px-5 py-3">
                  <p className="text-xs text-slate-400">
                    Total
                  </p>

                  <p className="text-lg font-bold text-slate-900">
                    {formatCurrency(additionalSeatsTotal)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddSeats}
                  disabled={
                    addingSeats ||
                    !Number.isInteger(
                      Number(additionalSeats)
                    ) ||
                    Number(additionalSeats) < 1
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#166534] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#14532d] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {addingSeats ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Redirecting...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4" />
                      Purchase Seats
                    </>
                  )}
                </button>
              </div>

              <p className="mt-4 text-xs leading-5 text-slate-400">
                Payments are processed securely through Paystack.
                Additional seats are added only after successful
                payment verification.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

