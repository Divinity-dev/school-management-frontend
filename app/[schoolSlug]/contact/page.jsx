import Link from "next/link";
import {
  Mail,
  MapPin,
  Phone,
  Send,
  Clock3,
  MessageCircle,
  ArrowUpRight,
} from "lucide-react";

import PublicSiteLayout from "@/components/PublicSchoolWebsite/PublicSiteLayout";
import { getPublicSchool } from "@/lib/publicSchool";

export async function generateMetadata({ params }) {
  const { schoolSlug } = await params;
  const school = await getPublicSchool(schoolSlug);

  return {
    title: school ? `Contact | ${school.name}` : "Contact",
    description: school ? `Contact details and enquiry information for ${school.name}.` : "Contact the school",
  };
}

export default async function ContactPage({ params }) {
  const { schoolSlug } = await params;
  const school = await getPublicSchool(schoolSlug);

  if (!school) return <NotFound />;

  const profile = school.publicProfile || {};
  const primaryColor = profile.primaryColor || "#0F766E";
  const whatsappNumber = profile.whatsapp ? profile.whatsapp.replace(/\D/g, "") : "";
  const whatsappHref = profile.whatsapp?.startsWith("http")
    ? profile.whatsapp
    : whatsappNumber
      ? `https://wa.me/${whatsappNumber}`
      : "";

  return (
    <PublicSiteLayout school={school}>
      <section
        className="relative overflow-hidden py-24"
        style={{ background: `linear-gradient(120deg, ${primaryColor}, #064e3b)` }}
      >
        <div className="absolute -right-12 -top-20 h-72 w-72 rounded-full border-[40px] border-white/10" />
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-white/70">We're here to help</p>
          <h1 className="mt-4 text-5xl font-bold text-white sm:text-6xl">Contact Us</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-white/80">
            Whether you're exploring admission, looking for school information or already part of our community, we'd be glad to hear from you.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest" style={{ color: primaryColor }}>Get in Touch</p>
            <h2 className="mt-3 text-3xl font-bold">Connect with {school.name}</h2>
            <p className="mt-4 leading-7 text-slate-600">
              Contact the school office for admission enquiries, class availability, school activities or help finding the information you need.
            </p>

            <div className="mt-10 space-y-7">
              {school.address && (
                <ContactItem
                  icon={MapPin}
                  title="Visit Us"
                  text={[school.address, school.city, school.state].filter(Boolean).join(", ")}
                  color={primaryColor}
                />
              )}
              {school.phone && <ContactItem icon={Phone} title="Call the School" text={school.phone} color={primaryColor} />}
              {school.email && <ContactItem icon={Mail} title="Email Us" text={school.email} color={primaryColor} />}
              <ContactItem
                icon={Clock3}
                title="When You Contact Us"
                text="Please share your name, the reason for your enquiry and the best way for the school to respond."
                color={primaryColor}
              />
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              {school.phone && (
                <a href={`tel:${school.phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white" style={{ backgroundColor: primaryColor }}>
                  <Phone size={16} /> Call Now
                </a>
              )}
              {whatsappHref && (
                <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                  <MessageCircle size={16} /> WhatsApp
                  <ArrowUpRight size={14} />
                </a>
              )}
              {profile.googleMapsUrl && (
                <a href={profile.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                  <MapPin size={16} /> Get Directions
                  <ArrowUpRight size={14} />
                </a>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-100 bg-slate-50 p-8 sm:p-10">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl text-white" style={{ backgroundColor: primaryColor }}>
              <MessageCircle size={23} />
            </div>
            <h2 className="mt-6 text-2xl font-bold">Make an enquiry</h2>
            <p className="mt-3 leading-7 text-slate-600">
              For the quickest response, contact the school directly using the phone number, email address or messaging link provided. For admission enquiries, include the class level you're interested in.
            </p>
            <div className="mt-7 space-y-4 rounded-2xl bg-white p-5">
              <p className="font-semibold text-slate-800">Helpful details to include</p>
              {[
                "Your name and preferred contact details",
                "The class or programme you are enquiring about",
                "Your question or the kind of assistance you need",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 text-sm leading-6 text-slate-600">
                  <span className="mt-2 h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: primaryColor }} />
                  {item}
                </div>
              ))}
            </div>
            <Link href={`/${school.slug}/admissions`} className="mt-7 inline-flex items-center gap-2 font-semibold" style={{ color: primaryColor }}>
              View admission information <ArrowUpRight size={17} />
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-16">
        <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-6 px-6 sm:flex-row sm:items-center lg:px-8">
          <div>
            <h2 className="text-2xl font-bold">Planning a visit or considering admission?</h2>
            <p className="mt-2 max-w-2xl leading-7 text-slate-600">Explore the school and prepare your questions before contacting our team.</p>
          </div>
          <Link href={`/${school.slug}/about`} className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold shadow-sm" style={{ color: primaryColor }}>
            About Our School <ArrowUpRight size={16} />
          </Link>
        </div>
      </section>
    </PublicSiteLayout>
  );
}

function ContactItem({ icon: Icon, title, text, color }) {
  return (
    <div className="flex gap-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white" style={{ backgroundColor: color }}>
        <Icon size={20} />
      </div>
      <div>
        <h3 className="font-semibold">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-slate-600">{text}</p>
      </div>
    </div>
  );
}

function NotFound() {
  return <main className="flex min-h-screen items-center justify-center">School website not found.</main>;
}
