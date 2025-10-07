import "tailwindcss";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.jsx";
import "./BackGround.css";
import "./Login.css";
import { Form, Button, Alert } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loginErr, setLoginErr] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

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

      const result = await login({
        email: email.trim(),
        password: password,
      });

      if (result.success) {
        alert("Đăng nhập thành công!");
        navigate("/admin/dashboard");
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
        className="text-[#68ffc2] ml-1 font-semibold hover:underline"
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
        style={{ color: "#eaeaea" }}
      />
      <div className="flex flex-col justify-center items-center gap-6 mt-3">
        <p className="text-white text-sm mb-2">
          _______________Hoặc_______________
        </p>
        <Button
          type="button"
          variant="outline-light"
          className="w-full d-flex align-items-center justify-content-center gap-2"
          style={{
            backgroundColor: "#2C3E50",
            borderColor: "transparent",
            padding: "10px",
            borderRadius: "10px",
            transition: "all 0.3s ease",
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
          <img
            src="src/assets/image/anhGG.png"
            alt="Google"
            className="w-8 h-8 pointer-events-none"
            style={{ width: "32px", height: "32px" }}
          />
          <span style={{ fontSize: "14px", fontWeight: 500 }}>Google</span>
        </Button>
      </div>
    </div>
  );

  // Form đăng nhập
  const loginForm = (
    <Form onSubmit={HandleClick}>
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
    </Form>
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
