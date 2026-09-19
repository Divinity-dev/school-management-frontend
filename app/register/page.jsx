"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
Eye,
EyeOff,
GraduationCap,
ArrowRight,
ArrowLeft,
ShieldCheck,
Users,
BarChart3,
Check,
} from "lucide-react";

import authService from "../../services/authService";

export default function RegisterPage() {
const router = useRouter();

const [step, setStep] = useState(1);

const [formData, setFormData] = useState({
schoolName: "",
schoolEmail: "",
schoolPhone: "",
address: "",
city: "",
state: "",


firstName: "",
lastName: "",
adminEmail: "",
adminPhone: "",
password: "",
confirmPassword: "",

});

const [showPassword, setShowPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);

const [error, setError] = useState("");
const [loading, setLoading] = useState(false);

const handleChange = (e) => {
setFormData({
...formData,
[e.target.name]: e.target.value,
});
};

const handleNext = (e) => {
e.preventDefault();
setError("");
setStep(2);
};

const handleBack = () => {
setError("");
setStep(1);
};

const handleSubmit = async (e) => {
e.preventDefault();

setError("");

if (formData.password.length < 8) {
  setError("Password must be at least 8 characters long.");
  return;
}

if (formData.password !== formData.confirmPassword) {
  setError("Passwords do not match.");
  return;
}

setLoading(true);

try {
  const registrationData = {
    school: {
      name: formData.schoolName,
      email: formData.schoolEmail,
      phone: formData.schoolPhone,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      country: "Nigeria",
    },

    admin: {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.adminEmail,
      phone: formData.adminPhone,
      password: formData.password,
    },
  };

  await authService.registerSchool(registrationData);

  router.push("/login?registered=true");
} catch (error) {
  setError(
    error.response?.data?.message ||
      "Unable to create your school account. Please try again."
  );
} finally {
  setLoading(false);
}


};

return ( <main className="min-h-screen bg-slate-50 lg:grid lg:grid-cols-2">
{/* Left side */} <section className="hidden bg-emerald-950 px-12 py-12 text-white lg:flex lg:flex-col lg:justify-between"> <div> <div className="flex items-center gap-3"> <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-400 text-emerald-950"> <GraduationCap size={25} /> </div>

```
        <span className="text-xl font-bold">
          SchoolManager
        </span>
      </div>
    </div>

    <div className="max-w-lg">
      <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-emerald-300">
        Start managing your school
      </p>

      <h1 className="text-4xl font-bold leading-tight xl:text-5xl">
        A smarter way to run your school.
      </h1>

      <p className="mt-6 text-lg leading-8 text-emerald-100/80">
        Bring your school's students, teachers, attendance, results,
        assignments, and fees together in one powerful platform.
      </p>

      <div className="mt-10 space-y-5">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
            <Users size={20} />
          </div>

          <div>
            <p className="font-semibold">One school, one platform</p>
            <p className="text-sm text-emerald-100/60">
              Keep your school operations organized.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
            <BarChart3 size={20} />
          </div>

          <div>
            <p className="font-semibold">Make better decisions</p>
            <p className="text-sm text-emerald-100/60">
              Access meaningful insights into your school.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
            <ShieldCheck size={20} />
          </div>

          <div>
            <p className="font-semibold">Your data, protected</p>
            <p className="text-sm text-emerald-100/60">
              Built with security and privacy in mind.
            </p>
          </div>
        </div>
      </div>
    </div>

    <p className="text-sm text-emerald-100/50">
      © {new Date().getFullYear()} SchoolManager
    </p>
  </section>

  {/* Right side */}
  <section className="flex min-h-screen items-center justify-center px-6 py-12 sm:px-10">
    <div className="w-full max-w-lg">
      {/* Mobile logo */}
      <div className="mb-10 flex items-center gap-3 lg:hidden">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600 text-white">
          <GraduationCap size={25} />
        </div>

        <span className="text-xl font-bold text-slate-900">
          SchoolManager
        </span>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">
          Register your school
        </h2>

        <p className="mt-2 text-slate-500">
          Create your school account and get started.
        </p>
      </div>

      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex items-center">
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold ${
              step >= 1
                ? "bg-emerald-600 text-white"
                : "bg-slate-200 text-slate-500"
            }`}
          >
            {step > 1 ? <Check size={17} /> : "1"}
          </div>

          <div
            className={`h-1 flex-1 ${
              step >= 2 ? "bg-emerald-600" : "bg-slate-200"
            }`}
          />

          <div
            className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold ${
              step >= 2
                ? "bg-emerald-600 text-white"
                : "bg-slate-200 text-slate-500"
            }`}
          >
            2
          </div>
        </div>

        <div className="mt-2 flex justify-between text-xs font-medium">
          <span
            className={
              step === 1 ? "text-emerald-700" : "text-slate-400"
            }
          >
            School information
          </span>

          <span
            className={
              step === 2 ? "text-emerald-700" : "text-slate-400"
            }
          >
            Administrator account
          </span>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Step 1 */}
      {step === 1 && (
        <form onSubmit={handleNext} className="space-y-5">
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-emerald-700">
              School information
            </h3>
          </div>

          <div>
            <label
              htmlFor="schoolName"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              School name
            </label>

            <input
              id="schoolName"
              name="schoolName"
              type="text"
              value={formData.schoolName}
              onChange={handleChange}
              placeholder="e.g. Divine International School"
              autoComplete="organization"
              required
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="schoolEmail"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                School email
              </label>

              <input
                id="schoolEmail"
                name="schoolEmail"
                type="email"
                value={formData.schoolEmail}
                onChange={handleChange}
                placeholder="school@example.com"
                autoComplete="email"
                required
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
              />
            </div>

            <div>
              <label
                htmlFor="schoolPhone"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                School phone
              </label>

              <input
                id="schoolPhone"
                name="schoolPhone"
                type="tel"
                value={formData.schoolPhone}
                onChange={handleChange}
                placeholder="08012345678"
                autoComplete="tel"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="address"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              School address
            </label>

            <input
              id="address"
              name="address"
              type="text"
              value={formData.address}
              onChange={handleChange}
              placeholder="School street address"
              autoComplete="street-address"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="city"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                City
              </label>

              <input
                id="city"
                name="city"
                type="text"
                value={formData.city}
                onChange={handleChange}
                placeholder="e.g. Benin City"
                required
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
              />
            </div>

            <div>
              <label
                htmlFor="state"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                State
              </label>

              <input
                id="state"
                name="state"
                type="text"
                value={formData.state}
                onChange={handleChange}
                placeholder="e.g. Edo"
                required
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
              />
            </div>
          </div>

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
          >
            Continue
            <ArrowRight size={18} />
          </button>
        </form>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-emerald-700">
              Administrator account
            </h3>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="firstName"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                First name
              </label>

              <input
                id="firstName"
                name="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="John"
                autoComplete="given-name"
                required
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
              />
            </div>

            <div>
              <label
                htmlFor="lastName"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Last name
              </label>

              <input
                id="lastName"
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Doe"
                autoComplete="family-name"
                required
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="adminEmail"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Administrator email
            </label>

            <input
              id="adminEmail"
              name="adminEmail"
              type="email"
              value={formData.adminEmail}
              onChange={handleChange}
              placeholder="admin@example.com"
              autoComplete="email"
              required
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
            />
          </div>

          <div>
            <label
              htmlFor="adminPhone"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Administrator phone
            </label>

            <input
              id="adminPhone"
              name="adminPhone"
              type="tel"
              value={formData.adminPhone}
              onChange={handleChange}
              placeholder="08012345678"
              autoComplete="tel"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Password
            </label>

            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
                autoComplete="new-password"
                minLength={8}
                required
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showPassword ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>
            </div>

            <p className="mt-2 text-xs text-slate-400">
              Password must be at least 8 characters.
            </p>
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
                name="confirmPassword"
                type={
                  showConfirmPassword ? "text" : "password"
                }
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                autoComplete="new-password"
                required
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                aria-label={
                  showConfirmPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showConfirmPassword ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleBack}
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <ArrowLeft size={18} />
              Back
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Creating account..."
                : "Create school account"}

              {!loading && <ArrowRight size={18} />}
            </button>
          </div>
        </form>
      )}

      <p className="mt-8 text-center text-sm text-slate-500">
        Already have a school account?{" "}
        <a
          href="/login"
          className="font-semibold text-emerald-600 hover:text-emerald-700"
        >
          Sign in
        </a>
      </p>
    </div>
  </section>
</main>


);
}
