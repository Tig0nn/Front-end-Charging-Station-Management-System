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
import AddUserInfoPage from "./Pages/AddUserInfoPage";
import { useAuth } from "./hooks/useAuth";

// Guard nội tuyến: chỉ cho Driver vào khi đã có phone
function RequireDriverInfo({ children }) {
  const { user, isAuthenticated } = useAuth();
  const loc = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: loc }} replace />;
  }

  const role = String(user?.role || "").toUpperCase();
  const hasPhone = !!(user?.phone && String(user.phone).trim());

  if (role === "DRIVER" && !hasPhone && loc.pathname !== "/driver/add-info") {
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

      {/* Trang bổ sung thông tin: để ngoài guard */}
      <Route path="/driver/add-info" element={<AddUserInfoPage />} />

      {/* Admin */}
      <Route
        path="/admin/*"
        element={
          <MainLayoutAdmin>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />

              {/* Stations Routes */}
              <Route path="/stations" element={<StationsList />} />

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

      {/* Driver: bọc bằng guard */}
      <Route
        path="/driver/*"
        element={
          <RequireDriverInfo>
            <MainLayoutDriver>
              <Routes>
                <Route path="/" element={<MapPage />} />
                <Route path="/map" element={<MapPage />} />
                <Route path="/session" element={<ChargingSessionPage />} />
                <Route path="/history" element={<HistoryPage />} />
                <Route path="/profile/info" element={<ProfileInfoPage />} />
                <Route path="/profile/vehicle" element={<VehicleInfoPage />} />
                <Route path="/profile/payment" element={<PaymentPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </MainLayoutDriver>
          </RequireDriverInfo>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
