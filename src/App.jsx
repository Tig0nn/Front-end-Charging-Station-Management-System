import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { Routes, Route, Navigate } from "react-router";
import "./App.css";
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
      {/* Redirect root to admin */}
      <Route path="/" element={<Navigate to="/admin" replace />} />

      {/* Admin Routes */}
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
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
