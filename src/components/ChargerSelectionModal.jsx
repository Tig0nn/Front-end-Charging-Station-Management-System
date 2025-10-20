import React, { useState, useEffect } from "react";
import {
  XMarkIcon,
  BoltIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  PowerIcon, // Đã sửa thành PowerIcon
} from "@heroicons/react/24/solid";

export default function ChargerSelectionModal({
  station,
  onClose,
  onStartCharging,
}) {
  const [chargers, setChargers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCharger, setSelectedCharger] = useState(null);
  const [error, setError] = useState(null);

  const fetchChargers = async () => {
    try {
      setLoading(true);
      const { mockChargersApi } = await import("../lib/mockApi");
      const response = await mockChargersApi.getChargersByStation(
        station.stationId
      );

      if (response.success && response.data.result) {
        setChargers(response.data.result);
      }
      setError(null);
    } catch (err) {
      console.error("Error fetching chargers:", err);
      setError("Không thể tải danh sách trụ sạc");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChargers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [station]);

  const handleSelectCharger = (charger) => {
    if (charger.status === "Available") {
      setSelectedCharger(charger);
    }
  };

  const handleStartCharging = async () => {
    if (!selectedCharger) return;

    try {
      const { mockChargersApi } = await import("../lib/mockApi");
      await mockChargersApi.startCharging(selectedCharger.chargerId, null);
      onStartCharging(selectedCharger);
      onClose();
    } catch (err) {
      console.error("Error starting charging:", err);
      setError("Không thể bắt đầu sạc. Vui lòng thử lại.");
    }
  };

  const getChargerIcon = (status) => {
    switch (status) {
      case "Available":
        return <PowerIcon className="w-10 h-10 text-gray-500" />; // Giảm kích thước icon
      case "InUse":
        return <BoltIcon className="w-10 h-10 text-emerald-600" />; // Giảm kích thước icon
      default:
        return <PowerIcon className="w-10 h-10 text-gray-400" />;
    }
  };

  const getChargerStatusText = (status) => {
    switch (status) {
      case "Available":
        return "Sẵn sàng";
      case "InUse":
        return "Đang dùng";
      default:
        return "Không khả dụng";
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-5 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-[700px] w-full max-h-[90vh] flex flex-col shadow-[0_20px_60px_rgba(0,0,0,0.3)] animate-slideUp overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header (vẫn căn giữa) */}
        <div className="px-8 py-7 border-b-2 border-emerald-500/10 relative bg-gradient-to-br from-green-50 to-white">
          <div className="text-center w-full">
            <h2 className="text-[1.75rem] font-extrabold text-gray-900 mb-2 tracking-tight">
              Chọn trụ sạc
            </h2>
            <p className="text-[0.95rem] text-gray-600 font-medium m-0 max-w-md mx-auto">
              {station.stationName} - {station.address}
            </p>
          </div>
          <button
            className="w-10 h-10 rounded-xl border-none bg-black/5 text-gray-500 cursor-pointer transition-all duration-300 flex items-center justify-center p-0 hover:bg-red-500/10 hover:text-red-500 hover:scale-110
                       absolute top-6 right-6"
            onClick={onClose}
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-7 modal-body-scroll">
          {loading ? (
            <div className="text-center py-10">
              <ArrowPathIcon className="w-10 h-10 text-emerald-500 animate-spin mx-auto mb-4" />
              <p>Đang tải danh sách trụ sạc...</p>
            </div>
          ) : error ? (
            <div className="text-center py-10">
              <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-500 font-semibold mb-4">{error}</p>
              <button
                onClick={fetchChargers}
                className="px-5 py-2.5 bg-emerald-600 text-white border-none rounded-xl font-bold cursor-pointer transition-all duration-300 hover:bg-emerald-700 hover:-translate-y-0.5"
              >
                Thử lại
              </button>
            </div>
          ) : (
            /* --- THAY ĐỔI: Quay lại layout GRID --- */
            <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-4">
              {chargers.map((charger) => (
                <div
                  key={charger.chargerId}
                  className={`
                    /* --- XÓA: w-[170px] flex-shrink-0 --- */
                    bg-white border-2 rounded-2xl p-4 /* Giảm padding p-5 -> p-4 */
                    text-center cursor-pointer transition-all duration-300 relative
                    ${
                      charger.status === "Available"
                        ? "border-emerald-500/30 bg-gradient-to-br from-green-50 to-white hover:border-emerald-500 hover:bg-gradient-to-br hover:from-green-100 hover:to-green-50 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(16,185,129,0.2)]"
                        : "border-gray-300 bg-gradient-to-br from-gray-50 to-white cursor-not-allowed opacity-70"
                    }
                    ${
                      selectedCharger?.chargerId === charger.chargerId
                        ? "border-emerald-500 bg-gradient-to-br from-green-100 to-green-50 shadow-[0_8px_24px_rgba(16,185,129,0.3)] -translate-y-1 scale-[1.02]"
                        : ""
                    }
                  `}
                  onClick={() => handleSelectCharger(charger)}
                >
                  {selectedCharger?.chargerId === charger.chargerId && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-emerald-600 text-white rounded-full flex items-center justify-center">
                      <CheckCircleIcon className="w-6 h-6" />
                    </div>
                  )}

                  {/* --- THAY ĐỔI: Giảm chiều cao và margin của icon --- */}
                  <div className="h-12 flex items-center justify-center mb-2">
                    {getChargerIcon(charger.status)}
                  </div>

                  {/* --- THAY ĐỔI: Giảm margin của text --- */}
                  <h3 className="text-lg font-extrabold text-gray-900 mb-1">
                    {charger.chargerName}
                  </h3>
                  <p className="text-sm text-gray-600 my-0.5 font-semibold">
                    {charger.powerOutput}
                  </p>
                  <p className="text-xs text-gray-500 my-0.5 mb-2 font-medium">
                    {charger.connectorType}
                  </p>

                  <div
                    className={`
                      inline-block px-3 py-1 /* Giảm padding 1.5 -> 1 */
                      rounded-xl text-xs font-extrabold uppercase tracking-wide mt-1 /* Giảm mt-2 -> mt-1 */
                      ${
                        charger.status === "Available"
                          ? "bg-gradient-to-br from-green-200 to-emerald-100 text-emerald-900 border border-emerald-500/30"
                          : "bg-gradient-to-br from-gray-200 to-gray-100 text-gray-700 border border-gray-400/30"
                      }
                    `}
                  >
                    {getChargerStatusText(charger.status)}
                  </div>

                  {/* Tên người dùng vẫn bị ẩn */}
                </div>
              ))}
            </div>
            /* --- KẾT THÚC THAY ĐỔI --- */
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t-2 border-emerald-500/10 flex gap-3 justify-end bg-gradient-to-t from-emerald-500/5 to-transparent">
          <button
            className="px-7 py-3.5 rounded-[14px] text-base font-extrabold cursor-pointer transition-all duration-300 border-none bg-black/5 text-gray-600 hover:bg-black/10 hover:text-gray-800 hover:-translate-y-0.5 tracking-wide"
            onClick={onClose}
          >
            Hủy
          </button>
          <button
            className="px-7 py-3.5 rounded-[14px] text-base font-extrabold cursor-pointer transition-all duration-300 border-none bg-gradient-to-br from-emerald-600 to-emerald-700 text-white shadow-[0_4px_12px_rgba(16,185,129,0.3)] flex items-center gap-2 tracking-wide hover:from-emerald-700 hover:to-emerald-800 hover:shadow-[0_8px_20px_rgba(16,185,129,0.4)] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
            onClick={handleStartCharging}
            disabled={!selectedCharger}
          >
            <BoltIcon className="w-5 h-5" />
            Bắt đầu
          </button>
        </div>
      </div>
    </div>
  );
}
