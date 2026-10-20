"use client";

import { useRef, useState } from "react";
import {
  Image as ImageIcon,
  Loader2,
  Upload,
  X,
} from "lucide-react";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

export default function CloudinaryImageUpload({
  label,
  value,
  onChange,
  description,
  aspect = "square",
}) {
  const inputRef = useRef(null);

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const uploadImage = async (file) => {
    if (!file) return;

    setError("");

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError(
        "Please select a JPG, PNG, WEBP or GIF image."
      );
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("Image size must not exceed 10MB.");
      return;
    }

    const cloudName =
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

    const uploadPreset =
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      setError(
        "Cloudinary upload configuration is missing."
      );
      return;
    }

    const formData = new FormData();

    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    try {
      setUploading(true);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error?.message ||
            "Failed to upload image."
        );
      }

      if (!data.secure_url) {
        throw new Error(
          "Cloudinary did not return an image URL."
        );
      }

      onChange(data.secure_url);
    } catch (err) {
      console.error("Cloudinary image upload error:", err);

      setError(
        err.message ||
          "Failed to upload image. Please try again."
      );
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (file) {
      uploadImage(file);
    }

    event.target.value = "";
  };

  const removeImage = () => {
    onChange("");
    setError("");
  };

  const aspectClass =
    aspect === "wide"
      ? "aspect-[16/7]"
      : aspect === "portrait"
        ? "aspect-[3/4]"
        : "aspect-square";

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>

      {description && (
        <p className="mb-3 text-xs leading-5 text-slate-500">
          {description}
        </p>
      )}

      {value ? (
        <div className="space-y-3">
          <div
            className={`relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50 ${aspectClass}`}
          >
            <img
              src={value}
              alt={label}
              className="h-full w-full object-cover"
            />

            <button
              type="button"
              onClick={removeImage}
              disabled={uploading}
              className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label={`Remove ${label}`}
            >
              <X size={17} />
            </button>
          </div>

          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {uploading ? (
              <>
                <Loader2
                  size={16}
                  className="animate-spin"
                />
                Uploading...
              </>
            ) : (
              <>
                <Upload size={16} />
                Replace Image
              </>
            )}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center transition hover:border-emerald-400 hover:bg-emerald-50/30 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            {uploading ? (
              <Loader2
                size={20}
                className="animate-spin"
              />
            ) : (
              <ImageIcon size={20} />
            )}
          </div>

          <p className="mt-3 text-sm font-medium text-slate-700">
            {uploading
              ? "Uploading image..."
              : "Click to upload image"}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            JPG, PNG, WEBP or GIF • Max 10MB
          </p>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileChange}
        className="hidden"
      />

      {error && (
        <p className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}