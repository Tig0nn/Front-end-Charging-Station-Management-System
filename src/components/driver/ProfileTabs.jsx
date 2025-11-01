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
      path: "/driver/profile/info",
      label: "Thông tin cá nhân",
      icon: "bi-person",
    },
    {
      id: "vehicle",
      path: "/driver/profile/vehicle",
      label: "Thông tin xe",
      icon: "bi-car-front",
    },
    {
      id: "payment",
      path: "/driver/profile/payment",
      label: "Thanh toán",
      icon: "bi-credit-card",
    },
    {
      id: "notification",
      path: "/driver/profile/notification",
      label: "Thông báo",
      icon: "bi-bell",
    },
  ];

  const isActiveTab = (path) => {
    return location.pathname === path;
  };

  return (
    <div
      className="mb-4"
      style={{
        background: "white",
        borderRadius: "16px",
        padding: "8px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
      }}
    >
      <div className="d-flex gap-2">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant="link"
            className={`d-flex align-items-center gap-2 text-decoration-none border-0 ${
              isActiveTab(tab.path) ? "bg-light" : ""
            }`}
            style={{
              borderRadius: "10px",
              padding: "12px 20px",
              color: isActiveTab(tab.path) ? "#111827" : "#6b7280",
              fontWeight: isActiveTab(tab.path) ? "600" : "500",
              fontSize: "14px",
              transition: "all 0.2s ease",
              flex: 1,
              justifyContent: "center",
            }}
            onClick={() => navigate(tab.path)}
          >
            <i className={`bi ${tab.icon}`} style={{ fontSize: "18px" }}></i>
            <span>{tab.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default ProfileTabs;
