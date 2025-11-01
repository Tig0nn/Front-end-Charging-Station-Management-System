import React from "react";

const GoogleLoginButton = () => {
  const handleGoogleLogin = () => {
    // Spring Security OAuth2 auto-flow
    const baseURL =
      import.meta.env.VITE_API_BASE_URL ||
      "http://localhost:8080/evchargingstation";

    console.log("🔵 Starting Spring Security OAuth2 flow...");
    console.log("🔵 Redirecting to:", `${baseURL}/oauth2/authorization/google`);

    // Spring Security sẽ tự động:
    // 1. Redirect đến Google OAuth
    // 2. Handle callback tại /login/oauth2/code/google
    // 3. Process authentication
    window.location.href = `${baseURL}/oauth2/authorization/google`;
  };

  return (
    <button
      type="button"
      onClick={handleGoogleLogin}
      className="w-full d-flex align-items-center justify-content-center gap-3"
      style={{
        backgroundColor: "#2C3E50",
        borderColor: "transparent",
        padding: "12px",
        borderRadius: "10px",
        border: "1px solid transparent",
        transition: "all 0.3s ease",
        cursor: "pointer",
        color: "white",
      }}
      onMouseEnter={(e) => {
        e.target.style.backgroundColor = "white";
        e.target.style.color = "black";
        e.target.style.borderColor = "#2C3E50";
      }}
      onMouseLeave={(e) => {
        e.target.style.backgroundColor = "#2C3E50";
        e.target.style.color = "white";
        e.target.style.borderColor = "transparent";
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
        Đăng nhập với Google
      </span>
    </button>
  );
};

export default GoogleLoginButton;
