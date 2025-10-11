import React, { useState } from "react";
import "./AddUserInfoPage.css";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../lib/apiServices"; // để refetch profile
import { useAuth } from "../hooks/useAuth"; // để cập nhật context user

export default function AddUserInfoPage() {
  const [form, setForm] = useState({
    last_name: "",
    first_name: "",
    gender: "",
    dob: "",
    phoneNum: "",
  });

  const [agree, setAgree] = useState(false); //trạng thái checkbox
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { user, setUser } = useAuth?.() || {};

  const handleAgree = (e) => {
    setAgree(e.target.checked); //giá trị true/false của checkbox
  };

  const handleChangeValue = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // Khi focus vào input → xóa lỗi của field đó
  const handleFocus = (e) => {
    const fieldName = e.target.name;
    if (errors[fieldName]) {
      const newErrors = { ...errors };
      delete newErrors[fieldName];
      setErrors(newErrors);
    }
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    const { last_name, first_name, gender, dob, phoneNum } = form;
    const newErrors = {}; //chứa tất cả lỗi

    if (!last_name.trim()) {
      // check họ và tên có trống không
      newErrors.last_name = "Vui lòng điền đầy đủ họ tên.";
    } else if (last_name.trim().length < 1 || last_name.trim().length > 20) {
      newErrors.last_name = "Họ giới hạn từ 1-20 kí tự.";
    }

    if (!first_name.trim()) {
      newErrors.first_name = "Vui lòng điền đầy đủ họ tên.";
    } else if (first_name.trim().length < 1 || first_name.trim().length > 10) {
      newErrors.first_name = "Tên giới hạn từ 1-10 kí tự.";
    }
    if (!gender) {
      newErrors.gender = "Vui lòng chọn giới tính";
    }

    if (!dob) {
      newErrors.dob = "Vui lòng chọn ngày sinh";
    }

    if (!phoneNum || phoneNum.trim() === "") {
      newErrors.phoneNum = "Số điện thoại không được để trống";
    } else if (!/^0\d{9}$/.test(phoneNum)) {
      newErrors.phoneNum = "Số điện thoại 10 số bắt đầu bằng số 0";
    }

    setErrors(newErrors);

    // Chỉ gọi API nếu không có lỗi validation
    if (Object.keys(newErrors).length === 0) {
      setIsSubmitting(true);
      try {

        // Refetch profile để lấy user mới nhất
        const prof = await authAPI.getProfile().catch(() => null);
        const updatedUser =
          prof?.data?.result || {
            ...(user || {}),
            lastName: last_name.trim(),
            firstName: first_name.trim(),
            gender: Number(gender),
            dateOfBirth: dob,
            phone: phoneNum.trim(),
          };

        // Cập nhật context + localStorage (quan trọng để guard không redirect lại)
        if (typeof setUser === "function") setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));

        // Điều hướng về trang driver
        navigate("/driver"); // hoặc "/driver/dashboard" tùy router của bạn
      } catch (err) {
        console.error("Lỗi khi cập nhật thông tin:", err);
        if (
          err.message?.includes("Failed to fetch") ||
          err.message?.includes("NetworkError")
        ) {
          alert("Không thể kết nối tới server (lỗi mạng hoặc server không phản hồi)!");
        } else {
          alert(err.response?.data?.message || err.message || "Cập nhật thất bại");
        }
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  return (
    <div className="Background">
      <div className="container">
        <Form className="form-container" onSubmit={handleSubmitForm}>
          <div className="title">
            <h1>Vui lòng nhập thông tin</h1>
          </div>
          <Form.Group className="mb-3" controlId="form-user-fullname">
            <Form.Label>Họ và tên</Form.Label>
            <div className="fullname">
              <Form.Control
                onFocus={handleFocus}
                onChange={handleChangeValue}
                style={{
                  borderColor: errors.last_name ? "red" : "",
                  outline: errors.last_name ? "none" : "",
                  boxShadow: errors.last_name
                    ? "0 0 6px rgba(255, 0, 0, 1)"
                    : "",
                }}
                name="last_name"
                className="last-name"
                type="text"
                placeholder="Họ"
              />
              <Form.Control
                style={{
                  borderColor: errors.first_name ? "red" : "",
                  outline: errors.first_name ? "none" : "",
                  boxShadow: errors.first_name
                    ? "0 0 6px rgba(255, 0, 0, 1)"
                    : "",
                }}
                onFocus={handleFocus}
                onChange={handleChangeValue}
                name="first_name"
                className="first-name"
                type="text"
                placeholder="Tên"
              />
            </div>
            {/* Hiển thị lỗi */}
            {(errors.last_name || errors.first_name) && (
              <div style={{ color: "red", marginTop: "4px" }}>
                {errors.last_name || errors.first_name}
              </div>
            )}
          </Form.Group>

          <Form.Group className="mb-3" controlId="form-user-gender">
            <Form.Label>Giới tính</Form.Label>
            <div>
              <Form.Check
                onFocus={handleFocus}
                onChange={handleChangeValue}
                className="form-radio"
                inline
                label="Nam"
                name="gender"
                type="radio"
                id="gender-nam"
                value="0"
              />
              <Form.Check
                onFocus={handleFocus}
                onChange={handleChangeValue}
                className="form-radio"
                inline
                label="Nữ"
                name="gender"
                type="radio"
                id="gender-nu"
                value="1"
              />
            </div>
            {/* Hiển thị lỗi */}
            {errors.gender && (
              <div style={{ color: "red", marginTop: "4px" }}>
                {errors.gender}
              </div>
            )}
          </Form.Group>

          <Form.Group className="mb-3" controlId="form-user-dob">
            <Form.Label>Ngày tháng năm sinh</Form.Label>
            <Form.Control
              style={{
                borderColor: errors.dob ? "red" : "",
                outline: errors.dob ? "none" : "",
                boxShadow: errors.dob ? "0 0 6px rgba(255, 0, 0, 1)" : "",
              }}
              onFocus={handleFocus}
              onChange={handleChangeValue}
              name="dob"
              className="placeholdertxt"
              lang="vi"
              type="date"
            />
            {/* Hiển thị lỗi */}
            {errors.dob && (
              <div style={{ color: "red", marginTop: "4px" }}>{errors.dob}</div>
            )}
          </Form.Group>

          <Form.Group className="mb-3" controlId="form-user-phoneNum">
            <Form.Label>Số điện thoại</Form.Label>
            <Form.Control
              style={{
                borderColor: errors.phoneNum ? "red" : "",
                outline: errors.phoneNum ? "none" : "",
                boxShadow: errors.phoneNum ? "0 0 6px rgba(255, 0, 0, 1)" : "",
              }}
              onFocus={handleFocus}
              onChange={handleChangeValue}
              name="phoneNum"
              className="placeholdertxt"
              type="text"
              placeholder="+84-XXX-XXX-XXX"
            />
            {/* Hiển thị lỗi */}
            {errors.phoneNum && (
              <div style={{ color: "red", marginTop: "4px" }}>
                {errors.phoneNum}
              </div>
            )}
          </Form.Group>

          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              onChange={handleAgree}
            />
            <label className="form-check-label">
              Tôi xin cam đoan mọi thông tin trên đều chuẩn xác.
            </label>
          </div>

          <Button
            variant="primary"
            type="submit"
            disabled={!agree || isSubmitting}
          >
            {isSubmitting ? "Đang xử lý..." : "Xác nhận"}
          </Button>
        </Form>
        <Button variant="logout" type="submit">
          Đăng xuất
        </Button>
      </div>
    </div>
  );
}
