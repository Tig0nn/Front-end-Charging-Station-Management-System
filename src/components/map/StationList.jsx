import React, { useState } from "react";
import { MagnifyingGlassIcon, XCircleIcon } from "@heroicons/react/24/solid";
import { QrCodeIcon } from "@heroicons/react/24/outline";
import StationCard from "./StationCard";
import QRScannerModal from "../QRScannerModal";

/**
 * StationList - Sidebar hiển thị danh sách trạm sạc
 * Chức năng: Filter, hiển thị cards, QR scanner
 */
const StationList = ({
  stations,
  error,
  searchQuery,
  selectedStation,
  userLocation,
  onStationClick,
  onShowDirections,
  onStartCharging,
  onRetry,
  calculateDistance,
}) => {
  const [showQRModal, setShowQRModal] = useState(false);

  // Filter trạm theo tên
  const filteredStations = stations.filter((station) =>
    station.stationName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="map-sidebar">
      {/* Header: Tiêu đề + Số lượng + Nút QR */}
      <div className="station-count-header">
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <h3 className="station-count-title">Trạm sạc</h3>
          <span className="station-count-badge">
            {filteredStations.length} trạm
          </span>
        </div>

        {/* Nút QR Scanner */}
        <button
          onClick={() => setShowQRModal(true)}
          className="qr-scan-button"
          title="Bắt đầu sạc bằng QR"
          style={{
            padding: "8px 16px",
            backgroundColor: "#10b981",
            color: "white",
            border: "none",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#059669";
            e.currentTarget.style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#10b981";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          <QrCodeIcon style={{ width: "20px", height: "20px" }} />
          Sạc bằng QR
        </button>
      </div>

      {/* Danh sách trạm */}
      <div className="station-list">
        {/* Trường hợp 1: Có lỗi */}
        {error && (
          <div className="error-message">
            <XCircleIcon className="error-icon" />
            <p>{error}</p>
            <button onClick={onRetry} className="retry-button">
              Thử lại
            </button>
          </div>
        )}

        {/* Trường hợp 2: Không có kết quả */}
        {filteredStations.length === 0 && !error && (
          <div className="no-stations">
            <p>Không tìm thấy trạm sạc nào</p>
          </div>
        )}

        {/* Trường hợp 3: Render danh sách */}
        {filteredStations.map((station) => (
          <StationCard
            key={station.stationId}
            station={station}
            isSelected={selectedStation?.stationId === station.stationId}
            userLocation={userLocation}
            onStationClick={onStationClick}
            onShowDirections={onShowDirections}
            onStartCharging={onStartCharging}
            calculateDistance={calculateDistance}
          />
        ))}
      </div>

      {/* QR Scanner Modal */}
      <QRScannerModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
      />
    </div>
  );
};

export default StationList;
