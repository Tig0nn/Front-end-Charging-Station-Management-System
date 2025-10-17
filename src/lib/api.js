import axios from "axios";
import { clearAuth } from "./auth";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export const api = axios.create({
  baseURL,
  headers: {
    "ngrok-skip-browser-warning": "69420",
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers = config.headers || {};
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      console.warn("API 401 Unauthorized:", err?.config?.url);
      try {
        clearAuth();
      } catch (error) {
        console.error("Error clearing auth:", error);
      }
      try {
        window.dispatchEvent(
          new CustomEvent("app:unauthorized", {
            detail: {
              message: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
            },
          })
        );
      } catch (error) {
        console.error("Error dispatching unauthorized event:", error);
      }
      // try {
      //   if (window.location.pathname !== "/login") {
      //     window.location.assign("/login");
      //   }
      // } catch (error) {
      //   console.error("Error redirecting to login:", error);
      // }
    }
    return Promise.reject(err);
  }
);

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem("authToken", token);
  } else {
    localStorage.removeItem("authToken");
  }
}

export function getAuthToken() {
  return localStorage.getItem("authToken");
}
