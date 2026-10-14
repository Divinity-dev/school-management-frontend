
"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  FileCheck2,
  Loader2,
  Save,
  Stamp,
  FileSignature,
} from "lucide-react";
import Link from "next/link";

import api from "@/lib/api";
import CloudinaryImageUpload from "@/components/CloudinaryImageUpload";

export default function ReportCardSettingsPage() {
  const [branding, setBranding] = useState({
    schoolName: "",
    logo: "",
    principalSignature: "",
    principalStamp: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchBranding = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          "/schools/report-card-branding"
        );

        setBranding({
          schoolName:
            response.data?.branding?.schoolName || "",
          logo: response.data?.branding?.logo || "",
          principalSignature:
            response.data?.branding?.principalSignature || "",
          principalStamp:
            response.data?.branding?.principalStamp || "",
        });
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Failed to load report card settings."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBranding();
  }, []);

  const updateBranding = (field, value) => {
    setBranding((current) => ({
      ...current,
      [field]: value,
    }));

    setSuccess("");
    setError("");
  };

  const handleSave = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await api.put(
        "/schools/report-card-branding",
        {
          principalSignature: branding.principalSignature,
          principalStamp: branding.principalStamp,
        }
      );

      const saved = response.data?.branding;

      if (saved) {
        setBranding((current) => ({
          ...current,
          ...saved,
        }));
      }

      setSuccess(
        response.data?.message ||
          "Report card branding saved successfully."
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to save report card settings. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          <p className="text-sm text-slate-500">
            Loading report card settings...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-10">
      {/* Header */}
      <div>
        <Link
          href="/dashboard/school-admin/settings"
          className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
        >
          <ArrowLeft size={16} />
          Back to Settings
        </Link>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                <FileCheck2 size={25} />
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  Report Card Settings
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Manage the signature and official stamp displayed on student report cards.
                </p>
              </div>
            </div>
          </div>

          {branding.schoolName && (
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
              <p className="text-xs text-slate-500">
                School
              </p>
              <p className="mt-1 font-semibold text-slate-800">
                {branding.schoolName}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Feedback */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <span className="font-semibold">Error:</span>
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
        >
          <CheckCircle2
            size={20}
            className="shrink-0"
          />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Signature */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-6 flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
              <FileSignature size={21} />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900">
                Principal&apos;s Signature
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Upload a clear image of the principal&apos;s handwritten signature. A transparent PNG generally works best.
              </p>
            </div>
          </div>

          <div className="max-w-md">
            <CloudinaryImageUpload
              label="Signature Image"
              value={branding.principalSignature}
              onChange={(value) =>
                updateBranding("principalSignature", value)
              }
              description="This image will appear in the principal's signature area at the bottom of the report card."
              aspect="wide"
            />
          </div>
        </section>

        {/* Stamp */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-6 flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-purple-700">
              <Stamp size={21} />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900">
                Official School Stamp
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Upload an image of your school&apos;s official stamp or seal. A transparent PNG helps the stamp blend naturally into the printed report card.
              </p>
            </div>
          </div>

          <div className="max-w-md">
            <CloudinaryImageUpload
              label="School Stamp"
              value={branding.principalStamp}
              onChange={(value) =>
                updateBranding("principalStamp", value)
              }
              description="The stamp will appear in the report card's authorization area."
              aspect="square"
            />
          </div>
        </section>

        {/* Preview */}
        <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-7">
          <h2 className="font-semibold text-slate-900">
            Authorization Preview
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Preview how the uploaded images will look together. The final printed layout is controlled by the report card page.
          </p>

          <div className="mt-5 grid grid-cols-1 gap-6 rounded-xl border border-slate-200 bg-white p-5 sm:grid-cols-2 sm:p-7">
            <div className="flex min-h-32 flex-col items-center justify-end">
              {branding.principalSignature ? (
                <img
                  src={branding.principalSignature}
                  alt="Principal signature preview"
                  className="mb-2 h-16 max-w-full object-contain"
                />
              ) : (
                <div className="mb-2 flex h-16 w-full items-center justify-center text-sm text-slate-400">
                  No signature uploaded
                </div>
              )}

              <div className="w-full max-w-xs border-t border-slate-400 pt-2 text-center">
                <p className="text-sm font-semibold text-slate-800">
                  Principal&apos;s Signature
                </p>
              </div>
            </div>

            <div className="flex min-h-32 flex-col items-center justify-end">
              {branding.principalStamp ? (
                <img
                  src={branding.principalStamp}
                  alt="Official school stamp preview"
                  className="mb-2 h-20 w-32 object-contain"
                />
              ) : (
                <div className="mb-2 flex h-20 w-full items-center justify-center text-sm text-slate-400">
                  No stamp uploaded
                </div>
              )}

              <p className="text-center text-sm font-semibold text-slate-800">
                Official School Stamp
              </p>
            </div>
          </div>
        </section>

        {/* Save */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => window.location.reload()}
            disabled={saving}
            className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Discard Changes
          </button>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <>
                <Loader2
                  size={18}
                  className="animate-spin"
                />
                Saving...
              </>
            ) : (
              <>
                <Save size={18} />
                Save Report Card Settings
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}