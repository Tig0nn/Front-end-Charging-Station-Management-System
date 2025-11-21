import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "leaflet/dist/leaflet.css";
import "./MapPage.css";
import { stationsAPI, chargingPointsAPI } from "../../lib/apiServices.js";
import ChargerSelectionModal from "../../components/ChargerSelectionModal";

import {
  StationList,
  MapView,
  MapControls,
  RouteInfoPanel,
} from "../../components/map";
import LoadingSpinner from "../../components/loading_spins/LoadingSpinner.jsx";

export default function MapPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
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
  const [preSelectedPointId, setPreSelectedPointId] = useState(null); // For QR code flow

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

  // --- 🆕 HANDLE QR CODE FLOW ---
  useEffect(() => {
    const pointId = searchParams.get("pointId");
    const stationId = searchParams.get("stationId");

    if (pointId && stations.length > 0) {
      console.log(
        "🔍 QR Code detected! pointId:",
        pointId,
        "stationId:",
        stationId
      );

      // Tìm station chứa charging point này
      let targetStation = null;

      if (stationId) {
        // Nếu có stationId từ QR, tìm trực tiếp
        targetStation = stations.find((s) => s.stationId === stationId);
      }

      if (targetStation) {
        console.log("✅ Found station from QR:", targetStation);
        setPreSelectedPointId(pointId);
        setStationForCharging(targetStation);
        setShowChargerModal(true);

        // Clear URL params sau khi xử lý
        setSearchParams({});
      } else {
        console.warn("⚠️ Station not found for pointId:", pointId);
        alert("Không tìm thấy trạm sạc. Vui lòng thử lại.");
        setSearchParams({});
      }
    }
  }, [searchParams, stations, setSearchParams]);

  const fetchStations = async () => {
    try {
      setLoading(true);
      const response = await stationsAPI.getAllDetails();
      console.log(" Stations API response:", response);

      let stationsData = [];
      if (response.data?.result && Array.isArray(response.data.result)) {
        stationsData = response.data.result;
      } else if (response.result && Array.isArray(response.result)) {
        stationsData = response.result;
      } else if (Array.isArray(response.data)) {
        stationsData = response.data;
      }

      console.log(" Parsed stations data:", stationsData);

      // --- 💡 HELPER FUNCTION ĐỂ LẤY TỔNG SỐ TRỤ TỪ CHUỖI SUMMARY ---
      // Ví dụ: "T:8 | H:8 | Đ:0 | B:0" -> trả về 8
      const getTotalFromSummary = (summary) => {
        if (!summary) return 0;
        const totalMatch = summary.match(/T:(\d+)/); // Tìm chuỗi "T:" theo sau là số
        if (totalMatch && totalMatch[1]) {
          return parseInt(totalMatch[1], 10) || 0;
        }
        return 0;
      };
      // -----------------------------------------------------------

      const mappedStations = stationsData.map((station) => {
        // --- 💡 LOGIC LẤY TỔNG SỐ TRỤ MỚI ---
        let realTotal = 0;
        if (station.totalChargingPoints > 0) {
          // 1. Ưu tiên totalChargingPoints nếu nó đúng (lớn hơn 0)
          realTotal = station.totalChargingPoints;
        } else if (station.chargingPointsCount > 0) {
          // 2. Ưu tiên chargingPointsCount nếu nó đúng
          realTotal = station.chargingPointsCount;
        } else {
          // 3. Phương án cuối: Lấy từ chuỗi summary "T:8"
          realTotal = getTotalFromSummary(station.chargingPointsSummary);
        }
        // -----------------------------------

        // Map backend fields to frontend fields
        return {
          stationId: station.stationId,
          stationName: station.name,
          address: station.address,
          latitude: station.latitude,
          longitude: station.longitude,
          status: station.status,

          // --- 💡 ÁP DỤNG GIÁ TRỊ "realTotal" ĐÚNG VÀO ĐÂY ---
          chargingPointsCount: realTotal,
          totalChargingPoints: realTotal,
          availableChargingPoints: station.availableChargingPoints || 0, // Trụ trống (đã trừ trụ đang sạc)
          activeChargingPoints: station.activeChargingPoints || 0, // Trụ hoạt động (trừ bảo trì, offline)
          // -------------------------------------------------

          offlineChargingPoints: station.offlineChargingPoints || 0,
          maintenanceChargingPoints: station.maintenanceChargingPoints || 0,
          chargingPointsSummary: station.chargingPointsSummary || "",

          // Legacy fields (cũng cập nhật luôn)
          totalChargers: realTotal,
          availableChargers: station.availableChargingPoints || 0, // Sử dụng availableChargingPoints

          // Thông tin bổ sung
          revenue: station.revenue || 0,
          usagePercent: station.usagePercent || 0,
          staffId: station.staffId,
          staffName: station.staffName,

          // Thông tin liên hệ
          pricePerKwh: "3,500đ/kWh",
          hotline: station.contactPhone || "N/A",
          contactPhone: station.contactPhone,
          operatorName: station.operatorName,
          email: station.operatorName
            ? `${station.operatorName}@email.com`
            : "N/A",
        };
      });

      setStations(mappedStations);
      setError(null);

      console.log(` Loaded ${mappedStations.length} stations`);
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
      const loadingToast = toast.loading("Đang khởi động phiên sạc...");

      const response = await chargingPointsAPI.startCharging(payload);

      // 4. Lấy sessionId từ kết quả trả về
      const sessionId = response.data?.result?.sessionId;

      console.log("4. API Response thành công:", response.data);
      console.log("5. Trích xuất sessionId:", sessionId);

      if (sessionId) {
        console.log(
          `6. Thành công! Đang điều hướng đến /driver/session/${sessionId}`
        );

        toast.dismiss(loadingToast);
        toast.success(" Khởi động phiên sạc thành công!");

        localStorage.setItem("activeSessionId", sessionId);
        navigate(`/driver/session/${sessionId}`);
      } else {
        throw new Error("Không nhận được ID phiên sạc từ máy chủ.");
      }
    } catch (err) {
      console.error("❌ LỖI khi bắt đầu phiên sạc:", err);
      toast.error(
        `❌ Không thể bắt đầu phiên sạc: ${
          err.response?.data?.message || err.message
        }`
      );
    }
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

  const handleStationClick = (station) => {
    setSelectedStation(station);
    // Có thể thêm zoom tới station ở đây nếu cần
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
          <LoadingSpinner />
          <p className="loading-text"> Đang tải bản đồ trạm sạc...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="map-page-container">
      <ToastContainer position="top-right" autoClose={3000} />
      {/* Map Container - Bên trái */}
      <div className="map-container">
        {/* Header cho Map với thanh tìm kiếm */}
        <div className="map-header">
          <div className="d-flex align-items-center justify-content-between gap-3">
            {/* Tiêu đề */}
            <div className="d-flex align-items-center gap-2">
              <i
                className="bi bi-geo-alt"
                style={{ fontSize: "20px", color: "#10b981" }}
              ></i>
              <h2
                className="mb-0"
                style={{ fontSize: "18px", fontWeight: "600" }}
              >
                Bản đồ trạm sạc
              </h2>
            </div>

            {/* Thanh tìm kiếm */}
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
                  aria-label="Xóa tìm kiếm"
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

      {/* Station List Sidebar - Bên phải */}
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

      {/* Charger Selection Modal */}
      {showChargerModal && stationForCharging && (
        <ChargerSelectionModal
          station={stationForCharging}
          onClose={handleCloseChargerModal}
          onStartCharging={handleStartCharging}
          preSelectedPointId={preSelectedPointId}
        />
      )}
    </div>
  );
}
