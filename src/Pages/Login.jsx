import "tailwindcss";
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.jsx";
import GoogleLoginButton from "../components/GoogleLoginButton.jsx";
import { Alert } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import logo from "../assets/image/logo.png";

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
  const handleSubmit = async (e) => {
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

  return (
    <div className="flex justify-start min-h-screen bg-green-50">
      <div className="w-[400px] bg-white rounded-xl shadow p-8">

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Link to="/">
            <img src={logo} alt="Logo" className="h-16 object-contain" />
          </Link>
        </div>

        {/* Title */}
        <div className="text-center mb-6">
          <h1 className="text-xl font-semibold text-gray-800">Đăng nhập</h1>
        </div>

        {/* Form */}
        <form className="space-y-5" onSubmit={handleSubmit}>
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              name="email"
              type="email"
              placeholder="example@gmail.com"
              value={form.email}
              onChange={handleChangeValue}
              onFocus={handleFocus}
              className={`w-full px-4 py-2 border rounded-lg placeholder-gray-400 focus:ring-2 focus:ring-[#2bf0b5] focus:outline-none ${loginErr ? "border-red-500 ring-1 ring-red-500" : "border-gray-300"
                }`}
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mật khẩu
            </label>
            <input
              name="password"
              type="password"
              placeholder="Nhập mật khẩu"
              value={form.password}
              onChange={handleChangeValue}
              onFocus={handleFocus}
              className={`w-full px-4 py-2 border rounded-lg placeholder-gray-400 focus:ring-2 focus:ring-[#2bf0b5] focus:outline-none ${loginErr ? "border-red-500 ring-1 ring-red-500" : "border-gray-300"
                }`}
              required
            />
          </div>

          {/* Error message */}
          {loginErr && (
            <Alert variant="danger" className="text-sm py-2">
              {loginErr}
            </Alert>
          )}

          {/* Remember Me */}
          <div className="flex items-center gap-2">
            <input
              id="remember"
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-400"
            />
            <label htmlFor="remember" className="text-sm text-gray-700 select-none">
              Ghi nhớ đăng nhập
            </label>
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-2.5 text-white font-semibold rounded-lg transition ${isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-[#2bf0b5] hover:bg-[#00ffc6] cursor-pointer"
              }`}
          >
            {isSubmitting ? "Đang xử lý..." : "Đăng nhập"}
          </button>

          {/* Link */}
          <div className="text-center mt-4 text-sm">
            <span className="text-gray-600">Chưa có tài khoản?</span>
            <Link
              to="/signup"
              className="!text-[#2bf0b5] !font-semibold ml-1 !no-underline"
            >
              Đăng ký
            </Link>
          </div>
          <div className="flex flex-col justify-center items-center gap-4">
            <div className="w-full flex items-center justify-center">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="px-3 text-gray-500 text-sm">Hoặc</span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>
            <GoogleLoginButton />
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
