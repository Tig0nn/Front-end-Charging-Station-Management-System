import React from "react";
import { Routes, Route, Navigate, NavLink } from "react-router-dom";
import BookingForm from "../../components/driver/BookingForm";
import MyBookings from "../../components/driver/MyBookings";
import "./BookingPage.css";

const BookingPage = () => {
  const tabs = [
    {
      path: "/driver/booking/new",
      label: "Đặt chỗ mới",
      icon: "bi-plus-circle",
    },
    {
      path: "/driver/booking/my-bookings",
      label: "Booking của bạn",
      icon: "bi-list-check",
    },
  ];

  return (
    <div>
      {/* Sub-tabs Navigation */}
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
            key={tab.path}
            to={tab.path}
            end
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

      {/* Routes */}
      <Routes>
        <Route index element={<Navigate to="/driver/booking/new" replace />} />
        <Route path="new" element={<BookingForm />} />
        <Route path="my-bookings" element={<MyBookings />} />
      </Routes>
    </div>
  );
};

export default BookingPage;
