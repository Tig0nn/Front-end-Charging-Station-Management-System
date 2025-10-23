// src/pages/StationOverview.jsx
import React from "react";
import { Container, Row, Col, Card, Button, Badge } from "react-bootstrap";
import { chargingPointsAPI } from "../../lib/apiServices.js";
import { useState, useEffect } from "react";
// Mock data (có thể fetch API sau)


const stations = [
  {
    id: 1,
    name: "Điểm sạc #1",
    power: "50kW",
    type: "CCS",
    status: "Đang sạc",
    user: "Nguyễn Văn An",
    startTime: "14:30",
    percent: 65,
    cost: "45.000đ",
    maintenance: "15/9/2024",
  },
  {
    id: 2,
    name: "Điểm sạc #2",
    power: "50kW",
    type: "CCS",
    status: "Sẵn sàng",
    maintenance: "20/9/2024",
  },
  {
    id: 3,
    name: "Điểm sạc #3",
    power: "120kW",
    type: "CCS",
    status: "Đang sạc",
    user: "Trần Thị Bình",
    startTime: "15:15",
    percent: 80,
    cost: "82.000đ",
    maintenance: "18/9/2024",
  },
  {
    id: 4,
    name: "Điểm sạc #4",
    power: "50kW",
    type: "CHAdeMO",
    status: "Offline",
    maintenance: "10/9/2024",
  },
  {
    id: 5,
    name: "Điểm sạc #5",
    power: "120kW",
    type: "CCS",
    status: "Sẵn sàng",
    maintenance: "25/9/2024",
  },
  {
    id: 6,
    name: "Điểm sạc #6",
    power: "50kW",
    type: "CCS",
    status: "Bảo trì",
    maintenance: "1/10/2024",
  },
];



export default function StationOverview() {
  // State để lưu danh sách trụ sạc từ API
  const [chargingPoints, setChargingPoints] = useState([]);
  // State để quản lý trạng thái tải dữ liệu
  const [loading, setLoading] = useState(true);
  // State để lưu thông báo lỗi nếu có
  const [error, setError] = useState(null);


  // Hàm lấy màu theo trạng thái
const getStatusBadge = (status) => {
  switch (status) {
    case "Đang sạc":
      return <Badge bg="success">Đang sạc</Badge>;
    case "Sẵn sàng":
      return <Badge bg="primary">Sẵn sàng</Badge>;
    case "Offline":
      return <Badge bg="danger">Offline</Badge>;
    case "Bảo trì":
      return (
        <Badge bg="warning" text="dark">
          Bảo trì
        </Badge>
      );
    default:
      return <Badge bg="secondary">{status}</Badge>;
  }
};

const idStation = "a09fc6f4-aba2-11f0-bfb5-a2aa8cd208e5"; // ID trạm sạc mẫu

  useEffect(() => {
    const fetchChargingPoints = async () => {
      if (!idStation) {
        setError("Không xác định được ID của trạm sạc.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        // Gọi API thật bằng hàm bạn đã chỉ định
        const response = await chargingPointsAPI.getChargersByStation(
          managedStationId
        );

        if (response.data && response.data.result) {
          // Lưu dữ liệu vào state
          setChargingPoints(response.data.result);
        } else {
          setChargingPoints([]);
        }
      } catch (err) {
        console.error("Error fetching charging points:", err);
        setError("Không thể tải danh sách trụ sạc. Vui lòng thử lại.");
        setChargingPoints([]);
      } finally {
        setLoading(false);
      }
    };

    fetchChargingPoints();
  }, []); // Chỉ chạy 1 lần khi component được render

  return (
    <Container className="py-4">
      <h4 className="mb-2">Trạm sạc: Vincom Đồng Khởi</h4>
      <p className="text-muted">72 Lê Thánh Tôn, Quận 1, TP.HCM</p>

      {/* Tổng quan */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center shadow-sm">
            <Card.Body>
              <h6 className="text-muted">Điểm sạc hoạt động</h6>
              <h4>4/6</h4>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center shadow-sm">
            <Card.Body>
              <h6 className="text-muted">Phiên sạc hôm nay</h6>
              <h4>23</h4>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center shadow-sm">
            <Card.Body>
              <h6 className="text-muted">Doanh thu hôm nay</h6>
              <h4>2.450.000đ</h4>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center shadow-sm">
            <Card.Body>
              <h6 className="text-muted">Thời gian TB</h6>
              <h4>52 phút</h4>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Danh sách điểm sạc */}
      <Row xs={1} md={2} lg={3} className="g-3">
        {stations.map((s) => (
          <Col key={s.id}>
            <Card className="h-100 shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="mb-0">{s.name}</h6>
                  {getStatusBadge(s.status)}
                </div>

                <div className="text-muted small mb-2">
                  ⚡ {s.power} &nbsp; | &nbsp; 🔌 {s.type}
                </div>

                {s.status === "Đang sạc" && (
                  <div className="bg-success bg-opacity-10 p-2 rounded mb-3">
                    <div className="fw-bold">{s.user}</div>
                    <div className="small text-muted">
                      Bắt đầu: {s.startTime} — {s.percent}%
                    </div>
                    <div className="fw-semibold">{s.cost}</div>
                  </div>
                )}

                {s.status === "Offline" && (
                  <div className="text-center text-danger py-3">
                    Không kết nối
                  </div>
                )}

                {s.status === "Bảo trì" && (
                  <div className="text-center text-warning py-3">
                    Đang bảo trì
                  </div>
                )}

                <div className="d-flex gap-2">
                  <Button
                    variant={s.status === "Đang sạc" ? "light" : "dark"}
                    disabled={s.status === "Offline" || s.status === "Bảo trì"}
                    className="w-50"
                  >
                    {s.status === "Đang sạc" ? "Dừng sạc" : "Khởi động"}
                  </Button>
                  <Button variant="outline-secondary" className="w-50">
                    Chi tiết
                  </Button>
                </div>
              </Card.Body>
              <Card.Footer className="text-muted small">
                Bảo trì cuối: {s.maintenance}
              </Card.Footer>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}
