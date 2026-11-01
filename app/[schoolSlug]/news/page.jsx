import Link from "next/link";
import { ArrowRight, CalendarDays, Newspaper } from "lucide-react";

import PublicSiteLayout from "@/components/PublicSchoolWebsite/PublicSiteLayout";
import { getPublicSchool, getPublicSchoolPosts } from "@/lib/publicSchool";

export async function generateMetadata({ params }) {
  const { schoolSlug } = await params;
  const school = await getPublicSchool(schoolSlug);
  return {
    title: school ? `Blog | ${school.name}` : "School Blog",
    description: school ? `Articles, stories and updates from ${school.name}.` : "School blog and updates",
  };
}

export default async function NewsPage({ params }) {
  const { schoolSlug } = await params;
  const [school, posts] = await Promise.all([
    getPublicSchool(schoolSlug),
    getPublicSchoolPosts(schoolSlug, "news"),
  ]);

  if (!school) return <main className="flex min-h-screen items-center justify-center">School website not found.</main>;

  const profile = school.publicProfile || {};
  const primaryColor = profile.primaryColor || "#0F766E";

  return (
    <PublicSiteLayout school={school}>
      <section className="relative overflow-hidden py-24" style={{ background: `linear-gradient(120deg, ${primaryColor}, #064e3b)` }}>
        <div className="absolute -right-12 -top-20 h-72 w-72 rounded-full border-[40px] border-white/10" />
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-white/70">Stories from our community</p>
          <h1 className="mt-4 text-5xl font-bold text-white sm:text-6xl">School Blog</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-white/80">Articles, achievements, school news and stories from the {school.name} community.</p>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {posts.length === 0 ? (
            <div className="mx-auto max-w-2xl rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-6 py-16 text-center">
              <Newspaper size={46} className="mx-auto" style={{ color: primaryColor }} />
              <h2 className="mt-5 text-2xl font-bold text-slate-900">No articles published yet</h2>
              <p className="mt-3 leading-7 text-slate-600">New articles and school stories will appear here when they are published.</p>
              <Link href={`/${school.slug}/contact`} className="mt-7 inline-flex items-center gap-2 rounded-full px-6 py-3 font-semibold text-white" style={{ backgroundColor: primaryColor }}>Contact the School <ArrowRight size={17} /></Link>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <article key={post._id} className="group overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                  <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                    {post.coverImage ? <img src={post.coverImage} alt={post.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /> : <div className="flex h-full items-center justify-center" style={{ backgroundColor: `${primaryColor}12`, color: primaryColor }}><Newspaper size={44} /></div>}
                    <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold" style={{ color: primaryColor }}>Article</span>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-400"><CalendarDays size={14} />{new Date(post.publishedAt || post.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })}</div>
                    <h2 className="mt-3 text-xl font-bold leading-snug text-slate-900">{post.title}</h2>
                    {post.excerpt && <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-500">{post.excerpt}</p>}
                    <Link href={`/${school.slug}/news/${post.slug}`} className="mt-6 inline-flex items-center gap-2 text-sm font-bold" style={{ color: primaryColor }}>Read article <ArrowRight size={16} /></Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </PublicSiteLayout>
  );
}
