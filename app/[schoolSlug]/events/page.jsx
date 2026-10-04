import { CalendarDays } from "lucide-react";

import PublicSiteLayout from "@/components/PublicSchoolWebsite/PublicSiteLayout";
import { getPublicSchool } from "@/lib/publicSchool";

export async function generateMetadata({ params }) {
  const { schoolSlug } = await params;
  const school = await getPublicSchool(schoolSlug);

  return {
    title: school ? `Events | ${school.name}` : "Events",
  };
}

export default async function EventsPage({ params }) {
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
            School Events
          </h1>

          <p className="mt-5 text-lg text-white/75">
            Stay informed about activities and important events at{" "}
            {school.name}.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <div className="rounded-3xl border border-dashed border-slate-200 p-14 text-center">
            <CalendarDays
              size={50}
              className="mx-auto"
              style={{ color: primaryColor }}
            />

            <h2 className="mt-6 text-2xl font-bold">
              Upcoming events
            </h2>

            <p className="mx-auto mt-3 max-w-xl leading-7 text-slate-600">
              Upcoming school events will appear here as they are
              published by the school.
            </p>
          </div>
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