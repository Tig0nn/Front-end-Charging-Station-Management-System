import React from "react";
import {
  Navbar,
  Nav,
  Container,
  NavDropdown,
  Form,
  FormControl,
} from "react-bootstrap";
import { Link, useLocation } from "react-router";
import "./Header.css";

const Header = () => {
  const location = useLocation();

  // Function to get page title based on current route
  const getPageTitle = () => {
    const path = location.pathname;
    switch (path) {
      case "/admin":
      case "/admin/":
      case "/admin/dashboard":
        return "Dashboard";
      case "/admin/stations":
        return "Charging Stations";
      case "/admin/stations/add":
        return "Add Station";
      case "/admin/users":
        return "Users Management";
      case "/admin/reports":
        return "Reports & Analytics";
      default:
        return "Dashboard";
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
            as={Link}
            to="/"
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
          <div
            className="page-title text-primary fw-semibold me-auto d-none d-lg-block"
            style={{
              fontSize: "28px",
              marginTop: "13px",
              marginLeft: "67px",
              color: "var(--primary-2)",
            }}
          >
            {getPageTitle()}
          </div>

          <Navbar.Toggle aria-controls="navbar-nav" className="d-lg-none" />

          <Navbar.Collapse className="justify-content-end" id="navbar-nav">
            <Nav className="d-flex align-items-center gap-3">
              {/* Search Bar */}
              <Form
                className="d-flex position-relative search-container"
                style={{ marginTop: "5px" }}
              >
                <div
                  className="position-relative"
                  style={{ width: "257px", height: "50px" }}
                >
                  <FormControl
                    type="search"
                    placeholder="Search for something"
                    className="border-0 ps-5"
                    style={{
                      backgroundColor: "var(--background-light)",
                      borderRadius: "40px",
                      height: "50px",
                      fontSize: "15px",
                      color: "var(--text-muted)",
                    }}
                  />
                  <div
                    className="position-absolute"
                    style={{
                      top: "15px",
                      left: "25px",
                      width: "20px",
                      height: "20px",
                      backgroundImage: "url(/vector-2.svg)",
                      backgroundSize: "95.7% 95.7%",
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "center",
                    }}
                  />
                </div>
              </Form>
              {/* Settings Icon */}
              <div
                className="d-flex align-items-center justify-content-center rounded-circle d-none d-md-flex"
                style={{
                  width: "50px",
                  height: "50px",
                  backgroundColor: "var(--background-light)",
                  marginTop: "5px",
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    width: "25px",
                    height: "25px",
                    backgroundImage: "url(/vector.svg)",
                    backgroundSize: "100% 100%",
                    backgroundRepeat: "no-repeat",
                  }}
                />
              </div>
              {/* Notification Icon */}
              {/* <img
                className="rounded d-none d-md-block"
                alt="Notifications"
                src="/group3.png"
                style={{
                  width: "50px",
                  height: "50px",
                  marginTop: "5px",
                  cursor: "pointer",
                }}
              /> */}
              {/* User Profile Dropdown */}
              {/* <NavDropdown
                title={
                  <img
                    className="rounded-circle"
                    alt="Profile"
                    src="/maskGroup.png"
                    style={{ width: '60px', height: '60px' }}
                  />
                }
                id="user-dropdown"
                className="border-0"
                drop="down"
              >
                <NavDropdown.Item as={Link} to="/profile">
                  👤 Profile
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/settings">
                  ⚙️ Settings
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item
                  href="#action/logout"
                  className="text-danger"
                >
                  🚪 Logout
                </NavDropdown.Item>
              </NavDropdown> */}
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
