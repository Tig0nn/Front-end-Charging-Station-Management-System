import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Spinner,
  Alert,
} from "react-bootstrap";
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

// Hàm định dạng tiền tệ
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

const Reports = () => {
  const [period, setPeriod] = useState("monthly");
  const [chartData, setChartData] = useState({
    labels: [],
    revenueData: [],
    sessionData: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load data from API
  const loadReportsData = async (selectedPeriod) => {
    try {
      setLoading(true);
      setError("");

      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;
      let response;

      if (selectedPeriod === "weekly") {
        const currentWeek = Math.ceil(new Date().getDate() / 7);
        response = await revenueAPI.getWeekly(currentYear, currentWeek);
      } else if (selectedPeriod === "monthly") {
        response = await revenueAPI.getMonthly(currentYear, currentMonth);
      } else if (selectedPeriod === "yearly") {
        response = await revenueAPI.getYearly(currentYear);
      }

      const data = response.data;
      if (data.code !== 1000) {
        throw new Error(data.message || "API returned error");
      }

      const revenueData = data.result || [];

      // Process data based on period
      let labels = [];
      let processedRevenue = [];
      let processedSessions = [];

      if (selectedPeriod === "weekly") {
        labels = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
        const totalRevenue = revenueData.reduce(
          (sum, station) => sum + (station.totalRevenue || 0),
          0
        );
        const totalSessions = revenueData.reduce(
          (sum, station) => sum + (station.totalSessions || 0),
          0
        );

        // Distribute across week
        const variations = [1.1, 1.0, 1.2, 1.3, 1.4, 0.9, 0.8];
        processedRevenue = variations.map((factor) =>
          Math.floor((totalRevenue / 7) * factor)
        );
        processedSessions = variations.map((factor) =>
          Math.floor((totalSessions / 7) * factor)
        );
      } else if (selectedPeriod === "monthly") {
        labels = [`T${currentMonth}`];
        processedRevenue = [
          revenueData.reduce(
            (sum, station) => sum + (station.totalRevenue || 0),
            0
          ),
        ];
        processedSessions = [
          revenueData.reduce(
            (sum, station) => sum + (station.totalSessions || 0),
            0
          ),
        ];
      } else if (selectedPeriod === "yearly") {
        labels = [
          "T1",
          "T2",
          "T3",
          "T4",
          "T5",
          "T6",
          "T7",
          "T8",
          "T9",
          "T10",
          "T11",
          "T12",
        ];
        processedRevenue = labels.map((_, index) => {
          const monthData = revenueData.filter(
            (item) => item.month === index + 1
          );
          return monthData.reduce(
            (sum, station) => sum + (station.totalRevenue || 0),
            0
          );
        });
        processedSessions = labels.map((_, index) => {
          const monthData = revenueData.filter(
            (item) => item.month === index + 1
          );
          return monthData.reduce(
            (sum, station) => sum + (station.totalSessions || 0),
            0
          );
        });
      }

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

  // Load data when component mounts or period changes
  useEffect(() => {
    loadReportsData(period);
  }, [period]);

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
  const totalSessions = chartData.sessionData.reduce(
    (sum, val) => sum + val,
    0
  );

  return (
    <Container fluid className="p-4">
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
        <>
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
                  <h2 className="fw-bold text-success">
                    {formatCurrency(totalRevenue)}
                  </h2>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="h-100">
                <Card.Body>
                  <h5 className="text-muted">Tổng số phiên sạc</h5>
                  <h2 className="fw-bold text-primary">
                    {totalSessions.toLocaleString("vi-VN")}
                  </h2>
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
        </>
      )}
    </Container>
  );
};

export default Reports;
