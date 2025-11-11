import React from "react";
import {
  MapPinIcon,
  ArrowPathIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";

const MapControls = ({
  showRoute,
  onGetUserLocation,
  onRefresh,
  onClearRoute,
}) => {
  return (
    <div className="map-controls">
      <button
        onClick={onGetUserLocation}
        className="control-button"
        title="Vị trí của tôi"
      >
        <MapPinIcon className="icon-control" />
      </button>
      <button onClick={onRefresh} className="control-button" title="Làm mới">
        <ArrowPathIcon className="icon-control" />
      </button>
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
