import React, { useState } from "react";
import { MagnifyingGlassIcon, XCircleIcon } from "@heroicons/react/24/solid";
import { QrCodeIcon } from "@heroicons/react/24/outline";
import StationCard from "./StationCard";
import QRScannerModal from "../QRScannerModal";

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

  const filteredStations = stations.filter((station) =>
    station.stationName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="map-sidebar">
      {/* Station count with QR button */}
      <div className="station-count-header">
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <h3 className="station-count-title">Trạm sạc</h3>
          <span className="station-count-badge">
            {filteredStations.length} trạm
          </span>
        </div>

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

      {/* Station List */}
      <div className="station-list">
        {error && (
          <div className="error-message">
            <XCircleIcon className="error-icon" />
            <p>{error}</p>
            <button onClick={onRetry} className="retry-button">
              Thử lại
            </button>
          </div>
        )}

        {filteredStations.length === 0 && !error && (
          <div className="no-stations">
            <p>Không tìm thấy trạm sạc nào</p>
          </div>
        )}

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
