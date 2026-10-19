
"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  GraduationCap,
  ArrowRight,
  ShieldCheck,
  Users,
  BarChart3,
  Loader2,
} from "lucide-react";

import authService from "../../services/authService";
import { setCredentials } from "../../store/slices/authSlice";
import { getLoginRedirectPath } from "../../lib/dashboardNavigation";

export default function LoginPage() {
  const dispatch = useDispatch();
  const router = useRouter();

  const { user, isAuthenticated, isInitialized } = useSelector(
    (state) => state.auth
  );

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
      {/* Platform branding panel */}
      <section className="relative hidden overflow-hidden bg-slate-950 px-12 py-12 text-white lg:flex lg:w-1/2 lg:flex-col lg:justify-between xl:px-20">
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-emerald-400/10 blur-3xl" />

        <Link href="/" className="relative z-10 inline-flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400 text-slate-950">
            <GraduationCap size={29} />
          </div>

          <div>
            <p className="text-xl font-bold tracking-tight">SchoolPilot</p>
            <p className="text-xs text-slate-400">
              Run your school smarter.
            </p>
          </div>
        </Link>

        <div className="relative z-10 max-w-lg py-12">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-300">
            <ShieldCheck size={16} />
            School management made simpler
          </span>

          <h1 className="mt-8 text-4xl font-bold leading-tight xl:text-5xl">
            Everything your school needs, in one place.
          </h1>

          <p className="mt-6 max-w-md text-lg leading-8 text-slate-400">
            Manage students, teachers, attendance, results, fees, and
            everyday school activities from one platform.
          </p>

          <div className="mt-10 space-y-5">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-emerald-300">
                <Users size={21} />
              </div>
              <div>
                <p className="font-semibold">One connected platform</p>
                <p className="mt-1 text-sm text-slate-400">
                  Keep your school community organised.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-emerald-300">
                <BarChart3 size={21} />
              </div>
              <div>
                <p className="font-semibold">Better school oversight</p>
                <p className="mt-1 text-sm text-slate-400">
                  Access important academic and administrative records.
                </p>
              </div>
            </div>
          </div>
        </div>

        <p className="relative z-10 text-sm text-slate-500">
          SchoolPilot · Run your school smarter.
        </p>
      </section>

      {/* Main platform login */}
      <section className="flex w-full items-center justify-center px-6 py-12 sm:px-10 lg:w-1/2">
        <div className="w-full max-w-md">
          <Link
            href="/"
            className="mb-10 inline-flex items-center gap-3 lg:hidden"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500 text-slate-950">
              <GraduationCap size={26} />
            </div>
            <div>
              <p className="text-lg font-bold text-slate-950">SchoolPilot</p>
              <p className="text-xs text-slate-500">
                Run your school smarter.
              </p>
            </div>
          </Link>

          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-emerald-600">
              Welcome back
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
              Sign in to SchoolPilot
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              Enter your account details to continue to your dashboard.
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

          {/* Always available on the main platform login */}
          <div className="my-8 flex items-center gap-4">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-xs text-slate-400">OR</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <p className="text-center text-sm text-slate-500">
            Don&apos;t have a school account?{" "}
            <Link
              href="/register"
              className="font-semibold text-emerald-600 transition hover:text-emerald-700"
            >
              Register your school
            </Link>
          </p>

          <p className="mt-10 text-center text-xs text-slate-400">
            By signing in, you agree to use SchoolPilot in accordance with
            your school&apos;s policies and applicable terms.
          </p>
        </div>
      </section>
    </main>
  );
}
