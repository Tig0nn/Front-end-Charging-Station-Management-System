import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import React, { useState, useEffect } from "react";
import apiServices from "../../lib/apiServices";
import toast from "react-hot-toast";
import LoadingSpinner from "../loading_spins/LoadingSpinner";
import heroImage from "../../assets/image/ChargeStation.png";

const HERO_IMAGE_URL = heroImage;

const CustomInputButton = React.forwardRef(
  ({ value, onClick, placeholder }, ref) => (
    <div
      className="flex justify-between items-center w-full cursor-pointer"
      onClick={onClick}
      ref={ref}
    >
      <span className={`text-sm ${value ? "text-gray-900" : "text-gray-400"}`}>
        {value || placeholder}
      </span>
      <i className="bi bi-calendar-event text-gray-600"></i>
    </div>
  )
);

const BookingForm = () => {
  // Helper function to translate backend messages
  const translateMessage = (message) => {
    if (!message) return message;

    const lowerMsg = message.toLowerCase();

    if (lowerMsg.includes("you can charge to")) {
      const match = message.match(/(\d+)%/);
      if (match) {
        return `Bạn có thể sạc đến ${match[1]}%`;
      }
      return "Bạn có thể sạc đến mức tối đa";
    }

    if (lowerMsg.includes("available")) {
      return "Trạm sạc khả dụng";
    }

    if (
      lowerMsg.includes("not available") ||
      lowerMsg.includes("unavailable")
    ) {
      return "Trạm sạc không khả dụng";
    }

    if (lowerMsg.includes("already booked")) {
      return "Trạm đã được đặt trong thời gian này";
    }

    return message;
  };

  // States
  const [bookingTime, setBookingTime] = useState(null);
  const [stations, setStations] = useState([]);
  const [chargers, setChargers] = useState([]);

  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [selectedStation, setSelectedStation] = useState("");
  const [selectedCharger, setSelectedCharger] = useState("");
  const [desiredPercentage, setDesiredPercentage] = useState(80);

  const [maxPercentage, setMaxPercentage] = useState(100);

  const [searchResults, setSearchResults] = useState(null);
  const [availabilityMessage, setAvailabilityMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingChargers, setLoadingChargers] = useState(false);
  const [chargerAvailability, setChargerAvailability] = useState({});

  const getMaxDateTime = () => {
    const max = new Date();
    max.setHours(max.getHours() + 24);
    return max;
  };

  const formatDateTimeForAPI = (date) => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}:00`;
  };

  useEffect(() => {
    loadStations();
    // Lấy vehicleId từ localStorage và tự động chọn
    const savedVehicleId = localStorage.getItem("selectedVehicleId");
    if (savedVehicleId) {
      setSelectedVehicle(savedVehicleId);
    } else {
      // Nếu không có xe nào được lưu, có thể thông báo cho người dùng
      toast.error("Vui lòng chọn một xe từ trang chính trước khi đặt chỗ.");
    }

    const defaultTime = new Date();
    defaultTime.setHours(defaultTime.getHours() + 1);

    const minutes = defaultTime.getMinutes();
    if (minutes === 0) {
      // Đã tròn
    } else if (minutes <= 30) {
      defaultTime.setMinutes(30);
    } else {
      defaultTime.setHours(defaultTime.getHours() + 1);
      defaultTime.setMinutes(0);
    }
    defaultTime.setSeconds(0);

    setBookingTime(defaultTime);
  }, []);

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
      setLoadingChargers(true);
      const response = await apiServices.chargingPoints.getChargersByStation(
        stationId
      );
      setChargers(response?.data?.result || response?.result || []);
    } catch (err) {
      console.error("Error loading chargers:", err);
    } finally {
      setLoadingChargers(false);
    }
  };

  const handleStationChange = (stationId) => {
    setSelectedStation(stationId);
    setSelectedCharger("");
    setChargers([]);
    setAvailabilityMessage("");
    setChargerAvailability({});
    if (stationId) {
      loadChargers(stationId);
    }
  };

  const handleSearch = () => {
    if (!bookingTime || !selectedVehicle || !selectedStation) {
      toast.error("Vui lòng chọn đầy đủ: Ngày giờ, Xe, và Trạm sạc");
      return;
    }
    setSearchResults({ searched: true });
    setAvailabilityMessage("");
    setSelectedCharger("");
    setChargerAvailability({});
  };

  const checkAvailability = async () => {
    if (!selectedCharger || !bookingTime || !selectedVehicle) return;

    try {
      setLoading(true);
      const bookingDateTime = formatDateTimeForAPI(bookingTime);

      const response = await apiServices.bookings.checkAvailability(
        selectedCharger,
        bookingDateTime,
        selectedVehicle
      );

      if (response?.data?.available || response?.available) {
        const apiMessage = response?.data?.message || "Trạm khả dụng!";
        const newMax = response?.data?.maxChargePercentage || 100;

        const translatedMessage = translateMessage(apiMessage);
        setAvailabilityMessage(`✅ ${translatedMessage}`);
        setMaxPercentage(newMax);

        if (desiredPercentage > newMax) {
          setDesiredPercentage(newMax);
        }
      } else {
        const apiMessage =
          response?.data?.message || "Trạm đã được đặt trong thời gian này";
        const translatedMessage = translateMessage(apiMessage);
        setAvailabilityMessage(`${translatedMessage}`);
        setMaxPercentage(100);
      }
    } catch (err) {
      setAvailabilityMessage("Không thể kiểm tra tình trạng");
      setMaxPercentage(100);
      console.error("Error checking availability:", err);
    } finally {
      setLoading(false);
    }
  };

  const checkAllChargersAvailability = async () => {
    if (!chargers.length || !bookingTime || !selectedVehicle) return;

    try {
      setLoading(true);
      const bookingDateTime = formatDateTimeForAPI(bookingTime);
      const availabilityPromises = chargers.map(async (charger) => {
        try {
          const response = await apiServices.bookings.checkAvailability(
            charger.pointId,
            bookingDateTime,
            selectedVehicle
          );

          return {
            chargerId: charger.pointId,
            available:
              response?.data?.available || response?.available || false,
            message: response?.data?.message || "",
            maxChargePercentage: response?.data?.maxChargePercentage || 100,
          };
        } catch (err) {
          console.error(
            `Error checking availability for ${charger.name}:`,
            err
          );
          return {
            chargerId: charger.pointId,
            available: false,
            message: "Lỗi kiểm tra",
            maxChargePercentage: 100,
          };
        }
      });

      const results = await Promise.all(availabilityPromises);

      const availabilityMap = {};
      results.forEach((result) => {
        availabilityMap[result.chargerId] = result;
      });
      setChargerAvailability(availabilityMap);
    } catch (err) {
      console.error("Error checking all chargers availability:", err);
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

  useEffect(() => {
    if (
      searchResults &&
      chargers.length > 0 &&
      bookingTime &&
      selectedVehicle
    ) {
      checkAllChargersAvailability();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchResults, chargers, bookingTime, selectedVehicle]);

  const handleBooking = async () => {
    if (!selectedVehicle || !selectedCharger || !bookingTime) {
      toast.error("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    if (!availabilityMessage.includes("✅")) {
      toast.error("Trạm không khả dụng hoặc thông tin không hợp lệ!");
      return;
    }

    try {
      setLoading(true);
      const bookingData = {
        vehicleId: selectedVehicle,
        chargingPointId: selectedCharger,
        bookingTime: formatDateTimeForAPI(bookingTime),
        desiredPercentage: parseInt(desiredPercentage),
      };

      await apiServices.bookings.createBooking(bookingData);
      toast.success(
        "Đặt chỗ thành công! Tiền cọc 50,000 VNĐ đã được trừ từ ví.",
        {
          duration: 5000,
          icon: "✅",
        }
      );

      setSearchResults(null);
      setSelectedCharger("");
      setAvailabilityMessage("");
      setDesiredPercentage(80);
      setMaxPercentage(100);
      setChargerAvailability({});
    } catch (err) {
      console.error("Error creating booking:", err);
      const errorMsg =
        err?.response?.data?.message || err?.message || "Lỗi không xác định";
      toast.error(`Đặt chỗ thất bại! ${errorMsg}`, {
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Hero Section */}
      <div
        className="relative h-[50vh] min-h-[400px] bg-cover bg-center"
        style={{ backgroundImage: `url(${HERO_IMAGE_URL})` }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative z-10 flex flex-col justify-center h-full max-w-6xl mx-auto px-4 text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">
            Đặt chỗ sạc xe điện
          </h1>
          <p className="text-xl md:text-2xl">
            Tìm và đặt trước trụ sạc (trong 24 giờ tới)
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative z-20 -mt-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-xl p-4 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              {/* Date & Time */}
              <div className="border border-gray-200 rounded p-3 hover:border-blue-500">
                <label className="text-xs font-semibold text-gray-600 block mb-1">
                  <i className="bi bi-calendar3"></i> Ngày giờ đặt chỗ
                </label>
                <DatePicker
                  selected={bookingTime}
                  onChange={(date) => setBookingTime(date)}
                  showTimeSelect
                  timeIntervals={30}
                  timeFormat="HH:mm"
                  dateFormat="yyyy-MM-dd HH:mm"
                  minDate={new Date()}
                  maxDate={getMaxDateTime()}
                  minTime={(() => {
                    if (!bookingTime) return new Date(0, 0, 0, 0, 0);
                    const now = new Date();
                    const isToday =
                      bookingTime.toDateString() === now.toDateString();
                    if (isToday) {
                      return now;
                    }
                    // default earliest time
                    return new Date(0, 0, 0, 0, 0);
                  })()}
                  maxTime={(() => {
                    if (!bookingTime) return new Date(0, 0, 0, 23, 59);
                    const max = getMaxDateTime();
                    const isMaxDay =
                      bookingTime.toDateString() === max.toDateString();
                    if (isMaxDay) {
                      return max;
                    }
                    // default latest time
                    return new Date(0, 0, 0, 23, 59);
                  })()}
                  placeholderText="Chọn ngày và giờ"
                  customInput={<CustomInputButton />}
                  wrapperClassName="w-full"
                />
              </div>

              {/* Station */}
              <div className="border border-gray-200 rounded p-3 hover:border-blue-500">
                <label className="text-xs font-semibold text-gray-600 block mb-1">
                  <i className="bi bi-geo-alt"></i> Trạm sạc
                </label>
                <select
                  className="w-full border-0 focus:outline-none focus:ring-0 text-sm p-0"
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
                className="bg-[#22c55e] hover:bg-[#16a34a] text-white font-bold !rounded-lg transition-all text-lg h-[62px] md:h-auto md:py-3"
              >
                <i className="bi bi-search"></i> Tìm kiếm
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="pt-12 pb-12">
        {searchResults && (
          <div className="max-w-6xl mx-auto px-4">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">
                  Chọn trụ sạc tại{" "}
                  {stations.find((s) => s.stationId === selectedStation)?.name}
                </h2>
                {chargers.length > 0 && (
                  <button
                    onClick={checkAllChargersAvailability}
                    disabled={loading || !bookingTime || !selectedVehicle}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                      loading || !bookingTime || !selectedVehicle
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-blue-500 text-white hover:bg-blue-600"
                    }`}
                  >
                    <i className="bi bi-arrow-clockwise mr-2"></i>
                    {loading ? "Đang kiểm tra..." : "Kiểm tra lại tất cả"}
                  </button>
                )}
              </div>

              {loadingChargers ? (
                <LoadingSpinner size={80} />
              ) : (
                <>
                  {chargers.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <i className="bi bi-inbox text-4xl"></i>
                      <p className="mt-2">Không có trụ sạc tại trạm này</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                      {chargers.map((charger) => {
                        const availability =
                          chargerAvailability[charger.pointId];
                        const isAvailable = availability?.available;
                        const isCheckingAll = loading && !selectedCharger;

                        return (
                          <div
                            key={charger.pointId}
                            className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                              selectedCharger === charger.pointId
                                ? "border-green-600 bg-green-50"
                                : isAvailable
                                ? "border-green-200 hover:border-green-300"
                                : availability && !isAvailable
                                ? "border-red-200 bg-red-50 opacity-75"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                            onClick={() => setSelectedCharger(charger.pointId)}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-bold text-lg">
                                {charger.name}
                              </h3>
                              {/* Badge hiển thị kết quả check availability */}
                              {availability && !isCheckingAll ? (
                                <span
                                  className={`px-2 py-1 rounded text-xs font-semibold ${
                                    isAvailable
                                      ? "bg-green-100 text-green-800"
                                      : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {isAvailable ? "Khả dụng" : "Không khả dụng"}
                                </span>
                              ) : isCheckingAll ? (
                                <span className="px-2 py-1 rounded text-xs font-semibold bg-gray-100 text-gray-600">
                                  Đang kiểm tra...
                                </span>
                              ) : null}
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              <i className="bi bi-lightning-charge"></i>{" "}
                              {charger.chargingPower}
                            </p>

                            {isCheckingAll && (
                              <div className="mt-2 text-xs text-gray-500 flex items-center">
                                <span className="animate-spin mr-2">⏳</span>
                                Đang kiểm tra...
                              </div>
                            )}
                            {availability && !isCheckingAll && (
                              <div
                                className={`mt-2 p-2 rounded text-xs ${
                                  isAvailable
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {isAvailable ? (
                                  <>
                                    <div className="mt-1 text-xs opacity-75">
                                      Sạc tối đa:{" "}
                                      {Math.floor(
                                        availability.maxChargePercentage
                                      )}
                                      %
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    <div className="font-semibold mb-1">
                                      Không khả dụng
                                    </div>
                                    <div>
                                      {translateMessage(availability.message)}
                                    </div>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}

              {selectedCharger && (
                <div className="border-t pt-6">
                  <h3 className="text-xl font-bold mb-4">Thông tin đặt chỗ</h3>
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
                  )}{" "}
                  <div className="mb-6">
                    <label className="block font-semibold mb-2">
                      Mức pin mong muốn: {desiredPercentage}%
                      {availabilityMessage.includes("✅") && (
                        <span className="text-gray-500 text-sm">
                          {" "}
                          (Tối đa: {Math.floor(maxPercentage)}%)
                        </span>
                      )}
                    </label>
                    {/* OLD SLIDER - Basic style without gradient
                    <input
                      type="range"
                      min="20"
                      max={Math.floor(maxPercentage)}
                      step="1"
                      value={desiredPercentage}
                      onChange={(e) => setDesiredPercentage(e.target.value)}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      disabled={!availabilityMessage.includes("✅")}
                    />
                    */}

                    {/* Thanh pin với css mới */}
                    {/* <style>
                      {`
                        #booking-slider::-webkit-slider-thumb {
                          appearance: none;
                          width: 20px;
                          height: 20px;
                          border-radius: 50%;
                          background: ${
                            desiredPercentage < 20
                              ? "#dc2626"
                              : desiredPercentage <= 50
                              ? "#eab308"
                              : "#059669"
                          };
                          cursor: pointer;
                          border: 3px solid white;
                          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
                          transition: all 0.3s ease;
                        }
                        #booking-slider::-webkit-slider-thumb:hover {
                          transform: scale(1.2);
                          box-shadow: 0 3px 8px rgba(0, 0, 0, 0.3);
                        }
                        #booking-slider::-moz-range-thumb {
                          width: 20px;
                          height: 20px;
                          border-radius: 50%;
                          background: ${
                            desiredPercentage < 20
                              ? "#dc2626"
                              : desiredPercentage <= 50
                              ? "#eab308"
                              : "#059669"
                          };
                          cursor: pointer;
                          border: 3px solid white;
                          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
                          transition: all 0.3s ease;
                        }
                        #booking-slider::-moz-range-thumb:hover {
                          transform: scale(1.2);
                          box-shadow: 0 3px 8px rgba(0, 0, 0, 0.3);
                        }
                      `}
                    </style> */}
                    <input
                      id="booking-slider"
                      type="range"
                      min="10"
                      max={Math.floor(maxPercentage)}
                      step="1"
                      value={desiredPercentage}
                      onChange={(e) => setDesiredPercentage(e.target.value)}
                      className="w-full h-2 rounded-lg appearance-none cursor-pointer transition-all duration-300"
                      // style={{
                      //   background: `linear-gradient(to right,
                      //     ${
                      //       desiredPercentage < 20
                      //         ? "#dc2626"
                      //         : desiredPercentage <= 50
                      //         ? "#eab308"
                      //         : "#059669"
                      //     } 0%,
                      //     ${
                      //       desiredPercentage < 20
                      //         ? "#dc2626"
                      //         : desiredPercentage <= 50
                      //         ? "#eab308"
                      //         : "#059669"
                      //     } ${
                      //     ((desiredPercentage - 20) /
                      //       (Math.floor(maxPercentage) - 20)) *
                      //     100
                      //   }%,
                      //     #e5e7eb ${
                      //       ((desiredPercentage - 20) /
                      //         (Math.floor(maxPercentage) - 20)) *
                      //       100
                      //     }%,
                      //     #e5e7eb 100%)`,
                      // }}
                      style={{
                        background: `linear-gradient(to right, #10b981 0%, #10b981 ${
                          ((desiredPercentage - 10) / 90) * 100
                        }%, #e5e7eb ${
                          ((desiredPercentage - 10) / 90) * 100
                        }%, #e5e7eb 100%)`,
                      }}
                      disabled={!availabilityMessage.includes("✅")}
                    />
                    <div className="flex justify-between text-sm text-gray-600 mt-1">
                      <span>10%</span>
                      <span>{Math.floor(maxPercentage)}%</span>
                    </div>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <h4 className="font-semibold mb-2">
                      <i className="bi bi-info-circle"></i> Thông tin đặt cọc
                    </h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>
                        • Một khoản cọc <strong>50,000 VNĐ</strong> sẽ được trừ
                        từ ví.
                      </li>
                      <li>
                        • Cửa sổ check-in: <strong>±15 phút</strong> từ giờ đặt.
                      </li>
                      <li>• Quá giờ check-in (không sạc) sẽ mất cọc.</li>
                      <li>• Tiền cọc sẽ được hoàn hoặc trừ vào hóa đơn sạc.</li>
                    </ul>
                  </div>
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
                          <i className="bi bi-check-circle"></i> Xác nhận & Cọc
                          50,000 VNĐ
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
    </div>
  );
};

export default BookingForm;
