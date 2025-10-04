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
import { reportsAPI } from "../../lib/apiServices.js";

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
  const [period, setPeriod] = useState("monthly");
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
          period === "daily" ? "Doanh thu theo ngày" : "Doanh thu theo tháng",
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

      const response = await reportsAPI.getRevenue(selectedPeriod);
      const data = response.data;

      // Generate labels based on period
      let labels = [];
      if (selectedPeriod === "monthly") {
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
      } else if (selectedPeriod === "daily") {
        labels = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
      }

      // Ensure we have data for all periods
      const revenueData = data.data || [];
      const paddedData = labels.map((_, index) => revenueData[index] || 0);

      // Create gradient colors (green theme like your image)
      const backgroundColors = paddedData.map((value) => {
        const intensity = Math.max(0.3, value / Math.max(...paddedData));
        return `rgba(16, 185, 129, ${intensity})`; // Green with varying opacity
      });

      const borderColors = paddedData.map(() => "rgba(16, 185, 129, 1)");

      setChartData({
        labels,
        datasets: [
          {
            label: "Doanh thu",
            data: paddedData,
            backgroundColor: backgroundColors,
            borderColor: borderColors,
            borderWidth: 1,
            borderRadius: 6,
            borderSkipped: false,
          },
        ],
      });

      setTotalRevenue(
        data.total || paddedData.reduce((sum, val) => sum + val, 0)
      );
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
            <option value="daily">Theo ngày</option>
            <option value="monthly">Theo tháng</option>
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
