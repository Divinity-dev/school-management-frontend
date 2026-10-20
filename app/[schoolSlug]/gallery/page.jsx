import { ImageIcon } from "lucide-react";

import PublicSiteLayout from "@/components/PublicSchoolWebsite/PublicSiteLayout";
import { getPublicSchool } from "@/lib/publicSchool";

export async function generateMetadata({ params }) {
  const { schoolSlug } = await params;
  const school = await getPublicSchool(schoolSlug);

  return {
    title: school ? `Gallery | ${school.name}` : "Gallery",
  };
}

export default async function GalleryPage({ params }) {
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
            Gallery
          </h1>

          <p className="mt-5 text-lg text-white/75">
            A glimpse into life at {school.name}.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="group flex aspect-[4/3] items-center justify-center overflow-hidden rounded-3xl bg-slate-100"
              >
                <div className="text-center text-slate-400">
                  <ImageIcon
                    size={42}
                    className="mx-auto"
                  />

                  <p className="mt-3 text-sm">
                    School photo
                  </p>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-10 text-center text-sm text-slate-500">
            School photos will appear here once the gallery has
            been configured.
          </p>
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