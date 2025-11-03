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

  // Hàm tính số tuần ISO (Thứ 2 là ngày đầu tuần)
  const getISOWeekNumber = (date) => {
    const target = new Date(date.valueOf());
    const dayNum = (date.getDay() + 6) % 7; // Monday = 0
    target.setDate(target.getDate() - dayNum + 3); // Thursday of this week
    const firstThursday = target.valueOf();
    target.setMonth(0, 1);
    if (target.getDay() !== 4) {
      target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
    }
    return 1 + Math.ceil((firstThursday - target) / 604800000);
  };

  // Lấy ngày đầu tuần (Thứ 2) theo chuẩn ISO
  const getMonday = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Nếu Chủ nhật thì lùi 6 ngày
    return new Date(d.setDate(diff));
  };

  // Lấy tất cả các ngày trong tuần hiện tại
  const getCurrentWeekDays = () => {
    const monday = getMonday(new Date());
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(monday);
      day.setDate(monday.getDate() + i);
      days.push(day);
    }
    return days;
  };

  // Lấy tất cả các tuần trong tháng hiện tại
  const getCurrentMonthWeeks = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    // Ngày đầu và cuối tháng
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const weeks = [];
    let currentMonday = getMonday(firstDay);

    while (currentMonday <= lastDay) {
      const weekNum = getISOWeekNumber(currentMonday);
      weeks.push({
        weekNumber: weekNum,
        startDate: new Date(currentMonday),
      });
      currentMonday.setDate(currentMonday.getDate() + 7);
    }

    return weeks;
  };

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

      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;

      console.log(
        `🔧 Loading revenue data for period: ${selectedPeriod}, year: ${currentYear}, month: ${currentMonth}`
      );

      let labels = [];
      let processedData = [];

      if (selectedPeriod === "weekly") {
        // TUẦN NÀY: Hiển thị 7 ngày (Thứ 2 - Chủ nhật)
        const weekDays = getCurrentWeekDays();
        const dayLabels = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
        const dailyRevenue = new Array(7).fill(0);

        // Gọi API /api/revenue/daily cho từng ngày trong tuần
        for (let i = 0; i < weekDays.length; i++) {
          const day = weekDays[i];
          try {
            const response = await revenueAPI.getDaily(
              day.getFullYear(),
              day.getMonth() + 1,
              day.getDate()
            );

            const data = response.data;
            if (data.code === 1000 && data.result) {
              // Tổng doanh thu của tất cả trạm trong ngày này
              const dayRevenue = data.result.reduce(
                (sum, station) => sum + (station.totalRevenue || 0),
                0
              );
              dailyRevenue[i] = dayRevenue;
            }
          } catch (err) {
            console.warn(
              `Không thể tải dữ liệu ngày ${day.toISOString()}:`,
              err
            );
            dailyRevenue[i] = 0;
          }
        }

        labels = dayLabels;
        processedData = dailyRevenue;
      } else if (selectedPeriod === "monthly") {
        // THÁNG NÀY: Hiển thị các tuần trong tháng (Tuần 1, 2, 3, 4...)
        const monthWeeks = getCurrentMonthWeeks();
        const weeklyRevenue = [];

        // Gọi API /api/revenue/weekly cho từng tuần trong tháng
        for (const weekInfo of monthWeeks) {
          try {
            const response = await revenueAPI.getWeekly(
              weekInfo.startDate.getFullYear(),
              weekInfo.weekNumber
            );

            const data = response.data;
            if (data.code === 1000 && data.result) {
              // Tổng doanh thu của tuần này
              const weekRevenue = data.result.reduce(
                (sum, station) => sum + (station.totalRevenue || 0),
                0
              );
              weeklyRevenue.push(weekRevenue);
            } else {
              weeklyRevenue.push(0);
            }
          } catch (err) {
            console.warn(
              `Không thể tải dữ liệu tuần ${weekInfo.weekNumber}:`,
              err
            );
            weeklyRevenue.push(0);
          }
        }

        // Hiển thị số thứ tự tuần trong tháng: Tuần 1, 2, 3, 4...
        labels = monthWeeks.map((w, index) => `Tuần ${index + 1}`);
        processedData = weeklyRevenue;
      } else if (selectedPeriod === "yearly") {
        // NĂM NÀY: Hiển thị 12 tháng trong năm
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
        const monthlyRevenue = new Array(12).fill(0);

        // Gọi API /api/revenue/monthly cho từng tháng
        for (let month = 1; month <= 12; month++) {
          try {
            const response = await revenueAPI.getMonthly(currentYear, month);

            const data = response.data;
            if (data.code === 1000 && data.result) {
              // Tổng doanh thu của tháng này
              const revenue = data.result.reduce(
                (sum, station) => sum + (station.totalRevenue || 0),
                0
              );
              monthlyRevenue[month - 1] = revenue;
            }
          } catch (err) {
            console.warn(`Không thể tải dữ liệu tháng ${month}:`, err);
            monthlyRevenue[month - 1] = 0;
          }
        }

        processedData = monthlyRevenue;
      }

      console.log("📈 Processed labels:", labels);
      console.log("💰 Processed data:", processedData);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
