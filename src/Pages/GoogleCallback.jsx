import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const GoogleCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Lấy authorization code từ URL
        const code = searchParams.get("code");
        const errorParam = searchParams.get("error");

        console.log("🔵 Google callback received");
        console.log("🔵 Authorization code:", code?.substring(0, 20) + "...");

        if (errorParam) {
          throw new Error(`Google authorization failed: ${errorParam}`);
        }

        if (!code) {
          throw new Error("No authorization code received from Google");
        }

        // Gửi code đến backend
        const baseURL =
          import.meta.env.VITE_API_BASE_URL ||
          "http://localhost:8080/evchargingstation";
        const endpoint = `${baseURL}/api/auth/google/callback`;

        console.log("🔵 Sending code to backend:", endpoint);

        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            code: code,
            redirectUri: `${window.location.origin}/auth/google/callback`,
          }),
        });

        console.log("🔵 Backend response status:", response.status);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Backend error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log("✅ Backend response:", data);

        if (data.code === 0 && data.result) {
          const { token, userInfo } = data.result;

          // Lưu token
          localStorage.setItem("authToken", token);
          localStorage.setItem("user", JSON.stringify(userInfo));
          localStorage.setItem("role", userInfo.role);

          console.log("✅ Login successful, redirecting...");

          // Redirect dựa trên role
          const role = userInfo.role?.toUpperCase();
          if (role === "DRIVER") {
            navigate("/driver/map", { replace: true });
          } else if (role === "ADMIN") {
            navigate("/admin/dashboard", { replace: true });
          } else if (role === "STAFF") {
            navigate("/staff/station-overview", { replace: true });
          } else {
            navigate("/driver/map", { replace: true });
          }
        } else {
          throw new Error(data.message || "Login failed");
        }
      } catch (err) {
        console.error("❌ Callback error:", err);
        setError(err.message);

        setTimeout(() => {
          navigate("/login", { replace: true });
        }, 3000);
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

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
