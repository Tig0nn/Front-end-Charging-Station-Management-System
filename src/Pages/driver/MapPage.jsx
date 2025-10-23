import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./MapPage.css"; // Chúng ta sẽ cập nhật file này
import { stationsAPI } from "../../lib/apiServices.js";
import ChargerSelectionModal from "../../components/ChargerSelectionModal";
import RoutingControl from "../../components/RoutingControl";
import ChargingPanel from "../../components/ChargingPanel";

// Thêm Heroicons
import {
  MapPinIcon,
  BoltIcon,
  MapIcon,
  CheckBadgeIcon,
  XCircleIcon,
  ArrowPathIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/solid";
import { CircleStackIcon } from "@heroicons/react/24/outline"; // Icon "trống"

// Fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom icons
const stationIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const userIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Component to handle map interactions
function MapController({ center, zoom }) {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);

  return null;
}

export default function MapPage() {
  const navigate = useNavigate();
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState([10.8231, 106.6297]); // Default: Ho Chi Minh City
  const [selectedStation, setSelectedStation] = useState(null);
  const [showChargerModal, setShowChargerModal] = useState(false);
  const [stationForCharging, setStationForCharging] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [showRoute, setShowRoute] = useState(false);
  const [routeDestination, setRouteDestination] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Charging session states
  const [showChargingPanel, setShowChargingPanel] = useState(false);
  const [activeCharger, setActiveCharger] = useState(null);
  const [activeStation, setActiveStation] = useState(null);

  // Fetch stations from API
  useEffect(() => {
    fetchStations();
    getUserLocation();
  }, []);

  const fetchStations = async () => {
    try {
      setLoading(true);
      // Call API to get all stations (backend returns OPERATIONAL by default)
      const response = await stationsAPI.getOverview();
      console.log("📍 Stations API response:", response);

      let stationsData = [];

      // Backend returns structure: { code, message, result: [...] }
      if (response.data?.result && Array.isArray(response.data.result)) {
        stationsData = response.data.result;
      } else if (response.result && Array.isArray(response.result)) {
        stationsData = response.result;
      } else if (Array.isArray(response.data)) {
        stationsData = response.data;
      }

      console.log("📍 Parsed stations data:", stationsData);

      // Map backend fields to frontend fields
      const mappedStations = stationsData.map((station) => ({
        stationId: station.stationId,
        stationName: station.name, // Backend uses 'name'
        address: station.address,
        operatorName: station.operatorName,
        contactPhone: station.contactPhone,
        latitude: station.latitude,
        longitude: station.longitude,
        status: station.status, // OPERATIONAL, MAINTENANCE, OUT_OF_SERVICE, CLOSED
        active: station.active,
        staffId: station.staffId,
        staffName: station.staffName,
        // Add default values for fields not in backend
        totalChargers: 0, // Will be updated from chargers API if needed
        availableChargers: 0,
        pricePerKwh: "3,500đ/kWh",
        hotline: station.contactPhone || "N/A",
        email: station.operatorName
          ? `${station.operatorName}@email.com`
          : "N/A",
      }));

      setStations(mappedStations);
      setError(null);
     
      console.log(`✅ Loaded ${mappedStations.length} stations`);
    } catch (err) {
      console.error("❌ Error fetching stations:", err);
      if (err?.response?.status === 401) {
        console.log("🔒 Authentication required - redirecting to login");
        return;
      }
      setError("Không thể tải danh sách trạm sạc");
      setStations([]);
    } finally {
      setLoading(false);
    }
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = [
            position.coords.latitude,
            position.coords.longitude,
          ];
          setUserLocation(location);
          setMapCenter(location);
        },
        (error) => {
          console.warn("⚠️ Could not get user location:", error);
        }
      );
    }
  };

  const handleStationClick = (station) => {
    setSelectedStation(station);
    if (station.latitude && station.longitude) {
      setMapCenter([station.latitude, station.longitude]);
    }
  };

  const handleOpenChargerModal = (station) => {
    //log station ra
    console.log("Opening modal for station:", station);
    setStationForCharging(station);
    setShowChargerModal(true);
  };

  const handleCloseChargerModal = () => {
    setShowChargerModal(false);
    setStationForCharging(null);
  };

    const handleStartCharging = async (charger, vehicle, targetSoc) => {
    console.log("Attempting to start charge with:", {
      chargerId: charger.chargingPointId,
      vehicleId: vehicle.vehicleId,
      targetSoc: targetSoc,
    });

    try {
      // 1. Đóng modal ngay lập tức để người dùng thấy phản hồi
      setShowChargerModal(false);

      // 2. Tạo payload chính xác
      const payload = {
        chargingPointId: charger.chargingPointId,
        vehicleId: vehicle.vehicleId,
        targetSocPercent: targetSoc,
      };

      // 3. Gọi API để bắt đầu phiên sạc
      const response = await chargingPointsAPI.startCharging(payload);

      // 4. Lấy sessionId từ kết quả trả về
      const sessionId = response.data?.result?.sessionId;

      if (sessionId) {
        console.log(` Charging session started. Session ID: ${sessionId}`);
        // 5. Điều hướng đến trang ChargingSessionPage với ID
        navigate(`/driver/charging-session/${sessionId}`);
      } else {
        throw new Error("Không nhận được ID phiên sạc từ máy chủ.");
      }
    } catch (err) {
      console.error("Failed to start charging session:", err);
      alert(`Không thể bắt đầu phiên sạc: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleCloseChargingPanel = () => {a
    setShowChargingPanel(false);
    setActiveCharger(null);
    setActiveStation(null);
  };

  const handleCompleteCharging = () => {
    // TODO: Add to history, update user data
    console.log("Charging completed!");
  };

  const handleShowDirections = (station) => {
    if (!userLocation) {
      alert("Không thể xác định vị trí của bạn. Vui lòng bật GPS.");
      return;
    }

    if (!station.latitude || !station.longitude) {
      alert("Trạm sạc không có thông tin vị trí.");
      return;
    }

    setRouteDestination([station.latitude, station.longitude]);
    setShowRoute(true);
    setSelectedStation(station);
  };

  const handleClearRoute = () => {
    setShowRoute(false);
    setRouteDestination(null);
    setRouteInfo(null);
  };

  const handleRouteFound = useCallback((info) => {
    setRouteInfo(info);
  }, []);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of Earth in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance.toFixed(1);
  };

  // *** THAY ĐỔI QUAN TRỌNG ***
  // Lọc trạm dựa trên tìm kiếm VÀ hiển thị tất cả
  const filteredStations = stations.filter((station) =>
    station.stationName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p className="loading-text">⚡ Đang tải bản đồ trạm sạc...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="map-page-container">
      {/* Sidebar - Sẽ nổi bên trên Map Container */}
      <div className="map-sidebar">
        {/* Station count */}
        <div className="station-count-header">
          <h3 className="station-count-title">Trạm sạc</h3>
          <span className="station-count-badge">
            {filteredStations.length} trạm
          </span>
        </div>

        {/* Search Bar Mới */}
        <div className="sidebar-search-container">
          <MagnifyingGlassIcon className="search-icon" />
          <input
            type="text"
            placeholder="Tìm trạm sạc (ví dụ: Vincom...)"
            className="sidebar-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Station List */}
        <div className="station-list">
          {error && (
            <div className="error-message">
              <XCircleIcon className="error-icon" />
              <p>{error}</p>
              <button onClick={fetchStations} className="retry-button">
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
            <div
              key={station.stationId}
              className={`station-card ${
                selectedStation?.stationId === station.stationId
                  ? "station-card-active"
                  : ""
              }`}
              onClick={() => handleStationClick(station)}
            >
              <div className="station-card-header">
                <h3 className="station-name">{station.stationName}</h3>
                <span
                  className={`status-badge ${
                    station.status === "OPERATIONAL"
                      ? "status-active"
                      : station.status === "MAINTENANCE"
                      ? "status-maintenance"
                      : "status-inactive"
                  }`}
                >
                  {station.status === "OPERATIONAL" ? (
                    <CheckBadgeIcon className="icon-xs" />
                  ) : (
                    <XCircleIcon className="icon-xs" />
                  )}
                  {station.status === "OPERATIONAL"
                    ? "Hoạt động"
                    : station.status === "MAINTENANCE"
                    ? "Bảo trì"
                    : station.status === "OUT_OF_SERVICE"
                    ? "Tạm ngưng"
                    : "Đóng cửa"}
                </span>
              </div>

              <p className="station-address">
                <MapPinIcon className="icon-sm" />
                <span>{station.address}</span>
              </p>

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

              <div className="station-info">
                <span className="info-item">
                  <BoltIcon className="icon-sm" />
                  {station.totalChargers || 0} sạc
                </span>
                <span className="info-item">
                  <CircleStackIcon className="icon-sm" />
                  {station.availableChargers || 0} trống
                </span>
              </div>

              {/* Khu vực nút bấm mới */}
              <div className="station-card-actions">
                <button
                  className="action-button-secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShowDirections(station);
                  }}
                >
                  <MapIcon className="icon-btn" />
                  Chỉ đường
                </button>
                <button
                  className="action-button-primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenChargerModal(station);
                  }}
                >
                  <BoltIcon className="icon-btn" />
                  Sạc ngay
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Map Container - Nằm bên dưới Sidebar */}
      <div className="map-container">
        <MapContainer
          center={mapCenter}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
          zoomControl={false} // Tắt zoom control mặc định
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapController center={mapCenter} zoom={13} />

          {/* User Location Marker */}
          {userLocation && (
            <Marker position={userLocation} icon={userIcon}>
              <Popup className="custom-popup">
                <div className="popup-content-inner">
                  <h3 className="popup-title">📍 Vị trí của bạn</h3>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Station Markers */}
          {filteredStations.map((station) => {
            if (!station.latitude || !station.longitude) return null;

            return (
              <Marker
                key={station.stationId}
                position={[station.latitude, station.longitude]}
                icon={stationIcon}
                eventHandlers={{
                  click: () => handleStationClick(station),
                }}
              >
                {/* Thêm className="custom-popup" */}
                <Popup className="custom-popup">
                  <div className="popup-content-inner">
                    <h3 className="popup-title">{station.stationName}</h3>
                    <div className="popup-content">
                      <p>
                        <strong>Địa chỉ:</strong> {station.address}
                      </p>
                      <p>
                        <strong>Tổng số sạc:</strong>{" "}
                        {station.totalChargers || 0}
                      </p>
                      <p>
                        <strong>Còn trống:</strong>{" "}
                        {station.availableChargers || 0}
                      </p>
                      <p>
                        <strong>Hotline:</strong> {station.hotline || "N/A"}
                      </p>
                      <p>
                        <strong>Trạng thái:</strong>{" "}
                        <span
                          className={
                            station.status === "OPERATIONAL"
                              ? "text-green-600"
                              : station.status === "MAINTENANCE"
                              ? "text-yellow-600"
                              : "text-red-600"
                          }
                        >
                          {station.status === "OPERATIONAL"
                            ? "Hoạt động"
                            : station.status === "MAINTENANCE"
                            ? "Bảo trì"
                            : station.status === "OUT_OF_SERVICE"
                            ? "Tạm ngưng"
                            : "Đóng cửa"}
                        </span>
                      </p>
                    </div>
                    <button
                      className="popup-button"
                      onClick={() => handleShowDirections(station)}
                    >
                      <MapIcon className="icon-btn" />
                      Chỉ đường
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* Routing Control */}
          {showRoute && userLocation && routeDestination && (
            <RoutingControl
              start={userLocation}
              end={routeDestination}
              onRouteFound={handleRouteFound}
            />
          )}
        </MapContainer>

        {/* Map Controls */}
        <div className="map-controls">
          <button
            onClick={getUserLocation}
            className="control-button"
            title="Vị trí của tôi"
          >
            <MapPinIcon className="icon-control" />
          </button>
          <button
            onClick={fetchStations}
            className="control-button"
            title="Làm mới"
          >
            <ArrowPathIcon className="icon-control" />
          </button>
          {showRoute && (
            <button
              onClick={handleClearRoute}
              className="control-button clear-route-button"
              title="Xóa đường đi"
            >
              <XMarkIcon className="icon-control" />
            </button>
          )}
        </div>

        {/* Route Info Panel - Thay thế inline style bằng class */}
        {routeInfo && showRoute && (
          <div className="route-info-panel">
            <div className="route-info-item">
              <MapIcon className="icon-route" />
              <div>
                <div className="route-info-label">Khoảng cách</div>
                <div className="route-info-value">{routeInfo.distance} km</div>
              </div>
            </div>
            <div className="route-info-divider"></div>
            <div className="route-info-item">
              <span className="icon-route-emoji">⏱️</span>
              <div>
                <div className="route-info-label">Thời gian</div>
                <div className="route-info-value">
                  {routeInfo.duration} phút
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Charger Selection Modal */}
      {showChargerModal && stationForCharging && (
        <ChargerSelectionModal
          station={stationForCharging}
          onClose={handleCloseChargerModal}
          onStartCharging={handleStartCharging}
        />
      )}

      {/* Charging Panel Overlay */}
      {showChargingPanel && activeStation && activeCharger && (
        <ChargingPanel
          station={activeStation}
          charger={activeCharger}
          onClose={handleCloseChargingPanel}
          onComplete={handleCompleteCharging}
        />
      )}
    </div>
  );
}
