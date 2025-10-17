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
    firstName: "Admin",
    lastName: "Nguyễn Văn",
    dateOfBirth: "1985-06-15",
    gender: true,
  },
  {
    id: 2,
    name: "Trần Thị Manager",
    email: "manager@chargingstation.com",
    role: "Manager",
    phone: "0901234568",
    createdAt: "2024-02-10T09:15:00Z",
    status: "active",
    firstName: "Manager",
    lastName: "Trần Thị",
    dateOfBirth: "1990-03-22",
    gender: false,
  },
  {
    id: 3,
    name: "Lê Văn Driver",
    email: "driver@chargingstation.com",
    role: "Driver",
    phone: "0901234569",
    createdAt: "2024-03-05T10:00:00Z",
    status: "active",
    firstName: "Driver",
    lastName: "Lê Văn",
    dateOfBirth: "1988-12-05",
    gender: true,
  },
  {
    id: 4,
    name: "Phạm Thị Customer",
    email: "customer@chargingstation.com",
    role: "Customer",
    phone: "0901234570",
    createdAt: "2024-03-20T14:30:00Z",
    status: "active",
    firstName: "Customer",
    lastName: "Phạm Thị",
    dateOfBirth: "1992-07-18",
    gender: false,
  },
  {
    id: 5,
    name: "Hoàng Minh Tuấn",
    email: "tuan.hoang@gmail.com",
    role: "Driver",
    phone: "0987654321",
    createdAt: "2024-04-01T09:00:00Z",
    status: "active",
    firstName: "Tuấn",
    lastName: "Hoàng Minh",
    dateOfBirth: "1987-01-25",
    gender: true,
  },
  {
    id: 6,
    name: "Ngô Thị Hương",
    email: "huong.ngo@gmail.com",
    role: "Driver",
    phone: "0976543210",
    createdAt: "2024-04-05T11:30:00Z",
    status: "active",
    firstName: "Hương",
    lastName: "Ngô Thị",
    dateOfBirth: "1991-09-12",
    gender: false,
  },
  {
    id: 7,
    name: "Vũ Đình Nam",
    email: "nam.vu@yahoo.com",
    role: "Driver",
    phone: "0965432109",
    createdAt: "2024-04-10T16:45:00Z",
    status: "active",
    firstName: "Nam",
    lastName: "Vũ Đình",
    dateOfBirth: "1989-11-03",
    gender: true,
  },
  {
    id: 8,
    name: "Đặng Thị Linh",
    email: "linh.dang@hotmail.com",
    role: "Customer",
    phone: "0954321098",
    createdAt: "2024-04-15T13:20:00Z",
    status: "active",
    firstName: "Linh",
    lastName: "Đặng Thị",
    dateOfBirth: "1993-04-28",
    gender: false,
  },
  {
    id: 9,
    name: "Bùi Văn Hải",
    email: "hai.bui@gmail.com",
    role: "Driver",
    phone: "0943210987",
    createdAt: "2024-04-20T10:15:00Z",
    status: "active",
    firstName: "Hải",
    lastName: "Bùi Văn",
    dateOfBirth: "1986-08-14",
    gender: true,
  },
  {
    id: 10,
    name: "Lý Thị Mai",
    email: "mai.ly@outlook.com",
    role: "Customer",
    phone: "0932109876",
    createdAt: "2024-04-25T15:30:00Z",
    status: "active",
    firstName: "Mai",
    lastName: "Lý Thị",
    dateOfBirth: "1994-02-17",
    gender: false,
  },
  {
    id: 11,
    name: "Trịnh Quang Minh",
    email: "minh.trinh@gmail.com",
    role: "Driver",
    phone: "0921098765",
    createdAt: "2024-05-01T08:45:00Z",
    status: "active",
    firstName: "Minh",
    lastName: "Trịnh Quang",
    dateOfBirth: "1990-10-08",
    gender: true,
  },
  {
    id: 12,
    name: "Cao Thị Lan",
    email: "lan.cao@gmail.com",
    role: "Manager",
    phone: "0910987654",
    createdAt: "2024-05-05T12:00:00Z",
    status: "active",
    firstName: "Lan",
    lastName: "Cao Thị",
    dateOfBirth: "1987-05-30",
    gender: false,
  },
  {
    id: 13,
    name: "Dương Văn Thành",
    email: "thanh.duong@yahoo.com",
    role: "Driver",
    phone: "0909876543",
    createdAt: "2024-05-10T14:15:00Z",
    status: "active",
    firstName: "Thành",
    lastName: "Dương Văn",
    dateOfBirth: "1985-12-22",
    gender: true,
  },
  {
    id: 14,
    name: "Đinh Thị Thu",
    email: "thu.dinh@hotmail.com",
    role: "Customer",
    phone: "0898765432",
    createdAt: "2024-05-15T09:30:00Z",
    status: "active",
    firstName: "Thu",
    lastName: "Đinh Thị",
    dateOfBirth: "1992-03-11",
    gender: false,
  },
  {
    id: 15,
    name: "Phan Minh Khang",
    email: "khang.phan@gmail.com",
    role: "Driver",
    phone: "0887654321",
    createdAt: "2024-05-20T16:45:00Z",
    status: "active",
    firstName: "Khang",
    lastName: "Phan Minh",
    dateOfBirth: "1988-07-09",
    gender: true,
  },
  {
    id: 16,
    name: "Võ Thị Ngọc",
    email: "ngoc.vo@outlook.com",
    role: "Customer",
    phone: "0876543210",
    createdAt: "2024-06-01T11:20:00Z",
    status: "active",
    firstName: "Ngọc",
    lastName: "Võ Thị",
    dateOfBirth: "1991-01-16",
    gender: false,
  },
  {
    id: 17,
    name: "Lê Đức Anh",
    email: "anh.le@gmail.com",
    role: "Staff",
    phone: "0865432109",
    createdAt: "2024-06-05T13:15:00Z",
    status: "active",
    firstName: "Anh",
    lastName: "Lê Đức",
    dateOfBirth: "1989-09-27",
    gender: true,
  },
  {
    id: 18,
    name: "Huỳnh Thị Yến",
    email: "yen.huynh@yahoo.com",
    role: "Staff",
    phone: "0854321098",
    createdAt: "2024-06-10T10:30:00Z",
    status: "active",
    firstName: "Yến",
    lastName: "Huỳnh Thị",
    dateOfBirth: "1993-11-04",
    gender: false,
  },
  {
    id: 19,
    name: "Nguyễn Tấn Phát",
    email: "phat.nguyen@gmail.com",
    role: "Driver",
    phone: "0843210987",
    createdAt: "2024-06-15T15:45:00Z",
    status: "active",
    firstName: "Phát",
    lastName: "Nguyễn Tấn",
    dateOfBirth: "1986-04-13",
    gender: true,
  },
  {
    id: 20,
    name: "Trần Thị Bích",
    email: "bich.tran@hotmail.com",
    role: "Customer",
    phone: "0832109876",
    createdAt: "2024-06-20T12:30:00Z",
    status: "active",
    firstName: "Bích",
    lastName: "Trần Thị",
    dateOfBirth: "1990-06-21",
    gender: false,
  },
  {
    id: 21,
    name: "Mạc Văn Tài",
    email: "tai.mac@gmail.com",
    role: "Driver",
    phone: "0821098765",
    createdAt: "2024-07-01T08:00:00Z",
    status: "inactive",
    firstName: "Tài",
    lastName: "Mạc Văn",
    dateOfBirth: "1984-12-07",
    gender: true,
  },
  {
    id: 22,
    name: "Phùng Thị Hoa",
    email: "hoa.phung@outlook.com",
    role: "Customer",
    phone: "0810987654",
    createdAt: "2024-07-05T14:20:00Z",
    status: "inactive",
    firstName: "Hoa",
    lastName: "Phùng Thị",
    dateOfBirth: "1995-08-19",
    gender: false,
  },
];

