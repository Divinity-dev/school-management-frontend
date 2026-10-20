import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  MessageCircle,
} from "lucide-react";

import PublicSiteLayout from "@/components/PublicSchoolWebsite/PublicSiteLayout";
import { getPublicSchool } from "@/lib/publicSchool";

export async function generateMetadata({ params }) {
  const { schoolSlug } = await params;
  const school = await getPublicSchool(schoolSlug);

  return {
    title: school ? `Admissions | ${school.name}` : "Admissions",
  };
}

export default async function AdmissionsPage({ params }) {
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
            Admissions
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-white/75">
            Take the first step towards becoming part of{" "}
            {school.name}.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <div className="text-center">
            <p
              className="text-sm font-bold uppercase tracking-widest"
              style={{ color: primaryColor }}
            >
              Join Us
            </p>

            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
              Begin your admission journey
            </h2>

            <p className="mx-auto mt-5 max-w-2xl leading-8 text-slate-600">
              We welcome families who share our commitment to
              education, character and personal development.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            <Step
              number="01"
              icon={FileText}
              title="Make an Enquiry"
              text="Contact the school to learn about available classes and admission requirements."
              color={primaryColor}
            />

            <Step
              number="02"
              icon={CheckCircle2}
              title="Submit Documents"
              text="Provide the required information and documents for the admission process."
              color={primaryColor}
            />

            <Step
              number="03"
              icon={MessageCircle}
              title="Complete Admission"
              text="Our admissions team will guide you through the remaining steps."
              color={primaryColor}
            />
          </div>

          <div className="mt-14 text-center">
            <Link
              href={`/${school.slug}/contact`}
              className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 font-semibold text-white"
              style={{ backgroundColor: primaryColor }}
            >
              Contact Admissions
              <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>
    </PublicSiteLayout>
  );
}

function Step({ number, icon: Icon, title, text, color }) {
  return (
    <div className="rounded-3xl border border-slate-100 p-7">
      <div className="flex items-center justify-between">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-xl text-white"
          style={{ backgroundColor: color }}
        >
          <Icon size={23} />
        </div>

        <span className="text-4xl font-bold text-slate-100">
          {number}
        </span>
      </div>

      <h3 className="mt-7 text-xl font-bold">
        {title}
      </h3>

      <p className="mt-3 leading-7 text-slate-600">
        {text}
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