import React, { useState, useEffect } from "react";
import { Row, Col, Card, Form, Spinner, Alert } from "react-bootstrap";
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
import { revenueAPI } from "../../lib/apiServices.js";
import RevenueChart from "../../components/charts/RevenueChart.jsx";

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

const Reports = () => {
  const [chartData, setChartData] = useState({
    labels: [],
    revenueData: [],
    sessionData: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load data from API - Hiển thị 6 tháng gần nhất
  const loadReportsData = async () => {
    try {
      setLoading(true);
      setError("");

      const currentYear = new Date().getFullYear();

      // Lấy dữ liệu của năm hiện tại
      const response = await revenueAPI.getYearly(currentYear);

      const data = response.data;
      if (data.code !== 1000) {
        throw new Error(data.message || "API returned error");
      }

      const revenueData = data.result || [];

      // Lấy 6 tháng gần nhất
      const currentMonth = new Date().getMonth() + 1; // 1-12
      const months = [];
      const labels = [];

      for (let i = 5; i >= 0; i--) {
        let month = currentMonth - i;
        let year = currentYear;

        if (month <= 0) {
          month += 12;
          year -= 1;
        }

        months.push({ month, year });
        labels.push(`T${month}`);
      }

      // Xử lý dữ liệu cho 6 tháng
      const processedRevenue = months.map(({ month }) => {
        const monthData = revenueData.filter((item) => item.month === month);
        return monthData.reduce(
          (sum, station) => sum + (station.totalRevenue || 0),
          0
        );
      });

      const processedSessions = months.map(({ month }) => {
        const monthData = revenueData.filter((item) => item.month === month);
        return monthData.reduce(
          (sum, station) => sum + (station.totalSessions || 0),
          0
        );
      });

      setChartData({
        labels,
        revenueData: processedRevenue,
        sessionData: processedSessions,
      });
    } catch (err) {
      console.error("Error loading reports data:", err);
      setError("Không thể tải dữ liệu báo cáo");
    } finally {
      setLoading(false);
    }
  };

  // Load data when component mounts
  useEffect(() => {
    loadReportsData();
  }, []);

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

  return (
    <>
      {/* Biểu đồ doanh thu chính từ Dashboard */}
      <Row className="mb-4">
        <Col xs={12}>
          <RevenueChart />
        </Col>
      </Row>

      {/* 2 biểu đồ phụ: Tăng trưởng và Phiên sạc */}
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2 text-muted">Đang tải dữ liệu báo cáo...</p>
        </div>
      ) : error ? (
        <Alert variant="danger" className="mb-4">
          <Alert.Heading>Lỗi tải dữ liệu</Alert.Heading>
          <p>{error}</p>
        </Alert>
      ) : (
        <Row>
          <Col lg={6} className="mb-4">
            <Card>
              <Card.Header>
                <Card.Title className="mb-0">
                  Biểu đồ tăng trưởng doanh thu
                </Card.Title>
              </Card.Header>
              <Card.Body style={{ height: "400px" }}>
                <Line options={commonOptions} data={revenueChartData} />
              </Card.Body>
            </Card>
          </Col>
          <Col lg={6} className="mb-4">
            <Card>
              <Card.Header>
                <Card.Title className="mb-0">Biểu đồ số phiên sạc</Card.Title>
              </Card.Header>
              <Card.Body style={{ height: "400px" }}>
                <Bar options={commonOptions} data={sessionChartData} />
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </>
  );
};

export default Reports;
