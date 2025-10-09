import React, { useState, useEffect } from "react";
import { Card, Button, Form, Row, Col, Spinner, Alert } from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";
import { mockDriverApi } from "../../lib/mockApi.js"; // Import API mới
// import { driverAPI } from "../../lib/apiServices.js"; // Giả định bạn có một file API cho driver

// --- MOCK API CALL (Để bạn có thể chạy ngay mà không cần API thật) ---

const ProfileInfoPage = () => {
  // State để lưu thông tin driver, ban đầu là rỗng
  const [driverInfo, setDriverInfo] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    emergencyContact: "",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [validated, setValidated] = useState(false);

  // Tải thông tin cá nhân của driver khi component được mount
  useEffect(() => {
    const fetchDriverInfo = async () => {
      try {
        setLoading(true);
        setError("");
        setSuccessMessage("");

        // Thay mockDriverAPI bằng driverAPI thật của bạn
        const response = await mockDriverApi.getProfile();

        if (response.success && response.data) {
          setDriverInfo(response.data);
        } else {
          throw new Error("Không tìm thấy dữ liệu người dùng.");
        }
      } catch (err) {
        console.error("❌ Lỗi tải thông tin cá nhân:", err);
        setError("Không thể tải thông tin cá nhân. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };

    fetchDriverInfo();
  }, []);

  // Xử lý khi người dùng thay đổi giá trị trong form
  const handleChange = (e) => {
    const { name, value } = e.target;
    setDriverInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Xử lý khi người dùng nhấn nút "Lưu thay đổi"
  const handleSubmit = async (event) => {
    const form = event.currentTarget;
    event.preventDefault();

    if (form.checkValidity() === false) {
      event.stopPropagation();
      setValidated(true);
      return;
    }

    try {
      setError("");
      setSuccessMessage("");
      console.log("✅ Đang cập nhật thông tin:", driverInfo);

      // Thay mockDriverAPI bằng driverAPI thật của bạn
      const response = await mockDriverApi.updateProfile(driverInfo);

      if (response.success) {
        setSuccessMessage("Thông tin cá nhân đã được cập nhật thành công!");
        setValidated(false);
      } else {
        throw new Error(response.message || "Cập nhật thất bại.");
      }
    } catch (err) {
      console.error("❌ Lỗi cập nhật thông tin:", err);
      setError("Không thể cập nhật thông tin. Vui lòng thử lại.");
    }
  };

  // Hiển thị màn hình loading
  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2 text-muted">Đang tải thông tin...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header của trang */}
      <div className="mb-4">
        <h2 className="mb-1">Thông tin cá nhân</h2>
        <p className="text-muted mb-0">
          Cập nhật và quản lý thông tin cá nhân của bạn
        </p>
      </div>

      {/* Thông báo Lỗi hoặc Thành công */}
      {error && <Alert variant="danger">{error}</Alert>}
      {successMessage && <Alert variant="success">{successMessage}</Alert>}

      {/* Form thông tin */}
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-4">
          <Form noValidate validated={validated} onSubmit={handleSubmit}>
            {/* Hàng 1: Họ và tên & Số điện thoại */}
            <Row className="mb-3">
              <Form.Group as={Col} md="6" controlId="fullName">
                <Form.Label>Họ và tên</Form.Label>
                <Form.Control
                  required
                  type="text"
                  placeholder="Nhập họ và tên"
                  name="fullName"
                  value={driverInfo.fullName}
                  onChange={handleChange}
                />
                <Form.Control.Feedback type="invalid">
                  Vui lòng nhập họ và tên.
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group as={Col} md="6" controlId="phone">
                <Form.Label>Số điện thoại</Form.Label>
                <Form.Control
                  required
                  type="tel"
                  placeholder="Nhập số điện thoại"
                  name="phone"
                  value={driverInfo.phone}
                  onChange={handleChange}
                />
                <Form.Control.Feedback type="invalid">
                  Vui lòng nhập số điện thoại hợp lệ.
                </Form.Control.Feedback>
              </Form.Group>
            </Row>

            {/* Hàng 2: Email */}
            <Row className="mb-3">
              <Form.Group as={Col} md="12" controlId="email">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  required
                  type="email"
                  placeholder="Nhập địa chỉ email"
                  name="email"
                  value={driverInfo.email}
                  onChange={handleChange}
                />
                <Form.Control.Feedback type="invalid">
                  Vui lòng nhập địa chỉ email hợp lệ.
                </Form.Control.Feedback>
              </Form.Group>
            </Row>

            {/* Hàng 3: Địa chỉ */}
            <Row className="mb-3">
              <Form.Group as={Col} md="12" controlId="address">
                <Form.Label>Địa chỉ</Form.Label>
                <Form.Control
                  required
                  as="textarea"
                  rows={2}
                  placeholder="Nhập địa chỉ"
                  name="address"
                  value={driverInfo.address}
                  onChange={handleChange}
                />
                <Form.Control.Feedback type="invalid">
                  Vui lòng nhập địa chỉ.
                </Form.Control.Feedback>
              </Form.Group>
            </Row>

            {/* Hàng 4: Liên hệ khẩn cấp */}
            <Row className="mb-4">
              <Form.Group as={Col} md="12" controlId="emergencyContact">
                <Form.Label>Liên hệ khẩn cấp</Form.Label>
                <Form.Control
                  required
                  type="tel"
                  placeholder="Nhập số điện thoại khẩn cấp"
                  name="emergencyContact"
                  value={driverInfo.emergencyContact}
                  onChange={handleChange}
                />
                <Form.Control.Feedback type="invalid">
                  Vui lòng nhập số điện thoại khẩn cấp.
                </Form.Control.Feedback>
              </Form.Group>
            </Row>

            {/* Nút Lưu */}
            <div className="d-flex justify-content-start">
              <Button variant="dark" type="submit">
                <i className="bi bi-save me-2"></i> Lưu thay đổi
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default ProfileInfoPage;