const mockStations = [
  {
    stationId: 1,
    stationName: "Vincom Đồng Khởi",
    address: "72 Lê Thánh Tôn, Q.1, TP.HCM",
    latitude: 10.7749,
    longitude: 106.701,
    totalChargers: 4,
    availableChargers: 2,
    offlineChargers: 1,
    maintenanceChargers: 1,
    status: "Active",
    powerOutput: "22kW",
    connectorTypes: ["CCS", "CHAdeMO"],
    pricing: 3500,
    hotline: "1900-1234",
    email: "vincom@station.com",
  },
  {
    stationId: 2,
    stationName: "Landmark 81",
    address: "720A Điện Biên Phủ, Q.Bình Thạnh, TP.HCM",
    latitude: 10.7944,
    longitude: 106.7218,
    totalChargers: 6,
    availableChargers: 1,
    offlineChargers: 0,
    maintenanceChargers: 5,
    status: "Active",
    powerOutput: "50kW",
    connectorTypes: ["CCS"],
    pricing: 3200,
    hotline: "1900-5678",
    email: "landmark@station.com",
  },
  {
    stationId: 3,
    stationName: "AEON Mall Tân Phú",
    address: "30 Bờ Bao Tân Thắng, Q.Tân Phú, TP.HCM",
    latitude: 10.8003,
    longitude: 106.6132,
    totalChargers: 5,
    availableChargers: 3,
    offlineChargers: 2,
    maintenanceChargers: 0,
    status: "Active",
    powerOutput: "22kW",
    connectorTypes: ["CCS", "Type 2"],
    pricing: 3000,
    hotline: "1900-9012",
    email: "aeon@station.com",
  },
  {
    stationId: 4,
    stationName: "Crescent Mall",
    address: "101 Tôn Dật Tiên, Q.7, TP.HCM",
    latitude: 10.7295,
    longitude: 106.7195,
    totalChargers: 8,
    availableChargers: 5,
    offlineChargers: 1,
    maintenanceChargers: 2,
    status: "Active",
    powerOutput: "50kW",
    connectorTypes: ["CCS", "CHAdeMO", "Type 2"],
    pricing: 4000,
    hotline: "1900-3456",
    email: "crescent@station.com",
  },
  {
    stationId: 5,
    stationName: "Bitexco Financial Tower",
    address: "2 Hải Triều, Q.1, TP.HCM",
    latitude: 10.7718,
    longitude: 106.7038,
    totalChargers: 3,
    availableChargers: 2,
    offlineChargers: 0,
    maintenanceChargers: 1,
    status: "Active",
    powerOutput: "22kW",
    connectorTypes: ["CCS"],
    pricing: 3800,
    hotline: "1900-7890",
    email: "bitexco@station.com",
  },
];

