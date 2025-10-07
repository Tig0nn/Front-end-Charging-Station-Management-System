import "./App.css";

import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./Pages/Login";
import Signup from "./Pages/SignUp";
import { MainLayout } from "./components/layoutAdmin";
import { Dashboard, NotFound, Reports, StationsList, UsersList } from "./Pages";
import MockApiTest from "./Pages/MockApiTest";
import EVChargingLanding from "./pages/EVChargingLanding";

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
          <MainLayout>
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
          </MainLayout>
        }
      />

      {/* Catch all other routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
