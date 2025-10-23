import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import "bootstrap-icons/font/bootstrap-icons.css";

// --- NỘI DUNG DÀNH RIÊNG CHO STAFF ---
const NAVIGATION_ITEMS = [
  {
    path: "/overview",
    label: "Tổng quan trạm",
    icon: "bi-bar-chart-line",
  },
  {
    path: "/sessions",
    label: "Quản lý phiên sạc",
    icon: "bi-ev-station",
    
  },
  {
    path: "/maintenance",
    label: "Lịch bảo trì",
    icon: "bi-tools",
  },
  {
    path: "/transactions",
    label: "Giao dịch",
    icon: "bi-wallet2",
  },
  {
    path: "/reports",
    label: "Báo cáo sự cố",
    icon: "bi-file-earmark-text",
  },
];

// --- Đổi tên component thành SidebarStaff ---
const SidebarStaff = () => {
  const isCollapsed = true; // Luôn collapsed, chỉ mở khi hover
  const [isHovered, setIsHovered] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const showExpanded = !isCollapsed || isHovered;

  // --- Sửa logic để khớp với đường dẫn /staff ---
  const isActive = (path) => {
    return (
      location.pathname === `/staff${path}` ||
      (path === "/overview" &&
        (location.pathname === "/staff/" || location.pathname === "/staff"))
    );
  };

  // --- Sửa hàm điều hướng sang /staff ---
  const handleNavigation = (path) => {
    navigate(`/staff${path}`);
  };

  // --- Đổi màu sắc để phân biệt với Admin (xanh lá) ---
  const activeColor = "#198754"; // Bootstrap success color
  const activeBgColor = "#e9f7ef";

  return (
    <div
      className={`sidebar-wrapper ${isCollapsed ? "collapsed" : ""}`}
      style={{
        position: "fixed",
        top: "100px",
        left: "0",
        width: showExpanded ? "260px" : "80px",
        height: "calc(100vh - 100px)",
        backgroundColor: "white",
        transition: "width 0.3s ease",
        zIndex: 1000,
        boxShadow: "2px 0 10px rgba(0,0,0,0.1)",
        borderRight: "1px solid #e5eef4",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={{ padding: "20px 16px 16px 16px" }}>
        {NAVIGATION_ITEMS.map((item) => (
          <div
            key={item.path}
            className={`sidebar-item ${isActive(item.path) ? "active" : ""}`}
            style={{
              width: "100%",
              height: "60px",
              display: "flex",
              alignItems: "center",
              marginBottom: "12px",
              cursor: "pointer",
              padding: showExpanded ? "0 16px" : "0",
              borderRadius: "8px",
              backgroundColor: isActive(item.path) ? activeBgColor : "transparent",
              transition: "all 0.2s ease",
              justifyContent: showExpanded ? "flex-start" : "center",
              position: "relative",
            }}
            onClick={() => handleNavigation(item.path)}
          >
            {/* Icon */}
            <div
              style={{
                fontSize: "20px",
                minWidth: "24px",
                textAlign: "center",
                color: isActive(item.path) ? activeColor : "#666",
              }}
            >
              <i className={`bi ${item.icon}`}></i>
            </div>

            {/* Label */}
            {showExpanded && (
              <span
                style={{
                  marginLeft: "12px",
                  color: isActive(item.path) ? activeColor : "#666",
                  fontWeight: isActive(item.path) ? "600" : "500",
                  fontSize: "16px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                }}
              >
                {item.label}
              </span>
            )}

            {/* Active Indicator */}
            {isActive(item.path) && (
              <div
                style={{
                  position: "absolute",
                  left: "0",
                  width: "4px",
                  height: "40px",
                  backgroundColor: activeColor,
                  borderRadius: "0 4px 4px 0",
                }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SidebarStaff;