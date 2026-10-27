import Link from "next/link";
import { Newspaper, CalendarDays, BellRing, BookOpen, ArrowRight } from "lucide-react";

import PublicSiteLayout from "@/components/PublicSchoolWebsite/PublicSiteLayout";
import { getPublicSchool } from "@/lib/publicSchool";

export async function generateMetadata({ params }) {
  const { schoolSlug } = await params;
  const school = await getPublicSchool(schoolSlug);

  return {
    title: school ? `News | ${school.name}` : "News",
    description: school ? `News, notices and updates from ${school.name}.` : "School news and updates",
  };
}

export default async function NewsPage({ params }) {
  const { schoolSlug } = await params;
  const school = await getPublicSchool(schoolSlug);

  if (!school) return <NotFound />;

  const profile = school.publicProfile || {};
  const primaryColor = profile.primaryColor || "#0F766E";

  return (
    <PublicSiteLayout school={school}>
      <section
        className="relative overflow-hidden py-24"
        style={{ background: `linear-gradient(120deg, ${primaryColor}, #064e3b)` }}
      >
        <div className="absolute -right-12 -top-20 h-72 w-72 rounded-full border-[40px] border-white/10" />
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-white/70">Stay Connected</p>
          <h1 className="mt-4 text-5xl font-bold text-white sm:text-6xl">News & Updates</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-white/80">
            Keep up with announcements, important notices and stories from the {school.name} community.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: BellRing,
                title: "School Announcements",
                text: "Important notices and messages from the school will be shared here when they are published.",
              },
              {
                icon: CalendarDays,
                title: "Events & Activities",
                text: "Look here for updates about school programmes, celebrations, meetings and community activities.",
              },
              {
                icon: BookOpen,
                title: "Learning Highlights",
                text: "Discover school milestones and learning highlights as the school shares them with families.",
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.title} className="rounded-3xl border border-slate-100 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ backgroundColor: `${primaryColor}12`, color: primaryColor }}>
                    <Icon size={23} />
                  </div>
                  <h2 className="mt-6 text-xl font-bold">{item.title}</h2>
                  <p className="mt-3 leading-7 text-slate-600">{item.text}</p>
                </article>
              );
            })}
          </div>

          <div className="mt-12 rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-6 py-14 text-center sm:px-12">
            <Newspaper size={48} className="mx-auto" style={{ color: primaryColor }} />
            <h2 className="mt-5 text-2xl font-bold">Latest updates will appear here</h2>
            <p className="mx-auto mt-3 max-w-2xl leading-7 text-slate-600">
              There are no public news posts to display at the moment. Please check back for updates or contact the school office if you need information urgently.
            </p>
            <Link href={`/${school.slug}/contact`} className="mt-7 inline-flex items-center gap-2 rounded-full px-6 py-3 font-semibold text-white" style={{ backgroundColor: primaryColor }}>
              Contact the School <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>
    </PublicSiteLayout>
  );
}

function NotFound() {
  return <main className="flex min-h-screen items-center justify-center">School website not found.</main>;
}
