"use client";

import { useEffect, useState } from "react";
import {
  Globe2,
  Image as ImageIcon,
  Palette,
  UserRound,
  Plus,
  Trash2,
  Save,
  Eye,
  MapPin,
  Share2,
  Phone,
  GraduationCap,
} from "lucide-react";

import api from "@/lib/api";
import CloudinaryImageUpload from "@/components/dashboard/CloudinaryImageUpload";

export default function SchoolWebsiteSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    logo: "",

    tagline: "",
    description: "",
    history: "",
    mission: "",
    vision: "",
    coreValues: [],

    admissions: {
      enabled: true,
      status: "Admissions Now Open",
      title: "",
      description: "",
      requirements: [],
      applicationUrl: "",
      applicationButtonText: "Apply Now",
      contactText: "",
    },

    principalMessage: "",
    principalName: "",
    principalPhoto: "",

    primaryColor: "#0F766E",
    secondaryColor: "#63E6BE",

    heroImage: "",
    favicon: "",

    whatsapp: "",
    googleMapsUrl: "",

    facebook: "",
    instagram: "",
    x: "",
    linkedin: "",
    youtube: "",

    showPrincipalMessage: true,
    showTestimonials: true,
    showStatistics: true,
    showEvents: true,
    showNews: true,
  });

  const [newValue, setNewValue] = useState("");
  const [newAdmissionRequirement, setNewAdmissionRequirement] =
    useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadSettings();
  }, []);

  /* =========================================================
     LOAD SETTINGS
  ========================================================= */

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/public/school-website/settings"
      );

      const school = response.data?.school;
      const profile = school?.publicProfile || {};

      setForm({
        name: school?.name || "",
        logo: school?.logo || "",

        tagline: profile.tagline || "",
        description: profile.description || "",
        history: profile.history || "",
        mission: profile.mission || "",
        vision: profile.vision || "",

        coreValues: Array.isArray(profile.coreValues)
          ? profile.coreValues
          : [],

        admissions: {
          enabled:
            profile.admissions?.enabled ?? true,

          status:
            profile.admissions?.status ||
            "Admissions Now Open",

          title:
            profile.admissions?.title || "",

          description:
            profile.admissions?.description || "",

          requirements: Array.isArray(
            profile.admissions?.requirements
          )
            ? profile.admissions.requirements
            : [],

          applicationUrl:
            profile.admissions?.applicationUrl || "",

          applicationButtonText:
            profile.admissions?.applicationButtonText ||
            "Apply Now",

          contactText:
            profile.admissions?.contactText || "",
        },

        principalMessage:
          profile.principalMessage || "",

        principalName:
          profile.principalName || "",

        principalPhoto:
          profile.principalPhoto || "",

        primaryColor:
          profile.primaryColor || "#0F766E",

        secondaryColor:
          profile.secondaryColor || "#63E6BE",

        heroImage:
          profile.heroImage || "",

        favicon:
          profile.favicon || "",

        whatsapp:
          profile.whatsapp || "",

        googleMapsUrl:
          profile.googleMapsUrl || "",

        facebook:
          profile.facebook || "",

        instagram:
          profile.instagram || "",

        x:
          profile.x || "",

        linkedin:
          profile.linkedin || "",

        youtube:
          profile.youtube || "",

        showPrincipalMessage:
          profile.showPrincipalMessage ?? true,

        showTestimonials:
          profile.showTestimonials ?? true,

        showStatistics:
          profile.showStatistics ?? true,

        showEvents:
          profile.showEvents ?? true,

        showNews:
          profile.showNews ?? true,
      });
    } catch (err) {
      console.error(
        "Load website settings error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to load website settings."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     FORM HANDLERS
  ========================================================= */

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAdmissionChange = (
    field,
    value
  ) => {
    setForm((prev) => ({
      ...prev,
      admissions: {
        ...prev.admissions,
        [field]: value,
      },
    }));
  };

  /* =========================================================
     CORE VALUES
  ========================================================= */

  const addCoreValue = () => {
    const value = newValue.trim();

    if (!value) return;

    if (
      form.coreValues.some(
        (item) =>
          item.toLowerCase() ===
          value.toLowerCase()
      )
    ) {
      return;
    }

    setForm((prev) => ({
      ...prev,
      coreValues: [
        ...prev.coreValues,
        value,
      ],
    }));

    setNewValue("");
  };

  const removeCoreValue = (index) => {
    setForm((prev) => ({
      ...prev,
      coreValues: prev.coreValues.filter(
        (_, valueIndex) =>
          valueIndex !== index
      ),
    }));
  };

  /* =========================================================
     ADMISSION REQUIREMENTS
  ========================================================= */

  const addAdmissionRequirement = () => {
    const value =
      newAdmissionRequirement.trim();

    if (!value) return;

    if (
      form.admissions.requirements.some(
        (item) =>
          item.toLowerCase() ===
          value.toLowerCase()
      )
    ) {
      return;
    }

    setForm((prev) => ({
      ...prev,
      admissions: {
        ...prev.admissions,
        requirements: [
          ...prev.admissions.requirements,
          value,
        ],
      },
    }));

    setNewAdmissionRequirement("");
  };

  const removeAdmissionRequirement = (
    index
  ) => {
    setForm((prev) => ({
      ...prev,
      admissions: {
        ...prev.admissions,
        requirements:
          prev.admissions.requirements.filter(
            (_, requirementIndex) =>
              requirementIndex !== index
          ),
      },
    }));
  };

  /* =========================================================
     SAVE
  ========================================================= */

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage("");
      setError("");

      const response = await api.patch(
        "/public/school-website/settings",
        form
      );

      const school = response.data?.school;
      const profile =
        school?.publicProfile || {};

      setForm((current) => ({
        ...current,

        name:
          school?.name || current.name,

        logo:
          school?.logo || "",

        tagline:
          profile.tagline || "",

        description:
          profile.description || "",

        history:
          profile.history || "",

        mission:
          profile.mission || "",

        vision:
          profile.vision || "",

        coreValues:
          Array.isArray(profile.coreValues)
            ? profile.coreValues
            : [],

        admissions: {
          enabled:
            profile.admissions?.enabled ??
            true,

          status:
            profile.admissions?.status ||
            "Admissions Now Open",

          title:
            profile.admissions?.title || "",

          description:
            profile.admissions?.description ||
            "",

          requirements: Array.isArray(
            profile.admissions
              ?.requirements
          )
            ? profile.admissions.requirements
            : [],

          applicationUrl:
            profile.admissions
              ?.applicationUrl || "",

          applicationButtonText:
            profile.admissions
              ?.applicationButtonText ||
            "Apply Now",

          contactText:
            profile.admissions
              ?.contactText || "",
        },

        principalMessage:
          profile.principalMessage || "",

        principalName:
          profile.principalName || "",

        principalPhoto:
          profile.principalPhoto || "",

        primaryColor:
          profile.primaryColor ||
          "#0F766E",

        secondaryColor:
          profile.secondaryColor ||
          "#63E6BE",

        heroImage:
          profile.heroImage || "",

        favicon:
          profile.favicon || "",

        whatsapp:
          profile.whatsapp || "",

        googleMapsUrl:
          profile.googleMapsUrl || "",

        facebook:
          profile.facebook || "",

        instagram:
          profile.instagram || "",

        x:
          profile.x || "",

        linkedin:
          profile.linkedin || "",

        youtube:
          profile.youtube || "",

        showPrincipalMessage:
          profile.showPrincipalMessage ??
          true,

        showTestimonials:
          profile.showTestimonials ??
          true,

        showStatistics:
          profile.showStatistics ??
          true,

        showEvents:
          profile.showEvents ?? true,

        showNews:
          profile.showNews ?? true,
      }));

      setMessage(
        "Website settings saved successfully."
      );

      setTimeout(() => {
        setMessage("");
      }, 4000);
    } catch (err) {
      console.error(
        "Save website settings error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to save website settings."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-sm text-slate-500">
          Loading website settings...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50">
            <Globe2
              className="text-emerald-600"
              size={22}
            />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              School Website
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Customize how your school's public
              website looks and what visitors see.
            </p>
          </div>
        </div>
      </div>

      {/* SUCCESS */}

      {message && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      )}

      {/* ERROR */}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* =====================================================
          BRANDING
      ===================================================== */}

      <SettingsCard
        icon={<Palette size={20} />}
        title="School Branding"
        description="Control your school's name, logo, colors and browser icon."
      >
        <div className="space-y-8">
          <InputField
            label="School Name"
            value={form.name}
            onChange={(value) =>
              handleChange("name", value)
            }
            placeholder="Bright Future Academy"
          />

          <div className="grid gap-6 md:grid-cols-2">
            <CloudinaryImageUpload
              label="School Logo"
              value={form.logo}
              onChange={(value) =>
                handleChange("logo", value)
              }
              description="Upload the school's main logo."
              aspect="square"
            />

            <CloudinaryImageUpload
              label="Favicon"
              value={form.favicon}
              onChange={(value) =>
                handleChange(
                  "favicon",
                  value
                )
              }
              description="This appears in the browser tab."
              aspect="square"
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <ColorField
              label="Primary Color"
              value={form.primaryColor}
              onChange={(value) =>
                handleChange(
                  "primaryColor",
                  value
                )
              }
            />

            <ColorField
              label="Secondary Color"
              value={form.secondaryColor}
              onChange={(value) =>
                handleChange(
                  "secondaryColor",
                  value
                )
              }
            />
          </div>
        </div>
      </SettingsCard>

      {/* =====================================================
          HOMEPAGE
      ===================================================== */}

      <SettingsCard
        icon={<ImageIcon size={20} />}
        title="Homepage"
        description="Customize the main content visitors see when they visit your school website."
      >
        <div className="space-y-7">
          <InputField
            label="Tagline"
            value={form.tagline}
            onChange={(value) =>
              handleChange(
                "tagline",
                value
              )
            }
            placeholder="Building Excellence, Inspiring Futures"
          />

          <TextAreaField
            label="School Description"
            value={form.description}
            onChange={(value) =>
              handleChange(
                "description",
                value
              )
            }
            placeholder="Tell visitors about your school..."
            rows={5}
          />

          <CloudinaryImageUpload
            label="Hero Image"
            value={form.heroImage}
            onChange={(value) =>
              handleChange(
                "heroImage",
                value
              )
            }
            description="This image appears behind the main hero section on the homepage."
            aspect="wide"
          />

          <div className="grid gap-6 md:grid-cols-2">
            <TextAreaField
              label="Mission"
              value={form.mission}
              onChange={(value) =>
                handleChange(
                  "mission",
                  value
                )
              }
              placeholder="Our mission is..."
              rows={5}
            />

            <TextAreaField
              label="Vision"
              value={form.vision}
              onChange={(value) =>
                handleChange(
                  "vision",
                  value
                )
              }
              placeholder="Our vision is..."
              rows={5}
            />
          </div>
        </div>
      </SettingsCard>

      {/* =====================================================
          ABOUT
      ===================================================== */}

      <SettingsCard
        icon={<Globe2 size={20} />}
        title="About Us"
        description="Tell visitors about your school's story and identity."
      >
        <TextAreaField
          label="School History"
          value={form.history}
          onChange={(value) =>
            handleChange(
              "history",
              value
            )
          }
          placeholder="Tell the story of how your school was founded, how it has grown and what it has achieved..."
          rows={9}
        />
      </SettingsCard>

      {/* =====================================================
          CORE VALUES
      ===================================================== */}

      <SettingsCard
        icon={<Globe2 size={20} />}
        title="Core Values"
        description="Add the principles and values your school stands for."
      >
        <div className="flex gap-3">
          <input
            type="text"
            value={newValue}
            onChange={(e) =>
              setNewValue(e.target.value)
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCoreValue();
              }
            }}
            placeholder="e.g. Integrity"
            className="h-11 flex-1 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-emerald-500"
          />

          <button
            type="button"
            onClick={addCoreValue}
            className="inline-flex h-11 items-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-medium text-white hover:bg-slate-800"
          >
            <Plus size={17} />
            Add
          </button>
        </div>

        {form.coreValues.length > 0 ? (
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {form.coreValues.map(
              (value, index) => (
                <div
                  key={`${value}-${index}`}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                >
                  <span className="text-sm font-medium text-slate-700">
                    {value}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      removeCoreValue(index)
                    }
                    className="text-slate-400 hover:text-red-600"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              )
            )}
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-500">
            No core values added yet.
          </p>
        )}
      </SettingsCard>

      {/* =====================================================
          ADMISSIONS
      ===================================================== */}

      <SettingsCard
        icon={<GraduationCap size={20} />}
        title="Admissions"
        description="Control the information visitors see on your public admissions page."
      >
        <div className="space-y-7">
          <div className="rounded-xl border border-slate-200 bg-slate-50">
            <Toggle
              label="Enable admissions page"
              checked={
                form.admissions.enabled
              }
              onChange={(value) =>
                handleAdmissionChange(
                  "enabled",
                  value
                )
              }
            />
          </div>

          <InputField
            label="Admissions Status"
            value={form.admissions.status}
            onChange={(value) =>
              handleAdmissionChange(
                "status",
                value
              )
            }
            placeholder="Admissions Now Open"
          />

          <InputField
            label="Page Title"
            value={form.admissions.title}
            onChange={(value) =>
              handleAdmissionChange(
                "title",
                value
              )
            }
            placeholder="Begin Your Journey With Us"
          />

          <TextAreaField
            label="Description"
            value={
              form.admissions.description
            }
            onChange={(value) =>
              handleAdmissionChange(
                "description",
                value
              )
            }
            placeholder="Tell prospective parents and students about your admission process..."
            rows={6}
          />

          {/* REQUIREMENTS */}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Admission Requirements
            </label>

            <p className="mb-3 text-xs leading-5 text-slate-500">
              Add the documents, qualifications or
              conditions applicants should know about.
            </p>

            <div className="flex gap-3">
              <input
                type="text"
                value={
                  newAdmissionRequirement
                }
                onChange={(e) =>
                  setNewAdmissionRequirement(
                    e.target.value
                  )
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addAdmissionRequirement();
                  }
                }}
                placeholder="e.g. Birth Certificate"
                className="h-11 flex-1 rounded-lg border border-slate-200 px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />

              <button
                type="button"
                onClick={
                  addAdmissionRequirement
                }
                className="inline-flex h-11 items-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                <Plus size={17} />
                Add
              </button>
            </div>

            {form.admissions.requirements
              .length > 0 ? (
              <div className="mt-5 space-y-2">
                {form.admissions.requirements.map(
                  (
                    requirement,
                    index
                  ) => (
                    <div
                      key={`${requirement}-${index}`}
                      className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 text-xs font-bold text-emerald-700">
                          {index + 1}
                        </div>

                        <span className="text-sm font-medium text-slate-700">
                          {requirement}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          removeAdmissionRequirement(
                            index
                          )
                        }
                        className="text-slate-400 transition hover:text-red-600"
                        aria-label={`Remove ${requirement}`}
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  )
                )}
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-500">
                No admission requirements added yet.
              </p>
            )}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <InputField
              label="Application URL"
              value={
                form.admissions
                  .applicationUrl
              }
              onChange={(value) =>
                handleAdmissionChange(
                  "applicationUrl",
                  value
                )
              }
              placeholder="https://example.com/apply"
            />

            <InputField
              label="Application Button Text"
              value={
                form.admissions
                  .applicationButtonText
              }
              onChange={(value) =>
                handleAdmissionChange(
                  "applicationButtonText",
                  value
                )
              }
              placeholder="Apply Now"
            />
          </div>

          <TextAreaField
            label="Contact Text"
            value={
              form.admissions.contactText
            }
            onChange={(value) =>
              handleAdmissionChange(
                "contactText",
                value
              )
            }
            placeholder="For enquiries about admission, please contact the school office..."
            rows={4}
          />

          <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
            <p className="text-sm leading-6 text-emerald-700">
              These settings control the content
              displayed on your public Admissions page.
              If admissions are disabled, the public
              page will indicate that admissions are
              currently unavailable.
            </p>
          </div>
        </div>
      </SettingsCard>

      {/* =====================================================
          PRINCIPAL
      ===================================================== */}

      <SettingsCard
        icon={<UserRound size={20} />}
        title="Principal's Message"
        description="Add a welcome message from the school principal."
      >
        <div className="space-y-6">
          <InputField
            label="Principal's Name"
            value={form.principalName}
            onChange={(value) =>
              handleChange(
                "principalName",
                value
              )
            }
            placeholder="Mrs. Grace Okafor"
          />

          <CloudinaryImageUpload
            label="Principal Photo"
            value={form.principalPhoto}
            onChange={(value) =>
              handleChange(
                "principalPhoto",
                value
              )
            }
            description="Upload a professional photo of the principal."
            aspect="square"
          />

          <TextAreaField
            label="Message"
            value={form.principalMessage}
            onChange={(value) =>
              handleChange(
                "principalMessage",
                value
              )
            }
            placeholder="Welcome to our school..."
            rows={7}
          />

          <Toggle
            label="Show principal's message on homepage"
            checked={
              form.showPrincipalMessage
            }
            onChange={(value) =>
              handleChange(
                "showPrincipalMessage",
                value
              )
            }
          />
        </div>
      </SettingsCard>

      {/* =====================================================
          CONTACT
      ===================================================== */}

      <SettingsCard
        icon={<Phone size={20} />}
        title="Contact & Location"
        description="Add website-specific contact options. Your school's main address, phone and email already come from the school profile."
      >
        <div className="grid gap-6 md:grid-cols-2">
          <InputField
            label="WhatsApp URL"
            value={form.whatsapp}
            onChange={(value) =>
              handleChange(
                "whatsapp",
                value
              )
            }
            placeholder="https://wa.me/2348012345678"
          />

          <InputField
            label="Google Maps URL"
            value={form.googleMapsUrl}
            onChange={(value) =>
              handleChange(
                "googleMapsUrl",
                value
              )
            }
            placeholder="https://maps.google.com/..."
          />
        </div>

        <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-4">
          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />

            <p className="text-sm leading-6 text-blue-700">
              The public Contact page will continue
              using your school's existing address, city,
              state, phone and email. These fields add
              website-specific contact options.
            </p>
          </div>
        </div>
      </SettingsCard>

      {/* =====================================================
          SOCIAL MEDIA
      ===================================================== */}

      <SettingsCard
        icon={<Share2 size={20} />}
        title="Social Media"
        description="Add your school's social media profiles. Configured profiles will appear in the public website footer."
      >
        <div className="grid gap-6 md:grid-cols-2">
          <InputField
            label="Facebook"
            value={form.facebook}
            onChange={(value) =>
              handleChange(
                "facebook",
                value
              )
            }
            placeholder="https://facebook.com/..."
          />

          <InputField
            label="Instagram"
            value={form.instagram}
            onChange={(value) =>
              handleChange(
                "instagram",
                value
              )
            }
            placeholder="https://instagram.com/..."
          />

          <InputField
            label="X"
            value={form.x}
            onChange={(value) =>
              handleChange("x", value)
            }
            placeholder="https://x.com/..."
          />

          <InputField
            label="LinkedIn"
            value={form.linkedin}
            onChange={(value) =>
              handleChange(
                "linkedin",
                value
              )
            }
            placeholder="https://linkedin.com/..."
          />

          <InputField
            label="YouTube"
            value={form.youtube}
            onChange={(value) =>
              handleChange(
                "youtube",
                value
              )
            }
            placeholder="https://youtube.com/..."
          />
        </div>
      </SettingsCard>

      {/* =====================================================
          HOMEPAGE SECTIONS
      ===================================================== */}

      <SettingsCard
        icon={<Eye size={20} />}
        title="Homepage Sections"
        description="Choose which optional sections should appear on the homepage."
      >
        <div className="divide-y divide-slate-100 rounded-xl border border-slate-200">
          <Toggle
            label="Testimonials"
            checked={
              form.showTestimonials
            }
            onChange={(value) =>
              handleChange(
                "showTestimonials",
                value
              )
            }
          />

          <Toggle
            label="School Statistics"
            checked={
              form.showStatistics
            }
            onChange={(value) =>
              handleChange(
                "showStatistics",
                value
              )
            }
          />

          <Toggle
            label="Events"
            checked={form.showEvents}
            onChange={(value) =>
              handleChange(
                "showEvents",
                value
              )
            }
          />

          <Toggle
            label="News"
            checked={form.showNews}
            onChange={(value) =>
              handleChange(
                "showNews",
                value
              )
            }
          />
        </div>
      </SettingsCard>

      {/* =====================================================
          SAVE
      ===================================================== */}

      <div className="flex flex-col gap-4 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">
          Changes will immediately affect your public
          school website.
        </p>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Save size={18} />

          {saving
            ? "Saving..."
            : "Save Website Settings"}
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   REUSABLE COMPONENTS
========================================================= */

