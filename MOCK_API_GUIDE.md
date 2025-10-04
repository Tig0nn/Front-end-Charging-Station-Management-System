# 🎭 Mock API System - Hướng dẫn sử dụng

## 📋 Tổng quan

Hệ thống Mock API được tạo để test và phát triển frontend mà không cần backend server. Mock API cung cấp tất cả các endpoint giống như real API.

## 🚀 Cách sử dụng

### 1. Bật/Tắt Mock API

Trong file `.env`, thay đổi biến:

```bash
# Sử dụng Mock API
VITE_USE_MOCK_API=true

# Sử dụng Real API
VITE_USE_MOCK_API=false
```

### 2. Test Mock API

Truy cập: `http://localhost:5175/admin/mock-test`

Trang này cung cấp interface để test tất cả các API endpoints.

## 🔐 Tài khoản Test

### Admin Account

- **Email:** `admin@chargingstation.com`
- **Password:** `123456`
- **Role:** Admin

### Các tài khoản khác

- **Manager:** `manager@chargingstation.com` / `123456`
- **Driver:** `driver@chargingstation.com` / `123456`
- **Customer:** `customer@chargingstation.com` / `123456`

## 📊 Dữ liệu Mock

### Users (4 users)

- Admin, Manager, Driver, Customer với đầy đủ thông tin

### Stations (4 stations)

- Trạm sạc Quận 1, 3, 7, Bình Thạnh
- Đầy đủ thông tin: location, chargers, pricing, status

### Reports

- Revenue data (daily, weekly, monthly, yearly)
- Usage statistics
- Station utilization data

## 🔧 API Endpoints

### Authentication

- `POST /auth/login` - Đăng nhập
- `POST /auth/register` - Đăng ký
- `GET /auth/profile` - Lấy thông tin user
- `POST /auth/logout` - Đăng xuất

### Users Management

- `GET /users` - Lấy danh sách users (có pagination)
- `GET /users/:id` - Lấy thông tin user theo ID
- `POST /users` - Tạo user mới
- `PUT /users/:id` - Cập nhật user
- `DELETE /users/:id` - Xóa user

### Stations Management

- `GET /stations` - Lấy danh sách stations (có pagination)
- `GET /stations/:id` - Lấy thông tin station theo ID
- `POST /stations` - Tạo station mới
- `PUT /stations/:id` - Cập nhật station
- `DELETE /stations/:id` - Xóa station

### Reports

- `GET /reports/dashboard` - Lấy dữ liệu dashboard
- `GET /reports/revenue?period=monthly` - Lấy dữ liệu revenue

## 💡 Features

### 1. Automatic Delay

Tất cả API calls có delay 500ms để mô phỏng network latency.

### 2. Error Simulation

- Invalid credentials sẽ throw error
- Not found resources sẽ throw error

### 3. Data Persistence (trong session)

- Tạo/sửa/xóa data sẽ được lưu trong session
- Refresh page sẽ reset về dữ liệu ban đầu

### 4. Realistic Response Format

Response format giống hệt real API:

```javascript
{
  success: true,
  data: { ... },
  pagination: { ... } // cho list endpoints
}
```

## 🔄 Switching Between APIs

Code tự động detect environment variable và switch API:

```javascript
// apiConfig.js tự động chọn API
import { authAPI, usersAPI, stationsAPI } from "../lib/apiConfig.js";

// Check current mode
import { isMockMode } from "../lib/apiConfig.js";
console.log("Mock mode:", isMockMode()); // true/false
```

## 🧪 Testing Strategy

1. **Development**: Sử dụng Mock API để phát triển UI
2. **Integration**: Chuyển sang Real API để test integration
3. **Production**: Luôn sử dụng Real API

## 📝 Notes

- Mock data sẽ reset mỗi khi refresh page
- CRUD operations hoạt động đầy đủ trong session
- Console sẽ log API mode khi khởi động
- Test page cung cấp visual testing cho tất cả endpoints
