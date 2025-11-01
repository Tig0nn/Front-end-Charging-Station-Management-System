import React, { useEffect, useState } from "react";
import { Container, Row, Col, Button, Card } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "./Header";
import { staffAPI } from "../../lib/apiServices";
import "bootstrap-icons/font/bootstrap-icons.css";

export default function MainLayoutStaff({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Staff profile data
  const [staffProfile, setStaffProfile] = useState(null);

  // Stats data
  const [stats, setStats] = useState({
    activePoints: 0,
    totalPoints: 0,
    todaySessions: 0,
    todayRevenue: 0,
    avgTime: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStaffProfile();
    fetchDashboardStats();
  }, []);

  const fetchStaffProfile = async () => {
    try {
      console.log("📞 Fetching staff profile...");
      const response = await staffAPI.getStaffProfile();

      const profileData =
        response.data?.result || response.result || response.data || {};
      console.log("👤 Staff profile:", profileData);

      setStaffProfile(profileData);
    } catch (error) {
      console.error("❌ Error fetching staff profile:", error);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await staffAPI.getStaffDashboard();

      const data =
        response.data?.result || response.result || response.data || {};

      // Update staff profile from dashboard API
      if (data.stationId) {
        setStaffProfile({
          stationId: data.stationId,
          stationName: data.stationName,
          stationAddress: data.stationAddress,
        });
      }

      setStats({
        activePoints: data.availablePoints || 0,
        chargingPoints: data.chargingPoints || 0,
        offlinePoints: data.offlinePoints || 0,
        totalPoints: data.totalChargingPoints || 0,
        todaySessions: data.todaySessionsCount || 0,
        todayRevenue: data.todayRevenue || 0,
        avgTime: Math.round(data.averageSessionDuration || 0),
      });
    } catch (error) {
      console.error("Error fetching staff dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  // Format số tiền
  const formatRevenue = (value) => {
    if (value === 0) return "0đ";
    if (value >= 1000000) {
      return `${value.toFixed(1)}đ`;
    }
    if (value >= 1000) {
      return `${Number(value)
        .toFixed(0)
        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}đ`;
    }
    return `${value}đ`;
  };

  // Navigation tabs
  const tabs = [
    {
      path: "/staff/station",
      label: "Điểm sạc",
      icon: "bi-gear",
    },
    {
      path: "/staff/transactions",
      label: "Giao dịch",
      icon: "bi-currency-dollar",
    },
    {
      path: "/staff/payment-requests",
      label: "Sự cố",
      icon: "bi-exclamation-triangle",
    },
    {
      path: "/staff/reports",
      label: "Report",
      icon: "bi-file-text",
    },
  ];

  const isActiveTab = (path) => {
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
        {/* Station Info Header - Hiển thị trạm được gán */}
        {staffProfile && staffProfile.stationId && (
          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h2
                  className="mb-1"
                  style={{
                    fontSize: "24px",
                    fontWeight: "700",
                    color: "#111827",
                  }}
                >
                  Trạm sạc: {staffProfile.stationName}
                </h2>
                <p className="mb-0 text-muted" style={{ fontSize: "14px" }}>
                  {staffProfile.stationAddress}
                </p>
              </div>
              <div className="d-flex align-items-center gap-3">
                <span
                  style={{
                    backgroundColor: "#f3f4f6",
                    color: "#111827",
                    padding: "8px 16px",
                    fontSize: "14px",
                    fontWeight: "600",
                    borderRadius: "8px",
                    display: "inline-block",
                    minWidth: "140px",
                    textAlign: "center",
                  }}
                >
                  {stats.activePoints}/{stats.totalPoints} hoạt động
                </span>
                <Button
                  variant="dark"
                  className="d-flex align-items-center gap-2"
                  style={{
                    borderRadius: "8px",
                    padding: "8px 20px",
                    fontSize: "14px",
                    fontWeight: "600",
                  }}
                  onClick={() => window.location.reload()}
                >
                  <i className="bi bi-arrow-clockwise"></i>
                  Làm mới
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Stats Overview Section */}
        <Row className="g-3 mb-4">
          {/* Điểm sạc hoạt động */}
          <Col xs={12} sm={6} lg={3}>
            <Card
              className="border-0 h-100"
              style={{
                borderRadius: "12px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                border: "1px solid #e5e7eb",
              }}
            >
              <Card.Body className="p-3">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <i
                    className="bi bi-activity"
                    style={{ fontSize: "20px", color: "#10b981" }}
                  ></i>
                  <span className="text-muted" style={{ fontSize: "13px" }}>
                    Điểm sạc hoạt động
                  </span>
                </div>
                <h3
                  className="mb-0"
                  style={{
                    fontSize: "28px",
                    fontWeight: "700",
                    color: "#111827",
                  }}
                >
                  {loading
                    ? "..."
                    : `${stats.activePoints}/${stats.totalPoints}`}
                </h3>
              </Card.Body>
            </Card>
          </Col>

          {/* Phiên sạc hôm nay */}
          <Col xs={12} sm={6} lg={3}>
            <Card
              className="border-0 h-100"
              style={{
                borderRadius: "12px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                border: "1px solid #e5e7eb",
              }}
            >
              <Card.Body className="p-3">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <i
                    className="bi bi-people"
                    style={{ fontSize: "20px", color: "#3b82f6" }}
                  ></i>
                  <span className="text-muted" style={{ fontSize: "13px" }}>
                    Phiên sạc hôm nay
                  </span>
                </div>
                <h3
                  className="mb-0"
                  style={{
                    fontSize: "28px",
                    fontWeight: "700",
                    color: "#111827",
                  }}
                >
                  {loading ? "..." : stats.todaySessions}
                </h3>
              </Card.Body>
            </Card>
          </Col>

          {/* Doanh thu hôm nay */}
          <Col xs={12} sm={6} lg={3}>
            <Card
              className="border-0 h-100"
              style={{
                borderRadius: "12px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                border: "1px solid #e5e7eb",
              }}
            >
              <Card.Body className="p-3">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <i
                    className="bi bi-currency-dollar"
                    style={{ fontSize: "20px", color: "#10b981" }}
                  ></i>
                  <span className="text-muted" style={{ fontSize: "13px" }}>
                    Doanh thu hôm nay
                  </span>
                </div>
                <h3
                  className="mb-0"
                  style={{
                    fontSize: "28px",
                    fontWeight: "700",
                    color: "#111827",
                  }}
                >
                  {loading ? "..." : formatRevenue(stats.todayRevenue)}
                </h3>
              </Card.Body>
            </Card>
          </Col>

          {/* Thời gian TB */}
          <Col xs={12} sm={6} lg={3}>
            <Card
              className="border-0 h-100"
              style={{
                borderRadius: "12px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                border: "1px solid #e5e7eb",
              }}
            >
              <Card.Body className="p-3">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <i
                    className="bi bi-clock"
                    style={{ fontSize: "20px", color: "#8b5cf6" }}
                  ></i>
                  <span className="text-muted" style={{ fontSize: "13px" }}>
                    Thời gian TB
                  </span>
                </div>
                <h3
                  className="mb-0"
                  style={{
                    fontSize: "28px",
                    fontWeight: "700",
                    color: "#111827",
                  }}
                >
                  {loading ? "..." : `${stats.avgTime} phút`}
                </h3>
              </Card.Body>
            </Card>
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

        {/* Dynamic Content */}
        {children}
      </Container>
    </div>
  );
}
