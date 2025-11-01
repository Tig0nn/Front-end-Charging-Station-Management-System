//**Phần code này do Nguyễn Vũ Trường Huy thực hiện
//Khai báo, import thư viện
import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { Link, useNavigate } from "react-router-dom";
import { usersAPI } from "../lib/apiServices";
import logo from "../assets/image/logo.png";

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
          alert("Đăng ký thành công!");
          console.log("User created:", response.data.result);
          // chuyển sang trang login
          navigate("/login", { replace: true });
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
          if (
            errorMessage.toLowerCase().includes("user existed")
          ) {
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-green-50 signup-page">
      <div className="w-[400px] bg-white rounded-xl shadow p-8">

        <div className="flex justify-center mb-6">
          <Link to="/">
            <img src={logo} alt="Logo" className="h-16 object-contain" />
          </Link>
        </div>


        <div className="text-center mb-6">
          <h1 className="text-xl font-semibold text-gray-800">Đăng ký</h1>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              name="email"
              type="text"
              placeholder="example123@gmail.com"
              onFocus={handleFocus}
              onChange={handleChangeValue}
              className={`w-full px-4 py-2 border rounded-lg placeholder-gray-400 focus:ring-2 focus:ring-[#2bf0b5] focus:outline-none ${errors.email
                  ? "border-red-500 ring-1 ring-red-500"
                  : "border-gray-300"
                }`}
            />
            {errors.email && (
              <div className="text-red-500 text-sm mt-1">{errors.email}</div>
            )}
          </div>


          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mật khẩu
            </label>
            <input
              name="password"
              type="password"
              placeholder="Mật khẩu từ 6 - 20 kí tự."
              onFocus={handleFocus}
              onChange={handleChangeValue}
              className={`w-full px-4 py-2 border rounded-lg placeholder-gray-400 focus:ring-2 focus:ring-[#2bf0b5] focus:outline-none ${errors.password
                  ? "border-red-500 ring-1 ring-red-500"
                  : "border-gray-300"
                }`}
            />
            {errors.password && (
              <div className="text-red-500 text-sm mt-1">
                {errors.password}
              </div>
            )}
          </div>


          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Xác nhận mật khẩu
            </label>
            <input
              name="confirmed_password"
              type="password"
              placeholder="Nhập lại mật khẩu"
              onFocus={handleFocus}
              onChange={handleChangeValue}
              className={`w-full px-4 py-2 border rounded-lg placeholder-gray-400 focus:ring-2 focus:ring-[#2bf0b5] focus:outline-none ${errors.confirmed_password
                  ? "border-red-500 ring-1 ring-red-500"
                  : "border-gray-300"
                }`}
            />
            {errors.confirmed_password && (
              <div className="text-red-500 text-sm mt-1">
                {errors.confirmed_password}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              id="agree-checkbox"
              type="checkbox"
              checked={agree}
              onChange={handleAgree}
              className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-400"
            />
            <label
              htmlFor="agree-checkbox"
              className="text-sm text-gray-700 select-none"
            >
              Tôi đồng ý với các điều khoản và dịch vụ.
            </label>
          </div>


          {errors.form && (
            <div className="text-center text-red-500 text-sm mt-2">
              {errors.form}
            </div>
          )}


          <button
            type="submit"
            disabled={!agree || isSubmitting}
            className={`w-full py-2.5 text-white font-semibold rounded-lg transition ${!agree || isSubmitting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#2bf0b5] hover:bg-[#00ffc6]  cursor-pointer"
              }`}
          >
            {isSubmitting ? "Đang xử lý..." : "Đăng ký"}
          </button>


          <div className="text-center mt-4 text-sm">
            <span className="text-gray-600">Đã có tài khoản?</span>
            <Link
              to="/login"
              className="!text-[#2bf0b5] !font-semibold ml-1 !no-underline"
            >
              Đăng nhập
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
//**Hết phần code do Nguyễn Vũ Trường Huy thực hiện