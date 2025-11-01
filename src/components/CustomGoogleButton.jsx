import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const CustomGoogleButton = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = () => {
    if (
      !GOOGLE_CLIENT_ID ||
      GOOGLE_CLIENT_ID ===
        "your-google-client-id-here.apps.googleusercontent.com"
    ) {
      alert(
        "Google Client ID chưa được cấu hình. Vui lòng thêm VITE_GOOGLE_CLIENT_ID vào .env file."
      );
      return;
    }

    setLoading(true);

    // Sử dụng Google Identity Services
    const client = window.google.accounts.oauth2.initCodeClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: "email profile openid",
      ux_mode: "popup",
      callback: async (response) => {
        if (response.code) {
          await handleGoogleCallback(response.code);
        } else {
          console.error("❌ No authorization code received");
          setLoading(false);
        }
      },
      error_callback: (error) => {
        console.error("❌ Google login error:", error);
        alert("Đăng nhập Google thất bại");
        setLoading(false);
      },
    });

    client.requestCode();
  };

  const handleGoogleCallback = async (code) => {
    try {
      const baseURL =
        import.meta.env.VITE_API_BASE_URL ||
        "http://localhost:8080/evchargingstation";
      const response = await fetch(`${baseURL}/api/auth/google`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "69420",
        },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();

      if (data.code === 1000 && data.result) {
        const { token, user } = data.result;
        localStorage.setItem("authToken", token);
        localStorage.setItem("user", JSON.stringify(user));

        // Redirect based on role
        if (user.role === "DRIVER") {
          navigate("/driver/map");
        } else if (user.role === "ADMIN") {
          navigate("/admin/dashboard");
        } else if (user.role === "STAFF") {
          navigate("/staff/dashboard");
        } else {
          navigate("/");
        }
      } else {
        throw new Error(data.message || "Login failed");
      }
    } catch (error) {
      console.error("❌ Backend error:", error);
      alert(`Đăng nhập thất bại: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleGoogleLogin}
      disabled={loading}
      className="w-full d-flex align-items-center justify-content-center gap-3"
      style={{
        backgroundColor: "#2C3E50",
        borderColor: "transparent",
        padding: "12px",
        borderRadius: "10px",
        border: "1px solid transparent",
        transition: "all 0.3s ease",
        cursor: loading ? "not-allowed" : "pointer",
        opacity: loading ? 0.7 : 1,
      }}
      onMouseEnter={(e) => {
        if (!loading) {
          e.target.style.backgroundColor = "white";
          e.target.style.color = "black";
          e.target.style.borderColor = "#2C3E50";
        }
      }}
      onMouseLeave={(e) => {
        if (!loading) {
          e.target.style.backgroundColor = "#2C3E50";
          e.target.style.color = "white";
          e.target.style.borderColor = "transparent";
        }
      }}
    >
      {/* Google Logo SVG */}
      <svg
        width="20"
        height="20"
        viewBox="0 0 48 48"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill="#4285F4"
          d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"
        />
        <path
          fill="#34A853"
          d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"
        />
        <path
          fill="#FBBC05"
          d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24c0 3.55.85 6.91 2.34 9.88l7.35-5.7z"
        />
        <path
          fill="#EA4335"
          d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"
        />
      </svg>

      <span style={{ fontSize: "15px", fontWeight: 500, color: "inherit" }}>
        {loading ? "Đang xử lý..." : "Đăng nhập với Google"}
      </span>
    </button>
  );
};

export default CustomGoogleButton;
