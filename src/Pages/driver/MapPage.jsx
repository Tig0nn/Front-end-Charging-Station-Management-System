import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import "./MapPage.css";
import { stationsAPI, chargingPointsAPI } from "../../lib/apiServices.js";
import ChargerSelectionModal from "../../components/ChargerSelectionModal";
import ChargingPanel from "../../components/ChargingPanel";
import {
  StationList,
  MapView,
  MapControls,
  RouteInfoPanel,
} from "../../components/map";

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

  // Kiểm tra session đang hoạt động khi component mount
  // Nếu có, chuyển hướng người dùng đến trang session

  useEffect(() => {
    const activeId = localStorage.getItem("currentSessionId");

    if (activeId) {
      console.log(
        "MapPage: Phát hiện session đang hoạt động, đang chuyển hướng..."
      );
      alert(
        "Bạn có một phiên sạc đang hoạt động. Đang chuyển hướng bạn đến trang phiên sạc..."
      );
      // Dùng { replace: true } để người dùng không thể nhấn "Back" quay lại MapPage
      navigate(`/driver/session/${activeId}`, { replace: true });
    }
  }, [navigate]);

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
    // Lấy currentSessionId từ localStorage
    const currentId = localStorage.getItem("currentSessionId");

    // --- THÊM LOGIC KIỂM TRA VÀO ĐÂY ---
    if (currentId) {
      // 1. Báo cho người dùng
      alert(
        "Bạn đang trong một phiên sạc. Đang điều hướng bạn đến phiên sạc..."
      );

      // 2. Điều hướng họ đến phiên sạc đó
      navigate(`/driver/session/${currentId}`);

      // 3. Dừng hàm ngay lập tức để không mở modal
      return;
    }
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
    console.log("--- BẮT ĐẦU LUỒNG SẠC ---");
    console.log("1. Dữ liệu nhận được:", { charger, vehicle, targetSoc });

    try {
      // 1. Đóng modal ngay lập tức để người dùng thấy phản hồi
      setShowChargerModal(false);

      // 2. Tạo payload chính xác
      const payload = {
        chargingPointId: charger.pointId,
        vehicleId: vehicle.vehicleId,
        targetSocPercent: targetSoc,
      };

      // 3. Gọi API để bắt đầu phiên sạc
      console.log("3. Đang gọi API startCharging...");
      const response = await chargingPointsAPI.startCharging(payload);

      // 4. Lấy sessionId từ kết quả trả về
      const sessionId = response.data?.result?.sessionId;

      console.log("4. API Response thành công:", response.data);
      console.log("5. Trích xuất sessionId:", sessionId);
      if (sessionId) {
        console.log(
          `6. Thành công! Đang điều hướng đến /driver/session/${sessionId}`
        );
        localStorage.setItem("activeSessionId", sessionId);
        navigate(`/driver/session/${sessionId}`);
      } else {
        throw new Error("Không nhận được ID phiên sạc từ máy chủ.");
      }
    } catch (err) {
      console.error(" LỖI khi bắt đầu phiên sạc:", err);
      alert(
        `Không thể bắt đầu phiên sạc: ${
          err.response?.data?.message || err.message
        }`
      );
    }
  };

  const handleCloseChargingPanel = () => {
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
      {/* Station List Sidebar */}
      <StationList
        stations={stations}
        error={error}
        searchQuery={searchQuery}
        selectedStation={selectedStation}
        userLocation={userLocation}
        onSearchChange={setSearchQuery}
        onStationClick={handleStationClick}
        onShowDirections={handleShowDirections}
        onStartCharging={handleOpenChargerModal}
        onRetry={fetchStations}
        calculateDistance={calculateDistance}
      />

      {/* Map Container */}
      <div className="map-container">
        <MapView
          mapCenter={mapCenter}
          userLocation={userLocation}
          stations={stations}
          showRoute={showRoute}
          routeDestination={routeDestination}
          selectedStation={selectedStation} // 🔥 Thêm dòng này
          onStationClick={handleStationClick}
          onShowDirections={handleShowDirections}
          onRouteFound={setRouteInfo}
        />

        {/* Map Controls */}
        <MapControls
          showRoute={showRoute}
          onGetUserLocation={getUserLocation}
          onRefresh={fetchStations}
          onClearRoute={handleClearRoute}
        />

        {/* Route Info Panel */}
        {showRoute && <RouteInfoPanel routeInfo={routeInfo} />}
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
