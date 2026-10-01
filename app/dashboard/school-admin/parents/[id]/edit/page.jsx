"use client";

import { useParams } from "next/navigation";

import ParentForm from "@/components/dashboard/ParentDashboard/parents/ParentForm";

export default function EditParentPage() {
  const params = useParams();

  return (
    <ParentForm
      mode="edit"
      parentId={params?.id}
    />
  );
}
