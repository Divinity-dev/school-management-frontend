import Link from "next/link";
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
} from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      {/* =========================================================
          NAVBAR
      ========================================================= */}
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
              <School size={22} />
            </div>

            <div>
              <p className="text-lg font-bold tracking-tight text-slate-900">
                School<span className="text-emerald-600">Hub</span>
              </p>
              <p className="hidden text-[10px] font-medium uppercase tracking-widest text-slate-400 sm:block">
                School Management Platform
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <a
              href="#features"
              className="text-sm font-medium text-slate-600 transition hover:text-emerald-600"
            >
              Features
            </a>

            <a
              href="#how-it-works"
              className="text-sm font-medium text-slate-600 transition hover:text-emerald-600"
            >
              How It Works
            </a>

            <a
              href="#portals"
              className="text-sm font-medium text-slate-600 transition hover:text-emerald-600"
            >
              Portals
            </a>

            <a
              href="#pricing"
              className="text-sm font-medium text-slate-600 transition hover:text-emerald-600"
            >
              Pricing
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:text-emerald-600 sm:block"
            >
              Login
            </Link>

            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
            >
              Get Started
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </header>

      {/* =========================================================
          HERO
      ========================================================= */}
      <section className="relative overflow-hidden bg-slate-950">
        <div className="absolute inset-0">
          <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl" />
          <div className="absolute -bottom-40 -right-20 h-[30rem] w-[30rem] rounded-full bg-teal-400/10 blur-3xl" />
        </div>

        <div className="relative mx-auto grid max-w-7xl gap-16 px-6 py-24 lg:grid-cols-2 lg:items-center lg:px-8 lg:py-32">
          <div>
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm font-medium text-emerald-300">
              <Sparkles size={15} />
              Everything your school needs
            </div>

            <h1 className="max-w-3xl text-5xl font-bold leading-[1.08] tracking-tight text-white sm:text-6xl lg:text-7xl">
              Run your school
              <span className="block text-emerald-400">
                smarter.
              </span>
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
              A complete school management platform that helps you manage
              students, teachers, attendance, results, assignments, fees,
              parents — and your school&apos;s public website.
            </p>

            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-7 py-4 font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400"
              >
                Create Your School
                <ArrowRight size={18} />
              </Link>

              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-7 py-4 font-semibold text-white transition hover:bg-white/10"
              >
                Sign In
              </Link>
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
          </div>

          {/* Dashboard visual */}
          <div className="relative">
            <div className="absolute -inset-5 rounded-[2rem] bg-emerald-500/10 blur-2xl" />

            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white shadow-2xl">
              <div className="flex h-14 items-center justify-between border-b border-slate-100 px-5">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                  <div className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                  <div className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                </div>

                <div className="rounded-md bg-slate-50 px-4 py-1.5 text-xs text-slate-400">
                  schoolhub.app
                </div>

                <div className="w-12" />
              </div>

              <div className="grid min-h-[430px] grid-cols-[90px_1fr]">
                <div className="border-r border-slate-100 bg-slate-50 p-4">
                  <div className="mb-8 flex justify-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white">
                      <School size={19} />
                    </div>
                  </div>

                  <div className="space-y-5">
                    {[LayoutDashboard, Users, CalendarCheck, BookOpen, WalletCards].map(
                      (Icon, index) => (
                        <div
                          key={index}
                          className={`mx-auto flex h-9 w-9 items-center justify-center rounded-lg ${
                            index === 0
                              ? "bg-emerald-100 text-emerald-600"
                              : "text-slate-300"
                          }`}
                        >
                          <Icon size={18} />
                        </div>
                      )
                    )}
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-slate-400">
                        SCHOOL DASHBOARD
                      </p>
                      <h3 className="mt-1 text-xl font-bold text-slate-900">
                        Good morning, Admin
                      </h3>
                    </div>

                    <div className="h-9 w-9 rounded-full bg-emerald-100" />
                  </div>

                  <div className="mt-7 grid grid-cols-2 gap-4">
                    <DashboardCard
                      icon={Users}
                      label="Students"
                      value="1,248"
                    />
                    <DashboardCard
                      icon={GraduationCap}
                      label="Teachers"
                      value="86"
                    />
                    <DashboardCard
                      icon={CalendarCheck}
                      label="Attendance"
                      value="94.8%"
                    />
                    <DashboardCard
                      icon={WalletCards}
                      label="Fees Collected"
                      value="₦8.4M"
                    />
                  </div>

                  <div className="mt-5 rounded-2xl border border-slate-100 p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          Student Growth
                        </p>
                        <p className="text-xs text-slate-400">
                          Academic year overview
                        </p>
                      </div>

                      <BarChart3
                        size={20}
                        className="text-emerald-500"
                      />
                    </div>

                    <div className="mt-6 flex h-24 items-end gap-3">
                      {[35, 48, 42, 65, 58, 76, 88, 82, 96].map(
                        (height, index) => (
                          <div
                            key={index}
                            className="flex-1 rounded-t-md bg-emerald-100"
                            style={{ height: `${height}%` }}
                          >
                            <div
                              className="h-full rounded-t-md bg-emerald-500/80"
                              style={{
                                height: `${Math.min(
                                  100,
                                  height + 8
                                )}%`,
                              }}
                            />
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          TRUST / INTRO
      ========================================================= */}
      <section className="border-b border-slate-100 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16 text-center lg:px-8">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-600">
            One platform. One connected school.
          </p>

          <h2 className="mx-auto mt-4 max-w-3xl text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Replace scattered spreadsheets and disconnected systems with one
            simple platform.
          </h2>

          <p className="mx-auto mt-5 max-w-2xl leading-8 text-slate-600">
            From the school administrator to the classroom, student and parent,
            everyone gets the tools they need in one connected ecosystem.
          </p>
        </div>
      </section>

      {/* =========================================================
          FEATURES
      ========================================================= */}
      <section id="features" className="bg-slate-50 py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-600">
              Powerful features
            </p>

            <h2 className="mt-3 text-4xl font-bold tracking-tight text-slate-900">
              Everything you need to manage your school
            </h2>

            <p className="mt-5 leading-8 text-slate-600">
              Built around the real workflows of modern schools, from student
              records and attendance to results, payments and communication.
            </p>
          </div>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={Users}
              title="Student Management"
              text="Manage student profiles, enrollment, classes, guardians and academic information from one place."
            />

            <FeatureCard
              icon={GraduationCap}
              title="Teacher Management"
              text="Organize teachers, class assignments and teaching responsibilities with ease."
            />

            <FeatureCard
              icon={CalendarCheck}
              title="Attendance"
              text="Record and monitor attendance while giving schools a clear picture of student participation."
            />

            <FeatureCard
              icon={BookOpen}
              title="Assignments"
              text="Create assignments, publish them to students, collect submissions and manage grading."
            />

            <FeatureCard
              icon={BarChart3}
              title="Results & Grading"
              text="Manage continuous assessment, examinations, results review, publishing and academic records."
            />

            <FeatureCard
              icon={WalletCards}
              title="School Fees"
              text="Create fee structures, track balances and receive online payments securely."
            />

            <FeatureCard
              icon={Users}
              title="Parent Portal"
              text="Give parents access to their children's academic progress, attendance, fees and more."
            />

            <FeatureCard
              icon={Megaphone}
              title="Announcements"
              text="Keep your school community informed with important announcements and updates."
            />

            <FeatureCard
              icon={Globe2}
              title="Public School Website"
              text="Give your school its own professional website with its own branding, content and public pages."
              highlighted
            />
          </div>
        </div>
      </section>

      {/* =========================================================
          PUBLIC WEBSITE FEATURE
      ========================================================= */}
      <section className="overflow-hidden bg-white py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
                <Globe2 size={16} />
                Your school deserves a website
              </div>

              <h2 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                Your management system and public website, together.
              </h2>

              <p className="mt-6 text-lg leading-8 text-slate-600">
                Every school on the platform can have its own public-facing
                website. Schools can control their branding, colours, school
                information, admissions, news, events, contact details and
                more.
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

              <Link
                href="/register"
                className="mt-9 inline-flex items-center gap-2 font-semibold text-emerald-600 transition hover:text-emerald-700"
              >
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
                    <div
                      key={label}
                      className="bg-white px-4 py-6 text-center"
                    >
                      <p className="text-xl font-bold text-slate-900">
                        {number}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        {label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          HOW IT WORKS
      ========================================================= */}
      <section id="how-it-works" className="bg-slate-950 py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-400">
              Simple setup
            </p>

            <h2 className="mt-3 text-4xl font-bold tracking-tight text-white">
              Get your school up and running
            </h2>

            <p className="mx-auto mt-5 max-w-2xl leading-8 text-slate-400">
              Getting started is simple. Create your school, configure your
              academic structure and invite your school community.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            <HowStep
              number="01"
              title="Create your school"
              text="Register your school and set up your school profile, academic sessions and classes."
            />

            <HowStep
              number="02"
              title="Configure your platform"
              text="Set up students, teachers, fees, grading and your school's public website."
            />

            <HowStep
              number="03"
              title="Run your school"
              text="Manage daily school operations while students, teachers and parents stay connected."
            />
          </div>
        </div>
      </section>

      {/* =========================================================
          PORTALS
      ========================================================= */}
      <section id="portals" className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-600">
                One connected ecosystem
              </p>

              <h2 className="mt-3 text-4xl font-bold tracking-tight text-slate-900">
                Everyone gets the right experience.
              </h2>

              <p className="mt-5 leading-8 text-slate-600">
                School management should not mean giving everyone the same
                dashboard. Each role gets the tools and information relevant
                to them.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <PortalCard
                icon={LayoutDashboard}
                title="School Admin"
                text="Manage the entire school from one powerful dashboard."
              />

              <PortalCard
                icon={GraduationCap}
                title="Teacher"
                text="Manage classes, attendance, assignments and academic records."
              />

              <PortalCard
                icon={BookOpen}
                title="Student"
                text="Access assignments, results, attendance and school information."
              />

              <PortalCard
                icon={Users}
                title="Parent"
                text="Stay connected with your child's academic journey."
              />
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          PRICING
      ========================================================= */}
      <section id="pricing" className="bg-slate-50 py-24">
        <div className="mx-auto max-w-4xl px-6 text-center lg:px-8">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-600">
            Simple pricing
          </p>

          <h2 className="mt-3 text-4xl font-bold tracking-tight text-slate-900">
            Pricing that grows with your school
          </h2>

          <p className="mx-auto mt-5 max-w-2xl leading-8 text-slate-600">
            Pay based on the students your school needs to manage. No
            complicated software packages and no unnecessary features.
          </p>

          <div className="mx-auto mt-12 max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-left shadow-xl shadow-slate-200/40">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-bold text-slate-900">
                  School Platform
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Everything included
                </p>
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
                  <CheckCircle2
                    size={18}
                    className="shrink-0 text-emerald-500"
                  />
                  <span className="text-sm text-slate-700">{item}</span>
                </div>
              ))}
            </div>

            <Link
              href="/register"
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-emerald-600 px-6 py-3.5 font-semibold text-white transition hover:bg-emerald-700"
            >
              Get Started
              <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================
          CTA
      ========================================================= */}
      <section className="relative overflow-hidden bg-emerald-600">
        <div className="absolute -left-32 top-0 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-40 right-0 h-96 w-96 rounded-full bg-emerald-950/20 blur-3xl" />

        <div className="relative mx-auto max-w-4xl px-6 py-24 text-center lg:px-8">
          <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Ready to transform the way your school operates?
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-emerald-50">
            Bring your school administration, classrooms, students, parents
            and public presence together on one platform.
          </p>

          <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-4 font-semibold text-emerald-700 shadow-lg transition hover:bg-emerald-50"
            >
              Create Your School
              <ArrowRight size={18} />
            </Link>

            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-full border border-white/30 px-7 py-4 font-semibold text-white transition hover:bg-white/10"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================
          FOOTER
      ========================================================= */}
      <footer className="bg-slate-950 text-slate-400">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
            <div className="lg:col-span-2">
              <Link href="/" className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white">
                  <School size={21} />
                </div>

                <p className="text-xl font-bold text-white">
                  School<span className="text-emerald-400">Hub</span>
                </p>
              </Link>

              <p className="mt-5 max-w-md leading-7">
                A modern school management platform built to help schools
                manage their operations, connect their communities and build
                their digital presence.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-white">Platform</h3>

              <div className="mt-5 space-y-3 text-sm">
                <a
                  href="#features"
                  className="block transition hover:text-white"
                >
                  Features
                </a>

                <a
                  href="#how-it-works"
                  className="block transition hover:text-white"
                >
                  How It Works
                </a>

                <a
                  href="#portals"
                  className="block transition hover:text-white"
                >
                  Portals
                </a>

                <a
                  href="#pricing"
                  className="block transition hover:text-white"
                >
                  Pricing
                </a>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-white">Account</h3>

              <div className="mt-5 space-y-3 text-sm">
                <Link
                  href="/login"
                  className="block transition hover:text-white"
                >
                  Login
                </Link>

                <Link
                  href="/register"
                  className="block transition hover:text-white"
                >
                  Create a School
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-14 flex flex-col gap-4 border-t border-white/10 pt-7 text-sm sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {new Date().getFullYear()} SchoolHub. All rights reserved.
            </p>

            <p className="text-slate-500">
              School management made simple.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}

