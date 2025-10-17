import React from "react";
import { Navbar, Nav, Container, Button, Dropdown } from "react-bootstrap";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../../hooks/useAuth.jsx";
import "./Header.css";
import { getCurrentRole } from "../../lib/auth.js";
import "bootstrap-icons/font/bootstrap-icons.css";

const Header = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Get user name from useAuth context first, then fallback to localStorage
  const getUserName = () => {
    // First try to get from useAuth context
    if (user?.fullName) return user.fullName;
    if (user?.firstName && user?.lastName)
      return `${user.firstName} ${user.lastName}`;
    if (user?.firstName) return user.firstName;
    if (user?.name) return user.name;
    if (user?.email) return user.email.split("@")[0]; // Get username part of email

    // Fallback to localStorage
    try {
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      if (storedUser.fullName) return storedUser.fullName;
      if (storedUser.firstName && storedUser.lastName)
        return `${storedUser.firstName} ${storedUser.lastName}`;
      if (storedUser.firstName) return storedUser.firstName;
      if (storedUser.name) return storedUser.name;
      if (storedUser.email) return storedUser.email.split("@")[0];

      // Default fallback
      return "User";
    } catch {
      return "User";
    }
  };

  // Get user role from useAuth context first, then fallback to localStorage
  const getUserRole = () => {
    // First try to get from useAuth context
    if (user?.role) return user.role;

    // Fallback to localStorage
    try {
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      return storedUser.role || getCurrentRole() || "User";
    } catch {
      return getCurrentRole() || "User";
    }
  };
  return (
    <div className="relative w-full h-[101px]">
      <Navbar
        className="header-navbar fixed-top p-0"
        style={{ height: "101px", width: "100%" }}
      >
        {/* White background bar */}
        <div
          className="position-absolute top-0 start-0 bg-white"
          style={{ width: "100%", height: "100px", zIndex: 1 }}
        />

        <Container
          fluid
          className="position-relative d-flex align-items-center px-4"
          style={{ height: "60px", marginTop: "20px", zIndex: 2 }}
        >
          {/* Logo and Brand */}
          <Navbar.Brand
            className="d-flex align-items-center gap-2 me-4"
            style={{ marginTop: "11px" }}
          >
            <div
              className="bg-primary rounded"
              style={{
                width: "36px",
                height: "36px",
                backgroundImage: "url(/iconfinder-vector-65-09-473792-1.png)",
                backgroundSize: "cover",
                backgroundPosition: "50% 50%",
                backgroundColor: "var(--primary-color)",
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
              BankDash.
            </span>
          </Navbar.Brand>

          {/* Page Title */}

          <Navbar.Toggle aria-controls="navbar-nav" className="d-lg-none" />

          <Navbar.Collapse className="justify-content-end" id="navbar-nav">
            <Nav className="d-flex align-items-center gap-3">
              {/* User Info and Logout */}
              <div className="d-flex align-items-center gap-3">
                {/* User Profile Card */}
                <div
                  className="d-flex align-items-center gap-2 bg-light rounded-pill px-3 py-2 d-none d-md-flex"
                  style={{ marginTop: "5px" }}
                >
                  {/* User Info */}
                  <div
                    className="d-flex flex-column"
                    style={{ lineHeight: "1.2" }}
                  >
                    <span
                      className="text-dark fw-medium"
                      style={{ fontSize: "14px" }}
                    >
                      {getUserName()}
                    </span>
                    <span className="text-muted" style={{ fontSize: "12px" }}>
                      {getUserRole()}
                    </span>
                  </div>
                </div>

                {/* Mobile User Info */}
                <div className="d-flex d-md-none align-items-center gap-2">
                  <div
                    className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white fw-bold"
                    style={{
                      width: "28px",
                      height: "28px",
                      fontSize: "12px",
                      marginTop: "5px",
                    }}
                  >
                    {getUserName().charAt(0).toUpperCase()}
                  </div>
                </div>

                {/* Logout Button */}
                <button className="logout-button" onClick={handleLogout}>
                  <i className="bi bi-box-arrow-right"></i>
                  <span>Đăng xuất</span>
                </button>
              </div>
            </Nav>
          </Navbar.Collapse>
        </Container>

        {/* Bottom Border Line */}
        <div
          className="position-absolute bottom-border d-none d-lg-block"
          style={{
            top: "100px",
            left: "250px",
            width: "1190px",
            height: "1px",
            backgroundColor: "var(--border-light)",
            zIndex: 1,
          }}
        />
      </Navbar>
    </div>
  );
};

export default Header;
