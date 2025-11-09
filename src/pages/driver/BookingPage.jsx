import React, { useState, useEffect } from "react";
import apiServices from "../../lib/apiServices";

const BookingPage = () => {
  // States
  const [bookingTime, setBookingTime] = useState("");
  const [vehicles, setVehicles] = useState([]);
  const [stations, setStations] = useState([]);
  const [chargers, setChargers] = useState([]);

  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [selectedStation, setSelectedStation] = useState("");
  const [selectedCharger, setSelectedCharger] = useState("");
  const [desiredPercentage, setDesiredPercentage] = useState(80);

  const [searchResults, setSearchResults] = useState(null);
  const [availabilityMessage, setAvailabilityMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Get minimum datetime (now)
  const getMinDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Get maximum datetime (24 hours from now)
  const getMaxDateTime = () => {
    const max = new Date();
    max.setHours(max.getHours() + 24);
    const year = max.getFullYear();
    const month = String(max.getMonth() + 1).padStart(2, "0");
    const day = String(max.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}T23:59`;
  };

  // Load initial data
  useEffect(() => {
    loadVehicles();
    loadStations();
    // Set default datetime to now + 1 hour
    const defaultTime = new Date();
    defaultTime.setHours(defaultTime.getHours() + 1);
    const formatted = defaultTime.toISOString().slice(0, 16);
    setBookingTime(formatted);
  }, []);

  const loadVehicles = async () => {
    try {
      const response = await apiServices.vehicles.getMyVehicles();
      setVehicles(response?.data?.result || response?.result || []);
    } catch (err) {
      console.error("Error loading vehicles:", err);
    }
  };

  const loadStations = async () => {
    try {
      const response = await apiServices.stations.getStation();
      setStations(response?.data?.result || response?.result || []);
    } catch (err) {
      console.error("Error loading stations:", err);
    }
  };

  const loadChargers = async (stationId) => {
    try {
      setLoading(true);
      const response = await apiServices.chargingPoints.getChargersByStation(
        stationId
      );
      setChargers(response?.data?.result || response?.result || []);
    } catch (err) {
      console.error("Error loading chargers:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStationChange = (stationId) => {
    setSelectedStation(stationId);
    setSelectedCharger("");
    setChargers([]);
    if (stationId) {
      loadChargers(stationId);
    }
  };

  const handleSearch = () => {
    if (!bookingTime || !selectedVehicle || !selectedStation) {
      alert("Vui lòng chọn đầy đủ: Ngày giờ, Xe, và Trạm sạc");
      return;
    }
    setSearchResults({ searched: true });
  };

  const checkAvailability = async () => {
    if (!selectedCharger || !bookingTime || !selectedVehicle) return;

    try {
      setLoading(true);
      const bookingDateTime = new Date(bookingTime).toISOString();

      // Fix: Use string ID directly (no more uuidToHash)
      const response = await apiServices.bookings.checkAvailability(
        selectedCharger,
        bookingDateTime,
        selectedVehicle
      );

      if (response?.data?.available || response?.available) {
        const message = response?.data?.message || response?.message || "";
        setAvailabilityMessage(`✅ Trạm khả dụng! ${message}`);
      } else {
        setAvailabilityMessage("❌ Trạm đã được đặt trong thời gian này");
      }
    } catch (err) {
      setAvailabilityMessage("❌ Không thể kiểm tra tình trạng");
      console.error("Error checking availability:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCharger && bookingTime && selectedVehicle) {
      checkAvailability();
    } else {
      setAvailabilityMessage("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCharger, bookingTime, selectedVehicle]);

  const handleBooking = async () => {
    if (!selectedVehicle || !selectedCharger || !bookingTime) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    if (!availabilityMessage.includes("✅")) {
      alert("Trạm không khả dụng!");
      return;
    }

    try {
      setLoading(true);
      const bookingData = {
        vehicleId: selectedVehicle,
        chargingPointId: selectedCharger, // Now using string ID directly
        bookingTime: new Date(bookingTime).toISOString(),
        desiredPercentage: parseInt(desiredPercentage),
      };

      await apiServices.bookings.createBooking(bookingData);
      alert("✅ Đặt chỗ thành công! Tiền cọc 50,000 VNĐ đã được trừ từ ví.");

      // Reset form
      setSearchResults(null);
      setSelectedCharger("");
      setAvailabilityMessage("");
      setDesiredPercentage(80);
    } catch (err) {
      console.error("Error creating booking:", err);
      const errorMsg =
        err?.response?.data?.message || err?.message || "Lỗi không xác định";
      alert("❌ Đặt chỗ thất bại! " + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-600 to-blue-800">
      {/* Hero Section - Booking.com style */}
      <div className="text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-3">Đặt chỗ sạc xe điện</h1>
          <p className="text-xl">
            Tìm và đặt trước trụ sạc tại các trạm trên toàn quốc
          </p>
        </div>
      </div>

      {/* Search Bar - Booking.com style */}
      <div className="max-w-6xl mx-auto px-4 -mt-6">
        <div className="bg-yellow-400 rounded-lg shadow-2xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Date & Time */}
            <div className="bg-white rounded p-3">
              <label className="text-xs font-semibold text-gray-600 block mb-1">
                <i className="bi bi-calendar3"></i> Ngày giờ đặt chỗ
              </label>
              <input
                type="datetime-local"
                className="w-full border-0 focus:outline-none text-sm"
                value={bookingTime}
                onChange={(e) => setBookingTime(e.target.value)}
                min={getMinDateTime()}
                max={getMaxDateTime()}
              />
            </div>

            {/* Vehicle */}
            <div className="bg-white rounded p-3">
              <label className="text-xs font-semibold text-gray-600 block mb-1">
                <i className="bi bi-car-front"></i> Xe của bạn
              </label>
              <select
                className="w-full border-0 focus:outline-none text-sm"
                value={selectedVehicle}
                onChange={(e) => setSelectedVehicle(e.target.value)}
              >
                <option value="">Chọn xe</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.licensePlate} - {v.model}
                  </option>
                ))}
              </select>
            </div>

            {/* Station */}
            <div className="bg-white rounded p-3">
              <label className="text-xs font-semibold text-gray-600 block mb-1">
                <i className="bi bi-geo-alt"></i> Trạm sạc
              </label>
              <select
                className="w-full border-0 focus:outline-none text-sm"
                value={selectedStation}
                onChange={(e) => handleStationChange(e.target.value)}
              >
                <option value="">Chọn trạm</option>
                {stations.map((s) => (
                  <option key={s.stationId} value={s.stationId}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Button */}
            <button
              onClick={handleSearch}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all text-lg"
            >
              <i className="bi bi-search"></i> Tìm kiếm
            </button>
          </div>
        </div>
      </div>

      {/* Results Section */}
      {searchResults && (
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">
              Chọn trụ sạc tại{" "}
              {stations.find((s) => s.stationId === selectedStation)?.name}
            </h2>

            {/* Chargers Grid */}
            {chargers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <i className="bi bi-inbox text-4xl"></i>
                <p className="mt-2">Không có trụ sạc khả dụng</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {chargers.map((charger) => (
                  <div
                    key={charger.pointId}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      selectedCharger === charger.pointId
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-200 hover:border-blue-300"
                    }`}
                    onClick={() => setSelectedCharger(charger.pointId)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg">{charger.name}</h3>
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          charger.status === "AVAILABLE"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {charger.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      <i className="bi bi-lightning-charge"></i>{" "}
                      {charger.chargingPower}
                    </p>
                    <p className="text-sm text-gray-600">
                      <i className="bi bi-plug"></i> {charger.connectorType}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Booking Form */}
            {selectedCharger && (
              <div className="border-t pt-6">
                <h3 className="text-xl font-bold mb-4">Thông tin đặt chỗ</h3>

                {/* Availability Message */}
                {availabilityMessage && (
                  <div
                    className={`p-4 rounded-lg mb-4 ${
                      availabilityMessage.includes("✅")
                        ? "bg-green-50 text-green-800 border border-green-200"
                        : "bg-red-50 text-red-800 border border-red-200"
                    }`}
                  >
                    {availabilityMessage}
                  </div>
                )}

                {/* Battery Percentage Slider */}
                <div className="mb-6">
                  <label className="block font-semibold mb-2">
                    Mức pin mong muốn: {desiredPercentage}%
                  </label>
                  <input
                    type="range"
                    min="20"
                    max="100"
                    step="5"
                    value={desiredPercentage}
                    onChange={(e) => setDesiredPercentage(e.target.value)}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    disabled={!availabilityMessage.includes("✅")}
                  />
                  <div className="flex justify-between text-sm text-gray-600 mt-1">
                    <span>20%</span>
                    <span>100%</span>
                  </div>
                </div>

                {/* Deposit Info */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold mb-2">
                    <i className="bi bi-info-circle"></i> Thông tin đặt cọc
                  </h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>
                      • Tiền cọc: <strong>50,000 VNĐ</strong>
                    </li>
                    <li>• Cửa sổ check-in: ±10 phút từ giờ đặt</li>
                    <li>• Quá giờ check-in sẽ mất cọc</li>
                    <li>• Tiền cọc sẽ được trừ vào hóa đơn cuối cùng</li>
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <button
                    onClick={() => setSearchResults(null)}
                    className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleBooking}
                    disabled={loading || !availabilityMessage.includes("✅")}
                    className={`flex-1 px-6 py-3 rounded-lg font-bold text-white transition-all ${
                      loading || !availabilityMessage.includes("✅")
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle"></i> Xác nhận đặt chỗ
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingPage;
