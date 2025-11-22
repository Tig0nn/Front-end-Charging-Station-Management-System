import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "leaflet/dist/leaflet.css";
import "./MapPage.css";

// Components
import ChargerSelectionModal from "../../components/ChargerSelectionModal";
import {
  StationList,
  MapView,
  MapControls,
  RouteInfoPanel,
} from "../../components/map";
import LoadingSpinner from "../../components/loading_spins/LoadingSpinner.jsx";

// Hooks & Utils & API
import { useStations } from "../../hooks/useStations"; // Hook mới
import { useUserLocation } from "../../hooks/useUserLocation"; // Hook mới
import { calculateDistance } from "../../lib/geoUtils"; // Utils mới
import { chargingPointsAPI } from "../../lib/apiServices";

export default function MapPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // 1. Sử dụng Custom Hooks thay vì viết logic dài dòng
  const { stations, loading, error, refetch } = useStations();
  const { userLocation, mapCenter, setMapCenter, getUserLocation } =
    useUserLocation();

  // Local State cho UI interaction
  const [selectedStation, setSelectedStation] = useState(null);
  const [showChargerModal, setShowChargerModal] = useState(false);
  const [stationForCharging, setStationForCharging] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [showRoute, setShowRoute] = useState(false);
  const [routeDestination, setRouteDestination] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [preSelectedPointId, setPreSelectedPointId] = useState(null);

  // Logic 1: Kiểm tra session đang hoạt động
  useEffect(() => {
    const activeId = localStorage.getItem("activeSessionId");
    if (activeId) {
      alert("Bạn có một phiên sạc đang hoạt động. Đang chuyển hướng...");
      navigate(`/driver/session/${activeId}`, { replace: true });
    }
  }, [navigate]);

  // Logic 2: Xử lý QR Code từ URL
  useEffect(() => {
    const pointId = searchParams.get("pointId");
    const stationId = searchParams.get("stationId");

    if (pointId && stations.length > 0) {
      let targetStation = stationId
        ? stations.find((s) => s.stationId === stationId)
        : null;

      if (targetStation) {
        setPreSelectedPointId(pointId);
        setStationForCharging(targetStation);
        setShowChargerModal(true);
        setSearchParams({});
      }
    }
  }, [searchParams, stations, setSearchParams]);

  // Logic 3: Xử lý bắt đầu sạc
  const handleStartCharging = async (charger, vehicle, targetSoc) => {
    try {
      setShowChargerModal(false);
      const loadingToast = toast.loading("Đang khởi động phiên sạc...");

      const response = await chargingPointsAPI.startCharging({
        chargingPointId: charger.pointId,
        vehicleId: vehicle,
        targetSocPercent: targetSoc,
      });

      const sessionId = response.data?.result?.sessionId;
      if (sessionId) {
        toast.dismiss(loadingToast);
        toast.success("Khởi động phiên sạc thành công!");
        localStorage.setItem("activeSessionId", sessionId);
        navigate(`/driver/session/${sessionId}`);
      } else {
        throw new Error("Không nhận được ID phiên sạc.");
      }
    } catch (err) {
      toast.dismiss();
      toast.error(`Lỗi: ${err.response?.data?.message || err.message}`);
    }
  };

  // Logic 4: Các handlers UI
  const handleOpenChargerModal = (station) => {
    if (localStorage.getItem("activeSessionId")) {
      alert("Bạn đang trong một phiên sạc.");
      return;
    }
    setStationForCharging(station);
    setShowChargerModal(true);
  };

  const handleShowDirections = (station) => {
    if (!userLocation) return alert("Vui lòng bật GPS để dùng tính năng này.");
    if (!station.latitude) return alert("Trạm không có tọa độ.");

    setRouteDestination([station.latitude, station.longitude]);
    setShowRoute(true);
    setSelectedStation(station);
  };

  // Render Loading
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <LoadingSpinner />
          <p className="loading-text">Đang tải bản đồ trạm sạc...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="map-page-container">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* LEFT: MAP */}
      <div className="map-container">
        <div className="map-header">
          <div className="d-flex align-items-center justify-content-between gap-3">
            <div className="d-flex align-items-center gap-2">
              <i
                className="bi bi-geo-alt text-green-600"
                style={{ fontSize: "20px" }}
              ></i>
              <h2 className="mb-0 text-lg font-semibold">Bản đồ trạm sạc</h2>
            </div>
            <div className="map-search-container">
              <i className="bi bi-search map-search-icon"></i>
              <input
                type="text"
                placeholder="Tìm kiếm trạm sạc..."
                className="map-search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  className="map-search-clear"
                  onClick={() => setSearchQuery("")}
                >
                  <i className="bi bi-x-circle-fill"></i>
                </button>
              )}
            </div>
          </div>
        </div>

        <MapView
          mapCenter={mapCenter}
          userLocation={userLocation}
          stations={stations}
          showRoute={showRoute}
          routeDestination={routeDestination}
          selectedStation={selectedStation}
          onStationClick={setSelectedStation}
          onShowDirections={handleShowDirections}
          onRouteFound={setRouteInfo}
        />

        <MapControls
          showRoute={showRoute}
          onGetUserLocation={getUserLocation} // Dùng hàm từ hook
          onRefresh={refetch} // Dùng hàm từ hook
          onClearRoute={() => {
            setShowRoute(false);
            setRouteDestination(null);
            setRouteInfo(null);
          }}
        />

        {showRoute && <RouteInfoPanel routeInfo={routeInfo} />}
      </div>

      {/* RIGHT: SIDEBAR LIST */}
      <StationList
        stations={stations}
        error={error}
        searchQuery={searchQuery}
        selectedStation={selectedStation}
        userLocation={userLocation}
        onSearchChange={setSearchQuery}
        onStationClick={(s) => {
          setSelectedStation(s);
          // Optional: Zoom tới trạm khi click list
          if (s.latitude && s.longitude)
            setMapCenter([s.latitude, s.longitude]);
        }}
        onShowDirections={handleShowDirections}
        onStartCharging={handleOpenChargerModal}
        onRetry={refetch}
        calculateDistance={calculateDistance}
      />

      {/* MODAL */}
      {showChargerModal && stationForCharging && (
        <ChargerSelectionModal
          station={stationForCharging}
          onClose={() => setShowChargerModal(false)}
          onStartCharging={handleStartCharging}
          preSelectedPointId={preSelectedPointId}
        />
      )}
    </div>
  );
}
