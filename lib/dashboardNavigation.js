const dashboardPaths = {
  schoolAdmin: "/dashboard/school-admin",
  superAdmin: "/dashboard/super-admin",
  student: "/dashboard/student",
  teacher: "/dashboard/teacher",
  parent: "/dashboard/parent",
};

const ROOT_DOMAIN =
  process.env.NEXT_PUBLIC_ROOT_DOMAIN || "school-pilot.app";

export function getDashboardPath(user) {
  return dashboardPaths[user?.role] || "/dashboard";
}

export function getSchoolHomePath(user) {
  const school =
    user?.school && typeof user.school === "object" ? user.school : null;
  const schoolId =
    user?.schoolId && typeof user.schoolId === "object"
      ? user.schoolId
      : user?.school_id && typeof user.school_id === "object"
        ? user.school_id
        : null;

  // Prefer the current school document over copied slug fields that may be stale.
  const schoolSlug =
    school?.slug ||
    school?.website?.slug ||
    schoolId?.slug ||
    user?.schoolSlug ||
    user?.school_slug;

  const website = school?.website || schoolId?.website || {};
  const customDomain = String(website.customDomain || "")
    .trim()
    .toLowerCase();
  const customDomainReady =
    website.customDomainVerified === true &&
    website.customDomainHostingStatus === "active";

  if (
    customDomainReady &&
    customDomain &&
    !customDomain.includes("/") &&
    !customDomain.includes(":") &&
    /^[a-z0-9.-]+$/.test(customDomain)
  ) {
    return `https://${customDomain}/`;
  }

  if (typeof schoolSlug !== "string" || !schoolSlug.trim()) {
    return null;
  }

  const slug = schoolSlug.trim().toLowerCase();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return null;
  }

  return `https://${slug}.${ROOT_DOMAIN}/`;
}

export function getLoginRedirectPath(user) {
  return getDashboardPath(user);
}
