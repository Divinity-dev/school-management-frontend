"use client";

import { useParams } from "next/navigation";

import StudentForm from "@/components/dashboard/Students/StudentForm";

export default function EditStudentPage() {
const params = useParams();

return ( <StudentForm
   mode="edit"
   studentId={params.id}
 />
);
}
