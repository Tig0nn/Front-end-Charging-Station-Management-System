import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { setAuthToken } from "../lib/api";
import apiServices from "../lib/apiServices";

const GoogleCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const token = searchParams.get("token");
        const errorParam = searchParams.get("error");
        console.log("🔵 Google callback received");
        if (errorParam) {
          throw new Error(`Google authorization failed: ${errorParam}`);
        }
        if (!token) {
          throw new Error("No token received from backend");
        }
        console.log("🔵 FULL TOKEN:", token);

        // ✅ IMPORTANT: Clear old user data before setting new token
        localStorage.removeItem("user");
        localStorage.removeItem("role");
        localStorage.removeItem("currentUserId");
        console.log("🧹 Cleared old user data from localStorage");

        // Lưu token vào localStorage và axios instance
        setAuthToken(token);
        console.log("🔵 Calling API to get driver info...");
        // Sử dụng apiServices thay vì fetch thủ công
        const response = await apiServices.users.getProfile();
        console.log("✅ User info response:", response.data);

        const responseData = response.data.result || response.data;

        // Backend returns data inside driverProfile object
        const driverData = responseData.driverProfile || responseData;

        // Map data correctly
        const userInfo = {
          userId: driverData.userId || null,
          email: driverData.email || null,
          phone: driverData.phone || null,
          dateOfBirth: driverData.dateOfBirth || null,
          gender: driverData.gender || null,
          firstName: driverData.firstname || driverData.firstName || null,
          lastName: driverData.lastname || driverData.lastName || null,
          fullName: driverData.fullname || driverData.fullName || null,
          address: driverData.address || null,
          joinDate: driverData.joinDate || null,
          role: "DRIVER",
        };

        // Lưu thông tin user và role
        localStorage.setItem("user", JSON.stringify(userInfo));
        localStorage.setItem("role", "DRIVER");

        console.log("✅ Login successful, redirecting to driver map...");

        // Check if user has phone - redirect accordingly
        if (!userInfo.phone) {
          console.log("No phone found, redirecting to add-info");
          navigate("/driver/add-info", { replace: true });
        } else {
          navigate("/driver/map", { replace: true });
        }
      } catch (err) {
        // Lỗi từ API hoặc network
        console.error("❌ Callback error:", err);
        let errorMessage = "Đăng nhập thất bại. Vui lòng thử lại.";

        if (err.response) {
          // Lỗi từ backend
          errorMessage =
            err.response.data?.message || `Lỗi: ${err.response.status}`;
        } else if (err.request) {
          // Không nhận được response từ server
          errorMessage =
            "Không thể kết nối đến server. Vui lòng kiểm tra kết nối.";
        } else {
          // Lỗi khác
          errorMessage = err.message;
        }

        setError(errorMessage);

        setTimeout(() => {
          navigate("/login", { replace: true });
        }, 3000);
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  // ...Phần return (JSX) không thay đổi...
  if (error) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          flexDirection: "column",
          gap: "20px",
          backgroundColor: "#1a1a1a",
          color: "white",
        }}
      >
        <div style={{ fontSize: "48px" }}>❌</div>
        <h2 style={{ color: "#e74c3c" }}>Đăng nhập Google thất bại</h2>
        <p style={{ color: "#7f8c8d", textAlign: "center", maxWidth: "500px" }}>
          {error}
        </p>
        <p style={{ color: "#7f8c8d" }}>Đang chuyển về trang đăng nhập...</p>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        flexDirection: "column",
        gap: "20px",
        backgroundColor: "#1a1a1a",
        color: "white",
      }}
    >
      <div
        className="spinner-border text-primary"
        role="status"
        style={{ width: "3rem", height: "3rem" }}
      >
        <span className="visually-hidden">Loading...</span>
      </div>
      <h2>Đang xử lý đăng nhập Google...</h2>
      <p style={{ color: "#7f8c8d" }}>Vui lòng đợi trong giây lát</p>
    </div>
  );
};

export default GoogleCallback;
