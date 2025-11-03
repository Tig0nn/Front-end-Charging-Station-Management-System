import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

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

        // ▼▼▼ THAY ĐỔI QUAN TRỌNG Ở ĐÂY ▼▼▼
        // Luôn sử dụng localhost:8080 khi ở local dev để tránh lỗi của NGROK
        // const baseURL =
        //   import.meta.env.VITE_API_BASE_URL ||
        //   "http://localhost:8080/evchargingstation";

        const baseURL = "http://localhost:8080/evchargingstation";
        // ▲▲▲ KẾT THÚC THAY ĐỔI ▲▲▲

        const requestURL = `${baseURL}/api/users/driver/myInfo`;

        const requestHeaders = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        console.log("🔵 Calling fetch to URL:", requestURL);
        console.log("🔵 Sending headers:", JSON.stringify(requestHeaders));

        const userInfoResponse = await fetch(requestURL, {
          method: "GET",
          headers: requestHeaders,
          cache: "no-cache",
        });

        console.log("🔵 Fetch response received:", userInfoResponse);

        // 1. Luôn đọc nội dung dưới dạng TEXT trước, bất kể status là gì
        const responseText = await userInfoResponse.text();

        if (!userInfoResponse.ok) {
          // Nếu status không phải 2xx, log lỗi và ném ra
          console.error(
            "❌ Fetch failed response text (non-ok):",
            responseText
          );
          throw new Error(
            `Failed to fetch user info: ${
              userInfoResponse.status
            }. Response: ${responseText.substring(0, 100)}...`
          );
        }

        // 2. Log nội dung text (để xem có phải HTML của ngrok không)
        console.log(
          "🔵 Received response text:",
          responseText.substring(0, 200) + "..."
        );

        // 3. BÂY GIỜ mới thử parse
        const userData = JSON.parse(responseText);
        // Nếu responseText là HTML, lỗi "Unexpected token '<'" sẽ xảy ra ở ĐÂY
        // và sẽ được khối catch bên dưới bắt lại.

        console.log("✅ User info response (parsed):", userData);

        let userInfo = userData.result || userData;

        localStorage.setItem("authToken", token);
        localStorage.setItem("user", JSON.stringify(userInfo));
        localStorage.setItem("role", "DRIVER");

        console.log("✅ Login successful, redirecting to driver map...");
        navigate("/driver/map", { replace: true });
      } catch (err) {
        // Lỗi (bao gồm cả lỗi JSON.parse) sẽ bị bắt ở đây
        console.error("❌ Callback error (includes JSON parse error):", err);
        setError(err.message); // err.message sẽ là "Unexpected token '<'..."

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
