"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";

import api from "../lib/api";
import {
  finishAuthInitialization,
  logout,
  restoreCredentials,
  setCredentials,
} from "../store/slices/authSlice";

export default function AuthInitializer() {
  const dispatch = useDispatch();

  useEffect(() => {
    let cancelled = false;

    const initialize = async () => {
      const token = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");

      if (!token || !savedUser) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        dispatch(finishAuthInitialization());
        return;
      }

      let parsedUser;
      try {
        parsedUser = JSON.parse(savedUser);
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        dispatch(logout());
        return;
      }

      try {
        const response = await api.get("/auth/me");
        const currentUser = response.data?.user;
        if (!currentUser) throw new Error("Current session response did not contain a user.");
        if (cancelled) return;

        localStorage.setItem("user", JSON.stringify(currentUser));
        dispatch(setCredentials({ token, user: currentUser }));
      } catch (error) {
        if (cancelled) return;

        if (error?.response?.status === 401 || error?.response?.status === 403) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          dispatch(logout());
        } else {
          dispatch(restoreCredentials({ token, user: parsedUser }));
        }
      } finally {
        if (!cancelled) dispatch(finishAuthInitialization());
      }
    };

    initialize();
    return () => {
      cancelled = true;
    };
  }, [dispatch]);

  return null;
}
