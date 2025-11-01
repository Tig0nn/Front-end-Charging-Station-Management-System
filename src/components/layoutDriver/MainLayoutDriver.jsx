import React, { useEffect, useState } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router";
import Header from "./Header";
import "bootstrap-icons/font/bootstrap-icons.css";

const MainLayoutDriver = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userName, setUserName] = useState("");

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
  }, []);

  // Navigation tabs - Driver version (Không có phần Overview)
  const tabs = [
    {
      path: "/driver/map",
      label: "Bản đồ trạm sạc",
      icon: "bi-geo-alt",
    },
    {
      path: "/driver/session",
      label: "Phiên sạc",
      icon: "bi-lightning-charge",
    },
    {
      path: "/driver/history",
      label: "Lịch sử",
      icon: "bi-clock-history",
    },
    {
      path: "/driver/profile",
      label: "Hồ sơ",
      icon: "bi-person-circle",
    },
  ];

  const isActiveTab = (path) => {
    // Check if current path starts with the tab path
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#ffffff" }}>
      {/* Header */}
      <Header />

      {/* Main Content Area */}
      <Container
        fluid
        style={{
          marginTop: "90px",
          paddingBottom: "40px",
          paddingLeft: "32px",
          paddingRight: "32px",
        }}
      >
        {/* Greeting Section - Thay thế Overview */}
        <div className="mb-4">
          {/* Page Title - Greeting */}
          <Row className="mb-4">
            <Col>
              <h1
                className="mb-2"
                style={{
                  fontSize: "28px",
                  fontWeight: "700",
                  color: "#111827",
                }}
              >
                Xin chào, {userName}!
              </h1>
              <p
                className="mb-0"
                style={{
                  color: "#9ca3af",
                  fontSize: "14px",
                }}
              >
                {/* Có thể thêm thông tin xe sau nếu cần: Xe: Tesla Model 3 • Biển số: 30A-12345 */}
              </p>
            </Col>
          </Row>

          {/* Navigation Tabs */}
          <Row className="mb-4">
            <Col>
              <div
                className="d-inline-flex gap-1 p-1 rounded"
                style={{
                  backgroundColor: "#f3f4f6",
                  borderRadius: "8px",
                }}
              >
                {tabs.map((tab) => (
                  <Button
                    key={tab.path}
                    variant="link"
                    className={`d-flex align-items-center gap-2 text-decoration-none border-0 ${
                      isActiveTab(tab.path) ? "bg-white" : ""
                    }`}
                    style={{
                      borderRadius: "6px",
                      padding: "8px 20px",
                      color: isActiveTab(tab.path) ? "#111827" : "#6b7280",
                      fontWeight: isActiveTab(tab.path) ? "600" : "500",
                      fontSize: "14px",
                      boxShadow: isActiveTab(tab.path)
                        ? "0 1px 2px rgba(0,0,0,0.05)"
                        : "none",
                      transition: "all 0.2s ease",
                    }}
                    onClick={() => navigate(tab.path)}
                  >
                    <i
                      className={`bi ${tab.icon}`}
                      style={{ fontSize: "16px" }}
                    ></i>
                    <span>{tab.label}</span>
                  </Button>
                ))}
              </div>
            </Col>
          </Row>
        </div>

        {/* Dynamic Content - No Card Wrapper, Full Width */}
        {children}
      </Container>
    </div>
  );
};

export default MainLayoutDriver;
