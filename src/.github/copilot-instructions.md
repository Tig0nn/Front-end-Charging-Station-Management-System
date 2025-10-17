<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# EV Charging Station Management System

This is a ReactJS web application for electric vehicle charging station management. The project uses:

- **React** 19.1.1 with modern hooks and components
- **React-Bootstrap** for UI components
- **Tailwind CSS v4** for styling and responsive design
- **React Router** (latest version) for navigation
- **Axios** for API communication
- **Vite** as build tool

## Project Features

### 1. EV Driver Features

- **Registration & Account Management**
  - User registration/login via email
  - Profile management: personal info, vehicle details, transaction history
- **Booking & Charging Session**
  - Map view of charging stations with location, power capacity, status (available/occupied)
  - Connector types (CCS, CHAdeMO, AC), charging speed, pricing
  - QR code scanning to start charging
  - Real-time charging status (SOC %, remaining time, cost)
  - Notifications when charging complete
- **Payment & E-wallet**
  - Payment by kWh, time-based, or subscription plans
  - Online payment (e-wallet, banking)
  - Electronic invoices
- **History & Personal Analytics**
  - Monthly charging cost reports
  - Charging habit analysis: location patterns, time preferences, power usage

### 2. Charging Station Staff Features

- **On-site Payment Management**
  - Control charging session start/stop
  - Process on-site payment transactions
- **Monitoring & Reporting**
  - Monitor charging point status (online/offline, power capacity)
  - Report station incidents and issues

### 3. Admin Features

- **Station & Charging Point Management**
  - Monitor all charging stations and points status
  - Remote control: start/stop operations
- **User & Service Package Management**
  - Manage individual/corporate customers
  - Create subscription packages: pay-now, post-paid
  - Staff permission management
- **Reports & Analytics**
  - Revenue tracking by station, region, time period
  - Usage frequency reports, peak hour analysis

## Development Guidelines

When working on this project:

- Use React-Bootstrap components for consistent UI elements
- Apply Tailwind CSS classes for custom styling and responsive design
- Implement proper React Router navigation between pages
- Follow RESTful API patterns with Axios
- Maintain responsive design for mobile and desktop
- Use modern React patterns (hooks, functional components)
- Implement proper error handling and loading states
- Follow accessibility best practices

## File Structure

- `/src/components/` - Reusable UI components
- `/src/pages/` - Main application pages
- `/src/libs/` - API services and utilities
- `/src/utils/` - Helper functions
- `/src/assets/` - Static assets (images, icons)

## API Documentation

The backend API follows RESTful principles with JSON payloads. Below is a summary of key endpoints:

- **Authentication**
  - `POST /api/auth/login` - User login
  - `POST /api/users/register` - User registration
    Focus on creating scalable, maintainable code that handles the complex requirements of EV charging station management while providing excellent user experience for drivers, staff, and administrators.

EV Charging Station Management System – API Reference
Below is the full list of all HTTP endpoints in the system, organized by resource. For each endpoint you'll find:

HTTP method and URL
Authentication requirement (Public or Bearer token required)
A minimal sample JSON response
All responses are wrapped in the common ApiResponse<T> envelope:

{
"code": 1000,
"message": null,
"result": { ... }
}

1. Authentication
   POST /api/auth/login
   Public (no token required)

Request body:

{
"email": "user@example.com",
"password": "secret"
}
Sample successful response:

{
"code": 1000,
"result": {
"token": "eyJhbGciOiJIUzUxMiJ9.eyJpc3MiOiJldi1jaGFyZ2luZy1zdGF0aW9uIiwic3ViIjoiYm9tdGh1QGFkbWluLmV2LmNvbSIsImV4cCI6MTc1OTY1ODkyMCwiaWF0IjoxNzU5NjU1MzIwLCJzY29wZSI6IkFETUlOIn0.QXE9Dsbdc-b41T283x89huoewTMJ7x13_tjuEL-Vkr6X5b2aR45kBtxFM7R8LPdU82WFt7Y40c9SzLEaSEwUZQ",
"authenticated": true,
"userInfo": {
"userId": "1ee30c49-7c50-4b8f-a5f7-40e0646fe742",
"email": "user@example.com",
"phone": "...",
"dateOfBirth": "...",
"gender": false,
"firstName": "...",
"lastName": "...",
"fullName": "...",
"role": "..."
}
}
} 2. Users
POST /api/users/register
Public (no token required)
Register a new driver.

Request body:

{
"email": "newdriver@example.com",
"password": "hunter2",
"confirmPassword": "hunter2"
}
Sample response:

