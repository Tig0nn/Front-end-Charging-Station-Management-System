import React from "react";
import { Row, Col, Card } from "react-bootstrap";

export default function StationHeader({ 
  stationName,
  stationAddress = "72 Lê Thánh Tôn, Quận 1, TP.HCM",
  activePoints, 
  totalPoints,
  sessionsToday = 0,
  revenue = 0,
  avgChargeTime = 0
}) {
  // Format currency
  const formatCurrency = (value) => {
    if (typeof value !== "number") {
      return "0đ";
    }
    return value.toLocaleString("vi-VN") + "đ";
  };

  // Format time (minutes to hours:minutes)
  const formatTime = (minutes) => {
    if (!minutes) return "0 phút";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}phút`;
    }
    return `${mins} phút`;
  };  return (
    <div className="mb-3">
      {/* Tên trạm và địa chỉ */}
      <div className="mb-3">
        <h5 className="mb-1 fw-bold">
          {stationName || "Đang tải..."}
        </h5>
        <p className="text-muted small mb-0">{stationAddress}</p>
      </div>
      
      {/* Thống kê cards - Tối giản hơn */}
      <Row className="g-3">
        {/* Điểm sạc hoạt động */}
        <Col xs={12} sm={6} lg={3}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="py-3 px-3">
              <div className="d-flex align-items-center">
                <i className="bi bi-activity text-success fs-4 me-3"></i>
                <div>
                  <div className="text-muted small mb-1">Điểm sạc hoạt động</div>
                  <h5 className="mb-0 fw-bold">
                    {activePoints}/{totalPoints}
                  </h5>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Phiên sạc hôm nay */}
        <Col xs={12} sm={6} lg={3}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="py-3 px-3">
              <div className="d-flex align-items-center">
                <i className="bi bi-person-fill text-primary fs-4 me-3"></i>
                <div>
                  <div className="text-muted small mb-1">Phiên sạc hôm nay</div>
                  <h5 className="mb-0 fw-bold">{sessionsToday}</h5>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Doanh thu hôm nay */}
        <Col xs={12} sm={6} lg={3}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="py-3 px-3">
              <div className="d-flex align-items-center">
                <i className="bi bi-currency-dollar text-success fs-4 me-3"></i>
                <div>
                  <div className="text-muted small mb-1">Doanh thu hôm nay</div>
                  <h5 className="mb-0 fw-bold text-dark">
                    {formatCurrency(revenue)}
                  </h5>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Thời gian TB */}
        <Col xs={12} sm={6} lg={3}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="py-3 px-3">
              <div className="d-flex align-items-center">
                <i className="bi bi-clock text-primary fs-4 me-3" style={{ color: '#8b5cf6' }}></i>
                <div>
                  <div className="text-muted small mb-1">Thời gian TB</div>
                  <h5 className="mb-0 fw-bold">{formatTime(avgChargeTime)}</h5>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
