"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
ArrowLeft,
User,
UserPlus,
Mail,
Phone,
LockKeyhole,
Eye,
EyeOff,
Loader2,
} from "lucide-react";

import api from "@/lib/api";

export default function TeacherForm({
mode = "create",
teacherId = null,
}) {
const router = useRouter();

const isEditMode = mode === "edit";

const [loading, setLoading] = useState(isEditMode);
const [submitting, setSubmitting] = useState(false);

const [showPassword, setShowPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] =
useState(false);

const [error, setError] = useState("");
const [success, setSuccess] = useState("");

const [formData, setFormData] = useState({
firstName: "",
lastName: "",
email: "",
phone: "",
password: "",
confirmPassword: "",
});

// --------------------------------------------------
// Load teacher when editing
// --------------------------------------------------

useEffect(() => {
const loadTeacher = async () => {
if (!isEditMode || !teacherId) {
setLoading(false);
return;
}

  try {
    setLoading(true);
    setError("");

    const response = await api.get(
      `/teachers/${teacherId}`
    );

    const teacher =
      response.data?.teacher || response.data;

    if (!teacher) {
      throw new Error(
        "Teacher information was not found."
      );
    }

    setFormData({
      firstName: teacher.firstName || "",
      lastName: teacher.lastName || "",
      email: teacher.email || "",
      phone: teacher.phone || "",
      password: "",
      confirmPassword: "",
    });
  } catch (err) {
    console.error(
      "Failed to load teacher:",
      err
    );

    setError(
      err?.response?.data?.message ||
        err?.message ||
        "Failed to load teacher information."
    );
  } finally {
    setLoading(false);
  }
};

loadTeacher();

}, [isEditMode, teacherId]);

// --------------------------------------------------
// Input handler
// --------------------------------------------------

const handleChange = (event) => {
const { name, value } = event.target;

setFormData((prev) => ({
  ...prev,
  [name]: value,
}));

if (error) {
  setError("");
}

if (success) {
  setSuccess("");
}

};

// --------------------------------------------------
// Submit
// --------------------------------------------------

const handleSubmit = async (event) => {
event.preventDefault();

setError("");
setSuccess("");

if (!formData.firstName.trim()) {
  setError("First name is required.");
  return;
}

if (!formData.lastName.trim()) {
  setError("Last name is required.");
  return;
}

if (!formData.email.trim()) {
  setError("Email address is required.");
  return;
}

if (!isEditMode && !formData.password) {
  setError("Password is required.");
  return;
}

if (
  formData.password &&
  formData.password.length < 6
) {
  setError(
    "Password must be at least 6 characters."
  );
  return;
}

if (
  formData.password !==
  formData.confirmPassword
) {
  setError("Passwords do not match.");
  return;
}

try {
  setSubmitting(true);

  const payload = {
    firstName: formData.firstName.trim(),
    lastName: formData.lastName.trim(),
    email: formData.email.trim(),
    phone: formData.phone.trim(),
  };

  if (formData.password) {
    payload.password = formData.password;
  }

  if (isEditMode) {
    await api.put(
      `/teachers/${teacherId}`,
      payload
    );

    setSuccess(
      "Teacher updated successfully."
    );

    setTimeout(() => {
      router.push(
        `/dashboard/school-admin/teachers/${teacherId}`
      );
    }, 1000);
  } else {
    await api.post("/teachers", payload);

    setSuccess(
      "Teacher created successfully."
    );

    setTimeout(() => {
      router.push(
        "/dashboard/school-admin/teachers"
      );
    }, 1000);
  }
} catch (err) {
  console.error(
    isEditMode
      ? "Failed to update teacher:"
      : "Failed to create teacher:",
    err
  );

  setError(
    err?.response?.data?.message ||
      (isEditMode
        ? "Failed to update teacher. Please try again."
        : "Failed to create teacher. Please try again.")
  );
} finally {
  setSubmitting(false);
}

};

// --------------------------------------------------
// Loading state
// --------------------------------------------------

if (loading) {
return ( <div className="flex min-h-[60vh] items-center justify-center"> <div className="flex items-center gap-3 text-slate-600"> <Loader2 className="h-5 w-5 animate-spin" /> <span>
Loading teacher information... </span> </div> </div>
);
}

return ( <div className="space-y-6 p-4 sm:p-6 lg:p-8">
{/* Header */} <div>
<button
type="button"
onClick={() =>
router.push(
isEditMode
? `/dashboard/school-admin/teachers/${teacherId}`
: "/dashboard/school-admin/teachers"
)
}
className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-emerald-600"
> <ArrowLeft className="h-4 w-4" />

      {isEditMode
        ? "Back to Teacher"
        : "Back to Teachers"}
    </button>

    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
        {isEditMode ? (
          <User className="h-5 w-5" />
        ) : (
          <UserPlus className="h-5 w-5" />
        )}
      </div>

      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          {isEditMode
            ? "Edit Teacher"
            : "Add New Teacher"}
        </h1>

        <p className="text-sm text-slate-500">
          {isEditMode
            ? "Update the teacher's account information."
            : "Create a new teacher account for your school."}
        </p>
      </div>
    </div>
  </div>

  {/* Error */}
  {error && (
    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
      {error}
    </div>
  )}

  {/* Success */}
  {success && (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
      {success}
    </div>
  )}

  <form
    onSubmit={handleSubmit}
    className="space-y-6"
  >
    {/* Personal Information */}
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
          <User className="h-5 w-5" />
        </div>

        <div>
          <h2 className="font-semibold text-slate-900">
            Personal Information
          </h2>

          <p className="text-sm text-slate-500">
            Enter the teacher's personal details.
          </p>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Input
          label="First Name"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          placeholder="First name"
          required
        />

        <Input
          label="Last Name"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          placeholder="Last name"
          required
        />

        <Input
          label="Phone"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleChange}
          placeholder="Phone number"
        />
      </div>
    </section>

    {/* Account Information */}
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
          <Mail className="h-5 w-5" />
        </div>

        <div>
          <h2 className="font-semibold text-slate-900">
            Account Information
          </h2>

          <p className="text-sm text-slate-500">
            Set the teacher's login credentials.
          </p>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Input
          label="Email Address"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="teacher@example.com"
          required
        />

        <PasswordInput
          label={
            isEditMode
              ? "New Password"
              : "Password"
          }
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder={
            isEditMode
              ? "Leave blank to keep current password"
              : "Enter password"
          }
          show={showPassword}
          onToggle={() =>
            setShowPassword((prev) => !prev)
          }
          required={!isEditMode}
        />

        <PasswordInput
          label="Confirm Password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="Confirm password"
          show={showConfirmPassword}
          onToggle={() =>
            setShowConfirmPassword(
              (prev) => !prev
            )
          }
          required={!isEditMode}
        />
      </div>
    </section>

    {/* Actions */}
    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
      <button
        type="button"
        onClick={() =>
          router.push(
            isEditMode
              ? `/dashboard/school-admin/teachers/${teacherId}`
              : "/dashboard/school-admin/teachers"
          )
        }
        disabled={submitting}
        className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        Cancel
      </button>

      <button
        type="submit"
        disabled={submitting}
        className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />

            {isEditMode
              ? "Saving Changes..."
              : "Creating..."}
          </>
        ) : (
          <>
            {isEditMode ? (
              <User className="h-4 w-4" />
            ) : (
              <UserPlus className="h-4 w-4" />
            )}

            {isEditMode
              ? "Save Changes"
              : "Create Teacher"}
          </>
        )}
      </button>
    </div>
  </form>