{
"code": 1000,
"message": null,
"result": {
"userId": "uuid-1234-...",
"email": "newdriver@example.com",
"phone": null,
"dateOfBirth": null,
"gender": false,
"firstName": null,
"lastName": null,
"fullName": null,
"role": "DRIVER"
}
}
GET /api/users/driver/myInfo
Bearer token required (ROLE_DRIVER)
Get the authenticated driver's profile với đầy đủ thông tin từ User và Driver entity.

Sample response (DriverResponse):

{
"code": 1000,
"message": null,
"result": {
"userId": "uuid-1234-...",
"email": "driver@example.com",
"phone": "0123456789",
"dateOfBirth": "1990-01-01",
"gender": true,
"firstName": "John",
"lastName": "Doe",
"fullName": "John Doe",
"role": "DRIVER",
"address": "123 Main Street, Hanoi",
"joinDate": "2025-09-15T10:30:00"
}
}
PATCH /api/users/driver/myInfo
Bearer token required (ROLE_DRIVER)
Partially update the authenticated driver's profile. Có thể cập nhật: phone, dateOfBirth, gender, firstName, lastName, address.

Request body (UserUpdateRequest) - tất cả fields đều optional:

{
"phone": "0987654321",
"dateOfBirth": "1990-01-01",
"gender": true,
"firstName": "John",
"lastName": "Doe",
"address": "456 New Address, HCMC"
}
Sample response:

{
"code": 1000,
"message": null,
"result": {
"userId": "uuid-1234-...",
"email": "driver@example.com",
"phone": "0987654321",
"dateOfBirth": "1990-01-01",
"gender": true,
"firstName": "John",
"lastName": "Doe",
"fullName": "John Doe",
"role": "DRIVER",
"address": "456 New Address, HCMC",
"joinDate": "2025-09-15T10:30:00"
}
}
GET /api/users/{userId}
Bearer token required
Retrieve any one user's details (for driver self or admin).

Sample response:

{
"code": 1000,
"message": null,
"result": {
"userId": "uuid-1234-...",
"email": "someone@example.com",
"phone": "0123456789",
"dateOfBirth": "1990-01-01",
"gender": false,
"firstName": "Jane",
"lastName": "Smith",
"fullName": "Jane Smith",
"role": "DRIVER"
}
}
GET /api/users
Bearer token required (ROLE_ADMIN)
List all drivers with admin view (AdminUserResponse).

Sample response:

{
"code": 1000,
"message": null,
"result": [
{
"fullName": "John Doe",
"email": "driver1@example.com",
"phone": "0123456789",
"joinDate": "2025-09-01",
"planName": "Premium",
"sessionCount": 5,
"totalSpent": 150.75,
"status": "Hoạt động",
"isActive": true
}
]
}
GET /api/users/driver/{driverId}/info
Bearer token required (ROLE_ADMIN)
Admin lấy thông tin đầy đủ của một driver (bao gồm address và joinDate).

Sample response:

{
"code": 1000,
"message": null,
"result": {
"userId": "uuid-1234-...",
"email": "driver@example.com",
"phone": "0123456789",
"dateOfBirth": "1990-01-01",
"gender": true,
"firstName": "John",
"lastName": "Doe",
"fullName": "John Doe",
"role": "DRIVER",
"address": "123 Main Street, Hanoi",
"joinDate": "2025-09-15T10:30:00"
}
}
PUT /api/users/driver/{driverId}
Bearer token required (ROLE_ADMIN)
Admin cập nhật thông tin driver. Không thể sửa email, password, joinDate.

Request body (AdminUpdateDriverRequest) - tất cả fields đều optional:

{
"phone": "0987654321",
"dateOfBirth": "1990-01-01",
"gender": true,
"firstName": "John",
"lastName": "Doe",
"address": "456 Updated Address, HCMC"
}
Sample response:

{
"code": 1000,
"message": null,
"result": {
"userId": "uuid-1234-...",
"email": "driver@example.com",
"phone": "0987654321",
"dateOfBirth": "1990-01-01",
"gender": true,
"firstName": "John",
"lastName": "Doe",
"fullName": "John Doe",
"role": "DRIVER",
"address": "456 Updated Address, HCMC",
"joinDate": "2025-09-15T10:30:00"
}
}
DELETE /api/users/{userId}
Bearer token required (ROLE_ADMIN)
Hard delete a user. Returns default success code and message:

Sample response:

{
"code": 1000,
"message": "Deleted",
"result": null
} 3. System Overview
GET /api/overview
Bearer token required (ROLE_ADMIN)
Lấy dữ liệu tổng quan hệ thống bao gồm: tổng số trạm sạc, điểm sạc đang hoạt động, tổng số driver, doanh thu tháng hiện tại.

