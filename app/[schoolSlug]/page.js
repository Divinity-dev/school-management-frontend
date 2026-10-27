"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  Users,
  Trophy,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import PublicSiteLayout from "@/components/PublicSchoolWebsite/PublicSiteLayout";
import { getPublicSchool } from "@/lib/publicSchool";

const DEFAULT_FEATURES = [
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

const DEFAULT_HOME_IMAGES = [
  {
    src: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=85",
    alt: "Students learning together in a classroom",
    label: "Learning together",
  },
  {
    src: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=85",
    alt: "Students enjoying a positive learning experience",
    label: "Growing with confidence",
  },
  {
    src: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&w=1200&q=85",
    alt: "Teacher supporting students during a lesson",
    label: "Guided by great teachers",
  },
];

export async function generateMetadata({ params }) {
  const { schoolSlug } = await params;
  const school = await getPublicSchool(schoolSlug);

  return {
    title: school?.name || "School",
    description:
      school?.publicProfile?.description ||
      `${school?.name || "School"} official website`,
  };
}

export default async function SchoolHomePage({ params }) {
  const { schoolSlug } = await params;
  const school = await getPublicSchool(schoolSlug);

  if (!school) {
    return <SchoolNotFound />;
  }

  const profile = school.publicProfile || {};
  const primaryColor = profile.primaryColor || "#0F766E";
  const secondaryColor = profile.secondaryColor || "#63E6BE";
  const tagline = profile.tagline || "Building Excellence, Inspiring Futures";
  const description =
    profile.description ||
    `${school.name} is committed to providing quality education in a nurturing environment where students are encouraged to learn, grow and become responsible leaders.`;

  const features = DEFAULT_FEATURES.map((fallback, index) => {
    const saved = profile.homepageFeatures?.[index] || {};
    return {
      ...fallback,
      title: saved.title?.trim() || fallback.title,
      description: saved.description?.trim() || fallback.description,
    };
  });

  const homeImages = DEFAULT_HOME_IMAGES.map((fallback, index) => ({
    ...fallback,
    src: profile.homepageImages?.[index]?.trim() || fallback.src,
  }));

  return (
    <PublicSiteLayout school={school}>
      <section className="relative overflow-hidden">
        <div
          className="relative min-h-[650px]"
          style={{
            background: profile.heroImage
              ? undefined
              : `linear-gradient(120deg, ${primaryColor}, #064e3b)`,
          }}
        >
          {profile.heroImage && (
            <img
              src={profile.heroImage}
              alt={school.name}
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-black/45" />
          <div className="relative z-10 mx-auto flex min-h-[650px] max-w-7xl items-center px-6 py-20 lg:px-8">
            <motion.div
              className="max-w-3xl"
              initial={{ opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: secondaryColor }}
                />
                Welcome to {school.name}
              </span>
              <h1 className="mt-7 text-5xl font-bold leading-tight tracking-tight text-white sm:text-6xl lg:text-7xl">
                {tagline}
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-white/80">
                {description}
              </p>
              <div className="mt-9 flex flex-col gap-4 sm:flex-row">
                <Link
                  href={`/${school.slug}/admissions`}
                  className="inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold transition hover:-translate-y-0.5"
                  style={{ backgroundColor: secondaryColor, color: "#064e3b" }}
                >
                  Explore Admissions
                  <ArrowRight size={17} />
                </Link>
                <Link
                  href={`/${school.slug}/about`}
                  className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white/10 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
                >
                  Discover Our School
                </Link>
              </div>
              <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-sm font-medium text-white/85">
                <span className="inline-flex items-center gap-2"><CheckCircle2 size={17} /> A supportive community</span>
                <span className="inline-flex items-center gap-2"><CheckCircle2 size={17} /> Learning for life</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-14 px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em]" style={{ color: primaryColor }}>
              Welcome
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Preparing students for a changing world
            </h2>
            <p className="mt-6 leading-8 text-slate-600">{description}</p>
            <p className="mt-4 leading-8 text-slate-600">
              Every learner brings unique strengths and ambitions. Our goal is to nurture those strengths through purposeful teaching, meaningful relationships and opportunities to explore new ideas.
            </p>
            <Link
              href={`/${school.slug}/about`}
              className="mt-7 inline-flex items-center gap-2 font-semibold transition hover:gap-3"
              style={{ color: primaryColor }}
            >
              Learn more about us <ArrowRight size={17} />
            </Link>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {features.map((item, index) => {
              const Icon = [BookOpen, Users, Trophy, ShieldCheck][index];
              return (
                <motion.div
                  key={item.title}
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.2 }}
                  className="rounded-2xl border border-slate-100 bg-slate-50 p-6 transition-shadow hover:shadow-lg"
                >
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-2xl"
                    style={{ backgroundColor: `${primaryColor}12`, color: primaryColor }}
                  >
                    <Icon size={25} />
                  </div>
                  <h3 className="mt-5 font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.2em]" style={{ color: primaryColor }}>
              Life at {school.name}
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              A place to learn, discover and belong
            </h2>
            <p className="mt-5 leading-8 text-slate-600">
              From classroom discoveries to the encouragement of a great teacher, every school day can open a new door. We aim to create experiences that help students build knowledge, friendships and confidence.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {homeImages.map((item, index) => (
              <motion.figure
                key={item.label}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                whileHover={{ y: -5 }}
                className="group overflow-hidden rounded-3xl bg-white shadow-sm"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={item.src}
                    alt={item.alt}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                </div>
                <figcaption className="px-5 py-4 font-semibold text-slate-800">
                  {item.label}
                </figcaption>
              </motion.figure>
            ))}
          </div>
        </div>
      </section>

      {(profile.mission || profile.vision) && (
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mb-10 max-w-2xl">
              <p className="text-sm font-bold uppercase tracking-[0.2em]" style={{ color: primaryColor }}>Our Purpose</p>
              <h2 className="mt-3 text-3xl font-bold sm:text-4xl">Guided by purpose, focused on every learner</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {profile.mission && (
                <div className="rounded-3xl bg-slate-50 p-8">
                  <p className="text-sm font-bold uppercase tracking-widest" style={{ color: primaryColor }}>Our Mission</p>
                  <p className="mt-5 text-lg leading-8 text-slate-600">{profile.mission}</p>
                </div>
              )}
              {profile.vision && (
                <div className="rounded-3xl bg-slate-50 p-8">
                  <p className="text-sm font-bold uppercase tracking-widest" style={{ color: primaryColor }}>Our Vision</p>
                  <p className="mt-5 text-lg leading-8 text-slate-600">{profile.vision}</p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {profile.coreValues?.length > 0 && (
        <section className="bg-white py-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-bold uppercase tracking-[0.2em]" style={{ color: primaryColor }}>What We Stand For</p>
              <h2 className="mt-3 text-3xl font-bold sm:text-4xl">Our Core Values</h2>
              <p className="mt-4 leading-7 text-slate-600">The principles that shape our choices, relationships and approach to learning.</p>
            </div>
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {profile.coreValues.map((value) => (
                <div key={value} className="rounded-2xl border border-slate-100 p-6 transition hover:-translate-y-1 hover:shadow-md">
                  <CheckCircle2 size={25} style={{ color: primaryColor }} />
                  <p className="mt-4 font-semibold">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {profile.showPrincipalMessage && profile.principalMessage && (
        <section className="bg-slate-50 py-20">
          <div className="mx-auto max-w-5xl px-6 lg:px-8">
            <div className="grid items-center gap-10 md:grid-cols-[220px_1fr]">
              {profile.principalPhoto ? (
                <img src={profile.principalPhoto} alt={profile.principalName || "School principal"} className="mx-auto h-52 w-52 rounded-full object-cover shadow-lg" />
              ) : (
                <div className="mx-auto flex h-52 w-52 items-center justify-center rounded-full text-white" style={{ backgroundColor: primaryColor }}>
                  <GraduationCap size={65} />
                </div>
              )}
              <div>
                <p className="text-sm font-bold uppercase tracking-widest" style={{ color: primaryColor }}>Principal's Message</p>
                <p className="mt-5 text-lg leading-8 text-slate-600">{profile.principalMessage}</p>
                {profile.principalName && <p className="mt-5 font-bold">{profile.principalName}</p>}
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="py-20" style={{ backgroundColor: primaryColor }}>
        <div className="mx-auto max-w-4xl px-6 text-center lg:px-8">
          <Sparkles className="mx-auto text-white/80" size={30} />
          <h2 className="mt-5 text-3xl font-bold text-white sm:text-4xl">
            Your child's next chapter can start here
          </h2>
          <p className="mx-auto mt-5 max-w-2xl leading-7 text-white/80">
            Discover our approach to learning, meet our school community and find out how to begin the admission process at {school.name}.
          </p>
          <Link
            href={`/${school.slug}/admissions`}
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold transition hover:-translate-y-0.5"
            style={{ color: primaryColor }}
          >
            Explore Admissions <ArrowRight size={17} />
          </Link>
        </div>
      </section>
    </PublicSiteLayout>
  );
}

function SchoolNotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">School website not found</h1>
        <p className="mt-3 text-slate-600">
          The school you're looking for does not exist or its website is currently unavailable.
        </p>
      </div>
    </main>
  );
}
