const dashboardPaths = {
  schoolAdmin: "/dashboard/school-admin",
  superAdmin: "/dashboard/super-admin",
  student: "/dashboard/student",
  teacher: "/dashboard/teacher",
  parent: "/dashboard/parent",
};

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
  const slug =
    user?.schoolSlug ||
    user?.school_slug ||
    school?.slug ||
    school?.website?.slug ||
    schoolId?.slug;

  if (typeof slug === "string" && slug.trim()) {
    return `/${encodeURIComponent(slug.trim())}`;
  }

  const schoolName =
    user?.schoolName ||
    user?.school_name ||
    school?.name ||
    schoolId?.name;

  if (typeof schoolName !== "string" || !schoolName.trim()) {
    return null;
  }

  const schoolSlug = schoolName
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return schoolSlug ? `/${encodeURIComponent(schoolSlug)}` : null;
}

export function getLoginRedirectPath(user) {
  return getDashboardPath(user);
}
