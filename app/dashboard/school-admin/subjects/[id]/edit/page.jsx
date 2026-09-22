import SubjectForm from "../../../../../components/dashboard/SubjectForm";

export default async function EditSubjectPage({ params }) {
  const { id } = await params;

  return <SubjectForm subjectId={id} />;
}