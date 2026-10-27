import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  MessageCircle,
  ClipboardCheck,
  CalendarDays,
} from "lucide-react";

import PublicSiteLayout from "@/components/PublicSchoolWebsite/PublicSiteLayout";
import { getPublicSchool } from "@/lib/publicSchool";

const DEFAULT_REQUIREMENTS = [
  "Completed admission enquiry or application form",
  "Birth certificate or other proof of date of birth",
  "Recent passport photographs",
  "Previous school report or transfer records, where applicable",
];

export async function generateMetadata({ params }) {
  const { schoolSlug } = await params;
  const school = await getPublicSchool(schoolSlug);

  return {
    title: school ? `Admissions | ${school.name}` : "Admissions",
    description: school
      ? `Admission information and next steps for ${school.name}.`
      : "School admissions information",
  };
}

export default async function AdmissionsPage({ params }) {
  const { schoolSlug } = await params;
  const school = await getPublicSchool(schoolSlug);

  if (!school) return <NotFound />;

  const profile = school.publicProfile || {};
  const primaryColor = profile.primaryColor || "#0F766E";
  const admissions = profile.admissions || {};
  const requirements =
    admissions.requirements?.filter(Boolean).length > 0
      ? admissions.requirements.filter(Boolean)
      : DEFAULT_REQUIREMENTS;
  const contactHref = admissions.applicationUrl || `/${school.slug}/contact`;

  return (
    <PublicSiteLayout school={school}>
      <section
        className="relative overflow-hidden py-24"
        style={{ background: `linear-gradient(120deg, ${primaryColor}, #064e3b)` }}
      >
        <div className="absolute -right-16 -top-20 h-72 w-72 rounded-full border-[40px] border-white/10" />
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white">
            {admissions.status || "Admissions Information"}
          </span>
          <h1 className="mt-6 text-5xl font-bold text-white sm:text-6xl">
            {admissions.title || "Admissions"}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-white/80">
            {admissions.description ||
              `Take the first step towards becoming part of ${school.name}. We are happy to help families understand the process and prepare for a confident start.`}
          </p>
        </div>
      </section>

      {admissions.enabled === false ? (
        <section className="py-20">
          <div className="mx-auto max-w-3xl rounded-3xl border border-amber-200 bg-amber-50 p-8 text-center">
            <CalendarDays className="mx-auto text-amber-700" size={40} />
            <h2 className="mt-5 text-2xl font-bold text-slate-900">Admissions are currently unavailable</h2>
            <p className="mt-3 leading-7 text-slate-600">
              Please contact {school.name} to ask when applications are expected to reopen or to get information about future admission periods.
            </p>
            <Link href={`/${school.slug}/contact`} className="mt-7 inline-flex items-center gap-2 rounded-full px-6 py-3 font-semibold text-white" style={{ backgroundColor: primaryColor }}>
              Contact the School <ArrowRight size={17} />
            </Link>
          </div>
        </section>
      ) : (
        <>
          <section className="py-20">
            <div className="mx-auto max-w-6xl px-6 lg:px-8">
              <div className="mx-auto max-w-3xl text-center">
                <p className="text-sm font-bold uppercase tracking-widest" style={{ color: primaryColor }}>
                  Join Our Community
                </p>
                <h2 className="mt-3 text-3xl font-bold sm:text-4xl">A clear path to joining our school</h2>
                <p className="mx-auto mt-5 max-w-2xl leading-8 text-slate-600">
                  Choosing a school is an important decision. Our team is here to help you understand each step, prepare the right information and know what to expect.
                </p>
              </div>

              <div className="mt-14 grid gap-6 md:grid-cols-3">
                <Step
                  number="01"
                  icon={MessageCircle}
                  title="Make an Enquiry"
                  text="Speak with the school to discuss available classes, the child's needs and the current admission process."
                  color={primaryColor}
                />
                <Step
                  number="02"
                  icon={FileText}
                  title="Prepare Documents"
                  text="Gather the required details and records so the school can review the application efficiently."
                  color={primaryColor}
                />
                <Step
                  number="03"
                  icon={ClipboardCheck}
                  title="Complete the Process"
                  text="Follow the guidance provided by the school and confirm any assessment, meeting or next steps."
                  color={primaryColor}
                />
              </div>
            </div>
          </section>

          <section className="bg-slate-50 py-20">
            <div className="mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-[1fr_0.9fr] lg:px-8">
              <div>
                <p className="text-sm font-bold uppercase tracking-widest" style={{ color: primaryColor }}>Be Prepared</p>
                <h2 className="mt-3 text-3xl font-bold sm:text-4xl">Admission checklist</h2>
                <p className="mt-5 leading-8 text-slate-600">
                  Requirements can vary by class level. Use this checklist as a starting point and contact the school to confirm the exact documents needed for your child's application.
                </p>
                <ul className="mt-8 space-y-4">
                  {requirements.map((requirement) => (
                    <li key={requirement} className="flex items-start gap-3 rounded-xl bg-white p-4 shadow-sm">
                      <CheckCircle2 className="mt-0.5 shrink-0" size={21} style={{ color: primaryColor }} />
                      <span className="leading-7 text-slate-700">{requirement}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="self-start rounded-3xl bg-white p-8 shadow-sm">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl text-white" style={{ backgroundColor: primaryColor }}>
                  <GraduationCapIcon />
                </div>
                <h3 className="mt-6 text-2xl font-bold">Need help with your application?</h3>
                <p className="mt-4 leading-7 text-slate-600">
                  Contact the school office for current availability, fees, class placement and any additional requirements. The team can explain the process before you submit your information.
                </p>
                {admissions.contactText && (
                  <p className="mt-4 whitespace-pre-line leading-7 text-slate-600">{admissions.contactText}</p>
                )}
                <Link
                  href={contactHref}
                  className="mt-7 inline-flex items-center gap-2 rounded-full px-6 py-3 font-semibold text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  {admissions.applicationUrl
                    ? admissions.applicationButtonText || "Apply Now"
                    : "Contact Admissions"}
                  <ArrowRight size={17} />
                </Link>
              </div>
            </div>
          </section>
        </>
      )}
    </PublicSiteLayout>
  );
}

function Step({ number, icon: Icon, title, text, color }) {
  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl text-white" style={{ backgroundColor: color }}>
          <Icon size={23} />
        </div>
        <span className="text-4xl font-bold text-slate-100">{number}</span>
      </div>
      <h3 className="mt-7 text-xl font-bold">{title}</h3>
      <p className="mt-3 leading-7 text-slate-600">{text}</p>
    </div>
  );
}

function GraduationCapIcon() {
  return <span aria-hidden="true" className="text-2xl">🎓</span>;
}

function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      School website not found.
    </main>
  );
}
