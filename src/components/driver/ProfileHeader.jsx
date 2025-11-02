import React from "react";
import { Card, Badge } from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";

const ProfileHeader = ({ user }) => {
  // Lấy initials từ tên (VD: "Nguyễn Văn An" -> "NVA")
  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 3);
  };

  // Format ngày thành viên (dd/MM/yyyy)
  const formatMemberSince = (date) => {
    if (!date) return "01/01/2024";

    try {
      const d = new Date(date);

      // Kiểm tra nếu date không hợp lệ
      if (isNaN(d.getTime())) {
        console.warn("Invalid date:", date);
        return "01/01/2024";
      }

      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    } catch (error) {
      console.error("Error formatting date:", error);
      return "01/01/2024";
    }
  };

  return (
    <Card
      className="border-0 mb-4"
      style={{
        borderRadius: "20px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
      }}
    >
      <Card.Body className="p-4">
        <div className="d-flex align-items-center gap-4">
          {/* Avatar */}
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "16px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "28px",
              fontWeight: "700",
              flexShrink: 0,
            }}
          >
            {getInitials(user?.fullName || user?.firstName)}
          </div>

          {/* User Info */}
          <div className="flex-grow-1">
            <h3
              className="mb-1"
              style={{
                fontSize: "22px",
                fontWeight: "700",
                color: "#111827",
              }}
            >
              {user?.fullName ||
                `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
                "Người dùng"}
            </h3>
            <p
              className="mb-2"
              style={{
                color: "#6b7280",
                fontSize: "15px",
                margin: 0,
              }}
            >
              {user?.email || "email@example.com"}
            </p>
            <div className="d-flex align-items-center gap-2">
              <Badge
                bg="light"
                text="dark"
                style={{
                  padding: "6px 12px",
                  fontSize: "13px",
                  fontWeight: "600",
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb",
                }}
              >
                Thành viên từ {formatMemberSince(user?.createdAt)}
              </Badge>
            </div>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ProfileHeader;
