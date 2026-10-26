"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

import AuthActionButton from "../AuthActionButton";
import DashboardNavLink from "../DashboardNavLink";

export default function PublicSiteMobileMenu({ schoolPath, schoolHomePath, primaryColor }) {
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    ["Home", schoolHomePath || schoolPath],
    ["About", `${schoolPath}/about`],
    ["Academics", `${schoolPath}/academics`],
    ["Admissions", `${schoolPath}/admissions`],
    ["Gallery", `${schoolPath}/gallery`],
    ["News", `${schoolPath}/news`],
    ["Contact", `${schoolPath}/contact`],
  ];

  const closeMenu = () => setIsOpen(false);

  return (
    <>
      <button
        type="button"
        className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 lg:hidden"
        aria-label={isOpen ? "Close navigation" : "Open navigation"}
        aria-expanded={isOpen}
        aria-controls="public-school-mobile-navigation"
        onClick={() => setIsOpen((open) => !open)}
      >
        {isOpen ? <X size={21} /> : <Menu size={21} />}
      </button>

      <nav
        id="public-school-mobile-navigation"
        aria-label="Mobile navigation"
        className={`absolute left-0 right-0 top-full border-b border-slate-100 bg-white px-6 py-4 shadow-lg lg:hidden ${
          isOpen ? "block" : "hidden"
        }`}
      >
        <div className="flex flex-col gap-1">
          {links.map(([label, href]) => (
            <Link
              key={label}
              href={href}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-900"
              onClick={closeMenu}
            >
              {label}
            </Link>
          ))}

          <div className="mt-2 flex flex-col gap-2 border-t border-slate-100 pt-3">
            <DashboardNavLink
              className="rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            />
            <AuthActionButton
              label="Portal Login"
              className="rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-white"
              style={{ backgroundColor: primaryColor }}
            />
          </div>
        </div>
      </nav>
    </>
  );
}
