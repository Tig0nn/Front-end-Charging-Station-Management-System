import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./MapPage.css";
import { stationsAPI } from "../../lib/apiServices";
import ChargerSelectionModal from "../../components/ChargerSelectionModal";

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

// Custom icons for stations
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
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState([10.8231, 106.6297]); // Default: Ho Chi Minh City
  const [selectedStation, setSelectedStation] = useState(null);
  const [showChargerModal, setShowChargerModal] = useState(false);
  const [stationForCharging, setStationForCharging] = useState(null);

  // Fetch stations from API
  useEffect(() => {
    fetchStations();
    getUserLocation();
  }, []);

  const fetchStations = async () => {
    try {
      setLoading(true);
      const response = await stationsAPI.getAll();
      console.log("📍 Stations response:", response);

      let stationsData = [];
      if (response.data?.result) {
        stationsData = response.data.result;
      } else if (Array.isArray(response.data)) {
        stationsData = response.data;
      }

      setStations(stationsData);
      setError(null);
    } catch (err) {
      console.error("❌ Error fetching stations:", err);

      // If it's a 401 error, the interceptor will handle redirect
      // So we don't need to do anything here
      if (err?.response?.status === 401) {
        console.log("🔒 Authentication required - redirecting to login");
        return; // Let the interceptor handle the redirect
      }

      setError("Không thể tải danh sách trạm sạc");
      setStations([]); // Set empty array to prevent crashes
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
    setStationForCharging(station);
    setShowChargerModal(true);
  };

  const handleCloseChargerModal = () => {
    setShowChargerModal(false);
    setStationForCharging(null);
  };

  const handleStartCharging = (charger) => {
    console.log("Starting charging with charger:", charger);
    // You can add navigation to charging session page here
    // navigate('/driver/charging-session');
  };

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

  // Show only first 2 stations
  const filteredStations = stations.slice(0, 2);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p className="text-gray-700">⚡ Đang tải bản đồ trạm sạc...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="map-page-container">
      {/* Sidebar */}
      <div className="map-sidebar">
        {/* Station count */}
        <div className="station-count-header">
          <h3 className="station-count-title">Trạm sạc</h3>
          <span className="station-count-badge">
            {filteredStations.length} trạm
          </span>
        </div>

        {/* Station List */}
        <div className="station-list">
          {error && (
            <div className="error-message">
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
                    station.status === "Active"
                      ? "status-active"
                      : "status-inactive"
                  }`}
                >
                  {station.status === "Active" ? "Hoạt động" : "Đóng cửa"}
                </span>
              </div>

              <p className="station-address">📍 {station.address}</p>

              {userLocation && station.latitude && station.longitude && (
                <p className="station-distance">
                  � Cách bạn{" "}
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
                  🔌 {station.totalChargers || 0} sạc
                </span>
                <span className="info-item">
                  ⚡ {station.availableChargers || 0} trống
                </span>
              </div>

              {/* Charging Button */}
              <button
                className="charging-button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenChargerModal(station);
                }}
              >
                ⚡ Sạc
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Map Container */}
      <div className="map-container">
        <MapContainer
          center={mapCenter}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapController center={mapCenter} zoom={13} />

          {/* User Location Marker */}
          {userLocation && (
            <Marker position={userLocation} icon={userIcon}>
              <Popup>
                <div className="custom-popup">
                  <h3>📍 Vị trí của bạn</h3>
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
                <Popup>
                  <div className="custom-popup">
                    <h3 className="popup-title">{station.stationName}</h3>
                    <div className="popup-content">
                      <p>
                        <strong>📍 Địa chỉ:</strong> {station.address}
                      </p>
                      <p>
                        <strong>🔌 Tổng số sạc:</strong>{" "}
                        {station.totalChargers || 0}
                      </p>
                      <p>
                        <strong>⚡ Còn trống:</strong>{" "}
                        {station.availableChargers || 0}
                      </p>
                      <p>
                        <strong>📞 Hotline:</strong> {station.hotline || "N/A"}
                      </p>
                      <p>
                        <strong>📧 Email:</strong> {station.email || "N/A"}
                      </p>
                      <p>
                        <strong>⏰ Trạng thái:</strong>{" "}
                        <span
                          className={
                            station.status === "Active"
                              ? "text-green-600 font-semibold"
                              : "text-red-600 font-semibold"
                          }
                        >
                          {station.status === "Active"
                            ? "Hoạt động"
                            : "Đóng cửa"}
                        </span>
                      </p>
                    </div>
                    <button className="popup-button">Chỉ đường</button>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {/* Map Controls */}
        <div className="map-controls">
          <button
            onClick={getUserLocation}
            className="control-button"
            title="Vị trí của tôi"
          >
            🎯
          </button>
          <button
            onClick={fetchStations}
            className="control-button"
            title="Làm mới"
          >
            🔄
          </button>
        </div>
      </div>

      {/* Charger Selection Modal */}
      {showChargerModal && stationForCharging && (
        <ChargerSelectionModal
          station={stationForCharging}
          onClose={handleCloseChargerModal}
          onStartCharging={handleStartCharging}
        />
      )}
    </div>
  );
}
