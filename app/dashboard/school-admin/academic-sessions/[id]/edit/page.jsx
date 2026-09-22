"use client";

import { use } from "react";
import AcademicSessionForm from "@/components/dashboard/AcademicSessionForm";

export default function EditAcademicSessionPage({ params }) {
const { sessionId } = use(params);

return ( <AcademicSessionForm
   sessionId={sessionId}
   isEditMode={true}
 />
);
}
