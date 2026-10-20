"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  CreditCard,
  Save,
  ChevronDown,
} from "lucide-react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

const NIGERIAN_BANKS = [
  {
    name: "Access Bank",
    code: "044",
  },
  {
    name: "Citibank Nigeria",
    code: "023",
  },
  {
    name: "Ecobank Nigeria",
    code: "050",
  },
  {
    name: "Fidelity Bank",
    code: "070",
  },
  {
    name: "First Bank of Nigeria",
    code: "011",
  },
  {
    name: "First City Monument Bank (FCMB)",
    code: "214",
  },
  {
    name: "Globus Bank",
    code: "103",
  },
  {
    name: "Guaranty Trust Bank (GTBank)",
    code: "058",
  },
  {
    name: "Jaiz Bank",
    code: "301",
  },
  {
    name: "Keystone Bank",
    code: "082",
  },
  {
    name: "Lotus Bank",
    code: "303",
  },
  {
    name: "Moniepoint",
    code: "50515",
  },
  {
    name: "OPay",
    code: "999992",
  },
  {
    name: "Parallex Bank",
    code: "526",
  },
  {
    name: "Polaris Bank",
    code: "076",
  },
  {
    name: "Premium Trust Bank",
    code: "000031",
  },
  {
    name: "Providus Bank",
    code: "101",
  },
  {
    name: "Stanbic IBTC Bank",
    code: "221",
  },
  {
    name: "Standard Chartered Bank Nigeria",
    code: "068",
  },
  {
    name: "Sterling Bank",
    code: "232",
  },
  {
    name: "SunTrust Bank",
    code: "100",
  },
  {
    name: "TAJ Bank",
    code: "302",
  },
  {
    name: "Titan Bank",
    code: "102",
  },
  {
    name: "Union Bank of Nigeria",
    code: "032",
  },
  {
    name: "United Bank for Africa (UBA)",
    code: "033",
  },
  {
    name: "Unity Bank",
    code: "215",
  },
  {
    name: "Wema Bank",
    code: "035",
  },
  {
    name: "Zenith Bank",
    code: "057",
  },
];

