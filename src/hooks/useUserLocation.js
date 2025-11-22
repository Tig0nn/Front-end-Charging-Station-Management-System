import { useState, useEffect } from "react";

/**
 * useUserLocation - Hook quản lý vị trí GPS và tâm bản đồ
 * Chức năng: Lấy GPS từ browser, quản lý mapCenter
 */
export const useUserLocation = (defaultCenter = [10.8231, 106.6297]) => {
  const [userLocation, setUserLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState(defaultCenter);

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
        () => {
          console.warn("Không thể lấy vị trí người dùng");
        }
      );
    }
  };

  useEffect(() => {
    getUserLocation();
  }, []);

  return { userLocation, mapCenter, setMapCenter, getUserLocation };
};
