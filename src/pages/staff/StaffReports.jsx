import React, { useEffect, useState } from "react";
import { staffAPI } from "../../lib/apiServices";
import moment from "moment";
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
  const [reports, setReports] = useState([]);
  const [error, setError] = useState(null);
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
  const user = JSON.parse(localStorage.getItem("user")); // Lấy object user ra
  const stationId = user?.stationId; // Lấy field stationId
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
      console.log(localStorage.getItem("authToken"));
      console.log("Submitting report:", report);
      const response = await staffAPI.submitReport(report);
      // Check response
      if (response.data?.message === "Báo cáo sự cố thành công") {
        alert("Đã gửi báo cáo!");
      } else {
        //ném lỗi
        throw new Error(response.data?.message || "Gửi báo cáo thất bại");
      }
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
            Báo cáo đã gửi
          </Card.Title>
          {/* Kiểm tra lỗi */}
          {error ? (
            <p className="text-danger mb-0">{error}</p>
          ) : reports.length === 0 ? (
            <p className="text-muted mb-0">Không có báo cáo.</p>
          ) : (
            <ListGroup variant="flush">
              {reports.map((incident) => (
                <ListGroup.Item
                  key={incident.incidentId}
                  className="d-flex justify-content-between align-items-start px-0 py-3"
                >
                  <div>
                    <div className="fw-bold">
                      <span
                        className={`text-${
                          incident.severity === "HIGH"
                            ? "danger"
                            : incident.severity === "MEDIUM"
                            ? "warning"
                            : incident.severity === "LOW"
                            ? "info"
                            : "dark"
                        } me-2`}
                      >
                        ●
                      </span>
                      {incident.stationName} - Trụ sạc:{" "}
                      {incident.chargingPointName}
                    </div>
                    <p className="mb-1 ms-4">{incident.description}</p>
                    <small className="text-muted ms-4">
                      {moment
                        .utc(incident.reportedAt)
                        .utcOffset(7)
                        .format("HH:mm - DD/MM/YYYY")}{" "}
                      - Báo cáo bởi: {incident.reporterName}
                    </small>
                  </div>
                  {getSeverityBadge(incident.severity)}
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default StaffReports;
