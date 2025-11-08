import React, { useEffect, useState } from "react";
import { staffAPI } from "../../lib/apiServices";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Modal } from "react-bootstrap";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Badge,
  ListGroup,
  ButtonGroup,
} from "react-bootstrap";
const formatDateTime = (iso) => {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return {
    date: `${dd}/${mm}/${yyyy}`,
    time: `${hh}:${mi}`,
  };
};
// Hàm để lấy màu badge dựa trên mức độ nghiêm trọng
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

const StaffReports = () => {
  const [showModal, setShowModal] = useState(false);
  const [reports, setReports] = useState([]);
  const [error, setError] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const OpenModal = (report) => {
    setSelectedReport(report);
    setShowModal(true);
  };
  useEffect(() => {
    // hàm gọi API lấy danh sách báo cáo
    const fetchReports = async () => {
      try {
        const response = await staffAPI.getStaffReport();
        console.log("Fetched reports:", response.data);
        setReports(response.data?.result || response.data || []);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch reports:", err);

        // Hiển thị lỗi rõ ràng
        if (err?.response?.status === 401) {
          setError("Không thể tải được các báo cáo. Vui lòng thử lại sau.");
        }
        setReports([]);
      }
    };
    fetchReports();
  }, []);
  const staff = JSON.parse(localStorage.getItem("staff")); // Lấy object user ra
  const stationId = staff?.stationId; // Lấy field stationId
  const [report, setReport] = useState({
    stationId: stationId,
    chargingPointId: "",
    description: "",
    severity: "",
  });
  const [charging_point, setChargingPoint] = useState([]);
  const handleChangeValue = (e) => {
    setReport({
      ...report,
      [e.target.name]: e.target.value,
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await staffAPI.submitReport(report);
      console.log("Submit report response:", response.data);
      toast.success("Đã gửi báo cáo thành công!");
      const reports = await staffAPI.getStaffReport();
      console.log("Fetched reports:", reports.data);
      setReports(reports.data?.result || reports.data || []);
      setReport({
        stationId: stationId,
        chargingPointId: "",
        description: "",
        severity: "",
      });

      // Reset luôn các input/select trong giao diện
      e.target.reset();
    } catch (err) {
      console.error("Lỗi khi gửi báo cáo sự cố:", err);
      toast.error("Lỗi khi gửi báo cáo sự cố, vui lòng thử lại!");
    }
  };
  useEffect(() => {
    const fetchChargingPoint = async () => {
      try {
        const res = await staffAPI.getChargingPoint();
        setChargingPoint(res.data.result || []);
      } catch (err) {
        console.error("Lỗi khi tải danh sách cổng sạc:", err);
      }
    };
    fetchChargingPoint();
  }, []);

  return (
    <Container fluid className="p-4">
      <ToastContainer position="top-right" autoClose={3000} />
      {/* Form Báo cáo sự cố */}
      <Card className="shadow-sm mb-4">
        <Card.Body className="p-4">
          <Card.Title as="h5">Báo cáo sự cố</Card.Title>
          <Card.Subtitle className="mb-4 text-muted">
            Ghi nhận và báo cáo sự cố tại trạm sạc
          </Card.Subtitle>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Mức độ nghiêm trọng</Form.Label>
              <Form.Select
                onChange={handleChangeValue}
                name="severity"
                required
              >
                <option value="">Chọn mức độ nghiêm trọng</option>
                <option value="LOW">Thấp</option>
                <option value="MEDIUM">Trung bình</option>
                <option value="HIGH">Cao</option>
                <option value="CRITICAL">Nghiêm trọng</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Cổng sạc</Form.Label>
              <Form.Select
                onChange={handleChangeValue}
                name="chargingPointId"
                required
              >
                <option value="">Chọn cổng sạc</option>
                {charging_point.map((p) => (
                  <option key={p.pointId} value={p.pointId}>
                    {p.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label>Mô tả chi tiết</Form.Label>
              <Form.Control
                onChange={handleChangeValue}
                type="text"
                name="description"
                as="textarea"
                rows={4}
                placeholder="Vui lòng mô tả chi tiết về sự cố"
                required
              />
            </Form.Group>

            <Button variant="dark" type="submit" className="w-100 py-2">
              Gửi báo cáo
            </Button>
          </Form>
        </Card.Body>
      </Card>

      {/* Danh sách Sự cố gần đây */}
      <Card className="shadow-sm">
        <Card.Body className="p-4">
          <Card.Title as="h5" className="mb-3">
            Báo cáo sự cố đã gửi
          </Card.Title>
          {error ? (
            <p className="text-danger mb-0">{error}</p>
          ) : reports.length === 0 ? (
            <p className="text-muted mb-0">Không có báo cáo sự cố nào.</p>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Thời gian</th>
                    <th>Trạm sạc/Trụ sạc</th>
                    <th>Mức độ</th>
                    <th>Trạng thái</th>
                    <th>Ngày giải quyết</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((incident) => (
                    <tr key={incident.incidentId} onClick={() => OpenModal(incident)}>
                      <td>
                        {formatDateTime(incident.reportedAt).date} <br />
                        <div className="text-muted small">
                          {formatDateTime(incident.reportedAt).time}
                        </div>
                      </td>
                      <td>
                        {incident.stationName || "-"}
                        {incident.chargingPointName ? (
                          <div className="text-muted small">{incident.chargingPointName}</div>
                        ) : null}
                      </td>
                      <td>{getSeverityBadge(incident.severity)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        {(incident.status === "WAITING" || incident.resolvedAt == null || incident.status === "WORKING") ? (
                          <span className="text-red-600 font-medium">
                            Chưa có
                          </span>
                        ) : (
                          <span className="text-green-600 font-medium">
                            {formatDateTime(incident.resolvedAt).date} <br />
                            <div className="text-muted small">
                              {formatDateTime(incident.resolvedAt).time}
                            </div>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card.Body>
      </Card>
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Chi tiết sự cố</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedReport && (
            <>
              <div className="d-flex justify-content">
                <div className="mr-60">
                  <p>
                    <strong>Nhân viên báo cáo:</strong> {selectedReport.reporterName}
                  </p>
                  <p>
                    <strong>Trạm:</strong> {selectedReport.stationName || "-"}
                  </p>
                  <p>
                    <strong>Trụ sạc:</strong>{" "}
                    {selectedReport.chargingPointName || "-"}
                  </p>
                </div>
                <div>
                  <p>
                    <strong>Mức độ:</strong> {getSeverityBadge(selectedReport.severity)}
                  </p>
                  <p>
                    <strong>Thời gian:</strong>{" "}
                    {formatDateTime(selectedReport.reportedAt).date}{" "}
                    {formatDateTime(selectedReport.reportedAt).time}
                  </p>
                  <p>
                    <strong>Trạng thái:</strong>{" "}
                    {selectedReport.status === "WAITING" ? (
                      <span className="text-red-600 font-medium">
                        Đang chờ xét duyệt
                      </span>
                    ) : selectedReport.status === "WORKING" ? (
                      <span className="text-yellow-600 font-medium">
                        Đang giải quyết
                      </span>
                    ) : (
                      <span className="text-green-600 font-medium">
                        Đã xử lý
                      </span>
                    )}
                  </p>
                  <p>
                    <strong>Ngày giải quyết:</strong>{" "}
                    {(selectedReport.status === "WAITING" || selectedReport.resolvedAt == null || selectedReport.status === "WORKING") ? (
                      <span className="text-red-600 font-medium">
                        Chưa có
                      </span>
                    ) : (
                      <span className="text-green-600 font-medium">
                        {formatDateTime(selectedReport.resolvedAt).date} <br />
                        <div className="text-muted small">
                          {formatDateTime(selectedReport.resolvedAt).time}
                        </div>
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <div className="mt-2">
                <p>
                  <strong>Mô tả sự cố:</strong>{" "}
                  <br />{selectedReport.description}
                </p>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default StaffReports;
