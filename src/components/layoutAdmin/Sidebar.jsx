import React from "react";
import { useLocation, useNavigate } from "react-router";
import "./Sidebar.css";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => {
    // For admin routes, check if current path starts with the admin path
    return (
      location.pathname === `/admin${path}` ||
      (path === "/dashboard" &&
        (location.pathname === "/admin/" || location.pathname === "/admin"))
    );
  };

  const handleNavigation = (path) => {
    navigate(`/admin${path}`);
  };

  const getItemClass = (path) => {
    const baseClass = "sidebar-text text-decoration-none font-medium text-lg";
    return isActive(path)
      ? `${baseClass} text-blue-600 font-semibold`
      : `${baseClass} text-[#b1b1b1]`;
  };

  const getContainerClass = (path) => {
    return isActive(path) ? "sidebar-item active" : "sidebar-item";
  };

  return (
    <div className="relative w-[227px] h-screen">
      <div className="sidebar-container fixed top-[100px] left-0 w-[227px] h-[calc(100vh-100px)] bg-white flex flex-col justify-start items-start pl-4 pt-4">
        {/* Dashboard */}
        <div
          className={`w-[191px] h-[60px] flex mb-4 cursor-pointer ${getContainerClass(
            "/dashboard"
          )}`}
          onClick={() => handleNavigation("/dashboard")}
        >
          {isActive("/dashboard") && (
            <div className="sidebar-active-indicator w-1.5 h-[60px] bg-blue-600 rounded-[0px_10px_10px_0px]" />
          )}
          <div className="sidebar-text-container flex items-center tracking-[0] leading-[normal]">
            <span className={getItemClass("/dashboard")}>Dashboard</span>
          </div>
        </div>

        {/* Stations */}
        <div
          className={`w-[191px] h-[60px] flex mb-4 cursor-pointer ${getContainerClass(
            "/stations"
          )}`}
          onClick={() => handleNavigation("/stations")}
        >
          {isActive("/stations") && (
            <div className="sidebar-active-indicator w-1.5 h-[60px] bg-blue-600 rounded-[0px_10px_10px_0px]" />
          )}
          <div className="sidebar-text-container flex items-center tracking-[0] leading-[normal]">
            <span className={getItemClass("/stations")}>Stations</span>
          </div>
        </div>

        {/* Users */}
        <div
          className={`w-[191px] h-[60px] flex mb-4 cursor-pointer ${getContainerClass(
            "/users"
          )}`}
          onClick={() => handleNavigation("/users")}
        >
          {isActive("/users") && (
            <div className="sidebar-active-indicator w-1.5 h-[60px] bg-blue-600 rounded-[0px_10px_10px_0px]" />
          )}
          <div className="sidebar-text-container flex items-center tracking-[0] leading-[normal]">
            <span className={getItemClass("/users")}>Users</span>
          </div>
        </div>

        {/* Reports */}
        <div
          className={`w-[191px] h-[60px] flex cursor-pointer ${getContainerClass(
            "/reports"
          )}`}
          onClick={() => handleNavigation("/reports")}
        >
          {isActive("/reports") && (
            <div className="sidebar-active-indicator w-1.5 h-[60px] bg-blue-600 rounded-[0px_10px_10px_0px]" />
          )}
          <div className="sidebar-text-container flex items-center tracking-[0] leading-[normal]">
            <span className={getItemClass("/reports")}>Reports</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
