import React, { useState, useEffect } from "react";
import { Spinner } from "react-bootstrap";
import {  chargingPointsAPI } from "../../lib/apiServices.js";
import { useParams, useNavigate } from "react-router-dom";
import { StopCircleIcon, ArrowUturnLeftIcon } from "@heroicons/react/24/solid";

export default function ChargingSessionPage() {
  const { sessionId } = useParams(); // Lấy sessionId từ URL
//  dừng phiên sạc
  const navigate = useNavigate();
  const [isStopping, setIsStopping] = useState(false);


  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    if (!sessionId) return;

    const fetchSession = async () => {
      try {
        // Gọi API thật để lấy thông tin phiên sạc
        // Giả sử bạn có API này: chargingPointsAPI.getSessionById(sessionId)
        const res = await chargingPointsAPI.simulateCharging(sessionId);
        setSession(res.data.result);
      } catch (err) {
        console.log("Lỗi tải session sạc:", err);
        setSession(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
    const timer = setInterval(fetchSession, 5000);
    return () => clearInterval(timer);
  }, [sessionId]);
  
// Hàm dừng phiên sạc
  const handleStopSession = async () => {
    if (!sessionId) return;
    setIsStopping(true);
    try {
      // Giả sử bạn có API này
      await chargingPointsAPI.stopCharging(sessionId);
      // Lần fetch tiếp theo sẽ tự động cập nhật trạng thái
    } catch (err) {
      console.error("Lỗi khi dừng phiên sạc:", err);
      alert("Không thể dừng phiên sạc, vui lòng thử lại.");
    } finally {
      setIsStopping(false);
    }
  };


  // -------------------- MÀN HÌNH KHÔNG CÓ SESSION --------------------
  if (!sessionId) {
    return (
      <div className="min-h-screen bg-gray-50 px-8 py-10">
        <div className="max-w-6xl mx-auto text-center">
          {/* Thông báo không có phiên sạc */}
          <div className="bg-white rounded-2xl shadow-sm py-16 px-6 border mb-8">
            <div className="text-5xl mb-4">⚡</div>
            <h2 className="text-2xl font-semibold mb-2">
              Hiện không có phiên sạc nào đang diễn ra
            </h2>
            <p className="text-gray-600">
              Vui lòng chọn trạm sạc từ tab <b>“Bản đồ trạm sạc”</b> để bắt đầu.
            </p>
          </div>

          {/* Grid hướng dẫn + thông tin xe */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Hướng dẫn */}
            <div className="bg-blue-50 rounded-xl p-5 text-left border border-blue-100">
              <h3 className="text-lg font-semibold mb-3">Hướng dẫn sử dụng</h3>
              <ol className="text-gray-700 space-y-2 text-sm list-decimal list-inside">
                <li>Tìm trạm sạc: Mở tab “Bản đồ trạm sạc”.</li>
                <li>Chọn trụ sạc: Bấm “Sạc” trên trạm phù hợp.</li>
                <li>Kết nối và sạc: Cắm sạc vào xe trong 5 phút.</li>
                <li>
                  Theo dõi & thanh toán: Kiểm tra tiến độ và thanh toán khi hoàn
                  tất.
                </li>
              </ol>
            </div>

            {/* Thông tin xe */}
            <div className="bg-white rounded-xl p-5 border">
              <h3 className="text-lg font-semibold mb-3">
                Thông tin xe hiện tại
              </h3>
              <div className="flex justify-between items-center mb-2">
                <span>Mức pin hiện tại:</span>
                <span>75%</span>
              </div>
              <div className="w-full bg-gray-200 h-4 rounded-full overflow-hidden mb-3">
                <div className="bg-black h-full" style={{ width: "75%" }}></div>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <p>Dung lượng pin: 60 kWh</p>
                <p>Phạm vi còn lại: ~300 km</p>
                <p>Loại cổng sạc: CCS Combo 2</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------- MÀN HÌNH ĐANG SẠC --------------------
  if (loading || !session) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Spinner animation="border" variant="primary" />
        <span className="ml-2 text-gray-700">
          Đang tải dữ liệu phiên sạc...
        </span>
      </div>
    );
  }

  // --- MÀN HÌNH MỚI: HOÀN TẤT SẠC ---
  if (
    session &&
    (session.status === "COMPLETED" || session.status === "STOPPED")
  ) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border p-8 text-center">
          <h2 className="text-2xl font-bold text-green-600 mb-2">
            Sạc Hoàn Tất!
          </h2>
          <p className="text-gray-600 mb-6">Cảm ơn bạn đã sử dụng dịch vụ.</p>

          <div className="bg-gray-100 rounded-lg p-4 space-y-3 text-left mb-8">
            <div className="flex justify-between">
              <span>Trạm sạc:</span>
              <span className="font-semibold">{session.stationName}</span>
            </div>
            <div className="flex justify-between">
              <span>Thời gian sạc:</span>
              <span className="font-semibold">
                {formatTime(session.elapsedTimeMinutes * 60)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Năng lượng đã nạp:</span>
              <span className="font-semibold">
                {session.energyConsumedKwh.toFixed(2)} kWh
              </span>
            </div>
            <div className="flex justify-between text-lg">
              <strong>Tổng chi phí:</strong>
              <strong className="text-blue-600">
                {session.currentCost.toLocaleString()}đ
              </strong>
            </div>
          </div>

          <button
            onClick={() => navigate("/driver/map")}
            className="w-full bg-emerald-600 text-white font-bold py-3 rounded-lg hover:bg-emerald-700 flex items-center justify-center gap-2"
          >
            <ArrowUturnLeftIcon className="w-5 h-5" />
            Quay về bản đồ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-8 py-10">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8">
          {/* CỘT TRÁI: Thông tin sạc */}
          <div className="bg-white rounded-2xl shadow-sm border p-6 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">
                Đang sạc tại <b>{session.stationName}</b>
              </h2>
              <span className="text-green-700 bg-green-100 px-3 py-1 rounded-lg text-sm font-medium">
                {session.statusMessage}
              </span>
            </div>

            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Mức pin hiện tại</span>
                <span>{session.currentSocPercent}%</span>
              </div>
              <div className="w-full bg-gray-200 h-4 rounded-full overflow-hidden">
                <div
                  className="bg-green-600 h-full"
                  style={{
                    width: `${session.currentSocPercent}%`,
                    transition: "width 0.3s",
                  }}
                ></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
              <p>🔌 Loại cổng sạc: {session.plugType}</p>
              <p>⚙️ Điện áp: {session.voltage}</p>
              <p>🔋 Dung lượng pin: {session.batteryCapacity}</p>
              <p>📍 Trạm: {session.stationName}</p>
            </div>

            <div className="flex justify-between items-center border-t pt-4 text-gray-700">
              <div>
                <p className="text-sm">
                  Công suất: <b>{session.maxPowerKw}kW</b>
                </p>
                <p className="text-sm">
                  Giá điện: <b>{session.pricePerKwh.toLocaleString()}đ/kWh</b>
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Thời gian đã sạc</p>
                <p className="font-semibold text-lg">
                  {formatTime(session.elapsedTimeMinutes * 60)}
                </p>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: Dự kiến hoàn thành & chi phí */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border shadow-sm p-6">
              <h3 className="font-semibold text-gray-700 mb-3">
                {" "}
                Dự kiến hoàn thành
              </h3>
              <div className="text-green-600 text-3xl font-bold mb-1">
                {session.estimatedRemainingMinutes} phút
              </div>
              <p className="text-gray-500 text-sm mb-2">
                Thời gian còn lại (ước tính)
              </p>
              <p className="text-gray-700 text-sm">
                Mục tiêu: <b>{session.targetSocPercent}%</b>
              </p>
            </div>

            <div className="bg-white rounded-2xl border shadow-sm p-6">
              <h3 className="font-semibold text-gray-700 mb-3">
                {" "}
                Chi phí hiện tại
              </h3>
              <p className="text-3xl font-bold text-blue-600 mb-1">
                {session.currentCost.toLocaleString()}đ
              </p>
            </div>

            {/* NÚT DỪNG SẠC MỚI */}
            <button
              onClick={handleStopSession}
              disabled={isStopping}
              className="w-full bg-red-600 text-white font-bold py-4 rounded-xl text-lg hover:bg-red-700 disabled:bg-gray-400 flex items-center justify-center gap-3"
            >
              {isStopping ? (
                <Spinner animation="border" size="sm" />
              ) : (
                <StopCircleIcon className="w-6 h-6" />
              )}
              {isStopping ? "Đang xử lý..." : "Dừng phiên sạc"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
