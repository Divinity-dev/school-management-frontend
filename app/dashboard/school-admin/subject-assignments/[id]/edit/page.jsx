import SubjectAssignmentForm from "@/components/dashboard/SubjectAssignmentForm";

export default async function EditSubjectAssignmentPage({ params }) {
  const { id } = await params;

  return <SubjectAssignmentForm assignmentId={id} />;
}