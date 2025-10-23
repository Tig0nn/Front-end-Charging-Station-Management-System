import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Badge, Spinner, Alert } from "react-bootstrap";
import { chargingPointsAPI } from "../../lib/apiServices.js";

// --- HELPER FUNCTIONS ---

// Hàm định dạng công suất từ "POWER_22KW" thành "22kW"
const formatPower = (powerString) => {
  if (!powerString) return "N/A";
  const matches = powerString.match(/(\d+)/);
  return matches ? `${matches[0]}kW` : powerString;
};

// Hàm lấy thông tin trạng thái và màu sắc
const getStatusInfo = (point) => {
  // Logic mới dựa trên yêu cầu của bạn
  if (point.status === 'AVAILABLE' && !point.currentSessionId) {
    return { text: "Sẵn sàng", bg: "primary" };
  }
  if (point.status === 'AVAILABLE' && point.currentSessionId) {
    return { text: "Đang sạc", bg: "success" };
  }
  if (point.status === 'CHARGING') { // Trạng thái CHARGING từ API cũng là đang sạc
    return { text: "Đang sạc", bg: "success" };
  }
  if (point.status === 'FAULTED' || point.status === 'UNAVAILABLE') {
    return { text: "Lỗi", bg: "danger" };
  }
  if (point.status === 'MAINTENANCE') {
    return { text: "Bảo trì", bg: "warning", textColor: "dark" };
  }
  // Mặc định cho các trạng thái khác
  return { text: point.status, bg: "secondary" };
};

export default function StationOverview() {
  const [chargingPoints, setChargingPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ID trạm sạc mẫu. Trong thực tế, bạn có thể lấy từ profile của staff.
  const idStation = "a09fc6f4-aba2-11f0-bfb5-a2aa8cd208e5"; 

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
        const response = await chargingPointsAPI.getChargersByStation(idStation);
        if (response.data && response.data.result) {
          setChargingPoints(response.data.result);
          console
        } else {
          setChargingPoints([]);
        }
      } catch (err) {
        console.error("Error fetching charging points:", err);
        setError("Không thể tải danh sách trụ sạc. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };

    fetchChargingPoints();
  }, []);

  // --- TÍNH TOÁN SỐ LIỆU ĐỘNG ---
  const totalPoints = chargingPoints.length;
  const activePoints = chargingPoints.filter(p => getStatusInfo(p).text === 'Sẵn sàng' || getStatusInfo(p).text === 'Đang sạc').length;

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Đang tải dữ liệu trạm sạc...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      {/* Giả sử tên trạm và địa chỉ lấy từ điểm sạc đầu tiên */}
      <h4 className="mb-2">Trạm sạc: {chargingPoints[0]?.stationName || 'Đang tải...'}</h4>
      {/* <p className="text-muted">72 Lê Thánh Tôn, Quận 1, TP.HCM</p> */}

      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center shadow-sm">
            <Card.Body>
              <h6 className="text-muted">Điểm sạc hoạt động</h6>
              {/* Số liệu động */}
              <h4>{activePoints}/{totalPoints}</h4>
            </Card.Body>
          </Card>
        </Col>
        {/* Các thẻ tổng quan khác giữ nguyên vì API không cung cấp dữ liệu này */}
        <Col md={3}><Card className="text-center shadow-sm"><Card.Body><h6 className="text-muted">Phiên sạc hôm nay</h6><h4>N/A</h4></Card.Body></Card></Col>
        <Col md={3}><Card className="text-center shadow-sm"><Card.Body><h6 className="text-muted">Doanh thu hôm nay</h6><h4>N/A</h4></Card.Body></Card></Col>
        <Col md={3}><Card className="text-center shadow-sm"><Card.Body><h6 className="text-muted">Thời gian TB</h6><h4>N/A</h4></Card.Body></Card></Col>
      </Row>

      <Row xs={1} md={2} lg={3} className="g-3">
        {chargingPoints.map((point, index) => {
          const statusInfo = getStatusInfo(point);
          const isCharging = statusInfo.text === 'Đang sạc';
          const isUnavailable = !['Sẵn sàng', 'Đang sạc'].includes(statusInfo.text);

          return (
            <Col key={point.pointId}>
              <Card className="h-100 shadow-sm">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    {/* Tên trụ sạc theo index */}
                    <h6 className="mb-0">Điểm sạc #{index + 1}</h6>
                    <Badge bg={statusInfo.bg} text={statusInfo.textColor || 'light'}>
                      {statusInfo.text}
                    </Badge>
                  </div>

                  <div className="text-muted small mb-2">
                    {/* Công suất từ API */}
                    ⚡ {formatPower(point.chargingPower)}
                  </div>

                  {isCharging && (
                    <div className="bg-success bg-opacity-10 p-2 rounded mb-3">
                      <div className="fw-bold">Đang phục vụ khách</div>
                      <div className="small text-muted">
                        {/* Hiển thị ID phiên sạc nếu có */}
                        Session ID: {point.currentSessionId.substring(0, 8)}...
                      </div>
                    </div>
                  )}

                  {statusInfo.text === "Lỗi" && (
                    <div className="text-center text-danger py-3">
                      Trụ đang gặp lỗi
                    </div>
                  )}

                  {statusInfo.text === "Bảo trì" && (
                    <div className="text-center text-warning py-3">
                      Đang bảo trì
                    </div>
                  )}

                  <div className="d-flex gap-2">
                    <Button
                      variant={isCharging ? "light" : "dark"}
                      disabled={isUnavailable}
                      className="w-50"
                    >
                      {isCharging ? "Dừng sạc" : "Khởi động"}
                    </Button>
                    <Button variant="outline-secondary" className="w-50">
                      Chi tiết
                    </Button>
                  </div>
                </Card.Body>
                <Card.Footer className="text-muted small">
                  ID: {point.pointId}
                </Card.Footer>
              </Card>
            </Col>
          );
        })}
      </Row>
    </Container>
  );
}