import "./App.css";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Login from "./Pages/Login";
import Signup from "./Pages/SignUp";
import { MainLayoutAdmin } from "./components/layoutAdmin";
import { Dashboard, NotFound, Reports, StationsList, UsersList } from "./Pages";
import MockApiTest from "./Pages/MockApiTest";
import EVChargingLanding from "./Pages/EVChargingLanding";
import MainLayoutDriver from "./components/layoutDriver/MainLayoutDriver";
import MapPage from "./Pages/driver/MapPage";
import ChargingSessionPage from "./Pages/driver/ChargingSessionPage";
import HistoryPage from "./Pages/driver/HistoryPage";
import ProfileInfoPage from "./Pages/driver/ProfileInfoPage";
import VehicleInfoPage from "./Pages/driver/VehicleInfoPage";
import PaymentPage from "./Pages/driver/PaymentPage";
import AddStation from "./Pages/admin/AddStation";
import { usersAPI } from "./lib/apiServices";
import AddUserInfoPage from "./Pages/AddUserInfoPage";
import { useEffect } from "react";

// Guard: gọi API getDriverInfo, merge vào localStorage, sau đó check phone
function RequireDriverInfo({ children }) {
  const loc = useLocation();

  // Kiểm tra token để xác định đã đăng nhập
  const isAuthenticated = !!localStorage.getItem("authToken");

  useEffect(() => {
    const syncDriverInfo = async () => {
      // Chỉ sync nếu đã đăng nhập và không ở trang add-info
      if (!isAuthenticated || loc.pathname.startsWith("/driver/add-info")) {
        return;
      }

      // Lấy user hiện tại từ localStorage
      let user = null;
      try {
        user = JSON.parse(localStorage.getItem("user") || "null");
      } catch {
        return;
      }

      const role = String(user?.role || "").toUpperCase();

      // Chỉ sync nếu là DRIVER
      if (role !== "DRIVER") {
        return;
      }

      // Gọi API getDriverInfo để lấy thông tin mới nhất
      try {
        console.log("Syncing driver info from API...");
        const response = await usersAPI.getDriverInfo();
        console.log("Driver info response:", response.data);

        const driverData = response.data?.result || response.data;

        // Merge driver info vào user hiện tại
        const updatedUser = {
          ...user,
          ...driverData,
          // Đảm bảo role không bị ghi đè
          role: user.role,
        };

        console.log("Updated user with driver info:", updatedUser);

        // Lưu lại vào localStorage
        localStorage.setItem("user", JSON.stringify(updatedUser));
      } catch (error) {
        console.warn("Cannot sync driver info:", error);
      }
    };

    syncDriverInfo();
  }, [isAuthenticated, loc.pathname]);

  // 1) Chưa đăng nhập → về login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: loc }} replace />;
  }

  // 2) Đang ở trang add-info → cho qua luôn
  if (loc.pathname.startsWith("/driver/add-info")) {
    return children;
  }

  // 3) Kiểm tra phone từ localStorage
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    user = null;
  }

  const role = String(user?.role || "").toUpperCase();
  const phone = user?.phone || user?.phoneNum || user?.phoneNumber;
  const hasPhone = phone && String(phone).trim() !== "";

  console.log("Guard check - role:", role, "hasPhone:", hasPhone, "phone:", phone);

  // 4) Nếu là DRIVER và không có phone → redirect về add-info
  if (role === "DRIVER" && !hasPhone) {
    console.log("❌ No phone found, redirecting to add-info");
    return <Navigate to="/driver/add-info" replace />;
  }

  // 5) Có phone hoặc không phải DRIVER → cho qua
  console.log("✅ Allowing access to:", loc.pathname);
  return children;
}


function App() {
  return (
    <Routes>
      {/* Authentication Routes */}
      <Route path="/" element={<EVChargingLanding />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Trang bổ sung thông tin: để ngoài guard */}
      <Route path="/driver/add-info" element={<AddUserInfoPage />} />

      {/* Legacy Admin Route */}

      {/* New Admin Routes with Layout */}
      <Route
        path="/admin/*"
        element={
          <MainLayoutAdmin>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />

              {/* Stations Routes */}
              <Route path="/stations" element={<StationsList />} />
              <Route path="/stations/add" element={<AddStation />} />

              {/* Users Routes */}
              <Route path="/users" element={<UsersList />} />

              {/* Reports Routes */}
              <Route path="/reports" element={<Reports />} />
              <Route path="/reports/*" element={<Reports />} />

              {/* Mock API Test Page */}
              <Route path="/mock-test" element={<MockApiTest />} />

              {/* 404 Page */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </MainLayoutAdmin>
        }
      />
      <Route
        path="/driver/*"
        element={
          <RequireDriverInfo>
            <MainLayoutDriver>
              <Routes>
                {/* Route mặc định sẽ là trang bản đồ */}
                <Route path="/" element={<MapPage />} />
                <Route path="/map" element={<MapPage />} />
                <Route path="/session" element={<ChargingSessionPage />} />
                <Route path="/history/*" element={<HistoryPage />} />

                {/* Các route con của trang hồ sơ */}
                <Route path="/profile/info" element={<ProfileInfoPage />} />
                <Route path="/profile/vehicle" element={<VehicleInfoPage />} />
                <Route path="/profile/payment" element={<PaymentPage />} />

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
