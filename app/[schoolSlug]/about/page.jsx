import Link from "next/link";
import { ArrowRight, CheckCircle2, GraduationCap } from "lucide-react";

import PublicSiteLayout from "@/components/PublicSchoolWebsite/PublicSiteLayout";
import { getPublicSchool } from "@/lib/publicSchool";

export async function generateMetadata({ params }) {
  const { schoolSlug } = await params;
  const school = await getPublicSchool(schoolSlug);

  return {
    title: school ? `About | ${school.name}` : "About",
  };
}

export default async function AboutPage({ params }) {
  const { schoolSlug } = await params;
  const school = await getPublicSchool(schoolSlug);

  if (!school) {
    return <NotFound />;
  }

  const profile = school.publicProfile || {};
  const primaryColor = profile.primaryColor || "#0F766E";

  return (
    <PublicSiteLayout school={school}>
      <PageHero
        title="About Us"
        text={`Discover the story, values and vision behind ${school.name}.`}
        color={primaryColor}
      />

      <section className="py-20">
        <div className="mx-auto grid max-w-7xl gap-14 px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <p
              className="text-sm font-bold uppercase tracking-widest"
              style={{ color: primaryColor }}
            >
              Who We Are
            </p>

            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
              About {school.name}
            </h2>

            <p className="mt-6 leading-8 text-slate-600">
              {profile.description ||
                `${school.name} is dedicated to providing quality education and developing students academically, socially and morally.`}
            </p>
          </div>

          <div
            className="flex min-h-[300px] items-center justify-center rounded-3xl p-10"
            style={{ backgroundColor: `${primaryColor}12` }}
          >
            <GraduationCap
              size={100}
              strokeWidth={1}
              style={{ color: primaryColor }}
            />
          </div>
        </div>
      </section>

      {(profile.mission || profile.vision) && (
        <section className="bg-slate-50 py-20">
          <div className="mx-auto grid max-w-7xl gap-6 px-6 md:grid-cols-2 lg:px-8">
            {profile.mission && (
              <InfoCard
                title="Our Mission"
                content={profile.mission}
                color={primaryColor}
              />
            )}

            {profile.vision && (
              <InfoCard
                title="Our Vision"
                content={profile.vision}
                color={primaryColor}
              />
            )}
          </div>
        </section>
      )}

      {profile.coreValues?.length > 0 && (
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <h2 className="text-3xl font-bold">
              Our Core Values
            </h2>

            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {profile.coreValues.map((value) => (
                <div
                  key={value}
                  className="rounded-2xl border border-slate-100 p-6"
                >
                  <CheckCircle2
                    size={24}
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

      <section
        className="py-16"
        style={{ backgroundColor: primaryColor }}
      >
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-3xl font-bold text-white">
            Learn more about our school
          </h2>

          <Link
            href={`/${school.slug}/academics`}
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold"
            style={{ color: primaryColor }}
          >
            Explore Academics
            <ArrowRight size={17} />
          </Link>
        </div>
      </section>
    </PublicSiteLayout>
  );
}

function PageHero({ title, text, color }) {
  return (
    <section
      className="py-24"
      style={{
        background: `linear-gradient(120deg, ${color}, #064e3b)`,
      }}
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <h1 className="text-5xl font-bold text-white">
          {title}
        </h1>

        <p className="mt-5 max-w-2xl text-lg leading-8 text-white/75">
          {text}
        </p>
      </div>
    </section>
  );
}

function InfoCard({ title, content, color }) {
  return (
    <div className="rounded-3xl bg-white p-8 shadow-sm">
      <p
        className="text-sm font-bold uppercase tracking-widest"
        style={{ color }}
      >
        {title}
      </p>

      <p className="mt-5 text-lg leading-8 text-slate-600">
        {content}
      </p>
    </div>
  );
}

function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      School website not found.
    </main>
  );
}