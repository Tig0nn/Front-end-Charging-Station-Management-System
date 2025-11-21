import React, { useState, useEffect, useRef } from "react";
import { Badge } from "react-bootstrap";
import { stationsAPI, chargingPointsAPI } from "../../lib/apiServices";
import toast from "react-hot-toast";
import { Search, MapPin, Zap, Plus, Trash2 } from "lucide-react";
import LoadingSpinner from "../../components/loading_spins/LoadingSpinner";

// Hàm định dạng công suất từ "POWER_22KW" thành "22kW"
const formatPower = (powerString) => {
  if (!powerString) return "N/A";
  const matches = powerString.match(/(\d+)/);
  return matches ? `${matches[0]}kW` : powerString;
};

// Hàm lấy thông tin trạng thái và màu sắc
const getStatusInfo = (point) => {
  if (point.status === "AVAILABLE" && !point.currentSessionId) {
    return { text: "Sẵn sàng", bg: "primary" };
  }
  if (point.status === "AVAILABLE" && point.currentSessionId) {
    return { text: "Đang sạc", bg: "success" };
  }
  if (point.status === "CHARGING") {
    return { text: "Đang sạc", bg: "success" };
  }
  if (point.status === "OUT_OF_SERVICE" || point.status === "UNAVAILABLE") {
    return { text: "Lỗi", bg: "danger" };
  }
  if (point.status === "MAINTENANCE") {
    return { text: "Bảo trì", bg: "warning", textColor: "dark" };
  }
  return { text: point.status, bg: "secondary" };
};

// Định dạng tiền
const formatCurrency = (value) => {
  if (typeof value !== "number") return "0 đ";
  return value.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
};

