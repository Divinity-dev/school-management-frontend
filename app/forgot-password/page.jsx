"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  KeyRound,
  Mail,
  RefreshCw,
  ShieldCheck,
  X,
} from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [countdown, setCountdown] = useState(600);
  const [verifying, setVerifying] = useState(false);

  const inputRefs = useRef([]);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // OTP countdown
  useEffect(() => {
    if (!showOtpModal) return;
    if (countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showOtpModal, countdown]);

  // Focus first OTP input when modal opens
  useEffect(() => {
    if (showOtpModal) {
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [showOtpModal]);

  const formatTime = () => {
    const minutes = Math.floor(countdown / 60);
    const seconds = countdown % 60;

    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: normalizedEmail,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to process your request."
        );
      }

      setMessage(
        data.message ||
          "If an account exists with that email, a verification code has been sent."
      );

      setCountdown(600);
      setOtp(["", "", "", "", "", ""]);
      setShowOtpModal(true);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    // Only allow numbers
    const numericValue = value.replace(/\D/g, "");

    if (!numericValue) {
      const updatedOtp = [...otp];
      updatedOtp[index] = "";
      setOtp(updatedOtp);
      return;
    }

    const updatedOtp = [...otp];

    // Handle pasted/multiple digits
    if (numericValue.length > 1) {
      const digits = numericValue.slice(0, 6).split("");

      digits.forEach((digit, digitIndex) => {
        if (index + digitIndex < 6) {
          updatedOtp[index + digitIndex] = digit;
        }
      });

      setOtp(updatedOtp);

      const nextIndex = Math.min(index + digits.length, 5);

      setTimeout(() => {
        inputRefs.current[nextIndex]?.focus();
      }, 0);

      return;
    }

    updatedOtp[index] = numericValue;
    setOtp(updatedOtp);

    if (index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();

    const pastedData = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    if (!pastedData) return;

    const updatedOtp = ["", "", "", "", "", ""];

    pastedData.split("").forEach((digit, index) => {
      updatedOtp[index] = digit;
    });

    setOtp(updatedOtp);

    const nextIndex = Math.min(pastedData.length, 5);

    setTimeout(() => {
      inputRefs.current[nextIndex]?.focus();
    }, 0);
  };

  const handleVerifyOtp = async () => {
    setError("");
    setMessage("");

    const enteredOtp = otp.join("");

    if (enteredOtp.length !== 6) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }

    setVerifying(true);

    try {
      const response = await fetch(`${API_URL}/auth/verify-reset-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          otp: enteredOtp,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Invalid or expired verification code."
        );
      }

      const params = new URLSearchParams({
        email: email.trim().toLowerCase(),
        token: enteredOtp,
      });

      window.location.href = `/reset-password?${params.toString()}`;
    } catch (err) {
      setError(
        err.message || "Unable to verify the code. Please try again."
      );
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || resending) return;

    setError("");
    setMessage("");
    setResending(true);

    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to resend verification code."
        );
      }

      setOtp(["", "", "", "", "", ""]);
      setCountdown(600);

      setMessage(
        data.message ||
          "A new verification code has been sent to your email."
      );

      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    } catch (err) {
      setError(
        err.message || "Unable to resend the code. Please try again."
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        {/* Back to login */}
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-emerald-600 transition mb-8"
        >
          <ArrowLeft size={17} />
          Back to login
        </Link>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 sm:p-10">
          {/* Logo */}
          <div className="flex justify-center mb-7">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center">
              <KeyRound
                size={30}
                className="text-emerald-600"
              />
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900">
              Forgot your password?
            </h1>

            <p className="mt-3 text-slate-500 leading-relaxed">
              Enter your email address and we&apos;ll send you a
              verification code to reset your password.
            </p>
          </div>

          {/* Success message */}
          {message && !showOtpModal && (
            <div className="mb-5 rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-3 flex items-start gap-3">
              <CheckCircle2
                size={19}
                className="text-emerald-600 mt-0.5 shrink-0"
              />

              <p className="text-sm text-emerald-700">
                {message}
              </p>
            </div>
          )}

          {/* Error */}
          {error && !showOtpModal && (
            <div className="mb-5 rounded-xl bg-red-50 border border-red-100 px-4 py-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleEmailSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-slate-700 mb-2"
              >
                Email address
              </label>

              <div className="relative">
                <Mail
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="w-full h-13 pl-12 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-13 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw size={18} className="animate-spin" />
                  Sending code...
                </>
              ) : (
                <>
                  <ShieldCheck size={18} />
                  Send verification code
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-500">
              Remember your password?{" "}
              <Link
                href="/login"
                className="font-semibold text-emerald-600 hover:text-emerald-700"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          SchoolManager
        </p>
      </div>

      {/* OTP Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-7 sm:p-9">
            {/* Close */}
            <button
              type="button"
              onClick={() => {
                setShowOtpModal(false);
                setError("");
              }}
              className="absolute right-5 top-5 w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 transition"
              aria-label="Close"
            >
              <X size={19} />
            </button>

            <div className="text-center">
              <div className="mx-auto w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center mb-5">
                <Mail
                  size={25}
                  className="text-emerald-600"
                />
              </div>

              <h2 className="text-2xl font-bold text-slate-900">
                Check your email
              </h2>

              <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                We sent a 6-digit verification code to
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-800 break-all">
                {email}
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="mt-5 rounded-xl bg-red-50 border border-red-100 px-4 py-3">
                <p className="text-sm text-red-600 text-center">
                  {error}
                </p>
              </div>
            )}

            {/* OTP inputs */}
            <div className="flex justify-center gap-2 sm:gap-3 mt-8">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(element) => {
                    inputRefs.current[index] = element;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={digit}
                  onChange={(e) =>
                    handleOtpChange(index, e.target.value)
                  }
                  onKeyDown={(e) =>
                    handleOtpKeyDown(index, e)
                  }
                  onPaste={handleOtpPaste}
                  className="w-11 h-13 sm:w-12 sm:h-14 rounded-xl border border-slate-200 bg-slate-50 text-center text-xl font-bold text-slate-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition"
                  aria-label={`Verification code digit ${index + 1}`}
                />
              ))}
            </div>

            {/* Timer */}
            <div className="text-center mt-6">
              {countdown > 0 ? (
                <p className="text-sm text-slate-500">
                  Code expires in{" "}
                  <span className="font-semibold text-emerald-600">
                    {formatTime()}
                  </span>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resending}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 hover:text-emerald-700 disabled:opacity-50"
                >
                  <RefreshCw
                    size={16}
                    className={resending ? "animate-spin" : ""}
                  />
                  {resending ? "Sending..." : "Resend code"}
                </button>
              )}
            </div>

            {/* Verify */}
            <button
              type="button"
              onClick={handleVerifyOtp}
              disabled={verifying || otp.join("").length !== 6}
              className="w-full mt-7 h-13 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition"
            >
              {verifying ? "Verifying..." : "Verify code"}
            </button>

            <p className="text-xs text-slate-400 text-center mt-5">
              Didn&apos;t receive the email? Check your spam or
              junk folder.
            </p>
          </div>
        </div>
      )}
    </main>
  );
}