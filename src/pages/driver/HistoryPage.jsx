import React, { useEffect, useState } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import { Routes, Route, Navigate, NavLink } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { chargingSessionsAPI } from "../../lib/apiServices";
import LoadingSpinner from "../../components/loading_spins/LoadingSpinner";

// Helpers
const formatCurrency = (value) => {
  const rounded = Math.round((value || 0) / 100) * 100; // làm tròn đến 100
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0, // bỏ phần lẻ
  }).format(rounded);
};

const formatDateTime = (iso) => {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return {
    date: `${dd}/${mm}/${yyyy}`,
    time: `${hh}:${mi}`,
  };
};

const formatDuration = (mins) => {
  const m = Number(mins || 0);
  if (m < 60) {
    const min = Math.floor(m);
    return `${min} phút`;
  }
  const h = Math.floor(m / 60);
  const r = Math.floor(m % 60);
  return `${h} giờ ${r} phút`;
};

// Chuẩn hóa thông báo lỗi từ axios
const getErrorMessage = (err) => {
  const msg =
    err?.response?.data?.message ||
    err?.response?.statusText ||
    err?.message ||
    "Lỗi không xác định";
  const status = err?.response?.status;
  return status ? `${status} - ${msg}` : msg;
};

// Empty state (dùng chung theme card trạm sạc)
const EmptyState = ({ icon = "bi-ev-station", title, message }) => (
  <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
    <div className="flex items-start gap-3">
      <i className={`bi ${icon} text-2xl text-gray-400`} />
      <div>
        {title ? (
          <div className="font-semibold text-gray-800 mb-1">{title}</div>
        ) : null}
        <div className="text-gray-600">{message}</div>
      </div>
    </div>
  </div>
);

// Simple module cache để tránh gọi API nhiều lần khi đổi tab
let sessionsCache = null;

function useMySessions() {
  const [data, setData] = useState(sessionsCache || []);
  const [loading, setLoading] = useState(!sessionsCache);
  const [error, setError] = useState("");

  const reload = React.useCallback(async () => {
    try {
      setError("");
      setLoading(true);
      const res = await chargingSessionsAPI.getMySessions();
      const list = res?.data?.result || [];
      console.log("Lịch sử sạc tải về:", list);
      const normalized = list.map((s) => {
        let durationMin = Number(s.durationMin || 0);
        if (!durationMin && s.startTime && s.endTime) {
          durationMin = Math.max(
            0,
            Math.round((new Date(s.endTime) - new Date(s.startTime)) / 60000)
          );
        }
        return { ...s, durationMin };
      });
      sessionsCache = normalized;
      setData(normalized);
    } catch (e) {
      setData([]);
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!sessionsCache) reload();
  }, [reload]);

  return { data, loading, error, reload };
}

