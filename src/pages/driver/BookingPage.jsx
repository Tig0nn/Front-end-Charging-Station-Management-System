import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import React, { useState, useEffect } from "react";
import apiServices from "../../lib/apiServices";
import "./BookingPage.css";
// Thay hero image bằng asset trong project (hoặc đổi thành đường dẫn public)
// Ví dụ: dùng ảnh có sẵn trong repo: src/assets/image/anhGG.png
import heroImage from "../../assets/image/ChargeStation.png";
const HERO_IMAGE_URL = heroImage;
const CustomInputButton = React.forwardRef(
  ({ value, onClick, placeholder }, ref) => (
    <div
      className="flex justify-between items-center w-full cursor-pointer" // Phải là justify-between
      onClick={onClick}
      ref={ref}
    >
      {/* Chữ (ngày giờ) */}
      <span className={`text-sm ${value ? "text-gray-900" : "text-gray-400"}`}>
        {value || placeholder}
      </span>
      {/* Icon */}
      <i className="bi bi-calendar-event text-gray-600"></i>
    </div>
  )
);

const BookingPage = () => {
  // States
  const [bookingTime, setBookingTime] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [stations, setStations] = useState([]);
  const [chargers, setChargers] = useState([]);

  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [selectedStation, setSelectedStation] = useState("");
  const [selectedCharger, setSelectedCharger] = useState("");
  const [desiredPercentage, setDesiredPercentage] = useState(80);

  // State mới để lưu % pin tối đa từ API
  const [maxPercentage, setMaxPercentage] = useState(100);

  const [searchResults, setSearchResults] = useState(null);
  const [availabilityMessage, setAvailabilityMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Lấy datetime tối thiểu (bây giờ + 1 phút)
  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 1);
    return now;
  };

  // Lấy datetime tối đa (đúng 24 giờ kể từ bây giờ)
  const getMaxDateTime = () => {
    const max = new Date();
    max.setHours(max.getHours() + 24); // Thêm 24 giờ
    return max;
  };

  const formatDateTimeForAPI = (date) => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    // API của bạn cần "yyyy-MM-ddTHH:mm:ss"
    return `${year}-${month}-${day}T${hours}:${minutes}:00`;
  };

  // Load initial data (vehicles, stations)
  useEffect(() => {
    loadVehicles();
    loadStations(); // THAY ĐỔI 5: Set default datetime là Date object
    // và làm tròn LÊN 30 phút gần nhất
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
    defaultTime.setSeconds(0); // Đảm bảo giây = 0

    setBookingTime(defaultTime);
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

  // Load chargers khi chọn trạm
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

  // Xử lý khi đổi trạm
  const handleStationChange = (stationId) => {
    setSelectedStation(stationId);
    setSelectedCharger(""); // Reset trụ sạc
    setChargers([]); // Xóa danh sách trụ cũ
    setAvailabilityMessage(""); // Xóa thông báo
    if (stationId) {
      loadChargers(stationId);
    }
  };

  // Xử lý khi nhấn nút "Tìm kiếm"
  const handleSearch = () => {
    if (!bookingTime || !selectedVehicle || !selectedStation) {
      alert("Vui lòng chọn đầy đủ: Ngày giờ, Xe, và Trạm sạc");
      return;
    }
    setSearchResults({ searched: true }); // Hiển thị khu vực kết quả
    setAvailabilityMessage(""); // Reset thông báo
    setSelectedCharger(""); // Reset trụ sạc đã chọn
  };

  // Kiểm tra tình trạng trụ sạc (gọi API)
  const checkAvailability = async () => {
    if (!selectedCharger || !bookingTime || !selectedVehicle) return;

    try {
      setLoading(true);
      // API yêu cầu format yyyy-MM-ddTHH:mm:ss
      const bookingDateTime = formatDateTimeForAPI(bookingTime);

      const response = await apiServices.bookings.checkAvailability(
        selectedCharger,
        bookingDateTime,
        selectedVehicle
      );

      if (response?.data?.available || response?.available) {
        const apiMessage = response?.data?.message || "Trạm khả dụng!";
        const newMax = response?.data?.maxChargePercentage || 100;

        setAvailabilityMessage(`✅ ${apiMessage}`); // Dùng message từ API
        setMaxPercentage(newMax);

        // Tự động giảm % pin nếu người dùng đang chọn cao hơn mức cho phép
        if (desiredPercentage > newMax) {
          setDesiredPercentage(newMax);
        }
      } else {
        setAvailabilityMessage(
          response?.data?.message || "❌ Trạm đã được đặt trong thời gian này"
        );
        setMaxPercentage(100); // Reset
      }
    } catch (err) {
      setAvailabilityMessage("❌ Không thể kiểm tra tình trạng");
      setMaxPercentage(100); // Reset
      console.error("Error checking availability:", err);
    } finally {
      setLoading(false);
    }
  };

  // Tự động check availability khi các thông tin thay đổi
  useEffect(() => {
    if (selectedCharger && bookingTime && selectedVehicle) {
      checkAvailability();
    } else {
      setAvailabilityMessage("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCharger, bookingTime, selectedVehicle]);

  // Xử lý khi nhấn nút "Xác nhận đặt chỗ"
  const handleBooking = async () => {
    if (!selectedVehicle || !selectedCharger || !bookingTime) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    if (!availabilityMessage.includes("✅")) {
      alert("Trạm không khả dụng hoặc thông tin không hợp lệ!");
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
      alert("✅ Đặt chỗ thành công! Tiền cọc 50,000 VNĐ đã được trừ từ ví.");

      // Reset form về trạng thái ban đầu
      setSearchResults(null);
      setSelectedCharger("");
      setAvailabilityMessage("");
      setDesiredPercentage(80);
      setMaxPercentage(100);
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
    <div className="min-h-screen bg-gray-100">
      {/* Hero Section với Hình Nền */}
      <div
        className="relative h-[50vh] min-h-[400px] bg-cover bg-center"
        style={{ backgroundImage: `url(${HERO_IMAGE_URL})` }}
      >
        {/* Lớp phủ tối */}
        <div className="absolute inset-0 bg-black/50"></div>

        {/* Nội dung chữ trên Hero */}
        <div className="relative z-10 flex flex-col justify-center h-full max-w-6xl mx-auto px-4 text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">
            Đặt chỗ sạc xe điện
          </h1>
          <p className="text-xl md:text-2xl">
            Tìm và đặt trước trụ sạc (trong 24 giờ tới)
          </p>
        </div>
      </div>

      {/* Thanh Tìm Kiếm (Nổi lên trên) */}
      <div className="relative z-20 -mt-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-xl p-4 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
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
                  dateFormat="yyyy-MM-dd HH:mm" // Vẫn giữ để format 'value'
                  minDate={getMinDateTime()}
                  maxDate={getMaxDateTime()}
                  // BỎ 'className'
                  // (vì chúng ta không style input nữa)

                  // GIỮ 'placeholderText'
                  // (nó sẽ được truyền vào CustomInputButton)
                  placeholderText="Chọn ngày và giờ"
                  // THÊM DÒNG NÀY
                  customInput={<CustomInputButton />}
                  wrapperClassName="w-full"
                />
              </div>

              {/* Vehicle */}
              <div className="border border-gray-200 rounded p-3 hover:border-blue-500">
                <label className="text-xs font-semibold text-gray-600 block mb-1">
                  <i className="bi bi-car-front"></i> Xe của bạn
                </label>
                <select
                  className="w-full border-0 focus:outline-none focus:ring-0 text-sm p-0"
                  value={selectedVehicle}
                  onChange={(e) => setSelectedVehicle(e.target.value)}
                >
                  <option value="">Chọn xe</option>
                  {vehicles.map((v) => (
                    <option key={v.vehicleId} value={v.vehicleId}>
                      {v.licensePlate} - {v.model}
                    </option>
                  ))}
                </select>
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
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all text-lg h-[62px] md:h-auto md:py-3"
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
              <h2 className="text-2xl font-bold mb-4">
                Chọn trụ sạc tại{" "}
                {stations.find((s) => s.stationId === selectedStation)?.name}
              </h2>

              {/* Chargers Grid */}
              {chargers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <i className="bi bi-inbox text-4xl"></i>
                  <p className="mt-2">Không có trụ sạc tại trạm này</p>
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

              {/* Booking Form (chỉ hiện khi đã chọn trụ) */}
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
                      {availabilityMessage.includes("✅") && (
                        <span className="text-gray-500 text-sm">
                          {" "}
                          (Tối đa: {Math.floor(maxPercentage)}%)
                        </span>
                      )}
                    </label>
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
                    <div className="flex justify-between text-sm text-gray-600 mt-1">
                      <span>20%</span>
                      <span>{Math.floor(maxPercentage)}%</span>
                    </div>
                  </div>

                  {/* Deposit Info Box */}
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
                        • Cửa sổ check-in: <strong>±10 phút</strong> từ giờ đặt.
                      </li>
                      <li>• Quá giờ check-in (không sạc) sẽ mất cọc.</li>
                      <li>• Tiền cọc sẽ được hoàn hoặc trừ vào hóa đơn sạc.</li>
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

export default BookingPage;
