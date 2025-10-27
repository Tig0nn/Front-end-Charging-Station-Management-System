// UserSidebar.js
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "bootstrap-icons/font/bootstrap-icons.css";

// ---== PHẦN CẦN CẬP NHẬT BẮT ĐẦU TỪ ĐÂY ==---
const USER_NAVIGATION_ITEMS = [
  {
    path: "/driver/map",
    label: "Bản đồ trạm sạc",
    icon: "bi-geo-alt",
  },
  {
    path: "/driver/session/:sessionId",
    label: "Phiên sạc",
    icon: "bi-lightning-charge",
  },
  {
    // <-- BƯỚC 1: BỎ 'path' VÀ THÊM 'subItems' CHO LỊCH SỬ
    label: "Lịch sử",
    icon: "bi-clock-history",
    subItems: [
      {
        path: "/driver/history/transactions",
        label: "Giao dịch",
        icon: "bi-arrow-left-right", // Icon cho giao dịch
      },
      {
        path: "/driver/history/analysis",
        label: "Phân tích",
        icon: "bi-pie-chart", // Icon cho phân tích
      },
      {
        path: "/driver/history/habits",
        label: "Thói quen",
        icon: "bi-activity", // Icon cho thói quen/mô hình
      },
    ],
  },
  {
    label: "Hồ sơ",
    icon: "bi-person-circle",
    subItems: [
      {
        path: "/driver/profile/info",
        label: "Thông tin cá nhân",
        icon: "bi-person",
      },
      {
        path: "/driver/profile/vehicle",
        label: "Thông tin xe",
        icon: "bi-car-front",
      },
      {
        path: "/driver/profile/payment",
        label: "Thanh toán",
        icon: "bi-credit-card",
      },
    ],
  },
];
// ---== KẾT THÚC PHẦN CẬP NHẬT ==---

const UserSidebar = () => {
  const isCollapsed = true;
  const [isHovered, setIsHovered] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState({});

  const location = useLocation();
  const navigate = useNavigate();

  const showExpanded = !isCollapsed || isHovered;

  useEffect(() => {
    const activeParent = USER_NAVIGATION_ITEMS.find((item) =>
      item.subItems?.some((sub) => location.pathname === sub.path)
    );
    if (activeParent) {
      setOpenDropdowns((prev) => ({ ...prev, [activeParent.label]: true }));
    }
  }, [location.pathname]);

  const isActive = (path) => {
    return location.pathname === path;
  };

  const isParentActive = (item) => {
    return item.subItems && item.subItems.some((sub) => isActive(sub.path));
  };

  const handleItemClick = (item) => {
    if (item.path) {
      navigate(item.path);
    } else if (item.subItems) {
      setOpenDropdowns((prev) => ({
        ...prev,
        [item.label]: !prev[item.label],
      }));
    }
  };

  const renderSidebarItem = (item, isSubItem = false) => {
    const active = isActive(item.path) || (!isSubItem && isParentActive(item));

    return (
      <div
        key={item.label}
        className={`sidebar-item ${active ? "active" : ""}`}
        style={{
          width: "100%",
          minHeight: "50px",
          display: "flex",
          alignItems: "center",
          marginBottom: "10px",
          cursor: "pointer",
          padding: showExpanded
            ? isSubItem
              ? "0 16px 0 30px"
              : "0 16px"
            : "0",
          borderRadius: "8px",
          backgroundColor: active ? "#e3f2fd" : "transparent",
          transition: "all 0.2s ease",
          justifyContent: showExpanded ? "flex-start" : "center",
          position: "relative",
          userSelect: "none",
        }}
        onClick={() => handleItemClick(item)}
      >
        <div
          style={{
            fontSize: "20px",
            minWidth: "24px",
            textAlign: "center",
            color: active ? "#1976d2" : "#666",
          }}
        >
          <i className={`bi ${item.icon}`}></i>
        </div>
        {showExpanded && (
          <span
            style={{
              marginLeft: "16px",
              color: active ? "#1976d2" : "#666",
              fontWeight: active ? "600" : "500",
              fontSize: "16px",
              whiteSpace: "nowrap",
              overflow: "hidden",
              flexGrow: 1,
            }}
          >
            {item.label}
          </span>
        )}
        {showExpanded && item.subItems && (
          <i
            className={`bi bi-chevron-down`}
            style={{
              marginLeft: "auto",
              transition: "transform 0.3s ease",
              transform: openDropdowns[item.label]
                ? "rotate(180deg)"
                : "rotate(0deg)",
              color: active ? "#1976d2" : "#666",
            }}
          ></i>
        )}
        {active && !isSubItem && (
          <div
            style={{
              position: "absolute",
              left: "0",
              width: "4px",
              height: "32px",
              backgroundColor: "#1976d2",
              borderRadius: "0 4px 4px 0",
            }}
          />
        )}
      </div>
    );
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
      <div className="sidebar-content" style={{ padding: "20px 16px" }}>
        {USER_NAVIGATION_ITEMS.map((item) => (
          <React.Fragment key={item.label}>
            {renderSidebarItem(item)}
            {item.subItems && openDropdowns[item.label] && showExpanded && (
              <div style={{ marginTop: "5px", marginBottom: "10px" }}>
                {item.subItems.map((subItem) =>
                  renderSidebarItem(subItem, true)
                )}
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default UserSidebar;