/* =========================================================
   COMPONENTS
========================================================= */

function DashboardCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
          <Icon size={17} />
        </div>

        <ChevronRight size={15} className="text-slate-300" />
      </div>

      <p className="mt-4 text-xs text-slate-400">{label}</p>
      <p className="mt-1 text-xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  text,
  highlighted = false,
}) {
  return (
    <div
      className={`group rounded-3xl border p-7 transition duration-300 hover:-translate-y-1 hover:shadow-xl ${
        highlighted
          ? "border-emerald-200 bg-emerald-50/70"
          : "border-slate-200 bg-white"
      }`}
    >
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-xl ${
          highlighted
            ? "bg-emerald-600 text-white"
            : "bg-slate-100 text-emerald-600"
        }`}
      >
        <Icon size={22} />
      </div>

      <h3 className="mt-6 text-xl font-bold text-slate-900">
        {title}
      </h3>

      <p className="mt-3 leading-7 text-slate-600">{text}</p>

      <div className="mt-6 flex items-center gap-1 text-sm font-semibold text-emerald-600 opacity-0 transition group-hover:opacity-100">
        Learn more
        <ArrowRight size={15} />
      </div>
    </div>
  );
}

function HowStep({ number, title, text }) {
  return (
    <div className="relative rounded-3xl border border-white/10 bg-white/5 p-8">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500 font-bold text-white">
        {number}
      </div>

      <h3 className="mt-7 text-xl font-bold text-white">{title}</h3>

      <p className="mt-3 leading-7 text-slate-400">{text}</p>
    </div>
  );
}

function PortalCard({ icon: Icon, title, text }) {
  return (
    <div className="group rounded-3xl border border-slate-200 bg-white p-7 transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl">
      <div className="flex items-center justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
          <Icon size={22} />
        </div>

        <ArrowRight
          size={18}
          className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-emerald-500"
        />
      </div>

      <h3 className="mt-6 text-xl font-bold text-slate-900">{title}</h3>

      <p className="mt-3 leading-7 text-slate-600">{text}</p>
    </div>
  );
}