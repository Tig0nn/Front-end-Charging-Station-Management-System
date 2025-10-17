import React, { useState, useEffect } from "react";
import { stationsAPI } from "../lib/apiServices";

const NearbyStations = ({ limit = 2 }) => {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStations = async () => {
    try {
      setLoading(true);
      const response = await stationsAPI.getAll();
      // Get stations data
      let stationsData = [];
      if (response.data?.result) {
        stationsData = response.data.result;
      } else if (Array.isArray(response.data)) {
        stationsData = response.data;
      }
      // Nếu không có dữ liệu thực tế, dùng mock data
      if (!stationsData || stationsData.length === 0) {
        setStations([
          {
            stationId: "1",
            stationName: "Vincom Đồng Khởi",
            address: "72 Lê Thánh Tôn, Q.1",
            availableChargers: 2,
            totalChargers: 4,
            pricePerKWh: 3500,
            distance: 0.5,
            chargerTypes: ["CCS", "CHAdeMO"],
          },
          {
            stationId: "2",
            stationName: "Landmark 81",
            address: "720A Điện Biên Phủ, Q.Bình Thạnh",
            availableChargers: 1,
            totalChargers: 6,
            pricePerKWh: 3200,
            distance: 2.1,
            chargerTypes: ["CCS"],
          },
        ]);
      } else {
        setStations(stationsData.slice(0, limit));
      }
    } catch (err) {
      console.error("❌ Error fetching stations:", err);
      // Use fallback mock data if API fails
      setStations([
        {
          stationId: "1",
          stationName: "Vincom Đồng Khởi",
          address: "72 Lê Thánh Tôn, Q.1",
          availableChargers: 2,
          totalChargers: 4,
          pricePerKWh: 3500,
          distance: 0.5,
          chargerTypes: ["CCS", "CHAdeMO"],
        },
        {
          stationId: "2",
          stationName: "Landmark 81",
          address: "720A Điện Biên Phủ, Q.Bình Thạnh",
          availableChargers: 1,
          totalChargers: 6,
          pricePerKWh: 3200,
          distance: 2.1,
          chargerTypes: ["CCS"],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 rounded-2xl">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded-xl"></div>
          <div className="h-32 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Trạm sạc gần đây
      </h2>

      {stations.map((station) => (
        <div
          key={station.stationId}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
        >
          {/* Header with station name and availability counter */}
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-xl font-bold text-gray-900">
              {station.stationName}
            </h3>
            <div className="bg-gray-900 text-white text-sm font-semibold px-3 py-1 rounded-full">
              {station.availableChargers || 0}/{station.totalChargers || 0}
            </div>
          </div>

          {/* Address */}
          <p className="text-gray-600 mb-4">{station.address}</p>

          {/* Distance and Price */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center text-gray-700">
              <svg
                className="w-5 h-5 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span className="text-sm font-medium">
                {station.distance || "N/A"} km
              </span>
            </div>
            <div className="text-lg font-bold text-gray-900">
              {station.pricePerKWh?.toLocaleString() || "N/A"}đ/kWh
            </div>
          </div>

          {/* Charger Types */}
          <div className="flex gap-2 mb-4">
            {station.chargerTypes?.map((type, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg"
              >
                {type}
              </span>
            )) || (
              <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg">
                CCS
              </span>
            )}
          </div>

          {/* Charge Button */}
          <button className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
            </svg>
            Sạc
          </button>
        </div>
      ))}
    </div>
  );
};

export default NearbyStations;
