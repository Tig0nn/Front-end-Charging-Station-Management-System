import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Spinner,
  Dropdown,
} from "react-bootstrap";
import { useNavigate, useLocation } from "react-router";
import Header from "./Header";
import { systemOverviewAPI } from "../../lib/apiServices.js";
import "bootstrap-icons/font/bootstrap-icons.css";

const MainLayoutAdmin = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch overview data
  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const res = await systemOverviewAPI.getOverview();
        if (res.data.code === 1000) {
          setOverview(res.data.result);
        }
      } catch (err) {
        console.error("Fetch overview failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOverview();
  }, []);
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount || 0);
  };

  // Format number - default 0 nếu chưa có data
  const formatNumber = (num) => {
    if (num === null || num === undefined) return "0";
    return new Intl.NumberFormat("vi-VN").format(num);
  };

  // Navigation tabs
  const tabs = [
    { path: "/admin/reports", label: "Phân tích", icon: "bi-graph-up" },
    { path: "/admin/stations", label: "Trạm sạc", icon: "bi-geo-alt" },
    { path: "/admin/users", label: "Người dùng", icon: "bi-people" },
    {
      path: "/admin/incidents",
      label: "Sự cố",
      icon: "bi-exclamation-triangle",
    },
    {
      path: "/admin/qr-codes",
      label: "Mã QR",
      icon: "bi-qr-code",
    },
  ];

  const isActiveTab = (path) => location.pathname === path;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#ffffff" }}>
      {/* Header */}
      <Header />

      {/* Main Content Area - Margin-top để tránh header đè (70px header + 20px spacing) */}
      <Container
        fluid
        style={{
          marginTop: "90px",
          paddingBottom: "40px",
          paddingLeft: "32px",
          paddingRight: "32px",
        }}
      >
        {/* Overview Section - Always Visible */}
        <div className="mb-4">
          {/* Page Title */}
          <Row className="mb-4">
            <Col>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h2 className="mb-1">
                    <i className="bi bi-speedometer2 me-2"></i>
                    Tổng quan hệ thống
                  </h2>
                  <p
                    className="mb-0"
                    style={{
                      color: "#9ca3af",
                      fontSize: "14px",
                    }}
                  >
                    Quản trị trung tâm EVCharge - Lê Quang Cường
                  </p>
                </div>
              </div>
            </Col>
          </Row>

          {/* Stats Cards */}
          {loading ? (
            <Row className="g-4 mb-4">
              {[1, 2, 3, 4].map((i) => (
                <Col md={6} lg={3} key={i}>
                  <Card
                    className="h-100 border-0"
                    style={{
                      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                      borderRadius: "12px",
                    }}
                  >
                    <Card.Body className="p-4">
                      <div className="placeholder-glow">
                        <div className="placeholder col-6 mb-3"></div>
                        <div
                          className="placeholder col-8"
                          style={{ height: "40px" }}
                        ></div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <Row className="g-4 mb-4">
              {/* Card 1: Tổng trạm sạc */}
              <Col md={6} lg={3}>
                <Card
                  className="h-100 border-0"
                  style={{
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    borderRadius: "12px",
                  }}
                >
                  <Card.Body className="p-4">
                    <div className="d-flex align-items-start gap-2 mb-3">
                      <i
                        className="bi bi-geo-alt"
                        style={{
                          fontSize: "22px",
                          color: "#3b82f6",
                          marginTop: "2px",
                        }}
                      ></i>
                      <span
                        className="text-muted"
                        style={{
                          fontSize: "13px",
                          fontWeight: "500",
                        }}
                      >
                        Tổng trạm sạc
                      </span>
                    </div>
                    <h2
                      className="mb-0"
                      style={{
                        fontSize: "42px",
                        fontWeight: "700",
                        lineHeight: "1",
                      }}
                    >
                      {formatNumber(overview?.totalStations || 0)}
                    </h2>
                  </Card.Body>
                </Card>
              </Col>

              {/* Card 2: Điểm sạc hoạt động */}
              <Col md={6} lg={3}>
                <Card
                  className="h-100 border-0"
                  style={{
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    borderRadius: "12px",
                  }}
                >
                  <Card.Body className="p-4">
                    <div className="d-flex align-items-start gap-2 mb-3">
                      <i
                        className="bi bi-lightning-charge-fill"
                        style={{
                          fontSize: "22px",
                          color: "#10b981",
                          marginTop: "2px",
                        }}
                      ></i>
                      <span
                        className="text-muted"
                        style={{
                          fontSize: "13px",
                          fontWeight: "500",
                        }}
                      >
                        Điểm sạc hoạt động
                      </span>
                    </div>
                    <h2
                      className="mb-0"
                      style={{
                        fontSize: "42px",
                        fontWeight: "700",
                        lineHeight: "1",
                      }}
                    >
                      {formatNumber(overview?.activeChargingPoints || 0)}/
                      {formatNumber(overview?.totalChargingPoints || 0)}
                    </h2>
                  </Card.Body>
                </Card>
              </Col>

              {/* Card 3: Tổng người dùng */}
              <Col md={6} lg={3}>
                <Card
                  className="h-100 border-0"
                  style={{
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    borderRadius: "12px",
                  }}
                >
                  <Card.Body className="p-4">
                    <div className="d-flex align-items-start gap-2 mb-3">
                      <i
                        className="bi bi-people-fill"
                        style={{
                          fontSize: "22px",
                          color: "#a855f7",
                          marginTop: "2px",
                        }}
                      ></i>
                      <span
                        className="text-muted"
                        style={{
                          fontSize: "13px",
                          fontWeight: "500",
                        }}
                      >
                        Tổng người dùng
                      </span>
                    </div>
                    <h2
                      className="mb-0"
                      style={{
                        fontSize: "42px",
                        fontWeight: "700",
                        lineHeight: "1",
                      }}
                    >
                      {formatNumber(overview?.totalDrivers || 0)}
                    </h2>
                  </Card.Body>
                </Card>
              </Col>

              {/* Card 4: Doanh thu tháng */}
              <Col md={6} lg={3}>
                <Card
                  className="h-100 border-0"
                  style={{
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    borderRadius: "12px",
                  }}
                >
                  <Card.Body className="p-4">
                    <div className="d-flex align-items-start gap-2 mb-3">
                      <i
                        className="bi bi-currency-dollar"
                        style={{
                          fontSize: "22px",
                          color: "#10b981",
                          marginTop: "2px",
                        }}
                      ></i>
                      <span
                        className="text-muted"
                        style={{
                          fontSize: "13px",
                          fontWeight: "500",
                        }}
                      >
                        Doanh thu tháng
                      </span>
                    </div>
                    <div className="d-flex align-items-baseline gap-2">
                      <h2
                        className="mb-0"
                        style={{
                          fontSize: "42px",
                          fontWeight: "700",
                          color: "#10b981",
                          lineHeight: "1",
                        }}
                      >
                        {overview?.currentMonthRevenue >= 1000000
                          ? `${(overview.currentMonthRevenue / 1000000).toFixed(
                              1
                            )}M`
                          : formatCurrency(overview?.currentMonthRevenue)}
                      </h2>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}

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

export default MainLayoutAdmin;
