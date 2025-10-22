import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Spinner } from "react-bootstrap";
import { systemOverviewAPI } from "../../lib/apiServices.js";
import RevenueChart from "../../components/charts/RevenueChart.jsx";

const Dashboard = () => {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🧭 Hàm lấy tên người dùng (ưu tiên context, fallback localStorage)

  // 🚀 Lấy dữ liệu tổng quan từ API /api/overview
  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const res = await systemOverviewAPI.getOverview(); // ✅ Dùng systemOverviewAPI

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

  // 🧭 Hiển thị giao diện
  return (
    <Container>
      <Row className="mb-3">
        <Col>
          <h1>Tổng quan hệ thống</h1>
          <p className="lead">
            Quản trị trung tâm EV Charging — Xin chào Admin
          </p>
        </Col>
      </Row>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" />
          <p className="mt-2">Đang tải dữ liệu...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : (
        <>
          <Row className="g-3">
            <Col md={4}>
              <Card className="h-100 text-center shadow-sm">
                <Card.Body className="d-flex flex-column justify-content-center">
                  <Card.Title className="mb-3">Tổng trạm sạc</Card.Title>
                  <h2 className="mb-2">{overview?.totalStations ?? 0}</h2>
                </Card.Body>
              </Card>
            </Col>

            <Col md={4}>
              <Card className="h-100 text-center shadow-sm">
                <Card.Body className="d-flex flex-column justify-content-center">
                  <Card.Title className="mb-3">Điểm sạc hoạt động</Card.Title>
                  <h2 className="mb-2">
                    {overview?.activeChargingPoints ?? 0}
                  </h2>
                </Card.Body>
              </Card>
            </Col>

            <Col md={4}>
              <Card className="h-100 text-center shadow-sm">
                <Card.Body className="d-flex flex-column justify-content-center">
                  <Card.Title className="mb-3">Tổng tài xế</Card.Title>
                  <h2 className="mb-2">{overview?.totalDrivers ?? 0}</h2>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row className="mt-4">
            <Col>
              <Card className="text-center shadow-sm">
                <Card.Body>
                  <Card.Title className="mb-3">
                    Doanh thu tháng hiện tại
                  </Card.Title>
                  <h2 className="text-success mb-0">
                    {overview?.currentMonthRevenue
                      ? overview.currentMonthRevenue.toLocaleString("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        })
                      : "0 ₫"}
                  </h2>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Biểu đồ doanh thu */}
          <Row className="mt-4">
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
