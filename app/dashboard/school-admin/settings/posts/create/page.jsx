"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
ArrowRight,
CalendarDays,
Loader2,
Newspaper,
} from "lucide-react";
import api from "@/lib/api";

export default function NewsPage({ params }) {
const [school, setSchool] = useState(null);
const [posts, setPosts] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

useEffect(() => {
const loadNews = async () => {
try {
setLoading(true);
setError("");


    const { schoolSlug } = await params;

    const response = await api.get(
      `/public/schools/${schoolSlug}/posts`,
      {
        params: {
          type: "news",
        },
      }
    );

    const data = response.data;

    setSchool(data.school || null);
    setPosts(data.posts || []);
  } catch (err) {
    console.error("Failed to load news:", err);

    setError(
      err.response?.data?.message ||
        "Unable to load school news."
    );
  } finally {
    setLoading(false);
  }
};

loadNews();


}, [params]);

const formatDate = (date) => {
if (!date) return "";


return new Date(date).toLocaleDateString("en-NG", {
  day: "numeric",
  month: "long",
  year: "numeric",
});


};

if (loading) {
return ( <div className="flex min-h-[60vh] items-center justify-center"> <div className="flex items-center gap-3 text-slate-500"> <Loader2 className="animate-spin" size={22} /> <span>Loading news...</span> </div> </div>
);
}

if (error) {
return ( <div className="flex min-h-[60vh] items-center justify-center px-6"> <div className="max-w-md rounded-2xl border border-red-100 bg-red-50 p-8 text-center"> <Newspaper
         size={40}
         className="mx-auto mb-4 text-red-400"
       />


      <h1 className="text-xl font-bold text-slate-900">
        Unable to load news
      </h1>

      <p className="mt-2 text-sm text-slate-600">
        {error}
      </p>
    </div>
  </div>
);


}

const primaryColor =
school?.publicProfile?.primaryColor || "#0F766E";

const secondaryColor =
school?.publicProfile?.secondaryColor || "#63E6BE";

return ( <main className="bg-white">
{/* Hero */}
<section
className="relative overflow-hidden"
style={{
background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
}}
> <div className="absolute inset-0 bg-black/10" />


    <div className="relative mx-auto max-w-7xl px-6 py-20 sm:px-8 lg:px-12 lg:py-24">
      <div className="max-w-3xl">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
          <Newspaper size={16} />
          School News
        </div>

        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
          Latest News
        </h1>

        <p className="mt-5 max-w-2xl text-base leading-8 text-white/90 sm:text-lg">
          Stay informed about the latest happenings,
          achievements, announcements, and activities at{" "}
          <span className="font-semibold">
            {school?.name || "our school"}
          </span>
          .
        </p>
      </div>
    </div>
  </section>

  {/* News */}
  <section className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-12 lg:py-20">
    {posts.length === 0 ? (
      <div className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-slate-50 px-6 py-16 text-center">
        <div
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl"
          style={{
            backgroundColor: `${primaryColor}15`,
            color: primaryColor,
          }}
        >
          <Newspaper size={30} />
        </div>

        <h2 className="mt-6 text-2xl font-bold text-slate-900">
          No news yet
        </h2>

        <p className="mt-3 text-slate-500">
          There are currently no published news articles.
          Please check back later for updates.
        </p>
      </div>
    ) : (
      <>
        <div className="mb-10">
          <p
            className="text-sm font-semibold uppercase tracking-[0.2em]"
            style={{ color: primaryColor }}
          >
            Stay Updated
          </p>

          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            From Our School
          </h2>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <article
              key={post._id}
              className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              {/* Image */}
              <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                {post.coverImage ? (
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div
                    className="flex h-full w-full items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                    }}
                  >
                    <Newspaper
                      size={48}
                      className="text-white/80"
                    />
                  </div>
                )}

                <div className="absolute left-4 top-4">
                  <span
                    className="inline-flex items-center rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold shadow-sm"
                    style={{ color: primaryColor }}
                  >
                    News
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                  <CalendarDays size={14} />

                  <span>
                    {formatDate(
                      post.publishedAt || post.createdAt
                    )}
                  </span>
                </div>

                <h3 className="mt-3 line-clamp-2 text-xl font-bold leading-snug text-slate-900 transition group-hover:text-emerald-700">
                  {post.title}
                </h3>

                {post.excerpt && (
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-500">
                    {post.excerpt}
                  </p>
                )}

                <Link
                  href={`./news/${post.slug}`}
                  className="mt-6 inline-flex items-center gap-2 text-sm font-bold transition"
                  style={{ color: primaryColor }}
                >
                  Read More
                  <ArrowRight
                    size={16}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </>
    )}
  </section>
</main>


);
}
