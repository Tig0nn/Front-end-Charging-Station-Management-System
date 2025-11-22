import { useState, useEffect } from "react";

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
        (error) => {
          console.warn("Could not get user location:", error);
        }
      );
    }
  };

  useEffect(() => {
    getUserLocation();
  }, []);

  return { userLocation, mapCenter, setMapCenter, getUserLocation };
};
