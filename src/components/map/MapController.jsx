import { useEffect } from "react";
import { useMap } from "react-leaflet";

const MapController = ({ center, zoom, shouldResetZoom = false }) => {
  const map = useMap();

  useEffect(() => {
    if (center && shouldResetZoom) {
      // Chỉ reset zoom khi shouldResetZoom = true
      map.setView(center, zoom);
    } else if (center) {
      // Chỉ pan đến vị trí mới, không thay đổi zoom
      map.panTo(center);
    }
  }, [center, zoom, map, shouldResetZoom]);

  return null;
};

export default MapController;