export default function BankDetailsPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    accountName: "",
    accountNumber: "",
    bankName: "",
    bankCode: "",
    paymentInstructions: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchBankDetails = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/schools/bank-details");

        const bankDetails = response.data?.bankDetails;

        if (bankDetails) {
          setForm({
            accountName: bankDetails.accountName || "",
            accountNumber: bankDetails.accountNumber || "",
            bankName: bankDetails.bankName || "",
            bankCode: bankDetails.bankCode || "",
            paymentInstructions:
              bankDetails.paymentInstructions || "",
          });
        }
      } catch (err) {
        console.error("Failed to fetch bank details:", err);

        setError(
          err.response?.data?.message ||
            "Unable to load bank details."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBankDetails();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  const handleBankChange = (event) => {
    const selectedBankName = event.target.value;

    const selectedBank = NIGERIAN_BANKS.find(
      (bank) => bank.name === selectedBankName
    );

    setForm((current) => ({
      ...current,
      bankName: selectedBank?.name || "",
      bankCode: selectedBank?.code || "",
    }));

    setError("");
    setSuccess("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!form.accountName.trim()) {
      setError("Account name is required.");
      return;
    }

    if (!/^\d{10}$/.test(form.accountNumber.trim())) {
      setError("Account number must be exactly 10 digits.");
      return;
    }

    if (!form.bankName.trim()) {
      setError("Please select a bank.");
      return;
    }

    if (!form.bankCode.trim()) {
      setError("Bank code could not be determined.");
      return;
    }

    try {
      setSaving(true);

      const response = await api.put("/schools/bank-details", {
        accountName: form.accountName.trim(),
        accountNumber: form.accountNumber.trim(),
        bankName: form.bankName.trim(),
        bankCode: form.bankCode.trim(),
        paymentInstructions:
          form.paymentInstructions.trim(),
      });

      const bankDetails = response.data?.bankDetails;

      if (bankDetails) {
        setForm({
          accountName: bankDetails.accountName || "",
          accountNumber: bankDetails.accountNumber || "",
          bankName: bankDetails.bankName || "",
          bankCode: bankDetails.bankCode || "",
          paymentInstructions:
            bankDetails.paymentInstructions || "",
        });
      }

      setSuccess("Bank details saved successfully.");
    } catch (err) {
      console.error("Save bank details error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to save bank details."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-sm text-slate-500">
          Loading bank details...
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <button
            type="button"
            onClick={() =>
              router.push("/dashboard/school-admin")
            }
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </button>

          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <Building2 className="h-6 w-6" />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Bank Details
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Add the school bank account that should receive
                payments from parents and students.
              </p>
            </div>
          </div>
        </div>

        {/* Card */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-slate-50 px-5 py-5 sm:px-6">
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-slate-600" />

              <div>
                <h2 className="font-semibold text-slate-900">
                  School Payment Account
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  These details can be displayed to students and
                  parents when making school payments.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-5 sm:p-6">
            {/* Messages */}
            {error && (
              <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-6 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                {success}
              </div>
            )}

            <div className="grid gap-5 sm:grid-cols-2">
              {/* Account Name */}
              <div className="sm:col-span-2">
                <label
                  htmlFor="accountName"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Account Name
                </label>

                <input
                  id="accountName"
                  name="accountName"
                  type="text"
                  value={form.accountName}
                  onChange={handleChange}
                  placeholder="e.g. Bright Future Academy"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              {/* Bank */}
              <div>
                <label
                  htmlFor="bankName"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Bank
                </label>

                <div className="relative">
                  <select
                    id="bankName"
                    name="bankName"
                    value={form.bankName}
                    onChange={handleBankChange}
                    className="w-full appearance-none rounded-xl border border-slate-300 bg-white px-4 py-3 pr-10 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  >
                    <option value="">Select bank</option>

                    {NIGERIAN_BANKS.map((bank) => (
                      <option
                        key={bank.code}
                        value={bank.name}
                      >
                        {bank.name}
                      </option>
                    ))}
                  </select>

                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              {/* Bank Code */}
              <div>
                <label
                  htmlFor="bankCode"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Bank Code
                </label>

                <input
                  id="bankCode"
                  type="text"
                  value={form.bankCode}
                  readOnly
                  placeholder="Automatically selected"
                  className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-600 outline-none"
                />

                <p className="mt-1.5 text-xs text-slate-400">
                  Automatically filled when you select a bank.
                </p>
              </div>

              {/* Account Number */}
              <div className="sm:col-span-2">
                <label
                  htmlFor="accountNumber"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Account Number
                </label>

                <input
                  id="accountNumber"
                  name="accountNumber"
                  type="text"
                  inputMode="numeric"
                  maxLength={10}
                  value={form.accountNumber}
                  onChange={(event) => {
                    const value = event.target.value
                      .replace(/\D/g, "")
                      .slice(0, 10);

                    setForm((current) => ({
                      ...current,
                      accountNumber: value,
                    }));

                    setError("");
                    setSuccess("");
                  }}
                  placeholder="Enter 10-digit account number"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm tracking-wide text-slate-900 outline-none transition placeholder:text-slate-400 placeholder:tracking-normal focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />

                <p className="mt-1.5 text-xs text-slate-400">
                  Enter the school's 10-digit Nigerian bank
                  account number.
                </p>
              </div>

              {/* Payment Instructions */}
              <div className="sm:col-span-2">
                <label
                  htmlFor="paymentInstructions"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Payment Instructions{" "}
                  <span className="font-normal text-slate-400">
                    (Optional)
                  </span>
                </label>

                <textarea
                  id="paymentInstructions"
                  name="paymentInstructions"
                  rows={4}
                  value={form.paymentInstructions}
                  onChange={handleChange}
                  placeholder="e.g. Please use the student's admission number as the payment reference."
                  className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() =>
                  router.push("/dashboard/school-admin")
                }
                disabled={saving}
                className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save className="h-4 w-4" />

                {saving ? "Saving..." : "Save Bank Details"}
              </button>
            </div>
          </form>
        </div>

        {/* Security note */}
        <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex gap-3">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100">
              <CreditCard className="h-4 w-4 text-slate-600" />
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Payment account
              </h3>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Make sure the account details are correct before
                saving. Payments made using these details will be
                directed to the school's designated account.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}