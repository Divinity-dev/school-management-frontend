"use client";

import { use } from "react";
import AcademicTermForm from "@/components/dashboard/AcademicTermForm";

export default function EditAcademicTermPage({ params }) {
  const { termId } = use(params);

  return (
    <AcademicTermForm
      termId={termId}
      isEditMode={true}
    />
  );
}