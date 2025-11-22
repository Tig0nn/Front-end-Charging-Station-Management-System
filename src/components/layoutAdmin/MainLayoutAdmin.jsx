import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Spinner, Dropdown } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router";
import { Toaster } from "react-hot-toast";
import Header from "./Header";
import { systemOverviewAPI, usersAPI } from "../../lib/apiServices.js";
import "bootstrap-icons/font/bootstrap-icons.css";

const MainLayoutAdmin = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adminProfile, setAdminProfile] = useState(null);

  // Fetch admin profile
  useEffect(() => {
    const fetchAdminProfile = async () => {
      try {
        const res = await usersAPI.getProfile();

        // Backend trả về: { code: 1000, result: { role: "ADMIN", adminProfile: {...} } }
        const resultData = res.data?.result || res.result;
        const profileData = resultData?.adminProfile || resultData;

        setAdminProfile(profileData);
      } catch (err) {
        console.error("Fetch admin profile failed:", err);
      }
    };
    fetchAdminProfile();
  }, []);

  // Fetch overview data
  const fetchOverview = async () => {
    try {
      setLoading(true);
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

  useEffect(() => {
    fetchOverview();
  }, []);

  // Format number - default 0 nếu chưa có data
  const formatNumber = (num) => {
    if (num === null || num === undefined) return "0";
    return new Intl.NumberFormat("vi-VN").format(num);
  };
  // Navigation tabs
  const tabs = [
    { path: "/admin/reports", label: "Phân tích", icon: "bi-graph-up" },
    { path: "/admin/stations", label: "Trạm sạc", icon: "bi-geo-alt-fill" },
    {
      path: "/admin/charging-points",
      label: "Trụ sạc",
      icon: "bi-ev-station-fill",
    },
    { path: "/admin/users", label: "Tài xế và gói thuê bao", icon: "bi-people-fill" },
    { path: "/admin/staffs", label: "Nhân viên", icon: "bi-person-badge-fill" },
    {
      path: "/admin/incidents",
      label: "Sự cố",
      icon: "bi-exclamation-triangle-fill",
    },
    {
      path: "/admin/qr-codes",
      label: "Mã QR",
      icon: "bi-qr-code",
    },
    {
      path: "/admin/vehicle-approvals",
      label: "Duyệt xe",
      icon: "bi-car-front-fill",
    },
  ];

  const isActiveTab = (path) => location.pathname === path;
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#ffffff" }}>
      {/* Toaster for toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            minWidth: "350px",
            padding: "16px",
            fontSize: "14px",
            fontWeight: "500",
          },
          success: {
            style: {
              background: "#10b981",
              color: "white",
            },
          },
          error: {
            style: {
              background: "#ef4444",
              color: "white",
            },
          },
        }}
      />

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
                    Quản trị T-Green - {adminProfile?.fullName || "Admin"}
                  </p>
                </div>
                <button
                  onClick={fetchOverview}
                  disabled={loading}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "10px 20px",
                    backgroundColor: "#22c55e",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: loading ? "not-allowed" : "pointer",
                    opacity: loading ? 0.7 : 1,
                    transition: "all 0.2s",
                    boxShadow: "0 2px 4px rgba(34, 197, 94, 0.2)",
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      e.currentTarget.style.backgroundColor = "#16a34a";
                      e.currentTarget.style.transform = "translateY(-1px)";
                      e.currentTarget.style.boxShadow =
                        "0 4px 6px rgba(34, 197, 94, 0.3)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loading) {
                      e.currentTarget.style.backgroundColor = "#22c55e";
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow =
                        "0 2px 4px rgba(34, 197, 94, 0.2)";
                    }
                  }}
                >
                  {loading ? (
                    <>
                      <Spinner
                        animation="border"
                        size="sm"
                        style={{ width: "16px", height: "16px" }}
                      />
                      <span>Đang tải...</span>
                    </>
                  ) : (
                    <>
                      <i
                        className="bi bi-arrow-clockwise"
                        style={{ fontSize: "16px" }}
                      ></i>
                      <span>Làm mới</span>
                    </>
                  )}
                </button>
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
                          color: "#22c55e",
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
                          color: "#22c55e",
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
                          color: "#22c55e",
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
                          color: "#22c55e",
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
                          color: "#22c55e",
                          lineHeight: "1",
                        }}
                      >
                        {Math.trunc(
                          Number(overview?.currentMonthRevenue || 0)
                        ).toLocaleString("vi-VN")}
                        ₫
                      </h2>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}{" "}
          {/* Navigation Tabs - Modern Pill Style */}
          <Row className="mb-4">
            <Col>
              <div
                style={{
                  display: "inline-flex",
                  gap: "8px",
                  padding: "8px",
                  backgroundColor: "#f8fafc",
                  borderRadius: "50px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.04)",
                }}
              >
                {tabs.map((tab) => (
                  <button
                    key={tab.path}
                    className="nav-pill-button"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      borderRadius: "50px",
                      padding: "8px 20px",
                      fontSize: "14px",
                      fontWeight: isActiveTab(tab.path) ? "600" : "500",
                      border: "none",
                      background: isActiveTab(tab.path)
                        ? "#22c55e"
                        : "transparent",
                      color: isActiveTab(tab.path) ? "#ffffff" : "#64748b",
                      cursor: "pointer",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      transform: isActiveTab(tab.path)
                        ? "translateY(-1px)"
                        : "translateY(0)",
                      boxShadow: isActiveTab(tab.path)
                        ? "0 4px 6px rgba(34, 197, 94, 0.25)"
                        : "none",
                      whiteSpace: "nowrap",
                      outline: "none",
                      textDecoration: "none",
                      WebkitTapHighlightColor: "transparent",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActiveTab(tab.path)) {
                        e.currentTarget.style.backgroundColor = "#e2e8f0";
                        e.currentTarget.style.color = "#334155";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActiveTab(tab.path)) {
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.color = "#64748b";
                      }
                    }}
                    onMouseDown={(e) => {
                      e.currentTarget.style.color = isActiveTab(tab.path)
                        ? "#ffffff"
                        : "#64748b";
                    }}
                    onClick={() => navigate(tab.path)}
                  >
                    <i
                      className={`bi ${tab.icon}`}
                      style={{ fontSize: "16px" }}
                    ></i>
                    <span>{tab.label}</span>
                  </button>
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
