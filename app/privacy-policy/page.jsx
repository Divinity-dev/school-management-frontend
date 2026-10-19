
import Link from "next/link";
import {
  ArrowLeft,
  ShieldCheck,
  LockKeyhole,
  Database,
  Users,
  Eye,
  FileText,
  CalendarDays,
} from "lucide-react";

const LAST_UPDATED = "16 October 2026";

const sections = [
  {
    id: "introduction",
    title: "1. Introduction",
    content: (
      <>
        <p>
          Welcome to SchoolPilot, a school management platform designed to help
          schools manage their academic and administrative activities more
          efficiently.
        </p>
        <p>
          This Privacy Policy explains how SchoolPilot collects, uses, stores,
          protects, and shares personal information when you access our
          platform, website, and related services.
        </p>
        <p>
          By using SchoolPilot, you acknowledge that your information may be
          processed as described in this policy. Where consent is required by
          applicable law, we will obtain it through the appropriate process.
        </p>
      </>
    ),
  },
  {
    id: "responsibility",
    title: "2. Who Is Responsible for Your Data?",
    content: (
      <>
        <p>
          SchoolPilot provides technology that schools can use to manage
          students, staff, parents, academic records, attendance, assignments,
          fees, and other school operations.
        </p>
        <p>
          Depending on the information and the circumstances, a school may be
          the data controller responsible for deciding why and how student
          information is processed, while SchoolPilot may process that
          information on the school's behalf.
        </p>
        <p>
          For information collected directly through SchoolPilot's own website,
          accounts, and service administration, SchoolPilot may have separate
          responsibilities as a data controller.
        </p>
      </>
    ),
  },
  {
    id: "information",
    title: "3. Information We Collect",
    content: (
      <>
        <p>Depending on how the platform is used, information may include:</p>
        <ul>
          <li>
            <strong>Account information:</strong> Names, email addresses,
            usernames, roles, and authentication-related information.
          </li>
          <li>
            <strong>School information:</strong> School name, address, contact
            information, academic sessions, terms, and classes.
          </li>
          <li>
            <strong>Student and guardian information:</strong> Student names,
            admission details, class information, parent or guardian details,
            and other information entered by an authorised school.
          </li>
          <li>
            <strong>Academic information:</strong> Attendance, assignments,
            submissions, assessments, examination scores, results, and teacher
            comments.
          </li>
          <li>
            <strong>Financial information:</strong> School fee records,
            payment status, transaction references, and subscription records.
            Payment card details may be handled by the relevant payment
            provider rather than stored directly by SchoolPilot.
          </li>
          <li>
            <strong>Technical information:</strong> Device, browser, log,
            security, and usage information generated when the platform is
            accessed.
          </li>
          <li>
            <strong>Support communications:</strong> Information you provide
            when requesting assistance or reporting a problem.
          </li>
        </ul>
        <p>
          Schools and authorised users are responsible for ensuring that
          information they upload is accurate, appropriate, and collected in
          accordance with applicable law.
        </p>
      </>
    ),
  },
  {
    id: "children",
    title: "4. Children's and Students' Information",
    content: (
      <>
        <p>
          SchoolPilot may process information about children and students as
          part of providing school management services. We recognise that this
          information requires particular care.
        </p>
        <p>
          Schools using the platform should ensure they have the necessary
          authority, notices, permissions, and lawful basis to provide student
          information to SchoolPilot.
        </p>
        <p>
          Access to student records should be limited to authorised users,
          according to their roles and legitimate school responsibilities.
          Parents and guardians should use the access provided to them by the
          relevant school.
        </p>
        <p>
          SchoolPilot is not intended to encourage children to submit
          unnecessary personal information directly through public-facing
          services.
        </p>
      </>
    ),
  },
  {
    id: "usage",
    title: "5. How We Use Personal Information",
    content: (
      <>
        <p>Information may be used to:</p>
        <ul>
          <li>Provide and operate the SchoolPilot platform.</li>
          <li>Create and administer school and user accounts.</li>
          <li>Manage student records, attendance, assignments, and results.</li>
          <li>Support school fee records and subscription administration.</li>
          <li>Authenticate users and enforce role-based access.</li>
          <li>Maintain platform security and investigate suspected misuse.</li>
          <li>Respond to support requests and service-related enquiries.</li>
          <li>Improve reliability, functionality, and user experience.</li>
          <li>Meet applicable legal and regulatory obligations.</li>
        </ul>
        <p>
          We do not intend to use student records for unrelated purposes
          incompatible with the purpose for which the information was collected.
        </p>
      </>
    ),
  },
  {
    id: "lawful-basis",
    title: "6. Legal Basis for Processing",
    content: (
      <>
        <p>
          Where required by applicable data protection law, personal
          information will be processed on an appropriate lawful basis. This
          may include consent, performance of a contract, compliance with a
          legal obligation, protection of vital interests, performance of a
          public task, or legitimate interests where permitted by law.
        </p>
        <p>
          The appropriate basis depends on the type of information, the purpose
          of processing, and whether SchoolPilot or a school is responsible for
          the relevant processing activity.
        </p>
      </>
    ),
  },
  {
    id: "sharing",
    title: "7. When We Share Information",
    content: (
      <>
        <p>Information may be shared when necessary with:</p>
        <ul>
          <li>
            Authorised school administrators, teachers, parents, students, and
            other permitted users.
          </li>
          <li>
            Technology providers that help host, maintain, secure, or operate
            the platform.
          </li>
          <li>
            Payment providers involved in processing relevant transactions.
          </li>
          <li>
            Professional advisers or public authorities where legally required
            or otherwise permitted by law.
          </li>
        </ul>
        <p>
          Service providers should receive only the information reasonably
          necessary for their assigned functions and should be subject to
          appropriate confidentiality and data protection obligations.
        </p>
        <p>
          We do not intend to sell students' personal information to third
          parties.
        </p>
      </>
    ),
  },
  {
    id: "transfers",
    title: "8. International Data Transfers",
    content: (
      <>
        <p>
          Some service providers may process or store information outside
          Nigeria. Where personal information is transferred internationally,
          we will take steps required by applicable law to ensure that the
          transfer has an appropriate legal basis and safeguards.
        </p>
        <p>
          The locations used for hosting and processing depend on the
          infrastructure and service providers selected for the platform.
        </p>
      </>
    ),
  },
  {
    id: "security",
    title: "9. Data Security",
    content: (
      <>
        <p>
          SchoolPilot is intended to use appropriate technical and
          organisational measures to protect information against unauthorised
          access, loss, misuse, alteration, or disclosure.
        </p>
        <p>
          Such measures may include access controls, authentication, secure
          connections, password protection, and monitoring for suspicious
          activity.
        </p>
        <p>
          No internet-based service can guarantee absolute security. Schools
          and users should also protect their login credentials, restrict
          account access, and promptly report suspected security incidents.
        </p>
      </>
    ),
  },
  {
    id: "retention",
    title: "10. Data Retention and Deletion",
    content: (
      <>
        <p>
          Personal information should be retained only for as long as necessary
          for the purposes for which it was collected, subject to applicable
          legal, contractual, accounting, and recordkeeping requirements.
        </p>
        <p>
          School records may be retained according to the school's instructions
          and its legal obligations. When information is no longer required, it
          should be securely deleted or anonymised where appropriate and
          technically feasible.
        </p>
        <p>
          Some information may need to be retained temporarily in backups,
          security logs, or records required by law.
        </p>
      </>
    ),
  },
  {
    id: "rights",
    title: "11. Your Privacy Rights",
    content: (
      <>
        <p>
          Subject to applicable law and any relevant limitations, individuals
          may have the right to:
        </p>
        <ul>
          <li>Request access to their personal information.</li>
          <li>Request correction of inaccurate or incomplete information.</li>
          <li>Request deletion of information where legally applicable.</li>
          <li>Object to or request restriction of certain processing.</li>
          <li>Withdraw consent where processing is based on consent.</li>
          <li>
            Request a copy of eligible information in a portable format where
            the law provides that right.
          </li>
          <li>Raise a complaint with the relevant data protection authority.</li>
        </ul>
        <p>
          Requests relating to student records may need to be directed through
          the relevant school, particularly where the school controls those
          records. We may need to verify identity and authority before
          responding.
        </p>
        <p>
          To make a privacy request, use the contact information provided in
          the SchoolPilot website footer.
        </p>
      </>
    ),
  },
  {
    id: "cookies",
    title: "12. Cookies and Technical Data",
    content: (
      <>
        <p>
          SchoolPilot may use cookies or similar technologies where necessary
          to maintain sessions, support authentication, improve security, or
          remember relevant preferences.
        </p>
        <p>
          If optional analytics or advertising technologies are introduced,
          they should be implemented with the notices, consent mechanisms, and
          controls required by applicable law.
        </p>
        <p>
          You can also manage cookies through your browser settings, although
          disabling essential cookies may affect platform functionality.
        </p>
      </>
    ),
  },
  {
    id: "public-websites",
    title: "13. Public School Websites",
    content: (
      <>
        <p>
          SchoolPilot may allow schools to publish public-facing websites
          containing information such as school descriptions, announcements,
          admissions information, and school contact details.
        </p>
        <p>
          Schools are responsible for ensuring that information published
          publicly is authorised for disclosure and that personal information,
          particularly information about children, is not published
          inappropriately.
        </p>
        <p>
          Publicly available information may be viewed, copied, or shared by
          visitors. Schools should carefully review content before publishing
          it.
        </p>
      </>
    ),
  },
  {
    id: "third-parties",
    title: "14. Third-Party Services and Links",
    content: (
      <>
        <p>
          The platform may rely on third-party services or contain links to
          external websites. Those services may have their own privacy
          policies and practices.
        </p>
        <p>
          We encourage users to review the relevant policies before providing
          personal information to third-party services. SchoolPilot is not
          responsible for external websites that it does not operate.
        </p>
      </>
    ),
  },
  {
    id: "changes",
    title: "15. Changes to This Policy",
    content: (
      <>
        <p>
          We may update this Privacy Policy as the platform, our practices, or
          applicable legal requirements change.
        </p>
        <p>
          The latest version will be published on this page with an updated
          revision date. Where required by law, we will provide additional
          notice of material changes.
        </p>
      </>
    ),
  },
];

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-800">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white">
              <ShieldCheck size={23} />
            </span>
            <span>
              <span className="block text-lg font-bold tracking-tight text-slate-900">
                SchoolPilot
              </span>
              <span className="block text-xs text-slate-500">
                Run your school smarter.
              </span>
            </span>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-emerald-700"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Back to home</span>
            <span className="sm:hidden">Home</span>
          </Link>
        </div>
      </header>

      <section className="bg-slate-950 px-5 py-14 text-white sm:px-8 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-sm font-medium text-emerald-300">
            <LockKeyhole size={16} />
            Your privacy matters
          </div>

          <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
            Privacy Policy
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
            Learn how SchoolPilot handles personal information and the steps we
            take to help protect the information entrusted to our platform.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-2 text-sm text-slate-300">
            <CalendarDays size={17} className="text-emerald-400" />
            <span>Last updated: {LAST_UPDATED}</span>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[minmax(0,1fr)_290px] lg:py-14">
        <article className="min-w-0 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
          <div className="mb-8 rounded-xl border border-emerald-100 bg-emerald-50 p-5">
            <div className="flex items-start gap-3">
              <ShieldCheck
                size={22}
                className="mt-0.5 shrink-0 text-emerald-700"
              />
              <div>
                <h2 className="font-semibold text-slate-900">
                  Our commitment
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  We aim to handle personal information responsibly, limit
                  access to authorised users, and support schools in managing
                  their records appropriately.
                </p>
              </div>
            </div>
          </div>

          <div className="mb-10 space-y-4 text-sm leading-7 text-slate-600">
            <p>
              This policy is intended to describe SchoolPilot's general privacy
              practices. It should be reviewed and adapted to reflect the
              platform's actual technical configuration, service providers,
              contracts, and data handling procedures before publication.
            </p>
          </div>

          <div className="space-y-10">
            {sections.map((section) => (
              <section
                key={section.id}
                id={section.id}
                className="scroll-mt-8"
              >
                <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                  {section.title}
                </h2>
                <div className="prose prose-slate mt-4 max-w-none text-sm leading-7 text-slate-600 prose-p:my-3 prose-li:my-1 prose-strong:text-slate-800">
                  {section.content}
                </div>
              </section>
            ))}
          </div>

          <div className="mt-12 rounded-xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm leading-6 text-slate-600">
              If you have a privacy question or want to exercise a privacy
              right, please use the contact details in the SchoolPilot website
              footer. Requests involving records managed by a school may need
              to be handled with that school.
            </p>
          </div>
        </article>

        <aside className="space-y-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-6">
            <h2 className="text-base font-bold text-slate-900">
              On this page
            </h2>

            <nav className="mt-4 space-y-1">
              {sections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="block rounded-lg px-3 py-2 text-sm leading-5 text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-700"
                >
                  {section.title}
                </a>
              ))}
            </nav>

            <div className="my-6 border-t border-slate-100" />

            <h3 className="font-semibold text-slate-900">
              Privacy at a glance
            </h3>

            <div className="mt-4 space-y-4">
              <div className="flex gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                  <Database size={18} />
                </span>
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    Responsible data use
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Information is used to support school operations and
                    platform services.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                  <Users size={18} />
                </span>
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    Role-based access
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Records should be accessible only to appropriately
                    authorised users.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                  <Eye size={18} />
                </span>
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    Privacy rights
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Individuals may have rights to access, correct, or request
                    deletion of their data, subject to applicable law.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                  <FileText size={18} />
                </span>
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    Clear information
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    This page explains our intended privacy practices and
                    responsibilities.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </section>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-6 text-sm text-slate-500 sm:px-8 md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} SchoolPilot. All rights reserved.
          </p>
          <div className="flex flex-wrap gap-5">
            <Link
              href="/"
              className="transition hover:text-emerald-700"
            >
              Home
            </Link>
            <Link
              href="/privacy-policy"
              className="font-medium text-emerald-700"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