</div>

);
}

// --------------------------------------------------
// Reusable input
// --------------------------------------------------

function Input({
label,
name,
type = "text",
value,
onChange,
placeholder,
required = false,
}) {
return ( <div> <label className="mb-2 block text-sm font-medium text-slate-700">
{label}

    {required && (
      <span className="ml-1 text-red-500">
        *
      </span>
    )}
  </label>

  <input
    type={type}
    name={name}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    required={required}
    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
  />
</div>

);
}

// --------------------------------------------------
// Password input
// --------------------------------------------------

function PasswordInput({
label,
name,
value,
onChange,
placeholder,
show,
onToggle,
required = false,
}) {
return ( <div> <label className="mb-2 block text-sm font-medium text-slate-700">
{label}

    {required && (
      <span className="ml-1 text-red-500">
        *
      </span>
    )}
  </label>

  <div className="relative">
    <input
      type={show ? "text" : "password"}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className="w-full rounded-xl border border-slate-200 px-4 py-3 pr-11 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
    />

    <button
      type="button"
      onClick={onToggle}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
      aria-label={
        show
          ? "Hide password"
          : "Show password"
      }
    >
      {show ? (
        <EyeOff className="h-4 w-4" />
      ) : (
        <Eye className="h-4 w-4" />
      )}
    </button>
  </div>
</div>

);
}
