import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import {
  MapPinIcon,
  MapIcon,
  CheckBadgeIcon,
  XCircleIcon,
} from "@heroicons/react/24/solid";
import RoutingControl from "../RoutingControl";
import MapController from "./MapController";

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

// Component để zoom đến station khi click
const ZoomToStation = ({ station }) => {
  const map = useMap();

  useEffect(() => {
    if (station) {
      // Sử dụng flyTo để có animation mượt mà
      map.flyTo([station.latitude, station.longitude], 18, {
        duration: 0.5, // Animation 0.5 giây
      });
    }
  }, [station, map]);

  return null;
};

const MapView = ({
  mapCenter,
  userLocation,
  stations,
  showRoute,
  routeDestination,
  selectedStation,
  onStationClick,
  onShowDirections,
  onRouteFound,
}) => {
  const getStatusDisplay = (status) => {
    const statusConfig = {
      OPERATIONAL: { text: "Hoạt động", className: "text-green-600" },
      MAINTENANCE: { text: "Bảo trì", className: "text-yellow-600" },
      OUT_OF_SERVICE: { text: "Tạm ngưng", className: "text-red-600" },
      CLOSED: { text: "Đóng cửa", className: "text-red-600" },
    };
    return statusConfig[status] || statusConfig.CLOSED;
  };

  return (
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

      {/* MapController không còn tự động reset zoom */}
      <MapController center={mapCenter} zoom={13} shouldResetZoom={false} />

      {/* Zoom to selected station */}
      {selectedStation && <ZoomToStation station={selectedStation} />}

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
      {stations.map((station) => {
        if (!station.latitude || !station.longitude) return null;

        const statusDisplay = getStatusDisplay(station.status);

        return (
          <Marker
            key={station.stationId}
            position={[station.latitude, station.longitude]}
            icon={stationIcon}
            eventHandlers={{
              click: () => {
                onStationClick(station);
              },
            }}
          >
            <Popup className="custom-popup" maxWidth={300}>
              <div className="popup-content-inner">
                <h3 className="popup-title">{station.stationName}</h3>
                <div className="popup-content">
                  <p>
                    <strong>
                      <i
                        className="bi bi-geo-alt-fill"
                        style={{ marginRight: "6px" }}
                      ></i>
                      Địa chỉ:
                    </strong>{" "}
                    {station.address}
                  </p>
                  <p>
                    <strong>
                      <i
                        className="bi bi-telephone-fill"
                        style={{ marginRight: "6px" }}
                      ></i>
                      Hotline:
                    </strong>{" "}
                    {station.hotline || "N/A"}
                  </p>
                  <p>
                    <strong>
                      <i
                        className="bi bi-tags-fill"
                        style={{ marginRight: "6px" }}
                      ></i>
                      Trạng thái:
                    </strong>{" "}
                    <span className={statusDisplay.className}>
                      {statusDisplay.text}
                    </span>
                  </p>

                  {/* Trụ sạc sẵn sàng */}
                  <p>
                    <strong>
                      <i
                        className="bi bi-lightning-charge-fill"
                        style={{ marginRight: "6px", color: "#10b981" }}
                      ></i>
                      Trụ đang rảnh:
                    </strong>{" "}
                    <span
                      style={{
                        color:
                          (station.availableChargingPoints || 0) > 0
                            ? "#10b981"
                            : "#ef4444",
                        fontWeight: "600",
                        fontSize: "16px",
                      }}
                    >
                      {station.availableChargingPoints || 0}
                    </span>
                  </p>

                  {/* 2. Dòng hiển thị tổng số trụ */}
                  <p>
                    <strong>
                      {/* Bạn có thể dùng icon khác nếu muốn, ví dụ: bi-hdd-stack-fill */}
                      <i
                        className="bi bi-diagram-3-fill"
                        style={{ marginRight: "6px", color: "#6b7280" }}
                      ></i>
                      Tổng số trụ:
                    </strong>{" "}
                    <span
                      style={{
                        fontWeight: "600",
                        fontSize: "16px",
                      }}
                    >
                      {/* Dùng logic này để lấy tổng số trụ chính xác:
                    Ưu tiên totalChargingPoints, nếu nó = 0 (như trong log) thì dùng chargingPointsCount 
                  */}
                      {(station.totalChargingPoints > 0
                        ? station.totalChargingPoints
                        : station.chargingPointsCount) || 0}
                    </span>
                  </p>

                  {/* Nhân viên phụ trách */}
                  {station.staffName && (
                    <p>
                      <strong>
                        <i
                          className="bi bi-person-fill"
                          style={{ marginRight: "6px" }}
                        ></i>
                        Nhân viên:
                      </strong>{" "}
                      {station.staffName}
                    </p>
                  )}
                </div>
                <button
                  className="popup-button"
                  onClick={() => onShowDirections(station)}
                  style={{ marginTop: "12px" }}
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
          onRouteFound={onRouteFound}
        />
      )}
    </MapContainer>
  );
};

export default MapView;
