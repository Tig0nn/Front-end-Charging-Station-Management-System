import { useState, useEffect, useCallback } from "react";
import { stationsAPI } from "../lib/apiServices";

export const useStations = () => {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStations = useCallback(async () => {
    try {
      setLoading(true);
      const response = await stationsAPI.getAllDetails();

      let stationsData = [];
      if (response.data?.result && Array.isArray(response.data.result)) {
        stationsData = response.data.result;
      } else if (response.result && Array.isArray(response.result)) {
        stationsData = response.result;
      } else if (Array.isArray(response.data)) {
        stationsData = response.data;
      }

      // Helper: Lấy tổng từ chuỗi summary "T:8 | H:8..."
      const getTotalFromSummary = (summary) => {
        if (!summary) return 0;
        const totalMatch = summary.match(/T:(\d+)/);
        return totalMatch && totalMatch[1] ? parseInt(totalMatch[1], 10) : 0;
      };

      const mappedStations = stationsData.map((station) => {
        // Logic ưu tiên lấy tổng số trụ
        let realTotal = 0;
        if (station.totalChargingPoints > 0) {
          realTotal = station.totalChargingPoints;
        } else if (station.chargingPointsCount > 0) {
          realTotal = station.chargingPointsCount;
        } else {
          realTotal = getTotalFromSummary(station.chargingPointsSummary);
        }

        return {
          ...station, // Giữ lại các field gốc
          stationId: station.stationId,
          stationName: station.name, // Map name -> stationName cho thống nhất UI

          // Các field tính toán lại
          chargingPointsCount: realTotal,
          totalChargingPoints: realTotal,
          availableChargingPoints: station.availableChargingPoints || 0,
          activeChargingPoints: station.activeChargingPoints || 0,

          // Default info
          pricePerKwh: "3,500đ/kWh",
          hotline: station.contactPhone || "N/A",
          email: station.operatorName
            ? `${station.operatorName}@email.com`
            : "N/A",
        };
      });

      setStations(mappedStations);
      setError(null);
    } catch (err) {
      console.error("Error fetching stations:", err);
      setError("Không thể tải danh sách trạm sạc");
      setStations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStations();
  }, [fetchStations]);

  return { stations, loading, error, refetch: fetchStations };
};
