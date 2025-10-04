import React from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import RevenueChart from "../components/charts/RevenueChart.jsx";

const DashboardAnalytics = () => {
  return (
    <Container fluid className="py-4">
      <Row>
        <Col>
          <h2 className="mb-4">📊 Dashboard Analytics</h2>
        </Col>
      </Row>

      {/* Quick Stats */}
      <Row className="mb-4">
        <Col lg={3} md={6} className="mb-3">
          <Card className="text-center border-0 shadow-sm">
            <Card.Body>
              <div className="text-primary fs-1 mb-2">🏪</div>
              <h6 className="text-muted mb-1">Tổng trạm sạc</h6>
              <h3 className="text-primary mb-0">24</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} md={6} className="mb-3">
          <Card className="text-center border-0 shadow-sm">
            <Card.Body>
              <div className="text-success fs-1 mb-2">👥</div>
              <h6 className="text-muted mb-1">Người dùng hoạt động</h6>
              <h3 className="text-success mb-0">1,245</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} md={6} className="mb-3">
          <Card className="text-center border-0 shadow-sm">
            <Card.Body>
              <div className="text-warning fs-1 mb-2">⚡</div>
              <h6 className="text-muted mb-1">Phiên sạc hôm nay</h6>
              <h3 className="text-warning mb-0">189</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} md={6} className="mb-3">
          <Card className="text-center border-0 shadow-sm">
            <Card.Body>
              <div className="text-info fs-1 mb-2">💰</div>
              <h6 className="text-muted mb-1">Doanh thu hôm nay</h6>
              <h3 className="text-info mb-0">2.5M VND</h3>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Revenue Chart */}
      <Row className="mb-4">
        <Col>
          <RevenueChart />
        </Col>
      </Row>

      {/* Additional Stats */}
      <Row>
        <Col lg={6} className="mb-4">
          <Card className="h-100">
            <Card.Header>
              <h6 className="mb-0">📈 Xu hướng sử dụng</h6>
            </Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span>Giờ cao điểm</span>
                <strong className="text-primary">18:00 - 20:00</strong>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span>Thời gian sạc trung bình</span>
                <strong className="text-success">45 phút</strong>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span>Tỷ lệ sử dụng</span>
                <strong className="text-warning">75.5%</strong>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <span>Trạm bảo trì</span>
                <strong className="text-danger">2 trạm</strong>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6} className="mb-4">
          <Card className="h-100">
            <Card.Header>
              <h6 className="mb-0">🚗 Loại xe phổ biến</h6>
            </Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span>🚗 Xe hơi điện</span>
                <div>
                  <span className="badge bg-primary me-2">65%</span>
                  <small className="text-muted">812 lượt</small>
                </div>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span>🏍️ Xe máy điện</span>
                <div>
                  <span className="badge bg-success me-2">25%</span>
                  <small className="text-muted">312 lượt</small>
                </div>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span>🚚 Xe tải điện</span>
                <div>
                  <span className="badge bg-warning me-2">8%</span>
                  <small className="text-muted">99 lượt</small>
                </div>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <span>🚌 Xe buýt điện</span>
                <div>
                  <span className="badge bg-info me-2">2%</span>
                  <small className="text-muted">25 lượt</small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default DashboardAnalytics;
