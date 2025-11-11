import React, { useEffect, useState, useRef, useCallback } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Header from "./Header";
import { staffAPI } from "../../lib/apiServices";
import "bootstrap-icons/font/bootstrap-icons.css";

export default function MainLayoutStaff({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const timerRef = useRef(null);

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

  const fetchStaffProfile = useCallback(async () => {
    try {
      console.log("📞 Fetching staff profile...");
      const response = await staffAPI.getStaffProfile();

      const responseData =
        response.data?.result || response.result || response.data || {};

      // Backend returns data inside staffProfile object
      const profileData = responseData.staffProfile || responseData;

      console.log("👤 Staff profile:", profileData);

      setStaffProfile(profileData);

      // Save to localStorage for Header and other components
      localStorage.setItem("staff", JSON.stringify(profileData));

      // Trigger storage event for other components
      window.dispatchEvent(new Event("storage"));
    } catch (error) {
      console.error("❌ Error fetching staff profile:", error);
    }
  }, []);

  const fetchDashboardStats = useCallback(async (showLoadingSpinner = true) => {
    try {
      if (showLoadingSpinner) setLoading(true);
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
      if (showLoadingSpinner) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaffProfile();
    fetchDashboardStats(true); // Tải lần đầu với loading

    // Thiết lập polling mỗi 30 giây cho dashboard stats
    timerRef.current = setInterval(() => {
      console.log("(Polling) Đang tải lại dashboard stats...");
      fetchDashboardStats(false); // Tải lại ngầm
    }, 3000);

    // Cleanup khi unmount
    return () => {
      if (timerRef.current) {
        console.log("Dọn dẹp: Dừng polling MainLayoutStaff.");
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [fetchStaffProfile, fetchDashboardStats]);

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
      icon: "bi-gear-fill",
    },
    {
      path: "/staff/cash-topup",
      label: "Nạp tiền",
      icon: "bi-cash-coin",
    },
    {
      path: "/staff/reports",
      label: "Sự cố",
      icon: "bi-exclamation-triangle-fill",
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
                </span>{" "}
                <button
                  className="d-flex align-items-center gap-2"
                  style={{
                    backgroundColor: "#22c55e",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    padding: "8px 20px",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: loading ? "not-allowed" : "pointer",
                    opacity: loading ? 0.65 : 1,
                  }}
                  onClick={() => fetchDashboardStats(true)}
                  disabled={loading}
                >
                  <i className="bi bi-arrow-clockwise"></i>
                  {loading ? "Đang tải..." : "Làm mới"}
                </button>
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
                    style={{ fontSize: "20px", color: "#2bf0b5" }}
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
                    style={{ fontSize: "20px", color: "#2bf0b5" }}
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
                    style={{ fontSize: "20px", color: "#2bf0b5" }}
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
                    style={{ fontSize: "20px", color: "#2bf0b5" }}
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
        </Row>{" "}
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
        </Row>{" "}
        {/* Dynamic Content */}
        {children}
      </Container>{" "}
      {/* 🎨 Toast Notifications - Hiển thị ở góc phải trên */}
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
            iconTheme: {
              primary: "white",
              secondary: "#10b981",
            },
          },
          error: {
            style: {
              background: "#ef4444",
              color: "white",
            },
            iconTheme: {
              primary: "white",
              secondary: "#ef4444",
            },
          },
        }}
      />
    </div>
  );
}
