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
Below is the full list of all HTTP endpoints in the system, organized by resource. For each endpoint you’ll find:

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
Get the authenticated driver’s profile.

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
"role": "DRIVER"
}
}
PATCH /api/users/driver/myInfo
Bearer token required (ROLE_DRIVER)
Partially update the authenticated driver’s profile. Same response shape as above.

GET /api/users/{userId}
Bearer token required
Retrieve any one user’s details (for driver self or admin).

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
},
{ … }
]
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
} 4. Plans
All plan endpoints require bearer token (ROLE_ADMIN).

POST /api/plans
POST /api/plans/prepaid
POST /api/plans/postpaid
POST /api/plans/vip
Request body (PlanCreationRequest):

{
"name": "Basic Plan",
"billingType": "MONTHLY_SUBSCRIPTION",
"pricePerKwh": 0.1,
"pricePerMinute": 0.02,
"monthlyFee": 9.99,
"benefits": "Free parking"
}
GET /api/plans
GET /api/plans/{planId}
Sample PlanResponse:

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
} 5. Revenue
All revenue endpoints require bearer token (ROLE_ADMIN).

GET /api/revenue/weekly?year={yea}r&week={week}
GET /api/revenue/monthly?year={year}&month={month}
GET /api/revenue/yearly?year={year}
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
},
{ … }
]
}
} 6. Stations
All station endpoints require bearer token (ROLE_ADMIN).

Overview
GET /api/stations/overview

Sample StationOverviewResponse:

{
"code": 1000,
"message": null,
"result": [
{
"stationId": "uuid-1111-...",
"name": "Station A",
"status": "OPERATIONAL",
"active": true
},
{ … }
]
}
Full Detail & Filtering
GET /api/stations?status={OPERATIONAL|MAINTENANCE|...}

Sample StationDetailResponse:

{
"code": 1000,
"message": null,
"result": [
{
"stationId": "uuid-1111-...",
"name": "Station A",
"address": "123 Main St",
"status": "OPERATIONAL",
"totalChargingPoints": 10,
"activeChargingPoints": 7,
"offlineChargingPoints": 2,
"maintenanceChargingPoints": 1,
"chargingPointsSummary": "Tổng: 10 | Hoạt động: 7 | Offline: 2 | Bảo trì: 1",
"revenue": 1500.75,
"usagePercent": 70.0,
"staffName": "Alice Nguyen"
},
{ … }
]
}
Status Updates
PATCH /api/stations/{stationId}/status?status={StationStatus}
PATCH /api/stations/{stationId}/activate
PATCH /api/stations/{stationId}/deactivate
PATCH /api/stations/{stationId}/toggle
Each returns a single StationResponse:

{
"code": 1000,
"message": null,
"result": {
"stationId": "uuid-1111-...",
"name": "Station A",
"address": "123 Main St",
"operatorName": "Operator X",
"contactPhone": "0987654321",
"status": "OUT_OF_SERVICE",
"active": false
}
}
Staff Assignment
GET /api/stations/{stationId}/staff
POST /api/stations/{stationId}/staff/{staffId}
DELETE /api/stations/{stationId}/staff/{staffId}
Sample StaffSummaryResponse:

{
"code": 1000,
"message": null,
"result": [
{
"staffId": "uuid-2222-...",
"employeeNo": "EMP001",
"position": "Technician",
"email": "tech@example.com",
"fullName": "Bob Tran",
"stationId": "uuid-1111-...",
"stationName": "Station A"
},
{ … }
]
}
GET /api/stations/staff/unassigned
Lists all staff not yet assigned to any station. Same StaffSummaryResponse shape.

Notes on Authentication

Only /api/auth/login and /api/users/register are publicly accessible.
All other endpoints require a valid Bearer JWT in Authorization: Bearer <token>.
Some sensitive operations (overview, plan, revenue, station management, drivers listing/deletion) are further restricted to ADMIN role.
