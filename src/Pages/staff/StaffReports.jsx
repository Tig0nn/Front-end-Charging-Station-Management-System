import React, { useEffect, useState } from "react";
import { staffAPI } from "../../lib/apiServices";
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



// Dữ liệu mẫu cho các sự cố gần đây
const recentIncidents = [
  {
    id: 1,
    title: "Điểm sạc #4 - Lỗi kết nối",
    description: "Mất kết nối với hệ thống trung tâm từ 14:30",
    reporter: "Trần Thị Bình",
    time: "2 giờ trước",
    severity: "Cao",
  },
  {
    id: 2,
    title: "Điểm sạc #2 - Bảo trì định kỳ",
    description: "Cần thay thế cáp sạc CCS",
    reporter: "Lên lịch bảo trì",
    time: "1 ngày trước",
    severity: "Trung bình",
  },
];





// Hàm để lấy màu badge dựa trên mức độ nghiêm trọng
const getSeverityBadge = (severity) => {
  switch (severity) {
    case "Cao":
      return <Badge bg="danger">Cao</Badge>;
    case "Trung bình":
      return <Badge bg="warning" text="dark">Trung bình</Badge>;
    case "Thấp":
      return <Badge bg="info">Thấp</Badge>;
    default:
      return <Badge bg="secondary">{severity}</Badge>;
  }
};

const StaffReports = () => {
  const [report, setReport] = useState({
    stationId: localStorage.getItem('stationId'),
    chargingPointId: "",
    description: "",
    severity: ""
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
      console.log("Submitting report:", report);
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
            <Form.Group className="mb-3" controlId="severity">
              <Form.Label>Mức độ nghiêm trọng</Form.Label>
              <Form.Select onChange={handleChangeValue} name="severityLevel" defaultValue="Trung bình">
                <option value="Thấp">Thấp</option>
                <option value="Trung bình">Trung bình</option>
                <option value="Cao">Cao</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3" name="chargingPointId">
              <Form.Label>Cổng sạc</Form.Label>
              <Form.Select onChange={handleChangeValue} name="pointId" required>
                <option value="">Chọn cổng sạc</option>
                {charging_point.map((p) => (
                  <option key={p.pointId} value={p.pointId}>
                    {p.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-4" name="description">
              <Form.Label>Mô tả chi tiết</Form.Label>
              <Form.Control
                onChange={handleChangeValue}
                type="text"
                name="report"
                as="textarea"
                rows={4}
                placeholder="Mô tả chi tiết về sự cố..."
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
          <Card.Title as="h5" className="mb-3">Sự cố gần đây</Card.Title>
          <ListGroup variant="flush">
            {recentIncidents.map((incident) => (
              <ListGroup.Item
                key={incident.id}
                className="d-flex justify-content-between align-items-start px-0 py-3"
              >
                <div>
                  <div className="fw-bold">
                    <span className={`text-${incident.severity === 'Cao' ? 'danger' : 'warning'} me-2`}>●</span>
                    {incident.title}
                  </div>
                  <p className="mb-1 ms-4">{incident.description}</p>
                  <small className="text-muted ms-4">
                    Báo cáo bởi: {incident.reporter} • {incident.time}
                  </small>
                </div>
                {getSeverityBadge(incident.severity)}
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default StaffReports;