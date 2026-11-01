"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";

import api from "../lib/api";
import { clearSession, getSessionToken, getSessionUser, saveSessionUser } from "../lib/authStorage";
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
      const token = getSessionToken();
      const savedUser = getSessionUser();

      if (!token || !savedUser) {
        clearSession();
        dispatch(finishAuthInitialization());
        return;
      }

      let parsedUser;
      try {
        parsedUser = JSON.parse(savedUser);
      } catch {
        clearSession();
        dispatch(logout());
        return;
      }

      try {
        const response = await api.get("/auth/me");
        const currentUser = response.data?.user;
        if (!currentUser) throw new Error("Current session response did not contain a user.");
        if (cancelled) return;

        saveSessionUser(currentUser);
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
