// Unified API Services - Single file for all API calls
import { mockApi } from "./mockApi.js";
import { api } from "./api.js";

// Environment configuration
const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === "true" || false;

// Real API services
const realApiServices = {
  auth: {
    login: (credentials) => api.post("/api/auth/login", credentials),
    getProfile: () => api.get("/api/auth/profile"),
    logout: () => api.post("/api/auth/logout"),
  },

  users: {
    register: (userData) => api.post("/api/users/register", userData),
    getDriverInfo: () => api.get("/api/users/driver/myInfo"),
    updateDriverInfo: (driverData) =>
      api.patch("/api/users/driver/myInfo", driverData),
    getUserById: (userId) => api.get(`/api/users/${userId}`),
    getAll: () => api.get("/api/users"), // Get all drivers (Admin only)
    delete: (id) => api.delete(`/api/users/${id}`),
  },

  systemOverview: {
    getOverview: () => api.get("/api/overview"),
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

  payments: {
    // Get user's payment methods
    getPaymentMethods: () => api.get("/api/payments/methods"),
    // Add new payment method
    addPaymentMethod: (methodData) =>
      api.post("/api/payments/methods", methodData),
    // Remove payment method
    removePaymentMethod: (methodId) =>
      api.delete(`/api/payments/methods/${methodId}`),
    // Set default payment method
    setDefaultPaymentMethod: (methodId) =>
      api.patch(`/api/payments/methods/${methodId}/default`),
    // Process payment
    processPayment: (paymentData) =>
      api.post("/api/payments/process", paymentData),
    // Get payment history
    getHistory: () => api.get("/api/payments/history"),
  },

  revenue: {
    // Lấy doanh thu theo tuần
    getWeekly: (year, week) =>
      api.get(`/api/revenue/weekly?year=${year}&week=${week}`),

    // Lấy doanh thu theo tháng
    getMonthly: (year, month) =>
      api.get(`/api/revenue/monthly?year=${year}&month=${month}`),

    // Lấy doanh thu theo năm
    getYearly: (year) => api.get(`/api/revenue/yearly?year=${year}`),
  },

  // =========================
  // 🚉 Stations API Services
  // =========================
  stations: {
    // Lấy tổng quan tất cả trạm
    getOverview: () => api.get("/api/stations/overview"),

    // Lấy danh sách chi tiết + filter theo status
    getAll: (page = 1, limit = 10) =>
      api.get(`/api/stations/overview?page=${page}&limit=${limit}`),

    // Cập nhật trạng thái hoạt động (status)
    updateStatus: (stationId, status) =>
      api.patch(`/api/stations/${stationId}/status?status=${status}`),

    // Kích hoạt trạm
    activate: (stationId) => api.patch(`/api/stations/${stationId}/activate`),

    // Vô hiệu hóa trạm
    deactivate: (stationId) =>
      api.patch(`/api/stations/${stationId}/deactivate`),

    // Bật/tắt trạng thái trạm (toggle)
    toggle: (stationId) => api.patch(`/api/stations/${stationId}/toggle`),

    // =========================
    // 👥 Staff Management
    // =========================

    // Lấy danh sách nhân viên của một trạm
    getStaffByStation: (stationId) =>
      api.get(`/api/stations/${stationId}/staff`),

    // Gán nhân viên vào trạm
    assignStaff: (stationId, staffId) =>
      api.post(`/api/stations/${stationId}/staff/${staffId}`),

    // Xóa nhân viên khỏi trạm
    removeStaff: (stationId, staffId) =>
      api.delete(`/api/stations/${stationId}/staff/${staffId}`),

    // Lấy danh sách nhân viên chưa gán trạm
    getUnassignedStaff: () => api.get("/api/stations/staff/unassigned"),
  },
};

// Export the appropriate API based on configuration
export const apiServices = USE_MOCK_API ? mockApi : realApiServices;

// Individual exports for easier imports
export const authAPI = apiServices.auth;
export const usersAPI = apiServices.users;
export const systemOverviewAPI = apiServices.systemOverview;
export const plansAPI = apiServices.plans;
export const paymentsAPI = apiServices.payments;
export const revenueAPI = apiServices.revenue;
export const stationsAPI = apiServices.stations;

// Helper function to check if using mock API
export const isMockMode = () => USE_MOCK_API;

// Console log to show which mode is active
console.log(`🔧 API Mode: ${USE_MOCK_API ? "🎭 Mock API" : "🌐 Real API"}`);
