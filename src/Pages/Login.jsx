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
  };
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Login Form */}
      <div className="w-full lg:w-2/5 bg-white flex flex-col px-8 sm:px-12 lg:px-16 py-8 relative z-10">
        {/* Logo và tên ở góc trái trên cùng */}
        <div className="flex items-center gap-4 mb-8 -ml-2">
          <img src={logo} alt="Logo" className="h-28 object-contain cursor-pointer"  onClick={() => navigate("/")}/>
          <span className="text-3xl font-bold text-gray-900">T-Green</span>
        </div>

        {/* Phần form căn giữa */}
        <div className="flex-1 flex items-center justify-center">
          <div className="max-w-md w-full">
            {/* Heading */}
            <div className="mb-10">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Chào mừng trở lại
              </h1>
              <p className="text-gray-600">Đăng nhập để tiếp tục trải nghiệm</p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              {/* Email Field */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  placeholder="driver@gmail.com"
                  value={form.email}
                  onChange={handleChangeValue}
                  onFocus={handleFocus}
                  className={`w-full h-12 px-4 border rounded-lg placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none transition-all ${
                    loginErr
                      ? "border-red-500 ring-2 ring-red-500"
                      : "border-gray-300"
                  }`}
                  required
                />
              </div>
              {/* Password Field */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Mật khẩu
                </label>
                <input
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChangeValue}
                  onFocus={handleFocus}
                  className={`w-full h-12 px-4 border rounded-lg placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none transition-all ${
                    loginErr
                      ? "border-red-500 ring-2 ring-red-500"
                      : "border-gray-300"
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
              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <input
                    id="remember"
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="h-4 w-4 text-emerald-600 border-gray-400 rounded focus:ring-emerald-500 cursor-pointer"
                  />
                  <label
                    htmlFor="remember"
                    className="text-sm text-gray-700 select-none cursor-pointer"
                  >
                    Ghi nhớ đăng nhập
                  </label>
                </div>
                <button
                  type="button"
                  className="text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
                >
                  Quên mật khẩu?
                </button>
              </div>
              {/* Login Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full h-12 text-white font-semibold rounded-lg transition-all duration-200 ${
                  isSubmitting
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-lg shadow-emerald-500/40 hover:shadow-xl hover:shadow-emerald-600/50"
                }`}
              >
                {isSubmitting ? "Đang xử lý..." : "Đăng nhập"}
              </button>{" "}
              {/* Register Link */}
              <div className="text-center text-sm pt-1">
                <span className="text-gray-600">Chưa có tài khoản? </span>
                <Link
                  to="/signup"
                  className="text-emerald-600 hover:text-emerald-700 font-semibold transition-colors"
                >
                  Đăng ký ngay
                </Link>
              </div>
              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>{" "}
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">hoặc</span>
                </div>
              </div>{" "}
              {/* Google Login */}
              <GoogleLoginButton />
            </form>
          </div>
        </div>
      </div>

      {/* Right Side - Hero Image */}
      <div className="hidden lg:flex lg:w-3/5 relative overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1593941707882-a5bba14938c7?q=80&w=2072&auto=format&fit=crop)",
          }}
        ></div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/70 via-emerald-500/60 to-teal-600/70"></div>

        {/* Subtle Pattern Overlay */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        {/* Simple Content */}
        <div className="relative w-full h-full flex items-end p-16">
          <div className="text-white space-y-4">
            <h2 className="text-6xl font-bold leading-tight">Tương lai xanh</h2>
            <p className="text-2xl text-white/90">Bắt đầu từ đây</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
