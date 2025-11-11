import React, { useMemo } from "react";
import { Card } from "react-bootstrap";
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
import LoadingSpinner from "../loading_spins/LoadingSpinner";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// 🆕 RevenueChart nhận data từ props thay vì tự fetch
const RevenueChart = ({ data, period = "monthly", loading = false }) => {
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

  // Chart configuration
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
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
          display: false,
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
        borderRadius: 6,
        borderSkipped: false,
      },
    },
  };

  // 🆕 Tạo chart data từ props (memoized để tối ưu performance)
  const chartData = useMemo(() => {
    if (!data || !data.revenueValues || data.revenueValues.length === 0) {
      return null;
    }

    // Create gradient colors (green theme)
    const maxValue = Math.max(...data.revenueValues);
    const backgroundColors = data.revenueValues.map((value) => {
      const intensity = Math.max(0.3, value / maxValue);
      return `rgba(16, 185, 129, ${intensity})`;
    });

    const borderColors = data.revenueValues.map(() => "rgba(16, 185, 129, 1)");

    return {
      labels: data.labels,
      datasets: [
        {
          label: "Doanh thu",
          data: data.revenueValues,
          backgroundColor: backgroundColors,
          borderColor: borderColors,
          borderWidth: 1,
          borderRadius: 6,
          borderSkipped: false,
        },
      ],
    };
  }, [data]);

  return (
    <Card className="h-100">
      <Card.Header className="bg-white border-bottom">
        <div>
          <h5 className="mb-1">Biểu đồ doanh thu chính</h5>
          <small className="text-muted">
            Tổng doanh thu:{" "}
            <strong className="text-success">
              {formatCurrency(data?.totalRevenue || 0)}
            </strong>
          </small>
        </div>
      </Card.Header>

      <Card.Body>
        {/* Chart */}
        <div style={{ height: "450px", position: "relative" }}>
          {loading ? (
            <div className="d-flex justify-content-center align-items-center h-100">
              <div className="text-center">
                <LoadingSpinner />
                <p className="mt-2 text-muted">Đang tải dữ liệu...</p>
              </div>
            </div>
          ) : chartData ? (
            <Bar data={chartData} options={chartOptions} />
          ) : (
            <div className="d-flex justify-content-center align-items-center h-100">
              <div className="text-center text-muted">
                <p>Không có dữ liệu để hiển thị</p>
              </div>
            </div>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default RevenueChart;
