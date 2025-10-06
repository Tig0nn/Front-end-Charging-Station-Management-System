import React, { useState, useEffect, useRef } from "react";
import {
  Table,
  Card,
  Button,
  Badge,
  ProgressBar,
  Spinner,
  Alert,
  Form,
  Row,
  Col,
} from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";
import { stationsAPI } from "../../lib/apiServices.js";
import { Link } from "react-router";

const StationsList = () => {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const addFormRef = useRef(null);

  // Form data for adding new station
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    totalChargers: "",
    availableChargers: "",
    offlineChargers: 0,
    maintenanceChargers: 0,
    manager: "",
    status: "active",
    revenue: 0,
    utilization: 0,
  });
  const [validated, setValidated] = useState(false);

  // Load stations data from API
  const loadStations = async () => {
    try {
      setLoading(true);
      setError("");

      console.log("🔧 Loading stations from API...");
      const response = await stationsAPI.getAll(1, 100); // Fetch first 100 stations
      console.log("📊 Stations API raw response:", response);

      // Normalize many possible response shapes from different API layers / mocks
      // Possible shapes observed in the codebase / mocks:
      // - axiosResponse.data.result -> array OR { data: [...] }
      // - axiosResponse.data.stations -> array
      // - axiosResponse.data -> array
      // - axiosResponse.result -> array
      // - direct array returned
      let stationsData = [];

      const res = response;

      // 1) axios-like wrapper: response.data
      if (res && res.data) {
        // a) backend-style wrapper: { code, message, result }
        if (res.data.result) {
          // result may be array or { data: [...] }
          if (Array.isArray(res.data.result)) {
            stationsData = res.data.result;
          } else if (Array.isArray(res.data.result.data)) {
            stationsData = res.data.result.data;
          } else if (Array.isArray(res.data.result.stations)) {
            stationsData = res.data.result.stations;
          } else {
            // result contains something else (object) - try to find array inside
            const maybeArray =
              res.data.result.data ||
              res.data.result.stations ||
              res.data.result.items;
            if (Array.isArray(maybeArray)) stationsData = maybeArray;
          }
        }

        // b) mock or other shape: { stations: [...] }
        if (!stationsData.length && Array.isArray(res.data.stations)) {
          stationsData = res.data.stations;
        }

        // c) direct array on data
        if (!stationsData.length && Array.isArray(res.data)) {
          stationsData = res.data;
        }

        // d) nested data: res.data.data -> array
        if (
          !stationsData.length &&
          res.data.data &&
          Array.isArray(res.data.data)
        ) {
          stationsData = res.data.data;
        }
      }

      // 2) axios-less responses or direct shapes
      if (!stationsData.length && response) {
        if (Array.isArray(response)) stationsData = response;
        else if (response.result && Array.isArray(response.result))
          stationsData = response.result;
        else if (response.data && Array.isArray(response.data))
          stationsData = response.data;
      }

      // Final fallback: empty array
      if (!Array.isArray(stationsData)) stationsData = [];

      setStations(stationsData);
      console.log("✅ Stations loaded (normalized):", stationsData);
    } catch (err) {
      console.error("❌ Error loading stations:", err);
      setError("Không thể tải danh sách trạm sạc");
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadStations();
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (event) => {
    const form = event.currentTarget;
    event.preventDefault();

    if (form.checkValidity() === false) {
      event.stopPropagation();
      setValidated(true);
      return;
    }

    try {
      console.log("✅ Adding new station:", formData);

      // Calculate available chargers if not provided
      const availableChargers =
        formData.availableChargers ||
        formData.totalChargers -
          formData.offlineChargers -
          formData.maintenanceChargers;

      const stationData = {
        ...formData,
        totalChargers: parseInt(formData.totalChargers),
        availableChargers: parseInt(availableChargers),
        offlineChargers: parseInt(formData.offlineChargers),
        maintenanceChargers: parseInt(formData.maintenanceChargers),
        revenue: parseFloat(formData.revenue) || 0,
        utilization: parseInt(formData.utilization) || 0,
      };

      const response = await stationsAPI.create(stationData);

      if (response.success) {
        // Reset form and refresh list
        setFormData({
          name: "",
          location: "",
          totalChargers: "",
          availableChargers: "",
          offlineChargers: 0,
          maintenanceChargers: 0,
          manager: "",
          status: "active",
          revenue: 0,
          utilization: 0,
        });
        setValidated(false);
        setShowAddForm(false);
        await loadStations(); // Refresh the list

        console.log("✅ Station added successfully");
      }
    } catch (err) {
      console.error("❌ Error adding station:", err);
      setError("Không thể thêm trạm sạc mới");
    }
  };

  // Scroll to add form
  const scrollToAddForm = () => {
    setShowAddForm(true);
    setTimeout(() => {
      addFormRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  //  Format tiền tệ
  const formatCurrency = (amount) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount || 0);

  //  Badge trạng thái
  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return <Badge bg="success">Hoạt động</Badge>;
      case "maintenance":
        return <Badge bg="warning">Bảo trì</Badge>;
      case "inactive":
        return <Badge bg="danger">Ngưng hoạt động</Badge>;
      default:
        return <Badge bg="secondary">Không xác định</Badge>;
    }
  };

  // 🔹 Màu thanh tiến trình
  const getUtilizationColor = (utilization) => {
    if (utilization >= 80) return "success";
    if (utilization >= 60) return "info";
    if (utilization >= 40) return "warning";
    return "danger";
  };

  // 🔹 Đang tải
  if (loading) {
    return (
      <div>
        {/* Header */}
        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="mb-1">Quản lý trạm sạc</h2>
              <p className="text-muted mb-0">
                Theo dõi và quản lý tất cả trạm sạc trong hệ thống
              </p>
            </div>
            <Button
              variant="primary"
              className="d-flex align-items-center gap-2"
              onClick={scrollToAddForm}
            >
              <i className="bi bi-plus-lg"></i>
              Thêm trạm sạc
            </Button>
          </div>
        </div>

        {/* Loading State */}
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2 text-muted">Đang tải danh sách trạm sạc...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h2 className="mb-1">Quản lý trạm sạc</h2>
            <p className="text-muted mb-0">
              Theo dõi và quản lý tất cả trạm sạc trong hệ thống
            </p>
          </div>
          <div className="d-flex gap-2">
            <Button
              variant="outline-secondary"
              className="d-flex align-items-center gap-2"
              onClick={loadStations}
              disabled={loading}
            >
              <i className="bi bi-arrow-clockwise"></i>
              Làm mới
            </Button>
            <Button
              variant="primary"
              className="d-flex align-items-center gap-2"
              onClick={scrollToAddForm}
            >
              <i className="bi bi-plus-lg"></i>
              Thêm trạm sạc
            </Button>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-4">
          <Alert variant="danger" className="d-flex align-items-center">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            <div>
              <strong>Lỗi:</strong> {error}
              <Button
                variant="link"
                size="sm"
                className="ms-2 p-0"
                onClick={loadStations}
              >
                Thử lại
              </Button>
            </div>
          </Alert>
        </div>
      )}

      {/* Stations Table */}
      <div className="mb-4">
        <Card className="border-0 shadow-sm">
          <Card.Body className="p-0">
            {stations.length === 0 ? (
              <div className="text-center py-5">
                <i
                  className="bi bi-ev-station-fill text-muted"
                  style={{ fontSize: "3rem" }}
                ></i>
                <h5 className="mt-3 text-muted">Chưa có trạm sạc nào</h5>
                <p className="text-muted">
                  Hãy thêm trạm sạc đầu tiên để bắt đầu
                </p>
                <Button
                  variant="primary"
                  className="mt-2"
                  onClick={scrollToAddForm}
                >
                  <i className="bi bi-plus-lg me-2"></i>
                  Thêm trạm sạc
                </Button>
              </div>
            ) : (
              <div className="table-responsive">
                <Table className="mb-0" hover>
                  <thead className="table-light">
                    <tr>
                      <th
                        className="px-4 py-3 fw-semibold"
                        style={{ width: "25%" }}
                      >
                        Tên trạm
                      </th>
                      <th
                        className="px-2 py-3 fw-semibold text-center"
                        style={{ width: "8%" }}
                      >
                        Trạng thái
                      </th>
                      <th
                        className="px-2 py-3 fw-semibold text-center"
                        style={{ width: "27%" }}
                      >
                        Điểm sạc
                      </th>
                      <th
                        className="px-2 py-3 fw-semibold text-end"
                        style={{ width: "12%" }}
                      >
                        Doanh thu
                      </th>
                      <th
                        className="px-1 py-3 fw-semibold text-center"
                        style={{ width: "15%" }}
                      >
                        Sử dụng
                      </th>
                      <th
                        className="px-2 py-3 fw-semibold"
                        style={{ width: "22%" }}
                      >
                        Nhân viên
                      </th>
                      <th
                        className="px-4 py-3 fw-semibold text-center"
                        style={{ width: "10%" }}
                      >
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {stations.map((station) => (
                      <tr key={station.id} className="align-middle">
                        <td className="px-3 py-4">
                          <div className="fw-semibold text-dark">
                            {station.name}
                          </div>
                          <div className="text-muted small">
                            {station.location}
                          </div>
                        </td>

                        <td className="px-2 py-4 text-center">
                          {getStatusBadge(station.status)}
                        </td>

                        <td className="px-2 py-4 text-center">
                          <div className="small">
                            <div className="text-success fw-semibold">
                              Tổng: {station.totalChargers}
                            </div>
                            <div className="d-flex gap-1 justify-content-center mt-1">
                              <span className="text-success">
                                Hoạt động <br />
                                {station.availableChargers || 0}
                              </span>
                              <span className="text-muted">|</span>
                              <span className="text-danger">
                                Offline <br />
                                {station.offlineChargers || 0}
                              </span>
                              <span className="text-muted">|</span>
                              <span className="text-warning">
                                Bảo trì <br />
                                {station.maintenanceChargers || 0}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="px-2 py-4 text-end">
                          <div className="fw-semibold text-success">
                            {formatCurrency(station.revenue)}
                          </div>
                        </td>

                        <td className="px-3 py-4">
                          <div className="text-center">
                            <div className="mb-1">
                              <ProgressBar
                                now={station.utilization}
                                variant={getUtilizationColor(
                                  station.utilization
                                )}
                                style={{ width: "80px", height: "6px" }}
                                className="mx-auto"
                              />
                            </div>
                            <small className="fw-semibold text-dark">
                              {station.utilization}%
                            </small>
                          </div>
                        </td>

                        <td className="px-2 py-4">
                          <div className="text-dark">{station.manager}</div>
                        </td>

                        <td className="px-4 py-4 text-center">
                          <div className="d-flex gap-1 justify-content-center">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              className="d-flex align-items-center justify-content-center"
                              style={{ width: "32px", height: "32px" }}
                              title="Chỉnh sửa"
                            >
                              <i className="bi bi-pencil"></i>
                            </Button>
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              className="d-flex align-items-center justify-content-center"
                              style={{ width: "32px", height: "32px" }}
                              title="Cài đặt"
                            >
                              <i className="bi bi-gear"></i>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </Card.Body>
        </Card>
      </div>

      {/* Add Station Form */}
      {showAddForm && (
        <div ref={addFormRef} className="mb-4">
          <Card className="border-0 shadow-sm">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Thêm trạm sạc mới</h5>
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => setShowAddForm(false)}
              >
                <i className="bi bi-x-lg"></i>
              </Button>
            </Card.Header>
            <Card.Body>
              <Form noValidate validated={validated} onSubmit={handleSubmit}>
                <Row className="mb-3">
                  <Form.Group as={Col} md="6" controlId="name">
                    <Form.Label>Tên trạm</Form.Label>
                    <Form.Control
                      required
                      type="text"
                      placeholder="VD: Vincom Đồng Khởi"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                    />
                    <Form.Control.Feedback type="invalid">
                      Vui lòng nhập tên trạm.
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group as={Col} md="6" controlId="manager">
                    <Form.Label>Nhân viên phụ trách</Form.Label>
                    <Form.Control
                      required
                      type="text"
                      placeholder="VD: Trần Thị Bình"
                      name="manager"
                      value={formData.manager}
                      onChange={handleChange}
                    />
                    <Form.Control.Feedback type="invalid">
                      Vui lòng nhập tên nhân viên.
                    </Form.Control.Feedback>
                  </Form.Group>
                </Row>

                <Row className="mb-3">
                  <Form.Group as={Col} md="12" controlId="location">
                    <Form.Label>Địa điểm</Form.Label>
                    <Form.Control
                      required
                      type="text"
                      placeholder="VD: 72 Lê Thánh Tôn, Q.1, TP.HCM"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                    />
                    <Form.Control.Feedback type="invalid">
                      Vui lòng nhập địa chỉ trạm sạc.
                    </Form.Control.Feedback>
                  </Form.Group>
                </Row>

                <Row className="mb-3">
                  <Form.Group as={Col} md="3" controlId="totalChargers">
                    <Form.Label>Tổng số điểm sạc</Form.Label>
                    <Form.Control
                      required
                      type="number"
                      min="1"
                      name="totalChargers"
                      value={formData.totalChargers}
                      onChange={handleChange}
                    />
                    <Form.Control.Feedback type="invalid">
                      Vui lòng nhập số điểm sạc hợp lệ.
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group as={Col} md="3" controlId="offlineChargers">
                    <Form.Label>Điểm sạc offline</Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      name="offlineChargers"
                      value={formData.offlineChargers}
                      onChange={handleChange}
                    />
                  </Form.Group>

                  <Form.Group as={Col} md="3" controlId="maintenanceChargers">
                    <Form.Label>Điểm sạc bảo trì</Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      name="maintenanceChargers"
                      value={formData.maintenanceChargers}
                      onChange={handleChange}
                    />
                  </Form.Group>

                  <Form.Group as={Col} md="3" controlId="status">
                    <Form.Label>Trạng thái</Form.Label>
                    <Form.Select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                    >
                      <option value="active">Hoạt động</option>
                      <option value="maintenance">Bảo trì</option>
                      <option value="inactive">Ngưng hoạt động</option>
                    </Form.Select>
                  </Form.Group>
                </Row>

                <Row className="mb-4">
                  <Form.Group as={Col} md="6" controlId="revenue">
                    <Form.Label>Doanh thu hiện tại (VNĐ)</Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      name="revenue"
                      value={formData.revenue}
                      onChange={handleChange}
                      placeholder="0"
                    />
                  </Form.Group>

                  <Form.Group as={Col} md="6" controlId="utilization">
                    <Form.Label>Tỷ lệ sử dụng (%)</Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      max="100"
                      name="utilization"
                      value={formData.utilization}
                      onChange={handleChange}
                      placeholder="0"
                    />
                  </Form.Group>
                </Row>

                <div className="d-flex justify-content-end gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => setShowAddForm(false)}
                  >
                    <i className="bi bi-x-lg me-1"></i> Hủy
                  </Button>
                  <Button variant="primary" type="submit">
                    <i className="bi bi-check2-circle me-1"></i> Lưu trạm sạc
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </div>
      )}
    </div>
  );
};

export default StationsList;
