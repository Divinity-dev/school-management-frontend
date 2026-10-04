import api from "@/lib/api";

export async function getPublicSchool(slug) {
  try {
    const response = await api.get(`/public/schools/${slug}`);

    return response.data.school;
  } catch (error) {
    console.error("Failed to fetch public school:", error);

    return null;
  }
}