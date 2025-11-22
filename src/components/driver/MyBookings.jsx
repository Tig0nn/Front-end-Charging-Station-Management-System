import React, { useState, useEffect } from "react";
import apiServices from "../../lib/apiServices";
import toast from "react-hot-toast";
import LoadingSpinner from "../loading_spins/LoadingSpinner";
import { useNavigate } from "react-router-dom";

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  // State cho modal chọn targetSocPercent
  const [showChargingModal, setShowChargingModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [targetSocPercent, setTargetSocPercent] = useState(0);

  useEffect(() => {
    loadBookings();
  }, []);
  // thêm useNavigate để chuyển khi đã có session sạc
  const navigate = useNavigate();

  const loadBookings = async () => {
    try {
      setLoading(true);
      const response = await apiServices.bookings.getMyBookings();

      // API có thể trả về trực tiếp là array hoặc wrapped trong data
      let bookingsList = [];

      if (Array.isArray(response?.data)) {
        // Nếu response.data là array
        bookingsList = response.data;
      } else if (Array.isArray(response?.data?.result)) {
        // Nếu có wrapped trong result
        bookingsList = response.data.result;
      } else if (Array.isArray(response)) {
        // Nếu response trực tiếp là array
        bookingsList = response;
      }

      setBookings(bookingsList);
    } catch (err) {
      console.error("Error loading bookings:", err);
      toast.error("Không thể tải danh sách đặt chỗ");
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (isoString) => {
    if (!isoString) return "N/A";
    const date = new Date(isoString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount || 0);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      CONFIRMED: {
        label: "Đã xác nhận",
        className: "bg-green-100 text-green-800", // Màu xanh lá cho CONFIRMED
      },
      IN_PROGRESS: {
        label: "Đang diễn ra",
        className: "bg-yellow-100 text-yellow-800", // Màu vàng cho IN_PROGRESS
      },
      CANCELLED_BY_USER: {
        label: "Đã hủy",
        className: "bg-red-100 text-red-800",
      },
      EXPIRED: {
        label: "Đã hết hạn",
        className: "bg-gray-100 text-gray-800",
      },
      COMPLETED: {
        label: "Hoàn thành",
        className: "bg-purple-100 text-purple-800",
      },
    };

    const statusInfo = statusMap[status] || {
      label: status,
      className: "bg-gray-100 text-gray-800",
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.className}`}
      >
        {statusInfo.label}
      </span>
    );
  };

  useEffect(() => {
    const activeId = localStorage.getItem("activeSessionId");
    if (activeId) {
      alert("Bạn có một phiên sạc đang hoạt động. Đang chuyển hướng...");
      navigate(`/driver/session/${activeId}`, { replace: true });
    }
  }, [navigate]);

  const canCheckIn = (booking) => {
    // Chỉ hiện nút "Sạc ngay" khi status CONFIRMED và trong khoảng ±10 phút
    if (booking.bookingStatus !== "CONFIRMED") return false;

    const bookingTime = new Date(booking.bookingTime);
    const now = new Date();
    const diffMinutes = (bookingTime - now) / (1000 * 60);

    // Có thể check-in từ 10 phút trước đến 10 phút sau giờ đặt
    return diffMinutes >= -10 && diffMinutes <= 10;
  };

  const canCancel = (booking) => {
    // Chỉ cho phép hủy khi status là CONFIRMED (chưa bắt đầu sạc)
    return booking.bookingStatus === "CONFIRMED";
  };

  const handleCheckIn = async (booking) => {
    // Mở modal để chọn targetSocPercent
    setSelectedBooking(booking);

    // Tính toán maxTargetSoc: currentSocPercent + desiredPercentage
    const currentSoc = booking.currentSocPercent || 0;
    const maxTargetSoc = Math.min(100, currentSoc + booking.desiredPercentage);

    // Set giá trị mặc định là maxTargetSoc
    setTargetSocPercent(maxTargetSoc);
    setShowChargingModal(true);
  };

  const handleStartCharging = async () => {
    if (!selectedBooking) return;

    try {
      setActionLoading(selectedBooking.id);

      // Bước 1: Check-in booking
      await apiServices.bookings.checkInBooking(selectedBooking.id);

      // Bước 2: Bắt đầu phiên sạc
      const chargingData = {
        chargingPointId: selectedBooking.chargingPointId,
        vehicleId: selectedBooking.vehicleId,
        targetSocPercent: parseInt(targetSocPercent),
      };
      // Gọi API bắt đầu sạc
      const response = await apiServices.chargingPoints.startCharging(
        chargingData
      );
      const sessionId = response.data?.result?.sessionId;
      if (sessionId) {
        toast.success("Khởi động phiên sạc thành công!");
        localStorage.setItem("activeSessionId", sessionId);
        navigate(`/driver/session/${sessionId}`);
      }
      setShowChargingModal(false);
      setSelectedBooking(null);
      loadBookings();
    } catch (err) {
      console.error("Error starting charging:", err);
      const errorMsg =
        err?.response?.data?.message || err?.message || "Lỗi không xác định";
      toast.error(`Bắt đầu sạc thất bại! ${errorMsg}`, {
        duration: 5000,
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (bookingId) => {
    if (!window.confirm("Bạn có chắc muốn hủy booking này?")) {
      return;
    }

    try {
      setActionLoading(bookingId);
      await apiServices.bookings.cancelBooking(bookingId);
      toast.success("Hủy booking thành công!", {
        icon: "✅",
        duration: 5000,
      });
      loadBookings();
    } catch (err) {
      console.error("Error cancelling booking:", err);
      const errorMsg =
        err?.response?.data?.message || err?.message || "Lỗi không xác định";
      toast.error(`Hủy booking thất bại! ${errorMsg}`, {
        duration: 5000,
      });
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner size={80} />
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8">
        <div className="text-center">
          <i className="bi bi-calendar-x text-6xl text-gray-300 mb-4"></i>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Chưa có booking nào
          </h3>
          <p className="text-gray-500">
            Bạn chưa có lịch đặt chỗ nào. Hãy tạo booking mới để sạc xe!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Danh sách đặt chỗ của bạn</h2>
        <button
          onClick={loadBookings}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 text-white !rounded-md font-semibold transition-all hover:opacity-90 disabled:opacity-70"
          style={{
            backgroundColor: "#22c55e",
            boxShadow: "0 2px 4px rgba(34, 197, 94, 0.2)",
          }}
        >
          <i className="bi bi-arrow-clockwise"></i>
          <span>Làm mới</span>
        </button>
      </div>

      {/* Bookings List */}
      <div className="grid grid-cols-1 gap-4">
        {bookings.map((booking) => {
          // Debug: Log booking info
          console.log("Booking:", {
            id: booking.id,
            status: booking.bookingStatus,
            canCheckIn: canCheckIn(booking),
            canCancel: canCancel(booking),
            bookingTime: booking.bookingTime,
          });

          return (
            <div
              key={booking.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                {/* Left Section - Info */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 mb-1">
                        {booking.stationName}
                      </h3>
                      <p className="text-sm text-gray-600">
                        <i className="bi bi-geo-alt-fill text-red-500"></i>{" "}
                        {booking.stationAddress}
                      </p>
                    </div>
                    {getStatusBadge(booking.bookingStatus)}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-700">
                        <strong>Trụ sạc:</strong> {booking.chargingPointName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-700">
                        <strong>Xe:</strong> {booking.vehicleLicensePlate} (
                        {booking.vehicleModel})
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-700">
                        <strong>Giờ đặt:</strong>{" "}
                        {formatDateTime(booking.bookingTime)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-700">
                        <strong>Mức pin mong muốn:</strong>{" "}
                        {booking.desiredPercentage}%
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-700">
                        <strong>Tiền cọc:</strong>{" "}
                        {formatCurrency(booking.depositAmount)}
                      </span>
                    </div>
                    {booking.estimatedEndTime && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-700">
                          <strong>Dự kiến kết thúc:</strong>{" "}
                          {formatDateTime(booking.estimatedEndTime)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Section - Actions */}
                <div className="flex flex-col gap-2 md:min-w-[180px]">
                  {canCheckIn(booking) && (
                    <button
                      onClick={() => handleCheckIn(booking)}
                      disabled={actionLoading === booking.id}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {actionLoading === booking.id ? (
                        <>
                          <span className="animate-spin">⏳</span>
                          <span>Đang xử lý...</span>
                        </>
                      ) : (
                        <>
                          <i className="bi bi-lightning-charge-fill"></i>
                          <span>Sạc ngay</span>
                        </>
                      )}
                    </button>
                  )}

                  {canCancel(booking) && (
                    <button
                      onClick={() => handleCancel(booking.id)}
                      disabled={actionLoading === booking.id}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {actionLoading === booking.id ? (
                        <>
                          <span className="animate-spin">⏳</span>
                          <span>Đang xử lý...</span>
                        </>
                      ) : (
                        <>
                          <i className="bi bi-x-circle"></i>
                          <span>Hủy booking</span>
                        </>
                      )}
                    </button>
                  )}

                  {/* {!canCheckIn(booking) && !canCancel(booking) && (
                  <div className="text-sm text-gray-500 italic text-center">
                    {booking.bookingStatus === "CONFIRMED" &&
                      "Chưa đến giờ check-in"}
                    {booking.bookingStatus === "CHECKED_IN" &&
                      "Đang trong phiên sạc"}
                    {booking.bookingStatus === "IN_PROGRESS" &&
                      "Đang sạc"}
                    {booking.bookingStatus === "CANCELLED" && "Đã bị hủy"}
                    {booking.bookingStatus === "EXPIRED" && "Đã hết hạn"}
                    {booking.bookingStatus === "COMPLETED" && "Đã hoàn thành"}
                  </div>
                )} */}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal chọn mức sạc */}
      {showChargingModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <i className="bi bi-lightning-charge-fill text-green-500"></i>
              Chọn mức pin mục tiêu
            </h3>

            <div className="mb-6">
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Pin hiện tại:</strong>{" "}
                  {selectedBooking.currentSocPercent || 0}%
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Mức pin mong muốn:</strong>{" "}
                  {selectedBooking.desiredPercentage}%
                </p>
                <p className="text-sm text-green-600 font-semibold">
                  <strong>Mức pin tối đa có thể sạc:</strong>{" "}
                  {Math.min(
                    100,
                    (selectedBooking.currentSocPercent || 0) +
                      selectedBooking.desiredPercentage
                  )}
                  %
                </p>
              </div>

              <label className="block font-semibold mb-2">
                Mức pin mục tiêu: {targetSocPercent}%
              </label>

              <input
                id="target-soc-slider"
                type="range"
                min={selectedBooking.currentSocPercent || 0}
                max={Math.min(
                  100,
                  (selectedBooking.currentSocPercent || 0) +
                    selectedBooking.desiredPercentage
                )}
                step="1"
                value={targetSocPercent}
                onChange={(e) => setTargetSocPercent(e.target.value)}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer transition-all duration-300"
                style={{
                  background: `linear-gradient(to right, #10b981 0%, #10b981 ${
                    ((targetSocPercent - 10) / 90) * 100
                  }%, #e5e7eb ${
                    ((targetSocPercent - 10) / 90) * 100
                  }%, #e5e7eb 100%)`,
                }}
              />

              <div className="flex justify-between text-sm text-gray-600 mt-1">
                <span>{selectedBooking.currentSocPercent || 0}%</span>
                <span>
                  {Math.min(
                    100,
                    (selectedBooking.currentSocPercent || 0) +
                      selectedBooking.desiredPercentage
                  )}
                  %
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowChargingModal(false);
                  setSelectedBooking(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold transition-all"
              >
                Hủy
              </button>
              <button
                onClick={handleStartCharging}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {actionLoading ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    <span>Đang xử lý...</span>
                  </>
                ) : (
                  <>
                    <i className="bi bi-lightning-charge-fill"></i>
                    <span>Bắt đầu sạc</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
