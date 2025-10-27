import React, { useState } from "react";
import {
  Card,
  Button,
  Form,
  Row,
  Col,
  Spinner,
  Alert,
  Modal,
  Badge,
  Container,
} from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";
import useVehicle from "../../hooks/useVehicle.js";

const VehicleInfoPage = () => {
  const {
    vehicles,
    selectedVehicle,
    loading,
    error,
    successMessage,
    createVehicle,
    updateVehicle,
    deleteVehicle,
    clearMessages,
    setSelectedVehicle,
  } = useVehicle();

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    licensePlate: "",
    model: "",
    batteryCapacityKwh: "",
    batteryType: "Lithium-ion",
  });

  const [validated, setValidated] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  // Battery type options
  const batteryTypes = [
    "Lithium-ion",
    "Lithium-ion NCM",
    "Lithium-ion NCA",
    "LFP",
    "Lithium Iron Phosphate",
    "Solid State",
  ];

  // Reset form data
  const resetForm = () => {
    setFormData({
      licensePlate: "",
      model: "",
      batteryCapacityKwh: "",
      batteryType: "Lithium-ion",
    });
    setValidated(false);
  };

  // Handle form change
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Validate license plate format (Vietnam format)
  const validateLicensePlate = (plate) => {
    // Vietnam license plate formats: 30A-12345, 51K-123.45, 29B-67890
    const regex = /^[0-9]{2}[A-Z]{1,2}-[0-9]{3}\.?[0-9]{2}$/;
    return regex.test(plate);
  };

  // Handle add vehicle
  const handleAddVehicle = async (event) => {
    const form = event.currentTarget;
    event.preventDefault();

    // Custom validation
    let isValid = true;
    const errors = [];

    if (!formData.licensePlate) {
      errors.push("Biển số xe là bắt buộc");
      isValid = false;
    } else if (!validateLicensePlate(formData.licensePlate)) {
      errors.push("Biển số xe không đúng định dạng (VD: 30A-12345)");
      isValid = false;
    }

    if (!formData.model) {
      errors.push("Mẫu xe là bắt buộc");
      isValid = false;
    }

    if (!formData.batteryCapacityKwh) {
      errors.push("Dung lượng pin là bắt buộc");
      isValid = false;
    } else if (
      isNaN(formData.batteryCapacityKwh) ||
      parseFloat(formData.batteryCapacityKwh) <= 0
    ) {
      errors.push("Dung lượng pin phải là số dương");
      isValid = false;
    }

    if (form.checkValidity() === false || !isValid) {
      event.stopPropagation();
      setValidated(true);
      return;
    }

    try {
      setFormLoading(true);
      clearMessages();

      const result = await createVehicle(formData);

      if (result.success) {
        setShowAddModal(false);
        resetForm();
      }
    } catch (err) {
      console.error("Error creating vehicle:", err);
    } finally {
      setFormLoading(false);
    }
  };

  // Handle edit vehicle
  const handleEditVehicle = async (event) => {
    const form = event.currentTarget;
    event.preventDefault();

    if (form.checkValidity() === false) {
      event.stopPropagation();
      setValidated(true);
      return;
    }

    try {
      setFormLoading(true);
      clearMessages();

      const result = await updateVehicle(selectedVehicle.vehicleId, formData);

      if (result.success) {
        setShowEditModal(false);
        resetForm();
      }
    } catch (err) {
      console.error("Error updating vehicle:", err);
    } finally {
      setFormLoading(false);
    }
  };

  // Handle delete vehicle
  const handleDeleteVehicle = async () => {
    if (!vehicleToDelete) return;

    try {
      setFormLoading(true);
      clearMessages();

      const result = await deleteVehicle(vehicleToDelete.vehicleId);

      if (result.success) {
        setShowDeleteModal(false);
        setVehicleToDelete(null);
      }
    } catch (err) {
      console.error("Error deleting vehicle:", err);
    } finally {
      setFormLoading(false);
    }
  };

  // Open edit modal
  const openEditModal = (vehicle) => {
    setSelectedVehicle(vehicle);
    setFormData({
      licensePlate: vehicle.licensePlate || "",
      model: vehicle.model || "",
      batteryCapacityKwh: vehicle.batteryCapacityKwh?.toString() || "",
      batteryType: vehicle.batteryType || "Lithium-ion",
    });
    setValidated(false);
    setShowEditModal(true);
  };

  // Open delete modal
  const openDeleteModal = (vehicle) => {
    setVehicleToDelete(vehicle);
    setShowDeleteModal(true);
  };

  // Open add modal
  const openAddModal = () => {
    resetForm();
    clearMessages();
    setShowAddModal(true);
  };

  // Vehicle Card Component
  const VehicleCard = ({ vehicle }) => (
    <Card className="h-100 shadow-sm border-0">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div>
            <h5 className="mb-1">{vehicle.model}</h5>
            <Badge bg="primary" className="mb-2">
              <i className="bi bi-car-front me-1"></i>
              {vehicle.licensePlate}
            </Badge>
          </div>
          <div className="dropdown">
            <Button
              variant="link"
              className="text-muted p-0"
              data-bs-toggle="dropdown"
            >
              <i className="bi bi-three-dots-vertical"></i>
            </Button>
            <ul className="dropdown-menu dropdown-menu-end">
              <li>
                <button
                  className="dropdown-item"
                  onClick={() => openEditModal(vehicle)}
                >
                  <i className="bi bi-pencil me-2"></i>Chỉnh sửa
                </button>
              </li>
              <li>
                <button
                  className="dropdown-item text-danger"
                  onClick={() => openDeleteModal(vehicle)}
                >
                  <i className="bi bi-trash me-2"></i>Xóa
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="vehicle-details">
          <div className="row g-2 mb-2">
            <div className="col-6">
              <small className="text-muted d-block">Dung lượng pin</small>
              <strong>{vehicle.batteryCapacityKwh} kWh</strong>
            </div>
            <div className="col-6">
              <small className="text-muted d-block">Loại pin</small>
              <strong>{vehicle.batteryType}</strong>
            </div>
          </div>
        </div>
      </Card.Body>
    </Card>
  );

  // Loading state
  if (loading && vehicles.length === 0) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2 text-muted">Đang tải danh sách xe...</p>
      </div>
    );
  }

  return (
    <Container fluid className="px-0">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Quản lý xe điện</h2>
          <p className="text-muted mb-0">
            Quản lý danh sách xe điện của bạn ({vehicles.length} xe)
          </p>
        </div>
        <Button variant="dark" onClick={openAddModal} disabled={loading}>
          <i className="bi bi-plus-circle me-2"></i>
          Thêm xe mới
        </Button>
      </div>

      {/* Alert Messages */}
      {error && (
        <Alert variant="danger" dismissible onClose={clearMessages}>
          {error}
        </Alert>
      )}
      {successMessage && (
        <Alert variant="success" dismissible onClose={clearMessages}>
          {successMessage}
        </Alert>
      )}

      {/* Vehicles Grid */}
      {vehicles.length === 0 ? (
        <Card className="text-center border-0 shadow-sm">
          <Card.Body className="py-5">
            <i className="bi bi-car-front display-1 text-muted mb-3"></i>
            <h4>Chưa có xe nào</h4>
            <p className="text-muted">
              Thêm xe điện đầu tiên của bạn để bắt đầu sử dụng dịch vụ
            </p>
            <Button variant="dark" onClick={openAddModal}>
              <i className="bi bi-plus-circle me-2"></i>
              Thêm xe đầu tiên
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <Row className="g-4">
          {vehicles.map((vehicle) => (
            <Col md={6} lg={4} key={vehicle.vehicleId}>
              <VehicleCard vehicle={vehicle} />
            </Col>
          ))}
        </Row>
      )}

      {/* Add Vehicle Modal */}
      <Modal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-plus-circle me-2"></i>
            Thêm xe mới
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form noValidate validated={validated} onSubmit={handleAddVehicle}>
            <Row className="mb-3">
              <Form.Group as={Col} md="6" controlId="addLicensePlate">
                <Form.Label>
                  Biển số xe <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  required
                  type="text"
                  placeholder="VD: 30A-12345"
                  name="licensePlate"
                  value={formData.licensePlate}
                  onChange={handleFormChange}
                />
                <Form.Control.Feedback type="invalid">
                  Vui lòng nhập biển số xe đúng định dạng.
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group as={Col} md="6" controlId="addModel">
                <Form.Label>
                  Mẫu xe <span className="text-danger">*</span>
                </Form.Label>
                
                <Form.Control
                  required
                  type="text"
                  placeholder="VD: Tesla Model 3"
                  name="model"
                  value={formData.model}
                  onChange={handleFormChange}
                />
                <Form.Control.Feedback type="invalid">
                  Vui lòng nhập mẫu xe.
                </Form.Control.Feedback>
              </Form.Group>
            </Row>

            <Row className="mb-3">
              <Form.Group as={Col} md="6" controlId="addBatteryCapacity">
                <Form.Label>
                  Dung lượng pin (kWh) <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  required
                  type="number"
                  step="0.1"
                  min="1"
                  placeholder="VD: 75.0"
                  name="batteryCapacityKwh"
                  value={formData.batteryCapacityKwh}
                  onChange={handleFormChange}
                />
                <Form.Control.Feedback type="invalid">
                  Vui lòng nhập dung lượng pin hợp lệ.
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group as={Col} md="6" controlId="addBatteryType">
                <Form.Label>
                  Loại pin <span className="text-danger">*</span>
                </Form.Label>
                <Form.Select
                  required
                  name="batteryType"
                  value={formData.batteryType}
                  onChange={handleFormChange}
                >
                  {batteryTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  Vui lòng chọn loại pin.
                </Form.Control.Feedback>
              </Form.Group>
            </Row>

            <div className="d-flex justify-content-end gap-2">
              <Button
                variant="secondary"
                onClick={() => setShowAddModal(false)}
                disabled={formLoading}
              >
                Hủy
              </Button>
              <Button variant="dark" type="submit" disabled={formLoading}>
                {formLoading ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      className="me-2"
                    />
                    Đang thêm...
                  </>
                ) : (
                  <>
                    <i className="bi bi-plus-circle me-2"></i>
                    Thêm xe
                  </>
                )}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Edit Vehicle Modal */}
      <Modal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-pencil me-2"></i>
            Chỉnh sửa xe
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form noValidate validated={validated} onSubmit={handleEditVehicle}>
            <Row className="mb-3">
              <Form.Group as={Col} md="6" controlId="editLicensePlate">
                <Form.Label>Biển số xe</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="VD: 30A-12345"
                  name="licensePlate"
                  value={formData.licensePlate}
                  onChange={handleFormChange}
                />
              </Form.Group>

              <Form.Group as={Col} md="6" controlId="editModel">
                <Form.Label>Mẫu xe</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="VD: Tesla Model 3"
                  name="model"
                  value={formData.model}
                  onChange={handleFormChange}
                />
              </Form.Group>
            </Row>

            <Row className="mb-3">
              <Form.Group as={Col} md="6" controlId="editBatteryCapacity">
                <Form.Label>Dung lượng pin (kWh)</Form.Label>
                <Form.Control
                  type="number"
                  step="0.1"
                  min="1"
                  placeholder="VD: 75.0"
                  name="batteryCapacityKwh"
                  value={formData.batteryCapacityKwh}
                  onChange={handleFormChange}
                />
              </Form.Group>

              <Form.Group as={Col} md="6" controlId="editBatteryType">
                <Form.Label>Loại pin</Form.Label>
                <Form.Select
                  name="batteryType"
                  value={formData.batteryType}
                  onChange={handleFormChange}
                >
                  {batteryTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Row>

            <div className="d-flex justify-content-end gap-2">
              <Button
                variant="secondary"
                onClick={() => setShowEditModal(false)}
                disabled={formLoading}
              >
                Hủy
              </Button>
              <Button variant="dark" type="submit" disabled={formLoading}>
                {formLoading ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      className="me-2"
                    />
                    Đang cập nhật...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle me-2"></i>
                    Cập nhật
                  </>
                )}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-exclamation-triangle text-danger me-2"></i>
            Xác nhận xóa xe
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {vehicleToDelete && (
            <div>
              <p>Bạn có chắc chắn muốn xóa xe này không?</p>
              <div className="bg-light p-3 rounded">
                <strong>{vehicleToDelete.model}</strong>
                <br />
                <small className="text-muted">
                  Biển số: {vehicleToDelete.licensePlate}
                </small>
              </div>
              <p className="text-danger mt-2 mb-0">
                <small>⚠️ Hành động này không thể hoàn tác!</small>
              </p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowDeleteModal(false)}
            disabled={formLoading}
          >
            Hủy
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteVehicle}
            disabled={formLoading}
          >
            {formLoading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  className="me-2"
                />
                Đang xóa...
              </>
            ) : (
              <>
                <i className="bi bi-trash me-2"></i>
                Xóa xe
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default VehicleInfoPage;