const AdminChargingPointManagement = () => {
  const timerRef = useRef(null);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showErrorOnly, setShowErrorOnly] = useState(false);
  const [deleteModal, setDeleteModal] = useState({
    show: false,
    point: null,
    stationId: null,
  });
  const [editModal, setEditModal] = useState({
    show: false,
    point: null,
    stationId: null,
  });
  const [editForm, setEditForm] = useState({
    chargingPower: "POWER_22KW",
  });
  const [createModal, setCreateModal] = useState({
    show: false,
    stationId: null,
  });
  const [createForm, setCreateForm] = useState({
    chargingPower: "POWER_22KW",
  });

  // Load tất cả stations và charging points với session info
  const loadStationsData = async (showLoadingSpinner = true) => {
    try {
      if (showLoadingSpinner) setLoading(true);

      // Step 1: Load all stations
      const response = await stationsAPI.getAllDetails();
      let stationsData = response?.data?.result || response?.result || [];

      if (!Array.isArray(stationsData)) {
        stationsData = response?.data || [];
      }

      // Step 2: For each station, fetch charging points with session details
      const stationsWithChargers = await Promise.all(
        stationsData.map(async (station) => {
          let chargingPoints = [];

          if (station.stationId) {
            try {
              const chargersResponse =
                await chargingPointsAPI.getChargersByStation(station.stationId);
              chargingPoints =
                chargersResponse?.data?.result ||
                chargersResponse?.result ||
                [];

              // Fetch session details for charging points
              const activePoints = chargingPoints.filter(
                (p) => p.currentSessionId
              );

              const detailPromises = activePoints.map((point) =>
                chargingPointsAPI
                  .simulateCharging(point.currentSessionId)
                  .then((res) => res.data.result)
                  .catch((err) => {
                    console.error(
                      `Lỗi lấy chi tiết session ${point.currentSessionId}:`,
                      err
                    );
                    return null;
                  })
              );

              const sessionDetails = await Promise.all(detailPromises);

              const detailsMap = {};
              sessionDetails.forEach((session) => {
                if (session && session.sessionId) {
                  detailsMap[session.sessionId] = session;
                }
              });

              chargingPoints = chargingPoints.map((point) => ({
                ...point,
                currentSessionInfo: detailsMap[point.currentSessionId] || null,
              }));
            } catch (err) {
              console.warn(
                `Could not load chargers for station ${station.stationId}, ${err}`
              );
            }
          }

          return {
            stationId: station.stationId,
            stationName: station.stationName || station.name,
            address: station.address,
            chargingPoints: chargingPoints,
          };
        })
      );

      setStations(stationsWithChargers);
      setError(null);
    } catch (err) {
      console.error("Error loading stations:", err);
      setError(
        "Không thể tải danh sách trạm sạc: " + (err.message || "Unknown error")
      );
      toast.error("Không thể tải danh sách trạm sạc");
    } finally {
      if (showLoadingSpinner) setLoading(false);
    }
  };

  useEffect(() => {
    loadStationsData();

    // Polling mỗi 10 giây
    timerRef.current = setInterval(() => {
      console.log("(Polling) Đang tải lại danh sách trạm và trụ sạc...");
      loadStationsData(false);
    }, 10000);

    return () => {
      if (timerRef.current) {
        console.log("Dọn dẹp: Dừng polling AdminChargingPointManagement.");
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  // Filter stations
  const filteredStations = stations
    .filter(
      (station) =>
        station.stationName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        station.address?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((station) => {
      if (!showErrorOnly) return true;
      // Chỉ hiển thị trạm có ít nhất 1 trụ lỗi
      return station.chargingPoints.some(
        (p) => p.status === "OUT_OF_SERVICE" || p.status === "UNAVAILABLE"
      );
    });

  // Handle create charging point (placeholder)
  const handleCreatePoint = async () => {
    try {
      if (!createModal.stationId) return;

      const chargingPointData = {
        chargingPower: createForm.chargingPower,
        status: "AVAILABLE",
      };

      await chargingPointsAPI.addChargingPoint(
        createModal.stationId,
        chargingPointData
      );

      toast.success(`Đã tạo trụ sạc thành công!`);
      setCreateModal({ show: false, stationId: null });
      setCreateForm({ chargingPower: "POWER_22KW" });
      await loadStationsData(false);
    } catch (err) {
      console.error("Lỗi khi tạo trụ sạc:", err);
      toast.error("Không thể tạo trụ sạc. Vui lòng thử lại.");
    }
  };

  // Handle delete charging point
  const handleDeletePoint = async () => {
    try {
      if (!deleteModal.point || !deleteModal.stationId) return;

      await chargingPointsAPI.deleteChargingPoint(
        deleteModal.stationId,
        deleteModal.point.pointId
      );

      toast.success(`Đã xóa trụ sạc "${deleteModal.point.name}" thành công!`);
      setDeleteModal({ show: false, point: null, stationId: null });
      await loadStationsData(false);
    } catch (err) {
      console.error("Lỗi khi xóa trụ sạc:", err);
      toast.error("Không thể xóa trụ sạc. Vui lòng thử lại.");
      setDeleteModal({ show: false, point: null, stationId: null });
    }
  };

  // Handle update status
  const handleUpdateStatus = async (newStatus) => {
    try {
      if (!editModal.point || !editModal.stationId) return;

      await chargingPointsAPI.updateStatus(
        editForm.chargingPower,
        editModal.stationId,
        editModal.point.pointId,
        newStatus
      );
      toast.success(`Đã cập nhật trụ "${editModal.point.name}" thành công!`);
      setEditModal({ show: false, point: null, stationId: null });
      await loadStationsData(false);
    } catch (err) {
      console.error("Lỗi khi cập nhật trạng thái trụ sạc:", err);
      toast.error("Không thể cập nhật trạng thái trụ sạc.");
      setEditModal({ show: false, point: null, stationId: null });
    }
  };

  // Handle save changes (name and power)
  const handleSaveChanges = async () => {
    try {
      if (!editModal.point || !editModal.stationId) return;

      // Update with current status (no status change)
      await chargingPointsAPI.updateStatus(
        editForm.chargingPower,
        editModal.stationId,
        editModal.point.pointId,
        editModal.point.status // Keep current status
      );

      toast.success(
        `Đã lưu thay đổi cho trụ "${editModal.point.name}" thành công!`
      );
      setEditModal({ show: false, point: null, stationId: null });
      await loadStationsData(false);
    } catch (err) {
      console.error("Lỗi khi lưu thay đổi:", err);
      toast.error("Không thể lưu thay đổi. Vui lòng thử lại.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="text-gray-600 mt-4">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Lỗi</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => loadStationsData(true)}
            className="px-6 py-2 text-white rounded-lg font-semibold"
            style={{ backgroundColor: "#22c55e" }}
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Delete Confirmation Modal */}
        {deleteModal.show && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() =>
              setDeleteModal({ show: false, point: null, stationId: null })
            }
          >
            <div
              className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-gray-900">
                  Xác nhận xóa trụ sạc
                </h3>
                <button
                  onClick={() =>
                    setDeleteModal({
                      show: false,
                      point: null,
                      stationId: null,
                    })
                  }
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <i className="bi bi-x-lg text-2xl"></i>
                </button>
              </div>

              {/* Content */}
              <div className="mb-6">
                <p className="text-gray-600 mb-2">
                  Bạn có chắc chắn muốn xóa trụ sạc này không?
                </p>
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-3">
                  <p className="text-sm text-red-800 font-semibold">
                    {deleteModal.point?.name}
                  </p>
                  <p className="text-xs text-red-600 mt-1">
                    Công suất: {formatPower(deleteModal.point?.chargingPower)}
                  </p>
                </div>
                <p className="text-sm text-gray-500 mt-3">
                  Hành động này không thể hoàn tác.
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() =>
                    setDeleteModal({
                      show: false,
                      point: null,
                      stationId: null,
                    })
                  }
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleDeletePoint}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Status Modal */}
        {editModal.show && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => {
              setEditModal({ show: false, point: null, stationId: null });
              setEditForm({ chargingPower: "POWER_22KW" });
            }}
          >
            <div
              className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-gray-900">
                  Chỉnh sửa: {editModal.point?.name}
                </h3>
                <button
                  onClick={() => {
                    setEditModal({ show: false, point: null, stationId: null });
                    setEditForm({ chargingPower: "POWER_22KW" });
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <i className="bi bi-x-lg text-2xl"></i>
                </button>
              </div>

              {/* Content */}
              <div className="mb-6">
                {/* Form chỉnh sửa công suất */}
                <div className="space-y-4 mb-6">
                  {/* Mức công suất */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Mức công suất <span className="text-red-600">*</span>
                    </label>
                    <select
                      value={editForm.chargingPower}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          chargingPower: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#22c55e] focus:border-transparent"
                    >
                      <option value="POWER_22KW">22kW</option>
                      <option value="POWER_50KW">50kW</option>
                      <option value="POWER_120KW">120kW</option>
                      <option value="POWER_350KW">350kW</option>
                    </select>
                  </div>
                </div>

                {/* Nút Lưu thay đổi */}
                <button
                  onClick={handleSaveChanges}
                  className="w-full px-4 py-3 text-white rounded-lg font-semibold transition-colors mb-4"
                  style={{ backgroundColor: "#22c55e" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#16a34a")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "#22c55e")
                  }
                >
                  <i className="bi bi-check-circle me-2"></i>
                  Lưu thay đổi
                </button>

                <hr className="my-4 border-gray-300" />

                <p className="text-gray-600 mb-4">
                  Chọn trạng thái mới cho trụ sạc:
                </p>
                <div className="space-y-3">
                  <button
                    onClick={() => handleUpdateStatus("MAINTENANCE")}
                    className="w-full px-4 py-3 bg-yellow-100 text-yellow-800 rounded-lg font-semibold hover:bg-yellow-200 transition-colors"
                  >
                    <i className="bi bi-wrench me-2"></i>
                    Bảo trì
                  </button>
                  <button
                    onClick={() => handleUpdateStatus("OUT_OF_SERVICE")}
                    className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                  >
                    <i className="bi bi-pause-circle me-2"></i>
                    Tạm dừng
                  </button>
                  {(editModal.point?.status === "OUT_OF_SERVICE" ||
                    editModal.point?.status === "MAINTENANCE") && (
                    <button
                      onClick={() => handleUpdateStatus("AVAILABLE")}
                      className="w-full px-4 py-3 text-white rounded-lg font-semibold transition-colors"
                      style={{ backgroundColor: "#22c55e" }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = "#16a34a")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = "#22c55e")
                      }
                    >
                      <i className="bi bi-play-circle me-2"></i>
                      Kích hoạt
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create Charging Point Modal */}
        {createModal.show && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => {
              setCreateModal({ show: false, stationId: null });
              setCreateForm({ chargingPower: "POWER_22KW" });
            }}
          >
            <div
              className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-gray-900">
                  Tạo trụ sạc mới
                </h3>
                <button
                  onClick={() => {
                    setCreateModal({ show: false, stationId: null });
                    setCreateForm({ chargingPower: "POWER_22KW" });
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <i className="bi bi-x-lg text-2xl"></i>
                </button>
              </div>

              {/* Form */}
              <div className="mb-6 space-y-4">
                {/* Mức công suất */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Mức công suất <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={createForm.chargingPower}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        chargingPower: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#22c55e] focus:border-transparent"
                    autoFocus
                  >
                    <option value="POWER_22KW">22kW</option>
                    <option value="POWER_50KW">50kW</option>
                    <option value="POWER_120KW">120kW</option>
                    <option value="POWER_350KW">350kW</option>
                  </select>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setCreateModal({ show: false, stationId: null });
                    setCreateForm({ chargingPower: "POWER_22KW" });
                  }}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleCreatePoint}
                  className="flex-1 px-4 py-2 text-white rounded-lg font-semibold transition-colors"
                  style={{ backgroundColor: "#22c55e" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#16a34a")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "#22c55e")
                  }
                >
                  <i className="bi bi-plus-circle me-2"></i>
                  Tạo trụ sạc
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Quản lý Trụ sạc
              </h1>
              <p className="text-gray-600">
                Quản lý và theo dõi trạng thái tất cả trụ sạc trong hệ thống
              </p>
            </div>
            <button
              onClick={() => loadStationsData(true)}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 text-white rounded-lg font-semibold transition-colors"
              style={{ backgroundColor: "#22c55e" }}
              onMouseEnter={(e) =>
                !loading && (e.currentTarget.style.backgroundColor = "#16a34a")
              }
              onMouseLeave={(e) =>
                !loading && (e.currentTarget.style.backgroundColor = "#22c55e")
              }
            >
              {loading ? (
                <>
                  <span className="animate-spin">⟳</span>
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
        </div>

        {/* Search & Filter */}
        <div className="mb-6 flex gap-4">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Tìm trạm sạc..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#22c55e] focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowErrorOnly(!showErrorOnly)}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              showErrorOnly
                ? "bg-[#22c55e] text-white"
                : "bg-white text-gray-700 border border-gray-300"
            }`}
          >
            {showErrorOnly ? "Hiển thị tất cả" : "Chỉ trạm có lỗi"}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <MapPin className="text-[#22c55e]" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Tổng trạm</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stations.length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Zap className="text-[#22c55e]" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Tổng trụ sạc</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stations.reduce(
                    (sum, s) => sum + s.chargingPoints.length,
                    0
                  )}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <i className="bi bi-exclamation-triangle text-red-600 text-2xl"></i>
              </div>
              <div>
                <p className="text-sm text-gray-600">Trụ lỗi</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stations.reduce(
                    (sum, s) =>
                      sum +
                      s.chargingPoints.filter(
                        (p) =>
                          p.status === "OUT_OF_SERVICE" ||
                          p.status === "UNAVAILABLE"
                      ).length,
                    0
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stations List */}
        <div className="space-y-6">
          {filteredStations.map((station) => (
            <div
              key={station.stationId}
              className="bg-white rounded-xl shadow-lg overflow-hidden"
            >
              {/* Station Header */}
              <div className="bg-gradient-to-r from-[#22c55e] to-[#16a34a] text-white p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">
                      {station.stationName}
                    </h2>
                    <p className="text-green-100 flex items-center gap-2">
                      <MapPin size={16} />
                      {station.address}
                    </p>
                    <p className="text-green-100 text-sm mt-2">
                      {station.chargingPoints.length} trụ sạc •{" "}
                      {
                        station.chargingPoints.filter(
                          (p) =>
                            p.status === "AVAILABLE" || p.status === "CHARGING"
                        ).length
                      }{" "}
                      hoạt động
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      setCreateModal({
                        show: true,
                        stationId: station.stationId,
                      })
                    }
                    className="flex items-center gap-2 px-4 py-2 bg-white text-[#22c55e] rounded-lg font-semibold hover:bg-green-50 transition-colors"
                  >
                    <Plus size={20} />
                    Tạo trụ sạc
                  </button>
                </div>
              </div>

              {/* Charging Points */}
              <div className="p-6">
                {!station.chargingPoints ||
                station.chargingPoints.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    Chưa có trụ sạc nào
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {station.chargingPoints.map((point) => {
                      const statusInfo = getStatusInfo(point);
                      const isCharging = statusInfo.text === "Đang sạc";
                      const sessionInfo = point.currentSessionInfo;

                      return (
                        <div
                          key={point.pointId}
                          className="border-2 border-gray-200 rounded-lg p-4 hover:border-[#22c55e] transition-colors relative"
                        >
                          {/* Status Badge */}
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <h6 className="mb-0">{point.name}</h6>
                            <Badge
                              bg={statusInfo.bg}
                              text={statusInfo.textColor || "light"}
                            >
                              {statusInfo.text}
                            </Badge>
                          </div>

                          {/* Power */}
                          <p className="text-sm text-gray-600 mb-3">
                            Công suất: {formatPower(point.chargingPower)}
                          </p>

                          {/* Session Info if charging */}
                          {isCharging && point.currentSessionId && (
                            <div className="bg-green-50 p-3 rounded-lg mb-3">
                              <div className="font-semibold text-green-800 mb-2">
                                Đang phục vụ khách
                              </div>
                              <div className="text-sm text-gray-700 space-y-1">
                                <div className="flex justify-between">
                                  <span>Pin:</span>
                                  <span className="font-semibold">
                                    {sessionInfo?.soc ?? "..."}%
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Phí:</span>
                                  <span className="font-semibold">
                                    {formatCurrency(sessionInfo?.totalCost)}
                                  </span>
                                </div>
                              </div>
                              <div className="text-xs text-gray-500 mt-2">
                                Session:{" "}
                                {point.currentSessionId.substring(0, 8)}
                                ...
                              </div>
                            </div>
                          )}

                          {/* Error/Maintenance messages */}
                          {statusInfo.text === "Lỗi" && (
                            <div className="text-center text-red-600 py-3 bg-red-50 rounded-lg mb-3">
                              Trụ đang gặp lỗi
                            </div>
                          )}

                          {statusInfo.text === "Bảo trì" && (
                            <div className="text-center text-yellow-700 py-3 bg-yellow-50 rounded-lg mb-3">
                              Đang bảo trì
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex gap-2">
                            {statusInfo.text !== "Đang sạc" && !isCharging && (
                              <button
                                onClick={() => {
                                  setEditModal({
                                    show: true,
                                    point,
                                    stationId: station.stationId,
                                  });
                                  setEditForm({
                                    chargingPower: point.chargingPower,
                                  });
                                }}
                                className="flex-1 px-3 py-2 text-white text-sm rounded-lg font-semibold transition-colors"
                                style={{ backgroundColor: "#22c55e" }}
                                onMouseEnter={(e) =>
                                  (e.currentTarget.style.backgroundColor =
                                    "#16a34a")
                                }
                                onMouseLeave={(e) =>
                                  (e.currentTarget.style.backgroundColor =
                                    "#22c55e")
                                }
                              >
                                Chỉnh sửa
                              </button>
                            )}
                            <button
                              onClick={() =>
                                setDeleteModal({
                                  show: true,
                                  point,
                                  stationId: station.stationId,
                                })
                              }
                              className="px-3 py-2 bg-red-100 text-red-700 text-sm rounded-lg hover:bg-red-200 transition-colors"
                              title="Xóa trụ sạc"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredStations.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              {showErrorOnly
                ? "Không có trạm nào có trụ sạc lỗi"
                : "Không tìm thấy trạm sạc nào"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminChargingPointManagement;
