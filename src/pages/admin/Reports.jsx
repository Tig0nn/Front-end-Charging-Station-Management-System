import React, { useState, useMemo } from "react";
import { Container, Row, Col, Card, Form } from "react-bootstrap";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";

// Đăng ký các thành phần cần thiết cho Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Hàm tạo dữ liệu giả
const generateMockData = (period) => {
  switch (period) {
    case "weekly":
      return {
        labels: ["T2", "T3", "T4", "T5", "T6", "T7", "CN"],
        revenueData: [1200000, 1500000, 1300000, 1800000, 2200000, 2500000, 2300000],
        sessionData: [50, 65, 55, 70, 85, 95, 90],
      };
    case "yearly":
      return {
        labels: ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12"],
        revenueData: [25, 30, 45, 40, 55, 65, 70, 68, 75, 85, 90, 110].map(v => v * 1000000),
        sessionData: [500, 550, 650, 600, 700, 800, 820, 810, 880, 950, 1000, 1200],
      };
    case "monthly":
    default:
      return {
        labels: ["Tuần 1", "Tuần 2", "Tuần 3", "Tuần 4"],
        revenueData: [8000000, 9500000, 7500000, 11000000],
        sessionData: [250, 280, 240, 320],
      };
  }
};

// Hàm định dạng tiền tệ
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
};

const Reports = () => {
  const [period, setPeriod] = useState("monthly"); // 'weekly', 'monthly', 'yearly'

  // Sử dụng useMemo để chỉ tạo lại dữ liệu khi period thay đổi
  const chartData = useMemo(() => generateMockData(period), [period]);

  // Cấu hình chung cho các biểu đồ
  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#fff",
        bodyColor: "#fff",
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        grid: { display: false },
      },
      y: {
        beginAtZero: true,
      },
    },
  };

  // Dữ liệu cho biểu đồ doanh thu (Line Chart)
  const revenueChartData = {
    labels: chartData.labels,
    datasets: [
      {
        label: "Doanh thu",
        data: chartData.revenueData,
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  // Dữ liệu cho biểu đồ phiên sạc (Bar Chart)
  const sessionChartData = {
    labels: chartData.labels,
    datasets: [
      {
        label: "Số phiên sạc",
        data: chartData.sessionData,
        backgroundColor: "rgba(54, 162, 235, 0.6)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const totalRevenue = chartData.revenueData.reduce((sum, val) => sum + val, 0);
  const totalSessions = chartData.sessionData.reduce((sum, val) => sum + val, 0);

  return (
    <Container fluid className="p-4">
      <Row className="mb-4">
        <Col md={12}>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h4 className="mb-0">Báo cáo tổng quan</h4>
              <Form.Select
                size="sm"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                style={{ width: "150px" }}
              >
                <option value="weekly">Theo Tuần</option>
                <option value="monthly">Theo Tháng</option>
                <option value="yearly">Theo Năm</option>
              </Form.Select>
            </Card.Header>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={6}>
            <Card className="h-100">
                <Card.Body>
                    <h5 className="text-muted">Tổng doanh thu</h5>
                    <h2 className="fw-bold text-success">{formatCurrency(totalRevenue)}</h2>
                </Card.Body>
            </Card>
        </Col>
        <Col md={6}>
            <Card className="h-100">
                <Card.Body>
                    <h5 className="text-muted">Tổng số phiên sạc</h5>
                    <h2 className="fw-bold text-primary">{totalSessions.toLocaleString('vi-VN')}</h2>
                </Card.Body>
            </Card>
        </Col>
      </Row>

      <Row>
        <Col lg={6} className="mb-4">
          <Card>
            <Card.Header>
              <Card.Title>Biểu đồ tăng trưởng doanh thu</Card.Title>
            </Card.Header>
            <Card.Body style={{ height: "400px" }}>
              <Line options={commonOptions} data={revenueChartData} />
            </Card.Body>
          </Card>
        </Col>
        <Col lg={6} className="mb-4">
          <Card>
            <Card.Header>
              <Card.Title>Biểu đồ số phiên sạc</Card.Title>
            </Card.Header>
            <Card.Body style={{ height: "400px" }}>
              <Bar options={commonOptions} data={sessionChartData} />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Reports;