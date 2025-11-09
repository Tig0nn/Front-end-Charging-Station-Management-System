import React, { useState, useEffect } from "react";
import { stationsAPI, chargingPointsAPI } from "../../lib/apiServices";
import { QRCodeSVG } from "qrcode.react";
import toast from "react-hot-toast";
import { Download, Search, MapPin, Zap } from "lucide-react";
import LoadingSpinner from "../../components/loading_spins/LoadingSpinner";

/**
 * Trang Admin: Quản lý và in QR Code cho tất cả trụ sạc
 * Mỗi trụ sạc sẽ có 1 QR code để dán lên trụ thực tế
 */
const QRCodeManager = () => {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Load tất cả stations và charging points
  useEffect(() => {
    loadStationsData();
  }, []);

  const loadStationsData = async () => {
    try {
      setLoading(true);

      // Step 1: Load all stations with details
      const response = await stationsAPI.getAllDetails();

      let stationsData = response?.data?.result || response?.result || [];

      // If stationsData is not an array, try different paths
      if (!Array.isArray(stationsData)) {
        stationsData = response?.data || [];
      }

      // Step 2: For each station, fetch charging points if not included
      const stationsWithChargers = await Promise.all(
        stationsData.map(async (station) => {
          // Check if chargingPoints already exists in response
          let chargingPoints = station.chargingPoints || station.chargers || [];

          // If no charging points, try to fetch them separately
          if (chargingPoints.length === 0 && station.stationId) {
            try {
              const chargersResponse =
                await chargingPointsAPI.getChargersByStation(station.stationId);
              chargingPoints =
                chargersResponse?.data?.result ||
                chargersResponse?.result ||
                [];
              // eslint-disable-next-line no-unused-vars
            } catch (err) {
              console.warn(
                `Could not load chargers for station ${station.stationId}`
              );
            }
          }

          return {
            stationId: station.stationId,
            stationName: station.stationName || station.name,
            address: station.address,
            chargingPoints: chargingPoints,
          };
        })
      );

      setStations(stationsWithChargers);
      setLoading(false);
    } catch (err) {
      console.error("Error loading stations:", err);
      setError(
        "Không thể tải danh sách trạm sạc: " + (err.message || "Unknown error")
      );
      setLoading(false);
    }
  };

  // Filter stations by search term
  const filteredStations = stations.filter(
    (station) =>
      station.stationName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      station.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Download single QR as PNG
  const downloadQR = (point, stationName) => {
    const svg = document.getElementById(`qr-${point.pointId}`);
    if (!svg) {
      console.error("Cannot find SVG element:", `qr-${point.pointId}`);
      toast.error("Không thể tải mã QR. Vui lòng thử lại.");
      return;
    }

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();

    img.onload = () => {
      canvas.width = 400;
      canvas.height = 500;

      // White background
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw QR
      ctx.drawImage(img, 50, 50, 300, 300);

      // Add text
      ctx.fillStyle = "black";
      ctx.font = "bold 20px Arial";
      ctx.textAlign = "center";
      ctx.fillText(stationName, 200, 380);
      ctx.font = "16px Arial";
      ctx.fillText(point.name, 200, 410);
      ctx.font = "14px Arial";
      ctx.fillStyle = "#666";
      ctx.fillText(`ID: ${point.pointId}`, 200, 440);

      // Download
      const link = document.createElement("a");
      link.download = `QR_${point.pointId}_${point.name.replace(
        /\s+/g,
        "_"
      )}.png`;
      link.href = canvas.toDataURL();
      link.click();
    };

    img.onerror = () => {
      console.error("Failed to load SVG as image");
      toast.error("Không thể tạo file ảnh. Vui lòng thử lại.");
    };

    img.src =
      "data:image/svg+xml;base64," +
      btoa(unescape(encodeURIComponent(svgData)));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Lỗi</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={loadStationsData}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Quản lý mã QR trụ sạc
          </h1>
          <p className="text-gray-600">
            Tạo và in mã QR để dán lên các trụ sạc thực tế
          </p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Tìm trạm sạc..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <MapPin className="text-blue-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Tổng trạm</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stations.length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Zap className="text-green-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Tổng trụ sạc</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stations.reduce(
                    (sum, s) => sum + s.chargingPoints.length,
                    0
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stations List */}
        <div className="space-y-6">
          {filteredStations.map((station) => (
            <div
              key={station.stationId}
              className="bg-white rounded-xl shadow-lg overflow-hidden"
            >
              {/* Station Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">
                      {station.stationName}
                    </h2>
                    <p className="text-blue-100 flex items-center gap-2">
                      <MapPin size={16} />
                      {station.address}
                    </p>
                  </div>
                </div>
              </div>

              {/* Charging Points */}
              <div className="p-6">
                {!station.chargingPoints ||
                station.chargingPoints.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    Chưa có trụ sạc nào
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {station.chargingPoints.map((point) => {
                      // 🆕 UPDATE: Include stationId in QR URL
                      const qrUrl = `${window.location.origin}/driver/map?pointId=${point.pointId}&stationId=${station.stationId}`;

                      return (
                        <div
                          key={point.pointId}
                          className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-500 transition-colors"
                        >
                          {/* QR Code */}
                          <div className="bg-white p-4 rounded-lg mb-4 flex justify-center">
                            <QRCodeSVG
                              id={`qr-${point.pointId}`}
                              value={qrUrl}
                              size={180}
                              level="H"
                              includeMargin={true}
                            />
                          </div>

                          {/* Point Info */}
                          <div className="text-center mb-4">
                            <h3 className="font-semibold text-gray-900 mb-1">
                              {point.name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {point.chargingPower}
                            </p>
                            <p className="text-xs text-gray-500 mt-1 font-mono">
                              ID: {point.pointId}
                            </p>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                downloadQR(point, station.stationName)
                              }
                              className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                            >
                              <Download size={16} />
                              Tải xuống
                            </button>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(qrUrl);
                                toast.success("Đã sao chép link!");
                              }}
                              className="px-3 py-2 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300 transition-colors"
                              title="Copy link"
                            >
                              📋
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredStations.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Không tìm thấy trạm sạc nào</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRCodeManager;
