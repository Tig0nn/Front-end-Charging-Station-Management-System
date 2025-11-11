import React, { useEffect, useState } from "react";
import { Navbar, Container, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.jsx";
import "bootstrap-icons/font/bootstrap-icons.css";

const Header = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [staffName, setStaffName] = useState("Nhân viên");

  useEffect(() => {
    // Read from localStorage instead of API
    const loadStaffProfile = () => {
      const storedStaff = localStorage.getItem("staff");
      if (storedStaff && storedStaff !== "null") {
        try {
          const staff = JSON.parse(storedStaff);
          setStaffName(staff.fullName || staff.fullname || "Nhân viên");
        } catch (error) {
          console.error("Error parsing staff from localStorage:", error);
          setStaffName("Nhân viên");
        }
      }
    };

    loadStaffProfile();

    // Listen for storage updates from MainLayoutStaff
    window.addEventListener("storage", loadStaffProfile);

    return () => {
      window.removeEventListener("storage", loadStaffProfile);
    };
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
              color: "#22c55e",
              fontWeight: "bold",
            }}
          >
            T-Green
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
