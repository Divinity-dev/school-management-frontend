"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Edit3,
  GraduationCap,
  KeyRound,
  Loader2,
  Mail,
  Phone,
  Save,
  ShieldCheck,
  User,
  UserRound,
  X,
} from "lucide-react";

import api from "@/lib/api";

export default function TeacherProfile() {
  const [profile, setProfile] = useState(null);

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const [editing, setEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] =
    useState(false);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/users/me");

        const user = response.data?.user;

        setProfile(user);

        setForm({
          firstName: user?.firstName || "",
          lastName: user?.lastName || "",
          phone: user?.phone || "",
        });
      } catch (err) {
        console.error(
          "Failed to load teacher profile:",
          err
        );

        setError(
          err.response?.data?.message ||
            "Unable to load your profile."
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleFormChange = (e) => {
    const { name, value } = e.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;

    setPasswordForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const saveProfile = async () => {
    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError("First name and last name are required.");
      return;
    }

    try {
      setSavingProfile(true);
      setError("");
      setMessage("");

      const response = await api.put("/users/me", {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phone: form.phone.trim(),
      });

      const updatedUser = response.data?.user;

      setProfile(updatedUser);

      setForm({
        firstName: updatedUser?.firstName || "",
        lastName: updatedUser?.lastName || "",
        phone: updatedUser?.phone || "",
      });

      setEditing(false);

      setMessage(
        response.data?.message ||
          "Profile updated successfully."
      );
    } catch (err) {
      console.error(
        "Failed to update teacher profile:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to update your profile."
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const cancelEditing = () => {
    setForm({
      firstName: profile?.firstName || "",
      lastName: profile?.lastName || "",
      phone: profile?.phone || "",
    });

    setEditing(false);
    setError("");
  };

  const changePassword = async () => {
    if (
      !passwordForm.currentPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      setError("Please complete all password fields.");
      return;
    }

    if (
      passwordForm.newPassword !==
      passwordForm.confirmPassword
    ) {
      setError("New passwords do not match.");
      return;
    }

    try {
      setSavingPassword(true);
      setError("");
      setMessage("");

      const response = await api.put(
        "/users/me/password",
        passwordForm
      );

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setShowPasswordForm(false);

      setMessage(
        response.data?.message ||
          "Password changed successfully."
      );
    } catch (err) {
      console.error(
        "Failed to change password:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to change your password."
      );
    } finally {
      setSavingPassword(false);
    }
  };

  const getInitials = () => {
    if (!profile) return "T";

    return `${profile.firstName?.[0] || ""}${
      profile.lastName?.[0] || ""
    }`.toUpperCase();
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[400px] max-w-5xl items-center justify-center">
          <div className="flex items-center gap-3 text-slate-500">
            <Loader2
              size={20}
              className="animate-spin"
            />
            <span>Loading your profile...</span>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard/teacher"
            className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-emerald-600"
          >
            <ArrowLeft size={17} />
            Back to Dashboard
          </Link>

          <div>
            <p className="text-sm font-medium text-emerald-600">
              Teacher Portal
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              My Profile
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Manage your personal information and account
              security.
            </p>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle
              size={18}
              className="mt-0.5 shrink-0"
            />
            <p>{error}</p>
          </div>
        )}

        {message && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            <CheckCircle2
              size={18}
              className="mt-0.5 shrink-0"
            />
            <p>{message}</p>
          </div>
        )}

        {/* Profile overview */}
        <section className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="bg-slate-900 shadow-sm px-6 py-8 sm:px-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              {/* Avatar */}
              <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-4 border-white/30 bg-white text-2xl font-bold text-emerald-700 shadow-sm">
                {profile?.profileImage ? (
                  <img
                    src={profile.profileImage}
                    alt={`${profile.firstName} ${profile.lastName}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  getInitials()
                )}
              </div>

              <div className="text-white">
                <h2 className="text-xl font-bold sm:text-2xl">
                  {profile?.firstName}{" "}
                  {profile?.lastName}
                </h2>

                <p className="mt-1 text-sm text-emerald-100">
                  Teacher
                </p>

                {profile?.school?.name && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-emerald-100">
                    <GraduationCap size={15} />
                    {profile.school.name}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-4 p-6 sm:grid-cols-2 sm:p-8">
            <InfoItem
              icon={Mail}
              label="Email"
              value={profile?.email}
            />

            <InfoItem
              icon={Phone}
              label="Phone"
              value={profile?.phone || "Not provided"}
            />

            <InfoItem
              icon={ShieldCheck}
              label="Account Role"
              value="Teacher"
            />

            <InfoItem
              icon={GraduationCap}
              label="School"
              value={
                profile?.school?.name ||
                "Not available"
              }
            />
          </div>
        </section>

        {/* Personal information */}
        <section className="mb-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-100 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div>
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                  <UserRound size={20} />
                </div>

                <div>
                  <h2 className="font-semibold text-slate-900">
                    Personal Information
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Update your name and contact information.
                  </p>
                </div>
              </div>
            </div>

            {!editing && (
              <button
                type="button"
                onClick={() => {
                  setEditing(true);
                  setError("");
                  setMessage("");
                }}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-emerald-200 hover:text-emerald-700"
              >
                <Edit3 size={16} />
                Edit Profile
              </button>
            )}
          </div>

          <div className="grid gap-5 p-6 sm:grid-cols-2 sm:p-8">
            <InputField
              label="First Name"
              name="firstName"
              value={form.firstName}
              onChange={handleFormChange}
              disabled={!editing}
              icon={User}
            />

            <InputField
              label="Last Name"
              name="lastName"
              value={form.lastName}
              onChange={handleFormChange}
              disabled={!editing}
              icon={User}
            />

            <InputField
              label="Email Address"
              value={profile?.email || ""}
              disabled
              icon={Mail}
              helper="Email address cannot be changed here."
            />

            <InputField
              label="Phone Number"
              name="phone"
              value={form.phone}
              onChange={handleFormChange}
              disabled={!editing}
              icon={Phone}
              placeholder="Enter your phone number"
            />
          </div>

          {editing && (
            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50 p-6 sm:flex-row sm:justify-end sm:p-8">
              <button
                type="button"
                onClick={cancelEditing}
                disabled={savingProfile}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
              >
                <X size={16} />
                Cancel
              </button>

              <button
                type="button"
                onClick={saveProfile}
                disabled={savingProfile}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {savingProfile ? (
                  <>
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          )}
        </section>

        {/* Password */}
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-slate-100 p-3 text-slate-600">
                <KeyRound size={20} />
              </div>

              <div>
                <h2 className="font-semibold text-slate-900">
                  Password & Security
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Keep your account secure by using a strong password.
                </p>
              </div>
            </div>

            {!showPasswordForm && (
              <button
                type="button"
                onClick={() => {
                  setShowPasswordForm(true);
                  setError("");
                  setMessage("");
                }}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-emerald-200 hover:text-emerald-700"
              >
                <KeyRound size={16} />
                Change Password
              </button>
            )}
          </div>

          {showPasswordForm && (
            <div className="border-t border-slate-100 bg-slate-50 p-6 sm:p-8">
              <div className="grid gap-5 md:grid-cols-3">
                <InputField
                  label="Current Password"
                  name="currentPassword"
                  type="password"
                  value={
                    passwordForm.currentPassword
                  }
                  onChange={handlePasswordChange}
                  placeholder="Current password"
                />

                <InputField
                  label="New Password"
                  name="newPassword"
                  type="password"
                  value={
                    passwordForm.newPassword
                  }
                  onChange={handlePasswordChange}
                  placeholder="At least 8 characters"
                />

                <InputField
                  label="Confirm New Password"
                  name="confirmPassword"
                  type="password"
                  value={
                    passwordForm.confirmPassword
                  }
                  onChange={handlePasswordChange}
                  placeholder="Confirm password"
                />
              </div>

              <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordForm(false);

                    setPasswordForm({
                      currentPassword: "",
                      newPassword: "",
                      confirmPassword: "",
                    });
                  }}
                  disabled={savingPassword}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
                >
                  <X size={16} />
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={changePassword}
                  disabled={savingPassword}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {savingPassword ? (
                    <>
                      <Loader2
                        size={16}
                        className="animate-spin"
                      />
                      Updating...
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={16} />
                      Update Password
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}


/* =========================================================
   INFO ITEM
========================================================= */

function InfoItem({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4">
      <div className="mt-0.5 text-slate-400">
        <Icon size={17} />
      </div>

      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
          {label}
        </p>

        <p className="mt-1 truncate text-sm font-medium text-slate-700">
          {value || "Not provided"}
        </p>
      </div>
    </div>
  );
}


/* =========================================================
   INPUT FIELD
========================================================= */

function InputField({
  label,
  name,
  value,
  onChange,
  disabled = false,
  type = "text",
  icon: Icon,
  placeholder,
  helper,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <div className="relative">
        {Icon && (
          <Icon
            size={17}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
        )}

        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          className={`w-full rounded-xl border border-slate-300 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 ${
            Icon ? "pl-10 pr-4" : "px-4"
          } ${
            disabled
              ? "cursor-not-allowed bg-slate-100 text-slate-500"
              : "bg-white text-slate-800"
          }`}
        />
      </div>

      {helper && (
        <p className="mt-1.5 text-xs text-slate-400">
          {helper}
        </p>
      )}
    </div>
  );
}