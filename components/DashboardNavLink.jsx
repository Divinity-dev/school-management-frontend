"use client";

import Link from "next/link";
import { useSelector } from "react-redux";

import { getDashboardPath } from "../lib/dashboardNavigation";

export default function DashboardNavLink({ className, style }) {
  const { user, isAuthenticated, isInitialized } = useSelector(
    (state) => state.auth
  );

  if (!isInitialized || !isAuthenticated) {
    return null;
  }

  return (
    <Link
      href={getDashboardPath(user)}
      className={className}
      style={style}
    >
      Dashboard
    </Link>
  );
}
