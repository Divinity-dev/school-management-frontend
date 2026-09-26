"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import FeeStructureForm from "@/components/dashboard/FeeStructureForm";
import api from "@/lib/api";

export default function EditFeeStructurePage() {
  const router = useRouter();
  const params = useParams();

  const feeStructureId = params?.id;

  const [feeStructure, setFeeStructure] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!feeStructureId) return;

    const fetchFeeStructure = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          `/fee-structures/${feeStructureId}`
        );

        setFeeStructure(response.data?.feeStructure || null);
      } catch (err) {
        console.error("Failed to fetch fee structure:", err);

        setError(
          err.response?.data?.message ||
            "Unable to load this fee structure."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchFeeStructure();
  }, [feeStructureId]);

  const handleSubmit = async (payload) => {
    try {
      setSubmitting(true);

      await api.put(
        `/fee-structures/${feeStructureId}`,
        payload
      );

      router.push("/dashboard/school-admin/fees");
    } catch (error) {
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push("/dashboard/school-admin/fees");
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-600" />

          <p className="mt-3 text-sm font-medium text-slate-500">
            Loading fee structure...
          </p>
        </div>
      </div>
    );
  }

  if (error || !feeStructure) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={handleCancel}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition hover:text-emerald-600"
        >
          <ArrowLeft size={16} />
          Back to Fees
        </button>

        <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-6">
          <h2 className="text-base font-bold text-red-700">
            Unable to load fee structure
          </h2>

          <p className="mt-1 text-sm font-medium text-red-600">
            {error || "The requested fee structure could not be found."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <FeeStructureForm
      mode="edit"
      initialData={feeStructure}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      submitting={submitting}
    />
  );
}

