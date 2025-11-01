import React, { useEffect, useState } from "react";
import { Navbar, Container, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.jsx";
import { staffAPI } from "../../lib/apiServices";
import "bootstrap-icons/font/bootstrap-icons.css";

const Header = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [staffName, setStaffName] = useState("Nhân viên");

  useEffect(() => {
    fetchStaffProfile();
  }, []);

  const fetchStaffProfile = async () => {
    try {
      const response = await staffAPI.getStaffProfile();
      const profileData =
        response.data?.result || response.result || response.data || {};

      setStaffName(profileData.fullName || "Nhân viên");
    } catch (error) {
      console.error("Error fetching staff profile:", error);
      // Fallback to localStorage
      const storedUser = localStorage.getItem("user");
      if (storedUser && storedUser !== "null") {
        const user = JSON.parse(storedUser);
        setStaffName(user.fullName || user.firstName || "Nhân viên");
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Navbar
      fixed="top"
      bg="white"
      className="border-bottom shadow-sm"
      style={{ height: "70px", zIndex: 1000 }}
    >
      <Container fluid className="px-4">
        {/* Logo and Brand */}
        <Navbar.Brand className="d-flex align-items-center gap-2">
          <img
            src="/src/assets/image/logo.png"
            alt="Logo"
            className="rounded"
            style={{
              width: "36px",
              height: "36px",
              objectFit: "cover",
              marginTop: "5px",
            }}
          />
          <span
            style={{
              fontFamily: "Mont-HeavyDEMO, Helvetica, sans-serif",
              fontSize: "25px",
              lineHeight: "normal",
              marginTop: "4px",
              color: "var(--primary-2)",
              fontWeight: "normal",
            }}
          >
            Juudensha
          </span>
        </Navbar.Brand>

        {/* Right Side - User Info & Logout */}
        <div className="d-flex align-items-center gap-3">
          {/* User Name */}
          <div className="d-flex flex-column align-items-end">
            <span
              style={{
                fontSize: "14px",
                fontWeight: "600",
                color: "#111827",
              }}
            >
              {staffName} <span className="text-muted">(Nhân viên)</span>
            </span>
          </div>

          {/* Logout Button */}
          <Button
            variant="link"
            className="text-decoration-none text-dark d-flex align-items-center gap-2"
            onClick={handleLogout}
            style={{
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#dc3545")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#212529")}
          >
            <i
              className="bi bi-box-arrow-right"
              style={{ fontSize: "20px" }}
            ></i>
            <span className="fw-medium">Đăng xuất</span>
          </Button>
        </div>
      </Container>
    </Navbar>
  );
};

export default Header;
