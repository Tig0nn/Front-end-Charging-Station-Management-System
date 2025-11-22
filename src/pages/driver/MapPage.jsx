import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "leaflet/dist/leaflet.css";
import "./MapPage.css";

import ChargerSelectionModal from "../../components/ChargerSelectionModal";
import {
  StationList,
  MapView,
  MapControls,
  RouteInfoPanel,
} from "../../components/map";
import LoadingSpinner from "../../components/loading_spins/LoadingSpinner.jsx";

import { useStations } from "../../hooks/useStations";
import { useUserLocation } from "../../hooks/useUserLocation";
import { calculateDistance } from "../../lib/geoUtils";
import { chargingPointsAPI } from "../../lib/apiServices";

/**
 * MapPage - Trang bản đồ trạm sạc
 * Chức năng: Hiển thị map, search trạm, chỉ đường, QR scan, bắt đầu sạc
 */
export default function MapPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Hooks
  const { stations, loading, error, refetch } = useStations();
  const { userLocation, mapCenter, setMapCenter, getUserLocation } =
    useUserLocation();

  // State
  const [selectedStation, setSelectedStation] = useState(null);
  const [showChargerModal, setShowChargerModal] = useState(false);
  const [stationForCharging, setStationForCharging] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [showRoute, setShowRoute] = useState(false);
  const [routeDestination, setRouteDestination] = useState(null);
  
  // Từ khóa search trạm
  const [searchQuery, setSearchQuery] = useState("");
  
  // ID trụ sạc được pre-select (từ QR code)
  const [preSelectedPointId, setPreSelectedPointId] = useState(null);

  /**
   * ===== EFFECT 1: KIỂM TRA SESSION ĐANG HOẠT ĐỘNG =====
   * Ngăn user mở nhiều phiên sạc cùng lúc
   * Nếu đang có session -> Chuyển hướng về trang session
   */
  useEffect(() => {
    const activeId = localStorage.getItem("currentSessionId");
    if (activeId) {
      alert("Bạn có một phiên sạc đang hoạt động. Đang chuyển hướng...");
      navigate(`/driver/session/${activeId}`, { replace: true });
    }
  }, [navigate]);

  /**
   * ===== EFFECT 2: XỬ LÝ QR CODE TỪ URL =====
   * 
   * Flow QR Code:
   * 1. User quét QR trên trụ sạc
   * 2. QR chứa URL: /map?pointId=xxx&stationId=yyy
   * 3. Parse URL params
   * 4. Tìm trạm theo stationId
   * 5. Pre-select trụ sạc theo pointId
   * 6. Mở modal để user chọn xe và targetSOC
   * 7. Xóa params khỏi URL
   */
  useEffect(() => {
    const pointId = searchParams.get("pointId");
    const stationId = searchParams.get("stationId");

    // Chỉ xử lý khi có pointId và đã load xong stations
    if (pointId && stations.length > 0) {
      // Tìm trạm theo stationId
      let targetStation = stationId
        ? stations.find((s) => s.stationId === stationId)
        : null;

      if (targetStation) {
        // Lưu pointId để pre-select trong modal
        setPreSelectedPointId(pointId);
        
        // Set trạm để mở modal
        setStationForCharging(targetStation);
        
        // Mở modal chọn trụ
        setShowChargerModal(true);
        
        // Xóa params khỏi URL (cleanup)
        setSearchParams({});
      }
    }
  }, [searchParams, stations, setSearchParams]);

  /**
   * ===== HANDLER: BẮT ĐẦU PHIÊN SẠC =====
   * Được gọi từ ChargerSelectionModal khi user chọn:
   * - Trụ sạc (charger)
   * - Xe (vehicle)
   * - Mức pin mục tiêu (targetSoc)
   * 
   * @param {Object} charger - Trụ sạc được chọn
   * @param {string} vehicle - ID của xe
   * @param {number} targetSoc - % pin mục tiêu (0-100)
   */
  const handleStartCharging = async (charger, vehicle, targetSoc) => {
    try {
      // Đóng modal
      setShowChargerModal(false);
      
      // Hiển thị toast loading
      const loadingToast = toast.loading("Đang khởi động phiên sạc...");

      // Gọi API start charging
      const response = await chargingPointsAPI.startCharging({
        chargingPointId: charger.pointId,
        vehicleId: vehicle,
        targetSocPercent: targetSoc,
      });

      // Parse sessionId từ response
      const sessionId = response.data?.result?.sessionId;
      
      if (sessionId) {
        // Dismiss loading toast
        toast.dismiss(loadingToast);
        
        // Hiển thị success toast
        toast.success("Khởi động phiên sạc thành công!");
        
        // Lưu sessionId vào localStorage
        localStorage.setItem("activeSessionId", sessionId);
        
        // Chuyển hướng đến trang session để theo dõi
        navigate(`/driver/session/${sessionId}`);
      } else {
        throw new Error("Không nhận được ID phiên sạc.");
      }
    } catch (err) {
      // Dismiss mọi toast
      toast.dismiss();
      
      // Hiển thị error
      toast.error(`Lỗi: ${err.response?.data?.message || err.message}`);
    }
  };

  /**
   * ===== HANDLER: MỞ MODAL CHỌN TRỤ SẠC =====
   * Được gọi khi user nhấn nút "Sạc ngay"
   * 
   * @param {Object} station - Trạm sạc được chọn
   */
  const handleOpenChargerModal = (station) => {
    // Kiểm tra xem có session đang hoạt động không
    if (localStorage.getItem("currentSessionId")) {
      alert("Bạn đang trong một phiên sạc.");
      return;
    }
    
    // Set trạm và mở modal
    setStationForCharging(station);
    setShowChargerModal(true);
  };

  /**
   * ===== HANDLER: HIỂN THỊ ĐƯỜNG DẪN =====
   * Được gọi khi user nhấn nút "Chỉ đường"
   * 
   * Flow:
   * 1. Kiểm tra có GPS không
   * 2. Kiểm tra trạm có tọa độ không
   * 3. Set destination và bật showRoute
   * 4. RoutingControl sẽ vẽ đường đi
   * 5. OSRM API tính toán và trả về routeInfo
   * 
   * @param {Object} station - Trạm cần chỉ đường đến
   */
  const handleShowDirections = (station) => {
    // Kiểm tra GPS
    if (!userLocation) {
      return alert("Vui lòng bật GPS để dùng tính năng này.");
    }
    
    // Kiểm tra tọa độ trạm
    if (!station.latitude) {
      return alert("Trạm không có tọa độ.");
    }

    // Set destination (tọa độ trạm)
    setRouteDestination([station.latitude, station.longitude]);
    
    // Bật hiển thị route
    setShowRoute(true);
    
    // Highlight trạm
    setSelectedStation(station);
  };

  /**
   * ===== RENDER: LOADING STATE =====
   * Hiển thị spinner khi đang fetch stations
   */
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

  /**
   * ===== RENDER: MAIN UI =====
   */
  return (
    <div className="map-page-container">
      {/* Toast notifications container */}
      <ToastContainer position="top-right" autoClose={3000} />

      {/* 
        ===== LEFT SIDE: BẢN ĐỒ =====
      */}
      <div className="map-container">
        {/* Header với search bar */}
        <div className="map-header">
          <div className="d-flex align-items-center justify-content-between gap-3">
            {/* Tiêu đề */}
            <div className="d-flex align-items-center gap-2">
              <i
                className="bi bi-geo-alt text-green-600"
                style={{ fontSize: "20px" }}
              ></i>
              <h2 className="mb-0 text-lg font-semibold">Bản đồ trạm sạc</h2>
            </div>

            {/* Search input */}
            <div className="map-search-container">
              <i className="bi bi-search map-search-icon"></i>
              <input
                type="text"
                placeholder="Tìm kiếm trạm sạc..."
                className="map-search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {/* Nút xóa search (chỉ hiện khi có text) */}
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

        {/* 
          Component MapView: Render Leaflet map
          Props truyền xuống:
          - mapCenter: Tâm bản đồ
          - userLocation: Vị trí GPS user
          - stations: Danh sách trạm
          - showRoute: Có vẽ route không
          - routeDestination: Tọa độ đích
          - selectedStation: Trạm đang chọn
          - Callbacks: onStationClick, onShowDirections, onRouteFound
        */}
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

        {/* 
          MapControls: Các nút floating (GPS, Refresh, Clear Route)
          Vị trí: Góc phải trên bản đồ
        */}
        <MapControls
          showRoute={showRoute}
          onGetUserLocation={getUserLocation}  // Từ useUserLocation hook
          onRefresh={refetch}                  // Từ useStations hook
          onClearRoute={() => {
            setShowRoute(false);
            setRouteDestination(null);
            setRouteInfo(null);
          }}
        />

        {/* 
          RouteInfoPanel: Hiển thị khoảng cách & thời gian
          Chỉ hiện khi showRoute = true
        */}
        {showRoute && <RouteInfoPanel routeInfo={routeInfo} />}
      </div>

      {/* 
        ===== RIGHT SIDE: SIDEBAR DANH SÁCH TRẠM =====
      */}
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
