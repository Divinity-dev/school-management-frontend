"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CalendarDays, Edit3, FileText, Loader2, Plus, Search, Trash2 } from "lucide-react";
import api from "@/lib/api";

const formatDate = (value) => value ? new Date(value).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" }) : "—";

export default function SchoolPostsManagementPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const loadPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/public/school-posts");
      setPosts(response.data.posts || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load your posts. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadPosts(); }, [loadPosts]);

  const visiblePosts = useMemo(() => posts.filter((post) => {
    const matchesType = filter === "all" || post.type === filter;
    const matchesSearch = !search.trim() || post.title?.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  }), [posts, filter, search]);

  const handleDelete = async (post) => {
    if (!window.confirm(`Delete “${post.title}”? This action cannot be undone.`)) return;
    try {
      setDeletingId(post._id);
      await api.delete(`/public/school-posts/${post._id}`);
      setPosts((current) => current.filter((item) => item._id !== post._id));
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete this post. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const counts = {
    all: posts.length,
    news: posts.filter((post) => post.type === "news").length,
    event: posts.filter((post) => post.type === "event").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">Website content</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">News & Events</h2>
          <p className="mt-1 text-sm text-slate-500">Create, edit, publish and manage the posts shown on your school website.</p>
        </div>
        <Link href="/dashboard/school-admin/settings/posts/create" className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700">
          <Plus size={18} /> Create Post
        </Link>
      </div>

      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div className="grid gap-4 sm:grid-cols-3">
        {[{key:"all",label:"All posts"},{key:"news",label:"Articles"},{key:"event",label:"Events"}].map((item) => (
          <button key={item.key} type="button" onClick={() => setFilter(item.key)} className={`rounded-2xl border p-4 text-left transition ${filter === item.key ? "border-emerald-300 bg-emerald-50 ring-1 ring-emerald-200" : "border-slate-200 bg-white hover:border-slate-300"}`}>
            <p className="text-sm font-medium text-slate-500">{item.label}</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{counts[item.key]}</p>
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search posts by title..." className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" />
        </div>
        <p className="text-sm text-slate-500">{visiblePosts.length} {visiblePosts.length === 1 ? "post" : "posts"}</p>
      </div>

      {loading ? (
        <div className="flex min-h-48 items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white text-sm text-slate-500"><Loader2 className="animate-spin" size={20} /> Loading posts...</div>
      ) : visiblePosts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <FileText size={42} className="mx-auto text-slate-300" />
          <h3 className="mt-4 text-lg font-semibold text-slate-900">{posts.length ? "No matching posts" : "You haven't created any posts yet"}</h3>
          <p className="mt-2 text-sm text-slate-500">{posts.length ? "Try changing your search or filter." : "Create your first article or event to publish it on your school website."}</p>
          {!posts.length && <Link href="/dashboard/school-admin/settings/posts/create" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700"><Plus size={17} /> Create your first post</Link>}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="divide-y divide-slate-100">
            {visiblePosts.map((post) => (
              <article key={post._id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                <div className="flex min-w-0 items-start gap-4">
                  <div className="hidden h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:block">
                    {post.coverImage ? <img src={post.coverImage} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-slate-400"><FileText size={22} /></div>}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${post.type === "event" ? "bg-blue-50 text-blue-700" : "bg-violet-50 text-violet-700"}`}>{post.type === "event" ? "Event" : "Article"}</span>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${post.isPublished ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{post.isPublished ? "Published" : "Draft"}</span>
                    </div>
                    <h3 className="mt-2 truncate text-base font-semibold text-slate-900">{post.title}</h3>
                    {post.excerpt && <p className="mt-1 line-clamp-2 max-w-2xl text-sm text-slate-500">{post.excerpt}</p>}
                    <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-400"><CalendarDays size={13} /> {formatDate(post.publishedAt || post.createdAt)}</p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Link href={`/dashboard/school-admin/settings/posts/${post._id}/edit`} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"><Edit3 size={16} /> Edit</Link>
                  <button type="button" onClick={() => handleDelete(post)} disabled={deletingId === post._id} className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50">
                    {deletingId === post._id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />} Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