Sample response:

{
"code": 1000,
"message": null,
"result": {
"totalStations": 12,
"activeChargingPoints": 8,
"totalDrivers": 42,
"currentMonthRevenue": 3210.50
}
}
GET /api/overview/total-stations
Bearer token required (ROLE_ADMIN)
Lấy tổng số trạm sạc trong hệ thống.

Sample response:

{
"code": 1000,
"message": null,
"result": 12
}
GET /api/overview/total-drivers
Bearer token required (ROLE_ADMIN)
Lấy tổng số driver trong hệ thống.

Sample response:

{
"code": 1000,
"message": null,
"result": 42
} 4. Plans
All plan endpoints require bearer token (ROLE_ADMIN for create operations, GET endpoints are public).

POST /api/plans
Bearer token required (ROLE_ADMIN)
Tạo plan generic theo billingType trong body.

Request body (PlanCreationRequest):

{
"name": "Basic Plan",
"billingType": "MONTHLY_SUBSCRIPTION",
"pricePerKwh": 0.1,
"pricePerMinute": 0.02,
"monthlyFee": 9.99,
"benefits": "Free parking"
}
POST /api/plans/prepaid
Bearer token required (ROLE_ADMIN)
Tạo plan PREPAID (override billingType).

POST /api/plans/postpaid
Bearer token required (ROLE_ADMIN)
Tạo plan POSTPAID (override billingType).

POST /api/plans/vip
Bearer token required (ROLE_ADMIN)
Tạo plan VIP (override billingType, yêu cầu monthlyFee > 0).

GET /api/plans
Public access
Lấy tất cả plan.

Sample PlanResponse:

{
"code": 1000,
"message": null,
"result": [
{
"planId": "uuid-5678-...",
"name": "Basic Plan",
"billingType": "MONTHLY_SUBSCRIPTION",
"pricePerKwh": 0.1,
"pricePerMinute": 0.02,
"monthlyFee": 9.99,
"benefits": "Free parking"
}
]
}
GET /api/plans/{planId}
Bearer token required (ROLE_ADMIN)
Lấy chi tiết 1 plan theo id.

Sample response:

{
"code": 1000,
"message": null,
"result": {
"planId": "uuid-5678-...",
"name": "Basic Plan",
"billingType": "MONTHLY_SUBSCRIPTION",
"pricePerKwh": 0.1,
"pricePerMinute": 0.02,
"monthlyFee": 9.99,
"benefits": "Free parking"
}
}
PUT /api/plans/{planId}
Bearer token required (ROLE_ADMIN)
Cập nhật plan theo id. Validate name unique (trừ chính nó) và config theo billingType mới.

Request body (PlanUpdateRequest):

{
"name": "Premium Plan",
"billingType": "VIP",
"pricePerKwh": 0.08,
"pricePerMinute": 0.015,
"monthlyFee": 29.99,
"benefits": "Free parking + Priority charging"
}
Sample response:

{
"code": 1000,
"message": null,
"result": {
"planId": "uuid-5678-...",
"name": "Premium Plan",
"billingType": "VIP",
"pricePerKwh": 0.08,
"pricePerMinute": 0.015,
"monthlyFee": 29.99,
"benefits": "Free parking + Priority charging"
}
}
DELETE /api/plans/{planId}
Bearer token required (ROLE_ADMIN)
Xóa plan theo id.

Sample response:

{
"code": 1000,
"message": "Plan deleted successfully",
"result": null
}
Plan Validation Rules:

PREPAID: monthlyFee phải = 0, phải có ít nhất một trong pricePerKwh hoặc pricePerMinute > 0
POSTPAID: monthlyFee phải = 0, phải có ít nhất một trong pricePerKwh hoặc pricePerMinute > 0
VIP: monthlyFee phải > 0
MONTHLY_SUBSCRIPTION: monthlyFee phải > 0
PAY_AS_YOU_GO: monthlyFee phải = 0
Error Codes:

3001: Plan Not Found
3002: Plan Name Existed (trùng tên, case-insensitive)
3003: Invalid Plan Configuration (vi phạm rule validation theo billingType) 5. Revenue
All revenue endpoints require bearer token (ROLE_ADMIN).

GET /api/revenue/weekly?year={year}&month={month}&week={week}
Lấy thống kê doanh thu theo tuần của từng trạm sạc.

Query parameters:

