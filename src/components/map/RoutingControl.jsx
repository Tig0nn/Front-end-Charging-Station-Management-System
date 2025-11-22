import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";

/**
 * RoutingControl - Vẽ đường đi trên bản đồ sử dụng OSRM
 * Chức năng: Tính route tối ưu, vẽ đường đi, trả về khoảng cách & thời gian
 */
const RoutingControl = ({ start, end, onRouteFound }) => {
  const map = useMap();
  const routingControlRef = useRef(null);

  useEffect(() => {
    if (!start || !end || !map) return;

    // Xóa routing control cũ (nếu có)
    if (routingControlRef.current) {
      map.removeControl(routingControlRef.current);
      routingControlRef.current = null;
    }

    // Tạo routing control mới
    const routingControl = L.Routing.control({
      waypoints: [L.latLng(start[0], start[1]), L.latLng(end[0], end[1])],
      routeWhileDragging: false,
      showAlternatives: false,
      addWaypoints: false,
      fitSelectedRoutes: false,
      show: false,
      lineOptions: {
        styles: [
          {
            color: "#10b981",
            opacity: 0.8,
            weight: 6,
          },
        ],
        extendToWaypoints: true,
        missingRouteTolerance: 0,
      },
      createMarker: function () {
        return null; // Không tạo marker (đã có marker riêng)
      },
      router: L.Routing.osrmv1({
        serviceUrl: "https://router.project-osrm.org/route/v1",
        language: "vi",
      }),
    }).addTo(map);

    routingControlRef.current = routingControl;

    // Event: Khi tìm thấy route
    routingControl.on("routesfound", function (e) {
      const routes = e.routes;
      const summary = routes[0].summary;

      const distanceInKm = (summary.totalDistance / 1000).toFixed(1);
      const timeInMinutes = Math.round(summary.totalTime / 60);

      if (onRouteFound) {
        onRouteFound({
          distance: distanceInKm,
          duration: timeInMinutes,
        });
      }

      console.log("📍 Route found:", {
        distance: `${distanceInKm} km`,
        duration: `${timeInMinutes} phút`,
      });
    });

    // Cleanup: Xóa control khi component unmount hoặc route thay đổi
    return () => {
      if (map && routingControlRef.current) {
        try {
          map.removeControl(routingControlRef.current);
        } catch {
          console.log("Routing control already removed");
        }
        routingControlRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [start, end, map]);

  return null;
};

export default RoutingControl;
