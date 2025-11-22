import React from "react";
import {
  MapPinIcon,
  BoltIcon,
  MapIcon,
  CheckBadgeIcon,
  XCircleIcon,
} from "@heroicons/react/24/solid";
import { CircleStackIcon } from "@heroicons/react/24/outline";

/**
 * StationCard - Hiển thị thông tin 1 trạm sạc dạng card
 * Chức năng: Hiển thị tên, địa chỉ, trạng thái, khoảng cách, số trụ, actions
 */
const StationCard = ({
  station,
  isSelected,
  userLocation,
  onStationClick,
  onShowDirections,
  onStartCharging,
  calculateDistance,
}) => {
  // Hàm tạo badge trạng thái
  const getStatusBadge = (status) => {
    const statusConfig = {
      OPERATIONAL: {
        className: "status-active",
        icon: CheckBadgeIcon,
        text: "Hoạt động",
      },
      MAINTENANCE: {
        className: "status-maintenance",
        icon: XCircleIcon,
        text: "Bảo trì",
      },
      OUT_OF_SERVICE: {
        className: "status-inactive",
        icon: XCircleIcon,
        text: "Tạm ngưng",
      },
      CLOSED: {
        className: "status-inactive",
        icon: XCircleIcon,
        text: "Đóng cửa",
      },
    };

    const config = statusConfig[status] || statusConfig.CLOSED;
    const IconComponent = config.icon;

    return (
      <span className={`status-badge ${config.className}`}>
        <IconComponent className="icon-xs" />
        {config.text}
      </span>
    );
  };

  return (
    <div
      className={`station-card ${isSelected ? "station-card-active" : ""}`}
      onClick={() => onStationClick && onStationClick(station)}
      style={{ cursor: "pointer" }}
    >
      {/* Header: Tên + Trạng thái */}
      <div className="station-card-header">
        <h3 className="station-name">{station.stationName}</h3>
        {getStatusBadge(station.status)}
      </div>

      {/* Địa chỉ */}
      <p className="station-address">
        <MapPinIcon className="icon-sm" />
        <span>{station.address}</span>
      </p>

      {/* Khoảng cách (nếu có GPS) */}
      {userLocation && station.latitude && station.longitude && (
        <p className="station-distance">
          🗺️ Cách bạn{" "}
          {calculateDistance(
            userLocation[0],
            userLocation[1],
            station.latitude,
            station.longitude
          )}{" "}
          km
        </p>
      )}

      {/* Thông tin số lượng trụ */}
      <div className="station-info">
        <span className="info-item">
          <BoltIcon className="icon-sm" />
          {station.chargingPointsCount || station.totalChargingPoints || 0} sạc
        </span>
        <span className="info-item">
          <CircleStackIcon className="icon-sm" />
          {station.availableChargingPoints || 0} trống
        </span>
      </div>

      {/* Action buttons */}
      <div className="station-card-actions">
        {/* Nút "Chỉ đường" */}
        <button
          className="action-button-secondary"
          onClick={(e) => {
            e.stopPropagation();
            onShowDirections(station);
          }}
        >
          <MapIcon className="icon-btn" />
          Chỉ đường
        </button>

        {/* Nút "Sạc ngay" */}
        <button
          className="action-button-primary"
          onClick={(e) => {
            e.stopPropagation();
            onStartCharging(station);
          }}
        >
          <BoltIcon className="icon-btn" />
          Sạc ngay
        </button>
      </div>
    </div>
  );
};

export default StationCard;
