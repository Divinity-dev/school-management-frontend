"use client";

import Link from "next/link";
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
  FileText,
  ArrowUpRight,
} from "lucide-react";

import api from "@/lib/api";
import CloudinaryImageUpload from "@/components/dashboard/CloudinaryImageUpload";

const DEFAULT_HOMEPAGE_FEATURES = [
  {
    title: "Quality Education",
    description:
      "A balanced curriculum builds strong foundations in literacy, numeracy, critical thinking and lifelong curiosity.",
  },
  {
    title: "Qualified Teachers",
    description:
      "Caring educators guide each learner with clear instruction, encouragement and individual attention.",
  },
  {
    title: "Academic Excellence",
    description:
      "We celebrate progress, strengthen study habits and help every student work towards their full potential.",
  },
  {
    title: "Safe Environment",
    description:
      "A welcoming, respectful school community helps learners feel secure, included and ready to participate.",
  },
];

export default function SchoolWebsiteSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [schoolSlug, setSchoolSlug] = useState("");
  const [customDomain, setCustomDomain] = useState("");
  const [domainVerified, setDomainVerified] = useState(false);
  const [domainDns, setDomainDns] = useState(null);
  const [domainSaving, setDomainSaving] = useState(false);
  const [domainVerifying, setDomainVerifying] = useState(false);
  const [hostingConfiguring, setHostingConfiguring] = useState(false);
  const [hostingStatus, setHostingStatus] = useState("not_configured");
  const [hostingDnsRecords, setHostingDnsRecords] = useState([]);
  const [vercelVerification, setVercelVerification] = useState([]);

  const [form, setForm] = useState({
    name: "",
    logo: "",
    tagline: "",
    description: "",
    homepageImages: ["", "", ""],
    homepageFeatures: DEFAULT_HOMEPAGE_FEATURES.map((feature) => ({ ...feature })),
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

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/public/school-website/settings"
      );

      const school = response.data?.school;
      const profile = school?.publicProfile || {};
      setSchoolSlug(school?.slug || "");
      setCustomDomain(school?.website?.customDomain || "");
      setDomainVerified(Boolean(school?.website?.customDomainVerified));
      setHostingStatus(school?.website?.customDomainHostingStatus || "not_configured");

      setForm({
        name: school?.name || "",
        logo: school?.logo || "",
        tagline: profile.tagline || "",
        description: profile.description || "",
        homepageImages: Array.from(
          { length: 3 },
          (_, index) => profile.homepageImages?.[index] || ""
        ),
        homepageFeatures: DEFAULT_HOMEPAGE_FEATURES.map((fallback, index) => ({
          ...fallback,
          ...(profile.homepageFeatures?.[index] || {}),
        })),
        history: profile.history || "",
        mission: profile.mission || "",
        vision: profile.vision || "",

        coreValues: Array.isArray(profile.coreValues)
          ? profile.coreValues
          : [],

        admissions: {
          enabled: profile.admissions?.enabled ?? true,
          status:
            profile.admissions?.status ||
            "Admissions Now Open",
          title: profile.admissions?.title || "",
          description: profile.admissions?.description || "",

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

          contactText: profile.admissions?.contactText || "",
        },

        principalMessage: profile.principalMessage || "",
        principalName: profile.principalName || "",
        principalPhoto: profile.principalPhoto || "",
        primaryColor: profile.primaryColor || "#0F766E",
        secondaryColor: profile.secondaryColor || "#63E6BE",
        heroImage: profile.heroImage || "",
        favicon: profile.favicon || "",
        whatsapp: profile.whatsapp || "",
        googleMapsUrl: profile.googleMapsUrl || "",
        facebook: profile.facebook || "",
        instagram: profile.instagram || "",
        x: profile.x || "",
        linkedin: profile.linkedin || "",
        youtube: profile.youtube || "",

        showPrincipalMessage:
          profile.showPrincipalMessage ?? true,

        showTestimonials: profile.showTestimonials ?? true,
        showStatistics: profile.showStatistics ?? true,
        showEvents: profile.showEvents ?? true,
        showNews: profile.showNews ?? true,
      });
    } catch (err) {
      console.error("Load website settings error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load website settings."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAdmissionChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      admissions: {
        ...prev.admissions,
        [field]: value,
      },
    }));
  };

  const handleHomepageImageChange = (index, value) => {
    setForm((prev) => {
      const homepageImages = [...prev.homepageImages];
      homepageImages[index] = value;
      return { ...prev, homepageImages };
    });
  };

  const handleHomepageFeatureChange = (index, field, value) => {
    setForm((prev) => {
      const homepageFeatures = [...prev.homepageFeatures];
      homepageFeatures[index] = {
        ...homepageFeatures[index],
        [field]: value,
      };
      return { ...prev, homepageFeatures };
    });
  };

  const addCoreValue = () => {
    const value = newValue.trim();

    if (!value) return;

    if (
      form.coreValues.some(
        (item) => item.toLowerCase() === value.toLowerCase()
      )
    ) {
      return;
    }

    setForm((prev) => ({
      ...prev,
      coreValues: [...prev.coreValues, value],
    }));

    setNewValue("");
  };

  const removeCoreValue = (index) => {
    setForm((prev) => ({
      ...prev,
      coreValues: prev.coreValues.filter(
        (_, valueIndex) => valueIndex !== index
      ),
    }));
  };

  const addAdmissionRequirement = () => {
    const value = newAdmissionRequirement.trim();

    if (!value) return;

    if (
      form.admissions.requirements.some(
        (item) => item.toLowerCase() === value.toLowerCase()
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

  const removeAdmissionRequirement = (index) => {
    setForm((prev) => ({
      ...prev,
      admissions: {
        ...prev.admissions,
        requirements: prev.admissions.requirements.filter(
          (_, requirementIndex) => requirementIndex !== index
        ),
      },
    }));
  };

  const handleCustomDomainSave = async () => {
    try {
      setDomainSaving(true);
      setError("");
      setMessage("");
      const response = await api.post("/public/school-website/custom-domain", {
        domain: customDomain,
      });
      setCustomDomain(response.data?.domain || customDomain);
      setDomainVerified(false);
      setDomainDns(response.data?.dns || null);
      setHostingStatus("not_configured");
      setHostingDnsRecords([]);
      setVercelVerification([]);
      setMessage(response.data?.message || "Domain saved. Add the DNS TXT record to verify ownership.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save custom domain.");
    } finally {
      setDomainSaving(false);
    }
  };

  const handleVerifyCustomDomain = async () => {
    try {
      setDomainVerifying(true);
      setError("");
      setMessage("");
      const response = await api.post("/public/school-website/custom-domain/verify");
      setDomainVerified(Boolean(response.data?.verified));
      setDomainDns(null);
      setHostingStatus(response.data?.hosting?.status || "needs_configuration");
      setHostingDnsRecords(response.data?.hosting?.dnsRecords || []);
      setVercelVerification(response.data?.hosting?.vercelVerification || []);
      setMessage(response.data?.hosting?.message || response.data?.message || "Domain verified successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Domain verification failed.");
    } finally {
      setDomainVerifying(false);
    }
  };

  const handleConfigureDomainHosting = async () => {
    try {
      setHostingConfiguring(true);
      setError("");
      setMessage("");
      const response = await api.post("/public/school-website/custom-domain/setup");
      setDomainVerified(Boolean(response.data?.verified));
      setHostingStatus(response.data?.hosting?.status || "failed");
      setHostingDnsRecords(response.data?.hosting?.dnsRecords || []);
      setVercelVerification(response.data?.hosting?.vercelVerification || []);
      setMessage(response.data?.hosting?.message || response.data?.message || "Hosting status updated.");
    } catch (err) {
      setError(err.response?.data?.message || "Could not configure domain hosting.");
    } finally {
      setHostingConfiguring(false);
    }
  };

  const handleRefreshDomainStatus = async () => {
    try {
      setHostingConfiguring(true);
      setError("");
      setMessage("");
      const response = await api.get("/public/school-website/custom-domain/status");
      setDomainVerified(Boolean(response.data?.verified));
      setHostingStatus(response.data?.hosting?.status || "not_configured");
      setHostingDnsRecords(response.data?.hosting?.dnsRecords || []);
      setVercelVerification(response.data?.hosting?.vercelVerification || []);
      setMessage(response.data?.hosting?.message || "Domain status refreshed.");
    } catch (err) {
      setError(err.response?.data?.message || "Could not refresh domain status.");
    } finally {
      setHostingConfiguring(false);
    }
  };

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
      const profile = school?.publicProfile || {};

      setForm((current) => ({
        ...current,
        name: school?.name || current.name,
        logo: school?.logo || "",
        tagline: profile.tagline || "",
        description: profile.description || "",
        homepageImages: Array.from(
          { length: 3 },
          (_, index) => profile.homepageImages?.[index] || ""
        ),
        homepageFeatures: DEFAULT_HOMEPAGE_FEATURES.map((fallback, index) => ({
          ...fallback,
          ...(profile.homepageFeatures?.[index] || {}),
        })),
        history: profile.history || "",
        mission: profile.mission || "",
        vision: profile.vision || "",

        coreValues: Array.isArray(profile.coreValues)
          ? profile.coreValues
          : [],

        admissions: {
          enabled: profile.admissions?.enabled ?? true,
          status:
            profile.admissions?.status ||
            "Admissions Now Open",
          title: profile.admissions?.title || "",
          description: profile.admissions?.description || "",

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

          contactText: profile.admissions?.contactText || "",
        },

        principalMessage: profile.principalMessage || "",
        principalName: profile.principalName || "",
        principalPhoto: profile.principalPhoto || "",
        primaryColor: profile.primaryColor || "#0F766E",
        secondaryColor: profile.secondaryColor || "#63E6BE",
        heroImage: profile.heroImage || "",
        favicon: profile.favicon || "",
        whatsapp: profile.whatsapp || "",
        googleMapsUrl: profile.googleMapsUrl || "",
        facebook: profile.facebook || "",
        instagram: profile.instagram || "",
        x: profile.x || "",
        linkedin: profile.linkedin || "",
        youtube: profile.youtube || "",

        showPrincipalMessage:
          profile.showPrincipalMessage ?? true,

        showTestimonials: profile.showTestimonials ?? true,
        showStatistics: profile.showStatistics ?? true,
        showEvents: profile.showEvents ?? true,
        showNews: profile.showNews ?? true,
      }));

      setMessage("Website settings saved successfully.");

      setTimeout(() => {
        setMessage("");
      }, 4000);
    } catch (err) {
      console.error("Save website settings error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to save website settings."
      );
    } finally {
      setSaving(false);
    }
  };

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
      {/* HEADER AND REPORT CARD NAVIGATION */}

      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
            <Globe2 className="text-emerald-600" size={22} />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              School Website
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Customize your school's public website and content.
            </p>
          </div>
        </div>

        <Link
          href="/dashboard/school-admin/settings/report-card"
          className="group inline-flex items-center justify-center gap-3 rounded-xl border border-emerald-200 bg-white px-4 py-3 text-left shadow-sm transition hover:border-emerald-400 hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
            <FileText size={21} />
          </span>

          <span>
            <span className="block text-sm font-semibold text-slate-900">
              Report Card Settings
            </span>

            <span className="mt-1 block text-xs text-slate-500">
              Upload principal's signature and school stamp
            </span>
          </span>

          <ArrowUpRight
            size={18}
            className="ml-2 shrink-0 text-slate-400 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-emerald-700"
          />
        </Link>
      </div>

      {schoolSlug && (
        <section className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-slate-900">Your SchoolPilot Website</h2>
              <p className="mt-1 text-sm text-slate-600">
                This is your school's default public website address.
              </p>
              <a
                href={`https://${String(schoolSlug).toLowerCase().replace(/[^a-z0-9]/g, "")}.school-pilot.app`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1 break-all font-semibold text-emerald-800 underline underline-offset-2 hover:text-emerald-950"
              >
                {`https://${String(schoolSlug).toLowerCase().replace(/[^a-z0-9]/g, "")}.school-pilot.app`}
                <ArrowUpRight size={15} />
              </a>
              <p className="mt-2 text-xs text-slate-500">
                The older school-pilot.app/slug address remains available as a fallback.
              </p>
            </div>
          </div>
        </section>
      )}

      {message && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* BRANDING */}

      <SettingsCard
        icon={<Palette size={20} />}
        title="School Branding"
        description="Control your school's name, logo, colors and browser icon."
      >
        <div className="space-y-8">
          <InputField
            label="School Name"
            value={form.name}
            onChange={(value) => handleChange("name", value)}
            placeholder="Bright Future Academy"
          />

          <div className="grid gap-6 md:grid-cols-2">
            <CloudinaryImageUpload
              label="School Logo"
              value={form.logo}
              onChange={(value) => handleChange("logo", value)}
              description="Upload the school's main logo."
              aspect="square"
            />

            <CloudinaryImageUpload
              label="Favicon"
              value={form.favicon}
              onChange={(value) => handleChange("favicon", value)}
              description="This appears in the browser tab."
              aspect="square"
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <ColorField
              label="Primary Color"
              value={form.primaryColor}
              onChange={(value) => handleChange("primaryColor", value)}
            />

            <ColorField
              label="Secondary Color"
              value={form.secondaryColor}
              onChange={(value) => handleChange("secondaryColor", value)}
            />
          </div>
        </div>
      </SettingsCard>

      {/* HOMEPAGE */}

      <SettingsCard
        icon={<ImageIcon size={20} />}
        title="Homepage"
        description="Customize the main content visitors see when they visit your school website."
      >
        <div className="space-y-7">
          <InputField
            label="Tagline"
            value={form.tagline}
            onChange={(value) => handleChange("tagline", value)}
            placeholder="Building Excellence, Inspiring Futures"
          />

          <TextAreaField
            label="School Description"
            value={form.description}
            onChange={(value) => handleChange("description", value)}
            placeholder="Tell visitors about your school..."
            rows={5}
          />

          <CloudinaryImageUpload
            label="Hero Image"
            value={form.heroImage}
            onChange={(value) => handleChange("heroImage", value)}
            description="This image appears behind the main hero section on the homepage."
            aspect="wide"
          />

          <div className="space-y-5 rounded-xl border border-slate-200 p-5">
            <div>
              <h3 className="font-semibold text-slate-800">Student & Classroom Photos</h3>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Upload up to three photos for the homepage photo section. If a slot is empty, the website uses a welcoming default school photo.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {[0, 1, 2].map((index) => (
                <CloudinaryImageUpload
                  key={index}
                  label={["Learning Together", "Growing with Confidence", "Guided by Great Teachers"][index]}
                  value={form.homepageImages[index] || ""}
                  onChange={(value) => handleHomepageImageChange(index, value)}
                  description="Upload a student or classroom photo."
                  aspect="wide"
                />
              ))}
            </div>
          </div>

          <div className="space-y-5 rounded-xl border border-slate-200 p-5">
            <div>
              <h3 className="font-semibold text-slate-800">Homepage Feature Cards</h3>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Edit the titles and descriptions shown in the four school feature cards.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {form.homepageFeatures.map((feature, index) => (
                <div key={index} className="space-y-4 rounded-xl bg-slate-50 p-4">
                  <InputField
                    label={`Card ${index + 1} title`}
                    value={feature.title}
                    onChange={(value) => handleHomepageFeatureChange(index, "title", value)}
                    placeholder={DEFAULT_HOMEPAGE_FEATURES[index].title}
                  />
                  <TextAreaField
                    label="Description"
                    value={feature.description}
                    onChange={(value) => handleHomepageFeatureChange(index, "description", value)}
                    placeholder={DEFAULT_HOMEPAGE_FEATURES[index].description}
                    rows={4}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <TextAreaField
              label="Mission"
              value={form.mission}
              onChange={(value) => handleChange("mission", value)}
              placeholder="Our mission is..."
              rows={5}
            />

            <TextAreaField
              label="Vision"
              value={form.vision}
              onChange={(value) => handleChange("vision", value)}
              placeholder="Our vision is..."
              rows={5}
            />
          </div>
        </div>
      </SettingsCard>

      {/* ABOUT */}

      <SettingsCard
        icon={<Globe2 size={20} />}
        title="About Us"
        description="Tell visitors about your school's story and identity."
      >
        <TextAreaField
          label="School History"
          value={form.history}
          onChange={(value) => handleChange("history", value)}
          placeholder="Tell the story of how your school was founded, how it has grown and what it has achieved..."
          rows={9}
        />
      </SettingsCard>

      {/* CORE VALUES */}

      <SettingsCard
        icon={<Globe2 size={20} />}
        title="Core Values"
        description="Add the principles and values your school stands for."
      >
        <div className="flex gap-3">
          <input
            type="text"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCoreValue();
              }
            }}
            placeholder="e.g. Integrity"
            className="h-11 min-w-0 flex-1 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-emerald-500"
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
            {form.coreValues.map((value, index) => (
              <div
                key={`${value}-${index}`}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
              >
                <span className="text-sm font-medium text-slate-700">
                  {value}
                </span>

                <button
                  type="button"
                  onClick={() => removeCoreValue(index)}
                  className="text-slate-400 hover:text-red-600"
                  aria-label={`Remove ${value}`}
                >
                  <Trash2 size={17} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-500">
            No core values added yet.
          </p>
        )}
      </SettingsCard>

      {/* ADMISSIONS */}

      <SettingsCard
        icon={<GraduationCap size={20} />}
        title="Admissions"
        description="Control the information visitors see on your public admissions page."
      >
        <div className="space-y-7">
          <div className="rounded-xl border border-slate-200 bg-slate-50">
            <Toggle
              label="Enable admissions page"
              checked={form.admissions.enabled}
              onChange={(value) => handleAdmissionChange("enabled", value)}
            />
          </div>

          <InputField
            label="Admissions Status"
            value={form.admissions.status}
            onChange={(value) => handleAdmissionChange("status", value)}
            placeholder="Admissions Now Open"
          />

          <InputField
            label="Page Title"
            value={form.admissions.title}
            onChange={(value) => handleAdmissionChange("title", value)}
            placeholder="Begin Your Journey With Us"
          />

          <TextAreaField
            label="Description"
            value={form.admissions.description}
            onChange={(value) => handleAdmissionChange("description", value)}
            placeholder="Tell prospective parents and students about your admission process..."
            rows={6}
          />

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Admission Requirements
            </label>

            <p className="mb-3 text-xs leading-5 text-slate-500">
              Add the documents, qualifications or conditions applicants should know about.
            </p>

            <div className="flex gap-3">
              <input
                type="text"
                value={newAdmissionRequirement}
                onChange={(e) => setNewAdmissionRequirement(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addAdmissionRequirement();
                  }
                }}
                placeholder="e.g. Birth Certificate"
                className="h-11 min-w-0 flex-1 rounded-lg border border-slate-200 px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />

              <button
                type="button"
                onClick={addAdmissionRequirement}
                className="inline-flex h-11 items-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                <Plus size={17} />
                Add
              </button>
            </div>

            {form.admissions.requirements.length > 0 ? (
              <div className="mt-5 space-y-2">
                {form.admissions.requirements.map((requirement, index) => (
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
                      onClick={() => removeAdmissionRequirement(index)}
                      className="text-slate-400 transition hover:text-red-600"
                      aria-label={`Remove ${requirement}`}
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                ))}
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
              value={form.admissions.applicationUrl}
              onChange={(value) => handleAdmissionChange("applicationUrl", value)}
              placeholder="https://example.com/apply"
            />

            <InputField
              label="Application Button Text"
              value={form.admissions.applicationButtonText}
              onChange={(value) =>
                handleAdmissionChange("applicationButtonText", value)
              }
              placeholder="Apply Now"
            />
          </div>

          <TextAreaField
            label="Contact Text"
            value={form.admissions.contactText}
            onChange={(value) => handleAdmissionChange("contactText", value)}
            placeholder="For enquiries about admission, please contact the school office..."
            rows={4}
          />

          <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
            <p className="text-sm leading-6 text-emerald-700">
              These settings control the content displayed on your public Admissions page.
              If admissions are disabled, the public page will indicate that admissions are
              currently unavailable.
            </p>
          </div>
        </div>
      </SettingsCard>

      {/* PRINCIPAL */}

      <SettingsCard
        icon={<UserRound size={20} />}
        title="Principal's Message"
        description="Add a welcome message from the school principal."
      >
        <div className="space-y-6">
          <InputField
            label="Principal's Name"
            value={form.principalName}
            onChange={(value) => handleChange("principalName", value)}
            placeholder="Mrs. Grace Okafor"
          />

          <CloudinaryImageUpload
            label="Principal Photo"
            value={form.principalPhoto}
            onChange={(value) => handleChange("principalPhoto", value)}
            description="Upload a professional photo of the principal."
            aspect="square"
          />

          <TextAreaField
            label="Message"
            value={form.principalMessage}
            onChange={(value) => handleChange("principalMessage", value)}
            placeholder="Welcome to our school..."
            rows={7}
          />

          <Toggle
            label="Show principal's message on homepage"
            checked={form.showPrincipalMessage}
            onChange={(value) => handleChange("showPrincipalMessage", value)}
          />
        </div>
      </SettingsCard>

      {/* CONTACT */}

      <SettingsCard
        icon={<Phone size={20} />}
        title="Contact & Location"
        description="Add website-specific contact options. Your school's main address, phone and email already come from the school profile."
      >
        <div className="grid gap-6 md:grid-cols-2">
          <InputField
            label="WhatsApp URL"
            value={form.whatsapp}
            onChange={(value) => handleChange("whatsapp", value)}
            placeholder="https://wa.me/2348012345678"
          />

          <InputField
            label="Google Maps URL"
            value={form.googleMapsUrl}
            onChange={(value) => handleChange("googleMapsUrl", value)}
            placeholder="https://maps.google.com/..."
          />
        </div>

        <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-4">
          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />

            <p className="text-sm leading-6 text-blue-700">
              The public Contact page will continue using your school's existing address,
              city, state, phone and email. These fields add website-specific contact options.
            </p>
          </div>
        </div>
      </SettingsCard>

      {/* SOCIAL MEDIA */}

      <SettingsCard
        icon={<Share2 size={20} />}
        title="Social Media"
        description="Add your school's social media profiles. Configured profiles will appear in the public website footer."
      >
        <div className="grid gap-6 md:grid-cols-2">
          <InputField
            label="Facebook"
            value={form.facebook}
            onChange={(value) => handleChange("facebook", value)}
            placeholder="https://facebook.com/..."
          />

          <InputField
            label="Instagram"
            value={form.instagram}
            onChange={(value) => handleChange("instagram", value)}
            placeholder="https://instagram.com/..."
          />

          <InputField
            label="X"
            value={form.x}
            onChange={(value) => handleChange("x", value)}
            placeholder="https://x.com/..."
          />

          <InputField
            label="LinkedIn"
            value={form.linkedin}
            onChange={(value) => handleChange("linkedin", value)}
            placeholder="https://linkedin.com/..."
          />

          <InputField
            label="YouTube"
            value={form.youtube}
            onChange={(value) => handleChange("youtube", value)}
            placeholder="https://youtube.com/..."
          />
        </div>
      </SettingsCard>

      {/* HOMEPAGE SECTIONS */}

      <SettingsCard
        icon={<Eye size={20} />}
        title="Homepage Sections"
        description="Choose which optional sections should appear on the homepage."
      >
        <div className="divide-y divide-slate-100 rounded-xl border border-slate-200">
          <Toggle
            label="Testimonials"
            checked={form.showTestimonials}
            onChange={(value) => handleChange("showTestimonials", value)}
          />

          <Toggle
            label="School Statistics"
            checked={form.showStatistics}
            onChange={(value) => handleChange("showStatistics", value)}
          />

          <Toggle
            label="Events"
            checked={form.showEvents}
            onChange={(value) => handleChange("showEvents", value)}
          />

          <Toggle
            label="News"
            checked={form.showNews}
            onChange={(value) => handleChange("showNews", value)}
          />
        </div>
      </SettingsCard>

      {/* CUSTOM DOMAIN */}

      <SettingsCard
        icon={<Globe2 size={20} />}
        title="Custom School Domain"
        description="Use your own domain for the public school website while keeping the existing SchoolPilot address available."
      >
        <div className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Your domain
            </label>
            <input
              type="text"
              value={customDomain}
              onChange={(event) => setCustomDomain(event.target.value)}
              placeholder="brightfutureacademy.com"
              autoComplete="url"
              className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
            <p className="mt-2 text-xs leading-5 text-slate-500">
              Enter a domain you own, without https:// or a page path. SchoolPilot will add it to Vercel after ownership verification. You will need to add the DNS records shown below at your domain provider.
            </p>
          </div>

          <div className={`rounded-xl border p-4 ${domainVerified ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"}`}>
            <p className={`text-sm font-semibold ${domainVerified ? "text-emerald-800" : "text-amber-800"}`}>
              {domainVerified ? "Domain ownership verified" : "Domain not yet verified"}
            </p>
            <p className={`mt-1 text-sm leading-6 ${domainVerified ? "text-emerald-700" : "text-amber-700"}`}>
              {domainVerified
                ? "SchoolPilot will register the domain and its www address with Vercel. Add the DNS records below at your domain provider, then refresh the status."
                : "Save your domain to receive a DNS TXT verification record. Once you add it, SchoolPilot can automatically register the domain with Vercel."}
            </p>
            {domainVerified && (
              <p className="mt-3 text-sm font-semibold text-slate-800">
                Hosting status: {hostingStatus.replaceAll("_", " ")}
              </p>
            )}
          </div>

          {domainDns && (
            <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-800">Add this DNS TXT record at your domain provider</p>
              <div>
                <p className="text-xs font-medium text-slate-500">Type</p>
                <p className="mt-1 text-sm font-semibold text-slate-800">TXT</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Name / Host</p>
                <p className="mt-1 break-all font-mono text-sm text-slate-800">{domainDns.name}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Value</p>
                <p className="mt-1 break-all font-mono text-sm text-slate-800">{domainDns.value}</p>
              </div>
              <button
                type="button"
                onClick={() => navigator.clipboard?.writeText(domainDns.value)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Copy TXT value
              </button>
            </div>
          )}

          {domainVerified && hostingDnsRecords.length > 0 && (
            <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div>
                <p className="text-sm font-semibold text-slate-800">DNS records for Vercel hosting</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Add these records at the company where the domain's DNS is managed. Do not remove existing email-related MX or TXT records.
                </p>
              </div>
              {hostingDnsRecords.map((record, index) => (
                <div key={`${record.type}-${record.name}-${record.value}-${index}`} className="grid gap-3 rounded-lg border border-slate-200 bg-white p-3 sm:grid-cols-3">
                  <div>
                    <p className="text-xs font-medium text-slate-500">Type</p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">{record.type}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500">Name / Host</p>
                    <p className="mt-1 break-all font-mono text-sm text-slate-800">{record.name}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500">Value / Target</p>
                    <p className="mt-1 break-all font-mono text-sm text-slate-800">{record.value}</p>
                    <button
                      type="button"
                      onClick={() => navigator.clipboard?.writeText(record.value)}
                      className="mt-2 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                    >
                      Copy value
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {domainVerified && vercelVerification.length > 0 && (
            <div className="space-y-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm font-semibold text-amber-900">Additional Vercel ownership check</p>
              <p className="text-xs leading-5 text-amber-800">
                Vercel may require a separate verification record if this domain was previously connected to another Vercel account or project.
              </p>
              {vercelVerification.map((record, index) => (
                <div key={`${record.domain}-${record.name}-${index}`} className="rounded-lg border border-amber-200 bg-white p-3">
                  <p className="text-xs text-slate-500">{record.domain} · {record.type}</p>
                  <p className="mt-1 break-all font-mono text-sm text-slate-800">{record.name}</p>
                  <p className="mt-1 break-all font-mono text-sm text-slate-800">{record.value}</p>
                  {record.reason && <p className="mt-1 text-xs text-slate-500">{record.reason}</p>}
                  <button
                    type="button"
                    onClick={() => navigator.clipboard?.writeText(record.value)}
                    className="mt-2 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                  >
                    Copy verification value
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <button
              type="button"
              onClick={handleCustomDomainSave}
              disabled={domainSaving || !customDomain.trim()}
              className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
            >
              {domainSaving ? "Saving domain..." : "Save domain"}
            </button>
            <button
              type="button"
              onClick={handleVerifyCustomDomain}
              disabled={domainVerifying || !customDomain.trim() || domainVerified}
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            >
              {domainVerifying ? "Checking DNS..." : domainVerified ? "Ownership verified" : "Verify DNS ownership"}
            </button>
            {domainVerified && (
              <>
                <button
                  type="button"
                  onClick={handleConfigureDomainHosting}
                  disabled={hostingConfiguring}
                  className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                >
                  {hostingConfiguring ? "Configuring..." : "Configure Vercel hosting"}
                </button>
                <button
                  type="button"
                  onClick={handleRefreshDomainStatus}
                  disabled={hostingConfiguring}
                  className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                >
                  {hostingConfiguring ? "Checking..." : "Refresh hosting status"}
                </button>
              </>
            )}
          </div>
        </div>
      </SettingsCard>

      {/* SAVE */}

      <div className="flex flex-col gap-4 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">
          Changes will immediately affect your public school website.
        </p>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Save size={18} />
          {saving ? "Saving..." : "Save Website Settings"}
        </button>
      </div>
    </div>
  );
}

/* REUSABLE COMPONENTS */

function SettingsCard({ icon, title, description, children }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
          {icon}
        </div>

        <div>
          <h2 className="font-semibold text-slate-900">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            {description}
          </p>
        </div>
      </div>

      <div className="mt-6">{children}</div>
    </section>
  );
}

function InputField({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
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
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full resize-y rounded-lg border border-slate-200 px-3 py-3 text-sm leading-6 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
      />
    </div>
  );
}

function ColorField({ label, value, onChange }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <div className="flex items-center gap-3">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-11 w-16 cursor-pointer rounded-lg border border-slate-200 bg-white p-1"
        />

        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-11 flex-1 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-emerald-500"
        />
      </div>
    </div>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-5 px-4 py-4">
      <span className="text-sm font-medium text-slate-700">{label}</span>

      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          checked ? "bg-emerald-600" : "bg-slate-300"
        }`}
        aria-pressed={checked}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
            checked ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}
