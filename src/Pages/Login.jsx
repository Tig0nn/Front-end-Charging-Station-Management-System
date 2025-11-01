import "tailwindcss";
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.jsx";
import GoogleLoginButton from "../components/GoogleLoginButton.jsx";
import "./BackGround.css";
import "./Login.css";
import { Form, Button, Alert } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

function Login() {
  // Điều hướng và xác thực
  const navigate = useNavigate();

  // State quản lý form và lỗi
  const { login } = useAuth();
  const [loginErr, setLoginErr] = useState("");
  // State quản lý trạng thái gửi form
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State quản lý dữ liệu form
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  // State quản lý ghi nhớ đăng nhập
  const [remember, setRemember] = useState(false);

  // Handle input changes
  const handleChangeValue = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // Clear error on focus
  const handleFocus = () => {
    if (loginErr) {
      setLoginErr("");
    }
  };

  //Lấy thông tin đăng nhập trong component Login lần đầu render
  useEffect(() => {
    // Chỉ đọc email/pass đã lưu
    const savedEmail = localStorage.getItem("savedEmail");
    const savedPassword = localStorage.getItem("savedPassword");

    if (savedEmail && savedPassword) {
      // Nếu có, điền vào form và check ô "Ghi nhớ"
      setForm({ email: savedEmail, password: savedPassword });
      setRemember(true);
    }
    // Không cần logic lastActive hay dọn dẹp gì cả
  }, []);

  // Xử lý đăng nhập
  async function HandleClick(e) {
    e.preventDefault();

    const { email, password } = form;

    if (!email || !password) {
      setLoginErr("Vui lòng nhập đủ email và password");
      return;
    }

    try {
      setIsSubmitting(true);
      setLoginErr(""); // Xóa lỗi cũ nếu có

      // Debug: Log credentials being sent
      console.log("🔵 Attempting login with:", { email, password: "***" });
      console.log("🔵 API Base URL:", import.meta.env.VITE_API_BASE_URL);

      const result = await login({ email, password });
      console.log("Login result:", result);
      if (result.success) {
        const role = String(result.user?.role || "").toUpperCase();
        console.log("Checkbox ghi nhớ:", remember);
        if (remember) {
          localStorage.setItem("savedEmail", form.email || ""); //lưu email tạm thời
          localStorage.setItem("savedPassword", form.password || ""); //lưu password tạm thời
          console.log(localStorage.getItem("savedEmail"));
          console.log(localStorage.getItem("savedPassword"));
        } else {
          localStorage.removeItem("savedEmail");
          localStorage.removeItem("savedPassword");
          localStorage.removeItem("loginTime");
        }

        if (role === "DRIVER") {
          navigate(result.needsProfile ? "/driver/add-info" : "/driver");
        } else if (role === "ADMIN") {
          navigate("/admin");
        } else if (role === "STAFF") {
          // check có phải staff không
          navigate("/staff");
        } else {
          navigate("/");
        }
      } else {
        setLoginErr(result.error || "Đăng nhập thất bại");
      }
    } catch (err) {
      console.error("Login error:", err);
      setLoginErr("Lỗi không xác định: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  // Các phần giao diện phụ
  const suggestion = (
    <div className="title">
      <h1>Đăng nhập</h1>
    </div>
  );

  const directToSignUp = (
    <div className="login">
      <label>Chưa có tài khoản? </label>{" "}
      <Link
        to="/signup"
        className="ml-1 font-semibold text-[#2bf0b5]! hover:text-[#00ffc6]! no-underline!
        hover:[text-shadow:0_0_5px_#00ffc6,0_0_10px_#00ffc6,0_0_15px_#00ffc6]!"
      >
        Đăng ký
      </Link>
    </div>
  );

  const helper = (
    <div className="mt-3 space-y-4">
      <Form.Check
        type="checkbox"
        label="Ghi nhớ"
        checked={remember}
        onChange={(e) => setRemember(e.target.checked)}
        style={{ color: "#eaeaea" }}
      />
      <div className="flex flex-col justify-center items-center gap-4 mt-4">
        <div className="w-full flex items-center justify-center">
          <div className="flex-1 border-t border-gray-500"></div>
          <span className="px-3 text-white text-sm">Hoặc</span>
          <div className="flex-1 border-t border-gray-500"></div>
        </div>

        {/* Google Login Button */}
        <GoogleLoginButton />
      </div>
    </div>
  );

  // Form đăng nhập
  const loginForm = (
    <div className="form-fields">
      <Form.Group className="mb-3" controlId="formBasicEmail">
        <Form.Label style={{ color: "#eaeaea", fontWeight: 600 }}>
          Email
        </Form.Label>
        <Form.Control
          name="email"
          type="email"
          placeholder="example@gmail.com"
          value={form.email}
          onChange={handleChangeValue}
          onFocus={handleFocus}
          style={{
            backgroundColor: "#253340",
            color: "#fff",
            border: "1px solid #333",
            borderRadius: "10px",
            padding: "12px 14px",
            fontSize: "15px",
            borderColor: loginErr ? "red" : "#333",
            boxShadow: loginErr ? "0 0 6px rgba(255, 0, 0, 1)" : "none",
          }}
          required
        />
      </Form.Group>

      <Form.Group className="mb-3" controlId="formBasicPassword">
        <Form.Label style={{ color: "#eaeaea", fontWeight: 600 }}>
          Mật khẩu
        </Form.Label>
        <Form.Control
          name="password"
          type="password"
          placeholder="Nhập mật khẩu"
          value={form.password}
          onChange={handleChangeValue}
          onFocus={handleFocus}
          style={{
            backgroundColor: "#253340",
            color: "#fff",
            border: "1px solid #333",
            borderRadius: "10px",
            padding: "12px 14px",
            fontSize: "15px",
            borderColor: loginErr ? "red" : "#333",
            boxShadow: loginErr ? "0 0 6px rgba(255, 0, 0, 1)" : "none",
          }}
          required
        />
      </Form.Group>

      {loginErr && (
        <Alert variant="danger" className="mb-3" style={{ fontSize: "14px" }}>
          {loginErr}
        </Alert>
      )}

      <Button
        type="submit"
        disabled={isSubmitting}
        style={{
          background: "linear-gradient(90deg, #2bf0b5, #00ffc6)",
          border: "none",
          borderRadius: "10px",
          padding: "14px",
          fontSize: "16px",
          fontWeight: 600,
          width: "100%",
          color: "#000000",
          transition: "all 0.4s ease",
        }}
        onMouseEnter={(e) => {
          e.target.style.background =
            "linear-gradient(90deg, #5fffd4, #2bf0b5)";
          e.target.style.boxShadow =
            "0 0 8px #00ffc6, 0 0 16px #00ffc6, 0 0 24px #00ffc6";
        }}
        onMouseLeave={(e) => {
          e.target.style.background =
            "linear-gradient(90deg, #2bf0b5, #00ffc6)";
          e.target.style.boxShadow = "none";
        }}
      >
        {isSubmitting ? "Đang xử lý..." : "Đăng nhập"}
      </Button>
    </div>
  );

  return (
    <div className="login-page">
      <div className="background">
        <Link to="/">
          <img className="logo" src="src/assets/image/logo.png" alt="Logo" />
        </Link>
        <div className="container">
          <Form className="form-container" onSubmit={HandleClick}>
            {suggestion}
            {directToSignUp}
            {loginForm}
            {helper}
          </Form>
        </div>
      </div>
    </div>
  );
}

export default Login;
