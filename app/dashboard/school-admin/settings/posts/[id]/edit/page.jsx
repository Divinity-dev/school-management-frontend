import SchoolPostForm from "@/components/dashboard/SchoolPostForm";

export default async function EditSchoolPostPage({ params }) {
  const { id } = await params;
  return <SchoolPostForm postId={id} />;
}
