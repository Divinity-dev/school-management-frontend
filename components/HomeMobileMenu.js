"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

import AuthActionButton from "./AuthActionButton";
import DashboardNavLink from "./DashboardNavLink";

export default function HomeMobileMenu() {
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    ["Features", "#features"],
    ["How It Works", "#how-it-works"],
    ["Portals", "#portals"],
    ["Pricing", "#pricing"],
  ];

  const closeMenu = () => setIsOpen(false);

  return (
    <>
      <button
        type="button"
        className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 lg:hidden"
        aria-label={isOpen ? "Close navigation" : "Open navigation"}
        aria-expanded={isOpen}
        aria-controls="home-mobile-navigation"
        onClick={() => setIsOpen((open) => !open)}
      >
        {isOpen ? <X size={21} /> : <Menu size={21} />}
      </button>

      <nav
        id="home-mobile-navigation"
        aria-label="Mobile navigation"
        className={`absolute left-0 right-0 top-full border-b border-slate-100 bg-white px-6 py-4 shadow-lg lg:hidden ${
          isOpen ? "block" : "hidden"
        }`}
      >
        <div className="flex flex-col gap-1">
          {links.map(([label, href]) => (
            <a
              key={label}
              href={href}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-emerald-600"
              onClick={closeMenu}
            >
              {label}
            </a>
          ))}

          <div className="mt-2 flex flex-col gap-2 border-t border-slate-100 pt-3">
            <DashboardNavLink
              className="rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            />
            <AuthActionButton
              className="rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            />
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
              onClick={closeMenu}
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>
    </>
  );
}
