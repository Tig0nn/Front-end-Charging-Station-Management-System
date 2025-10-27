import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Spinner, Badge } from "react-bootstrap";
import { systemOverviewAPI } from "../../lib/apiServices.js";
import RevenueChart from "../../components/charts/RevenueChart.jsx";
import "bootstrap-icons/font/bootstrap-icons.css";

const Dashboard = () => {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🚀 Lấy dữ liệu tổng quan từ API /api/overview
  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const res = await systemOverviewAPI.getOverview();

        if (res.data.code === 1000) {
          setOverview(res.data.result);
        } else {
          setError("Không thể tải dữ liệu tổng quan.");
        }
      } catch (err) {
        console.error("Fetch overview failed:", err);
        setError("Lỗi khi tải dữ liệu từ server.");
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, []);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount || 0);
  };

  // Format number
  const formatNumber = (num) => {
    return new Intl.NumberFormat("vi-VN").format(num || 0);
  };

  // 🧭 Hiển thị giao diện
  return (
    <Container fluid className="px-4">
      {/* Header */}
      <Row className="mb-4 mt-3">
        <Col>
          <h2 className="mb-1">
            <i className="bi bi-speedometer2 me-2"></i>
            Dashboard - Tổng quan hệ thống
          </h2>
          <p className="text-muted mb-0">
            Quản lý và giám sát hệ thống trạm sạc điện
          </p>
        </Col>
      </Row>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2 text-muted">Đang tải dữ liệu...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </div>
      ) : (
        <>
          {/* Thống kê tổng quan - Hàng 1 */}
          <Row className="g-3 mb-4">
            {/* Tổng trạm sạc */}
            <Col md={6} lg={3}>
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="mb-0 text-muted">Tổng trạm sạc</h6>
                    <div
                      className="rounded-circle bg-primary bg-opacity-10 p-2"
                      style={{ width: "40px", height: "40px" }}
                    >
                      <i className="bi bi-ev-station-fill text-primary"></i>
                    </div>
                  </div>
                  <h2 className="mb-1">
                    {formatNumber(overview?.totalStations)}
                  </h2>
                  <small className="text-muted">Trạm đang hoạt động</small>
                </Card.Body>
              </Card>
            </Col>

            {/* Tổng điểm sạc */}
            <Col md={6} lg={3}>
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="mb-0 text-muted">Tổng điểm sạc</h6>
                    <div
                      className="rounded-circle bg-info bg-opacity-10 p-2"
                      style={{ width: "40px", height: "40px" }}
                    >
                      <i className="bi bi-plug-fill text-info"></i>
                    </div>
                  </div>
                  <h2 className="mb-1">
                    {formatNumber(overview?.totalChargingPoints)}
                  </h2>
                  <small className="text-success">
                    <i className="bi bi-check-circle-fill me-1"></i>
                    {formatNumber(overview?.activeChargingPoints)} đang hoạt
                    động
                  </small>
                </Card.Body>
              </Card>
            </Col>

            {/* Tổng tài xế */}
            <Col md={6} lg={3}>
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="mb-0 text-muted">Tổng tài xế</h6>
                    <div
                      className="rounded-circle bg-warning bg-opacity-10 p-2"
                      style={{ width: "40px", height: "40px" }}
                    >
                      <i className="bi bi-people-fill text-warning"></i>
                    </div>
                  </div>
                  <h2 className="mb-1">
                    {formatNumber(overview?.totalDrivers)}
                  </h2>
                  <small className="text-muted">Người dùng đã đăng ký</small>
                </Card.Body>
              </Card>
            </Col>

            {/* Doanh thu tháng này */}
            <Col md={6} lg={3}>
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="mb-0 text-muted">Doanh thu tháng</h6>
                    <div
                      className="rounded-circle bg-success bg-opacity-10 p-2"
                      style={{ width: "40px", height: "40px" }}
                    >
                      <i className="bi bi-currency-dollar text-success"></i>
                    </div>
                  </div>
                  <h2 className="mb-1 text-success">
                    {overview?.currentMonthRevenue >= 1000000
                      ? `${(overview.currentMonthRevenue / 1000000).toFixed(
                          1
                        )}M`
                      : formatCurrency(overview?.currentMonthRevenue)}
                  </h2>
                  <small className="text-muted">VNĐ</small>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Thống kê phiên sạc - Hàng 2 */}
          <Row className="g-3 mb-4">
            {/* Số phiên sạc tháng này */}
            <Col md={6} lg={3}>
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="mb-0 text-muted">Phiên sạc tháng</h6>
                    <div
                      className="rounded-circle bg-primary bg-opacity-10 p-2"
                      style={{ width: "40px", height: "40px" }}
                    >
                      <i className="bi bi-lightning-charge-fill text-primary"></i>
                    </div>
                  </div>
                  <h2 className="mb-1">
                    {formatNumber(overview?.currentMonthSessions)}
                  </h2>
                  <small className="text-muted">Lượt sạc trong tháng</small>
                </Card.Body>
              </Card>
            </Col>

            {/* Thời gian trung bình */}
            <Col md={6} lg={3}>
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="mb-0 text-muted">Thời gian TB</h6>
                    <div
                      className="rounded-circle bg-info bg-opacity-10 p-2"
                      style={{ width: "40px", height: "40px" }}
                    >
                      <i className="bi bi-clock-fill text-info"></i>
                    </div>
                  </div>
                  <h2 className="mb-1">
                    {overview?.averageSessionDuration || 0}
                  </h2>
                  <small className="text-muted">Phút / phiên sạc</small>
                </Card.Body>
              </Card>
            </Col>

            {/* Doanh thu TB mỗi phiên */}
            <Col md={6} lg={3}>
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="mb-0 text-muted">Doanh thu TB/phiên</h6>
                    <div
                      className="rounded-circle bg-success bg-opacity-10 p-2"
                      style={{ width: "40px", height: "40px" }}
                    >
                      <i className="bi bi-cash-coin text-success"></i>
                    </div>
                  </div>
                  <h2 className="mb-1 text-success">
                    {overview?.averageRevenuePerSession >= 1000
                      ? `${(overview.averageRevenuePerSession / 1000).toFixed(
                          0
                        )}K`
                      : formatNumber(overview?.averageRevenuePerSession)}
                  </h2>
                  <small className="text-muted">VNĐ</small>
                </Card.Body>
              </Card>
            </Col>

            {/* Tỷ lệ hoạt động */}
            <Col md={6} lg={3}>
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="mb-0 text-muted">Tỷ lệ hoạt động</h6>
                    <div
                      className="rounded-circle bg-warning bg-opacity-10 p-2"
                      style={{ width: "40px", height: "40px" }}
                    >
                      <i className="bi bi-bar-chart-fill text-warning"></i>
                    </div>
                  </div>
                  <h2 className="mb-1">
                    {overview?.totalChargingPoints > 0
                      ? Math.round(
                          (overview.activeChargingPoints /
                            overview.totalChargingPoints) *
                            100
                        )
                      : 0}
                    %
                  </h2>
                  <small className="text-muted">
                    {formatNumber(overview?.activeChargingPoints)} /{" "}
                    {formatNumber(overview?.totalChargingPoints)} điểm
                  </small>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Biểu đồ doanh thu */}
          <Row className="mb-4">
            <Col>
              <RevenueChart />
            </Col>
          </Row>
        </>
      )}
    </Container>
  );
};

export default Dashboard;
