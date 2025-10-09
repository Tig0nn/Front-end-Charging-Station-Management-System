// Mock API for testing

// Mock data
const mockUsers = [
  {
    id: 1,
    name: "Nguyễn Văn Admin",
    email: "admin@chargingstation.com",
    role: "Admin",
    phone: "0901234567",
    createdAt: "2024-01-15T08:30:00Z",
    status: "active",
  },
  {
    id: 2,
    name: "Trần Thị Manager",
    email: "manager@chargingstation.com",
    role: "Manager",
    phone: "0901234568",
    createdAt: "2024-02-10T09:15:00Z",
    status: "active",
  },
  {
    id: 3,
    name: "Lê Văn Driver",
    email: "driver@chargingstation.com",
    role: "Driver",
    phone: "0901234569",
    createdAt: "2024-03-05T10:00:00Z",
    status: "active",
  },
  {
    id: 4,
    name: "Phạm Thị Customer",
    email: "customer@chargingstation.com",
    role: "Customer",
    phone: "0901234570",
    createdAt: "2024-03-20T14:30:00Z",
    status: "active",
  },
];

const mockStations = [
  {
    id: 1,
    name: "Vincom Đồng Khởi",
    location: "72 Lê Thánh Tôn, Q.1, TP.HCM",
    latitude: 10.7749,
    longitude: 106.701,
    totalChargers: 6,
    availableChargers: 4,
    offlineChargers: 1,
    maintenanceChargers: 1,
    status: "active",
    powerOutput: "22kW",
    connectorTypes: ["Type 2", "CCS"],
    pricing: 5000,
    revenue: 2450000,
    utilization: 78,
    manager: "Trần Thị Bình",
    createdAt: "2024-01-10T08:00:00Z",
  },
  {
    id: 2,
    name: "Landmark 81",
    location: "720A Điện Biên Phủ, Q.Bình Thạnh",
    latitude: 10.7756,
    longitude: 106.6912,
    totalChargers: 8,
    availableChargers: 7,
    offlineChargers: 0,
    maintenanceChargers: 1,
    status: "active",
    powerOutput: "50kW",
    connectorTypes: ["Type 2", "CCS", "CHAdeMO"],
    pricing: 7000,
    revenue: 3820000,
    utilization: 85,
    manager: "Nguyễn Văn Cường",
    createdAt: "2024-01-15T09:30:00Z",
  },
  {
    id: 3,
    name: "AEON Mall Tân Phú",
    location: "30 Bờ Bao Tân Thắng, Q.Tân Phú",
    latitude: 10.7287,
    longitude: 106.7317,
    totalChargers: 4,
    availableChargers: 2,
    offlineChargers: 2,
    maintenanceChargers: 0,
    status: "maintenance",
    powerOutput: "22kW",
    connectorTypes: ["Type 2"],
    pricing: 5000,
    revenue: 1680000,
    utilization: 45,
    manager: "Phạm Thị Dung",
    createdAt: "2024-02-01T10:15:00Z",
  },
];

const mockReports = {
  revenue: {
    daily: 2500000,
    monthly: 67200000,
  },
  usage: {
    totalSessions: 1245,
    activeUsers: 456,
    averageSessionTime: 45,
    peakHours: "18:00-20:00",
  },
  stations: {
    total: 4,
    active: 3,
    maintenance: 1,
    utilization: 75.5,
  },
};

// Dữ liệu mới cho thông tin xe của Driver
let mockVehicle = {
  brand: "Tesla",
  model: "Model 3",
  year: "2023",
  licensePlate: "30A-12345",
  batteryCapacity: "75 kWh",
  connectorType: "CCS Combo 2",
};

// Dữ liệu mới cho thông tin cá nhân của Driver
let mockDriverProfile = {
  fullName: "Lê Văn Driver",
  phone: "+84 901 234 569",
  email: "driver@chargingstation.com",
  address: "456 Đường ABC, Quận 3, TP.HCM",
  emergencyContact: "+84 909 888 777",
};

// Simulate network delay
const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

// Store current logged-in user for getProfile
let currentLoggedInUser = null;

