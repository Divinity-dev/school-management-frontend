import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  Users,
  Trophy,
  ShieldCheck,
} from "lucide-react";

import PublicSiteLayout from "@/components/PublicSchoolWebsite/PublicSiteLayout";
import { getPublicSchool } from "@/lib/publicSchool";

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

  const tagline =
    profile.tagline || "Building Excellence, Inspiring Futures";

  const description =
    profile.description ||
    `${school.name} is committed to providing quality education in a nurturing environment where students are encouraged to learn, grow and become responsible leaders.`;

  return (
    <PublicSiteLayout school={school}>
      {/* HERO */}
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
            <div className="max-w-3xl">
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
                  className="inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold"
                  style={{
                    backgroundColor: secondaryColor,
                    color: "#064e3b",
                  }}
                >
                  Explore Admissions
                  <ArrowRight size={17} />
                </Link>

                <Link
                  href={`/${school.slug}/about`}
                  className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white/10 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur"
                >
                  Discover Our School
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WELCOME */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-14 px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <p
              className="text-sm font-bold uppercase tracking-[0.2em]"
              style={{ color: primaryColor }}
            >
              Welcome
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Preparing students for a changing world
            </h2>

            <p className="mt-6 leading-8 text-slate-600">
              {description}
            </p>

            <Link
              href={`/${school.slug}/about`}
              className="mt-7 inline-flex items-center gap-2 font-semibold"
              style={{ color: primaryColor }}
            >
              Learn more about us
              <ArrowRight size={17} />
            </Link>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {[
              {
                icon: BookOpen,
                title: "Quality Education",
              },
              {
                icon: Users,
                title: "Qualified Teachers",
              },
              {
                icon: Trophy,
                title: "Academic Excellence",
              },
              {
                icon: ShieldCheck,
                title: "Safe Environment",
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="rounded-2xl border border-slate-100 bg-slate-50 p-6"
                >
                  <Icon
                    size={27}
                    style={{ color: primaryColor }}
                  />

                  <h3 className="mt-5 font-semibold">
                    {item.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Creating an environment where students can learn,
                    grow and thrive.
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* MISSION / VISION */}
      {(profile.mission || profile.vision) && (
        <section className="bg-slate-50 py-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid gap-6 md:grid-cols-2">
              {profile.mission && (
                <div className="rounded-3xl bg-white p-8 shadow-sm">
                  <p
                    className="text-sm font-bold uppercase tracking-widest"
                    style={{ color: primaryColor }}
                  >
                    Our Mission
                  </p>

                  <p className="mt-5 text-lg leading-8 text-slate-600">
                    {profile.mission}
                  </p>
                </div>
              )}

              {profile.vision && (
                <div className="rounded-3xl bg-white p-8 shadow-sm">
                  <p
                    className="text-sm font-bold uppercase tracking-widest"
                    style={{ color: primaryColor }}
                  >
                    Our Vision
                  </p>

                  <p className="mt-5 text-lg leading-8 text-slate-600">
                    {profile.vision}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* VALUES */}
      {profile.coreValues?.length > 0 && (
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p
                className="text-sm font-bold uppercase tracking-[0.2em]"
                style={{ color: primaryColor }}
              >
                What We Stand For
              </p>

              <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
                Our Core Values
              </h2>
            </div>

            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {profile.coreValues.map((value) => (
                <div
                  key={value}
                  className="rounded-2xl border border-slate-100 p-6"
                >
                  <CheckCircle2
                    size={25}
                    style={{ color: primaryColor }}
                  />

                  <p className="mt-4 font-semibold">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* PRINCIPAL MESSAGE */}
      {profile.showPrincipalMessage &&
        profile.principalMessage && (
          <section className="bg-slate-50 py-20">
            <div className="mx-auto max-w-5xl px-6 lg:px-8">
              <div className="grid items-center gap-10 md:grid-cols-[220px_1fr]">
                {profile.principalPhoto ? (
                  <img
                    src={profile.principalPhoto}
                    alt={profile.principalName || "School principal"}
                    className="mx-auto h-52 w-52 rounded-full object-cover"
                  />
                ) : (
                  <div
                    className="mx-auto flex h-52 w-52 items-center justify-center rounded-full text-white"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <GraduationCap size={65} />
                  </div>
                )}

                <div>
                  <p
                    className="text-sm font-bold uppercase tracking-widest"
                    style={{ color: primaryColor }}
                  >
                    Principal's Message
                  </p>

                  <p className="mt-5 text-lg leading-8 text-slate-600">
                    {profile.principalMessage}
                  </p>

                  {profile.principalName && (
                    <p className="mt-5 font-bold">
                      {profile.principalName}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

      {/* CTA */}
      <section
        className="py-20"
        style={{ backgroundColor: primaryColor }}
      >
        <div className="mx-auto max-w-4xl px-6 text-center lg:px-8">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Begin your journey with {school.name}
          </h2>

          <p className="mx-auto mt-5 max-w-2xl leading-7 text-white/75">
            Learn more about our school, our academic programmes and
            how to begin the admission process.
          </p>

          <Link
            href={`/${school.slug}/admissions`}
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold"
            style={{ color: primaryColor }}
          >
            Explore Admissions
            <ArrowRight size={17} />
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
        <h1 className="text-3xl font-bold">
          School website not found
        </h1>

        <p className="mt-3 text-slate-600">
          The school you're looking for does not exist or its
          website is currently unavailable.
        </p>
      </div>
    </main>
  );
}