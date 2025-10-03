import { api } from "./api";

// Authentication APIs
export const authAPI = {
  login: (credentials) => api.post("/api/auth/login", credentials),
  register: (userData) => api.post("/api/auth/register", userData),
  logout: () => api.post("/api/auth/logout"),
  getProfile: () => api.get("/api/auth/profile"),
  refreshToken: (refreshToken) =>
    api.post("/api/auth/refresh", { refreshToken }),
};