year (optional): Năm cần thống kê (mặc định: năm hiện tại)
month (optional): Tháng cần thống kê (mặc định: tháng hiện tại)
week (optional): Tuần cần thống kê (mặc định: tuần hiện tại)
GET /api/revenue/monthly?year={year}&month={month}
Lấy thống kê doanh thu theo tháng của từng trạm sạc.

Query parameters:

year (optional): Năm cần thống kê (mặc định: năm hiện tại)
month (optional): Tháng cần thống kê (mặc định: tháng hiện tại)
GET /api/revenue/yearly?year={year}
Lấy thống kê doanh thu theo năm của từng trạm sạc (tất cả các tháng).

Query parameters:

year (optional): Năm cần thống kê (mặc định: năm hiện tại)
Sample StationRevenueResponse list:

{
"code": 1000,
"message": null,
"result": [
{
"stationId": "uuid-1111-...",
"stationName": "Station A",
"address": "123 Main St",
"month": 10,
"year": 2025,
"totalRevenue": 1200.50,
"totalSessions": 30
}
]
} 6. Stations
All station endpoints require bearer token (ROLE_ADMIN) unless otherwise specified.

GET /api/stations/overview
Bearer token required (ROLE_ADMIN)
Lấy danh sách overview của tất cả trạm (nhẹ hơn so với full detail). Dùng cho FE hiển thị nhanh bảng tổng quan.

Sample StationOverviewResponse:

{
"code": 1000,
"message": null,
"result": [
{
"stationId": "uuid-1111-...",
"name": "Trạm Sạc Quận 1",
"status": "OPERATIONAL",
"active": true
},
{
"stationId": "uuid-2222-...",
"name": "Trạm Sạc Quận 2",
"status": "MAINTENANCE",
"active": false
}
]
}
GET /api/stations?status={StationStatus}
Bearer token required (ROLE_ADMIN)
Lấy danh sách trạm với thông tin cơ bản, có thể filter theo status.

Query parameters:

status (optional): Filter theo trạng thái - các giá trị hợp lệ:
OPERATIONAL - Đang hoạt động
MAINTENANCE - Đang bảo trì
OUT_OF_SERVICE - Ngưng hoạt động
CLOSED - Đã đóng cửa
Sample StationResponse:

{
"code": 1000,
"message": null,
"result": [
{
"stationId": "uuid-1111-...",
"name": "Trạm Sạc Quận 1",
"address": "123 Nguyễn Huệ, Quận 1, TP.HCM",
"operatorName": "Công ty ABC",
"contactPhone": "0987654321",
"status": "OPERATIONAL",
"active": true
}
]
}
GET /api/stations/detail?status={StationStatus}
Bearer token required (ROLE_ADMIN)
Danh sách trạm với thông tin đầy đủ cho UI quản lý bao gồm:

Thông tin cơ bản của trạm
Số lượng điểm sạc theo trạng thái (total, available, in-use, offline, maintenance)
Doanh thu
Phần trăm sử dụng
Tên nhân viên phụ trách
Query parameters:

status (optional): Filter theo trạng thái
Sample StationDetailResponse:

{
"code": 1000,
"message": null,
"result": [
{
"stationId": "uuid-1111-...",
"name": "Trạm Sạc Quận 1",
"address": "123 Nguyễn Huệ, Quận 1, TP.HCM",
"operatorName": "Công ty ABC",
"contactPhone": "0987654321",
"status": "OPERATIONAL",
"totalPoints": 10,
"availablePoints": 5,
"inUsePoints": 3,
"offlinePoints": 1,
"maintenancePoints": 1,
"activePoints": 8,
"revenue": 1250.75,
"usagePercent": 30.0,
"staffName": "Nguyễn Văn A"
}
]
}
POST /api/stations/create
Bearer token required (ROLE_ADMIN)
Tạo trạm sạc mới với số lượng điểm sạc và công suất chỉ định.
Lưu ý: Trạm mới tạo sẽ có trạng thái mặc định là OUT_OF_SERVICE (chưa hoạt động).

Request body (StationCreationRequest):

{
"name": "Trạm Sạc Mới",
"address": "456 Lê Lợi, Quận 3, TP.HCM",
"numberOfChargingPoints": 10,
"powerOutputKw": 50.0,
"operatorName": "Công ty XYZ",
"contactPhone": "0901234567"
}
Sample response:

{
"code": 1000,
"message": null,
"result": {
"stationId": "uuid-new-...",
"name": "Trạm Sạc Mới",
"address": "456 Lê Lợi, Quận 3, TP.HCM",
"operatorName": "Công ty XYZ",
"contactPhone": "0901234567",
"status": "OUT_OF_SERVICE",
"active": false
}
}
PUT /api/stations/{stationId}
Bearer token required (ROLE_ADMIN)
Cập nhật thông tin cơ bản của trạm (name, address, operatorName, contactPhone, status).
Lưu ý: Không thay đổi số lượng charging points hoặc cấu hình phần cứng.

