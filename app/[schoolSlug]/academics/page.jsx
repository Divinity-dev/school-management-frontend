import Link from "next/link";
import { ArrowRight, BookOpen, GraduationCap } from "lucide-react";

import PublicSiteLayout from "@/components/PublicSchoolWebsite/PublicSiteLayout";
import { getPublicSchool } from "@/lib/publicSchool";

export async function generateMetadata({ params }) {
  const { schoolSlug } = await params;
  const school = await getPublicSchool(schoolSlug);

  return {
    title: school ? `Academics | ${school.name}` : "Academics",
  };
}

export default async function AcademicsPage({ params }) {
  const { schoolSlug } = await params;
  const school = await getPublicSchool(schoolSlug);

  if (!school) return <NotFound />;

  const profile = school.publicProfile || {};
  const primaryColor = profile.primaryColor || "#0F766E";

  return (
    <PublicSiteLayout school={school}>
      <section
        className="py-24"
        style={{
          background: `linear-gradient(120deg, ${primaryColor}, #064e3b)`,
        }}
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <h1 className="text-5xl font-bold text-white">
            Academics
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-white/75">
            Discover the learning environment and academic
            opportunities at {school.name}.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-2xl">
            <p
              className="text-sm font-bold uppercase tracking-widest"
              style={{ color: primaryColor }}
            >
              Learning
            </p>

            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
              Academic Programmes
            </h2>

            <p className="mt-5 leading-8 text-slate-600">
              Our academic programmes are designed to provide
              students with strong foundations while encouraging
              curiosity, creativity and independent thinking.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              "Early Years",
              "Primary Education",
              "Secondary Education",
            ].map((program) => (
              <div
                key={program}
                className="rounded-3xl border border-slate-100 bg-slate-50 p-8"
              >
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-2xl text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  <BookOpen size={25} />
                </div>

                <h3 className="mt-6 text-xl font-bold">
                  {program}
                </h3>

                <p className="mt-3 leading-7 text-slate-600">
                  A structured learning programme designed to
                  support students at this stage of their
                  educational journey.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-5xl px-6 text-center lg:px-8">
          <GraduationCap
            size={55}
            className="mx-auto"
            style={{ color: primaryColor }}
          />

          <h2 className="mt-5 text-3xl font-bold">
            Preparing learners for the future
          </h2>

          <p className="mx-auto mt-5 max-w-2xl leading-8 text-slate-600">
            We believe education should develop more than academic
            knowledge. Students should also develop confidence,
            discipline, creativity and character.
          </p>

          <Link
            href={`/${school.slug}/admissions`}
            className="mt-8 inline-flex items-center gap-2 rounded-full px-6 py-3 font-semibold text-white"
            style={{ backgroundColor: primaryColor }}
          >
            Admission Information
            <ArrowRight size={17} />
          </Link>
        </div>
      </section>
    </PublicSiteLayout>
  );
}

function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      School website not found.
    </main>
  );
}