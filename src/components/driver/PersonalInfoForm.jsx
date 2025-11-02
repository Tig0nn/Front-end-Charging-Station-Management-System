import React, { useState, useEffect } from "react";
import { Card, Form, Row, Col, Button } from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";

const PersonalInfoForm = ({ user, onUpdate }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    address: "",
    emergencyContact: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || "",
        phoneNumber: user.phoneNumber || "",
        email: user.email || "",
        address: user.address || "",
        emergencyContact: user.emergencyContact || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // Call API to update user info
      await onUpdate(formData);
      setIsEditing(false);
      alert("Cập nhật thông tin thành công!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Có lỗi xảy ra khi cập nhật thông tin!");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form to original user data
    setFormData({
      fullName: user?.fullName || "",
      phoneNumber: user?.phoneNumber || "",
      email: user?.email || "",
      address: user?.address || "",
      emergencyContact: user?.emergencyContact || "",
    });
    setIsEditing(false);
  };

  return (
    <Card
      className="border-0"
      style={{
        borderRadius: "20px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
      }}
    >
      <Card.Body className="p-4">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4
            className="mb-0"
            style={{
              fontSize: "18px",
              fontWeight: "600",
              color: "#111827",
            }}
          >
            Thông tin cá nhân
          </h4>
          {!isEditing && (
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => setIsEditing(true)}
              style={{
                borderRadius: "8px",
                padding: "6px 16px",
                fontWeight: "500",
              }}
            >
              <i className="bi bi-pencil me-2"></i>
              Chỉnh sửa
            </Button>
          )}
        </div>

        <p
          className="mb-4"
          style={{
            color: "#6b7280",
            fontSize: "14px",
          }}
        >
          Cập nhật thông tin cá nhân của bạn
        </p>

        <Form onSubmit={handleSubmit}>
          <Row>
            {/* Họ và tên */}
            <Col md={6} className="mb-3">
              <Form.Group>
                <Form.Label
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#374151",
                    marginBottom: "8px",
                  }}
                >
                  Họ và tên
                </Form.Label>
                <Form.Control
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  disabled={!isEditing}
                  style={{
                    borderRadius: "10px",
                    border: "1px solid #e5e7eb",
                    padding: "10px 14px",
                    fontSize: "14px",
                    backgroundColor: isEditing ? "white" : "#f9fafb",
                  }}
                />
              </Form.Group>
            </Col>

            {/* Số điện thoại */}
            <Col md={6} className="mb-3">
              <Form.Group>
                <Form.Label
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#374151",
                    marginBottom: "8px",
                  }}
                >
                  Số điện thoại
                </Form.Label>
                <Form.Control
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="+84 909 123 456"
                  style={{
                    borderRadius: "10px",
                    border: "1px solid #e5e7eb",
                    padding: "10px 14px",
                    fontSize: "14px",
                    backgroundColor: isEditing ? "white" : "#f9fafb",
                  }}
                />
              </Form.Group>
            </Col>

            {/* Email */}
            <Col md={12} className="mb-3">
              <Form.Group>
                <Form.Label
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#374151",
                    marginBottom: "8px",
                  }}
                >
                  Email
                </Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="an.nguyen@example.com"
                  style={{
                    borderRadius: "10px",
                    border: "1px solid #e5e7eb",
                    padding: "10px 14px",
                    fontSize: "14px",
                    backgroundColor: isEditing ? "white" : "#f9fafb",
                  }}
                />
              </Form.Group>
            </Col>

            {/* Địa chỉ */}
            <Col md={12} className="mb-3">
              <Form.Group>
                <Form.Label
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#374151",
                    marginBottom: "8px",
                  }}
                >
                  Địa chỉ
                </Form.Label>
                <Form.Control
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="123 Nguyễn Huệ, Q.1, TP.HCM"
                  style={{
                    borderRadius: "10px",
                    border: "1px solid #e5e7eb",
                    padding: "10px 14px",
                    fontSize: "14px",
                    backgroundColor: isEditing ? "white" : "#f9fafb",
                  }}
                />
              </Form.Group>
            </Col>

            {/* Liên hệ khẩn cấp */}
            <Col md={12} className="mb-3">
              <Form.Group>
                <Form.Label
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#374151",
                    marginBottom: "8px",
                  }}
                >
                  Liên hệ khẩn cấp
                </Form.Label>
                <Form.Control
                  type="tel"
                  name="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="+84 909 999 777"
                  style={{
                    borderRadius: "10px",
                    border: "1px solid #e5e7eb",
                    padding: "10px 14px",
                    fontSize: "14px",
                    backgroundColor: isEditing ? "white" : "#f9fafb",
                  }}
                />
              </Form.Group>
            </Col>
          </Row>

          {/* Action Buttons */}
          {isEditing && (
            <div className="d-flex gap-2 justify-content-end mt-4">
              <Button
                variant="outline-secondary"
                onClick={handleCancel}
                disabled={isSaving}
                style={{
                  borderRadius: "10px",
                  padding: "10px 24px",
                  fontWeight: "600",
                  fontSize: "14px",
                }}
              >
                Hủy
              </Button>
              <Button
                variant="primary"
                type="submit"
                disabled={isSaving}
                style={{
                  borderRadius: "10px",
                  padding: "10px 24px",
                  fontWeight: "600",
                  fontSize: "14px",
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  border: "none",
                }}
              >
                {isSaving ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle me-2"></i>
                    Lưu thay đổi
                  </>
                )}
              </Button>
            </div>
          )}
        </Form>
      </Card.Body>
    </Card>
  );
};

export default PersonalInfoForm;
