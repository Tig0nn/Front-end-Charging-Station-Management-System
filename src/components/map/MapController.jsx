import { useEffect } from "react";
import { useMap } from "react-leaflet";

/**
 * MapController - Điều khiển map programmatic (pan/zoom)
 * Chức năng: Di chuyển và zoom bản đồ bằng code
 */
const MapController = ({ center, zoom, shouldResetZoom = false }) => {
  const map = useMap();

  useEffect(() => {
    if (center && shouldResetZoom) {
      map.setView(center, zoom); // Reset cả vị trí và zoom
    } else if (center) {
      map.panTo(center); // Chỉ di chuyển, giữ nguyên zoom
    }
  }, [center, zoom, map, shouldResetZoom]);

  return null;
};

export default MapController;
