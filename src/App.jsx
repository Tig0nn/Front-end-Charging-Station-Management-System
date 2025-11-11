import "./App.css";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/SignUp";
import GoogleCallback from "./pages/GoogleCallback";
import { MainLayoutAdmin } from "./components/layoutAdmin";
import { NotFound, Reports, StationsList, UsersList } from "./pages";
import StaffList from "./Pages/admin/StaffList";
import EVChargingLanding from "./pages/EVChargingLanding";
import MainLayoutDriver from "./components/layoutDriver/MainLayoutDriver";
import MapPage from "./pages/driver/MapPage";
import ChargingSessionPage from "./pages/driver/ChargingSessionPage";
import HistoryPage from "./pages/driver/HistoryPage";
import ProfileInfoPage from "./pages/driver/ProfileInfoPage";
import MainLayoutStaff from "./components/layoutStaff/MainLayoutStaff";
import StationOverview from "./pages/staff/StationOverview.jsx";
import VehicleInfoPage from "./pages/driver/VehicleInfoPage";
import PaymentPage from "./pages/driver/PaymentPage";
import AddStation from "./pages/admin/AddStation";
import StaffReports from "./pages/staff/StaffReports";
import StaffPaymentRequests from "./pages/staff/StaffPaymentRequests";
import ProfileLayout from "./pages/driver/ProfileLayout";
import AdminIncidents from "./pages/admin/AdminIncidents";
import QRCodeManager from "./pages/admin/QRCodeManager";
import WalletPage from "./Pages/driver/WalletPage";
import BookingPage from "./pages/driver/BookingPage";
import AdminChargingPointManagement from "./pages/admin/AdminChargingPointManagement.jsx";
// import { usersAPI } from "./lib/apiServices"; // Not needed - layout components handle API calls
import AddUserInfoPage from "./pages/AddUserInfoPage";
import { useEffect } from "react";
import { useAuth } from "./hooks/useAuth.jsx";
import RequireRole from "./components/RequireRole.jsx";

// Guard: gọi API getDriverInfo, merge vào localStorage, sau đó check phone
function RequireDriverInfo({ children }) {
  const loc = useLocation();
  const { user, loading } = useAuth(); // ✅ Dùng user từ AuthContext thay vì localStorage

  // Kiểm tra token để xác định đã đăng nhập
  const isAuthenticated = !!localStorage.getItem("authToken");

  useEffect(() => {}, [isAuthenticated, loc.pathname]);

  //Chưa đăng nhập → về login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: loc }} replace />;
  }

  // ✅ Đợi loading xong mới check phone
  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100vh" }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  const role = String(user?.role || "").toUpperCase();
  const phone = user?.phone;

  // Check nếu phone tồn tại và không phải null/undefined/empty
  const hasPhone =
    phone !== null &&
    phone !== undefined &&
    String(phone).trim() !== "" &&
    String(phone).trim() !== "null";

  // Nếu là DRIVER và không có phone → redirect về add-info
  if (role === "DRIVER" && !hasPhone) {
    return <Navigate to="/driver/add-info" replace />;
  }

  return children;
}

function App() {
  return (
    <Routes>
      {/* Authentication Routes */}
      <Route path="/" element={<EVChargingLanding />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/auth/google/callback" element={<GoogleCallback />} />

      {/* Trang bổ sung thông tin: để ngoài guard */}
      <Route
        path="/driver/add-info"
        element={
          <RequireRole allowedRoles={["DRIVER"]}>
            <AddUserInfoPage />
          </RequireRole>
        }
      />

      {/* Legacy Admin Route */}

      {/* New Admin Routes with Layout */}
      <Route
        path="/admin/*"
        element={
          <RequireRole allowedRoles={["ADMIN"]}>
            <MainLayoutAdmin>
              <Routes>
                {/* Default route - Phân tích */}
                <Route path="/" element={<Reports />} />
                {/* Reports Routes - Trang phân tích */}
                <Route path="/reports" element={<Reports />} />
                <Route path="/reports/*" element={<Reports />} />
                {/* Stations Routes */}
                <Route path="/stations" element={<StationsList />} />
                <Route path="/stations/add" element={<AddStation />} />{" "}
                {/* Users Routes */}
                <Route path="/users" element={<UsersList />} />
                {/* Staff Routes */}
                <Route path="/staffs" element={<StaffList />} />
                {/* Incidents */}
                <Route path="/incidents" element={<AdminIncidents />} />
                {/* QR Code Manager */}
                <Route path="/qr-codes" element={<QRCodeManager />} />
                {/* Charging Point Management */}
                <Route
                  path="/charging-points"
                  element={<AdminChargingPointManagement />}
                />
                {/* 404 Page */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </MainLayoutAdmin>
          </RequireRole>
        }
      />
      <Route
        path="/staff/*"
        element={
          <RequireRole allowedRoles={["STAFF"]}>
            // TODO: Thêm Guard kiểm tra vai trò Staff nếu cần
            <MainLayoutStaff>
              <Routes>
                {/* Route mặc định sẽ là trang trạm sạc */}
                <Route
                  index
                  element={<Navigate to="/staff/station" replace />}
                />
                <Route path="/station" element={<StationOverview />} />

                {/* Các route khác cho Staff */}
                <Route
                  path="/payment-requests"
                  element={<StaffPaymentRequests />}
                />
                <Route path="/reports" element={<StaffReports />} />

                {/* 404 Page for Staff section */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </MainLayoutStaff>
          </RequireRole>
        }
      />

      <Route
        path="/driver/*"
        element={
          <RequireRole allowedRoles={["DRIVER"]}>
            <RequireDriverInfo>
              <MainLayoutDriver>
                <Routes>
                  {/* Route mặc định sẽ là trang bản đồ */}
                  <Route
                    index
                    element={<Navigate to="/driver/map" replace />}
                  />
                  <Route path="/map" element={<MapPage />} />
                  <Route path="/session" element={<ChargingSessionPage />} />
                  <Route
                    path="/session/:sessionId"
                    element={<ChargingSessionPage />}
                  />
                  <Route path="/history/*" element={<HistoryPage />} />{" "}
                  {/* Booking route - moved out from profile */}
                  <Route path="/booking" element={<BookingPage />} />
                  {/* Profile Routes with nested routes */}
                  <Route path="/profile/*" element={<ProfileLayout />}>
                    <Route index element={<Navigate to="info" replace />} />
                    <Route path="info" element={<ProfileInfoPage />} />
                    <Route path="vehicle" element={<VehicleInfoPage />} />
                    <Route path="payment" element={<PaymentPage />} />
                  </Route>
                  {/* Wallet route */}
                  <Route path="/wallet" element={<WalletPage />} />
                  {/* 404 Page for Driver section */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </MainLayoutDriver>
            </RequireDriverInfo>
          </RequireRole>
        }
      />
      {/* Catch all other routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
