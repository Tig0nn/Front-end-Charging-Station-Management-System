import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import logo from "../assets/image/logo.png";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setError("Vui lòng nhập email.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      // Gọi API gửi password tạm
      const res = await fetch(
        "http://localhost:8080/api/auth/forgot-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const data = await res.json();

      if (data.success) {
        setSuccess("Đã gửi mật khẩu tạm đến email của bạn.");
      } else {
        setError(data.message || "Không thể gửi yêu cầu. Thử lại sau.");
      }
    } catch (err) {
      setError("Lỗi kết nối. Vui lòng thử lại." + err.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen w-full flex flex-col bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* Logo */}
      <div
        className="flex items-center gap-3 p-8 cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => navigate("/")}
      >
        <img src={logo} alt="Logo" className="h-20 drop-shadow-md" />
        <span className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
          T-Green
        </span>
      </div>

      {/* Center Content */}
      <div className="flex-1 flex items-center justify-center px-4 pb-16">
        <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md relative overflow-hidden border border-gray-100">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-100 rounded-full blur-3xl opacity-20 -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-teal-100 rounded-full blur-3xl opacity-20 -ml-20 -mb-20"></div>{" "}
          {/* Content */}
          <div className="relative z-10">
            {/* Title */}
            <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
              Quên mật khẩu?
            </h1>
            <p className="text-gray-600 mb-8 text-center">
              Nhập email của bạn và chúng tôi sẽ gửi mật khẩu tạm để bạn có thể
              đăng nhập lại.
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Địa chỉ Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                      />
                    </svg>
                  </div>
                  <input
                    type="email"
                    placeholder="example@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-12 pl-12 pr-4 border-2 border-gray-200 rounded-xl
                    focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none
                    transition-all hover:border-gray-300"
                  />
                </div>
              </div>{" "}
              {/* Error */}
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}
              {/* Success */}
              {success && (
                <div className="bg-green-50 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded-lg text-sm">
                  {success}
                </div>
              )}{" "}
              {/* Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full h-12 text-white font-bold rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg
                ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 hover:shadow-xl"
                }
              `}
              >
                {loading ? "Đang gửi..." : "Gửi mật khẩu tạm"}
              </button>
              {/* Divider */}
              <div className="relative py-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
              </div>{" "}
              {/* Back to login */}
              <div className="text-center">
                <Link
                  to="/login"
                  className="!text-emerald-600  !no-underline font-semibold hover:text-emerald-700 transition-colors"
                >
                  ← Quay lại đăng nhập
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
