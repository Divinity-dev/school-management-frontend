"use client";

import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";

import { logout } from "../store/slices/authSlice";

export default function AuthActionButton({
  label = "Login",
  className,
  style,
  children,
}) {
  const dispatch = useDispatch();
  const { isAuthenticated, isInitialized } = useSelector(
    (state) => state.auth
  );

  if (!isInitialized) {
    return null;
  }

  if (!isAuthenticated) {
    return (
      <Link href="/login" className={className} style={style}>
        {children || label}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={className}
      style={style}
      onClick={() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        dispatch(logout());
      }}
    >
      Logout
    </button>
  );
}
