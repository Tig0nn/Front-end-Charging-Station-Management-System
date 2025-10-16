// Unified API Services - Single file for all API calls
import { mockApi } from "./mockApi.js";
import { api } from "./api.js";

// Environment configuration
const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === "true" || false;

// Real API services
const realApiServices = {
  auth: {
    login: (credentials) => api.post("/api/auth/login", credentials),
    register: (userData) => api.post("/api/auth/register", userData),
    getProfile: () => api.get("api/users/myInfo"),
    logout: () => api.post("/api/auth/logout"),
    refreshToken: (refreshToken) =>
      api.post("/api/auth/refresh", { refreshToken }),
  },

  users: {
    getAll: (page = 1, limit = 10) =>
      api.get(`/api/users?page=${page}&limit=${limit}`),
    getById: (id) => api.get(`/api/users/${id}`),
    create: (userData) => api.post("/api/users", userData),
    update: (id, userData) => api.put(`/api/users/${id}`, userData),
    delete: (id) => api.delete(`/api/users/${id}`),
  },

  stations: {
    getAll: (page = 1, limit = 10) =>
      api.get(`/api/stations?page=${page}&limit=${limit}`),
    getById: (id) => api.get(`/api/stations/${id}`),
    create: (stationData) => api.post("/api/stations/create", stationData),
    update: (id, stationData) => api.put(`/api/stations/${id}`, stationData),
    delete: (id) => api.delete(`/api/stations/${id}`),
  },

  reports: {
    getDashboard: () => api.get("/api/reports/dashboard"),
    getRevenue: (period) => api.get(`/api/reports/revenue?period=${period}`),
  },

  plans: {
    getAll: () => api.get("/api/plans"),
    // Create general plan
    create: (planData) => api.post("/api/plans", planData),
    // Create prepaid plan
    createPrepaid: (planData) => api.post("/api/plans/prepaid", planData),
    // Create postpaid plan
    createPostpaid: (planData) => api.post("/api/plans/postpaid", planData),
    // Create VIP plan
    createVip: (planData) => api.post("/api/plans/vip", planData),
    // Get user's current subscription
    getCurrentSubscription: () => api.get("/api/plans/current"),
    // Get all available plans
    getAvailable: () => api.get("/api/plans/available"),
  },
  staff:{
    getAllStaffs: () => api.get("/api/stations/staff/all"),
  }
};

// Export the appropriate API based on configuration
export const apiServices = USE_MOCK_API ? mockApi : realApiServices;

// Individual exports for easier imports
export const authAPI = apiServices.auth;
export const usersAPI = apiServices.users;
export const stationsAPI = apiServices.stations;
export const reportsAPI = apiServices.reports;
export const plansAPI = apiServices.plans;
export const staffAPI = apiServices.staff;

// Helper function to check if using mock API
export const isMockMode = () => USE_MOCK_API;

// Console log to show which mode is active
console.log(`🔧 API Mode: ${USE_MOCK_API ? "🎭 Mock API" : "🌐 Real API"}`);