// Mock API responses
export const mockApi = {
  // Authentication APIs
  auth: {
    login: async (credentials) => {
      await delay();

      const { email, password } = credentials;

      // Mock login validation
      if (email === "admin@chargingstation.com" && password === "123456") {
        const user = mockUsers.find((u) => u.email === email);
        currentLoggedInUser = user; // Store current user for getProfile
        return {
          success: true,
          data: {
            code: 1000,
            message: null,
            result: {
              token: "eyJhbGciOiJIUzUxMiJ9.mock-jwt-token-" + Date.now(),
              authenticated: true,
              userInfo: {
                userId: user.id,
                email: user.email,
                phone: user.phone || null,
                dateOfBirth: user.dateOfBirth || null,
                gender: user.gender || false,
                firstName: user.firstName || null,
                lastName: user.lastName || null,
                fullName: user.name || user.fullName || null,
                role: user.role,
              },
            },
          },
        };
      }

      // Allow any user from mockUsers with password "123456"
      const user = mockUsers.find((u) => u.email === email);
      if (user && password === "123456") {
        currentLoggedInUser = user; // Store current user for getProfile
        return {
          success: true,
          data: {
            code: 1000,
            message: null,
            result: {
              token: "eyJhbGciOiJIUzUxMiJ9.mock-jwt-token-" + Date.now(),
              authenticated: true,
              userInfo: {
                userId: user.id,
                email: user.email,
                phone: user.phone || null,
                dateOfBirth: user.dateOfBirth || null,
                gender: user.gender || false,
                firstName: user.firstName || null,
                lastName: user.lastName || null,
                fullName: user.name || user.fullName || null,
                role: user.role,
              },
            },
          },
        };
      }

      throw new Error("Invalid email or password");
    },

    register: async (userData) => {
      await delay();

      const newUser = {
        id: mockUsers.length + 1,
        ...userData,
        role: "Customer",
        createdAt: new Date().toISOString(),
        status: "active",
      };

      mockUsers.push(newUser);
      currentLoggedInUser = newUser; // Store current user for getProfile

      return {
        success: true,
        data: {
          code: 1000,
          message: null,
          result: {
            userId: newUser.id,
            email: newUser.email,
            role: "DRIVER",
          },
        },
      };
    },

    getProfile: async () => {
      await delay();

      // Return the currently logged in user or fallback to admin
      const user = currentLoggedInUser || mockUsers[0];
      return {
        success: true,
        data: {
          code: 1000,
          message: null,
          result: {
            userId: user.id,
            email: user.email,
            phone: user.phone || null,
            dateOfBirth: user.dateOfBirth || null,
            gender: user.gender || false,
            firstName: user.firstName || null,
            lastName: user.lastName || null,
            fullName: user.name || user.fullName || null,
            role: user.role,
          },
        },
      };
    },

    logout: async () => {
      await delay(200);
      currentLoggedInUser = null; // Clear current user on logout
      return { success: true };
    },
  },

  // Users APIs
  users: {
    getAll: async (page = 1, limit = 10) => {
      await delay();

      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedUsers = mockUsers.slice(startIndex, endIndex);

      return {
        success: true,
        data: {
          users: paginatedUsers,
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(mockUsers.length / limit),
            totalItems: mockUsers.length,
            itemsPerPage: limit,
          },
        },
      };
    },

    getById: async (id) => {
      await delay();

      const user = mockUsers.find((u) => u.id === parseInt(id));
      if (!user) {
        throw new Error("User not found");
      }

      return {
        success: true,
        data: user,
      };
    },

    create: async (userData) => {
      await delay();

      const newUser = {
        id: Math.max(...mockUsers.map((u) => u.id)) + 1,
        ...userData,
        createdAt: new Date().toISOString(),
        status: "active",
      };

      mockUsers.push(newUser);

      return {
        success: true,
        data: newUser,
      };
    },

    update: async (id, userData) => {
      await delay();

      const userIndex = mockUsers.findIndex((u) => u.id === parseInt(id));
      if (userIndex === -1) {
        throw new Error("User not found");
      }

      mockUsers[userIndex] = { ...mockUsers[userIndex], ...userData };

      return {
        success: true,
        data: mockUsers[userIndex],
      };
    },

    delete: async (id) => {
      await delay();

      const userIndex = mockUsers.findIndex((u) => u.id === parseInt(id));
      if (userIndex === -1) {
        throw new Error("User not found");
      }

      mockUsers.splice(userIndex, 1);

      return {
        success: true,
        message: "User deleted successfully",
      };
    },
  },

  // Stations APIs
  stations: {
    getAll: async (page = 1, limit = 10) => {
      await delay();

      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedStations = mockStations.slice(startIndex, endIndex);

      return {
        success: true,
        data: {
          stations: paginatedStations,
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(mockStations.length / limit),
            totalItems: mockStations.length,
            itemsPerPage: limit,
          },
        },
      };
    },

    getById: async (id) => {
      await delay();

      const station = mockStations.find((s) => s.id === parseInt(id));
      if (!station) {
        throw new Error("Station not found");
      }

      return {
        success: true,
        data: station,
      };
    },

    create: async (stationData) => {
      await delay();

      const newStation = {
        id: Math.max(...mockStations.map((s) => s.id)) + 1,
        ...stationData,
        createdAt: new Date().toISOString(),
        status: "active",
      };

      mockStations.push(newStation);

      return {
        success: true,
        data: newStation,
      };
    },

    update: async (id, stationData) => {
      await delay();

      const stationIndex = mockStations.findIndex((s) => s.id === parseInt(id));
      if (stationIndex === -1) {
        throw new Error("Station not found");
      }

      mockStations[stationIndex] = {
        ...mockStations[stationIndex],
        ...stationData,
      };

      return {
        success: true,
        data: mockStations[stationIndex],
      };
    },

    delete: async (id) => {
      await delay();

      const stationIndex = mockStations.findIndex((s) => s.id === parseInt(id));
      if (stationIndex === -1) {
        throw new Error("Station not found");
      }

      mockStations.splice(stationIndex, 1);

      return {
        success: true,
        message: "Station deleted successfully",
      };
    },
  },

  // Reports APIs
  reports: {
    getDashboard: async () => {
      await delay();

      return {
        success: true,
        data: mockReports,
      };
    },

    getRevenue: async (period = "monthly") => {
      await delay();

      const revenueData = {
        daily: [2200000, 2500000, 2800000, 3100000, 2750000, 2900000, 3200000],
        weekly: [12000000, 14500000, 16800000, 15900000],
        monthly: [
          30000000, // T1
          29000000, // T2
          31000000, // T3
          30000000, // T4
          30000000, // T5
          33000000, // T6
          35000000, // T7
          37000000, // T8
          38000000, // T9
          39000000, // T10 (current - highest like in your image)
          32000000, // T11 (projected - lower than T10)
          0, // T12 (future)
        ],
        yearly: [560000000, 680000000, 756000000],
      };

      return {
        success: true,
        data: {
          period,
          data: revenueData[period] || revenueData.monthly,
          total:
            revenueData[period]?.reduce((sum, val) => sum + val, 0) ||
            mockReports.revenue[period] ||
            mockReports.revenue.monthly,
        },
      };
    },
  },

  // Revenue APIs
  revenue: {
    getWeekly: async (year, week) => {
      await delay();

      // Mock weekly revenue data (7 days)
      const weeklyData = [
        {
          stationId: "uuid-1111",
          stationName: "Station A",
          address: "123 Main St",
          week: week,
          year: year,
          totalRevenue: 350000, // per day average
          totalSessions: 8,
        },
        {
          stationId: "uuid-2222",
          stationName: "Station B",
          address: "456 Oak Ave",
          week: week,
          year: year,
          totalRevenue: 280000,
          totalSessions: 6,
        },
      ];

      return {
        success: true,
        data: {
          code: 1000,
          message: null,
          result: weeklyData,
        },
      };
    },

    getMonthly: async (year, month) => {
      await delay();

      // Mock monthly revenue data for different stations
      const monthlyData = [
        {
          stationId: "uuid-1111",
          stationName: "Station A",
          address: "123 Main St",
          month: month,
          year: year,
          totalRevenue: 1200000,
          totalSessions: 30,
        },
        {
          stationId: "uuid-2222",
          stationName: "Station B",
          address: "456 Oak Ave",
          month: month,
          year: year,
          totalRevenue: 980000,
          totalSessions: 25,
        },
      ];

      return {
        success: true,
        data: {
          code: 1000,
          message: null,
          result: monthlyData,
        },
      };
    },

    getYearly: async (year) => {
      await delay();

      // Mock yearly revenue data (12 months)
      const yearlyData = [];
      for (let month = 1; month <= 12; month++) {
        // Station A
        yearlyData.push({
          stationId: "uuid-1111",
          stationName: "Station A",
          address: "123 Main St",
          month: month,
          year: year,
          totalRevenue: Math.floor(Math.random() * 1000000) + 800000, // 0.8M-1.8M VND
          totalSessions: Math.floor(Math.random() * 30) + 20, // 20-50 sessions
        });

        // Station B
        yearlyData.push({
          stationId: "uuid-2222",
          stationName: "Station B",
          address: "456 Oak Ave",
          month: month,
          year: year,
          totalRevenue: Math.floor(Math.random() * 800000) + 600000, // 0.6M-1.4M VND
          totalSessions: Math.floor(Math.random() * 25) + 15, // 15-40 sessions
        });
      }

      return {
        success: true,
        data: {
          code: 1000,
          message: null,
          result: yearlyData,
        },
      };
    },
  },

  // System Overview API
  systemOverview: {
    getOverview: async () => {
      await delay();

      return {
        success: true,
        data: {
          code: 1000,
          message: null,
          result: {
            totalStations: 12,
            activeChargingPoints: 8,
            totalDrivers: 42,
            currentMonthRevenue: 3210.5,
          },
        },
      };
    },
  },
  driver: {
    getProfile: async () => {
      await delay();
      return { success: true, data: mockDriverProfile };
    },
    updateProfile: async (data) => {
      await delay();
      mockDriverProfile = { ...mockDriverProfile, ...data };
      console.log("Updated Driver Profile:", mockDriverProfile);
      return { success: true, message: "Cập nhật thành công!" };
    },
    getVehicleInfo: async () => {
      await delay();
      return { success: true, data: mockVehicle };
    },
    updateVehicleInfo: async (data) => {
      await delay();
      mockVehicle = { ...mockVehicle, ...data };
      console.log("Updated Vehicle Info:", mockVehicle);
      return { success: true, message: "Cập nhật thành công!" };
    },
  },
};

// Export individual APIs for easier import
export const {
  auth: mockAuthApi,
  users: mockUsersApi,
  stations: mockStationsApi,
  reports: mockReportsApi,
  revenue: mockRevenueApi,
  systemOverview: mockSystemOverviewApi,
  driver: mockDriverApi,
} = mockApi;
