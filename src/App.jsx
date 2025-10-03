import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { Routes, Route, Navigate } from "react-router-dom"; 
import LoginPage from "./Pages/Login";
import SignupForm from "./Pages/SignUp";
import Navbar from "./Pages/Driver/Home/Navbar";
import { MainLayout } from "./components/layoutAdmin";
import {
  AddStation,
  Dashboard,
  NotFound,
  Reports,
  StationsList,
  UsersList,
} from "./pages";

function App() {
  return (
    <Routes>
      {/* Authentication Routes */}
      <Route path="/" element={<LoginPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupForm />} />
      
      {/* Legacy Admin Route */}
      <Route path="/Admin" element={<Navbar />} />

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
              <Route path="/stations/add" element={<AddStation />} />

              {/* Users Routes */}
              <Route path="/users" element={<UsersList />} />

              {/* Reports Routes */}
              <Route path="/reports" element={<Reports />} />
              <Route path="/reports/*" element={<Reports />} />

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
