import { NextResponse } from "next/server";

const PLATFORM_HOSTS = new Set([
  "school-pilot.app",
  "www.school-pilot.app",
  "school-management-frontend-5tk7.vercel.app",
  "localhost",
  "127.0.0.1",
]);

const RESERVED_PATHS = [
  "/dashboard",
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

export async function proxy(request) {
  const { pathname, search } = request.nextUrl;
  const hostname = request.headers.get("host")?.split(":")[0]?.toLowerCase();

  if (!hostname || PLATFORM_HOSTS.has(hostname) || hostname.endsWith(".vercel.app")) {
    return NextResponse.next();
  }

  if (RESERVED_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
    return NextResponse.next();
  }

  const apiBase = process.env.NEXT_PUBLIC_API_URL;
  if (!apiBase) return NextResponse.next();

  try {
    const response = await fetch(
      `${apiBase.replace(/\/$/, "")}/public/domains/resolve?domain=${encodeURIComponent(hostname)}`,
      { cache: "no-store", headers: { Accept: "application/json" } }
    );

    if (!response.ok) return NextResponse.next();

    const data = await response.json();
    const slug = data?.school?.slug;
    if (!slug) return NextResponse.next();

    const destination = request.nextUrl.clone();
    destination.pathname = pathname === "/" ? `/${slug}` : `/${slug}${pathname}`;
    destination.search = search;
    return NextResponse.rewrite(destination);
  } catch (error) {
    console.error("Custom domain resolution failed:", error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|css|js|map|txt|woff2?)$).*)"],
};
