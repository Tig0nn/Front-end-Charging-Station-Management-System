import React, { useState, useEffect } from "react";
import apiServices from "../../lib/apiServices";
import toast from "react-hot-toast";
import LoadingSpinner from "../loading_spins/LoadingSpinner";

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    loadBookings();
  }, []);

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
        className: "bg-green-100 text-green-800",
      },
      CHECKED_IN: {
        label: "Đã check-in",
        className: "bg-blue-100 text-blue-800",
      },
      CANCELLED: {
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

  const canCheckIn = (booking) => {
    if (booking.bookingStatus !== "CONFIRMED") return false;

    const bookingTime = new Date(booking.bookingTime);
    const now = new Date();
    const diffMinutes = (bookingTime - now) / (1000 * 60);

    // Có thể check-in từ 15 phút trước đến 15 phút sau giờ đặt
    return diffMinutes >= -15 && diffMinutes <= 15;
  };

  const canCancel = (booking) => {
    if (booking.bookingStatus !== "CONFIRMED") return false;

    const bookingTime = new Date(booking.bookingTime);
    const now = new Date();

    // Có thể hủy nếu chưa quá giờ đặt
    return now < bookingTime;
  };

  const handleCheckIn = async (bookingId) => {
    try {
      setActionLoading(bookingId);
      await apiServices.bookings.checkInBooking(bookingId);
      toast.success("Check-in thành công! Bắt đầu sạc ngay.", {
        icon: "✅",
        duration: 5000,
      });
      loadBookings();
    } catch (err) {
      console.error("Error checking in:", err);
      const errorMsg =
        err?.response?.data?.message || err?.message || "Lỗi không xác định";
      toast.error(`Check-in thất bại! ${errorMsg}`, {
        duration: 5000,
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (bookingId) => {
    if (
      !window.confirm(
        "Bạn có chắc muốn hủy booking này? Tiền cọc sẽ được hoàn lại."
      )
    ) {
      return;
    }

    try {
      setActionLoading(bookingId);
      await apiServices.bookings.cancelBooking(bookingId);
      toast.success("Hủy booking thành công! Tiền cọc đã được hoàn lại.", {
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
        {bookings.map((booking) => (
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
                    <i className="bi bi-lightning-charge-fill text-yellow-500"></i>
                    <span className="text-gray-700">
                      <strong>Trụ sạc:</strong> {booking.chargingPointName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <i className="bi bi-car-front-fill text-blue-500"></i>
                    <span className="text-gray-700">
                      <strong>Xe:</strong> {booking.vehicleLicensePlate} (
                      {booking.vehicleModel})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <i className="bi bi-clock-fill text-purple-500"></i>
                    <span className="text-gray-700">
                      <strong>Giờ đặt:</strong>{" "}
                      {formatDateTime(booking.bookingTime)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <i className="bi bi-battery-charging text-green-500"></i>
                    <span className="text-gray-700">
                      <strong>Mức pin:</strong> {booking.desiredPercentage}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <i className="bi bi-coin text-orange-500"></i>
                    <span className="text-gray-700">
                      <strong>Tiền cọc:</strong>{" "}
                      {formatCurrency(booking.depositAmount)}
                    </span>
                  </div>
                  {booking.estimatedEndTime && (
                    <div className="flex items-center gap-2">
                      <i className="bi bi-flag-fill text-gray-500"></i>
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
                    onClick={() => handleCheckIn(booking.id)}
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
                        <i className="bi bi-check-circle"></i>
                        <span>Check-in</span>
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

                {!canCheckIn(booking) && !canCancel(booking) && (
                  <div className="text-sm text-gray-500 italic text-center">
                    {booking.bookingStatus === "CONFIRMED" &&
                      "Chưa đến giờ check-in"}
                    {booking.bookingStatus === "CHECKED_IN" &&
                      "Đang trong phiên sạc"}
                    {booking.bookingStatus === "CANCELLED" && "Đã bị hủy"}
                    {booking.bookingStatus === "EXPIRED" && "Đã hết hạn"}
                    {booking.bookingStatus === "COMPLETED" && "Đã hoàn thành"}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyBookings;