Request body (StationUpdateRequest):

{
"name": "Trạm Sạc Quận 1 - Cập Nhật",
"address": "789 Nguyễn Thị Minh Khai, Quận 1, TP.HCM",
"operatorName": "Công ty ABC Updated",
"contactPhone": "0999888777",
"status": "OPERATIONAL"
}
Sample response:

{
"code": 1000,
"message": null,
"result": {
"stationId": "uuid-1111-...",
"name": "Trạm Sạc Quận 1 - Cập Nhật",
"address": "789 Nguyễn Thị Minh Khai, Quận 1, TP.HCM",
"operatorName": "Công ty ABC Updated",
"contactPhone": "0999888777",
"status": "OPERATIONAL",
"active": true
}
}
DELETE /api/stations/{stationId}
Bearer token required (ROLE_ADMIN)
Xóa trạm sạc theo id. Tất cả charging points liên quan sẽ tự động bị xóa (cascade).

Sample response:

{
"code": 1000,
"message": "Station deleted successfully",
"result": null
}
PATCH /api/stations/{stationId}/status?status={StationStatus}
Bearer token required (ROLE_ADMIN)
Cập nhật trạng thái cụ thể của trạm (truyền enum trực tiếp).

Query parameters:

status (required): Trạng thái mới - OPERATIONAL, MAINTENANCE, OUT_OF_SERVICE, hoặc CLOSED
Sample response:

{
"code": 1000,
"message": null,
"result": {
"stationId": "uuid-1111-...",
"name": "Trạm Sạc Quận 1",
"address": "123 Nguyễn Huệ, Quận 1, TP.HCM",
"operatorName": "Công ty ABC",
"contactPhone": "0987654321",
"status": "MAINTENANCE",
"active": false
}
}
PATCH /api/stations/{stationId}/activate
Bearer token required (ROLE_ADMIN)
Kích hoạt trạm: set trạng thái về OPERATIONAL.

Sample response:

{
"code": 1000,
"message": null,
"result": {
"stationId": "uuid-1111-...",
"name": "Trạm Sạc Quận 1",
"status": "OPERATIONAL",
"active": true
}
}
PATCH /api/stations/{stationId}/deactivate
Bearer token required (ROLE_ADMIN)
Ngưng hoạt động trạm: set trạng thái về OUT_OF_SERVICE.

Sample response:

{
"code": 1000,
"message": null,
"result": {
"stationId": "uuid-1111-...",
"name": "Trạm Sạc Quận 1",
"status": "OUT_OF_SERVICE",
"active": false
}
}
PATCH /api/stations/{stationId}/toggle
Bearer token required (ROLE_ADMIN)
Chuyển đổi trạng thái giữa OPERATIONAL ↔ OUT_OF_SERVICE.
Lưu ý: Không tác động tới các trạng thái khác (MAINTENANCE, CLOSED).

Sample response:

{
"code": 1000,
"message": null,
"result": {
"stationId": "uuid-1111-...",
"name": "Trạm Sạc Quận 1",
"status": "OPERATIONAL",
"active": true
}
}
Station Staff Assignment Endpoints
GET /api/stations/{stationId}/staff
Bearer token required (ROLE_ADMIN)
Lấy danh sách nhân viên đang thuộc về một trạm.

Sample response:

{
"code": 1000,
"message": null,
"result": [
{
"staffId": "uuid-staff-1...",
"fullName": "Nguyễn Văn A",
"email": "staff1@example.com",
"phone": "0901234567",
"stationId": "uuid-1111-...",
"stationName": "Trạm Sạc Quận 1"
}
]
}
POST /api/stations/{stationId}/staff/{staffId}
Bearer token required (ROLE_ADMIN)
Gán một nhân viên (staffId = userId của staff) vào trạm.
Business Rule: Nếu staff đã thuộc 1 trạm khác → Error STAFF_ALREADY_ASSIGNED (không tự động chuyển trạm để tránh nhầm lẫn).

Sample response:

{
"code": 1000,
"message": null,
"result": {
"staffId": "uuid-staff-1...",
"fullName": "Nguyễn Văn A",
"email": "staff1@example.com",
"phone": "0901234567",
"stationId": "uuid-1111-...",
"stationName": "Trạm Sạc Quận 1"
}
}
DELETE /api/stations/{stationId}/staff/{staffId}
Bearer token required (ROLE_ADMIN)
Bỏ gán nhân viên khỏi trạm.

