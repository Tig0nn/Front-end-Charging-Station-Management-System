import React from "react";
import { NavLink } from "react-router-dom";
import "bootstrap-icons/font/bootstrap-icons.css";

const ProfileTabs = () => {
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
      label: "Gói thuê bao",
      icon: "bi-credit-card",
    },
  ];

  return (
    <div
      className="inline-flex gap-2 p-2 mb-4"
      style={{
        backgroundColor: "#f8fafc",
        borderRadius: "50px",
        border: "1px solid #e2e8f0",
        boxShadow: "0 2px 4px rgba(0,0,0,0.04)",
      }}
    >
      {tabs.map((tab) => (
        <NavLink
          key={`/driver/profile/${tab.path}`}
          to={`/driver/profile/${tab.path}`}
          className={({ isActive }) =>
            `inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ease-in-out !no-underline select-none ${
              isActive
                ? "!bg-green-500 !text-white !shadow-md !-translate-y-[1px]"
                : "!bg-transparent !text-slate-500 hover:!bg-slate-200 hover:!text-slate-700"
            }`
          }
          style={{
            border: "none",
            outline: "none",
            WebkitTapHighlightColor: "transparent",
          }}
        >
          <i className={`bi ${tab.icon}`} style={{ fontSize: "16px" }}></i>
          <span>{tab.label}</span>
        </NavLink>
      ))}
    </div>
  );
};

export default ProfileTabs;
