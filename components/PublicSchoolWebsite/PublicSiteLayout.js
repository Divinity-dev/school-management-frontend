import Link from "next/link";
import {
  GraduationCap,
  Menu,
} from "lucide-react";

import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaYoutube,
} from "react-icons/fa";

export default function PublicSiteLayout({ school, children }) {
  const profile = school.publicProfile || {};

  const primaryColor = profile.primaryColor || "#0F766E";
  const secondaryColor = profile.secondaryColor || "#63E6BE";

  const schoolPath = `/${school.slug}`;

  const socialLinks = [
  {
    name: "Facebook",
    url: profile.facebook,
    icon: FaFacebookF,
  },
  {
    name: "Instagram",
    url: profile.instagram,
    icon: FaInstagram,
  },
  {
    name: "LinkedIn",
    url: profile.linkedin,
    icon: FaLinkedinIn,
  },
  {
    name: "YouTube",
    url: profile.youtube,
    icon: FaYoutube,
  },
];

  const whatsappNumber = profile.whatsapp
    ? profile.whatsapp.replace(/\D/g, "")
    : "";

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* =====================================================
          HEADER
      ===================================================== */}
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
          <Link
            href={schoolPath}
            className="flex items-center gap-3"
          >
            {school.logo ? (
              <img
                src={school.logo}
                alt={`${school.name} logo`}
                className="h-11 w-11 rounded-xl object-contain"
              />
            ) : (
              <div
                className="flex h-11 w-11 items-center justify-center rounded-xl text-white"
                style={{ backgroundColor: primaryColor }}
              >
                <GraduationCap size={24} />
              </div>
            )}

            <div>
              <p className="text-sm font-bold text-slate-900 sm:text-base">
                {school.name}
              </p>

              <p className="hidden text-xs text-slate-500 sm:block">
                Excellence in Education
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-7 lg:flex">
            <NavLink href={schoolPath}>
              Home
            </NavLink>

            <NavLink href={`${schoolPath}/about`}>
              About
            </NavLink>

            <NavLink href={`${schoolPath}/academics`}>
              Academics
            </NavLink>

            <NavLink href={`${schoolPath}/admissions`}>
              Admissions
            </NavLink>

            <NavLink href={`${schoolPath}/gallery`}>
              Gallery
            </NavLink>

            <NavLink href={`${schoolPath}/news`}>
              News
            </NavLink>

            <NavLink href={`${schoolPath}/contact`}>
              Contact
            </NavLink>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden rounded-full px-5 py-2.5 text-sm font-semibold text-white sm:block"
              style={{ backgroundColor: primaryColor }}
            >
              Portal Login
            </Link>

            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 lg:hidden"
              aria-label="Open navigation"
            >
              <Menu size={21} />
            </button>
          </div>
        </div>
      </header>

      {/* =====================================================
          PAGE CONTENT
      ===================================================== */}
      {children}

      {/* =====================================================
          FOOTER
      ===================================================== */}
      <footer className="bg-slate-950 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-3 lg:px-8">

          {/* =================================================
              SCHOOL INFO
          ================================================= */}
          <div>
            <div className="flex items-center gap-3">
              {school.logo ? (
                <img
                  src={school.logo}
                  alt={`${school.name} logo`}
                  className="h-10 w-10 rounded-lg bg-white object-contain p-1"
                />
              ) : (
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-lg"
                  style={{ backgroundColor: primaryColor }}
                >
                  <GraduationCap size={21} />
                </div>
              )}

              <span className="font-semibold">
                {school.name}
              </span>
            </div>

            <p className="mt-4 max-w-sm text-sm leading-7 text-slate-400">
              {profile.description ||
                `${school.name} is committed to providing quality education in a nurturing environment.`}
            </p>

            {/* =================================================
                SOCIAL MEDIA
            ================================================= */}
            {(socialLinks.some((social) => social.url) ||
              whatsappNumber) && (
              <div className="mt-6">
                <p className="text-sm font-semibold text-white">
                  Follow Us
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-3">
                  {socialLinks.map((social) => {
                    if (!social.url) return null;

                    const Icon = social.icon;

                    return (
                      <a
                        key={social.name}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={social.name}
                        title={social.name}
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition hover:-translate-y-0.5 hover:text-white"
                        style={{
                          "--social-hover-color": primaryColor,
                        }}
                        onMouseEnter={(event) => {
                          event.currentTarget.style.backgroundColor =
                            primaryColor;
                          event.currentTarget.style.borderColor =
                            primaryColor;
                        }}
                        onMouseLeave={(event) => {
                          event.currentTarget.style.backgroundColor =
                            "";
                          event.currentTarget.style.borderColor =
                            "";
                        }}
                      >
                        <Icon size={18} />
                      </a>
                    );
                  })}

                  {/* X / Twitter */}
                  {profile.twitter && (
                    <a
                      href={profile.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="X / Twitter"
                      title="X / Twitter"
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm font-semibold text-slate-300 transition hover:-translate-y-0.5 hover:text-white"
                      onMouseEnter={(event) => {
                        event.currentTarget.style.backgroundColor =
                          primaryColor;
                        event.currentTarget.style.borderColor =
                          primaryColor;
                      }}
                      onMouseLeave={(event) => {
                        event.currentTarget.style.backgroundColor =
                          "";
                        event.currentTarget.style.borderColor =
                          "";
                      }}
                    >
                      X
                    </a>
                  )}

                  {/* WhatsApp */}
                  {whatsappNumber && (
                    <a
                      href={`https://wa.me/${whatsappNumber}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="WhatsApp"
                      title="WhatsApp"
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm font-bold text-slate-300 transition hover:-translate-y-0.5 hover:text-white"
                      onMouseEnter={(event) => {
                        event.currentTarget.style.backgroundColor =
                          primaryColor;
                        event.currentTarget.style.borderColor =
                          primaryColor;
                      }}
                      onMouseLeave={(event) => {
                        event.currentTarget.style.backgroundColor =
                          "";
                        event.currentTarget.style.borderColor =
                          "";
                      }}
                    >
                      WA
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* =================================================
              QUICK LINKS
          ================================================= */}
          <div>
            <h3 className="font-semibold">
              Quick Links
            </h3>

            <div className="mt-4 flex flex-col gap-3 text-sm text-slate-400">
              <Link
                href={`${schoolPath}/about`}
                className="transition hover:text-white"
              >
                About Us
              </Link>

              <Link
                href={`${schoolPath}/academics`}
                className="transition hover:text-white"
              >
                Academics
              </Link>

              <Link
                href={`${schoolPath}/admissions`}
                className="transition hover:text-white"
              >
                Admissions
              </Link>

              <Link
                href={`${schoolPath}/gallery`}
                className="transition hover:text-white"
              >
                Gallery
              </Link>

              <Link
                href={`${schoolPath}/news`}
                className="transition hover:text-white"
              >
                News
              </Link>

              <Link
                href={`${schoolPath}/contact`}
                className="transition hover:text-white"
              >
                Contact
              </Link>
            </div>
          </div>

          {/* =================================================
              CONTACT
          ================================================= */}
          <div>
            <h3 className="font-semibold">
              Contact Us
            </h3>

            <div className="mt-4 space-y-3 text-sm leading-6 text-slate-400">
              {school.address && (
                <p>{school.address}</p>
              )}

              {(school.city || school.state) && (
                <p>
                  {school.city}
                  {school.city && school.state ? ", " : ""}
                  {school.state}
                </p>
              )}

              {school.phone && (
                <p>{school.phone}</p>
              )}

              {school.email && (
                <p>{school.email}</p>
              )}

              {profile.whatsapp && (
                <a
                  href={`https://wa.me/${whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block transition hover:text-white"
                >
                  Chat with us on WhatsApp
                </a>
              )}
            </div>
          </div>
        </div>

        {/* =====================================================
            COPYRIGHT
        ===================================================== */}
        <div className="border-t border-white/10">
          <div className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between lg:px-8">
            <p>
              © {new Date().getFullYear()} {school.name}. All rights reserved.
            </p>

            <p>
              Powered by School Management System
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function NavLink({ href, children }) {
  return (
    <Link
      href={href}
      className="text-sm font-medium text-slate-600 transition hover:text-slate-950"
    >
      {children}
    </Link>
  );
}