Sample response:

{
"code": 1000,
"message": "Unassigned",
"result": null
}
GET /api/stations/staff/unassigned
Bearer token required (ROLE_ADMIN)
Danh sách nhân viên chưa được gán vào bất kỳ trạm nào.

Sample response:

{
"code": 1000,
"message": null,
"result": [
{
"staffId": "uuid-staff-2...",
"fullName": "Trần Thị B",
"email": "staff2@example.com",
"phone": "0907654321",
"stationId": null,
"stationName": null
}
]
}
Station Error Codes:

2001: Station Not Found
4001: Staff Not Found
4002: Staff Already Assigned (nhân viên đã thuộc trạm khác)
4003: Staff Not In This Station (khi unassign nhân viên không thuộc trạm này) 7. Station Usage
GET /api/stations/{stationId}/usages/realtime
Bearer token required (ROLE_ADMIN, ROLE_STAFF)
Lấy thông tin phiên sạc đang diễn ra tại một trạm (nếu có).

Sample response:

{
"code": 1000,
"message": null,
"result": {
"stationId": "uuid-1111-...",
"currentUsage": {
"sessionId": "uuid-session-...",
"vehicleId": "uuid-vehicle-...",
"driverId": "uuid-driver-...",
"startTime": "2025-09-15T10:30:00",
"status": "IN_PROGRESS",
"chargingPoint": {
"id": "uuid-point-...",
"name": "Điểm sạc 1",
"powerKw": 50
}
}
}
}
GET /api/stations/{stationId}/usages/history
Bearer token required (ROLE_ADMIN, ROLE_STAFF)
Lịch sử các phiên sạc tại một trạm.

Sample response:

{
"code": 1000,
"message": null,
"result": [
{
"sessionId": "uuid-session-...",
"vehicleId": "uuid-vehicle-...",
"driverId": "uuid-driver-...",
"startTime": "2025-09-01T08:00:00",
"endTime": "2025-09-01T09:00:00",
"status": "COMPLETED",
"chargingPoint": {
"id": "uuid-point-...",
"name": "Điểm sạc 1",
"powerKw": 50
},
"revenue": 10.5
}
]
}
GET /api/stations/{stationId}/usages/analytics/daily
Bearer token required (ROLE_ADMIN, ROLE_STAFF)
Thống kê sử dụng theo ngày cho một trạm.

Sample response:

{
"code": 1000,
"message": null,
"result": [
{
"date": "2025-09-01",
"totalSessions": 10,
"totalRevenue": 105.0,
"totalTimeHours": 5.5
}
]
}
GET /api/stations/{stationId}/usages/analytics/monthly
Bearer token required (ROLE_ADMIN, ROLE_STAFF)
Thống kê sử dụng theo tháng cho một trạm.

Sample response:

{
"code": 1000,
"message": null,
"result": [
{
"month": "2025-09",
"totalSessions": 50,
"totalRevenue": 525.0,
"totalTimeHours": 30.5
}
]
}
GET /api/stations/{stationId}/usages/analytics/yearly
Bearer token required (ROLE_ADMIN, ROLE_STAFF)
Thống kê sử dụng theo năm cho một trạm.

Sample response:

{
"code": 1000,
"message": null,
"result": [
{
"year": 2025,
"totalSessions": 600,
"totalRevenue": 6300.0,
"totalTimeHours": 365.0
}
]
} 8. Vehicles (Thông tin xe điện)
POST /api/vehicles
Bearer token required (ROLE_DRIVER)
Driver tạo xe mới cho chính mình.

Request body (VehicleCreationRequest):

{
"licensePlate": "30A-12345",
"model": "Tesla Model 3",
"batteryCapacityKwh": 75.0,
"batteryType": "Lithium-ion"
}
Sample response:

{
"code": 1000,
"message": null,
"result": {
"vehicleId": "uuid-vehicle-...",
"licensePlate": "30A-12345",
"model": "Tesla Model 3",
"batteryCapacityKwh": 75.0,
"batteryType": "Lithium-ion",
"ownerId": "uuid-driver-..."
}
}
GET /api/vehicles/my-vehicles
Bearer token required (ROLE_DRIVER)
Driver lấy danh sách tất cả xe của mình.

Sample response:

