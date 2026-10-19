
"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  GraduationCap,
  ArrowRight,
  ShieldCheck,
  Loader2,
} from "lucide-react";

import authService from "../../../services/authService";
import { setCredentials } from "../../../store/slices/authSlice";
import { getLoginRedirectPath } from "../../../lib/dashboardNavigation";

function formatSchoolName(slug) {
  if (!slug) return "School Portal";

  return slug
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function SchoolLoginPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const params = useParams();

  const slug = params?.slug;
  const schoolName = formatSchoolName(slug);

  const { user, isAuthenticated, isInitialized } = useSelector(
    (state) => state.auth
  );

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Redirect authenticated users to their appropriate dashboard.
  useEffect(() => {
    if (isInitialized && isAuthenticated && user) {
      router.replace(getLoginRedirectPath(user));
    }
  }, [isInitialized, isAuthenticated, user, router]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!identifier.trim() || !password) {
      setError("Please enter your email/username and password.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.login({
        identifier: identifier.trim(),
        password,
      });

      const result = response?.data ?? response;
      const payload = result?.data ?? result;

      const token =
        payload?.token ||
        payload?.accessToken ||
        payload?.access_token;

      const loggedInUser = payload?.user;

      if (!token || !loggedInUser) {
        throw new Error(
          "Login response is missing the user or authentication token."
        );
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(loggedInUser));

      dispatch(
        setCredentials({
          user: loggedInUser,
          token,
        })
      );

      router.replace(getLoginRedirectPath(loggedInUser));
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Login failed. Please check your details and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!isInitialized || isAuthenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 text-slate-600">
          <Loader2 className="animate-spin" size={22} />
          <span>Checking your session...</span>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen bg-white">
      {/* School branding panel */}
      <section className="relative hidden overflow-hidden bg-slate-950 px-12 py-12 text-white lg:flex lg:w-1/2 lg:flex-col lg:justify-between xl:px-20">
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-emerald-400/10 blur-3xl" />

        <Link
          href={`/${slug}`}
          className="relative z-10 inline-flex items-center gap-3"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400 text-slate-950">
            <GraduationCap size={29} />
          </div>

          <div>
            <p className="text-xl font-bold tracking-tight">{schoolName}</p>
            <p className="text-xs text-slate-400">School Portal</p>
          </div>
        </Link>

        <div className="relative z-10 max-w-lg py-12">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-300">
            <ShieldCheck size={16} />
            Secure school access
          </span>

          <h1 className="mt-8 text-4xl font-bold leading-tight xl:text-5xl">
            Welcome to your school portal.
          </h1>

          <p className="mt-6 max-w-md text-lg leading-8 text-slate-400">
            Access your school dashboard to manage or view academic
            activities, results, attendance, assignments, and other
            school information available to your account.
          </p>
        </div>

        <p className="relative z-10 text-sm text-slate-500">
          Powered by SchoolPilot · Run your school smarter.
        </p>
      </section>

      {/* School login form */}
      <section className="flex w-full items-center justify-center px-6 py-12 sm:px-10 lg:w-1/2">
        <div className="w-full max-w-md">
          <Link
            href={`/${slug}`}
            className="mb-10 inline-flex items-center gap-3 lg:hidden"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500 text-slate-950">
              <GraduationCap size={26} />
            </div>

            <div>
              <p className="text-lg font-bold text-slate-950">
                {schoolName}
              </p>
              <p className="text-xs text-slate-500">School Portal</p>
            </div>
          </Link>

          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-emerald-600">
              School Portal
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
              Sign in to {schoolName}
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              Use the account details provided by your school to
              continue to your dashboard.
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label
                htmlFor="identifier"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Email or username
              </label>

              <input
                id="identifier"
                name="identifier"
                type="text"
                autoComplete="username"
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                placeholder="Enter your email or username"
                required
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between gap-4">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-700"
                >
                  Password
                </label>

                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-emerald-600 transition hover:text-emerald-700"
                >
                  Forgot password?
                </Link>
              </div>

              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 transition hover:text-slate-700"
                >
                  {showPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* No registration option on school-specific login */}
          <p className="mt-8 text-center text-sm leading-6 text-slate-500">
            Need an account or having trouble signing in? Contact your
            school administrator.
          </p>

          <div className="mt-8 border-t border-slate-100 pt-6 text-center">
            <Link
              href={`/${slug}`}
              className="text-sm font-medium text-emerald-600 transition hover:text-emerald-700"
            >
              Back to {schoolName}
            </Link>
          </div>

          <p className="mt-8 text-center text-xs text-slate-400">
            Powered by SchoolPilot
          </p>
        </div>
      </section>
    </main>
  );
}
