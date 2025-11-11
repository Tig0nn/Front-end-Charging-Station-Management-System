import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";

const RoutingControl = ({ start, end, onRouteFound }) => {
  const map = useMap();
  const routingControlRef = useRef(null);

  useEffect(() => {
    if (!start || !end || !map) return;

    // Remove existing routing control if any
    if (routingControlRef.current) {
      map.removeControl(routingControlRef.current);
      routingControlRef.current = null;
    }

    // Create routing control
    const routingControl = L.Routing.control({
      waypoints: [L.latLng(start[0], start[1]), L.latLng(end[0], end[1])],
      routeWhileDragging: false,
      showAlternatives: false, // Tắt hiển thị route thay thế để tránh nhấp nháy
      addWaypoints: false,
      fitSelectedRoutes: false, // ⭐ Tắt auto zoom
      show: false, // Ẩn bảng hướng dẫn mặc định
      lineOptions: {
        styles: [
          {
            color: "#10b981", // Màu xanh lá đẹp hơn
            opacity: 0.8,
            weight: 6,
          },
        ],
        extendToWaypoints: true,
        missingRouteTolerance: 0,
      },
      createMarker: function () {
        return null; // Don't create markers for waypoints
      },
      router: L.Routing.osrmv1({
        serviceUrl: "https://router.project-osrm.org/route/v1",
        language: "vi",
      }),
    }).addTo(map);

    // Store reference
    routingControlRef.current = routingControl;

    // Handle route found event
    routingControl.on("routesfound", function (e) {
      const routes = e.routes;
      const summary = routes[0].summary;

      // Convert meters to kilometers
      const distanceInKm = (summary.totalDistance / 1000).toFixed(1);

      // Convert seconds to minutes
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

    // Cleanup function
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
  }, [start, end, map]); // onRouteFound intentionally omitted to prevent re-render

  return null;
};

export default RoutingControl;
