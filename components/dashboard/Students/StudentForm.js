"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
ArrowLeft,
UserPlus,
User,
GraduationCap,
Users,
Loader2,
} from "lucide-react";

import api from "@/lib/api";

export default function StudentForm({ mode = "create", studentId = null }) {
const router = useRouter();

const isEditMode = mode === "edit";

const [sessions, setSessions] = useState([]);
const [classes, setClasses] = useState([]);
const [parents, setParents] = useState([]);

const [loading, setLoading] = useState(true);
const [loadingStudent, setLoadingStudent] = useState(isEditMode);
const [loadingClasses, setLoadingClasses] = useState(false);
const [submitting, setSubmitting] = useState(false);

const [error, setError] = useState("");
const [success, setSuccess] = useState("");

const [formData, setFormData] = useState({
studentId: "",
firstName: "",
middleName: "",
lastName: "",
dateOfBirth: "",
gender: "",
admissionDate: "",
phone: "",
address: "",
academicSession: "",
schoolClass: "",
parent: "",
});

// --------------------------------------------------
// Load sessions, parents and student when editing
// --------------------------------------------------

useEffect(() => {
const loadInitialData = async () => {
try {
setLoading(true);
setError("");

    const requests = [
      api.get("/academic-sessions"),
      api.get("/parents"),
    ];

    if (isEditMode && studentId) {
      requests.push(api.get(`/students/${studentId}`));
    }

    const responses = await Promise.all(requests);

    const sessionsResponse = responses[0];
    const parentsResponse = responses[1];
    const studentResponse = responses[2];

    const sessionList =
      sessionsResponse.data?.sessions || [];

    const parentList =
      parentsResponse.data?.parents || [];

    setSessions(sessionList);
    setParents(parentList);

    if (isEditMode && studentResponse) {
      const student =
        studentResponse.data?.student ||
        studentResponse.data;

      if (!student) {
        throw new Error("Student information was not found.");
      }

      const academicSessionId =
        student.academicSession?._id ||
        student.academicSession ||
        "";

      const schoolClassId =
        student.schoolClass?._id ||
        student.schoolClass ||
        "";

      const parentId =
        student.parent?._id ||
        student.parent ||
        "";

      setFormData({
        studentId: student.studentId || "",
        firstName: student.firstName || "",
        middleName: student.middleName || "",
        lastName: student.lastName || "",
        dateOfBirth: student.dateOfBirth
          ? String(student.dateOfBirth).slice(0, 10)
          : "",
        gender: student.gender || "",
        admissionDate: student.admissionDate
          ? String(student.admissionDate).slice(0, 10)
          : "",
        phone: student.phone || "",
        address: student.address || "",
        academicSession: academicSessionId,
        schoolClass: schoolClassId,
        parent: parentId,
      });
    } else {
      const currentSession = sessionList.find(
        (session) =>
          session.isCurrent && session.isActive
      );

      if (currentSession) {
        setFormData((prev) => ({
          ...prev,
          academicSession: currentSession._id,
        }));
      }
    }
  } catch (err) {
    console.error(
      "Failed to load student form data:",
      err
    );

    setError(
      err?.response?.data?.message ||
        err?.message ||
        "Failed to load the information needed for this form."
    );
  } finally {
    setLoading(false);
    setLoadingStudent(false);
  }
};

loadInitialData();


}, [isEditMode, studentId]);

// --------------------------------------------------
// Load classes when session changes
// --------------------------------------------------

useEffect(() => {
const loadClasses = async () => {
if (!formData.academicSession) {
setClasses([]);
return;
}

  try {
    setLoadingClasses(true);

    const response = await api.get(
      `/classes/session/${formData.academicSession}`
    );

    setClasses(response.data?.classes || []);
  } catch (err) {
    console.error("Failed to load classes:", err);

    setClasses([]);

    setError(
      err?.response?.data?.message ||
        "Failed to load classes for the selected academic session."
    );
  } finally {
    setLoadingClasses(false);
  }
};

loadClasses();


}, [formData.academicSession]);

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

if (!formData.studentId.trim()) {
  setError("Student ID is required.");
  return;
}

if (!formData.firstName.trim()) {
  setError("First name is required.");
  return;
}

if (!formData.lastName.trim()) {
  setError("Last name is required.");
  return;
}

if (!formData.dateOfBirth) {
  setError("Date of birth is required.");
  return;
}

if (!formData.gender) {
  setError("Gender is required.");
  return;
}

if (!formData.admissionDate) {
  setError("Admission date is required.");
  return;
}

if (!formData.academicSession) {
  setError("Academic session is required.");
  return;
}

if (!formData.schoolClass) {
  setError("Class is required.");
  return;
}

try {
  setSubmitting(true);

  const payload = {
    studentId: formData.studentId.trim(),
    firstName: formData.firstName.trim(),
    middleName: formData.middleName.trim(),
    lastName: formData.lastName.trim(),
    dateOfBirth: formData.dateOfBirth,
    gender: formData.gender,
    admissionDate: formData.admissionDate,
    phone: formData.phone.trim(),
    address: formData.address.trim(),
    academicSession: formData.academicSession,
    schoolClass: formData.schoolClass,
    parent: formData.parent || undefined,
  };

  if (isEditMode) {
    await api.put(`/students/${studentId}`, payload);

    setSuccess("Student updated successfully.");

    setTimeout(() => {
      router.push(
        `/dashboard/school-admin/students/${studentId}`
      );
    }, 1000);
  } else {
    await api.post("/students", payload);

    setSuccess("Student registered successfully.");

    setTimeout(() => {
      router.push("/dashboard/school-admin/students");
    }, 1000);
  }
} catch (err) {
  console.error(
    isEditMode
      ? "Failed to update student:"
      : "Failed to register student:",
    err
  );

  setError(
    err?.response?.data?.message ||
      (isEditMode
        ? "Failed to update student. Please try again."
        : "Failed to register student. Please try again.")
  );
} finally {
  setSubmitting(false);
}


};

