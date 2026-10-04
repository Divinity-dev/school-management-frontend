import {
  Mail,
  MapPin,
  Phone,
  Send,
} from "lucide-react";

import PublicSiteLayout from "@/components/PublicSchoolWebsite/PublicSiteLayout";
import { getPublicSchool } from "@/lib/publicSchool";

export async function generateMetadata({ params }) {
  const { schoolSlug } = await params;
  const school = await getPublicSchool(schoolSlug);

  return {
    title: school ? `Contact | ${school.name}` : "Contact",
  };
}

export default async function ContactPage({ params }) {
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
            Contact Us
          </h1>

          <p className="mt-5 max-w-2xl text-lg text-white/75">
            We'd love to hear from you. Get in touch with{" "}
            {school.name}.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <h2 className="text-3xl font-bold">
              Get in touch
            </h2>

            <p className="mt-4 leading-7 text-slate-600">
              Contact the school using any of the details below.
            </p>

            <div className="mt-10 space-y-7">
              {school.address && (
                <ContactItem
                  icon={MapPin}
                  title="Address"
                  text={`${school.address}, ${school.city || ""}${
                    school.state ? `, ${school.state}` : ""
                  }`}
                  color={primaryColor}
                />
              )}

              {school.phone && (
                <ContactItem
                  icon={Phone}
                  title="Phone"
                  text={school.phone}
                  color={primaryColor}
                />
              )}

              {school.email && (
                <ContactItem
                  icon={Mail}
                  title="Email"
                  text={school.email}
                  color={primaryColor}
                />
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-100 bg-slate-50 p-8">
            <h2 className="text-2xl font-bold">
              Send us a message
            </h2>

            <form className="mt-7 space-y-5">
              <input
                type="text"
                placeholder="Your name"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 outline-none focus:border-slate-400"
              />

              <input
                type="email"
                placeholder="Email address"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 outline-none focus:border-slate-400"
              />

              <input
                type="text"
                placeholder="Subject"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 outline-none focus:border-slate-400"
              />

              <textarea
                rows={6}
                placeholder="Your message"
                className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3.5 outline-none focus:border-slate-400"
              />

              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full px-6 py-3.5 font-semibold text-white"
                style={{ backgroundColor: primaryColor }}
              >
                Send Message
                <Send size={17} />
              </button>
            </form>
          </div>
        </div>
      </section>
    </PublicSiteLayout>
  );
}

function ContactItem({ icon: Icon, title, text, color }) {
  return (
    <div className="flex gap-4">
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white"
        style={{ backgroundColor: color }}
      >
        <Icon size={20} />
      </div>

      <div>
        <h3 className="font-semibold">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          {text}
        </p>
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