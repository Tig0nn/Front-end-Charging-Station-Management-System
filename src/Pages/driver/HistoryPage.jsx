import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
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

// --- DỮ LIỆU MẪU ---
// Thêm duration để hiển thị "Thời gian" trong bảng giao dịch
const mockTransactions = [
  {
    id: 1,
    date: "2025-10-07",
    startTime: "2025-10-07T13:30:00",
    station: "Vincom Ocean Park",
    duration: "45 phút",
    energy: "15.2 kWh",
    cost: 75000,
    status: "Hoàn thành",
  },
  {
    id: 2,
    date: "2025-10-05",
    startTime: "2025-10-05T18:05:00",
    station: "AEON Mall Long Biên",
    duration: "1h 20m",
    energy: "20.0 kWh",
    cost: 100000,
    status: "Hoàn thành",
  },
  {
    id: 3,
    date: "2025-09-28",
    startTime: "2025-09-28T08:15:00",
    station: "Times City",
    duration: "55 phút",
    energy: "10.5 kWh",
    cost: 52500,
    status: "Hoàn thành",
  },
  {
    id: 4,
    date: "2025-09-15",
    startTime: "2025-09-15T19:00:00",
    station: "Vincom Ocean Park",
    duration: "38 phút",
    energy: "25.0 kWh",
    cost: 125000,
    status: "Hoàn thành",
  },
  {
    id: 5,
    date: "2025-09-10",
    startTime: "2025-09-10T13:45:00",
    station: "AEON Mall Long Biên",
    duration: "1h 10m",
    energy: "12.0 kWh",
    cost: 60000,
    status: "Hoàn thành",
  },
];

const mockCostData = [
  { month: "T6", cost: 450000 },
  { month: "T7", cost: 620000 },
  { month: "T8", cost: 580000 },
  { month: "T9", cost: 730000 },
  { month: "T10", cost: 300000 },
];

const mockEnergyData = [
  { month: "T6", kwh: 150 },
  { month: "T7", kwh: 230 },
  { month: "T8", kwh: 200 },
  { month: "T9", kwh: 300 },
  { month: "T10", kwh: 120 },
];

const mockSessionData = [
  { month: "T6", sessions: 8 },
  { month: "T7", sessions: 12 },
  { month: "T8", sessions: 11 },
  { month: "T9", sessions: 15 },
  { month: "T10", sessions: 6 },
];

// --- HELPER ---
const formatCurrency = (value) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    value
  );

// --- TRANSACTIONS (đúng 6 cột như hình) ---
const TransactionHistory = () => (
  <div className="overflow-x-auto">
    <h2 className="text-2xl font-semibold mb-4">Lịch sử Giao dịch</h2>
    <table className="min-w-full bg-white rounded-lg shadow">
      <thead className="bg-gray-100">
        <tr>
          {[
            "Ngày",
            "Trạm sạc",
            "Thời gian",
            "Năng lượng",
            "Chi phí",
            "Trạng thái",
          ].map((head) => (
            <th
              key={head}
              className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider"
            >
              {head}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {mockTransactions.map((item) => (
          <tr key={item.id} className="hover:bg-gray-50">
            <td className="px-6 py-4 whitespace-nowrap text-gray-800">
              {item.date}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-gray-800">
              {item.station}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-gray-800">
              {item.duration}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-gray-800">
              {item.energy}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-gray-800">
              {formatCurrency(item.cost)}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                {item.status}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// --- ANALYSIS (thêm 2 biểu đồ còn thiếu) ---
const CostAnalysis = () => (
  <div className="flex flex-col gap-6">
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-semibold mb-4">Chi phí theo tháng</h2>
      <ResponsiveContainer width="100%" height={360}>
        <BarChart
          data={mockCostData}
          margin={{ top: 5, right: 20, left: 30, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis
            tickFormatter={(v) =>
              new Intl.NumberFormat("vi-VN", { notation: "compact" }).format(v)
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
            data={mockEnergyData}
            margin={{ top: 5, right: 20, left: 30, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(v) => [`${v} kWh`, "Năng lượng"]} />
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
            data={mockSessionData}
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

// --- HABITS (có thêm 2 bảng yêu cầu) ---
const ChargingHabits = () => {
  // Tạo dữ liệu thói quen theo giờ từ mockTransactions
  const processHabitData = (transactions) => {
    const hourlyCounts = Array(24).fill(0);
    transactions.forEach((tx) => {
      const hour = new Date(tx.startTime).getHours();
      hourlyCounts[hour]++;
    });
    return hourlyCounts.map((count, hour) => ({
      hour: `${String(hour).padStart(2, "0")}:00`,
      count,
    }));
  };

  // Helpers cho thống kê
  const parseDurationToMinutes = (s) => {
    if (!s) return 0;
    const phut = s.match(/(\d+)\s*phút/i);
    const h = s.match(/(\d+)\s*h/i);
    const m = s.match(/(\d+)\s*m/i);
    if (phut) return parseInt(phut[1], 10);
    const hours = h ? parseInt(h[1], 10) : 0;
    const mins = m ? parseInt(m[1], 10) : 0;
    return hours * 60 + mins;
  };

  const topFavoriteStations = () => {
    const map = {};
    mockTransactions.forEach((t) => {
      map[t.station] = (map[t.station] || 0) + 1;
    });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3) // lấy 3 trạm top
      .map(([name, count]) => ({ name, count }));
  };

  const averageChargeMinutes = () => {
    if (!mockTransactions.length) return 0;
    const total = mockTransactions.reduce(
      (sum, t) => sum + parseDurationToMinutes(t.duration),
      0
    );
    return Math.round(total / mockTransactions.length);
  };

  // Giờ sạc phổ biến theo khung 2 tiếng (00-02, 02-04, ...)
  const popularHourRange = () => {
    const bins = Array(12).fill(0);
    mockTransactions.forEach((t) => {
      const h = new Date(t.startTime).getHours();
      bins[Math.floor(h / 2)]++;
    });
    const idx = bins.indexOf(Math.max(...bins));
    const start = (idx * 2) % 24;
    const end = (start + 2) % 24;
    const pad = (n) => String(n).padStart(2, "0");
    return `${pad(start)}:00 - ${pad(end)}:00`;
  };

  const popularWeekdays = () => {
    const names = ["CN", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
    const count = Array(7).fill(0);
    mockTransactions.forEach((t) => count[new Date(t.startTime).getDay()]++);
    const order = count
      .map((v, i) => ({ i, v }))
      .sort((a, b) => b.v - a.v)
      .slice(0, 2)
      .map((x) => names[x.i]);
    return order.join(", ");
  };

  const habitData = processHabitData(mockTransactions);
  const favorites = topFavoriteStations();
  const avgMins = averageChargeMinutes();
  const popularHours = popularHourRange();
  const weekdays = popularWeekdays();

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

      {/* Hai bảng yêu cầu */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Trạm sạc yêu thích */}
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

        {/* Thống kê khác */}
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
              <tr>
                <td style={{ paddingRight: 12 }}>Ngày trong tuần:</td>
                <td>{weekdays}</td>
              </tr>
              <tr>
                <td style={{ paddingRight: 12 }}>Tiết kiệm so với xăng:</td>
                <td>~40%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// --- ROUTES ---
export default function HistoryPage() {
  return (
    <Routes>
      <Route index element={<Navigate to="transactions" replace />} />
      <Route path="transactions" element={<TransactionHistory />} />
      <Route path="analysis" element={<CostAnalysis />} />
      <Route path="habits" element={<ChargingHabits />} />
    </Routes>
  );
}
