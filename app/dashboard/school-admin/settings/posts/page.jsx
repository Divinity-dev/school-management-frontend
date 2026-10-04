"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  FileText,
  Loader2,
  MapPin,
  Save,
  Send,
  Type,
} from "lucide-react";

import api from "@/lib/api";
import CloudinaryImageUpload from "@/components/dashboard/CloudinaryImageUpload";

export default function CreateSchoolPostPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    type: "news",
    title: "",
    excerpt: "",
    content: "",
    coverImage: "",
    eventDate: "",
    eventEndDate: "",
    location: "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTypeChange = (type) => {
    setFormData((prev) => ({
      ...prev,
      type,
      ...(type === "news"
        ? {
            eventDate: "",
            eventEndDate: "",
            location: "",
          }
        : {}),
    }));

    setError("");
  };

  const handleSubmit = async (isPublished) => {
    setError("");

    if (!formData.title.trim()) {
      setError("Post title is required.");
      return;
    }

    if (!formData.content.trim()) {
      setError("Post content is required.");
      return;
    }

    if (
      formData.type === "event" &&
      !formData.eventDate
    ) {
      setError("Event date is required.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        type: formData.type,
        title: formData.title.trim(),
        excerpt: formData.excerpt.trim(),
        content: formData.content.trim(),
        coverImage: formData.coverImage,
        isPublished,
      };

      if (formData.type === "event") {
        payload.eventDate = formData.eventDate;
        payload.eventEndDate =
          formData.eventEndDate || null;
        payload.location =
          formData.location.trim();
      }

      await api.post(
        "/public/school-posts",
        payload
      );

      router.push(
        "/dashboard/school-admin/settings/posts"
      );
    } catch (err) {
      console.error(
        "Create school post error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to create post. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            type="button"
            onClick={() =>
              router.push(
                "/dashboard/school-admin/settings/posts"
              )
            }
            className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-emerald-600"
          >
            <ArrowLeft size={17} />
            Back to News & Events
          </button>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Create Post
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Create a news article or event for your
              school website.
            </p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* Post Type */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5">
              <h2 className="text-base font-semibold text-slate-900">
                Post Type
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Choose whether this post is a news article
                or an upcoming event.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <button
                type="button"
                onClick={() =>
                  handleTypeChange("news")
                }
                className={`rounded-xl border p-5 text-left transition ${
                  formData.type === "news"
                    ? "border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                  <FileText size={20} />
                </div>

                <h3 className="font-semibold text-slate-900">
                  News
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Share announcements, achievements,
                  updates and school stories.
                </p>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleTypeChange("event")
                }
                className={`rounded-xl border p-5 text-left transition ${
                  formData.type === "event"
                    ? "border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                  <CalendarDays size={20} />
                </div>

                <h3 className="font-semibold text-slate-900">
                  Event
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Publish information about upcoming
                  school events and activities.
                </p>
              </button>
            </div>
          </section>

          {/* Basic Information */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-base font-semibold text-slate-900">
                Post Information
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Add the main content that visitors will
                see on your school website.
              </p>
            </div>

            <div className="space-y-5">
              {/* Title */}
              <div>
                <label
                  htmlFor="title"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Title
                </label>

                <div className="relative">
                  <Type
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    maxLength={200}
                    placeholder={
                      formData.type === "event"
                        ? "e.g. Annual Inter-House Sports Competition"
                        : "e.g. Our Students Win Regional Science Competition"
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>

                <p className="mt-1 text-xs text-slate-400">
                  {formData.title.length}/200 characters
                </p>
              </div>

              {/* Excerpt */}
              <div>
                <label
                  htmlFor="excerpt"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Short Description
                </label>

                <textarea
                  id="excerpt"
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleChange}
                  maxLength={500}
                  rows={3}
                  placeholder="Write a short summary of this post..."
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />

                <p className="mt-1 text-xs text-slate-400">
                  {formData.excerpt.length}/500 characters
                </p>
              </div>

              {/* Content */}
              <div>
                <label
                  htmlFor="content"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Content
                </label>

                <textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  rows={12}
                  placeholder="Write the full content of your post..."
                  className="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />

                <p className="mt-1 text-xs text-slate-400">
                  Write the full article or event
                  description.
                </p>
              </div>
            </div>
          </section>

          {/* Cover Image */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-base font-semibold text-slate-900">
                Cover Image
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                This image will be displayed with the post
                on the school website.
              </p>
            </div>

            <CloudinaryImageUpload
              label="Post Cover Image"
              value={formData.coverImage}
              onChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  coverImage: value,
                }))
              }
              description="Use a high-quality landscape image for the best result."
              aspect="wide"
            />
          </section>

          {/* Event Information */}
          {formData.type === "event" && (
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6">
                <h2 className="text-base font-semibold text-slate-900">
                  Event Information
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Provide the details visitors need to know
                  about this event.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                {/* Start Date */}
                <div>
                  <label
                    htmlFor="eventDate"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Event Date
                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  </label>

                  <div className="relative">
                    <CalendarDays
                      size={17}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="eventDate"
                      name="eventDate"
                      type="datetime-local"
                      value={formData.eventDate}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    />
                  </div>
                </div>

                {/* End Date */}
                <div>
                  <label
                    htmlFor="eventEndDate"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Event End Date
                    <span className="ml-1 text-xs font-normal text-slate-400">
                      (Optional)
                    </span>
                  </label>

                  <div className="relative">
                    <CalendarDays
                      size={17}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="eventEndDate"
                      name="eventEndDate"
                      type="datetime-local"
                      value={formData.eventEndDate}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    />
                  </div>
                </div>

                {/* Location */}
                <div className="md:col-span-2">
                  <label
                    htmlFor="location"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Location
                    <span className="ml-1 text-xs font-normal text-slate-400">
                      (Optional)
                    </span>
                  </label>

                  <div className="relative">
                    <MapPin
                      size={17}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="e.g. School Main Field"
                      className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    />
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Actions */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={() =>
                  router.push(
                    "/dashboard/school-admin/settings/posts"
                  )
                }
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() =>
                    handleSubmit(false)
                  }
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                  ) : (
                    <Save size={17} />
                  )}

                  Save as Draft
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleSubmit(true)
                  }
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                  ) : (
                    <Send size={17} />
                  )}

                  Publish
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