// Mock Chargers data
const mockChargers = [
  // Vincom Đồng Khởi - Station 1
  {
    chargerId: 1,
    stationId: 1,
    chargerName: "Trụ 1",
    connectorType: "CCS",
    powerOutput: "50kW",
    status: "Available",
    currentUser: null,
  },
  {
    chargerId: 2,
    stationId: 1,
    chargerName: "Trụ 2",
    connectorType: "CHAdeMO",
    powerOutput: "50kW",
    status: "Available",
    currentUser: null,
  },
  {
    chargerId: 3,
    stationId: 1,
    chargerName: "Trụ 3",
    connectorType: "CCS",
    powerOutput: "50kW",
    status: "InUse",
    currentUser: "Nguyễn Văn A",
  },
  {
    chargerId: 4,
    stationId: 1,
    chargerName: "Trụ 4",
    connectorType: "CCS",
    powerOutput: "50kW",
    status: "InUse",
    currentUser: "Trần Thị B",
  },

  // Landmark 81 - Station 2
  {
    chargerId: 5,
    stationId: 2,
    chargerName: "Trụ 1",
    connectorType: "CCS",
    powerOutput: "50kW",
    status: "Available",
    currentUser: null,
  },
  {
    chargerId: 6,
    stationId: 2,
    chargerName: "Trụ 2",
    connectorType: "CCS",
    powerOutput: "50kW",
    status: "InUse",
    currentUser: "Lê Văn C",
  },
  {
    chargerId: 7,
    stationId: 2,
    chargerName: "Trụ 3",
    connectorType: "CCS",
    powerOutput: "50kW",
    status: "InUse",
    currentUser: "Phạm Thị D",
  },
  {
    chargerId: 8,
    stationId: 2,
    chargerName: "Trụ 4",
    connectorType: "CCS",
    powerOutput: "50kW",
    status: "InUse",
    currentUser: "Hoàng Văn E",
  },
  {
    chargerId: 9,
    stationId: 2,
    chargerName: "Trụ 5",
    connectorType: "CCS",
    powerOutput: "50kW",
    status: "InUse",
    currentUser: "Đỗ Thị F",
  },
  {
    chargerId: 10,
    stationId: 2,
    chargerName: "Trụ 6",
    connectorType: "CCS",
    powerOutput: "50kW",
    status: "InUse",
    currentUser: "Võ Văn G",
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

// Dữ liệu mới cho thông tin xe của Driver (legacy)
let mockVehicle = {
  brand: "Tesla",
  model: "Model 3",
  year: "2023",
  licensePlate: "30A-12345",
  batteryCapacity: "75 kWh",
  connectorType: "CCS Combo 2",
};

// Mock vehicles data cho API mới
let mockVehicles = [
  {
    vehicleId: "uuid-vehicle-001",
    licensePlate: "30A-12345",
    model: "Tesla Model 3",
    batteryCapacityKwh: 75.0,
    batteryType: "Lithium-ion",
    ownerId: "uuid-driver-001",
  },
  {
    vehicleId: "uuid-vehicle-002",
    licensePlate: "29B-67890",
    model: "VinFast VF8",
    batteryCapacityKwh: 87.7,
    batteryType: "LFP",
    ownerId: "uuid-driver-001",
  },
  {
    vehicleId: "uuid-vehicle-003",
    licensePlate: "51K-555.55",
    model: "BMW iX3",
    batteryCapacityKwh: 74.0,
    batteryType: "Lithium-ion NCM",
    ownerId: "uuid-driver-001",
  },
  {
    vehicleId: "uuid-vehicle-004",
    licensePlate: "43F-999.99",
    model: "Audi e-tron GT",
    batteryCapacityKwh: 93.4,
    batteryType: "Lithium-ion",
    ownerId: "uuid-driver-002",
  },
  {
    vehicleId: "uuid-vehicle-005",
    licensePlate: "77H-123.45",
    model: "VinFast VF9",
    batteryCapacityKwh: 123.0,
    batteryType: "LFP",
    ownerId: "uuid-driver-003",
  },
  {
    vehicleId: "uuid-vehicle-006",
    licensePlate: "92L-888.88",
    model: "Mercedes EQS",
    batteryCapacityKwh: 107.8,
    batteryType: "Lithium-ion NCM",
    ownerId: "uuid-driver-003",
  },
  {
    vehicleId: "uuid-vehicle-007",
    licensePlate: "34C-777.77",
    model: "Porsche Taycan",
    batteryCapacityKwh: 93.4,
    batteryType: "Lithium-ion",
    ownerId: "uuid-driver-004",
  },
  {
    vehicleId: "uuid-vehicle-008",
    licensePlate: "65D-456.78",
    model: "Hyundai IONIQ 5",
    batteryCapacityKwh: 77.4,
    batteryType: "LFP",
    ownerId: "uuid-driver-004",
  },
  {
    vehicleId: "uuid-vehicle-009",
    licensePlate: "50E-111.22",
    model: "Kia EV6",
    batteryCapacityKwh: 77.4,
    batteryType: "Lithium-ion NCM",
    ownerId: "uuid-driver-005",
  },
  {
    vehicleId: "uuid-vehicle-010",
    licensePlate: "88G-333.44",
    model: "BYD Tang EV",
    batteryCapacityKwh: 86.4,
    batteryType: "LFP",
    ownerId: "uuid-driver-005",
  },
  {
    vehicleId: "uuid-vehicle-011",
    licensePlate: "12A-999.00",
    model: "Nissan Ariya",
    batteryCapacityKwh: 87.0,
    batteryType: "Lithium-ion",
    ownerId: "uuid-driver-006",
  },
  {
    vehicleId: "uuid-vehicle-012",
    licensePlate: "99Z-666.66",
    model: "Ford Mustang Mach-E",
    batteryCapacityKwh: 98.8,
    batteryType: "Lithium-ion NCM",
    ownerId: "uuid-driver-007",
  },
  {
    vehicleId: "uuid-vehicle-013",
    licensePlate: "33M-222.33",
    model: "Volvo XC40 Recharge",
    batteryCapacityKwh: 78.0,
    batteryType: "Lithium-ion",
    ownerId: "uuid-driver-008",
  },
  {
    vehicleId: "uuid-vehicle-014",
    licensePlate: "44N-555.66",
    model: "Jaguar I-PACE",
    batteryCapacityKwh: 90.0,
    batteryType: "Lithium-ion NCM",
    ownerId: "uuid-driver-009",
  },
  {
    vehicleId: "uuid-vehicle-015",
    licensePlate: "66P-777.88",
    model: "Lucid Air",
    batteryCapacityKwh: 118.0,
    batteryType: "Lithium-ion",
    ownerId: "uuid-driver-010",
  },
];

// Dữ liệu mới cho thông tin cá nhân của Driver
let mockDriverProfile = {
  userId: "uuid-driver-001",
  fullName: "Lê Văn Driver",
  phone: "+84 901 234 569",
  email: "driver@chargingstation.com",
  address: "456 Đường ABC, Quận 3, TP.HCM",
  emergencyContact: "+84 909 888 777",
  firstName: "Driver",
  lastName: "Lê Văn",
  dateOfBirth: "1988-12-05",
  gender: true,
  role: "Driver",
};

// Mock payment methods data
let mockPaymentMethods = [
  {
    methodId: "pm-001",
    type: "CREDIT_CARD",
    cardNumber: "**** **** **** 1234",
    cardHolder: "LE VAN DRIVER",
    expiryDate: "12/25",
    brand: "Visa",
    isDefault: true,
    createdAt: "2024-03-01T10:00:00Z",
  },
  {
    methodId: "pm-002",
    type: "BANK_ACCOUNT",
    bankName: "Vietcombank",
    accountNumber: "**** **** 567890",
    accountHolder: "Lê Văn Driver",
    isDefault: false,
    createdAt: "2024-04-15T14:30:00Z",
  },
  {
    methodId: "pm-003",
    type: "E_WALLET",
    walletType: "MoMo",
    phoneNumber: "+84 901 234 569",
    isDefault: false,
    createdAt: "2024-05-10T09:15:00Z",
  },
];

// Mock charging sessions data
let mockChargingSessions = [
  {
    sessionId: "cs-001",
    stationName: "Vincom Đồng Khởi",
    stationAddress: "72 Lê Thánh Tôn, Q.1, TP.HCM",
    vehicleModel: "Tesla Model 3",
    licensePlate: "30A-12345",
    startTime: "2024-06-20T08:30:00Z",
    endTime: "2024-06-20T09:45:00Z",
    duration: 75, // minutes
    energyCharged: 45.5, // kWh
    cost: 340000, // VND
    status: "COMPLETED",
    paymentStatus: "PAID",
  },
  {
    sessionId: "cs-002",
    stationName: "Landmark 81",
    stationAddress: "720A Điện Biên Phủ, Q.Bình Thạnh",
    vehicleModel: "VinFast VF8",
    licensePlate: "29B-67890",
    startTime: "2024-06-18T14:00:00Z",
    endTime: "2024-06-18T16:30:00Z",
    duration: 150, // minutes
    energyCharged: 62.3, // kWh
    cost: 520000, // VND
    status: "COMPLETED",
    paymentStatus: "PAID",
  },
  {
    sessionId: "cs-003",
    stationName: "AEON Mall Tân Phú",
    stationAddress: "30 Bờ Bao Tân Thắng, Q.Tân Phú",
    vehicleModel: "BMW iX3",
    licensePlate: "51K-555.55",
    startTime: "2024-06-15T10:15:00Z",
    endTime: "2024-06-15T11:30:00Z",
    duration: 75, // minutes
    energyCharged: 38.7, // kWh
    cost: 290000, // VND
    status: "COMPLETED",
    paymentStatus: "PAID",
  },
  {
    sessionId: "cs-004",
    stationName: "Vincom Đồng Khởi",
    stationAddress: "72 Lê Thánh Tôn, Q.1, TP.HCM",
    vehicleModel: "Tesla Model 3",
    licensePlate: "30A-12345",
    startTime: "2024-06-10T19:00:00Z",
    endTime: "2024-06-10T20:15:00Z",
    duration: 75, // minutes
    energyCharged: 42.1, // kWh
    cost: 315000, // VND
    status: "COMPLETED",
    paymentStatus: "PAID",
  },
  {
    sessionId: "cs-005",
    stationName: "Crescent Mall",
    stationAddress: "101 Tôn Dật Tiên, Q.7, TP.HCM",
    vehicleModel: "VinFast VF8",
    licensePlate: "29B-67890",
    startTime: "2024-06-25T12:00:00Z",
    endTime: null, // Currently charging
    duration: 45, // minutes so far
    energyCharged: 28.5, // kWh so far
    cost: 0, // Will be calculated when session ends
    status: "IN_PROGRESS",
    paymentStatus: "PENDING",
  },
];

// Mock data cho subscription plans
const mockPlans = [
  {
    planId: "uuid-basic-1234",
    name: "Basic Plan",
    billingType: "MONTHLY_SUBSCRIPTION",
    pricePerKwh: 0.1,
    pricePerMinute: 0.02,
    monthlyFee: 9.99,
    benefits: "Free parking",
  },
  {
    planId: "uuid-premium-5678",
    name: "Premium Plan",
    billingType: "MONTHLY_SUBSCRIPTION",
    pricePerKwh: 0.08,
    pricePerMinute: 0.015,
    monthlyFee: 19.99,
    benefits: "Free parking, Priority charging, 24/7 support",
  },
  {
    planId: "uuid-vip-9012",
    name: "VIP Plan",
    billingType: "MONTHLY_SUBSCRIPTION",
    pricePerKwh: 0.06,
    pricePerMinute: 0.01,
    monthlyFee: 49.99,
    benefits:
      "Free parking, Priority charging, 24/7 support, Reserved charging spots, Mobile app premium features",
  },
  {
    planId: "uuid-payperuse-3456",
    name: "Pay Per Use",
    billingType: "PAY_PER_USE",
    pricePerKwh: 0.15,
    pricePerMinute: 0.03,
    monthlyFee: 0,
    benefits: "No monthly commitment, Pay only when you charge",
  },
];

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

    // Driver-specific endpoints to match real API structure
    getDriverInfo: async () => {
      await delay();

      return {
        success: true,
        data: {
          code: 1000,
          message: null,
          result: mockDriverProfile,
        },
      };
    },

    updateDriverInfo: async (driverData) => {
      await delay();

      // Update the mock driver profile
      mockDriverProfile = { ...mockDriverProfile, ...driverData };

      // If firstName and lastName are provided, update fullName
      if (driverData.firstName || driverData.lastName) {
        mockDriverProfile.fullName = `${
          driverData.firstName || mockDriverProfile.firstName || ""
        } ${driverData.lastName || mockDriverProfile.lastName || ""}`.trim();
      }

      console.log("Updated Driver Profile:", mockDriverProfile);

      return {
        success: true,
        data: {
          code: 1000,
          message: "Driver profile updated successfully",
          result: mockDriverProfile,
        },
      };
    },

    getUserById: async (userId) => {
      await delay();

      const user = mockUsers.find((u) => u.id === parseInt(userId));
      if (!user) {
        const error = new Error("User not found");
        error.response = {
          data: {
            code: 404,
            message: "User Not Found",
          },
        };
        throw error;
      }

      return {
        success: true,
        data: {
          code: 1000,
          message: null,
          result: user,
        },
      };
    },
  },

  // Stations APIs
  stations: {
    getAll: async () => {
      await delay();

      return {
        success: true,
        data: {
          code: 1000,
          message: null,
          result: mockStations,
        },
      };
    },

    getById: async (id) => {
      await delay();

      const station = mockStations.find((s) => s.stationId === parseInt(id));
      if (!station) {
        throw new Error("Station not found");
      }

      return {
        success: true,
        data: {
          code: 1000,
          message: null,
          result: station,
        },
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

  // Plans/Subscription APIs
  plans: {
    getAll: async () => {
      await delay();

      return {
        success: true,
        data: {
          code: 1000,
          message: null,
          result: mockPlans,
        },
      };
    },

    getById: async (planId) => {
      await delay();

      const plan = mockPlans.find((p) => p.planId === planId);
      if (!plan) {
        throw new Error("Plan not found");
      }

      return {
        success: true,
        data: {
          code: 1000,
          message: null,
          result: plan,
        },
      };
    },

    // For subscription management
    subscribe: async (planId, paymentMethod) => {
      await delay();

      const plan = mockPlans.find((p) => p.planId === planId);
      if (!plan) {
        throw new Error("Plan not found");
      }

      return {
        success: true,
        data: {
          code: 1000,
          message: "Subscription successful",
          result: {
            subscriptionId: "sub-" + Date.now(),
            planId: planId,
            planName: plan.name,
            status: "ACTIVE",
            startDate: new Date().toISOString(),
            nextBillingDate: new Date(
              Date.now() + 30 * 24 * 60 * 60 * 1000
            ).toISOString(),
            paymentMethod: paymentMethod,
          },
        },
      };
    },
  },

  // Payments APIs
  payments: {
    // GET /api/payments/methods - Lấy payment methods của user
    getPaymentMethods: async () => {
      await delay();

      return {
        success: true,
        data: {
          code: 1000,
          message: null,
          result: mockPaymentMethods,
        },
      };
    },

    // POST /api/payments/methods - Thêm payment method mới
    addPaymentMethod: async (methodData) => {
      await delay();

      const newMethod = {
        methodId: "pm-" + Date.now(),
        ...methodData,
        isDefault: mockPaymentMethods.length === 0, // First method is default
        createdAt: new Date().toISOString(),
      };

      mockPaymentMethods.push(newMethod);

      return {
        success: true,
        data: {
          code: 1000,
          message: null,
          result: newMethod,
        },
      };
    },

    // DELETE /api/payments/methods/{methodId} - Xóa payment method
    removePaymentMethod: async (methodId) => {
      await delay();

      const methodIndex = mockPaymentMethods.findIndex(
        (m) => m.methodId === methodId
      );

      if (methodIndex === -1) {
        throw new Error("Payment method not found");
      }

      const removedMethod = mockPaymentMethods[methodIndex];
      mockPaymentMethods.splice(methodIndex, 1);

      // If removed method was default, set another as default
      if (removedMethod.isDefault && mockPaymentMethods.length > 0) {
        mockPaymentMethods[0].isDefault = true;
      }

      return {
        success: true,
        data: {
          code: 1000,
          message: "Payment method removed successfully",
          result: null,
        },
      };
    },

    // PATCH /api/payments/methods/{methodId}/default - Set default payment method
    setDefaultPaymentMethod: async (methodId) => {
      await delay();

      const method = mockPaymentMethods.find((m) => m.methodId === methodId);

      if (!method) {
        throw new Error("Payment method not found");
      }

      // Remove default from all methods
      mockPaymentMethods.forEach((m) => (m.isDefault = false));

      // Set new default
      method.isDefault = true;

      return {
        success: true,
        data: {
          code: 1000,
          message: "Default payment method updated",
          result: method,
        },
      };
    },

    // POST /api/payments/process - Process payment
    processPayment: async (paymentData) => {
      await delay();

      // Mock payment processing
      const payment = {
        paymentId: "pay-" + Date.now(),
        amount: paymentData.amount,
        currency: paymentData.currency || "VND",
        methodId: paymentData.methodId,
        status: "SUCCESS",
        transactionId: "txn-" + Date.now(),
        processedAt: new Date().toISOString(),
      };

      return {
        success: true,
        data: {
          code: 1000,
          message: "Payment processed successfully",
          result: payment,
        },
      };
    },

    // GET /api/payments/history - Get payment history
    getHistory: async () => {
      await delay();

      const history = [
        {
          paymentId: "pay-001",
          amount: 250000,
          currency: "VND",
          description: "Subscription fee - Premium Plan",
          status: "SUCCESS",
          processedAt: "2024-06-01T10:30:00Z",
          methodType: "CREDIT_CARD",
        },
        {
          paymentId: "pay-002",
          amount: 150000,
          currency: "VND",
          description: "Charging session at Vincom Đồng Khởi",
          status: "SUCCESS",
          processedAt: "2024-06-15T14:20:00Z",
          methodType: "E_WALLET",
        },
        {
          paymentId: "pay-003",
          amount: 320000,
          currency: "VND",
          description: "Charging session at Landmark 81",
          status: "FAILED",
          processedAt: "2024-06-20T09:45:00Z",
          methodType: "BANK_ACCOUNT",
        },
      ];

      return {
        success: true,
        data: {
          code: 1000,
          message: null,
          result: history,
        },
      };
    },
  },

  // Charging Sessions APIs
  charging: {
    // GET /api/charging/sessions - Lấy lịch sử charging sessions
    getSessions: async () => {
      await delay();

      return {
        success: true,
        data: {
          code: 1000,
          message: null,
          result: mockChargingSessions,
        },
      };
    },

    // GET /api/charging/sessions/current - Lấy session đang charging
    getCurrentSession: async () => {
      await delay();

      const currentSession = mockChargingSessions.find(
        (s) => s.status === "IN_PROGRESS"
      );

      return {
        success: true,
        data: {
          code: 1000,
          message: null,
          result: currentSession || null,
        },
      };
    },

    // POST /api/charging/sessions/start - Bắt đầu charging session
    startSession: async (sessionData) => {
      await delay();

      const newSession = {
        sessionId: "cs-" + Date.now(),
        stationName: sessionData.stationName,
        stationAddress: sessionData.stationAddress,
        vehicleModel: sessionData.vehicleModel,
        licensePlate: sessionData.licensePlate,
        startTime: new Date().toISOString(),
        endTime: null,
        duration: 0,
        energyCharged: 0,
        cost: 0,
        status: "IN_PROGRESS",
        paymentStatus: "PENDING",
      };

      mockChargingSessions.push(newSession);

      return {
        success: true,
        data: {
          code: 1000,
          message: "Charging session started",
          result: newSession,
        },
      };
    },

    // POST /api/charging/sessions/{sessionId}/stop - Dừng charging session
    stopSession: async (sessionId) => {
      await delay();

      const sessionIndex = mockChargingSessions.findIndex(
        (s) => s.sessionId === sessionId
      );

      if (sessionIndex === -1) {
        throw new Error("Charging session not found");
      }

      const session = mockChargingSessions[sessionIndex];

      if (session.status !== "IN_PROGRESS") {
        throw new Error("Session is not in progress");
      }

      // Update session
      session.endTime = new Date().toISOString();
      session.duration = Math.floor(Math.random() * 120) + 30; // 30-150 minutes
      session.energyCharged = Math.floor(Math.random() * 60) + 20; // 20-80 kWh
      session.cost = session.energyCharged * 7500; // 7500 VND per kWh
      session.status = "COMPLETED";
      session.paymentStatus = "PAID";

      return {
        success: true,
        data: {
          code: 1000,
          message: "Charging session completed",
          result: session,
        },
      };
    },
  },

  // Vehicles APIs cho driver
  vehicles: {
    // GET /api/vehicles/my-vehicles - Lấy danh sách xe của driver hiện tại
    getMyVehicles: async () => {
      await delay();

      // Filter vehicles by current user (mock all vehicles for demo)
      const userVehicles = mockVehicles.filter(
        (vehicle) => vehicle.ownerId === "uuid-driver-001"
      );

      return {
        success: true,
        data: {
          code: 1000,
          message: null,
          result: userVehicles,
        },
      };
    },

    // POST /api/vehicles - Tạo xe mới
    createVehicle: async (vehicleData) => {
      await delay();

      // Validate required fields
      if (
        !vehicleData.licensePlate ||
        !vehicleData.model ||
        !vehicleData.batteryCapacityKwh ||
        !vehicleData.batteryType
      ) {
        throw new Error("Missing required fields");
      }

      // Check if license plate already exists
      const existingVehicle = mockVehicles.find(
        (v) => v.licensePlate === vehicleData.licensePlate
      );
      if (existingVehicle) {
        const error = new Error("License plate already exists");
        error.response = {
          data: {
            code: 5002,
            message: "License Plate Already Exists",
          },
        };
        throw error;
      }

      // Create new vehicle
      const newVehicle = {
        vehicleId: "uuid-vehicle-" + Date.now(),
        licensePlate: vehicleData.licensePlate,
        model: vehicleData.model,
        batteryCapacityKwh: parseFloat(vehicleData.batteryCapacityKwh),
        batteryType: vehicleData.batteryType,
        ownerId: "uuid-driver-001", // Mock current user ID
      };

      mockVehicles.push(newVehicle);

      return {
        success: true,
        data: {
          code: 1000,
          message: null,
          result: newVehicle,
        },
      };
    },

    // GET /api/vehicles/my-vehicles/{vehicleId} - Lấy chi tiết một xe
    getVehicleById: async (vehicleId) => {
      await delay();

      const vehicle = mockVehicles.find((v) => v.vehicleId === vehicleId);

      if (!vehicle) {
        const error = new Error("Vehicle not found");
        error.response = {
          data: {
            code: 5001,
            message: "Vehicle Not Found",
          },
        };
        throw error;
      }

      // Check if vehicle belongs to current user
      if (vehicle.ownerId !== "uuid-driver-001") {
        const error = new Error("Vehicle does not belong to this driver");
        error.response = {
          data: {
            code: 5003,
            message: "Vehicle Does Not Belong To This Driver",
          },
        };
        throw error;
      }

      return {
        success: true,
        data: {
          code: 1000,
          message: null,
          result: vehicle,
        },
      };
    },

    // PUT /api/vehicles/{vehicleId} - Cập nhật xe (partial update)
    updateVehicle: async (vehicleId, vehicleData) => {
      await delay();

      const vehicleIndex = mockVehicles.findIndex(
        (v) => v.vehicleId === vehicleId
      );

      if (vehicleIndex === -1) {
        const error = new Error("Vehicle not found");
        error.response = {
          data: {
            code: 5001,
            message: "Vehicle Not Found",
          },
        };
        throw error;
      }

      const vehicle = mockVehicles[vehicleIndex];

      // Check if vehicle belongs to current user
      if (vehicle.ownerId !== "uuid-driver-001") {
        const error = new Error("Vehicle does not belong to this driver");
        error.response = {
          data: {
            code: 5003,
            message: "Vehicle Does Not Belong To This Driver",
          },
        };
        throw error;
      }

      // Check if license plate is being changed and already exists
      if (
        vehicleData.licensePlate &&
        vehicleData.licensePlate !== vehicle.licensePlate
      ) {
        const existingVehicle = mockVehicles.find(
          (v) => v.licensePlate === vehicleData.licensePlate
        );
        if (existingVehicle) {
          const error = new Error("License plate already exists");
          error.response = {
            data: {
              code: 5002,
              message: "License Plate Already Exists",
            },
          };
          throw error;
        }
      }

      // Update vehicle (partial update)
      const updatedVehicle = {
        ...vehicle,
        ...vehicleData,
        vehicleId: vehicleId, // Ensure ID doesn't change
        ownerId: vehicle.ownerId, // Ensure owner doesn't change
      };

      // Convert batteryCapacityKwh to number if provided
      if (updatedVehicle.batteryCapacityKwh) {
        updatedVehicle.batteryCapacityKwh = parseFloat(
          updatedVehicle.batteryCapacityKwh
        );
      }

      mockVehicles[vehicleIndex] = updatedVehicle;

      return {
        success: true,
        data: {
          code: 1000,
          message: null,
          result: updatedVehicle,
        },
      };
    },

    // DELETE /api/vehicles/{vehicleId} - Xóa xe
    deleteVehicle: async (vehicleId) => {
      await delay();

      const vehicleIndex = mockVehicles.findIndex(
        (v) => v.vehicleId === vehicleId
      );

      if (vehicleIndex === -1) {
        const error = new Error("Vehicle not found");
        error.response = {
          data: {
            code: 5001,
            message: "Vehicle Not Found",
          },
        };
        throw error;
      }

      const vehicle = mockVehicles[vehicleIndex];

      // Check if vehicle belongs to current user
      if (vehicle.ownerId !== "uuid-driver-001") {
        const error = new Error("Vehicle does not belong to this driver");
        error.response = {
          data: {
            code: 5003,
            message: "Vehicle Does Not Belong To This Driver",
          },
        };
        throw error;
      }

      // Remove vehicle from array
      mockVehicles.splice(vehicleIndex, 1);

      return {
        success: true,
        data: {
          code: 1000,
          message: "Vehicle deleted successfully",
          result: null,
        },
      };
    },

    // GET /api/vehicles/driver/{driverId} - Admin endpoint
    getVehiclesByDriverId: async (driverId) => {
      await delay();

      // Mock admin access - return vehicles for specified driver
      const driverVehicles = mockVehicles.filter(
        (vehicle) => vehicle.ownerId === driverId
      );

      return {
        success: true,
        data: {
          code: 1000,
          message: null,
          result: driverVehicles,
        },
      };
    },
  },

  // Chargers API
  chargers: {
    // GET /api/chargers/station/{stationId} - Lấy danh sách trụ sạc theo station
    getChargersByStation: async (stationId) => {
      await delay();

      const chargers = mockChargers.filter(
        (c) => c.stationId === parseInt(stationId)
      );

      if (chargers.length === 0) {
        return {
          success: true,
          data: {
            code: 1000,
            message: "No chargers found for this station",
            result: [],
          },
        };
      }

      return {
        success: true,
        data: {
          code: 1000,
          message: null,
          result: chargers,
        },
      };
    },

    // POST /api/chargers/{chargerId}/start - Bắt đầu sạc
    startCharging: async (chargerId, vehicleId) => {
      await delay();

      const chargerIndex = mockChargers.findIndex(
        (c) => c.chargerId === parseInt(chargerId)
      );

      if (chargerIndex === -1) {
        const error = new Error("Charger not found");
        error.response = {
          data: {
            code: 5001,
            message: "Charger Not Found",
          },
        };
        throw error;
      }

      const charger = mockChargers[chargerIndex];

      if (charger.status !== "Available") {
        const error = new Error("Charger is not available");
        error.response = {
          data: {
            code: 5002,
            message: "Charger Is Not Available",
          },
        };
        throw error;
      }

      // Update charger status
      mockChargers[chargerIndex] = {
        ...charger,
        status: "InUse",
        currentUser: "Current User",
      };

      return {
        success: true,
        data: {
          code: 1000,
          message: "Charging started successfully",
          result: {
            sessionId: `session-${Date.now()}`,
            chargerId: charger.chargerId,
            vehicleId: vehicleId,
            startTime: new Date().toISOString(),
            status: "InProgress",
          },
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
  revenue: mockRevenueApi,
  systemOverview: mockSystemOverviewApi,
  driver: mockDriverApi,
  plans: mockPlansApi,
  payments: mockPaymentsApi,
  charging: mockChargingApi,
  vehicles: mockVehiclesApi,
  chargers: mockChargersApi,
} = mockApi;