{
"code": 1000,
"message": null,
"result": [
{
"vehicleId": "uuid-vehicle-...",
"licensePlate": "30A-12345",
"model": "Tesla Model 3",
"batteryCapacityKwh": 75.0,
"batteryType": "Lithium-ion",
"ownerId": "uuid-driver-..."
},
{
"vehicleId": "uuid-vehicle-2...",
"licensePlate": "29B-67890",
"model": "VinFast VF8",
"batteryCapacityKwh": 87.7,
"batteryType": "LFP",
"ownerId": "uuid-driver-..."
}
]
}
GET /api/vehicles/my-vehicles/{vehicleId}
Bearer token required (ROLE_DRIVER)
Driver lấy chi tiết một xe của mình.

Sample response:

{
"code": 1000,
"message": null,
"result": {
"vehicleId": "uuid-vehicle-...",
"licensePlate": "30A-12345",
"model": "Tesla Model 3",
"batteryCapacityKwh": 75.0,
"batteryType": "Lithium-ion",
"ownerId": "uuid-driver-..."
}
}
PUT /api/vehicles/{vehicleId}
Bearer token required (ROLE_DRIVER)
Driver cập nhật thông tin xe của mình. Tất cả fields đều optional (partial update).

Request body (VehicleUpdateRequest):

{
"licensePlate": "30A-99999",
"model": "Tesla Model 3 Long Range",
"batteryCapacityKwh": 82.0,
"batteryType": "Lithium-ion NCM"
}
Sample response:

{
"code": 1000,
"message": null,
"result": {
"vehicleId": "uuid-vehicle-...",
"licensePlate": "30A-99999",
"model": "Tesla Model 3 Long Range",
"batteryCapacityKwh": 82.0,
"batteryType": "Lithium-ion NCM",
"ownerId": "uuid-driver-..."
}
}
DELETE /api/vehicles/{vehicleId}
Bearer token required (ROLE_DRIVER)
Driver xóa xe của mình.

Sample response:

{
"code": 1000,
"message": "Vehicle deleted successfully",
"result": null
}
GET /api/vehicles/driver/{driverId}
Bearer token required (ROLE_ADMIN)
Admin lấy danh sách xe của một driver cụ thể.

Sample response:

{
"code": 1000,
"message": null,
"result": [
{
"vehicleId": "uuid-vehicle-...",
"licensePlate": "30A-12345",
"model": "Tesla Model 3",
"batteryCapacityKwh": 75.0,
"batteryType": "Lithium-ion",
"ownerId": "uuid-driver-..."
}
]
}
Vehicle Validation & Business Rules:

Biển số xe (licensePlate) phải unique trong hệ thống
Driver chỉ có thể xem/sửa/xóa xe của chính mình
Admin có thể xem xe của bất kỳ driver nào
Error Codes:

5001: Vehicle Not Found
5002: License Plate Already Exists (biển số đã tồn tại)
5003: Vehicle Does Not Belong To This Driver (xe không thuộc về driver này) 9. Payment Methods (Phương thức thanh toán)
All payment method endpoints require bearer token (ROLE_DRIVER).

POST /api/payment-methods
Bearer token required (ROLE_DRIVER)
Driver thêm phương thức thanh toán mới (Credit Card, E-Wallet, ...).

Request body (PaymentMethodCreationRequest):

{
"methodType": "CREDIT_CARD",
"provider": "Visa",
"token": "4111111111111234"
}
Payment Method Types:

CREDIT_CARD - Thẻ tín dụng
DEBIT_CARD - Thẻ ghi nợ
E_WALLET - Ví điện tử (MoMo, ZaloPay, ...)
BANK_TRANSFER - Chuyển khoản ngân hàng
Sample response:

{
"code": 1000,
"message": null,
"result": {
"pmId": "uuid-pm-...",
"methodType": "CREDIT_CARD",
"provider": "Visa",
"maskedToken": "\***\* \*\*** \*\*\*\* 1234"
}
}
GET /api/payment-methods
Bearer token required (ROLE_DRIVER)
Driver xem danh sách phương thức thanh toán của mình.

Sample response:

{
"code": 1000,
"message": null,
"result": [
{
"pmId": "uuid-pm-1...",
"methodType": "CREDIT_CARD",
"provider": "Visa",
"maskedToken": "**** **** **** 1234"
},
{
"pmId": "uuid-pm-2...",
"methodType": "E_WALLET",
"provider": "MoMo",
"maskedToken": "**** **** **** 5678"
}
]
}
DELETE /api/payment-methods/{pmId}
Bearer token required (ROLE_DRIVER)
Driver xóa phương thức thanh toán.

Sample response:

{
"code": 1000,
"message": "Payment method deleted successfully",
"result": null
}
Payment Method Business Rules:

Mỗi driver có thể có nhiều phương thức thanh toán
Token được mask khi trả về API (chỉ hiển thị 4 số cuối)
Driver chỉ có thể xóa phương thức thanh toán của chính mình
Error Codes:

