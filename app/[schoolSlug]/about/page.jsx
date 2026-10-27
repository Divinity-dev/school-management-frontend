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
            <p className="mt-4 leading-8 text-slate-600">
              We believe a strong education combines purposeful teaching with curiosity, creativity and good character. Our aim is to help learners discover their strengths, build confidence and develop the skills they need for the next stage of life.
            </p>
            <p className="mt-4 leading-8 text-slate-600">
              Families and educators work together to create a supportive community where every student is encouraged to participate, ask questions and keep improving.
            </p>
          </div>

          <div className="relative min-h-[300px] overflow-hidden rounded-3xl bg-slate-100">
            <img
              src={profile.homepageImages?.[0] || "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=85"}
              alt={`Students learning at ${school.name}`}
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
            <p className="absolute bottom-6 left-6 right-6 text-lg font-semibold text-white">
              Helping every learner find their potential
            </p>
          </div>
        </div>
      </section>

      {profile.history && (
        <section className="py-16">
          <div className="mx-auto max-w-5xl px-6 lg:px-8">
            <p className="text-sm font-bold uppercase tracking-widest" style={{ color: primaryColor }}>
              Our Story
            </p>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">The journey of {school.name}</h2>
            <p className="mt-6 whitespace-pre-line text-lg leading-8 text-slate-600">{profile.history}</p>
          </div>
        </section>
      )}

      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-widest" style={{ color: primaryColor }}>The School Experience</p>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">More than lessons in a classroom</h2>
            <p className="mt-5 leading-8 text-slate-600">
              We want students to leave each school day with more than new information. Through thoughtful guidance, collaboration and a culture of respect, learners can develop confidence, responsibility and a lasting love of learning.
            </p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              ["A strong foundation", "Build essential knowledge and skills that support success in future learning."],
              ["Character and confidence", "Encourage responsibility, kindness, perseverance and respect for others."],
              ["Partnership with families", "Keep families involved in each learner's progress and school experience."],
            ].map(([title, text]) => (
              <div key={title} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="mt-3 leading-7 text-slate-600">{text}</p>
              </div>
            ))}
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