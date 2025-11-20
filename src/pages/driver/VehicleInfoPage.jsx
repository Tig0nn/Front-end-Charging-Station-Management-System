import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Form,
  Row,
  Col,
  Spinner,
  Modal,
  Badge,
  Container,
  ListGroup,
  Dropdown,
  Alert,
} from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";
import toast from "react-hot-toast";
import { vehiclesAPI } from "../../lib/apiServices.js";
import LoadingSpinner from "../../components/loading_spins/LoadingSpinner.jsx";

const VehicleInfoPage = () => {
  // Vehicle data state
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState(null);

  // Form states - CHỈ CẦN licensePlate và model
  const [formData, setFormData] = useState({
    licensePlate: "",
    model: "", // Enum model: VINFAST_VF8, TESLA_MODEL_3, etc.
  });

  // 2-step selection states
  const [brands, setBrands] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [models, setModels] = useState([]);
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);

  const [validated, setValidated] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const fetchVehicles = async () => {
    try {
      setLoading(true);

      const response = await vehiclesAPI.getMyVehicles();
      const vehicleData = response?.data?.result || response?.data || [];
      setVehicles(vehicleData);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Không thể tải danh sách xe";
      toast.error(`${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };
  // Create vehicle
  const createVehicle = async (vehicleData) => {
    try {
      setFormLoading(true);

      const processedData = {
        licensePlate: vehicleData.licensePlate,
        model: vehicleData.model,
      };

      const response = await vehiclesAPI.createVehicle(processedData);
      const newVehicle =
        response?.data?.result || response?.data || response?.result;

      if (newVehicle) {
        setVehicles((prev) => [...prev, newVehicle]);
      }

      toast.success("Xe đã được thêm thành công!");
      return { success: true, data: newVehicle };
    } catch (err) {
      let errorMessage = "Không thể tạo xe mới";

      if (err.response?.data?.code === 5002) {
        errorMessage = "Biển số xe đã tồn tại trong hệ thống";
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      toast.error(`${errorMessage}`);
      return { success: false, error: errorMessage };
    } finally {
      setFormLoading(false);
    }
  };
  // Update vehicle
  const updateVehicle = async (vehicleId, vehicleData) => {
    try {
      setFormLoading(true);

      const processedData = {};
      if (vehicleData.licensePlate) {
        processedData.licensePlate = vehicleData.licensePlate;
      }
      if (vehicleData.model) {
        processedData.model = vehicleData.model;
      }

      const response = await vehiclesAPI.updateVehicle(
        vehicleId,
        processedData
      );
      const updatedVehicle =
        response?.data?.result || response?.data || response?.result;

      if (updatedVehicle) {
        setVehicles((prev) =>
          prev.map((vehicle) =>
            vehicle.vehicleId === vehicleId ? updatedVehicle : vehicle
          )
        );
        setSelectedVehicle(updatedVehicle);
      }

      toast.success("Thông tin xe đã được cập nhật thành công!");
      return { success: true, data: updatedVehicle };
    } catch (err) {
      let errorMessage = "Không thể cập nhật thông tin xe";

      if (err.response?.data?.code === 5001) {
        errorMessage = "Không tìm thấy xe";
      } else if (err.response?.data?.code === 5002) {
        errorMessage = "Biển số xe đã tồn tại trong hệ thống";
      } else if (err.response?.data?.code === 5003) {
        errorMessage = "Xe không thuộc về bạn";
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      toast.error(`${errorMessage}`);
      return { success: false, error: errorMessage };
    } finally {
      setFormLoading(false);
    }
  };
  // Delete vehicle
  const deleteVehicle = async (vehicleId) => {
    try {
      setFormLoading(true);

      await vehiclesAPI.deleteVehicle(vehicleId);

      setVehicles((prev) =>
        prev.filter((vehicle) => vehicle.vehicleId !== vehicleId)
      );

      if (selectedVehicle?.vehicleId === vehicleId) {
        setSelectedVehicle(null);
      }

      toast.success("Xe đã được xóa thành công!");
      return { success: true };
    } catch (err) {
      let errorMessage = "Không thể xóa xe";

      if (err.response?.data?.code === 5001) {
        errorMessage = "Không tìm thấy xe";
      } else if (err.response?.data?.code === 5003) {
        errorMessage = "Xe không thuộc về bạn";
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      // Xử lý lỗi foreign key constraint
      if (
        errorMessage.includes("foreign key constraint") ||
        errorMessage.includes("charging_sessions") ||
        errorMessage.includes("Cannot delete")
      ) {
        errorMessage =
          "Không thể xóa xe này vì đang có phiên sạc liên quan. Vui lòng hoàn thành hoặc hủy các phiên sạc trước khi xóa xe.";
      }

      toast.error(`${errorMessage}`);
      return { success: false, error: errorMessage };
    } finally {
      setFormLoading(false);
    }
  };
  // Load vehicles on mount
  useEffect(() => {
    fetchVehicles();
  }, []);

  // Load brands when component mounts
  useEffect(() => {
    loadBrands();
  }, []);

  // Load models when brand is selected
  useEffect(() => {
    if (selectedBrand) {
      loadModels(selectedBrand);
    } else {
      setModels([]);
      setFormData((prev) => ({ ...prev, model: "" }));
    }
  }, [selectedBrand]);

  // Load all brands
  const loadBrands = async () => {
    try {
      setLoadingBrands(true);
      const response = await vehiclesAPI.getBrands();
      const brandData = response?.data?.result || response?.data || [];
      setBrands(brandData);
    } catch (error) {
      console.error("Error loading brands:", error);
    } finally {
      setLoadingBrands(false);
    }
  };

  // Load models by brand
  const loadModels = async (brand) => {
    try {
      setLoadingModels(true);
      const response = await vehiclesAPI.getModelsByBrand(brand);
      const modelData = response?.data?.result || response?.data || [];
      setModels(modelData);
    } catch (error) {
      console.error("Error loading models:", error);
      setModels([]);
    } finally {
      setLoadingModels(false);
    }
  };

  // Reset form data
  const resetForm = () => {
    setFormData({
      licensePlate: "",
      model: "",
    });
    setSelectedBrand("");
    setModels([]);
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

  // Handle brand selection
  const handleBrandChange = (e) => {
    const brand = e.target.value;
    setSelectedBrand(brand);
    setFormData((prev) => ({ ...prev, model: "" }));
  };

  // Handle model selection
  const handleModelChange = (e) => {
    const model = e.target.value;
    setFormData((prev) => ({ ...prev, model }));
  };

  // Handle add vehicle
  const handleAddVehicle = async (event) => {
    const form = event.currentTarget;
    event.preventDefault();

    // Validation
    if (!formData.licensePlate || !formData.model) {
      setValidated(true);
      return;
    }

    if (form.checkValidity() === false) {
      event.stopPropagation();
      setValidated(true);
      return;
    }

    try {
      setFormLoading(true);

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
    });

    // Extract brand from model (e.g., VINFAST_VF8 -> VINFAST)
    if (vehicle.brand) {
      setSelectedBrand(vehicle.brand);
      loadModels(vehicle.brand);
    }

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
    setShowAddModal(true);
  };

  // Vehicle Card Component
  const VehicleCard = ({ vehicle }) => (
    <Card className="h-100 shadow-sm border-0">
      {vehicle.imageUrl && (
        <Card.Img
          variant="top"
          src={vehicle.imageUrl}
          alt={`${vehicle.brandDisplayName || vehicle.brand} ${
            vehicle.modelName || vehicle.model
          }`}
          style={{
            height: "180px",
            objectFit: "cover",
            borderBottom: "1px solid #dee2e6",
          }}
        />
      )}
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div>
            <h5 className="mb-1">
              {vehicle.brandDisplayName || vehicle.brand}{" "}
              {vehicle.modelName || vehicle.model}
            </h5>
            <Badge bg="primary" className="mb-2">
              <i className="bi bi-car-front me-1"></i>
              {vehicle.licensePlate}
            </Badge>
          </div>
          <Dropdown align="end">
            <Dropdown.Toggle
              as="button"
              className="btn btn-link text-muted p-0 border-0"
              style={{ boxShadow: "none", background: "none" }}
              bsPrefix="custom-dropdown"
            >
              <i className="bi bi-three-dots-vertical"></i>
            </Dropdown.Toggle>

            <Dropdown.Menu>
              <Dropdown.Item onClick={() => openEditModal(vehicle)}>
                <i className="bi bi-pencil me-2"></i>Chỉnh sửa
              </Dropdown.Item>
              <Dropdown.Item
                onClick={() => openDeleteModal(vehicle)}
                className="text-danger"
              >
                <i className="bi bi-trash me-2"></i>Xóa
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>

        <div className="vehicle-details">
          <div className="row g-2 mb-2">
            <div className="col-6">
              <small className="text-muted d-block">Dung lượng pin</small>
              <strong>{vehicle.batteryCapacityKwh} kWh</strong>
            </div>
            <div className="col-6">
              <small className="text-muted d-block">Loại pin</small>
              <strong className="small">{vehicle.batteryType}</strong>
            </div>
          </div>
          <div className="row g-2">
            <div className="col-12">
              <small className="text-muted d-block">Model code</small>
              <Badge bg="secondary" className="font-monospace">
                {vehicle.model}
              </Badge>
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
        <LoadingSpinner />
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
        <div className="d-flex gap-2">
          <Button
            style={{
              backgroundColor: "#22c55e",
              borderColor: "#22c55e",
              color: "white",
            }}
            onClick={fetchVehicles}
            disabled={loading}
            className="d-flex align-items-center gap-2"
          >
            {loading ? (
              <>
                <Spinner as="span" animation="border" size="sm" />
                <span>Đang tải...</span>
              </>
            ) : (
              <>
                <i className="bi bi-arrow-clockwise"></i>
                <span>Làm mới</span>
              </>
            )}
          </Button>
          <Button variant="dark" onClick={openAddModal} disabled={loading}>
            <i className="bi bi-plus-circle me-2"></i>
            Thêm xe mới
          </Button>
        </div>
      </div>
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
            {/* Biển số xe */}
            <Form.Group className="mb-3" controlId="addLicensePlate">
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
                Vui lòng nhập biển số xe.
              </Form.Control.Feedback>
            </Form.Group>

            {/* Step 1: Chọn hãng xe */}
            <Form.Group className="mb-3" controlId="addBrand">
              <Form.Label>
                Hãng xe <span className="text-danger">*</span>
              </Form.Label>
              <Form.Select
                required
                value={selectedBrand}
                onChange={handleBrandChange}
                disabled={loadingBrands}
              >
                <option value=""> Chọn hãng xe </option>
                {brands.map((brand) => (
                  <option key={brand.brand} value={brand.brand}>
                    {brand.displayName} ({brand.country})
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                Vui lòng chọn hãng xe.
              </Form.Control.Feedback>
            </Form.Group>

            {/* Step 2: Chọn model xe */}
            {selectedBrand && (
              <Form.Group className="mb-3" controlId="addModel">
                <Form.Label>
                  Model xe <span className="text-danger">*</span>
                </Form.Label>
                {loadingModels ? (
                  <div className="text-center py-3">
                    <Spinner animation="border" size="sm" />
                    <small className="ms-2 text-muted">
                      Đang tải models...
                    </small>
                  </div>
                ) : (
                  <>
                    <Form.Select
                      required
                      value={formData.model}
                      onChange={handleModelChange}
                    >
                      <option value=""> Chọn model xe </option>
                      {models.map((model) => (
                        <option key={model.model} value={model.model}>
                          {model.modelName} ({model.batteryCapacityKwh} kWh,{" "}
                          {model.batteryType})
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      Vui lòng chọn model xe.
                    </Form.Control.Feedback>

                    {/* Hiển thị thông tin model đã chọn */}
                    {formData.model &&
                      models.find((m) => m.model === formData.model) && (
                        <Card className="mt-3 bg-light border-0">
                          <Card.Body className="py-2">
                            <small className="text-muted d-block mb-1">
                              <strong>Thông tin model:</strong>
                            </small>
                            <div className="d-flex gap-3">
                              <small>
                                <i className="bi bi-battery-charging text-success me-1"></i>
                                <strong>
                                  {
                                    models.find(
                                      (m) => m.model === formData.model
                                    ).batteryCapacityKwh
                                  }{" "}
                                  kW
                                </strong>
                              </small>
                              <small>
                                <i className="bi bi-lightning-charge text-warning me-1"></i>
                                {
                                  models.find((m) => m.model === formData.model)
                                    .batteryType
                                }
                              </small>
                            </div>
                          </Card.Body>
                        </Card>
                      )}
                  </>
                )}
              </Form.Group>
            )}

            <div className="d-flex justify-content-end gap-2">
              <Button
                variant="secondary"
                onClick={() => setShowAddModal(false)}
                disabled={formLoading}
              >
                Hủy
              </Button>
              <Button
                variant="dark"
                type="submit"
                disabled={formLoading || !formData.model}
              >
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
            {/* Biển số xe */}
            <Form.Group className="mb-3" controlId="editLicensePlate">
              <Form.Label>Biển số xe</Form.Label>
              <Form.Control
                type="text"
                placeholder="VD: 30A-12345"
                name="licensePlate"
                value={formData.licensePlate}
                onChange={handleFormChange}
              />
            </Form.Group>

            {/* Step 1: Chọn hãng xe */}
            <Form.Group className="mb-3" controlId="editBrand">
              <Form.Label>Hãng xe</Form.Label>
              <Form.Select
                value={selectedBrand}
                onChange={handleBrandChange}
                disabled={loadingBrands}
              >
                <option value="">-- Chọn hãng xe --</option>
                {brands.map((brand) => (
                  <option key={brand.brand} value={brand.brand}>
                    {brand.displayName} ({brand.country})
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            {/* Step 2: Chọn model xe */}
            {selectedBrand && (
              <Form.Group className="mb-3" controlId="editModel">
                <Form.Label>Model xe</Form.Label>
                {loadingModels ? (
                  <div className="text-center py-3">
                    <Spinner animation="border" size="sm" />
                    <small className="ms-2 text-muted">
                      Đang tải models...
                    </small>
                  </div>
                ) : (
                  <>
                    <Form.Select
                      value={formData.model}
                      onChange={handleModelChange}
                    >
                      <option value="">-- Chọn model xe --</option>
                      {models.map((model) => (
                        <option key={model.model} value={model.model}>
                          {model.modelName} ({model.batteryCapacityKwh} kWh,{" "}
                          {model.batteryType})
                        </option>
                      ))}
                    </Form.Select>

                    {/* Hiển thị thông tin model đã chọn */}
                    {formData.model &&
                      models.find((m) => m.model === formData.model) && (
                        <Card className="mt-3 bg-light border-0">
                          <Card.Body className="py-2">
                            <small className="text-muted d-block mb-1">
                              <strong>Thông tin model:</strong>
                            </small>
                            <div className="d-flex gap-3">
                              <small>
                                <i className="bi bi-battery-charging text-success me-1"></i>
                                <strong>
                                  {
                                    models.find(
                                      (m) => m.model === formData.model
                                    ).batteryCapacityKwh
                                  }{" "}
                                  kWh
                                </strong>
                              </small>
                              <small>
                                <i className="bi bi-lightning-charge text-warning me-1"></i>
                                {
                                  models.find((m) => m.model === formData.model)
                                    .batteryType
                                }
                              </small>
                            </div>
                          </Card.Body>
                        </Card>
                      )}
                  </>
                )}
              </Form.Group>
            )}

            <Alert variant="info" className="mb-3">
              <small>
                <i className="bi bi-info-circle me-2"></i>
                Khi thay đổi model, thông tin battery sẽ tự động được cập nhật
                theo model mới.
              </small>
            </Alert>

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
      </Modal>{" "}
      {/* Delete Confirmation Modal */}
      <Modal
        show={showDeleteModal}
        onHide={() => {
          setShowDeleteModal(false);
        }}
      >
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
                <strong>
                  {vehicleToDelete.brandDisplayName || vehicleToDelete.brand}{" "}
                  {vehicleToDelete.modelName || vehicleToDelete.model}
                </strong>
                <br />
                <small className="text-muted">
                  Biển số: {vehicleToDelete.licensePlate}
                </small>
                <br />
                <small className="text-muted">
                  {vehicleToDelete.batteryCapacityKwh} kWh |{" "}
                  {vehicleToDelete.batteryType}
                </small>
              </div>
              <p className="text-danger mt-2 mb-0">
                <small>Hành động này không thể hoàn tác!</small>
              </p>
            </div>
          )}
        </Modal.Body>{" "}
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              setShowDeleteModal(false);
            }}
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
