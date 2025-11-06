// Unified API Services - Single file for all API calls
import { api } from "./api.js";

// API services
const apiServices = {
  auth: {
    login: (credentials) => api.post("/api/auth/login", credentials),
    introspect: (token) => api.post("/api/auth/introspect", { token }),

    // Google OAuth endpoints
    googleCallback: () => api.get("/api/auth/google/callback"),
  },

  users: {
    register: (userData) => api.post("/api/users", userData),
    getDriverInfo: () => api.get("/api/users/profile"),
    updateDriverInfo: (driverData) =>
      api.patch("/api/users/profile", driverData),
    getStaff: () => api.get("/api/users/staffs"),
    // Get all drivers (Admin only)
    getDriver: () => api.get("/api/users/drivers"),
  },
  //Admin
  systemOverview: {
    getOverview: () => api.get("/api/dashboard/overview"),
  },

  admin: {
    // Get all incidents from all stations (Admin only)
    getAllIncidents: () => api.get("/api/incidents"),
  },

  dashboard: {
    // Get current plan for user
    getCurrentPlan: () => api.get("/api/plans/my-plan"),
  },

  plans: {
    getPlans: () => {
      // Thêm timestamp để tránh cache
      const timestamp = Date.now();
      return api.get(`/api/plans?_t=${timestamp}`);
    },
    create: (planData) => api.post("/api/plans", planData),
    update: (planId, planData) => api.put(`/api/plans/${planId}`, planData),
    delete: (planId) => api.delete(`/api/plans/${planId}`),
    //cần xem lại
    // chưa có subscribe
    subscribe: (planId, paymentMethodId) =>
      api.post("/api/subscriptions", { planId, paymentMethodId }),
  },

  //cần xem lại
  subscriptions: {
    // Get driver's current active subscription
    getActive: () => {
      console.log(
        "🔍 Calling getActive subscription endpoint: /api/subscriptions/active"
      );
      return api.get("/api/subscriptions/active");
    },
  },

  payments: {
    getPaymentMethods: () => api.get("/api/payments/methods"),

    //cần sửa
    askForPayment: (sessionId) =>
      api.post(`/api/cash-payments/request/${sessionId}`),
  },

  revenue: {
    // 🆕 Unified revenue endpoint - Thay thế tất cả các endpoint cũ
    getRevenues: (params) => {
      const { period, year, month, day, week } = params;
      const queryParams = new URLSearchParams();

      queryParams.append("period", period); // daily, weekly, monthly, yearly
      if (year) queryParams.append("year", year);
      if (month) queryParams.append("month", month);
      if (day) queryParams.append("day", day);
      if (week) queryParams.append("week", week);

      console.log(
        `📊 Calling revenue API: /api/revenues?${queryParams.toString()}`
      );
      return api.get(`/api/revenues?${queryParams.toString()}`);
    },
  },

  // =========================
  // 🚉 Stations API Services
  // =========================
  stations: {
    getAllDetails: () => api.get("/api/stations"),
    create: (stationData) => api.post("/api/stations", stationData),
    update: (id, stationData) => api.put(`/api/stations/${id}`, stationData),
    delete: (stationId) => api.delete(`/api/stations/${stationId}`),
  },
  chargingPoints: {
    // Lấy danh sách trụ sạc của một trạm
    getChargersByStation: (stationId) =>
      api.get(`/api/stations/${stationId}/charging-points`),

    getChargersMyStation: () =>
      api.get("/api/stations/my-station/charging-points"),
    startCharging: (data) => api.post(`/api/sessions`, data),
    //giả lập sạc
    simulateCharging: (sessionId) => api.get(`/api/sessions/${sessionId}`),
    // Cập nhật trạng thái trụ sạc
    updateStatus: (power, stationId, chargingPointId, status) =>
      api.put(`/api/stations/${stationId}/charging-points/${chargingPointId}`, {
        chargingPower: power,
        status: status,
      }),
    //  Dừng sạc
    stopCharging: (sessionId) => api.post(`/api/sessions/${sessionId}/stop`),
  },

  vehicles: {
    getBrands: () => api.get("/api/vehicles/brands"),
    lookUp: (plate) => api.get(`/api/vehicles/lookup?licensePlate=${plate}`),

    getModelsByBrand: (brand) =>
      api.get(`/api/vehicles/brands/${brand}/models`),
    getMyVehicles: () => api.get("/api/vehicles"),

    createVehicle: (vehicleData) => api.post("/api/vehicles", vehicleData),
    getVehicleById: (vehicleId) => api.get(`/api/vehicles/${vehicleId}`),
    updateVehicle: (vehicleId, vehicleData) =>
      api.put(`/api/vehicles/${vehicleId}`, vehicleData),
    deleteVehicle: (vehicleId) => api.delete(`/api/vehicles/${vehicleId}`),
  },
  chargingSessions: {
    // Lịch sử sạc của driver hiện tại
    getMySessions: () => api.get("/api/sessions"),
  },

  // ZaloPay payment integration
  zalopay: {
    createPayment: (sessionId) =>
      api.post(`/api/payments/zalopay?sessionId=${sessionId}`),
    callback: (callbackData) =>
      api.post("/api/payment/zalopay-callback", callbackData),
  },

  staff: {
    getStaffProfile: () => api.get("/api/users/profile"),
    getStaffDashboard: () => api.get("/api/dashboard/staff"),
    getStaffReport: () => api.get("/api/incidents/my-station"),
    getAllStaffs: () => api.get("/api/users/staffs"),
    getChargingPoint: () => api.get("/api/stations/my-station/charging-points"),
    submitReport: (reportData) => api.post("/api/incidents", reportData),

    //backend đổi lại thành patch
    approvePendingPaymentRequest: (paymentId) =>
      // api.put(`/api/cash-payments/staff/confirm/${paymentId}`),
      api.patch(`/api/payments/cash/${paymentId}/confirm`),
    //cần xem lại đã nâng cấp
    getPendingPaymentRequests: () =>
      api.get("/api/payments/sessions?status=UNPAID"),
  },
};

// Individual exports for easier imports
export const staffAPI = apiServices.staff;
export const authAPI = apiServices.auth;
export const usersAPI = apiServices.users;
export const systemOverviewAPI = apiServices.systemOverview;
export const adminAPI = apiServices.admin;
export const dashboardAPI = apiServices.dashboard;
export const plansAPI = apiServices.plans;
export const subscriptionsAPI = apiServices.subscriptions;
export const paymentsAPI = apiServices.payments;
export const revenueAPI = apiServices.revenue;
export const stationsAPI = apiServices.stations;
export const vehiclesAPI = apiServices.vehicles;
export const chargingPointsAPI = apiServices.chargingPoints;
export const chargingSessionsAPI = apiServices.chargingSessions;
export const zalopayAPI = apiServices.zalopay;

// Export default
export default apiServices;

// Console log to show API is ready
console.log("🌐 Real API Services loaded");
console.log("✅ Cleaned up: Removed 30 unused API methods");
