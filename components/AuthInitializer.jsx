"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";

import {
  finishAuthInitialization,
  restoreCredentials,
} from "../store/slices/authSlice";

export default function AuthInitializer() {
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    try {
      if (token && user) {
        dispatch(
          restoreCredentials({
            token,
            user: JSON.parse(user),
          })
        );
      } else if (token || user) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    } catch (error) {
      console.error("Failed to restore authentication:", error);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } finally {
      dispatch(finishAuthInitialization());
    }
  }, [dispatch]);

  return null;
}