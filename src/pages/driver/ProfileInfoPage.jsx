import React, { useState, useEffect } from "react";
import { Card, Button, Form, Row, Col, Spinner, Alert } from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";
import { useAuth } from "../../hooks/useAuth.jsx";
import { usersAPI } from "../../lib/apiServices.js";
import toast from "react-hot-toast";
import LoadingSpinner from "../../components/loading_spins/LoadingSpinner.jsx";

const ProfileInfoPage = () => {
  const { user, updateUser } = useAuth();

  // Local state
  const [loading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [validated, setValidated] = useState(false);

  // Local form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "F",
    address: "",
  });

  // Cập nhật form data từ useAuth.user
  useEffect(() => {
    const updateFormData = () => {
      // Read from localStorage in case useAuth hasn't updated yet
      let currentUser = user;
      if (!currentUser || !currentUser.firstName) {
        try {
          currentUser = JSON.parse(localStorage.getItem("user") || "{}");
        } catch (e) {
          console.error("Error reading user from localStorage:", e);
        }
      }

      if (currentUser) {
        setFormData({
          firstName: currentUser.firstName || "",
          lastName: currentUser.lastName || "",
          email: currentUser.email || "",
          phone: currentUser.phone || "",
          dateOfBirth: currentUser.dateOfBirth
            ? currentUser.dateOfBirth.split("T")[0]
            : "",
          gender: currentUser.gender === "M" ? "M" : "F",
          address: currentUser.address || "",
        });
      }
    };

    updateFormData();

    // Listen for storage events to update when ProfileLayout updates localStorage
    const handleStorageChange = () => {
      updateFormData();
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [user]);

  // Xử lý khi người dùng thay đổi giá trị trong form
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Xóa thông báo khi người dùng bắt đầu nhập
    if (error) setError(null);
    if (successMessage) setSuccessMessage("");
  };

  // SỬA 3: Xóa hàm handleGenderChange (không cần thiết nữa)

  // Kiểm tra tính hợp lệ của từng trường
  const isFieldValid = (fieldName) => {
    const value = formData[fieldName]?.trim();
    switch (fieldName) {
      case "firstName":
      case "lastName":
        // Regex này hỗ trợ ký tự tiếng Việt có dấu
        return value && value.length >= 2 && /^[\p{L}\s]+$/u.test(value);
      case "email":
        return value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      case "phone": {
        if (!value) return true; // Trường này không bắt buộc
        const cleanPhone = value.replace(/\s/g, "");
        return /^0\d{9}$/.test(cleanPhone);
      }
      default:
        return true;
    }
  };

  const resetForm = () => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split("T")[0] : "",
        gender: user.gender === "M" ? "M" : "F",
        address: user.address || "",
      });
    }
    setValidated(false);
    setError(null);
    setSuccessMessage("");
  };

  // Xử lý khi người dùng nhấn nút "Lưu thay đổi"
  const handleSubmit = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    // Kích hoạt trạng thái validation của Bootstrap
    setValidated(true);

    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      return;
    }

    // Kiểm tra các regex phức tạp hơn
    if (
      !isFieldValid("firstName") ||
      !isFieldValid("lastName") ||
      !isFieldValid("email") ||
      !isFieldValid("phone")
    ) {
      return;
    }

    try {
      setIsUpdating(true);
      setError(null);
      setSuccessMessage("");

      // SỬA 4: Chỉ gửi những dữ liệu API PATCH cho phép
      const allowedUpdateKeys = [
        "phone",
        "dateOfBirth",
        "gender",
        "firstName",
        "lastName",
        "address",
      ];

      const updateData = Object.keys(formData).reduce((acc, key) => {
        // Chỉ thêm vào đối tượng nếu key nằm trong danh sách cho phép
        if (allowedUpdateKeys.includes(key)) {
          const value = formData[key];
          if (typeof value === "string") {
            acc[key] = value.trim();
          } else {
            acc[key] = value; // Giữ nguyên (cho trường hợp gender, mặc dù nó đã là string)
          }
        }
        return acc;
      }, {});

      // Xử lý trường hợp ngày sinh rỗng (gửi null thay vì string rỗng)
      if (updateData.dateOfBirth === "") {
        updateData.dateOfBirth = null;
      }


      // Gọi API update trực tiếp
      setIsUpdating(true);
      setError(null);

      const response = await usersAPI.updateDriverInfo(updateData);

      // Xử lý response
      const responseData = response.data;
      if (responseData && responseData.code === 1000) {
        // Cập nhật user trong AuthContext
        const mergedUser = {
          ...user,                // Giữ lại dữ liệu cũ (role, phone, token, ...)
          ...responseData.result, // Gộp dữ liệu mới từ API
          ...updateData,          // Gộp dữ liệu người dùng nhập
          fullName: `${updateData.firstName || user?.firstName || ""} ${updateData.lastName || user?.lastName || ""
            }`.trim(),
        };

        updateUser(mergedUser);
        localStorage.setItem("user", JSON.stringify(mergedUser)); // đồng bộ lại localStorage

        const message = "✅ Cập nhật thông tin thành công!";
        setSuccessMessage(message);
        toast.success(message);
        setIsEditMode(false);
      } else {
        throw new Error(responseData?.message || "Cập nhật thất bại");
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Không thể cập nhật thông tin. Vui lòng thử lại.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading && !user) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "50vh" }}
      >
        <Spinner animation="border" variant="primary" />
        <p className="ms-3 mb-0 text-muted">Đang tải thông tin...</p>
      </div>
    );
  }

  const fullNameDisplay =
    user?.fullName && user.fullName !== "null null"
      ? user.fullName
      : `${formData.firstName} ${formData.lastName}`.trim() || "Chưa cập nhật";

  return (
    <div className="p-3">
      {/* Header của trang với nút chỉnh sửa */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Thông tin cá nhân</h2>
          <p className="text-muted mb-0">
            {isEditMode
              ? "Cập nhật và quản lý thông tin cá nhân của bạn"
              : "Xem thông tin cá nhân của bạn"}
          </p>
        </div>
        {!isEditMode ? (
          <Button
            style={{
              backgroundColor: "#22c55e",
              borderColor: "#22c55e",
              color: "white"
            }}
            onClick={() => setIsEditMode(true)}
            className="d-flex align-items-center"
          >
            <i className="bi bi-pencil me-2"></i>
            Chỉnh sửa
          </Button>
        ) : (
          <div className="d-flex gap-2">
            <Button
              variant="outline-secondary"
              onClick={() => {
                setIsEditMode(false);
                resetForm();
              }}
            >
              <i className="bi bi-x-lg me-2"></i>
              Hủy
            </Button>
          </div>
        )}
      </div>
      {/* Form thông tin */}
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-4">
          <Form
            noValidate
            validated={validated && isEditMode}
            onSubmit={handleSubmit}
          >
            <Row className="mb-3">
              <Form.Group as={Col} md="6" controlId="firstName">
                <Form.Label>
                  Họ {isEditMode && <span className="text-danger">*</span>}
                </Form.Label>
                <Form.Control
                  required={isEditMode}
                  type="text"
                  placeholder={isEditMode ? "Nhập họ" : "Chưa cập nhật"}
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  readOnly={!isEditMode}
                  className={!isEditMode ? "bg-light" : ""}
                  pattern="^[\p{L}\s]{2,}$"
                />
                <Form.Control.Feedback type="invalid">
                  Họ phải có ít nhất 2 ký tự và chỉ chứa chữ cái (hỗ trợ tiếng
                  Việt có dấu).
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group as={Col} md="6" controlId="lastName">
                <Form.Label>
                  Tên {isEditMode && <span className="text-danger">*</span>}
                </Form.Label>
                <Form.Control
                  required={isEditMode}
                  type="text"
                  placeholder={isEditMode ? "Nhập tên" : "Chưa cập nhật"}
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  readOnly={!isEditMode}
                  className={!isEditMode ? "bg-light" : ""}
                  pattern="^[\p{L}\s]{2,}$"
                />
                <Form.Control.Feedback type="invalid">
                  Tên phải có ít nhất 2 ký tự và chỉ chứa chữ cái (hỗ trợ tiếng
                  Việt có dấu).
                </Form.Control.Feedback>
              </Form.Group>
            </Row>

            <Row className="mb-3">
              <Form.Group as={Col} md="6" controlId="fullName">
                <Form.Label>Họ và tên đầy đủ</Form.Label>
                <Form.Control
                  type="text"
                  value={fullNameDisplay}
                  readOnly
                  className="bg-light"
                />
              </Form.Group>

              <Form.Group as={Col} md="6" controlId="email">
                <Form.Label>
                  Email {isEditMode && <span className="text-danger">*</span>}
                </Form.Label>
                <Form.Control
                  required={isEditMode}
                  type="email"
                  placeholder={
                    isEditMode ? "Nhập địa chỉ email" : "Chưa cập nhật"
                  }
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  // SỬA 5: Email luôn luôn ReadOnly vì không được phép cập nhật
                  readOnly={true}
                  className={"bg-light"} // Luôn luôn là bg-light
                  pattern="^[^\s@]+@[^\s@]+\.[^\s@]+$"
                />
                <Form.Control.Feedback type="invalid">
                  Vui lòng nhập địa chỉ email hợp lệ.
                </Form.Control.Feedback>
                {isEditMode && (
                  <Form.Text className="text-muted">
                    Email không thể thay đổi.
                  </Form.Text>
                )}
              </Form.Group>
            </Row>

            <Row className="mb-3">
              <Form.Group as={Col} md="6" controlId="phone">
                <Form.Label>Số điện thoại</Form.Label>
                <Form.Control
                  type="tel"
                  placeholder={isEditMode ? "VD: 0901234567" : "Chưa cập nhật"}
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  readOnly={!isEditMode}
                  className={!isEditMode ? "bg-light" : ""}
                  pattern="^0\d{9}$"
                />
                <Form.Control.Feedback type="invalid">
                  Số điện thoại phải bắt đầu bằng số 0 và có đúng 10 chữ số.
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group as={Col} md="6" controlId="dateOfBirth">
                <Form.Label>Ngày sinh</Form.Label>
                <Form.Control
                  type={isEditMode ? "date" : "text"}
                  name="dateOfBirth"
                  value={
                    isEditMode
                      ? formData.dateOfBirth
                      : formData.dateOfBirth
                        ? new Date(formData.dateOfBirth).toLocaleDateString(
                          "vi-VN"
                        )
                        : "Chưa cập nhật"
                  }
                  onChange={handleChange}
                  readOnly={!isEditMode}
                  className={!isEditMode ? "bg-light" : ""}
                  max={new Date().toISOString().split("T")[0]}
                />
              </Form.Group>
            </Row>

            <Row className="mb-3">
              <Form.Group as={Col} md="6" controlId="gender">
                <Form.Label>Giới tính</Form.Label>
                {/* SỬA 6: Cập nhật logic cho gender */}
                {isEditMode ? (
                  <Form.Select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange} // Dùng handleChange chung
                  >
                    <option value="F">Nữ</option>
                    <option value="M">Nam</option>
                  </Form.Select>
                ) : (
                  <Form.Control
                    type="text"
                    value={formData.gender === "M" ? "Nam" : "Nữ"}
                    readOnly
                    className="bg-light"
                  />
                )}
              </Form.Group>

              <Form.Group as={Col} md="6" controlId="role">
                <Form.Label>Vai trò</Form.Label>
                <Form.Control
                  type="text"
                  value={user?.role || "DRIVER"}
                  readOnly
                  className="bg-light"
                />
              </Form.Group>
            </Row>

            <Row className="mb-3">
              <Form.Group as={Col} md="12" controlId="address">
                <Form.Label>Địa chỉ</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={isEditMode ? 3 : 2}
                  placeholder={
                    isEditMode
                      ? "Nhập địa chỉ chi tiết (tùy chọn)"
                      : "Chưa cập nhật"
                  }
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  readOnly={!isEditMode}
                  className={!isEditMode ? "bg-light" : ""}
                  maxLength={500}
                />
                {isEditMode && (
                  <Form.Text className="text-muted">
                    Tối đa 500 ký tự.
                  </Form.Text>
                )}
              </Form.Group>
            </Row>

            {isEditMode && (
              <div className="d-flex justify-content-between align-items-center mt-4">
                <div className="d-flex gap-2">
                  <Button
                    type="submit"
                    disabled={isUpdating}
                    className="px-4"
                    style={{
                      backgroundColor: "#22c55e",
                      borderColor: "#22c55e",
                      color: "white"
                    }}
                  >
                    {isUpdating ? (
                      <>
                        Đang lưu...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-save me-2"></i>
                        Lưu thay đổi
                      </>
                    )}
                  </Button>

                  <Button
                    variant="outline-secondary"
                    type="button"
                    disabled={isUpdating}
                    onClick={resetForm}
                  >
                    <i className="bi bi-arrow-clockwise me-2"></i>
                    Hoàn tác
                  </Button>
                </div>
                <small className="text-muted">
                  <span className="text-danger">*</span> Thông tin bắt buộc
                </small>
              </div>
            )}
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default ProfileInfoPage;
