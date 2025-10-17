import React, { useState, useEffect } from "react";
import { Card, Button, Form, Row, Col, Spinner, Alert } from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";
// Sử dụng hook thật thay vì mock
import { useDriverProfile } from "../../hooks/useDriverProfile.js";

const ProfileInfoPage = () => {
  const { driverProfile, loading, error, updateProfile, setError } =
    useDriverProfile();

  // Local form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: false,
    address: "",
  });

  const [successMessage, setSuccessMessage] = useState("");
  const [validated, setValidated] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Cập nhật form data khi thông tin tài xế được tải
  useEffect(() => {
    if (driverProfile) {
      setFormData({
        firstName: driverProfile.firstName || "",
        lastName: driverProfile.lastName || "",
        email: driverProfile.email || "",
        phone: driverProfile.phone || "",
        dateOfBirth: driverProfile.dateOfBirth
          ? driverProfile.dateOfBirth.split("T")[0]
          : "",
        gender: driverProfile.gender || false,
        address: driverProfile.address || "",
      });
    }
  }, [driverProfile]);

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

  // Xử lý thay đổi giới tính
  const handleGenderChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      gender: e.target.value === "true",
    }));
    if (error) setError(null);
    if (successMessage) setSuccessMessage("");
  };

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
    if (driverProfile) {
      setFormData({
        firstName: driverProfile.firstName || "",
        lastName: driverProfile.lastName || "",
        email: driverProfile.email || "",
        phone: driverProfile.phone || "",
        dateOfBirth: driverProfile.dateOfBirth
          ? driverProfile.dateOfBirth.split("T")[0]
          : "",
        gender: driverProfile.gender || false,
        address: driverProfile.address || "",
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

      // Chỉ gửi những dữ liệu đã được trim và hợp lệ
      const updateData = Object.keys(formData).reduce((acc, key) => {
        const value = formData[key];
        if (typeof value === "string") {
          acc[key] = value.trim();
        } else {
          acc[key] = value;
        }
        return acc;
      }, {});

      console.log("📝 Sending update data:", updateData);

      const result = await updateProfile(updateData);

      if (result.success) {
        setSuccessMessage("Thông tin tài xế đã được cập nhật thành công!");
        setIsEditMode(false); // Tự động thoát edit mode
        setTimeout(() => setSuccessMessage(""), 5000);
      } else {
        throw new Error(result.error || "Cập nhật thất bại.");
      }
    } catch (err) {
      console.error("❌ Lỗi cập nhật thông tin:", err);
      setError("Không thể cập nhật thông tin. Vui lòng thử lại.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
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
    driverProfile?.fullName && driverProfile.fullName !== "null null"
      ? driverProfile.fullName
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
            variant="primary"
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

      {/* Thông báo Lỗi hoặc Thành công */}
      {successMessage && (
        <Alert
          variant="success"
          onClose={() => setSuccessMessage("")}
          dismissible
        >
          <i className="bi bi-check-circle me-2"></i>
          {successMessage}
        </Alert>
      )}
      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </Alert>
      )}

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
                  readOnly={!isEditMode}
                  className={!isEditMode ? "bg-light" : ""}
                  pattern="^[^\s@]+@[^\s@]+\.[^\s@]+$"
                />
                <Form.Control.Feedback type="invalid">
                  Vui lòng nhập địa chỉ email hợp lệ.
                </Form.Control.Feedback>
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
                {isEditMode ? (
                  <Form.Select
                    name="gender"
                    value={formData.gender.toString()}
                    onChange={handleGenderChange}
                  >
                    <option value="false">Nữ</option>
                    <option value="true">Nam</option>
                  </Form.Select>
                ) : (
                  <Form.Control
                    type="text"
                    value={formData.gender ? "Nam" : "Nữ"}
                    readOnly
                    className="bg-light"
                  />
                )}
              </Form.Group>

              <Form.Group as={Col} md="6" controlId="role">
                <Form.Label>Vai trò</Form.Label>
                <Form.Control
                  type="text"
                  value={driverProfile?.role || "DRIVER"}
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
                    variant="primary"
                    type="submit"
                    disabled={isUpdating}
                    className="px-4"
                  >
                    {isUpdating ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                          className="me-2"
                        />
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
