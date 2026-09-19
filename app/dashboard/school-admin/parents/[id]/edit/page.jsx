"use client";

import { useParams } from "next/navigation";

import ParentForm from "@/components/dashboard/parents/ParentForm";

export default function EditParentPage() {
  const params = useParams();

  return (
    <ParentForm
      mode="edit"
      parentId={params?.id}
    />
  );
}
