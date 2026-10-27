import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  Lightbulb,
  Users,
  HeartHandshake,
} from "lucide-react";

import PublicSiteLayout from "@/components/PublicSchoolWebsite/PublicSiteLayout";
import { getPublicSchool } from "@/lib/publicSchool";

const PROGRAMMES = [
  {
    title: "Early Years",
    text: "A warm, play-rich introduction to learning that builds language, early number skills, confidence and positive routines.",
    icon: Lightbulb,
  },
  {
    title: "Primary Education",
    text: "A strong foundation in core subjects, with opportunities to ask questions, practise new skills and discover individual interests.",
    icon: BookOpen,
  },
  {
    title: "Secondary Education",
    text: "A focused learning experience that develops subject knowledge, independence, critical thinking and readiness for future study.",
    icon: GraduationCap,
  },
];

export async function generateMetadata({ params }) {
  const { schoolSlug } = await params;
  const school = await getPublicSchool(schoolSlug);

  return {
    title: school ? `Academics | ${school.name}` : "Academics",
    description: school
      ? `Explore learning programmes and the academic approach at ${school.name}.`
      : "Academic programmes",
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
        className="relative overflow-hidden py-24"
        style={{ background: `linear-gradient(120deg, ${primaryColor}, #064e3b)` }}
      >
        <div className="absolute -right-12 -top-20 h-72 w-72 rounded-full border-[40px] border-white/10" />
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-white/70">Learning with purpose</p>
          <h1 className="mt-4 text-5xl font-bold text-white sm:text-6xl">Academics</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-white/80">
            Discover the learning environment and academic opportunities at {school.name}, where strong foundations and a spirit of curiosity help learners prepare for what comes next.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-widest" style={{ color: primaryColor }}>Our Programmes</p>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">Learning at every stage</h2>
            <p className="mt-5 leading-8 text-slate-600">
              Every stage of education brings new questions, challenges and opportunities. Our academic approach is designed to support learners as they build skills, deepen understanding and take greater ownership of their progress.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {PROGRAMMES.map((programme) => {
              const Icon = programme.icon;
              return (
                <article key={programme.title} className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl text-white" style={{ backgroundColor: primaryColor }}>
                    <Icon size={25} />
                  </div>
                  <h3 className="mt-6 text-xl font-bold">{programme.title}</h3>
                  <p className="mt-3 leading-7 text-slate-600">{programme.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-2 lg:px-8">
          <div className="relative min-h-[340px] overflow-hidden rounded-3xl bg-slate-200">
            <img
              src={profile.homepageImages?.[2] || "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&w=1200&q=85"}
              alt={`A teacher supporting learners at ${school.name}`}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
          <div>
            <p className="text-sm font-bold uppercase tracking-widest" style={{ color: primaryColor }}>How We Learn</p>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">A thoughtful approach to student growth</h2>
            <p className="mt-5 leading-8 text-slate-600">
              Meaningful learning happens when students are supported, challenged and encouraged to take part. We aim to balance clear teaching with practice, discussion and opportunities to apply ideas.
            </p>
            <div className="mt-8 space-y-5">
              <ApproachItem icon={BookOpen} title="Strong foundations" text="Build essential knowledge and learning habits that support progress across subjects." color={primaryColor} />
              <ApproachItem icon={Users} title="Active participation" text="Encourage learners to ask questions, share ideas and work constructively with others." color={primaryColor} />
              <ApproachItem icon={HeartHandshake} title="Guidance and encouragement" text="Help students recognise their progress and identify the next steps in their learning." color={primaryColor} />
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-5xl px-6 text-center lg:px-8">
          <GraduationCap size={55} className="mx-auto" style={{ color: primaryColor }} />
          <h2 className="mt-5 text-3xl font-bold sm:text-4xl">Preparing learners for the future</h2>
          <p className="mx-auto mt-5 max-w-2xl leading-8 text-slate-600">
            Education should develop more than academic knowledge. Confidence, discipline, creativity, communication and character all help young people navigate the world around them.
          </p>
          <Link
            href={`/${school.slug}/admissions`}
            className="mt-8 inline-flex items-center gap-2 rounded-full px-6 py-3 font-semibold text-white transition hover:-translate-y-0.5"
            style={{ backgroundColor: primaryColor }}
          >
            Admission Information <ArrowRight size={17} />
          </Link>
        </div>
      </section>
    </PublicSiteLayout>
  );
}

function ApproachItem({ icon: Icon, title, text, color }) {
  return (
    <div className="flex gap-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: `${color}12`, color }}>
        <Icon size={21} />
      </div>
      <div>
        <h3 className="font-semibold">{title}</h3>
        <p className="mt-1 leading-7 text-slate-600">{text}</p>
      </div>
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
