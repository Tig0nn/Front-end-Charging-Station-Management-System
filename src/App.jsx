import "./App.css";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Login from "./Pages/Login";
import Signup from "./Pages/SignUp";
import GoogleCallback from "./Pages/GoogleCallback";
import { MainLayoutAdmin } from "./components/layoutAdmin";
import { NotFound, Reports, StationsList, UsersList } from "./Pages";
import EVChargingLanding from "./Pages/EVChargingLanding";
import MainLayoutDriver from "./components/layoutDriver/MainLayoutDriver";
import MapPage from "./Pages/driver/MapPage";
import ChargingSessionPage from "./Pages/driver/ChargingSessionPage";
import HistoryPage from "./Pages/driver/HistoryPage";
import ProfileInfoPage from "./Pages/driver/ProfileInfoPage";
import MainLayoutStaff from "./components/layoutStaff/MainLayoutStaff";
import StationOverview from "./Pages/staff/StationOverview.jsx";
import VehicleInfoPage from "./Pages/driver/VehicleInfoPage";
import PaymentPage from "./Pages/driver/PaymentPage";
import AddStation from "./Pages/admin/AddStation";
import StaffReports from "./Pages/staff/StaffReports";
import StaffPaymentRequests from "./Pages/staff/StaffPaymentRequests";
import ProfileLayout from "./Pages/driver/ProfileLayout";
import NotificationPage from "./Pages/driver/NotificationPage";
import AdminIncidents from "./Pages/admin/AdminIncidents";
import QRCodeManager from "./Pages/admin/QRCodeManager";
// import { usersAPI } from "./lib/apiServices"; // Not needed - layout components handle API calls
import AddUserInfoPage from "./Pages/AddUserInfoPage";
import { useEffect } from "react";

// Guard: gọi API getDriverInfo, merge vào localStorage, sau đó check phone
function RequireDriverInfo({ children }) {
  const loc = useLocation();

  // Kiểm tra token để xác định đã đăng nhập
  const isAuthenticated = !!localStorage.getItem("authToken");

  useEffect(() => {
    // ⚠️ DISABLED: MainLayoutDriver and ProfileLayout already fetch driver info
    // This prevents duplicate API calls (3-4x per page load)
    // If needed in future, enable this and disable API calls in layout components
    /*
    const syncDriverInfo = async () => {
      // Chỉ sync nếu đã đăng nhập và không ở trang add-info
      if (!isAuthenticated || loc.pathname.startsWith("/driver/add-info")) {
        return;
      }

      // ... rest of code
    };

    syncDriverInfo();
    */
  }, [isAuthenticated, loc.pathname]);

  //Chưa đăng nhập → về login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: loc }} replace />;
  }

  //Kiểm tra phone từ localStorage
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    user = null;
  }

  const role = String(user?.role || "").toUpperCase();
  const phone = user?.phone || user?.phoneNum || user?.phoneNumber;

  // Check nếu phone tồn tại và không phải null/undefined/empty
  const hasPhone =
    phone !== null &&
    phone !== undefined &&
    String(phone).trim() !== "" &&
    String(phone).trim() !== "null";

  //Nếu là DRIVER và không có phone → redirect về add-info
  if (role === "DRIVER" && !hasPhone) {
    console.log(
      "❌ No valid phone found, redirecting to add-info. Phone value:",
      phone
    );
    return <Navigate to="/driver/add-info" replace />;
  }

  //Có phone hoặc không phải DRIVER → cho qua
  console.log("Allowing access to:", loc.pathname);
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
      <Route path="/driver/add-info" element={<AddUserInfoPage />} />

      {/* Legacy Admin Route */}

      {/* New Admin Routes with Layout */}
      <Route
        path="/admin/*"
        element={
          <MainLayoutAdmin>
            <Routes>
              {/* Default route - Phân tích */}
              <Route path="/" element={<Reports />} />

              {/* Reports Routes - Trang phân tích */}
              <Route path="/reports" element={<Reports />} />
              <Route path="/reports/*" element={<Reports />} />

              {/* Stations Routes */}
              <Route path="/stations" element={<StationsList />} />
              <Route path="/stations/add" element={<AddStation />} />

              {/* Users Routes */}
              <Route path="/users" element={<UsersList />} />

              {/* Incidents */}
              <Route path="/incidents" element={<AdminIncidents />} />

              {/* QR Code Manager */}
              <Route path="/qr-codes" element={<QRCodeManager />} />

              {/* 404 Page */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </MainLayoutAdmin>
        }
      />
      <Route
        path="/staff/*"
        element={
          // TODO: Thêm Guard kiểm tra vai trò Staff nếu cần
          <MainLayoutStaff>
            <Routes>
              {/* Route mặc định sẽ là trang trạm sạc */}
              <Route index element={<Navigate to="/staff/station" replace />} />
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
        }
      />

      <Route
        path="/driver/*"
        element={
          <RequireDriverInfo>
            <MainLayoutDriver>
              <Routes>
                {/* Route mặc định sẽ là trang bản đồ */}
                <Route index element={<Navigate to="/driver/map" replace />} />
                <Route path="/map" element={<MapPage />} />
                <Route path="/session" element={<ChargingSessionPage />} />
                <Route
                  path="/session/:sessionId"
                  element={<ChargingSessionPage />}
                />
                <Route path="/history/*" element={<HistoryPage />} />

                {/* Profile Routes with nested routes */}
                <Route path="/profile/*" element={<ProfileLayout />}>
                  <Route index element={<Navigate to="info" replace />} />
                  <Route path="info" element={<ProfileInfoPage />} />
                  <Route path="vehicle" element={<VehicleInfoPage />} />
                  <Route path="payment" element={<PaymentPage />} />
                  <Route path="notification" element={<NotificationPage />} />
                </Route>

                {/* 404 Page for Driver section */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </MainLayoutDriver>
          </RequireDriverInfo>
        }
      />
      {/* Catch all other routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
