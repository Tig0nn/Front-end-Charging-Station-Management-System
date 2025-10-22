import React from "react";
import { Navbar, Container, Nav, NavDropdown } from "react-bootstrap";
import { Link } from "react-router-dom";

export default function Header() {
  return (
    <Navbar bg="white" expand="lg" className="border-bottom shadow-sm" sticky="top">
      <Container fluid>
        <Navbar.Brand as={Link} to="/staff/overview" className="fw-bold">
          <span className="text-success">⚡</span> Staff Panel
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="staff-navbar-nav" />
        <Navbar.Collapse id="staff-navbar-nav">
          <Nav className="ms-auto align-items-center">
            <Nav.Link as={Link} to="/staff/sessions">
              Phiên sạc
            </Nav.Link>
            <Nav.Link as={Link} to="/staff/maintenance">
              Bảo trì
            </Nav.Link>
            <NavDropdown
              title={
                <div className="d-inline-flex align-items-center">
                  <div
                    className="bg-success text-white rounded-circle me-2"
                    style={{ width: "32px", height: "32px", lineHeight: "32px", textAlign: "center" }}
                  >
                    S
                  </div>
                  <span>Staff Name</span>
                </div>
              }
              id="staff-nav-dropdown"
              align="end"
            >
              <NavDropdown.Item as={Link} to="/staff/profile">
                Thông tin cá nhân
              </NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item as={Link} to="/logout" className="text-danger">
                Đăng xuất
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}