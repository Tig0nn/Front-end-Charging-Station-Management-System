//**Phần code này do Nguyễn Vũ Trường Huy thực hiện
//Khai báo, import thư viện
import React, { useState } from "react";
import "./SignUp.css";
import "./BackGround.css";
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
    } else if (password.trim().length < 5 || password.trim().length > 20) {
      newErrors.password = "Mật khẩu phải từ 5 đến 20 kí tự.";
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
            setErrors({ form: errorMessage });
          }
        } else {
          setErrors({ form: errorMessage });
        }
      } finally {
        setIsSubmitting(false);
      }
    }
    //Check thông tin trên console
    console.log(email, password, confirmed_password); 
  };
  return (
    <div className="signup-page">
      <div className="background">
        <Link to="/">
          <img className="logo" src={logo} alt="Logo" />
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

              <Form.Check
                type="checkbox"
                id="agree-checkbox"
                label="Tôi đồng ý với các điều khoản và dịch vụ."
                checked={agree}
                onChange={handleAgree}
              />


            {errors.form&& (
              <div
                style={{ color: "red", marginTop: "10px", textAlign: "center" }}
              >
                {errors.form}
              </div>
            )}

            <Button
              variant="primary"
              type="submit"
              disabled={!agree || isSubmitting}
              className="w-100"
            >
              {isSubmitting ? "Đang xử lý..." : "Đăng ký"}
            </Button>


            <div className="login">
              <label>Đã có tài khoản? </label>{" "}
              <Link
                to="/login"
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
//**Hết phần code do Nguyễn Vũ Trường Huy thực hiện