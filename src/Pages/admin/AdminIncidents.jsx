import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Badge,
  Button,
  Form,
  Spinner,
  Alert,
  Modal,
} from "react-bootstrap";
import { adminAPI } from "../../lib/apiServices.js";

const AdminIncidents = () => {
  const [incidents, setIncidents] = useState([]);
  const [filteredIncidents, setFilteredIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filter states
  const [severityFilter, setSeverityFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  // Modal states
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);

  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    resolved: 0,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
  });

  // Load incidents from API
  const loadIncidents = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await adminAPI.getAllIncidents();
      console.log("📋 Incidents response:", response);

      const data = response?.data?.result || response?.data || [];
      setIncidents(data);
      setFilteredIncidents(data);
      calculateStats(data);
    } catch (err) {
      console.error("❌ Error loading incidents:", err);
      setError(
        err.response?.data?.message ||
        err.message ||
        "Không thể tải danh sách báo cáo sự cố"
      );
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const calculateStats = (data) => {
    const stats = {
      total: data.length,
      open: data.filter((i) => i.status === "OPEN").length,
      resolved: data.filter((i) => i.status === "RESOLVED").length,
      critical: data.filter((i) => i.severity === "CRITICAL").length,
      high: data.filter((i) => i.severity === "HIGH").length,
      medium: data.filter((i) => i.severity === "MEDIUM").length,
      low: data.filter((i) => i.severity === "LOW").length,
    };
    setStats(stats);
  };
  const handleSubmit = async (status, incidentId) => {
    try {
      const response = await adminAPI.updateIncidentStatus(status, incidentId);
      console.log("Submit report response:", response.data);
      const inci = await adminAPI.getAllIncidents();
      const data = inci?.data?.result || inci?.data || [];
      setIncidents(data);
      setFilteredIncidents(data);
      calculateStats(data);
      toast.success("Thao tác thành công!");
    } catch (err) {
      console.error("Lỗi khi gửi báo cáo sự cố:", err);
      toast.error("Duyệt thất bại! Vui lòng thử lại.");
    }
  };
  // Filter incidents
  useEffect(() => {
    let filtered = [...incidents];

    // Filter by severity
    if (severityFilter !== "ALL") {
      filtered = filtered.filter((inc) => inc.severity === severityFilter);
    }

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (inc) =>
          inc.description?.toLowerCase().includes(term) ||
          inc.stationName?.toLowerCase().includes(term) ||
          inc.chargingPointName?.toLowerCase().includes(term) ||
          inc.reporterName?.toLowerCase().includes(term)
      );
    }

    setFilteredIncidents(filtered);
  }, [severityFilter, searchTerm, incidents]);

  // Load data on mount
  useEffect(() => {
    loadIncidents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Get severity badge variant
  const getSeverityBadge = (severity) => {
    switch (severity) {
      case "CRITICAL":
        return <Badge bg="dark">Nghiêm trọng</Badge>;
      case "HIGH":
        return <Badge bg="danger">Cao</Badge>;
      case "MEDIUM":
        return (
          <Badge bg="warning" text="dark">
            Trung bình
          </Badge>
        );
      case "LOW":
        return <Badge bg="info">Thấp</Badge>;
      default:
        return <Badge bg="secondary">{severity}</Badge>;
    }
  };

  // Get status badge variant
  const getStatusBadge = (status) => {
    switch (status) {
      case "OPEN":
        return "danger";
      case "IN_PROGRESS":
        return "warning";
      case "RESOLVED":
        return "success";
      case "CLOSED":
        return "secondary";
      default:
        return "secondary";
    }
  };

  // Get status text in Vietnamese
  const getStatusText = (status) => {
    switch (status) {
      case "OPEN":
        return "Mở";
      case "IN_PROGRESS":
        return "Đang xử lý";
      case "RESOLVED":
        return "Đã giải quyết";
      case "CLOSED":
        return "Đã đóng";
      default:
        return status;
    }
  };

  // Get severity text in Vietnamese
  const getSeverityText = (severity) => {
    switch (severity) {
      case "CRITICAL":
        return "Nghiêm trọng";
      case "HIGH":
        return "Cao";
      case "MEDIUM":
        return "Trung bình";
      case "LOW":
        return "Thấp";
      default:
        return severity;
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // View incident details
  const viewIncidentDetails = (incident) => {
    setSelectedIncident(incident);
    setShowDetailModal(true);
  };

  if (loading) {
    return (
      <Container fluid className="p-4">
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2 text-muted">Đang tải báo cáo sự cố...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="p-4">
      <ToastContainer position="top-right" autoClose={3000} />
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Báo cáo sự cố</h2>
          <p className="text-muted mb-0">
            Quản lý và theo dõi các báo cáo sự cố từ nhân viên
          </p>
        </div>
        <Button variant="dark" onClick={loadIncidents}>
          <i className="bi bi-arrow-clockwise me-2"></i>
          Làm mới
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Row className="mb-4">
        <Col md={6}>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1 small">Tổng số báo cáo</p>
                  <h3 className="mb-0">{stats.total}</h3>
                </div>
                <div className="bg-primary bg-opacity-10 p-3 rounded">
                  <i className="bi bi-exclamation-triangle-fill text-primary fs-4"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1 small">Nghiêm trọng</p>
                  <h3 className="mb-0 text-warning">{stats.critical}</h3>
                </div>
                <div className="bg-warning bg-opacity-10 p-3 rounded">
                  <i className="bi bi-exclamation-circle-fill text-warning fs-4"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="mb-4 border-0 shadow-sm">
        <Card.Body>
          <Row className="g-3">
            <Col md={3}>
              <Form.Group>
                <Form.Label className="small text-muted">Mức độ</Form.Label>
                <Form.Select
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value)}
                >
                  <option value="ALL">Tất cả</option>
                  <option value="CRITICAL">Nghiêm trọng</option>
                  <option value="HIGH">Cao</option>
                  <option value="MEDIUM">Trung bình</option>
                  <option value="LOW">Thấp</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="small text-muted">Tìm kiếm</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Tìm theo mô tả, trạm, trụ sạc, người báo cáo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Incidents Table */}
      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white">
          <h5 className="mb-0">
            Danh sách báo cáo ({filteredIncidents.length})
          </h5>
        </Card.Header>
        <Card.Body className="p-0">
          {filteredIncidents.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-inbox display-1 text-muted"></i>
              <p className="text-muted mt-3">Không có báo cáo sự cố nào</p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th className="border-0">Trạm/Trụ sạc</th>
                    <th className="border-0">Mức độ</th>
                    <th className="border-0">Người báo cáo</th>
                    <th className="border-0">Thời gian báo cáo</th>
                    <th className="border-0">Trạng thái</th>
                    <th className="border-0">Hành động</th>

                  </tr>
                </thead>
                <tbody>
                  {filteredIncidents.map((incident) => (
                    <tr key={incident.incidentId}>
                      <td className="align-middle">
                        {incident.stationName || "-"}
                        {incident.chargingPointName ? (
                          <div className="text-muted small">{incident.chargingPointName}</div>
                        ) : null}
                      </td>
                      <td className="align-middle">{getSeverityBadge(incident.severity)}</td>
                      <td className="align-middle">
                        {incident.reporterName || "N/A"}
                      </td>
                      <td className="align-middle">
                        <small>{formatDate(incident.reportedAt)}</small>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap align-middle">
                        {incident.status === "WAITING" ? (
                          <span className="text-red-600 font-medium">
                            Đang chờ xét duyệt
                          </span>
                        ) : incident.status === "WORKING" ? (
                          <span className="text-yellow-600 font-medium">
                            Đang giải quyết
                          </span>
                        ) : (
                          <span className="text-green-600 font-medium">
                            Đã xử lý
                          </span>
                        )}
                      </td>
                      <td className="align-middle">
                        <Button className="me-3"
                          variant="outline-primary"
                          size="sm"
                          onClick={() => viewIncidentDetails(incident)}
                        >
                          <i className="bi bi-eye me-1"></i>
                          Chi tiết
                        </Button>
                        {incident.status === "WAITING" ? (
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => handleSubmit("WORKING", incident.incidentId)}
                          >
                            Duyệt
                          </Button>
                        ) : incident.status === "WORKING" ? (
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => handleSubmit("DONE", incident.incidentId)}
                          >
                            Hoàn thành
                          </Button>
                        ) : " "}

                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Detail Modal */}
      <Modal
        show={showDetailModal}
        onHide={() => setShowDetailModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-exclamation-triangle me-2"></i>
            Chi tiết báo cáo sự cố
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedIncident && (
            <div>
              <Row className="mb-3">
                <Col md={6}>
                  <small className="text-muted d-block">Mã báo cáo</small>
                  <code className="d-block">{selectedIncident.incidentId}</code>
                </Col>
                <Col md={6}>
                  <small className="text-muted d-block">
                    Thời gian báo cáo
                  </small>
                  <strong>{formatDate(selectedIncident.reportedAt)}</strong>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={6}>
                  <small className="text-muted d-block">Trạm sạc</small>
                  <strong>{selectedIncident.stationName || "N/A"}</strong>
                </Col>
                <Col md={6}>
                  <small className="text-muted d-block">Trụ sạc</small>
                  <Badge bg="secondary" className="mt-1">
                    {selectedIncident.chargingPointName || "N/A"}
                  </Badge>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={6}>
                  <small className="text-muted d-block">Mức độ</small>
                  <Badge
                    bg={getSeverityBadge(selectedIncident.severity)}
                    className="mt-1"
                  >
                    {getSeverityText(selectedIncident.severity)}
                  </Badge>
                </Col>
                <Col md={6}>
                  <small className="text-muted d-block">Trạng thái</small>
                  <Badge
                    bg={getStatusBadge(selectedIncident.status)}
                    className="mt-1"
                  >
                    {getStatusText(selectedIncident.status)}
                  </Badge>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={12}>
                  <small className="text-muted d-block">Người báo cáo</small>
                  <strong>{selectedIncident.reporterName || "N/A"}</strong>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={12}>
                  <small className="text-muted d-block">Mô tả chi tiết</small>
                  <div className="bg-light p-3 rounded mt-1">
                    {selectedIncident.description}
                  </div>
                </Col>
              </Row>

              {selectedIncident.assignedStaffName && (
                <Row className="mb-3">
                  <Col md={6}>
                    <small className="text-muted d-block">
                      Nhân viên xử lý
                    </small>
                    <strong>{selectedIncident.assignedStaffName}</strong>
                  </Col>
                  <Col md={6}>
                    <small className="text-muted d-block">
                      Thời gian giải quyết
                    </small>
                    <strong>{formatDate(selectedIncident.resolvedAt)}</strong>
                  </Col>
                </Row>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminIncidents;
