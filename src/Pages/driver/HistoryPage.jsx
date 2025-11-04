import React, { useEffect, useState } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import { Routes, Route, Navigate, NavLink } from "react-router-dom";
import PopUpPayment from "../../components/layoutDriver/PopUpPayment";
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
import { chargingSessionsAPI, paymentsAPI } from "../../lib/apiServices";

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
  if (m < 60) return `${m} phút`;
  const h = Math.floor(m / 60);
  const r = m % 60;
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

  // Thêm state cho modal và session được chọn
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);

  if (loading)
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "50vh" }}
      >
        <div className="spinner-border text-[#2bf0b5]" />
      </div>
    );

  if (error) {
    return (
      <div className="overflow-x-auto">
        <h2 className="text-2xl font-semibold mb-4">Lịch sử Giao dịch</h2>
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

  // Hàm mở popup và chọn session
  const handleOpenPaymentModal = (session) => {
    setSelectedSession(session); // Lưu lại session đang được chọn
    setIsModalOpen(true); // Bật "công tắc" để mở popup
  };
  // Hàm này được truyền cho popup để nó tự đóng
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSession(null); // Xóa session đã chọn
  };

  const handleProcessPayment = async (sessionId, method) => {
    console.log(`Đang xử lý thanh toán ${method} cho ${sessionId}`);

    alert(`Đã chọn thanh toán ${method} cho phiên ${sessionId}.`);
    try {
      const res = await paymentsAPI.askForPayment(sessionId);
      console.log("Kết quả yêu cầu thanh toán:", res);
    } catch (e) {
      console.error("Lỗi khi yêu cầu thanh toán:", e);
    }
    // Đóng modal và tải lại dữ liệu để cập nhật trạng thái
    handleCloseModal();
    reload();
  };

  const headers = [
    "Ngày",
    "Trạm sạc",
    "Thời gian",
    "Lượng điện đã sạc",
    "Chi phí",
    "Trạng thái",
    "Thanh Toán",
  ];

  // Empty state
  if (!sessions.length) {
    return (
      <div className="overflow-x-auto">
        <h2 className="text-2xl font-semibold mb-4">Lịch sử Giao dịch</h2>
        <EmptyState
          icon="bi-lightning-charge"
          message="Hiện tại chưa có lịch sử sạc"
        />
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <h2 className="text-2xl font-semibold mb-4">Lịch sử Giao dịch</h2>
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
            <tr key={s.sessionId} className="hover:bg-gray-50">
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
              <td className="px-6 py-4 whitespace-nowrap">
                {s.paymentStatus === "UNPAID" && s.status === "COMPLETED" ? (
                  <button
                    className="px-3 py-1 bg-[#2bf0b5] text-white font-bold rounded hover:bg-[#00ffc6]"
                    onClick={() => handleOpenPaymentModal(s)}
                  >
                    Thanh toán
                  </button>
                ) : s.paymentStatus === "PENDING" ? (
                  <span className="text-yellow-600 font-medium">
                    Đang xử lý
                  </span>
                ) : (
                  <span className="text-green-600 font-medium">
                    Đã thanh toán
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <PopUpPayment
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        session={selectedSession}
        onProcessPayment={handleProcessPayment} // Truyền hàm xử lý vào
      />
    </div>
  );
};

// 2) PHÂN TÍCH
const CostAnalysis = () => {
  const { data: sessions, loading, error, reload } = useMySessions();
  if (loading) return <div>Đang tải...</div>;

  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-4">Chi phí theo tháng</h2>
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

  // Empty state cho toàn bộ biểu đồ
  if (!sessions.length) {
    return (
      <div className="flex flex-col gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-4">Chi phí theo tháng</h2>
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
  if (loading) return <div>Đang tải...</div>;

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-semibold mb-4">Thói quen Sạc theo Giờ</h2>
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

  // Empty state cho biểu đồ + 2 bảng
  if (!sessions.length) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-semibold mb-4">Thói quen Sạc theo Giờ</h2>
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
          <Bar dataKey="count" name="Số lần sạc" fill="#8B5CF6" />
        </BarChart>
      </ResponsiveContainer>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="border rounded p-4">
          <h3 className="font-semibold mb-3">Trạm sạc yêu thích</h3>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {favorites.map((f) => (
              <li key={f.name}>
                {f.name} — {f.count} lần
              </li>
            ))}
          </ul>
        </div>

        <div className="border rounded p-4">
          <h3 className="font-semibold mb-3">Thống kê khác</h3>
          <table>
            <tbody>
              <tr>
                <td style={{ paddingRight: 12 }}>Thời gian sạc TB:</td>
                <td>{avgMins} phút</td>
              </tr>
              <tr>
                <td style={{ paddingRight: 12 }}>Giờ sạc phổ biến:</td>
                <td>{popularHours}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ROUTES (giữ nguyên)
export default function HistoryPage() {
  const { data: sessions } = useMySessions();

  // Tính toán 4 chỉ số
  const totalCost = sessions.reduce((sum, s) => sum + (s.costTotal || 0), 0);
  const totalEnergy = sessions.reduce((sum, s) => sum + (s.energyKwh || 0), 0);
  const totalSessions = sessions.length;
  const avgCostPerKw = totalEnergy ? Math.round(totalCost / totalEnergy) : 0;
  const tabs = [
    { path: "transactions", label: "Giao dịch" },
    { path: "analysis", label: "Phân tích" },
    { path: "habits", label: "Thói quen" },
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow flex items-center gap-3">
          <span className="text-[#2bf0b5] text-2xl">
            <i class="bi bi-cash-stack"></i>
          </span>
          <div>
            <div className="text-sm text-gray-500">Tổng chi phí</div>
            <div className="text-lg font-bold">{formatCurrency(totalCost)}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow flex items-center gap-3">
          <span className="text-[#2bf0b5] text-2xl">
            <i class="bi bi-lightning-fill"></i>
          </span>
          <div>
            <div className="text-sm text-gray-500">Tổng lượng điện đã sạc</div>
            <div className="text-lg font-bold">{totalEnergy.toFixed(1)} kW</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow flex items-center gap-3">
          <span className="text-[#2bf0b5] text-2xl">
            <i class="bi bi-clock-fill"></i>
          </span>
          <div>
            <div className="text-sm text-gray-500">Số phiên sạc</div>
            <div className="text-lg font-bold">{totalSessions}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow flex items-center gap-3">
          <span className="text-[#2bf0b5] text-2xl">
            <i class="bi bi-cash-coin"></i>
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
      <div className="flex gap-3 mb-4">
        {tabs.map((tab) => (
          <NavLink
            key={`/driver/history/${tab.path}`}
            to={`/driver/history/${tab.path}`}
            className={({ isActive }) =>
              `px-4 py-2 rounded-full text-sm font-medium transition !no-underline ${
                isActive
                  ? "bg-gray-900 !text-white shadow"
                  : "bg-gray-200 !text-gray-700 hover:bg-gray-300"
              }`
            }
          >
            {tab.label}
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
