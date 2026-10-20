"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import FeeStructureForm from "@/components/dashboard/FeeStructureForm";
import api from "@/lib/api";

export default function CreateFeeStructurePage() {
  const router = useRouter();

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (payload) => {
    try {
      setSubmitting(true);

      await api.post("/fee-structures", payload);

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

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <FeeStructureForm
        mode="create"
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        submitting={submitting}
      />
    </div>
  );
}
