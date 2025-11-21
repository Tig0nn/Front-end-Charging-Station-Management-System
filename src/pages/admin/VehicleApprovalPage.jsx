import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Spinner,
  Modal,
  Form,
  Alert,
  Image,
} from "react-bootstrap";
import toast from "react-hot-toast";
import { vehiclesAPI } from "../../lib/apiServices";
import "bootstrap-icons/font/bootstrap-icons.css";

const VehicleApprovalPage = () => {
  const [pendingVehicles, setPendingVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchPendingVehicles = async () => {
    try {
      setLoading(true);
      const response = await vehiclesAPI.getPendingVehicles();
      setPendingVehicles(response.data.result || []);
    } catch (error) {
      toast.error("Không thể tải danh sách xe chờ duyệt.");
      console.error("Fetch pending vehicles error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingVehicles();
  }, []);

  const handleApprove = async (vehicleId) => {
    setActionLoading(true);
    try {
      await vehiclesAPI.approveVehicle(vehicleId);
      toast.success("Phê duyệt xe thành công!");
      fetchPendingVehicles(); // Refresh list
    } catch (error) {
      toast.error("Phê duyệt thất bại.");
      console.error("Approve vehicle error:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason) {
      toast.error("Vui lòng nhập lý do từ chối.");
      return;
    }
    setActionLoading(true);
    try {
      await vehiclesAPI.rejectVehicle(
        selectedVehicle.vehicleId,
        rejectionReason
      );
      toast.success("Đã từ chối xe.");
      setShowRejectModal(false);
      setRejectionReason("");
      fetchPendingVehicles(); // Refresh list
    } catch (error) {
      toast.error("Từ chối thất bại.");
      console.error("Reject vehicle error:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const openImageModal = (vehicle) => {
    setSelectedVehicle(vehicle);
    setShowModal(true);
  };

  const openRejectModal = (vehicle) => {
    setSelectedVehicle(vehicle);
    setShowRejectModal(true);
  };

  const VehicleCard = ({ vehicle }) => (
    <Card className="mb-3 shadow-sm border-0">
      <Card.Body>
        <Row className="align-items-center">
          <Col md={4}>
            <Card.Title className="fw-bold">
              {vehicle.brandDisplayName} {vehicle.modelName}
            </Card.Title>
            <Card.Subtitle className="mb-2 text-muted">
              <i className="bi bi-card-heading me-1"></i>
              {vehicle.licensePlate}
            </Card.Subtitle>
            <Badge bg="warning" text="dark" className="mb-2">
              <i className="bi bi-clock-history me-1"></i>
              Chờ duyệt
            </Badge>
            <p className="text-muted small mb-0">
              <strong>Ngày gửi:</strong>{" "}
              {new Date(vehicle.submittedAt).toLocaleString()}
            </p>
          </Col>
          <Col md={4}>
            <p className="mb-1">
              <strong>
                <i className="bi bi-person-fill me-1"></i>Chủ xe:
              </strong>{" "}
              {vehicle.ownerName}
            </p>
            <p className="mb-1">
              <strong>
                <i className="bi bi-envelope-fill me-1"></i>Email:
              </strong>{" "}
              {vehicle.ownerEmail}
            </p>
            <p className="mb-0">
              <strong>
                <i className="bi bi-telephone-fill me-1"></i>SĐT:
              </strong>{" "}
              {vehicle.ownerPhone}
            </p>
          </Col>
          <Col
            md={4}
            className="d-flex align-items-center justify-content-end gap-2 mt-3 mt-md-0"
          >
            <Button
              variant="info"
              size="sm"
              onClick={() => openImageModal(vehicle)}
            >
              <i className="bi bi-images me-1"></i> Xem ảnh
            </Button>
            <Button
              variant="success"
              size="sm"
              onClick={() => handleApprove(vehicle.vehicleId)}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <Spinner as="span" animation="border" size="sm" />
              ) : (
                <i className="bi bi-check-circle me-1"></i>
              )}
              Duyệt
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => openRejectModal(vehicle)}
              disabled={actionLoading}
            >
              <i className="bi bi-x-circle me-1"></i> Từ chối
            </Button>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );

  return (
    <Container fluid>
      <h1 className="h3 mb-4">Duyệt thông tin xe</h1>
      {loading ? (
        <div className="text-center">
          <Spinner animation="border" />
          <p>Đang tải danh sách...</p>
        </div>
      ) : pendingVehicles.length === 0 ? (
        <Alert variant="success">Không có xe nào đang chờ phê duyệt.</Alert>
      ) : (
        pendingVehicles.map((vehicle) => (
          <VehicleCard key={vehicle.vehicleId} vehicle={vehicle} />
        ))
      )}

      {/* Image Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>
            Hình ảnh xe: {selectedVehicle?.licensePlate}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedVehicle && (
            <Row>
              <Col md={6} lg={4} className="mb-3 text-center">
                <h5>Giấy tờ mặt trước</h5>
                <Image
                  src={selectedVehicle.documentFrontImageUrl}
                  thumbnail
                  fluid
                />
              </Col>
              <Col md={6} lg={4} className="mb-3 text-center">
                <h5>Giấy tờ mặt sau</h5>
                <Image
                  src={selectedVehicle.documentBackImageUrl}
                  thumbnail
                  fluid
                />
              </Col>
              <Col md={6} lg={4} className="mb-3 text-center">
                <h5>Ảnh đầu xe</h5>
                <Image src={selectedVehicle.frontImageUrl} thumbnail fluid />
              </Col>
              <Col md={6} lg={4} className="mb-3 text-center">
                <h5>Ảnh đuôi xe</h5>
                <Image src={selectedVehicle.rearImageUrl} thumbnail fluid />
              </Col>
              <Col md={6} lg={4} className="mb-3 text-center">
                <h5>Ảnh hông trái</h5>
                <Image src={selectedVehicle.sideLeftImageUrl} thumbnail fluid />
              </Col>
              <Col md={6} lg={4} className="mb-3 text-center">
                <h5>Ảnh hông phải</h5>
                <Image
                  src={selectedVehicle.sideRightImageUrl}
                  thumbnail
                  fluid
                />
              </Col>
            </Row>
          )}
        </Modal.Body>
      </Modal>

      {/* Rejection Modal */}
      <Modal show={showRejectModal} onHide={() => setShowRejectModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            Lý do từ chối xe {selectedVehicle?.licensePlate}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Nhập lý do từ chối</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="VD: Giấy tờ xe không rõ ràng, ảnh chụp mờ..."
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRejectModal(false)}>
            Hủy
          </Button>
          <Button
            variant="danger"
            onClick={handleReject}
            disabled={actionLoading}
          >
            {actionLoading ? (
              <Spinner as="span" animation="border" size="sm" />
            ) : (
              "Xác nhận từ chối"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default VehicleApprovalPage;
