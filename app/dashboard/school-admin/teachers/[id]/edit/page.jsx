"use client";

import { useParams } from "next/navigation";

import TeacherForm from "@/components/dashboard/TeacherDashboard/Teachers/TeacherFom";

export default function EditTeacherPage() {
const params = useParams();

return ( <TeacherForm
   mode="edit"
   teacherId={params?.id}
 />
);
}

