import React, { useEffect, useState } from "react";
import { Navbar, Container, Button } from "react-bootstrap";
import { useNavigate } from "react-router";
import { useAuth } from "../../hooks/useAuth.jsx";
import { usersAPI } from "../../lib/apiServices.js";
import "bootstrap-icons/font/bootstrap-icons.css";

const Header = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [adminProfile, setAdminProfile] = useState(null);

  useEffect(() => {
    const fetchAdminProfile = async () => {
      try {
        const res = await usersAPI.getProfile();
        console.log("📋 Admin header profile response:", res);

        // Backend trả về: { code: 1000, result: { role: "ADMIN", adminProfile: {...} } }
        const resultData = res.data?.result || res.result;
        const profileData = resultData?.adminProfile || resultData;

        console.log("👤 Admin header profile data:", profileData);
        setAdminProfile(profileData);
      } catch (err) {
        console.error("❌ Fetch admin profile failed:", err);
      }
    };
    fetchAdminProfile();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Navbar
      fixed="top"
      bg="white"
      className="border-bottom shadow-sm"
      style={{ height: "70px", zIndex: 1000 }}
    >
      <Container fluid className="px-4">
        {/* Logo and Brand */}
        <Navbar.Brand className="d-flex align-items-center gap-2">
          <img
            src="/src/assets/image/logo.png" // Đường dẫn đến file ảnh của bạn
            alt="Logo" // Luôn thêm alt text cho khả năng tiếp cận
            className="rounded" // Giữ lại bo tròn nếu muốn
            style={{
              width: "36px",
              height: "36px",
              objectFit: "cover", // Tương đương với backgroundSize: "cover"
              marginTop: "5px", // Có thể cần điều chỉnh lại margin-top nếu cần
            }}
          />
          <span
            style={{
              fontFamily: "Mont-HeavyDEMO, Helvetica, sans-serif",
              fontSize: "25px",
              lineHeight: "normal",
              marginTop: "4px",
              color: "#22c55e",
              fontWeight: "bold",
            }}
          >
            T-Green
          </span>
        </Navbar.Brand>

        {/* Right Side - User Info & Logout */}
        <div className="d-flex align-items-center gap-3">
          {/* User Avatar & Name */}
          <div className="d-flex align-items-center gap-2">
            <div className="d-flex flex-column">
              <span className="fw-semibold" style={{ fontSize: "14px" }}>
                {adminProfile?.fullName || "Admin"}
              </span>
              <span className="text-muted" style={{ fontSize: "12px" }}>
                Quản trị viên
              </span>
            </div>
          </div>

          {/* Logout Button */}
          <Button
            variant="link"
            className="text-decoration-none text-dark d-flex align-items-center gap-2"
            onClick={handleLogout}
            style={{
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#dc3545")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#212529")}
          >
            <i
              className="bi bi-box-arrow-right"
              style={{ fontSize: "20px" }}
            ></i>
            <span className="fw-medium">Đăng xuất</span>
          </Button>
        </div>
      </Container>
    </Navbar>
  );
};

export default Header;
