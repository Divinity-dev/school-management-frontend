"use client";

import Link from "next/link";
import AuthActionButton from "../components/AuthActionButton";
import DashboardNavLink from "../components/DashboardNavLink";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CalendarCheck,
  CheckCircle2,
  ChevronRight,
  GraduationCap,
  Globe2,
  LayoutDashboard,
  Megaphone,
  School,
  ShieldCheck,
  Sparkles,
  Users,
  WalletCards,
  Mail, 
  Phone
} from "lucide-react";
import HomeMobileMenu from "@/components/HomeMobileMenu";
import { motion, useReducedMotion } from "framer-motion";

// Replace these with contact details you actually control.
const CONTACT_EMAIL = "schoolpilot@gmail.com";
const CONTACT_PHONE = "+2348068715964";

export default function Home() {
  const reduceMotion = useReducedMotion();
  const reveal = reduceMotion ? {} : { initial: { opacity: 0, y: 22 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.15 }, transition: { duration: 0.55, ease: "easeOut" } };

  return (
    <main className="min-h-screen bg-white text-slate-900">
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/90 backdrop-blur-xl">
        <div className="relative mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
              <GraduationCap size={23} />
            </div>

            <div>
              <p className="text-lg font-bold tracking-tight text-slate-900">
                School<span className="text-emerald-600">Pilot</span>
              </p>
              <p className="hidden text-[10px] font-medium tracking-wide text-slate-400 sm:block">
                Run your school smarter.
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 lg:flex">
            <a href="#features" className="text-sm font-medium text-slate-600 transition hover:text-emerald-600">
              Features
            </a>
            <a href="#how-it-works" className="text-sm font-medium text-slate-600 transition hover:text-emerald-600">
              How It Works
            </a>
            <a href="#portals" className="text-sm font-medium text-slate-600 transition hover:text-emerald-600">
              Portals
            </a>
            <a href="#pricing" className="text-sm font-medium text-slate-600 transition hover:text-emerald-600">
              Pricing
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <DashboardNavLink className="hidden px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:text-emerald-600 lg:block" />
            <AuthActionButton className="hidden px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:text-emerald-600 lg:block" />

            <Link href="/register" className="hidden items-center gap-2 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 lg:inline-flex">
              Get Started
              <ArrowRight size={16} />
            </Link>

            <HomeMobileMenu />
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden bg-slate-950">
        <div className="absolute inset-0">
          <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl" />
          <div className="absolute -bottom-40 -right-20 h-[30rem] w-[30rem] rounded-full bg-teal-400/10 blur-3xl" />
        </div>

        <div className="relative mx-auto grid max-w-7xl gap-16 px-6 py-24 lg:grid-cols-2 lg:items-center lg:px-8 lg:py-32">
          <motion.div {...reveal}>
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm font-medium text-emerald-300">
              <Sparkles size={15} />
              Less paperwork. More progress.
            </div>

            <h1 className="max-w-3xl text-5xl font-bold leading-[1.08] tracking-tight text-white sm:text-6xl lg:text-7xl">
              Run your school
              <span className="block text-emerald-400">smarter.</span>
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
              Bring the moving parts of school life into one clear workspace. From the first attendance register to published results and parent updates, SchoolPilot helps your team spend less time chasing records and more time supporting learners.
            </p>

            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <Link href="/register" className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-7 py-4 font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400">
                Create Your School
                <ArrowRight size={18} />
              </Link>

              <AuthActionButton
                label="Sign In"
                className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-7 py-4 font-semibold text-white transition hover:bg-white/10"
              />
            </div>

            <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-400" />
                Multi-school platform
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-400" />
                Parent & student portals
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-400" />
                Public school website
              </div>
            </div>
          </motion.div>

          {/* Dashboard preview */}
          <motion.div {...(reduceMotion ? {} : { initial: { opacity: 0, scale: 0.97 }, animate: { opacity: 1, scale: 1 }, transition: { duration: 0.7, delay: 0.12 } })} className="relative">
            <div className="absolute -inset-5 rounded-[2rem] bg-emerald-500/10 blur-2xl" />

            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white shadow-2xl">
              <div className="flex h-14 items-center justify-between border-b border-slate-100 px-5">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                  <div className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                  <div className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                </div>

                <div className="rounded-md bg-slate-50 px-4 py-1.5 text-xs text-slate-400">
                  schoolpilot.app
                </div>

                <div className="w-12" />
              </div>

              <div className="grid min-h-[430px] grid-cols-[52px_minmax(0,1fr)] sm:grid-cols-[72px_minmax(0,1fr)] lg:grid-cols-[90px_minmax(0,1fr)]">
                <div className="border-r border-slate-100 bg-slate-50 p-2 sm:p-3 lg:p-4">
                  <div className="mb-8 flex justify-center">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600 text-white sm:h-10 sm:w-10">
                      <GraduationCap size={18} className="sm:hidden" />
                      <GraduationCap size={20} className="hidden sm:block" />
                    </div>
                  </div>

                  <div className="space-y-3 sm:space-y-5">
                    {[LayoutDashboard, Users, CalendarCheck, BookOpen, WalletCards].map((Icon, index) => (
                      <div
                        key={index}
                        className={`mx-auto flex h-8 w-8 items-center justify-center rounded-lg sm:h-9 sm:w-9 ${
                          index === 0
                            ? "bg-emerald-100 text-emerald-600"
                            : "text-slate-300"
                        }`}
                      >
                        <Icon size={18} />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="min-w-0 p-3 sm:p-4 lg:p-6">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[10px] font-medium text-slate-400 sm:text-xs">SCHOOL DASHBOARD</p>
                      <h3 className="mt-1 text-base font-bold leading-tight text-slate-900 sm:text-xl">
                        Good morning, Admin
                      </h3>
                    </div>
                    <div className="h-8 w-8 shrink-0 rounded-full bg-emerald-100 sm:h-9 sm:w-9" />
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-2 sm:mt-7 sm:gap-4">
                    <DashboardCard icon={Users} label="Students" value="1,248" />
                    <DashboardCard icon={GraduationCap} label="Teachers" value="86" />
                    <DashboardCard icon={CalendarCheck} label="Attendance" value="94.8%" />
                    <DashboardCard icon={WalletCards} label="Fees Collected" value="₦8.4M" />
                  </div>

                  <div className="mt-4 rounded-2xl border border-slate-100 p-3 sm:mt-5 sm:p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">Student Growth</p>
                        <p className="text-xs text-slate-400">Academic year overview</p>
                      </div>
                      <BarChart3 size={20} className="text-emerald-500" />
                    </div>

                    <div className="mt-6 flex h-24 items-end gap-2 sm:gap-3">
                      {[35, 48, 42, 65, 58, 76, 88, 82, 96].map((height, index) => (
                        <div
                          key={index}
                          className="flex-1 rounded-t-md bg-emerald-100"
                          style={{ height: `${height}%` }}
                        >
                          <div
                            className="h-full rounded-t-md bg-emerald-500/80"
                            style={{ height: `${Math.min(100, height + 8)}%` }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* TRUST / INTRO */}
      <section className="border-b border-slate-100 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16 text-center lg:px-8">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-600">
            A clearer way to run school
          </p>
          <h2 className="mx-auto mt-4 max-w-3xl text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Give your school team room to focus on what matters.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl leading-8 text-slate-600">
            Keep records, classroom activity, family communication and school updates connected — without piecing together information from separate tools.
          </p>
        </div>
      </section>

      {/* PEOPLE / COMMUNITY */}
      <motion.section {...reveal} className="bg-white py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-600">People at the heart of every school</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Better organised behind the scenes. More connected in the classroom.</h2>
            <p className="mt-5 leading-8 text-slate-600">School is about people, not paperwork. SchoolPilot helps administrators support teachers, teachers guide learners, and families stay part of the journey.</p>
            <div className="mt-6 flex flex-wrap gap-3 text-sm font-semibold text-slate-700"><span className="rounded-full bg-emerald-50 px-4 py-2">For school teams</span><span className="rounded-full bg-slate-100 px-4 py-2">For teachers</span><span className="rounded-full bg-slate-100 px-4 py-2">For every learner</span></div>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:gap-5">
            <div className="overflow-hidden rounded-3xl bg-slate-100 shadow-sm"><img src="https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=900&q=85" alt="Students learning together in a classroom" loading="lazy" className="h-56 w-full object-cover sm:h-72" /><p className="px-4 py-4 text-sm font-semibold text-slate-800">Curiosity in every classroom</p></div>
            <div className="mt-8 overflow-hidden rounded-3xl bg-slate-100 shadow-sm sm:mt-12"><img src="https://images.unsplash.com/photo-1580894732444-8ecded7900cd?auto=format&fit=crop&w=900&q=85" alt="Teacher supporting students during a lesson" loading="lazy" className="h-56 w-full object-cover sm:h-72" /><p className="px-4 py-4 text-sm font-semibold text-slate-800">Teachers making a difference</p></div>
          </div>
        </div>
      </motion.section>

      {/* FEATURES */}
      <section id="features" className="bg-slate-50 py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-600">
              Made for the school day
            </p>
            <h2 className="mt-3 text-4xl font-bold tracking-tight text-slate-900">
              The everyday work, made easier
            </h2>
            <p className="mt-5 leading-8 text-slate-600">
              From admissions and attendance to grading and fee tracking, each tool is designed around the practical jobs school teams handle every week.
            </p>
          </div>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard icon={Users} title="Student Management" text="Manage student profiles, enrollment, classes, guardians and academic information from one place." />
            <FeatureCard icon={GraduationCap} title="Teacher Management" text="Organize teachers, class assignments and teaching responsibilities with ease." />
            <FeatureCard icon={CalendarCheck} title="Attendance" text="Record and monitor attendance while giving schools a clear picture of student participation." />
            <FeatureCard icon={BookOpen} title="Assignments" text="Create assignments, publish them to students, collect submissions and manage grading." />
            <FeatureCard icon={BarChart3} title="Results & Grading" text="Manage continuous assessment, examinations, results review, publishing and academic records." />
            <FeatureCard icon={WalletCards} title="School Fees" text="Create fee structures, track balances and receive online payments securely." />
            <FeatureCard icon={Users} title="Parent Portal" text="Give parents access to their children's academic progress, attendance, fees and more." />
            <FeatureCard icon={Megaphone} title="Announcements" text="Keep your school community informed with important announcements and updates." />
            <FeatureCard
              icon={Globe2}
              title="Public School Website"
              text="Give your school its own professional website with its own branding, content and public pages."
              highlighted
            />
          </div>
        </div>
      </section>

      {/* PUBLIC WEBSITE FEATURE */}
      <section className="overflow-hidden bg-white py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
                <Globe2 size={16} />
                Your school deserves a website
              </div>

              <h2 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                A professional school presence, without another system to manage.
              </h2>

              <p className="mt-6 text-lg leading-8 text-slate-600">
                Share your school story with families and prospective parents. Update your identity, admissions information, news and events from the same place you manage school operations.
              </p>

              <div className="mt-8 space-y-4">
                {[
                  "Custom school branding",
                  "Home, About, Academics and Admissions pages",
                  "News and Events",
                  "Contact and social media information",
                  "School-controlled content",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                      <CheckCircle2 size={15} />
                    </div>
                    <span className="text-slate-700">{item}</span>
                  </div>
                ))}
              </div>

              <Link href="/register" className="mt-9 inline-flex items-center gap-2 font-semibold text-emerald-600 transition hover:text-emerald-700">
                Build your school presence
                <ArrowRight size={17} />
              </Link>
            </div>

            <div className="relative">
              <div className="absolute -inset-6 rounded-[3rem] bg-emerald-100/70 blur-3xl" />
              <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
                <div className="bg-emerald-700 px-7 py-8 text-white">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
                      <School size={22} />
                    </div>
                    <div>
                      <p className="font-bold">Bright Future Academy</p>
                      <p className="text-xs text-emerald-100">
                        Excellence • Character • Leadership
                      </p>
                    </div>
                  </div>

                  <div className="mt-12 max-w-sm">
                    <p className="text-sm font-semibold text-emerald-200">
                      WELCOME TO OUR SCHOOL
                    </p>
                    <h3 className="mt-2 text-3xl font-bold">
                      Building tomorrow&apos;s leaders today.
                    </h3>
                    <p className="mt-4 text-sm leading-6 text-emerald-100">
                      Discover a learning environment where every child is
                      encouraged to grow, learn and succeed.
                    </p>
                    <div className="mt-6 inline-flex rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-emerald-700">
                      Learn More
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-px bg-slate-100">
                  {[
                    ["20+", "Years"],
                    ["1,200+", "Students"],
                    ["80+", "Teachers"],
                  ].map(([number, label]) => (
                    <div key={label} className="bg-white px-4 py-6 text-center">
                      <p className="text-xl font-bold text-slate-900">{number}</p>
                      <p className="mt-1 text-xs text-slate-400">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="bg-slate-950 py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-400">
              A straightforward start
            </p>
            <h2 className="mt-3 text-4xl font-bold tracking-tight text-white">
              From setup to school day
            </h2>
            <p className="mx-auto mt-5 max-w-2xl leading-8 text-slate-400">
              Start with your school profile, organise your academic year, and bring your team into a workspace that is ready for everyday use.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            <HowStep number="01" title="Create your school" text="Register your school and set up your school profile, academic sessions and classes." />
            <HowStep number="02" title="Configure your platform" text="Set up students, teachers, fees, grading and your school's public website." />
            <HowStep number="03" title="Run your school" text="Manage daily school operations while students, teachers and parents stay connected." />
          </div>
        </div>
      </section>

      {/* PORTALS */}
      <section id="portals" className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-600">
                Built around real people
              </p>
              <h2 className="mt-3 text-4xl font-bold tracking-tight text-slate-900">
                The right tools for every role
              </h2>
              <p className="mt-5 leading-8 text-slate-600">
                Administrators, teachers, students and parents see the information and actions that matter to their part of school life.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <PortalCard icon={LayoutDashboard} title="School Admin" text="Manage the entire school from one powerful dashboard." />
              <PortalCard icon={GraduationCap} title="Teacher" text="Manage classes, attendance, assignments and academic records." />
              <PortalCard icon={BookOpen} title="Student" text="Access assignments, results, attendance and school information." />
              <PortalCard icon={Users} title="Parent" text="Stay connected with your child's academic journey." />
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="bg-slate-50 py-24">
        <div className="mx-auto max-w-4xl px-6 text-center lg:px-8">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-600">
            Straightforward pricing
          </p>
          <h2 className="mt-3 text-4xl font-bold tracking-tight text-slate-900">
            A plan that can grow with your enrolment
          </h2>
          <p className="mx-auto mt-5 max-w-2xl leading-8 text-slate-600">
            Choose capacity around your student population and keep the core school-management tools together in one platform.
          </p>

          <div className="mx-auto mt-12 max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-left shadow-xl shadow-slate-200/40">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-bold text-slate-900">School Platform</p>
                <p className="mt-1 text-sm text-slate-500">Everything included</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <ShieldCheck size={24} />
              </div>
            </div>

            <div className="my-7 h-px bg-slate-100" />

            <div className="space-y-4">
              {[
                "Student management",
                "Teacher management",
                "Attendance",
                "Assignments",
                "Results & grading",
                "School fees",
                "Student & parent portals",
                "Public school website",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <CheckCircle2 size={18} className="shrink-0 text-emerald-500" />
                  <span className="text-sm text-slate-700">{item}</span>
                </div>
              ))}
            </div>

            <Link href="/register" className="mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-emerald-600 px-6 py-3.5 font-semibold text-white transition hover:bg-emerald-700">
              Get Started
              <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-emerald-600">
        <div className="absolute -left-32 top-0 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-40 right-0 h-96 w-96 rounded-full bg-emerald-950/20 blur-3xl" />

        <div className="relative mx-auto max-w-4xl px-6 py-24 text-center lg:px-8">
          <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Make more room for teaching and learning.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-emerald-50">
            Start building a more organised school day — with clearer records, simpler workflows and a community that stays informed.
          </p>

          <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row">
            <Link href="/register" className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-4 font-semibold text-emerald-700 shadow-lg transition hover:bg-emerald-50">
              Create Your School
              <ArrowRight size={18} />
            </Link>
            <AuthActionButton
              label="Sign In"
              className="inline-flex items-center justify-center rounded-full border border-white/30 px-7 py-4 font-semibold text-white transition hover:bg-white/10"
            />
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-950 text-slate-400">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
            <div className="lg:col-span-2">
              <Link href="/" className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white">
                  <GraduationCap size={22} />
                </div>
                <p className="text-xl font-bold text-white">
                  School<span className="text-emerald-400">Pilot</span>
                </p>
              </Link>

              <p className="mt-3 text-sm font-medium text-emerald-400">
                Run your school smarter.
              </p>

              <p className="mt-5 max-w-md leading-7">
                One connected workspace for school operations, classroom progress, family communication and your school’s public presence.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-white">Platform</h3>
              <div className="mt-5 space-y-3 text-sm">
                <a href="#features" className="block transition hover:text-white">Features</a>
                <a href="#how-it-works" className="block transition hover:text-white">How It Works</a>
                <a href="#portals" className="block transition hover:text-white">Portals</a>
                <a href="#pricing" className="block transition hover:text-white">Pricing</a>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-white">Account</h3>
              <div className="mt-5 space-y-3 text-sm">
                <AuthActionButton className="block transition hover:text-white" />
                <Link href="/register" className="block transition hover:text-white">
                  Create a School
                </Link>
              </div>
            </div>

            
<div>
  <h3 className="font-semibold text-white">Contact Us</h3>

  <div className="mt-5 space-y-4 text-sm">
    <a
      href={`mailto:${CONTACT_EMAIL}`}
      className="flex items-center gap-3 break-all transition hover:text-white"
    >
      <Mail size={17} className="shrink-0 text-emerald-400" />
      <span>{CONTACT_EMAIL}</span>
    </a>

    <a
      href={`tel:${CONTACT_PHONE.replace(/[^\d+]/g, "")}`}
      className="flex items-center gap-3 transition hover:text-white"
    >
      <Phone size={17} className="shrink-0 text-emerald-400" />
      <span>{CONTACT_PHONE}</span>
    </a>
  </div>
</div>

<div>
  <h3 className="font-semibold text-white">Legal</h3>

  <div className="mt-5 space-y-3 text-sm">
    <Link
      href="/privacy-policy"
      className="block transition hover:text-white"
    >
      Privacy Policy
    </Link>
  </div>
</div>

          </div>



          <div className="mt-14 flex flex-col gap-4 border-t border-white/10 pt-7 text-sm sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {new Date().getFullYear()} SchoolPilot. All rights reserved.
            </p>
            <p className="text-slate-500">Run your school smarter.</p>
          </div>
        </div>

      </footer>
    </main>
  );
}

/* COMPONENTS */

function DashboardCard({ icon: Icon, label, value }) {
  return (
    <div className="min-w-0 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm sm:p-4">
      <div className="flex items-center justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
          <Icon size={17} />
        </div>
        <ChevronRight size={15} className="text-slate-300" />
      </div>
      <p className="mt-4 text-[11px] text-slate-400 sm:text-xs">{label}</p>
      <p className="mt-1 text-base font-bold text-slate-900 sm:text-xl">{value}</p>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, text, highlighted = false }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div initial={reduceMotion ? false : { opacity: 0, y: 18 }} whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.45 }}
      className={`group rounded-3xl border p-7 transition duration-300 hover:-translate-y-1 hover:shadow-xl ${
        highlighted
          ? "border-emerald-200 bg-emerald-50/70"
          : "border-slate-200 bg-white"
      }`}
    >
      <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${
        highlighted
          ? "bg-emerald-600 text-white"
          : "bg-slate-100 text-emerald-600"
      }`}>
        <Icon size={22} />
      </div>
      <h3 className="mt-6 text-xl font-bold text-slate-900">{title}</h3>
      <p className="mt-3 leading-7 text-slate-600">{text}</p>
      <div className="mt-6 flex items-center gap-1 text-sm font-semibold text-emerald-600 opacity-0 transition group-hover:opacity-100">
        Learn more
        <ArrowRight size={15} />
      </div>
    </motion.div>
  );
}

function HowStep({ number, title, text }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div initial={reduceMotion ? false : { opacity: 0, y: 18 }} whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.45 }} className="relative rounded-3xl border border-white/10 bg-white/5 p-8">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500 font-bold text-white">
        {number}
      </div>
      <h3 className="mt-7 text-xl font-bold text-white">{title}</h3>
      <p className="mt-3 leading-7 text-slate-400">{text}</p>
    </motion.div>
  );
}

function PortalCard({ icon: Icon, title, text }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div initial={reduceMotion ? false : { opacity: 0, y: 18 }} whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.45 }} className="group rounded-3xl border border-slate-200 bg-white p-7 transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl">
      <div className="flex items-center justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
          <Icon size={22} />
        </div>
        <ArrowRight size={18} className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-emerald-500" />
      </div>
      <h3 className="mt-6 text-xl font-bold text-slate-900">{title}</h3>
      <p className="mt-3 leading-7 text-slate-600">{text}</p>
    </motion.div>
  );
}