8001: Payment Method Not Found
9001: Unauthorized Access (khi driver cố xóa payment method không thuộc mình) 10. Subscriptions (Gói đăng ký)
All subscription endpoints require bearer token (ROLE_DRIVER).

POST /api/subscriptions
Bearer token required (ROLE_DRIVER)
Driver đăng ký gói subscription (Free, Premium, VIP).
Lưu ý: Nếu gói có phí monthly (> 0), cần cung cấp paymentMethodId.

Request body (SubscriptionCreationRequest):

{
"planId": "uuid-plan-...",
"paymentMethodId": "uuid-pm-...",
"autoRenew": true
}
Sample response:

{
"code": 1000,
"message": null,
"result": {
"subscriptionId": "uuid-sub-...",
"driverId": "uuid-driver-...",
"plan": {
"planId": "uuid-plan-...",
"name": "Premium",
"billingType": "MONTHLY_SUBSCRIPTION",
"pricePerKwh": 0.08,
"pricePerMinute": 0.015,
"monthlyFee": 199000.0,
"benefits": "Giảm 10% mọi phiên sạc, Đặt chỗ trước, Báo cáo chi tiết, Hỗ trợ ưu tiên"
},
"startDate": "2025-10-11T14:30:00",
"endDate": "2025-11-11T14:30:00",
"status": "ACTIVE",
"autoRenew": true
}
}
GET /api/subscriptions/active
Bearer token required (ROLE_DRIVER)
Driver xem gói subscription hiện tại đang ACTIVE.

Sample response:

{
"code": 1000,
"message": null,
"result": {
"subscriptionId": "uuid-sub-...",
"driverId": "uuid-driver-...",
"plan": {
"planId": "uuid-plan-...",
"name": "Premium",
"billingType": "MONTHLY_SUBSCRIPTION",
"pricePerKwh": 0.08,
"pricePerMinute": 0.015,
"monthlyFee": 199000.0,
"benefits": "Giảm 10% mọi phiên sạc, Đặt chỗ trước, Báo cáo chi tiết, Hỗ trợ ưu tiên"
},
"startDate": "2025-10-11T14:30:00",
"endDate": "2025-11-11T14:30:00",
"status": "ACTIVE",
"autoRenew": true
}
}
DELETE /api/subscriptions/{subscriptionId}
Bearer token required (ROLE_DRIVER)
Driver hủy subscription hiện tại. Subscription sẽ chuyển trạng thái sang CANCELLED.

Sample response:

{
"code": 1000,
"message": "Subscription cancelled successfully",
"result": null
}
PATCH /api/subscriptions/{subscriptionId}/auto-renew?autoRenew={boolean}
Bearer token required (ROLE_DRIVER)
Driver bật/tắt tự động gia hạn subscription.

Query parameters:

autoRenew (required): true để bật tự động gia hạn, false để tắt
Sample response:

{
"code": 1000,
"message": null,
"result": {
"subscriptionId": "uuid-sub-...",
"driverId": "uuid-driver-...",
"plan": {
"planId": "uuid-plan-...",
"name": "Premium",
"billingType": "MONTHLY_SUBSCRIPTION",
"pricePerKwh": 0.08,
"pricePerMinute": 0.015,
"monthlyFee": 199000.0,
"benefits": "Giảm 10% mọi phiên sạc"
},
"startDate": "2025-10-11T14:30:00",
"endDate": "2025-11-11T14:30:00",
"status": "ACTIVE",
"autoRenew": false
}
}
Subscription Business Rules:

Driver chỉ có thể có 1 subscription ACTIVE tại một thời điểm
Gói miễn phí (monthlyFee = 0) không cần payment method
Gói có phí (monthlyFee > 0) bắt buộc cần payment method
Khi subscribe gói có phí, hệ thống tự động tạo payment record
Subscription mặc định có thời hạn 1 tháng kể từ ngày đăng ký
Khi hủy subscription, autoRenew tự động bị tắt
Subscription Status:

ACTIVE - Đang hoạt động
EXPIRED - Đã hết hạn
CANCELLED - Đã hủy
Error Codes:

6001: Driver Not Found
3001: Plan Not Found
7001: Subscription Not Found
7002: Subscription Already Active (driver đã có subscription ACTIVE)
7003: Subscription Not Active (khi hủy subscription không ở trạng thái ACTIVE)
8001: Payment Method Not Found
8002: Payment Method Required (khi subscribe gói có phí mà không cung cấp payment method)
9001: Unauthorized Access
