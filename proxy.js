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

  if (!hostname) return NextResponse.next();

  /*
   * Many visitors type www by habit. Redirect www.<school>.school-pilot.app
   * to the canonical <school>.school-pilot.app address while preserving the
   * requested path and query string. DNS and Vercel must also route the www
   * hostname to this deployment for the redirect to be reached.
   */
  const wwwSchoolMatch = hostname.match(/^www\.([a-z0-9-]+)\.school-pilot\.app$/);
  const reservedSubdomains = new Set(["www", "api", "admin", "app", "mail"]);

  if (wwwSchoolMatch && !reservedSubdomains.has(wwwSchoolMatch[1])) {
    const destination = request.nextUrl.clone();
    destination.hostname = `${wwwSchoolMatch[1]}.${PLATFORM_DOMAIN}`;
    destination.protocol = "https:";
    return NextResponse.redirect(destination, 308);
  }

  if (PLATFORM_HOSTS.has(hostname) || hostname.endsWith(".vercel.app")) {
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
