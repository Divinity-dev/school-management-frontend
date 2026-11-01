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

export async function getPublicSchoolPosts(slug, type = "news") {
  try {
    const response = await api.get(`/public/schools/${slug}/posts`, {
      params: { type },
    });
    return response.data.posts || [];
  } catch (error) {
    console.error("Failed to fetch public school posts:", error);
    return [];
  }
}

export async function getPublicSchoolPost(slug, postSlug) {
  try {
    const response = await api.get(`/public/schools/${slug}/posts/${postSlug}`);
    return response.data.post || null;
  } catch (error) {
    console.error("Failed to fetch public school post:", error);
    return null;
  }
}
