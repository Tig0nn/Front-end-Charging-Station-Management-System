import React from "react";

const NotificationPage = () => {
  return (
    <div
      style={{
        background: "white",
        borderRadius: "20px",
        padding: "40px",
        textAlign: "center",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
      }}
    >
      <i
        className="bi bi-bell"
        style={{ fontSize: "48px", color: "#9ca3af" }}
      ></i>
      <h4 className="mt-3 mb-2" style={{ color: "#374151" }}>
        Thông báo
      </h4>
      <p style={{ color: "#6b7280", fontSize: "14px" }}>
        Chức năng thông báo đang được phát triển.
      </p>
    </div>
  );
};

export default NotificationPage;