function SettingsCard({
  icon,
  title,
  description,
  children,
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
          {icon}
        </div>

        <div>
          <h2 className="font-semibold text-slate-900">
            {title}
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            {description}
          </p>
        </div>
      </div>

      <div className="mt-6">
        {children}
      </div>
    </section>
  );
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <input
        type="text"
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        placeholder={placeholder}
        className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
      />
    </div>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
  rows = 5,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <textarea
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        placeholder={placeholder}
        rows={rows}
        className="w-full resize-y rounded-lg border border-slate-200 px-3 py-3 text-sm leading-6 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
      />
    </div>
  );
}

function ColorField({
  label,
  value,
  onChange,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <div className="flex items-center gap-3">
        <input
          type="color"
          value={value}
          onChange={(e) =>
            onChange(e.target.value)
          }
          className="h-11 w-16 cursor-pointer rounded-lg border border-slate-200 bg-white p-1"
        />

        <input
          type="text"
          value={value}
          onChange={(e) =>
            onChange(e.target.value)
          }
          className="h-11 flex-1 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-emerald-500"
        />
      </div>
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}) {
  return (
    <div className="flex items-center justify-between gap-5 px-4 py-4">
      <span className="text-sm font-medium text-slate-700">
        {label}
      </span>

      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          checked
            ? "bg-emerald-600"
            : "bg-slate-300"
        }`}
        aria-pressed={checked}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
            checked
              ? "left-6"
              : "left-1"
          }`}
        />
      </button>
    </div>
  );
}