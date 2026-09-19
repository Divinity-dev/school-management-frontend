"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Eye, EyeOff, LockKeyhole } from "lucide-react";
import { useSearchParams } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function ResetPasswordPage() {
const searchParams = useSearchParams();

const email = searchParams.get("email");
const token = searchParams.get("token");

const [password, setPassword] = useState("");
const [confirmPassword, setConfirmPassword] = useState("");

const [showPassword, setShowPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] =
useState(false);

const [loading, setLoading] = useState(false);
const [error, setError] = useState("");
const [success, setSuccess] = useState(false);

const passwordStrength = useMemo(() => {
if (!password) {
return {
label: "",
width: "0%",
};
}

let score = 0;

if (password.length >= 8) score++;
if (/[A-Z]/.test(password)) score++;
if (/[a-z]/.test(password)) score++;
if (/[0-9]/.test(password)) score++;
if (/[^A-Za-z0-9]/.test(password)) score++;

if (score <= 2) {
  return {
    label: "Weak",
    width: "33%",
  };
}

if (score <= 4) {
  return {
    label: "Good",
    width: "66%",
  };
}

return {
  label: "Strong",
  width: "100%",
};

}, [password]);

const handleSubmit = async (e) => {
e.preventDefault();

setError("");

if (!email || !token) {
  setError(
    "This password reset session is invalid. Please request a new code."
  );
  return;
}

if (password.length < 8) {
  setError("Password must be at least 8 characters long.");
  return;
}

if (password !== confirmPassword) {
  setError("Passwords do not match.");
  return;
}

try {
  setLoading(true);

  const response = await fetch(
    `${API_URL}/auth/reset-password`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token,
        password,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Unable to reset your password."
    );
  }

  setSuccess(true);
} catch (error) {
  setError(
    error.message ||
      "Unable to reset your password. Please try again."
  );
} finally {
  setLoading(false);
}

};

if (success) {
return ( <main className="min-h-screen bg-slate-50 flex items-center justify-center px-6 py-12"> <div className="w-full max-w-md"> <div className="mb-10 flex items-center justify-center gap-3"> <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600 text-white"> <LockKeyhole size={23} /> </div>

        <span className="text-xl font-bold text-slate-900">
          SchoolManager
        </span>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
          <CheckCircle2
            size={32}
            className="text-emerald-600"
          />
        </div>

        <h1 className="text-2xl font-bold text-slate-900">
          Password reset successful
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-500">
          Your password has been changed successfully. You can
          now sign in using your new password.
        </p>

        <Link
          href="/login"
          className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
        >
          Continue to login
          <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  </main>
);

}

return ( <main className="min-h-screen bg-slate-50 flex items-center justify-center px-6 py-12"> <div className="w-full max-w-md"> <div className="mb-10 flex items-center justify-center gap-3"> <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600 text-white"> <LockKeyhole size={23} /> </div>

      <span className="text-xl font-bold text-slate-900">
        SchoolManager
      </span>
    </div>

    <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm sm:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Create a new password
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Choose a strong password for your SchoolManager
          account.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm leading-6 text-red-700">
            {error}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            New password
          </label>

          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your new password"
              autoComplete="new-password"
              required
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
            />

            <button
              type="button"
              onClick={() =>
                setShowPassword((current) => !current)
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
              aria-label={
                showPassword
                  ? "Hide password"
                  : "Show password"
              }
            >
              {showPassword ? (
                <EyeOff size={19} />
              ) : (
                <Eye size={19} />
              )}
            </button>
          </div>

          {password && (
            <div className="mt-3">
              <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                  style={{
                    width: passwordStrength.width,
                  }}
                />
              </div>

              <p className="mt-1.5 text-xs text-slate-500">
                Password strength:{" "}
                <span className="font-medium text-slate-700">
                  {passwordStrength.label}
                </span>
              </p>
            </div>
          )}
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Confirm password
          </label>

          <div className="relative">
            <input
              id="confirmPassword"
              type={
                showConfirmPassword ? "text" : "password"
              }
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(e.target.value)
              }
              placeholder="Confirm your new password"
              autoComplete="new-password"
              required
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
            />

            <button
              type="button"
              onClick={() =>
                setShowConfirmPassword(
                  (current) => !current
                )
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
              aria-label={
                showConfirmPassword
                  ? "Hide password"
                  : "Show password"
              }
            >
              {showConfirmPassword ? (
                <EyeOff size={19} />
              ) : (
                <Eye size={19} />
              )}
            </button>
          </div>
        </div>

        <div className="rounded-xl bg-slate-50 px-4 py-3">
          <p className="text-xs leading-5 text-slate-500">
            Your password must contain at least 8 characters.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Resetting password..." : "Reset password"}

          {!loading && <ArrowRight size={18} />}
        </button>
      </form>

      <div className="mt-7 text-center">
        <Link
          href="/login"
          className="text-sm font-semibold text-emerald-600 hover:text-emerald-700"
        >
          Back to login
        </Link>
      </div>
    </div>
  </div>
</main>

);
}
