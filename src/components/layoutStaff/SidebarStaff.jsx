import React from "react";
import "bootstrap-icons/font/bootstrap-icons.css";

// 1. Cập nhật NAVIGATION_ITEMS - dùng ID thay vì path
const NAVIGATION_ITEMS = [
  {
    id: "overview",
    label: "Điểm sạc",
  },
  {
    id: "sessions",
    label: "Quản lý yêu cầu",
  },
  {
    id: "transactions",
    label: "Giao dịch",
  },
  {
    id: "reports",
    label: "Sự cố",
  },
];

// 2. Component nhận props: activeTab và onTabChange (không dùng routing)
const PillNavigation = ({ activeTab = "overview", onTabChange }) => {
  return (
    <div className="flex justify-start w-full">
      <div
        className="
          inline-flex items-center
          p-1 
          bg-gray-100 
          rounded-full 
          space-x-0.5
        "
      >
        {NAVIGATION_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange && onTabChange(item.id)}
            className={`
              flex items-center gap-1.5
              px-3 py-1.5
              rounded-full
              font-medium
              transition-all duration-300
              focus:outline-none
              ${
                activeTab === item.id
                  ? "bg-[#2bf0b5] text-white shadow-sm"
                  : "bg-transparent text-gray-700 hover:bg-[#2bf0b5]/20 hover:text-[#2bf0b5]"
              }
            `}
            style={{
              borderRadius: "9999px",
            }}
          >
            <span className="text-xs whitespace-nowrap">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default PillNavigation;
