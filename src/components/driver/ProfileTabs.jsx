import React from "react";
import { Button } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import "bootstrap-icons/font/bootstrap-icons.css";

const ProfileTabs = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    {
      id: "info",
      path: "info",
      label: "Thông tin cá nhân",
      icon: "bi-person",
    },
    {
      id: "vehicle",
      path: "vehicle",
      label: "Thông tin xe",
      icon: "bi-car-front",
    },
    {
      id: "payment",
      path: "payment",
      label: "Thanh toán",
      icon: "bi-credit-card",
    },
    {
      id: "booking",
      path: "booking",
      label: "Đặt chỗ",
      icon: "bi-calendar-check",
    },
  ];

  const isActiveTab = (path) => {
    return location.pathname === path;
  };

  return (
    <div
      className="mb-4"
      style={{
        background: "#f8fafc",
        borderRadius: "40px",
        padding: "4px 6px", // giảm padding tổng thể
        border: "1px solid #e2e8f0",
        boxShadow: "0 2px 4px rgba(0,0,0,0.04)",
        display: "inline-flex", // thu gọn khung theo nội dung
      }}
    >
      <div className="d-flex gap-1 flex-wrap justify-content-center">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant="link"
            className="d-flex align-items-center gap-2 text-decoration-none border-0"
            style={{
              borderRadius: "40px",
              padding: "8px 16px", // giảm padding ngang
              fontSize: "14px",
              fontWeight: isActiveTab(`/driver/profile/${tab.path}`)
                ? "600"
                : "500",
              color: isActiveTab(`/driver/profile/${tab.path}`)
                ? "#ffffff"
                : "#64748b",
              backgroundColor: isActiveTab(`/driver/profile/${tab.path}`)
                ? "#22c55e"
                : "transparent",
              boxShadow: isActiveTab(`/driver/profile/${tab.path}`)
                ? "0 4px 6px rgba(34, 197, 94, 0.25)"
                : "none",
              transform: isActiveTab(`/driver/profile/${tab.path}`)
                ? "translateY(-1px)"
                : "translateY(0)",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              whiteSpace: "nowrap",
              cursor: "pointer",
              outline: "none",
              WebkitTapHighlightColor: "transparent",
            }}
            onMouseEnter={(e) => {
              if (!isActiveTab(`/driver/profile/${tab.path}`)) {
                e.currentTarget.style.backgroundColor = "#e2e8f0";
                e.currentTarget.style.color = "#334155";
              }
            }}
            onMouseLeave={(e) => {
              if (!isActiveTab(`/driver/profile/${tab.path}`)) {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "#64748b";
              }
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
            onMouseUp={(e) => {
              if (isActiveTab(`/driver/profile/${tab.path}`)) {
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow =
                  "0 4px 6px rgba(34, 197, 94, 0.25)";
              }
            }}
            onClick={() => navigate(`/driver/profile/${tab.path}`)}
          >
            <i className={`bi ${tab.icon}`} style={{ fontSize: "16px" }}></i>
            <span>{tab.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default ProfileTabs;
