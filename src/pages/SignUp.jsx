//**Phần code này do Nguyễn Vũ Trường Huy thực hiện
//Khai báo, import thư viện
import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link, useNavigate } from "react-router-dom";
import { usersAPI } from "../lib/apiServices";
import logo from "../assets/image/logo.png";
import { Alert } from "react-bootstrap";

export default function Signup() {
  // Khai báo state 'form' để lưu trữ dữ liệu người dùng nhập vào các ô input.
  // Bao gồm email, password, và confirmed_password.
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmed_password: "",
  });
  // Khai báo state 'errors' để lưu các thông báo lỗi cho từng trường input.
  const [errors, setErrors] = useState({});
  // Khai báo state 'agree' để theo dõi trạng thái của checkbox "đồng ý với điều khoản".
  const [agree, setAgree] = useState(false);
  // Hàm này được gọi mỗi khi người dùng nhập liệu vào các ô input.
  // Nó cập nhật state 'form' với giá trị mới.
  // [e.target.name] giúp cập nhật đúng trường (email, password,...) dựa vào thuộc tính 'name' của input.
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleChangeValue = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };
  //tạo navigate
  const navigate = useNavigate();

  /*Khi người dùng focus (nhấp chuột) vào một ô input đang hiện lỗi, xóa lỗi
  đó đi*/
  const handleFocus = (e) => {
    const fieldName = e.target.name;
    if (errors[fieldName]) {
      const newErrors = { ...errors };
      delete newErrors[fieldName];
      setErrors(newErrors);
    }
  };
  //set state agree khi checkbox thay đổi
  const handleAgree = (e) => {
    setAgree(e.target.checked);
  };
  // Hàm này được thực thi khi người dùng nhấn nút "Đăng ký".
  const handleSubmit = async (e) => {
    // Ngăn chặn hành vi mặc định của form là tải lại trang.
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const { email, password, confirmed_password } = form;
    // Tạo một đối tượng rỗng để chứa các lỗi nếu có.
    const newErrors = {}; //chứa tất cả lỗi

    // validate dữ liệu
    if (!email.trim()) {
      // check email có trống không
      newErrors.email = "Vui lòng điền email.";
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Định dạng email không hợp lệ.";
    }

    if (!password.trim()) {
      //check password có trống không
      newErrors.password = "Vui lòng điền mật khẩu.";
    } else if (password.trim().length < 6 || password.trim().length > 20) {
      newErrors.password = "Mật khẩu phải từ 6 đến 20 kí tự.";
    }

    if (!confirmed_password.trim()) {
      newErrors.confirmed_password = "Vui lòng xác nhận lại mật khẩu.";
    } else if (password.trim() !== confirmed_password.trim()) {
      newErrors.confirmed_password = "Mật khẩu không giống nhau.";
    }

    // Cập nhật state 'errors' với các lỗi vừa tìm thấy.
    setErrors(newErrors);

    // Chỉ gọi API nếu không có lỗi validation
    if (Object.keys(newErrors).length === 0) {
      setIsSubmitting(true);
      try {
        console.log("Sending register request with data:", {
          email: email.trim(),
          password: password,
          confirmPassword: confirmed_password,
        });

        // Gọi API đăng ký bằng axios
        const response = await usersAPI.register({
          email: email.trim(),
          password: password,
          confirmPassword: confirmed_password,
        });

        console.log("Registration successful:", response.data);

        // Check response
        if (response.data?.code === 1000) {
          toast.success("Đăng kí thành công!");
          e.target.reset();
        } else {
          //ném lỗi
          throw new Error(response.data?.message || "Đăng ký thất bại");
        }
      } catch (err) {
        //bắt lỗi và hiện trên console web
        console.error("Lỗi khi đăng ký:", err);
        console.error("Error response:", err.response);
        console.error("Error status:", err.response?.status);
        console.error("Error data:", err.response?.data);

        const errorMessage =
          err.response?.data?.message ||
          err.response?.data?.result?.message ||
          err.message ||
          "Đã có lỗi không xác định";

        // Hiển thị lỗi dựa trên response
        if (err.response?.status === 400) {
          // Email đã được đăng kí
          if (errorMessage.toLowerCase().includes("user existed")) {
            setErrors({ form: "Email đã được sử dụng" });
          } else {
            setErrors({ form: "Có lỗi đã xảy ra." });
          }
        } else {
          setErrors({ form: "Có lỗi đã xảy ra." });
        }
      } finally {
        setIsSubmitting(false);
      }
    }
    //Check thông tin trên console
    console.log(email, password, confirmed_password);
  };
  return (
    <div className="min-h-screen flex">
      <ToastContainer  position="top-right" autoClose={3000} />
      {/* Left Side - Register Form */}
      <div className="w-full lg:w-2/5 bg-white flex flex-col px-8 sm:px-12 lg:px-16 py-8 relative z-10">
        {/* Logo và tên ở góc trái trên cùng */}
        <div className="flex items-center gap-4 mb-8 -ml-2">
          <img src={logo} alt="Logo" className="h-28 object-contain cursor-pointer" onClick={() => navigate("/")} />
          <span className="text-3xl font-bold text-gray-900">T-Green</span>
        </div>

        {/* Phần form căn giữa */}
        <div className="flex-1 flex items-center justify-center">
          <div className="max-w-md w-full">
            {/* Heading */}
            <div className="mb-10">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Tạo tài khoản mới
              </h1>
              <p className="text-gray-600">Đăng ký để bắt đầu trải nghiệm</p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              {/* Email Field */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  name="email"
                  type="text"
                  placeholder="example123@gmail.com"
                  onFocus={handleFocus}
                  onChange={handleChangeValue}
                  className={`w-full h-12 px-4 border rounded-lg placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none transition-all ${errors.email
                      ? "border-red-500 ring-2 ring-red-500"
                      : "border-gray-300"
                    }`}
                />
                {errors.email && (
                  <div className="text-red-500 text-sm">{errors.email}</div>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Mật khẩu
                </label>
                <input
                  name="password"
                  type="password"
                  placeholder="Mật khẩu từ 6 - 20 ký tự"
                  onFocus={handleFocus}
                  onChange={handleChangeValue}
                  className={`w-full h-12 px-4 border rounded-lg placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none transition-all ${errors.password
                      ? "border-red-500 ring-2 ring-red-500"
                      : "border-gray-300"
                    }`}
                />
                {errors.password && (
                  <div className="text-red-500 text-sm">{errors.password}</div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Xác nhận mật khẩu
                </label>
                <input
                  name="confirmed_password"
                  type="password"
                  placeholder="Nhập lại mật khẩu"
                  onFocus={handleFocus}
                  onChange={handleChangeValue}
                  className={`w-full h-12 px-4 border rounded-lg placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none transition-all ${errors.confirmed_password
                      ? "border-red-500 ring-2 ring-red-500"
                      : "border-gray-300"
                    }`}
                />
                {errors.confirmed_password && (
                  <div className="text-red-500 text-sm">
                    {errors.confirmed_password}
                  </div>
                )}
              </div>

              {/* Terms Agreement */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  id="agree-checkbox"
                  type="checkbox"
                  checked={agree}
                  onChange={handleAgree}
                  className="h-4 w-4 text-emerald-600 border-gray-400 rounded focus:ring-emerald-500 cursor-pointer"
                />
                <label
                  htmlFor="agree-checkbox"
                  className="text-sm text-gray-700 select-none cursor-pointer"
                >
                  Tôi đồng ý với điều khoản dịch vụ và chính sách bảo mật.
                </label>
              </div>

              {/* Form Error */}
              {errors.form && (
                <Alert variant="danger" className="text-sm py-2">
                  {errors.form}
                </Alert>
              )}

              {/* Register Button */}
              <button
                type="submit"
                disabled={!agree || isSubmitting}
                className={`w-full h-12 text-white font-semibold rounded-lg transition-all duration-200 ${!agree || isSubmitting
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-lg shadow-emerald-500/40 hover:shadow-xl hover:shadow-emerald-600/50"
                  }`}
              >
                {isSubmitting ? "Đang xử lý..." : "Đăng ký"}
              </button>

              {/* Login Link */}
              <div className="text-center text-sm pt-1">
                <span className="text-gray-600">Đã có tài khoản? </span>
                <Link
                  to="/login"
                  className="!text-emerald-600 !hover:text-emerald-700 !font-semibold !transition-colors !no-underline cursor-pointer"
                >
                  Đăng nhập ngay
                </Link>
              </div>
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
              "url(https://images.unsplash.com/photo-1625998259975-b243bf480751?q=80&w=2072&auto=format&fit=crop)",
          }}
        ></div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-teal-600/70 via-emerald-500/60 to-green-600/70"></div>

        {/* Subtle Pattern Overlay */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        {/* Simple Content */}
        <div className="relative w-full h-full flex items-end p-16">
          <div className="text-white space-y-4">
            <h2 className="text-6xl font-bold leading-tight">
              Hành trình xanh
            </h2>
            <p className="text-2xl text-white/90">Bắt đầu ngay hôm nay</p>
          </div>
        </div>
      </div>
    </div>
  );
}
//**Hết phần code do Nguyễn Vũ Trường Huy thực hiện
