import "./App.css";

import { Routes, Route, Navigate } from "react-router-dom";
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

function App() {
  return (
    <Routes>
      {/* Authentication Routes */}
      <Route path="/" element={<EVChargingLanding />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Legacy Admin Route */}

      {/* New Admin Routes with Layout */}
      <Route
        path="/admin/*"
        element={
          <MainLayoutAdmin key={window.location.pathname}>
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
          <MainLayoutDriver key={window.location.pathname}>
            <Routes>
              {/* Route mặc định sẽ là trang bản đồ */}
              <Route path="/" element={<MapPage />} />
              <Route path="/map" element={<MapPage />} />
              <Route
                path="/charging-session"
                element={<ChargingSessionPage />}
              />
              <Route path="/history" element={<HistoryPage />} />

              {/* Các route con của trang hồ sơ */}
              <Route path="/profile/info" element={<ProfileInfoPage />} />
              <Route path="/profile/vehicle" element={<VehicleInfoPage />} />
              <Route path="/profile/payment" element={<PaymentPage />} />

              {/* 404 Page for Driver section */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </MainLayoutDriver>
        }
      />
      {/* Catch all other routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
