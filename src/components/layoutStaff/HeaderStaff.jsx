import React from "react";
import { Navbar, Nav, Container, Button, Dropdown } from "react-bootstrap";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../../hooks/useAuth.jsx";
import "bootstrap-icons/font/bootstrap-icons.css";

const Header = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Get user name from useAuth context first, then fallback to localStorage

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
            <img
              src="/src/assets/image/logo.png" // Đường dẫn đến file ảnh của bạn
              alt="BankDash Logo" // Luôn thêm alt text cho khả năng tiếp cận
              className="rounded" // Giữ lại bo tròn nếu muốn
              style={{
                width: "36px",
                height: "36px",
                objectFit: "cover", // Tương đương với backgroundSize: "cover"
                marginTop: "5px", // Có thể cần điều chỉnh lại margin-top nếu cần
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
                      className="text-muted text-capitalize"
                      style={{ fontSize: "12px" }}
                    >
                      STAFF
                    </span>
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
