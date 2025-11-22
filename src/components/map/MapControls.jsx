import React from "react";
import {
  MapPinIcon,
  ArrowPathIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";

/**
 * MapControls - Các nút điều khiển floating trên bản đồ
 * Chức năng: GPS, Refresh, Clear Route
 */
const MapControls = ({
  showRoute,
  onGetUserLocation,
  onRefresh,
  onClearRoute,
}) => {
  return (
    <div className="map-controls">
      {/* Nút GPS - Lấy vị trí hiện tại */}
      <button
        onClick={onGetUserLocation}
        className="control-button"
        title="Vị trí của tôi"
      >
        <MapPinIcon className="icon-control" />
      </button>

      {/* Nút Refresh - Tải lại danh sách trạm */}
      <button onClick={onRefresh} className="control-button" title="Làm mới">
        <ArrowPathIcon className="icon-control" />
      </button>

      {/* Nút Clear Route - Xóa đường đi (chỉ hiện khi có route) */}
      {showRoute && (
        <button
          onClick={onClearRoute}
          className="control-button clear-route-button"
          title="Xóa đường đi"
        >
          <XMarkIcon className="icon-control" />
        </button>
      )}
    </div>
  );
};

export default MapControls;