// 1) GIAO DỊCH
const TransactionHistory = () => {
  const { data: sessions, loading, error, reload } = useMySessions();

  if (loading)
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "50vh" }}
      >
        <LoadingSpinner />
      </div>
    );

  if (error) {
    return (
      <div className="overflow-x-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Lịch sử Giao dịch</h2>
          <button
            className="inline-flex items-center gap-2 px-3 py-2 text-white rounded hover:opacity-90"
            style={{ backgroundColor: "#22c55e" }}
            onClick={reload}
          >
            <i className="bi bi-arrow-clockwise" />
            <span>Làm mới</span>
          </button>
        </div>

        <EmptyState
          icon="bi-exclamation-triangle"
          title="Không thể tải lịch sử sạc"
          message={error}
        />
        <div className="mt-3">
          <button className="px-3 py-2 border rounded" onClick={reload}>
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (!sessions.length) {
    return (
      <div className="overflow-x-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Lịch sử Giao dịch</h2>
          <button
            className="inline-flex items-center gap-2 px-3 py-2 text-white rounded hover:opacity-90"
            style={{ backgroundColor: "#22c55e" }}
            onClick={reload}
          >
            <i className="bi bi-arrow-clockwise" />
            <span>Làm mới</span>
          </button>
        </div>
        <EmptyState
          icon="bi-lightning-charge"
          message="Hiện tại chưa có lịch sử sạc"
        />
      </div>
    );
  }

  const headers = [
    "Ngày",
    "Trạm sạc",
    "Thời gian",
    "Lượng điện đã sạc",
    "Chi phí",
    "Trạng thái",
  ];

  return (
    <div className="overflow-x-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Lịch sử Giao dịch</h2>
        <button
          className="inline-flex items-center gap-2 px-3 py-2 text-white rounded hover:opacity-90"
          style={{ backgroundColor: "#22c55e" }}
          onClick={reload}
        >
          <i className="bi bi-arrow-clockwise" />
          <span>Làm mới</span>
        </button>
      </div>

      <table className="min-w-full bg-white rounded-lg shadow">
        <thead className="bg-gray-100">
          <tr>
            {headers.map((h) => (
              <th
                key={h}
                className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {sessions.map((s) => (
            <tr key={s.sessionId} className="hover:bg-gray-50 cursor-pointer">
              <td className="px-6 py-4 whitespace-nowrap text-gray-800">
                {formatDateTime(s.startTime).date} <br />
                <div className="text-muted small">
                  {formatDateTime(s.startTime).time}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-800">
                {s.stationName}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-800">
                {formatDuration(s.durationMin)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-800">
                {Number(s.energyKwh || 0).toFixed(1)} kW
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-800">
                {formatCurrency(s.costTotal)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {s.status === "COMPLETED" ? (
                  <span className="text-green-600 font-medium">
                    Đã hoàn thành
                  </span>
                ) : (
                  <span className="text-red-600 font-medium">
                    Chưa hoàn thành
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// 2) PHÂN TÍCH
const CostAnalysis = () => {
  const { data: sessions, loading, error, reload } = useMySessions();
  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">Chi phí theo tháng</h2>
            <button
              className="inline-flex items-center gap-2 px-3 py-2 text-white rounded hover:opacity-90"
              style={{ backgroundColor: "#22c55e" }}
              onClick={reload}
            >
              <i className="bi bi-arrow-clockwise" />
              <span>Làm mới</span>
            </button>
          </div>

          <EmptyState
            icon="bi-exclamation-triangle"
            title="Không thể tải dữ liệu"
            message={error}
          />
          <div className="mt-3">
            <button className="px-3 py-2 border rounded" onClick={reload}>
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!sessions.length) {
    return (
      <div className="flex flex-col gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">Chi phí theo tháng</h2>
            <button
              className="inline-flex items-center gap-2 px-3 py-2 text-white rounded hover:opacity-90"
              style={{ backgroundColor: "#22c55e" }}
              onClick={reload}
            >
              <i className="bi bi-arrow-clockwise" />
              <span>Làm mới</span>
            </button>
          </div>
          <EmptyState
            icon="bi-graph-up"
            message="Chưa có dữ liệu để theo dõi và tính toán"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-3">Năng lượng tiêu thụ</h3>
            <EmptyState
              icon="bi-activity"
              message="Chưa có dữ liệu để theo dõi và tính toán"
            />
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-3">Số phiên sạc</h3>
            <EmptyState
              icon="bi-bar-chart"
              message="Chưa có dữ liệu để theo dõi và tính toán"
            />
          </div>
        </div>
      </div>
    );
  }

  // Gom theo tháng từ startTime
  const monthKey = (iso) => `T${new Date(iso).getMonth() + 1}`;
  const costMap = {};
  const energyMap = {};
  const countMap = {};
  sessions.forEach((s) => {
    const key = monthKey(s.startTime);
    costMap[key] = (costMap[key] || 0) + Number(s.costTotal || 0);
    energyMap[key] = (energyMap[key] || 0) + Number(s.energyKwh || 0);
    countMap[key] = (countMap[key] || 0) + 1;
  });

  // Sắp theo thứ tự T1..T12 (chỉ những tháng có dữ liệu)
  const sortMonth = (a, b) =>
    Number(a.replace("T", "")) - Number(b.replace("T", ""));
  const months = Object.keys(costMap).sort(sortMonth);

  const costData = months.map((m) => ({ month: m, cost: costMap[m] }));
  const energyData = months.map((m) => ({ month: m, kwh: energyMap[m] }));
  const sessionData = months.map((m) => ({ month: m, sessions: countMap[m] }));

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-semibold mb-4">Chi phí theo tháng</h2>
        <ResponsiveContainer width="100%" height={360}>
          <BarChart
            data={costData}
            margin={{ top: 5, right: 20, left: 30, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis
              tickFormatter={(v) =>
                new Intl.NumberFormat("vi-VN", { notation: "compact" }).format(
                  v
                )
              }
            />
            <Tooltip formatter={(v) => [formatCurrency(v), "Chi phí"]} />
            <Legend />
            <Bar dataKey="cost" name="Chi phí" fill="#10B981" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-3">Năng lượng tiêu thụ</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart
              data={energyData}
              margin={{ top: 5, right: 20, left: 30, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip
                formatter={(v) => [
                  `${v.toFixed ? v.toFixed(0) : v} kWh`,
                  "Năng lượng",
                ]}
              />
              <Legend />
              <Line
                dataKey="kwh"
                name="kWh"
                type="monotone"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-3">Số phiên sạc</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={sessionData}
              margin={{ top: 5, right: 20, left: 30, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis allowDecimals={false} />
              <Tooltip formatter={(v) => [v, "Phiên sạc"]} />
              <Legend />
              <Bar dataKey="sessions" name="Phiên sạc" fill="#F59E0B" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

// 3) THÓI QUEN (kèm 2 bảng yêu cầu)
const ChargingHabits = () => {
  const { data: sessions, loading, error, reload } = useMySessions();
  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Thói quen Sạc theo Giờ</h2>
          <button
            className="inline-flex items-center gap-2 px-3 py-2 text-white rounded hover:opacity-90"
            style={{ backgroundColor: "#22c55e" }}
            onClick={reload}
          >
            <i className="bi bi-arrow-clockwise" />
            <span>Làm mới</span>
          </button>
        </div>

        <EmptyState
          icon="bi-exclamation-triangle"
          title="Không thể tải dữ liệu"
          message={error}
        />
        <div className="mt-3">
          <button className="px-3 py-2 border rounded" onClick={reload}>
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (!sessions.length) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Thói quen Sạc theo Giờ</h2>
          <button
            className="inline-flex items-center gap-2 px-3 py-2 text-white rounded hover:opacity-90"
            style={{ backgroundColor: "#22c55e" }}
            onClick={reload}
          >
            <i className="bi bi-arrow-clockwise" />
            <span>Làm mới</span>
          </button>
        </div>

        <EmptyState
          icon="bi-clock-history"
          message="Chưa có dữ liệu để theo dõi và tính toán"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="border rounded p-4">
            <h3 className="font-semibold mb-3">Trạm sạc yêu thích</h3>
            <EmptyState
              icon="bi-geo-alt"
              message="Chưa có dữ liệu để theo dõi và tính toán"
            />
          </div>
          <div className="border rounded p-4">
            <h3 className="font-semibold mb-3">Thống kê khác</h3>
            <EmptyState
              icon="bi-info-circle"
              message="Chưa có dữ liệu để theo dõi và tính toán"
            />
          </div>
        </div>
      </div>
    );
  }

  // Biểu đồ thói quen theo giờ (đủ 24 giờ, mỗi giờ 1 cột)
  const bins = Array(24).fill(0); // 00-23
  sessions.forEach((s) => {
    const h = new Date(s.startTime).getHours();
    bins[h]++;
  });
  const habitData = bins.map((c, i) => ({
    hour: `${String(i).padStart(2, "0")}:00`,
    count: c,
  }));

  // Trạm sạc yêu thích (top 3)
  const stationCount = {};
  sessions.forEach((s) => {
    const name = s.stationName || "N/A";
    stationCount[name] = (stationCount[name] || 0) + 1;
  });
  const favorites = Object.entries(stationCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name, count]) => ({ name, count }));

  // Thống kê khác
  const avgMins = Math.round(
    sessions.reduce((sum, s) => sum + Number(s.durationMin || 0), 0) /
      (sessions.length || 1)
  );

  const hourBins = Array(12).fill(0);
  sessions.forEach((s) => {
    const h = new Date(s.startTime).getHours();
    hourBins[Math.floor(h / 2)]++;
  });
  const maxIdx = hourBins.indexOf(Math.max(...hourBins));
  const pad = (n) => String(n).padStart(2, "0");
  const popularHours = `${pad(maxIdx * 2)}:00 - ${pad(
    (maxIdx * 2 + 2) % 24
  )}:00`;

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-semibold mb-4">Thói quen Sạc theo Giờ</h2>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={habitData}
          margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="hour" />
          <YAxis allowDecimals={false} />
          <Tooltip formatter={(value) => [value, "Số lần sạc"]} />
          <Legend />
          <Bar dataKey="count" name="Số lần sạc" fill="#22c55e" />
        </BarChart>
      </ResponsiveContainer>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="bg-gradient-to-br from-[#22c55e]/10 to-[#16a34a]/5 border border-[#22c55e]/30 rounded-lg p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <i className="bi bi-geo-alt-fill text-[#22c55e] text-xl"></i>
            <h3 className="font-semibold text-gray-800">Trạm sạc yêu thích</h3>
          </div>
          <div className="space-y-3">
            {favorites.map((f, index) => (
              <div
                key={f.name}
                className="flex items-center gap-3 bg-white/80 rounded-lg p-3 hover:bg-white transition-colors"
              >
                {index === 0 ? (
                  <i className="bi bi-trophy-fill text-yellow-500 text-2xl"></i>
                ) : index === 1 ? (
                  <i className="bi bi-trophy-fill text-gray-400 text-xl"></i>
                ) : (
                  <i className="bi bi-trophy-fill text-amber-700 text-lg"></i>
                )}
                <div className="flex-1">
                  <div className="font-medium text-gray-800">{f.name}</div>
                  <div className="text-sm text-gray-500">{f.count} lần sạc</div>
                </div>
                <div
                  className="px-3 py-1 rounded-full text-sm font-semibold"
                  style={{
                    backgroundColor: index === 0 ? "#22c55e" : "#e5e7eb",
                    color: index === 0 ? "white" : "#6b7280",
                  }}
                >
                  #{index + 1}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#22c55e]/10 to-[#16a34a]/5 border border-[#22c55e]/30 rounded-lg p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <i className="bi bi-bar-chart-fill text-[#22c55e] text-xl"></i>
            <h3 className="font-semibold text-gray-800">Thống kê khác</h3>
          </div>
          <div className="space-y-4">
            <div className="bg-white/80 rounded-lg p-4 hover:bg-white transition-colors">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#22c55e]/10">
                  <i className="bi bi-clock-history text-[#22c55e] text-xl"></i>
                </div>
                <div className="flex-1">
                  <div className="text-sm text-gray-500">Thời gian sạc TB</div>
                  <div className="text-lg font-bold text-gray-800">
                    {avgMins} phút
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/80 rounded-lg p-4 hover:bg-white transition-colors">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#22c55e]/10">
                  <i className="bi bi-speedometer2 text-[#22c55e] text-xl"></i>
                </div>
                <div className="flex-1">
                  <div className="text-sm text-gray-500">Giờ sạc phổ biến</div>
                  <div className="text-lg font-bold text-gray-800">
                    {popularHours}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ROUTES (giữ nguyên)
export default function HistoryPage() {
  const { data: sessions, loading, reload } = useMySessions();

  // Tính toán 4 chỉ số
  const totalCost = sessions.reduce((sum, s) => sum + (s.costTotal || 0), 0);
  const totalEnergy = sessions.reduce((sum, s) => sum + (s.energyKwh || 0), 0);
  const totalSessions = sessions.length;
  const avgCostPerKw = totalEnergy ? Math.round(totalCost / totalEnergy) : 0;

  const tabs = [
    {
      path: "transactions",
      label: "Giao dịch",
      icon: "bi bi-coin",
    },
    {
      path: "analysis",
      label: "Phân tích",
      icon: "bi-clipboard-data-fill",
    },
    {
      path: "habits",
      label: "Thói quen",
      icon: "bi-person-arms-up",
    },
  ];

  useEffect(
    () => async () => {
      try {
        let response = await chargingSessionsAPI.getMySessions();
        console.log("Fetched charging sessions:", response.data);
      } catch (err) {
        console.error("Lỗi tính toán chỉ số tổng hợp:", err);
      }
    },
    []
  );

  return (
    <div>
      {/* Header với nút làm mới */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Tổng quan</h2>
        <button
          className="inline-flex items-center gap-2 px-4 py-2 text-white !rounded-md font-semibold transition-all hover:opacity-90 disabled:opacity-70 disabled:cursor-not-allowed"
          style={{
            backgroundColor: "#22c55e",
            boxShadow: "0 2px 4px rgba(34, 197, 94, 0.2)",
          }}
          onClick={reload}
          disabled={loading}
          onMouseEnter={(e) => {
            if (!loading) {
              e.currentTarget.style.backgroundColor = "#16a34a";
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow =
                "0 4px 6px rgba(34, 197, 94, 0.3)";
            }
          }}
          onMouseLeave={(e) => {
            if (!loading) {
              e.currentTarget.style.backgroundColor = "#22c55e";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 2px 4px rgba(34, 197, 94, 0.2)";
            }
          }}
        >
          {loading ? (
            <>
              <div className="animate-spin">
                <i className="bi bi-arrow-clockwise"></i>
              </div>
              <span>Đang tải...</span>
            </>
          ) : (
            <>
              <i className="bi bi-arrow-clockwise"></i>
              <span>Làm mới</span>
            </>
          )}
        </button>
      </div>

      {/* 4 thẻ thống kê */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow flex items-center gap-3">
          <span className="text-[#2bf0b5] text-2xl">
            <i className="bi bi-cash-stack"></i>
          </span>
          <div>
            <div className="text-sm text-gray-500">Tổng chi phí</div>
            <div className="text-lg font-bold">{formatCurrency(totalCost)}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow flex items-center gap-3">
          <span className="text-[#2bf0b5] text-2xl">
            <i className="bi bi-lightning-fill"></i>
          </span>
          <div>
            <div className="text-sm text-gray-500">Tổng lượng điện đã sạc</div>
            <div className="text-lg font-bold">{totalEnergy.toFixed(1)} kW</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow flex items-center gap-3">
          <span className="text-[#2bf0b5] text-2xl">
            <i className="bi bi-clock-fill"></i>
          </span>
          <div>
            <div className="text-sm text-gray-500">Số phiên sạc</div>
            <div className="text-lg font-bold">{totalSessions}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow flex items-center gap-3">
          <span className="text-[#2bf0b5] text-2xl">
            <i className="bi bi-cash-coin"></i>
          </span>
          <div>
            <div className="text-sm text-gray-500">
              Chi phí trung bình trên kW
            </div>
            <div className="text-lg font-bold">
              {formatCurrency(avgCostPerKw)}
            </div>
          </div>
        </div>
      </div>

      {/* Thanh Header Tabs */}
      <div
        className="inline-flex gap-2 p-2 mb-4"
        style={{
          backgroundColor: "#f8fafc",
          borderRadius: "50px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 2px 4px rgba(0,0,0,0.04)",
        }}
      >
        {tabs.map((tab) => (
          <NavLink
            key={`/driver/history/${tab.path}`}
            to={`/driver/history/${tab.path}`}
            className={({ isActive }) =>
              `inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ease-in-out !no-underline select-none ${
                isActive
                  ? "!bg-green-500 !text-white !shadow-md !-translate-y-[1px]"
                  : "!bg-transparent !text-slate-500 hover:!bg-slate-200 hover:!text-slate-700"
              }`
            }
            style={{
              border: "none",
              outline: "none",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            <i className={`bi ${tab.icon}`} style={{ fontSize: "16px" }}></i>
            <span>{tab.label}</span>
          </NavLink>
        ))}
      </div>

      <Routes>
        <Route index element={<Navigate to="transactions" replace />} />
        <Route path="transactions" element={<TransactionHistory />} />
        <Route path="analysis" element={<CostAnalysis />} />
        <Route path="habits" element={<ChargingHabits />} />
      </Routes>
    </div>
  );
}