// --------------------------------------------------
// Loading state
// --------------------------------------------------

if (loading || loadingStudent) {
return ( <div className="flex min-h-[60vh] items-center justify-center"> <div className="flex items-center gap-3 text-slate-600"> <Loader2 className="h-5 w-5 animate-spin" /> <span>
{isEditMode
? "Loading student information..."
: "Loading registration form..."} </span> </div> </div>
);
}

return ( <div className="space-y-6 p-4 sm:p-6 lg:p-8">
{/* Header */} <div>
<button
type="button"
onClick={() =>
router.push(
isEditMode
? `/dashboard/school-admin/students/${studentId}`
: "/dashboard/school-admin/students"
)
}
className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-emerald-600"
> <ArrowLeft className="h-4 w-4" />

```
      {isEditMode
        ? "Back to Student"
        : "Back to Students"}
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
            ? "Edit Student"
            : "Add New Student"}
        </h1>

        <p className="text-sm text-slate-500">
          {isEditMode
            ? "Update the student's information."
            : "Register a new student in your school."}
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

  <form onSubmit={handleSubmit} className="space-y-6">
    {/* Student Information */}
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
          <User className="h-5 w-5" />
        </div>

        <div>
          <h2 className="font-semibold text-slate-900">
            Student Information
          </h2>

          <p className="text-sm text-slate-500">
            Enter the student's personal information.
          </p>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        <Input
          label="Student ID"
          name="studentId"
          value={formData.studentId}
          onChange={handleChange}
          placeholder="e.g. STU-0002"
          required
        />

        <Input
          label="First Name"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          placeholder="First name"
          required
        />

        <Input
          label="Middle Name"
          name="middleName"
          value={formData.middleName}
          onChange={handleChange}
          placeholder="Middle name"
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
          label="Date of Birth"
          name="dateOfBirth"
          type="date"
          value={formData.dateOfBirth}
          onChange={handleChange}
          required
        />

        <Select
          label="Gender"
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          required
        >
          <option value="">Select gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </Select>

        <Input
          label="Admission Date"
          name="admissionDate"
          type="date"
          value={formData.admissionDate}
          onChange={handleChange}
          required
        />

        <Input
          label="Phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="Phone number"
        />

        <div className="md:col-span-2 lg:col-span-3">
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Address
          </label>

          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            rows={3}
            placeholder="Student's residential address"
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
        </div>
      </div>
    </section>

    {/* Academic Information */}
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
          <GraduationCap className="h-5 w-5" />
        </div>

        <div>
          <h2 className="font-semibold text-slate-900">
            Academic Information
          </h2>

          <p className="text-sm text-slate-500">
            Select the student's academic session and class.
          </p>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Select
          label="Academic Session"
          name="academicSession"
          value={formData.academicSession}
          onChange={handleChange}
          required
        >
          <option value="">
            Select academic session
          </option>

          {sessions
            .filter((session) => session.isActive)
            .map((session) => (
              <option key={session._id} value={session._id}>
                {session.name}
                {session.isCurrent ? " (Current)" : ""}
              </option>
            ))}
        </Select>

        <Select
          label="Class"
          name="schoolClass"
          value={formData.schoolClass}
          onChange={handleChange}
          disabled={
            !formData.academicSession || loadingClasses
          }
          required
        >
          <option value="">
            {loadingClasses
              ? "Loading classes..."
              : !formData.academicSession
                ? "Select a session first"
                : "Select class"}
          </option>

          {classes.map((schoolClass) => (
            <option
              key={schoolClass._id}
              value={schoolClass._id}
            >
              {schoolClass.name}
              {schoolClass.arm
                ? ` ${schoolClass.arm}`
                : ""}
            </option>
          ))}
        </Select>
      </div>
    </section>

    {/* Parent / Guardian */}
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
          <Users className="h-5 w-5" />
        </div>

        <div>
          <h2 className="font-semibold text-slate-900">
            Parent / Guardian
          </h2>

          <p className="text-sm text-slate-500">
            Link this student to an existing parent account.
          </p>
        </div>
      </div>

      <div className="max-w-xl">
        <Select
          label="Parent / Guardian"
          name="parent"
          value={formData.parent}
          onChange={handleChange}
        >
          <option value="">No parent selected</option>

          {parents.map((parent) => (
            <option key={parent._id} value={parent._id}>
              {parent.firstName} {parent.lastName} —{" "}
              {parent.email}
            </option>
          ))}
        </Select>

        {parents.length === 0 && (
          <p className="mt-2 text-xs text-slate-500">
            No active parent accounts were found.
          </p>
        )}
      </div>
    </section>

    {/* Actions */}
    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
      <button
        type="button"
        onClick={() =>
          router.push(
            isEditMode
              ? `/dashboard/school-admin/students/${studentId}`
              : "/dashboard/school-admin/students"
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
              : "Registering..."}
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
              : "Register Student"}
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
      <span className="ml-1 text-red-500">*</span>
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
// Reusable select
// --------------------------------------------------

function Select({
label,
name,
value,
onChange,
children,
required = false,
disabled = false,
}) {
return ( <div> <label className="mb-2 block text-sm font-medium text-slate-700">
{label}


    {required && (
      <span className="ml-1 text-red-500">*</span>
    )}
  </label>

  <select
    name={name}
    value={value}
    onChange={onChange}
    required={required}
    disabled={disabled}
    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
  >
    {children}
  </select>
</div>


);
}
