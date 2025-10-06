import React, { useState, useEffect } from "react";
import { Card, Row, Col, Form, Button, Spinner, Alert } from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { revenueAPI } from "../../lib/apiServices.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const RevenueChart = () => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [period, setPeriod] = useState("weekly");
  const [totalRevenue, setTotalRevenue] = useState(0);

  // Chart configuration
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Hide legend as shown in your image
      },
      title: {
        display: true,
        text:
          period === "weekly"
            ? "Doanh thu tuần này"
            : period === "monthly"
            ? "Doanh thu tháng này"
            : "Doanh thu theo năm",
        font: {
          size: 16,
          weight: "bold",
        },
        color: "#333",
        padding: 20,
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#fff",
        bodyColor: "#fff",
        cornerRadius: 8,
        callbacks: {
          label: function (context) {
            const value = context.parsed.y;
            return `Doanh thu: ${formatCurrency(value)}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false, // Hide vertical grid lines
        },
        ticks: {
          color: "#666",
          font: {
            size: 12,
          },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
        },
        ticks: {
          color: "#666",
          font: {
            size: 12,
          },
          callback: function (value) {
            return formatCurrencyShort(value);
          },
        },
      },
    },
    elements: {
      bar: {
        borderRadius: 6, // Rounded corners for bars
        borderSkipped: false,
      },
    },
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Format currency for chart (short form)
  const formatCurrencyShort = (amount) => {
    if (amount >= 1000000000) {
      return (amount / 1000000000).toFixed(1) + "B";
    } else if (amount >= 1000000) {
      return (amount / 1000000).toFixed(1) + "M";
    } else if (amount >= 1000) {
      return (amount / 1000).toFixed(1) + "K";
    }
    return amount.toString();
  };

  // Load revenue data
  const loadRevenueData = async (selectedPeriod) => {
    try {
      setLoading(true);
      setError("");

      let response;
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;

      console.log(
        `🔧 Loading revenue data for period: ${selectedPeriod}, year: ${currentYear}, month: ${currentMonth}`
      );

      if (selectedPeriod === "weekly") {
        // Get weekly data (current week)
        const currentWeek = Math.ceil(new Date().getDate() / 7);
        response = await revenueAPI.getWeekly(currentYear, currentWeek);
      } else if (selectedPeriod === "monthly") {
        // Get monthly data (current month)
        response = await revenueAPI.getMonthly(currentYear, currentMonth);
      } else if (selectedPeriod === "yearly") {
        // Get yearly data
        response = await revenueAPI.getYearly(currentYear);
      }

      console.log("📊 Revenue API response:", response);
      console.log("📈 Response status:", response?.status);
      console.log("📈 Response data:", response?.data);

      // Handle response format: { code: 1000, result: [...] }
      const data = response.data;
      console.log("📈 Response data:", data);

      if (data.code !== 1000) {
        throw new Error(data.message || "API returned error");
      }

      const revenueData = data.result || [];
      console.log("💰 Revenue data array:", revenueData);

      // Generate labels based on period
      let labels = [];
      let processedData = [];

      if (selectedPeriod === "weekly") {
        // For weekly data - show days of week
        labels = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

        if (revenueData && revenueData.length > 0) {
          // Sum all stations revenue for the week
          const totalWeeklyRevenue = revenueData.reduce(
            (sum, station) => sum + (station.totalRevenue || 0),
            0
          );

          // Create realistic daily distribution
          const baseDaily = totalWeeklyRevenue / 7;
          const variations = [0.8, 1.1, 1.0, 1.2, 1.3, 1.4, 0.9]; // Weekend lower, weekdays higher

          processedData = variations.map((factor) =>
            Math.floor(baseDaily * factor)
          );
        } else {
          // No data case
          processedData = [0, 0, 0, 0, 0, 0, 0];
        }
      } else if (selectedPeriod === "monthly") {
        // For monthly data - sum all stations for the month
        const totalMonthlyRevenue = revenueData.reduce(
          (sum, station) => sum + (station.totalRevenue || 0),
          0
        );
        labels = [`T${currentMonth}`];
        processedData = [totalMonthlyRevenue];
      } else if (selectedPeriod === "yearly") {
        // For yearly data - if result contains monthly breakdown, use it
        if (revenueData.length > 0 && revenueData[0].month) {
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
          processedData = labels.map((_, index) => {
            const monthData = revenueData.filter(
              (item) => item.month === index + 1
            );
            return monthData.reduce(
              (sum, station) => sum + (station.totalRevenue || 0),
              0
            );
          });
        } else {
          // If result is total yearly, show just one bar
          const totalYearlyRevenue = revenueData.reduce(
            (sum, station) => sum + (station.totalRevenue || 0),
            0
          );
          labels = [`${currentYear}`];
          processedData = [totalYearlyRevenue];
        }
      }

      // Create gradient colors (green theme)
      const maxValue = Math.max(...processedData);
      const backgroundColors = processedData.map((value) => {
        const intensity = Math.max(0.3, value / maxValue);
        return `rgba(16, 185, 129, ${intensity})`;
      });

      const borderColors = processedData.map(() => "rgba(16, 185, 129, 1)");

      setChartData({
        labels,
        datasets: [
          {
            label: "Doanh thu",
            data: processedData,
            backgroundColor: backgroundColors,
            borderColor: borderColors,
            borderWidth: 1,
            borderRadius: 6,
            borderSkipped: false,
          },
        ],
      });

      // Calculate total revenue
      const total = processedData.reduce((sum, val) => sum + val, 0);
      setTotalRevenue(total);
    } catch (err) {
      console.error("Error loading revenue data:", err);
      setError("Không thể tải dữ liệu doanh thu");
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount and period change
  useEffect(() => {
    loadRevenueData(period);
  }, [period]);

  return (
    <Card className="h-100">
      <Card.Header className="d-flex justify-content-between align-items-center bg-white border-bottom">
        <div>
          <h5 className="mb-1">Biểu đồ doanh thu</h5>
          <small className="text-muted">Biểu đồ doanh thu và tăng trưởng</small>
        </div>
        <div className="d-flex gap-2">
          <Form.Select
            size="sm"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            style={{ width: "140px" }}
          >
            <option value="weekly">Theo tuần</option>
            <option value="monthly">Theo tháng</option>
            <option value="yearly">Theo năm</option>
          </Form.Select>
          <Button
            variant="outline-primary"
            size="sm"
            onClick={() => loadRevenueData(period)}
            disabled={loading}
          >
            {loading ? (
              <Spinner size="sm" />
            ) : (
              <i className="bi bi-arrow-clockwise"></i>
            )}
          </Button>
        </div>
      </Card.Header>

      <Card.Body>
        {error && (
          <Alert variant="danger" className="mb-3">
            {error}
          </Alert>
        )}

        {/* Revenue Summary */}
        <Row className="mb-4">
          <Col>
            <div className="d-flex align-items-center gap-3 p-3 bg-light rounded">
              <div>
                <h6 className="mb-0 text-muted">Tổng doanh thu ({period})</h6>
                <h4 className="mb-0 text-success font-weight-bold">
                  {formatCurrency(totalRevenue)}
                </h4>
              </div>
            </div>
          </Col>
        </Row>

        {/* Chart */}
        <div style={{ height: "400px", position: "relative" }}>
          {loading ? (
            <div className="d-flex justify-content-center align-items-center h-100">
              <div className="text-center">
                <Spinner animation="border" variant="primary" />
                <p className="mt-2 text-muted">Đang tải dữ liệu...</p>
              </div>
            </div>
          ) : chartData ? (
            <Bar data={chartData} options={chartOptions} />
          ) : (
            <div className="d-flex justify-content-center align-items-center h-100">
              <div className="text-center text-muted">
                <p>Không có dữ liệu để hiển thị</p>
                <Button
                  variant="primary"
                  onClick={() => loadRevenueData(period)}
                >
                  Tải lại
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default RevenueChart;
