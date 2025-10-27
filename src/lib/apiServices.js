// Unified API Services - Single file for all API calls
import { mockApi } from "./mockApi.js";
import { api } from "./api.js";

// Environment configuration
const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === "true" || false;

// Real API services
const realApiServices = {
  auth: {
    login: (credentials) => api.post("/api/auth/login", credentials),
    getProfile: () => api.get("/api/users/driver/myInfo"),
    logout: () => api.post("/api/auth/logout"),
  },

  users: {
    register: (userData) => api.post("/api/users/register", userData),
    getDriverInfo: () => {
      console.log(
        "🔍 Calling getDriverInfo endpoint: /api/users/driver/myInfo"
      );
      return api.get("/api/users/driver/myInfo");
    },
    updateDriverInfo: (driverData) => {
      console.log(
        "🔄 Calling updateDriverInfo endpoint: /api/users/driver/myInfo"
      );
      console.log("📝 Data to update:", driverData);
      return api.patch("/api/users/driver/myInfo", driverData);
    },

    // Get user profile by ID (requires Bearer token)
    getUserById: (userId) => api.get(`/api/users/${userId}`),

    // Admin endpoints
    getAll: () => api.get("/api/users"), // Get all drivers (Admin only)
    deleteUser: (id) => api.delete(`/api/users/${id}`),

    // Update specific user by ID (Admin only)
    updateUserById: (userId, userData) =>
      api.patch(`/api/users/${userId}`, userData),
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
    getPaymentMethods: () => api.get("/api/payment-methods"),
    // Add new payment method
    addPaymentMethod: (methodData) =>
      api.post("/api/payment-methods", methodData),
    // Remove payment method
    removePaymentMethod: (methodId) =>
      api.delete(`/api/payment-methods/${methodId}`),
    // Set default payment method
    setDefaultPaymentMethod: (methodId) =>
      api.patch(`/api/payment-methods/${methodId}/default`),
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
    getOverview: () => api.get("/api/stations"),

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
    update: (id, stationData) => api.put(`/api/stations/${id}`, stationData),
  },
  chargingPoints: {
    // Lấy danh sách trụ sạc của một trạm
    getChargersByStation: (stationId) =>
      api.get(`/api/stations/${stationId}/charging-points`),
    startCharging: (data) => api.post(`/api/charging-sessions/start`, data),
    //giả lập sạc
    simulateCharging: (sessionId) => api.get(`/api/charging-sessions/${sessionId}`),
    updateStatus: (power, stationId, chargingPointId, status) =>
      api.put(`/api/stations/${stationId}/charging-points/${chargingPointId}`, {
      chargingPower: power,
      status: status,
    }),
    //  Dừng sạc
    stopCharging: (sessionId) =>
      api.post(`/api/charging-sessions/${sessionId}/stop`),
  },

  // =========================
  // 🚗 Vehicles API Services
  // =========================
  vehicles: {
    // Lấy danh sách tất cả xe của driver hiện tại
    getMyVehicles: () => {
      console.log(
        "🔍 Calling getMyVehicles endpoint: /api/vehicles/my-vehicles"
      );
      return api.get("/api/vehicles/my-vehicles");
    },

    // Tạo xe mới cho driver hiện tại
    createVehicle: (vehicleData) => {
      console.log("➕ Calling createVehicle endpoint: /api/vehicles");
      console.log("📝 Vehicle data to create:", vehicleData);
      return api.post("/api/vehicles", vehicleData);
    },

    // Lấy chi tiết một xe của driver hiện tại
    getVehicleById: (vehicleId) => {
      console.log(
        `🔍 Calling getVehicleById endpoint: /api/vehicles/my-vehicles/${vehicleId}`
      );
      return api.get(`/api/vehicles/my-vehicles/${vehicleId}`);
    },

    // Cập nhật thông tin xe (partial update)
    updateVehicle: (vehicleId, vehicleData) => {
      console.log(
        `🔄 Calling updateVehicle endpoint: /api/vehicles/${vehicleId}`
      );
      console.log("📝 Vehicle data to update:", vehicleData);
      return api.put(`/api/vehicles/${vehicleId}`, vehicleData);
    },

    // Xóa xe
    deleteVehicle: (vehicleId) => {
      console.log(
        `🗑️ Calling deleteVehicle endpoint: /api/vehicles/${vehicleId}`
      );
      return api.delete(`/api/vehicles/${vehicleId}`);
    },

    // Admin endpoint: Lấy xe của một driver cụ thể
    getVehiclesByDriverId: (driverId) => {
      console.log(
        `🔍 Admin calling getVehiclesByDriverId endpoint: /api/vehicles/driver/${driverId}`
      );
      return api.get(`/api/vehicles/driver/${driverId}`);
    },
  },
    chargingSessions: {
    // Lịch sử sạc của driver hiện tại
    getMySessions: () => api.get("/api/charging-sessions/my-sessions"),
  },

  staff: {
    getAllReports: () => api.get("/api/staff/incidents"),
    getAllStaffs: () => api.get("/api/stations/staff/all"),
    getStaffDashboard: () => api.get("/api/staff/dashboard"),
    getStaffProfile: () => api.get("/api/staff/profile"),
    getChargingPoint: () => api.get("/api/staff/my-station/charging-points"),
    submitReport: (reportData) => api.post("/api/staff/incidents", reportData),
  },
};

// Export the appropriate API based on configuration
export const apiServices = USE_MOCK_API ? mockApi : realApiServices;

// Individual exports for easier imports
export const staffAPI = apiServices.staff;
export const authAPI = apiServices.auth;
export const usersAPI = apiServices.users;
export const systemOverviewAPI = apiServices.systemOverview;
export const plansAPI = apiServices.plans;
export const paymentsAPI = apiServices.payments;
export const revenueAPI = apiServices.revenue;
export const stationsAPI = apiServices.stations;
export const vehiclesAPI = apiServices.vehicles;
export const chargingPointsAPI = apiServices.chargingPoints;
export const chargingSessionsAPI = apiServices.chargingSessions; // <-- add export

// Helper function to check if using mock API
export const isMockMode = () => USE_MOCK_API;

// Console log to show which mode is active
console.log(`🔧 API Mode: ${USE_MOCK_API ? "🎭 Mock API" : "🌐 Real API"}`);
