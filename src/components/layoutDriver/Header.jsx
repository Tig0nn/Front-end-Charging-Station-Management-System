import React, { useEffect, useState } from "react";
import { Navbar, Container, Button, Badge } from "react-bootstrap";
import { useNavigate } from "react-router";
import { useAuth } from "../../hooks/useAuth.jsx";
import "bootstrap-icons/font/bootstrap-icons.css";

const Header = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [userName, setUserName] = useState("");
  const [batteryLevel] = useState(75); // Default 75%, TODO: Lấy từ API

  useEffect(() => {
    // Lấy tên user từ localStorage - object "user"
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const name =
      user.fullName ||
      user.firstName ||
      user.lastName ||
      user.username ||
      "Tài xế";
    setUserName(name);

    // TODO: Lấy battery level từ API hoặc localStorage nếu có
    // setBatteryLevel(user.batteryLevel || 75);
  }, []);

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
          <i
            className="bi bi-lightning-charge-fill"
            style={{ fontSize: "28px", color: "#f97316" }}
          ></i>
          <span
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              color: "#10b981",
            }}
          >
            EVCharge Manager
          </span>
        </Navbar.Brand>

        {/* Right Side - User Info, Battery & Logout */}
        <div className="d-flex align-items-center gap-3">
          {/* User Name */}
          <span className="text-muted fw-medium">{userName} (Tài xế)</span>

          {/* Battery Level Badge */}
          <Badge
            bg="light"
            text="dark"
            className="d-flex align-items-center gap-1 px-3 py-2"
            style={{
              fontSize: "14px",
              fontWeight: "500",
              border: "1px solid #e5e7eb",
            }}
          >
            <i
              className="bi bi-battery-charging"
              style={{ fontSize: "18px" }}
            ></i>
            <span>{batteryLevel}% SoC</span>
          </Badge>

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
