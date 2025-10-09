import React, { useState, useEffect } from "react";
import { Card, Button, Form, Row, Col, Spinner, Alert } from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";
import { mockDriverApi } from "../../lib/mockApi.js"; // Import API mới

const VehicleInfoPage = () => {
  const [vehicleInfo, setVehicleInfo] = useState({
    brand: "",
    model: "",
    year: "",
    licensePlate: "",
    batteryCapacity: "",
    connectorType: "",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [validated, setValidated] = useState(false);

  // Tải thông tin xe khi component được mount
  useEffect(() => {
    const fetchVehicleInfo = async () => {
      try {
        setLoading(true);
        setError("");
        setSuccessMessage("");

        const response = await mockDriverApi.getVehicleInfo();

        if (response.success && response.data) {
          setVehicleInfo(response.data);
        } else {
          throw new Error("Không tìm thấy dữ liệu xe.");
        }
      } catch (err) {
        console.error("❌ Lỗi tải thông tin xe:", err);
        setError("Không thể tải thông tin xe. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };

    fetchVehicleInfo();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setVehicleInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

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
      console.log("✅ Đang cập nhật thông tin xe:", vehicleInfo);

      const response = await mockDriverApi.updateVehicleInfo(vehicleInfo);

      if (response.success) {
        setSuccessMessage("Thông tin xe đã được cập nhật thành công!");
        setValidated(false);
      } else {
        throw new Error(response.message || "Cập nhật thất bại.");
      }
    } catch (err) {
      console.error("❌ Lỗi cập nhật thông tin xe:", err);
      setError("Không thể cập nhật thông tin xe. Vui lòng thử lại.");
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2 text-muted">Đang tải thông tin xe...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-4">
        <h2 className="mb-1">Thông tin xe điện</h2>
        <p className="text-muted mb-0">Quản lý thông tin xe điện của bạn</p>
      </div>

      {/* Thông báo Lỗi hoặc Thành công */}
      {error && <Alert variant="danger">{error}</Alert>}
      {successMessage && <Alert variant="success">{successMessage}</Alert>}

      {/* Form */}
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-4">
          <Form noValidate validated={validated} onSubmit={handleSubmit}>
            {/* Hàng 1: Hãng xe & Mẫu xe */}
            <Row className="mb-3">
              <Form.Group as={Col} md="6" controlId="brand">
                <Form.Label>Hãng xe</Form.Label>
                <Form.Control
                  required
                  type="text"
                  placeholder="VD: Vinfast"
                  name="brand"
                  value={vehicleInfo.brand}
                  onChange={handleChange}
                />
                <Form.Control.Feedback type="invalid">
                  Vui lòng nhập hãng xe.
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group as={Col} md="6" controlId="model">
                <Form.Label>Mẫu xe</Form.Label>
                <Form.Control
                  required
                  type="text"
                  placeholder="VD: VF8"
                  name="model"
                  value={vehicleInfo.model}
                  onChange={handleChange}
                />
                <Form.Control.Feedback type="invalid">
                  Vui lòng nhập mẫu xe.
                </Form.Control.Feedback>
              </Form.Group>
            </Row>

            {/* Hàng 2: Năm sản xuất & Biển số xe */}
            <Row className="mb-3">
              <Form.Group as={Col} md="6" controlId="year">
                <Form.Label>Năm sản xuất</Form.Label>
                <Form.Control
                  required
                  type="number"
                  placeholder="VD: 2023"
                  name="year"
                  value={vehicleInfo.year}
                  onChange={handleChange}
                />
                <Form.Control.Feedback type="invalid">
                  Vui lòng nhập năm sản xuất.
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group as={Col} md="6" controlId="licensePlate">
                <Form.Label>Biển số xe</Form.Label>
                <Form.Control
                  required
                  type="text"
                  placeholder="VD: 51K-123.45"
                  name="licensePlate"
                  value={vehicleInfo.licensePlate}
                  onChange={handleChange}
                />
                <Form.Control.Feedback type="invalid">
                  Vui lòng nhập biển số xe.
                </Form.Control.Feedback>
              </Form.Group>
            </Row>

            {/* Hàng 3: Dung lượng pin & Loại cổng sạc */}
            <Row className="mb-4">
              <Form.Group as={Col} md="6" controlId="batteryCapacity">
                <Form.Label>Dung lượng pin</Form.Label>
                <Form.Control
                  required
                  type="text"
                  placeholder="VD: 82 kWh"
                  name="batteryCapacity"
                  value={vehicleInfo.batteryCapacity}
                  onChange={handleChange}
                />
                <Form.Control.Feedback type="invalid">
                  Vui lòng nhập dung lượng pin.
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group as={Col} md="6" controlId="connectorType">
                <Form.Label>Loại cổng sạc</Form.Label>
                <Form.Select
                  required
                  name="connectorType"
                  value={vehicleInfo.connectorType}
                  onChange={handleChange}
                >
                  <option value="">Chọn cổng sạc...</option>
                  <option value="Type 2">Type 2</option>
                  <option value="CCS Combo 1">CCS Combo 1</option>
                  <option value="CCS Combo 2">CCS Combo 2</option>
                  <option value="CHAdeMO">CHAdeMO</option>
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  Vui lòng chọn loại cổng sạc.
                </Form.Control.Feedback>
              </Form.Group>
            </Row>

            {/* Nút Cập nhật */}
            <div className="d-flex justify-content-start">
              <Button variant="dark" type="submit">
                <i className="bi bi-car-front-fill me-2"></i> Cập nhật thông tin
                xe
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default VehicleInfoPage;
