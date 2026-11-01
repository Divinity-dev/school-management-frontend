import Link from "next/link";
import { ArrowLeft, CalendarDays } from "lucide-react";

import PublicSiteLayout from "@/components/PublicSchoolWebsite/PublicSiteLayout";
import { getPublicSchool, getPublicSchoolPost } from "@/lib/publicSchool";

export async function generateMetadata({ params }) {
  const { schoolSlug, postSlug } = await params;
  const [school, post] = await Promise.all([
    getPublicSchool(schoolSlug),
    getPublicSchoolPost(schoolSlug, postSlug),
  ]);
  return {
    title: post && school ? `${post.title} | ${school.name}` : "School Blog",
    description: post?.excerpt || `Article from ${school?.name || "our school"}`,
  };
}

export default async function SchoolBlogArticlePage({ params }) {
  const { schoolSlug, postSlug } = await params;
  const [school, post] = await Promise.all([
    getPublicSchool(schoolSlug),
    getPublicSchoolPost(schoolSlug, postSlug),
  ]);

  if (!school || !post) {
    return <main className="flex min-h-screen items-center justify-center px-6 text-center">This article could not be found.</main>;
  }

  const primaryColor = school.publicProfile?.primaryColor || "#0F766E";
  const images = Array.isArray(post.images) ? post.images.slice(0, 2) : [];

  return (
    <PublicSiteLayout school={school}>
      <article className="mx-auto max-w-4xl px-6 py-12 sm:py-16 lg:px-8">
        <Link href={`/${school.slug}/news`} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900"><ArrowLeft size={16} /> Back to the blog</Link>
        <header className="mt-8">
          <p className="text-sm font-bold uppercase tracking-[0.18em]" style={{ color: primaryColor }}>School Blog</p>
          <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight text-slate-900 sm:text-5xl">{post.title}</h1>
          <div className="mt-5 flex items-center gap-2 text-sm text-slate-500"><CalendarDays size={16} />{new Date(post.publishedAt || post.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })}</div>
          {post.excerpt && <p className="mt-6 text-lg leading-8 text-slate-600">{post.excerpt}</p>}
        </header>
        {post.coverImage && <img src={post.coverImage} alt={post.title} className="mt-9 max-h-[520px] w-full rounded-3xl object-cover" />}
        <div className="prose prose-lg prose-slate mt-10 max-w-none leading-8 [&_a]:font-medium [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-emerald-400 [&_blockquote]:pl-5 [&_h2]:mt-8 [&_h2]:text-2xl [&_h2]:font-bold [&_h3]:mt-7 [&_h3]:text-xl [&_h3]:font-bold [&_li]:my-1 [&_ol]:list-decimal [&_ol]:pl-7 [&_p]:my-5 [&_ul]:list-disc [&_ul]:pl-7" dangerouslySetInnerHTML={{ __html: post.content || "" }} />
        {images.length > 0 && (
          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {images.map((image, index) => <img key={image} src={image} alt={`Article image ${index + 1}`} className="h-72 w-full rounded-2xl object-cover" />)}
          </div>
        )}
      </article>
    </PublicSiteLayout>
  );
}
