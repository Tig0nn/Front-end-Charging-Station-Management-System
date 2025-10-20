import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import "bootstrap-icons/font/bootstrap-icons.css";

const NAVIGATION_ITEMS = [
  {
    path: "/dashboard",
    label: "Dashboard",
    icon: "bi-clipboard-data",
  },
  {
    path: "/stations",
    label: "Stations",
    icon: "bi-geo-alt",
  },
  {
    path: "/users",
    label: "Users",
    icon: "bi-person",
  },
  {
    path: "/reports",
    label: "Reports",
    icon: "bi-bar-chart",
  },
];

const Sidebar = () => {
  const isCollapsed = true; // Luôn collapsed, chỉ mở khi hover
  const [isHovered, setIsHovered] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const showExpanded = !isCollapsed || isHovered;

  const isActive = (path) => {
    return (
      location.pathname === `/admin${path}` ||
      (path === "/dashboard" &&
        (location.pathname === "/admin/" || location.pathname === "/admin"))
    );
  };

  const handleNavigation = (path) => {
    navigate(`/admin${path}`);
  };

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
      {/* Bỏ Toggle Button */}

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
              backgroundColor: isActive(item.path) ? "#e3f2fd" : "transparent",
              transition: "all 0.2s ease",
              justifyContent: showExpanded ? "flex-start" : "center",
            }}
            onClick={() => handleNavigation(item.path)}
          >
            {/* Icon */}
            <div
              style={{
                fontSize: "20px",
                minWidth: "24px",
                textAlign: "center",
                color: isActive(item.path) ? "#1976d2" : "#666",
              }}
            >
              <i className={`bi ${item.icon}`}></i>
            </div>

            {/* Label - chỉ hiển thị khi expanded */}
            {showExpanded && (
              <span
                style={{
                  marginLeft: "12px",
                  color: isActive(item.path) ? "#1976d2" : "#666",
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
                  backgroundColor: "#1976d2",
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

export default Sidebar;
