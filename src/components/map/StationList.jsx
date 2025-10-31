import React from "react";
import { MagnifyingGlassIcon, XCircleIcon } from "@heroicons/react/24/solid";
import StationCard from "./StationCard";

const StationList = ({
  stations,
  error,
  searchQuery,
  selectedStation,
  userLocation,
  onSearchChange,
  onStationClick,
  onShowDirections,
  onStartCharging,
  onRetry,
  calculateDistance,
}) => {
  const filteredStations = stations.filter((station) =>
    station.stationName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="map-sidebar">
      {/* Station count */}
      <div className="station-count-header">
        <h3 className="station-count-title">Trạm sạc</h3>
        <span className="station-count-badge">
          {filteredStations.length} trạm
        </span>
      </div>

      {/* Search Bar */}
      <div className="sidebar-search-container">
        <MagnifyingGlassIcon className="search-icon" />
        <input
          type="text"
          placeholder="Tìm trạm sạc (ví dụ: Vincom...)"
          className="sidebar-search-input"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
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
    </div>
  );
};

export default StationList;
