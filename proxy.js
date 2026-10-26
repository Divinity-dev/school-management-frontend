import { NextResponse } from "next/server";

const PLATFORM_HOSTS = new Set([
  "school-pilot.app",
  "www.school-pilot.app",
  "school-management-frontend-5tk7.vercel.app",
  "localhost",
  "127.0.0.1",
]);

const PLATFORM_DOMAIN = "school-pilot.app";

const RESERVED_PATHS = [
  "/dashboard",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/api",
  "/_next",
  "/favicon.ico",
  "/robots.txt",
  "/sitemap.xml",
];

const isReservedPath = (pathname) =>
  RESERVED_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));

const rewriteToSchool = (request, slug, pathname, search) => {
  const destination = request.nextUrl.clone();
  const schoolPath = `/${slug}`;
  const alreadyHasSchoolPrefix =
    pathname === schoolPath || pathname.startsWith(`${schoolPath}/`);

  // Public-school links may already include the slug. Do not prefix it twice.
  destination.pathname =
    pathname === "/" ? schoolPath : alreadyHasSchoolPrefix ? pathname : `${schoolPath}${pathname}`;
  destination.search = search;
  return NextResponse.rewrite(destination);
};

export async function proxy(request) {
  const { pathname, search } = request.nextUrl;
  const hostname = request.headers.get("host")?.split(":")[0]?.toLowerCase();

  if (!hostname || PLATFORM_HOSTS.has(hostname) || hostname.endsWith(".vercel.app")) {
    return NextResponse.next();
  }

  if (isReservedPath(pathname)) {
    return NextResponse.next();
  }

  const apiBase = process.env.NEXT_PUBLIC_API_URL;
  if (!apiBase) return NextResponse.next();

  /*
   * SchoolPilot platform subdomains must be resolved as school websites,
   * not sent through the separately-owned custom-domain resolver.
   * The root domain and www remain the general SchoolPilot homepage.
   */
  if (hostname.endsWith(`.${PLATFORM_DOMAIN}`)) {
    const subdomain = hostname.slice(0, -`.${PLATFORM_DOMAIN}`.length);

    // Only support one-level school subdomains; ignore reserved labels.
    const reservedSubdomains = new Set(["www", "api", "admin", "app", "mail"]);
    if (!subdomain || subdomain.includes(".") || reservedSubdomains.has(subdomain)) {
      return NextResponse.next();
    }

    try {
      const response = await fetch(
        `${apiBase.replace(/\/$/, "")}/public/subdomains/resolve?subdomain=${encodeURIComponent(subdomain)}`,
        { cache: "no-store", headers: { Accept: "application/json" } }
      );

      if (!response.ok) return NextResponse.next();

      const data = await response.json();
      const slug = data?.school?.slug;
      if (!slug) return NextResponse.next();

      return rewriteToSchool(request, slug, pathname, search);
    } catch (error) {
      console.error("School subdomain resolution failed:", error);
      return NextResponse.next();
    }
  }

  // Separately owned custom domains still require verified domain ownership.
  try {
    const response = await fetch(
      `${apiBase.replace(/\/$/, "")}/public/domains/resolve?domain=${encodeURIComponent(hostname)}`,
      { cache: "no-store", headers: { Accept: "application/json" } }
    );

    if (!response.ok) return NextResponse.next();

    const data = await response.json();
    const slug = data?.school?.slug;
    if (!slug) return NextResponse.next();

    return rewriteToSchool(request, slug, pathname, search);
  } catch (error) {
    console.error("Custom domain resolution failed:", error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|css|js|map|txt|woff2?)$).*)"],
};
