import axios from "axios";
import { clearSession, getSessionToken } from "./authStorage";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { "Content-Type": "application/json" },
});

const notify = (type, message) => {
  if (typeof window !== "undefined" && message) {
    window.dispatchEvent(new CustomEvent("schoolpilot:toast", {
      detail: { type, message },
    }));
  }
};

api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = getSessionToken();
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    const method = String(response.config?.method || "get").toLowerCase();
    if (["post", "put", "patch", "delete"].includes(method)) {
      const message = response.data?.message || "Your changes have been saved successfully.";
      notify("success", message);
    }
    return response;
  },
  (error) => {
    const status = error?.response?.status;
    const data = error?.response?.data || {};

    if (typeof window !== "undefined" && ["SUBSCRIPTION_REQUIRED", "SUBSCRIPTION_EXPIRED"].includes(data.code)) {
      window.dispatchEvent(new CustomEvent("schoolpilot:subscription-restricted", {
        detail: {
          message: data.message || "An active SchoolPilot subscription is required to continue.",
          redirectTo: data.redirectTo || "/dashboard/school-admin/subscription",
        },
      }));
      return Promise.reject(error);
    }

    if (typeof window !== "undefined" && status === 401 && window.location.pathname !== "/login") {
      clearSession();
      const loginUrl = new URL("/login", window.location.origin);
      loginUrl.searchParams.set("session", "expired");
      window.location.replace(loginUrl.toString());
    } else if (typeof window !== "undefined" && status !== 401) {
      notify("error", data.message || error.message || "Something went wrong. Please try again.");
    }

    return Promise.reject(error);
  }
);

export default api;
