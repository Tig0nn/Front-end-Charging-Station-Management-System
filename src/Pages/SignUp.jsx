import React, { useState } from "react";
import "./SignUp.css";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { Link } from "react-router-dom";
import { authAPI } from "../lib/apiServices";

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

  // Khi người dùng focus (nhấp chuột) vào một ô input, hàm này sẽ được gọi.
  // Nó kiểm tra xem có lỗi nào đang hiển thị cho ô đó không, nếu có thì sẽ xóa lỗi đó đi.
  // Điều này giúp cải thiện trải nghiệm người dùng.
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

    // Phần kiểm tra (validation) dữ liệu
    if (!email.trim()) {
      // check email có trống không
      newErrors.email = "Vui lòng điền email.";
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Định dạng email không hợp lệ.";
    }

    if (!password.trim()) {
      //check password có trống không
      newErrors.password = "Vui lòng điền mật khẩu.";
    } else if (password.trim().length < 5 || password.trim().length > 20) {
      newErrors.password = "Mật khẩu phải từ 5 đến 20 kí tự.";
    }

    if (!confirmed_password.trim()) {
      newErrors.confirmed_password = "Vui lòng xác nhận lại mật khẩu.";
    } else if (password.trim() !== confirmed_password.trim()) {
      newErrors.confirmed_password = "Mật khẩu không giống nhau.";
    }

    // Cập nhật state 'errors' với các lỗi vừa tìm thấy.
    // Việc này sẽ khiến component render lại và hiển thị các thông báo lỗi.
    setErrors(newErrors);

    // Chỉ gọi API nếu không có lỗi validation
    if (Object.keys(newErrors).length === 0) {
      setIsSubmitting(true);
      try {
        // Gọi API đăng ký bằng axios
        const response = await authAPI.register({
          email: email.trim(),
          password: password,
        });

        console.log("Registration successful:", response.data);
        alert("Đăng ký thành công!");
        // Tùy chọn: Chuyển người dùng đến trang đăng nhập
        // navigate("/login");
      } catch (err) {
        console.error("Lỗi khi đăng ký:", err);

        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Đã có lỗi không xác định";

        // Hiển thị lỗi dựa trên response
        if (err.response?.status === 400) {
          setErrors({ email: "Email đã được sử dụng" });
        } else if (err.message.includes("Network Error")) {
          setErrors({ form: "Lỗi mạng: Không thể kết nối đến máy chủ" });
        } else {
          alert(errorMessage);
        }
      } finally {
        setIsSubmitting(false);
      }
    }

    console.log(email, password, confirmed_password); //Check thông tin trên console
  };
  return (
    <div className="signup-page">
      <div className="Background">
        <Link
          to="/"
        >
           <img className="logo" src="src/icon/logo.png" />      

        </Link>
        <div className="container">
          <Form className="form-container" onSubmit={handleSubmit}>
            <div className="title">
              <h1>Đăng ký</h1>
            </div>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control
                style={{
                  borderColor: errors.email ? "red" : "",
                  outline: errors.email ? "none" : "",
                  boxShadow: errors.email ? "0 0 6px rgba(255, 0, 0, 1)" : "",
                }}
                name="email"
                onFocus={handleFocus}
                onChange={handleChangeValue}
                className="placeholdertxt"
                type="text"
                placeholder="example123@gmail.com"
              />
              {/* Hiển thị lỗi */}
              {errors.email && (
                <div style={{ color: "red", marginTop: "2px" }}>
                  {errors.email}
                </div>
              )}
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label>Mật khẩu</Form.Label>
              <Form.Control
                style={{
                  borderColor: errors.password ? "red" : "",
                  outline: errors.password ? "none" : "",
                  boxShadow: errors.password
                    ? "0 0 6px rgba(255, 0, 0, 1)"
                    : "",
                }}
                onFocus={handleFocus}
                onChange={handleChangeValue}
                name="password"
                className="placeholdertxt"
                type="password"
                placeholder="Mật khẩu từ 5 - 20 kí tự."
              />
              {/* Hiển thị lỗi */}
              {errors.password && (
                <div style={{ color: "red", marginTop: "2px" }}>
                  {errors.password}
                </div>
              )}
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicConfirmedPassword">
              <Form.Label>Xác nhận mật khẩu</Form.Label>
              <Form.Control
                style={{
                  borderColor: errors.confirmed_password ? "red" : "",
                  outline: errors.confirmed_password ? "none" : "",
                  boxShadow: errors.confirmed_password
                    ? "0 0 6px rgba(255, 0, 0, 1)"
                    : "",
                }}
                onFocus={handleFocus}
                onChange={handleChangeValue}
                name="confirmed_password"
                className="placeholdertxt"
                type="password"
              />
              {/* Hiển thị lỗi */}
              {errors.confirmed_password && (
                <div style={{ color: "red", marginTop: "2px" }}>
                  {errors.confirmed_password}
                </div>
              )}
            </Form.Group>

            <Button
              variant="primary"
              type="submit"
              disabled={!agree || isSubmitting}
            >
              {isSubmitting ? "Đang xử lý..." : "Đăng ký"}
            </Button>

            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                onChange={handleAgree}
              />
              <label className="form-check-label">
                Tôi đồng ý với các điều khoản và dịch vụ.
              </label>
            </div>

            <div className="login">
              <label>Đã có tài khoản? </label>{" "}
              <Link
                to="/"
                className="text-[#68ffc2] ml-1 font-semibold hover:underline"
              >
                Đăng nhập
              </Link>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}
