
import ClassForm from "@/components/dashboard/ClassForm";

export default async function EditClassPage({ params }) {
  const { id } = await params;

  return <ClassForm classId={id} isEditMode />;
}

