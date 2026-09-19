"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";

import { restoreCredentials } from "../store/slices/authSlice";

export default function AuthInitializer() {
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (token && user) {
      try {
        dispatch(
          restoreCredentials({
            token,
            user: JSON.parse(user),
          })
        );
      } catch (error) {
        console.error("Failed to restore authentication:", error);

        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
  }, [dispatch]);

  return null;
}