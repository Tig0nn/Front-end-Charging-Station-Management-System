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

// Simulate network delay
const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

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
        return {
          success: true,
          data: {
            token: "mock-jwt-token-" + Date.now(),
            user: user,
            expiresIn: "24h",
          },
        };
      }

      // Allow any user from mockUsers with password "123456"
      const user = mockUsers.find((u) => u.email === email);
      if (user && password === "123456") {
        return {
          success: true,
          data: {
            token: "mock-jwt-token-" + Date.now(),
            user: user,
            expiresIn: "24h",
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

      return {
        success: true,
        data: {
          token: "mock-jwt-token-" + Date.now(),
          user: newUser,
          expiresIn: "24h",
        },
      };
    },

    getProfile: async () => {
      await delay();

      // Return the first admin user as default profile
      const user = mockUsers[0];
      return {
        success: true,
        data: user,
      };
    },

    logout: async () => {
      await delay(200);
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
};

// Export individual APIs for easier import
export const {
  auth: mockAuthApi,
  users: mockUsersApi,
  stations: mockStationsApi,
  reports: mockReportsApi,
} = mockApi;
