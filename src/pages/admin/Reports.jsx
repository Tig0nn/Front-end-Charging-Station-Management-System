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
  Filler,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import { revenueAPI } from "../../lib/apiServices.js";
import LoadingSpinner from "../../components/loading_spins/LoadingSpinner.jsx";

// Đăng ký các thành phần cần thiết cho Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Reports = () => {
  const [chartData, setChartData] = useState({
    labels: [],
    revenueData: [],
    sessionData: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [period, setPeriod] = useState("monthly"); // 🆕 Track selected period

  // 🆕 Load data from API - Dynamic based on selected period
  const loadReportsData = async (selectedPeriod = period) => {
    try {
      setLoading(true);
      setError("");

      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;

      let labels = [];
      let processedRevenue = [];
      let processedSessions = [];

      if (selectedPeriod === "weekly") {
        // Load 7 days (current week)
        const currentDate = new Date();
        const currentDay = currentDate.getDay();
        const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
        const monday = new Date(currentDate);
        monday.setDate(currentDate.getDate() + mondayOffset);

        const dayLabels = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

        for (let i = 0; i < 7; i++) {
          const day = new Date(monday);
          day.setDate(monday.getDate() + i);

          try {
            const response = await revenueAPI.getRevenues({
              period: "daily",
              year: day.getFullYear(),
              month: day.getMonth() + 1,
              day: day.getDate(),
            });

            const data = response.data;
            if (data.code === 1000 && data.result) {
              const dayRevenue = data.result.reduce(
                (sum, station) => sum + (station.totalRevenue || 0),
                0
              );
              const daySessions = data.result.reduce(
                (sum, station) => sum + (station.totalSessions || 0),
                0
              );
              processedRevenue.push(dayRevenue);
              processedSessions.push(daySessions);
            } else {
              processedRevenue.push(0);
              processedSessions.push(0);
            }
          } catch (err) {
            console.warn(
              `Không thể tải dữ liệu ngày ${day.toISOString()}:`,
              err
            );
            processedRevenue.push(0);
            processedSessions.push(0);
          }
        }

        labels = dayLabels;
      } else if (selectedPeriod === "monthly") {
        // Load 6 months (existing logic)
        const months = [];

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

        for (const { month, year } of months) {
          try {
            const response = await revenueAPI.getRevenues({
              period: "monthly",
              year: year,
              month: month,
            });

            const data = response.data;
            if (data.code === 1000 && data.result) {
              const monthRevenue = data.result.reduce(
                (sum, station) => sum + (station.totalRevenue || 0),
                0
              );
              const monthSessions = data.result.reduce(
                (sum, station) => sum + (station.totalSessions || 0),
                0
              );
              processedRevenue.push(monthRevenue);
              processedSessions.push(monthSessions);
            } else {
              processedRevenue.push(0);
              processedSessions.push(0);
            }
          } catch (err) {
            console.warn(`Không thể tải dữ liệu tháng ${month}/${year}:`, err);
            processedRevenue.push(0);
            processedSessions.push(0);
          }
        }
      } else if (selectedPeriod === "yearly") {
        // Load 12 months of current year
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

        for (let month = 1; month <= 12; month++) {
          try {
            const response = await revenueAPI.getRevenues({
              period: "monthly",
              year: currentYear,
              month: month,
            });

            const data = response.data;
            if (data.code === 1000 && data.result) {
              const monthRevenue = data.result.reduce(
                (sum, station) => sum + (station.totalRevenue || 0),
                0
              );
              const monthSessions = data.result.reduce(
                (sum, station) => sum + (station.totalSessions || 0),
                0
              );
              processedRevenue.push(monthRevenue);
              processedSessions.push(monthSessions);
            } else {
              processedRevenue.push(0);
              processedSessions.push(0);
            }
          } catch (err) {
            console.warn(`Không thể tải dữ liệu tháng ${month}:`, err);
            processedRevenue.push(0);
            processedSessions.push(0);
          }
        }
      }

      console.log("📊 Reports data loaded:", {
        labels,
        processedRevenue,
        processedSessions,
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

  // Load data when component mounts or period changes
  useEffect(() => {
    loadReportsData(period);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Calculate total revenue
  const totalRevenue = chartData.revenueData.reduce((sum, val) => sum + val, 0);
  const totalSessions = chartData.sessionData.reduce(
    (sum, val) => sum + val,
    0
  );

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
      {/* 🆕 Main Revenue Chart with Period Selector */}
      <Row className="mb-4">
        <Col xs={12}>
          <Card className="h-100">
            <Card.Header className="d-flex justify-content-between align-items-center bg-white border-bottom">
              <div>
                <h5 className="mb-1">Biểu đồ doanh thu</h5>
                <small className="text-muted">
                  {period === "weekly"
                    ? "Doanh thu tuần này (7 ngày)"
                    : period === "monthly"
                    ? "Doanh thu 6 tháng gần nhất"
                    : "Doanh thu năm nay (12 tháng)"}
                </small>
              </div>
              <div className="d-flex gap-2">
                <Form.Select
                  size="sm"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  style={{ width: "140px" }}
                >
                  <option value="weekly">Theo tuần</option>
                  <option value="monthly">6 tháng</option>
                  <option value="yearly">Theo năm</option>
                </Form.Select>
                <button
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => loadReportsData(period)}
                  disabled={loading}
                >
                  {loading ? (
                    <LoadingSpinner />
                  ) : (
                    <i className="bi bi-arrow-clockwise"></i>
                  )}
                </button>
              </div>
            </Card.Header>

            <Card.Body>
              {error && (
                <Alert variant="danger" className="mb-3">
                  {error}
                </Alert>
              )}

              {/* Summary Cards */}
              <Row className="mb-4">
                <Col md={6}>
                  <div className="d-flex align-items-center gap-3 p-3 bg-light rounded">
                    <div>
                      <h6 className="mb-0 text-muted">Tổng doanh thu</h6>
                      <h4 className="mb-0 text-success font-weight-bold">
                        {formatCurrency(totalRevenue)}
                      </h4>
                    </div>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="d-flex align-items-center gap-3 p-3 bg-light rounded">
                    <div>
                      <h6 className="mb-0 text-muted">Tổng phiên sạc</h6>
                      <h4 className="mb-0 text-primary font-weight-bold">
                        {totalSessions.toLocaleString()} phiên
                      </h4>
                    </div>
                  </div>
                </Col>
              </Row>

              {/* Main Chart */}
              <div style={{ height: "400px", position: "relative" }}>
                {loading ? (
                  <div className="d-flex justify-content-center align-items-center h-100">
                    <div className="text-center">
                      <LoadingSpinner />
                      <p className="mt-2 text-muted">Đang tải dữ liệu...</p>
                    </div>
                  </div>
                ) : chartData.labels.length > 0 ? (
                  <Bar
                    data={{
                      labels: chartData.labels,
                      datasets: [
                        {
                          label: "Doanh thu",
                          data: chartData.revenueData,
                          backgroundColor: "rgba(16, 185, 129, 0.6)",
                          borderColor: "rgba(16, 185, 129, 1)",
                          borderWidth: 1,
                          borderRadius: 6,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { display: false },
                        tooltip: {
                          backgroundColor: "rgba(0, 0, 0, 0.8)",
                          callbacks: {
                            label: (context) =>
                              `Doanh thu: ${formatCurrency(context.parsed.y)}`,
                          },
                        },
                      },
                      scales: {
                        x: { grid: { display: false } },
                        y: {
                          beginAtZero: true,
                          ticks: {
                            callback: (value) => {
                              if (value >= 1000000000)
                                return (value / 1000000000).toFixed(1) + "B";
                              if (value >= 1000000)
                                return (value / 1000000).toFixed(1) + "M";
                              if (value >= 1000)
                                return (value / 1000).toFixed(1) + "K";
                              return value;
                            },
                          },
                        },
                      },
                    }}
                  />
                ) : (
                  <div className="d-flex justify-content-center align-items-center h-100">
                    <p className="text-muted">Không có dữ liệu</p>
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* 2 biểu đồ phụ: Tăng trưởng và Phiên sạc */}
      {loading ? null : error ? null : (
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
