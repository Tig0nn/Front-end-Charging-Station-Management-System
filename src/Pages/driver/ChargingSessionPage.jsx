import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// --- IMPORT ICON ĐÃ SỬA LẦN CUỐI ---
import {
  ClockIcon,
  XMarkIcon,
  BoltIcon,
  PowerIcon,
  CheckCircleIcon,
  BanknotesIcon,
  ExclamationTriangleIcon,
  ArrowUturnLeftIcon,
  // Đã xóa StopwatchIcon khỏi solid
} from "@heroicons/react/24/solid";

export default function ChargingSessionPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const { station, charger } = location.state || {};

  const [sessionState, setSessionState] = useState("waiting"); // "waiting" | "charging" | "completed"
  const [countdown, setCountdown] = useState(300); // 5 minutes
  const [batteryLevel, setBatteryLevel] = useState(58);
  const [chargingTime, setChargingTime] = useState(0);
  const [estimatedTime] = useState("16:00"); // Giữ nguyên

  const handleCancel = useCallback(() => {
    if (window.confirm("Bạn có chắc muốn hủy phiên sạc?")) {
      navigate("/driver/map");
    }
  }, [navigate]);

  // Countdown timer for waiting state
  useEffect(() => {
    if (sessionState === "waiting" && countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleCancel();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [sessionState, countdown, handleCancel]);

  // Charging timer
  useEffect(() => {
    if (sessionState === "charging") {
      const timer = setInterval(() => {
        setChargingTime((prev) => prev + 1);
        setBatteryLevel((prev) => {
          if (prev >= 100) {
            clearInterval(timer);
            setSessionState("completed");
            return 100;
          }
          return Math.min(prev + 0.1, 100);
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [sessionState]);

  // Format time functions (không đổi)
  const formatCountdown = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatChargingTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleConfirmConnection = () => {
    setSessionState("charging");
    setChargingTime(0);
  };

  const handleStopCharging = () => {
    if (window.confirm("Bạn có chắc muốn dừng sạc?")) {
      setSessionState("completed");
      // TODO: Call API to stop charging session
    }
  };

  const handleCompleteSession = () => {
    navigate("/driver/history");
  };

  // Nền chung cho tất cả các trạng thái
  const pageBackground =
    "min-h-screen bg-gradient-to-br from-gray-100 to-white flex items-center justify-center p-5";

  if (!station || !charger) {
    return (
      <div className={pageBackground}>
        <div className="bg-white p-10 rounded-[24px] text-center shadow-2xl max-w-md w-full animate-slideUp">
          <ExclamationTriangleIcon className="text-6xl text-red-500 mb-5 mx-auto" />
          <p className="text-xl text-red-500 mb-6 font-semibold">
            Không tìm thấy thông tin phiên sạc
          </p>
          <button
            onClick={() => navigate("/driver/map")}
            className="bg-blue-600 text-white border-none px-8 py-3 rounded-xl text-base font-bold cursor-pointer transition-all duration-300 hover:bg-blue-700 hover:-translate-y-0.5 shadow-lg shadow-blue-500/30 flex items-center gap-2 mx-auto"
          >
            <ArrowUturnLeftIcon className="w-5 h-5" />
            Quay lại bản đồ
          </button>
        </div>
      </div>
    );
  }

  // Waiting for connection state
  if (sessionState === "waiting") {
    return (
      <div className={pageBackground}>
        <div className="bg-white p-8 rounded-[24px] shadow-2xl max-w-[500px] w-full text-center animate-slideUp">
          <ClockIcon className="text-6xl mb-5 text-blue-500 animate-pulse mx-auto" />
          <h2 className="text-2xl text-gray-800 mb-6 font-bold">
            Đang chờ kết nối súng sạc
          </h2>

          <div className="bg-gray-50 p-5 rounded-xl mb-6 text-left">
            <h3 className="text-lg text-gray-800 mb-1 font-semibold">
              {station.stationName} - {charger.chargerName}
            </h3>
            <p className="text-gray-500 text-sm mb-3">{station.address}</p>
            <p className="text-blue-600 text-sm italic font-medium">
              Hệ thống đang tự động phát hiện kết nối...
            </p>
          </div>

          <div className="text-lg mb-8">
            <span className="text-gray-600">Thời gian còn lại:</span>
            <span className="text-3xl font-bold text-red-600 font-mono ml-2">
              {formatCountdown(countdown)}
            </span>
          </div>

          <div className="flex gap-4">
            <button
              className="flex-1 bg-gray-200 text-gray-700 border-none px-4 py-4 rounded-[12px] text-base font-bold cursor-pointer transition-all duration-300 hover:bg-gray-300 hover:-translate-y-0.5"
              onClick={handleCancel}
            >
              Hủy
            </button>
            <button
              className="flex-1 bg-green-600 text-white border-none px-4 py-4 rounded-[12px] text-base font-bold cursor-pointer transition-all duration-300 shadow-lg shadow-green-500/30 hover:bg-green-700 hover:-translate-y-0.5 flex items-center justify-center gap-2"
              onClick={handleConfirmConnection}
            >
              <BoltIcon className="w-5 h-5" />
              Đã kết nối
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Charging state
  if (sessionState === "charging") {
    return (
      <div className={pageBackground}>
        <div className="bg-white p-8 rounded-[24px] shadow-2xl max-w-[600px] w-full animate-slideUp">
          <h2 className="text-3xl text-gray-800 font-bold text-center mb-6">
            Đang sạc xe
          </h2>

          <div className="bg-gray-50 border border-gray-200 p-5 rounded-xl mb-6">
            <h3 className="text-xl text-gray-800 mb-2 font-semibold">
              {station.stationName}
            </h3>
            <p className="text-gray-600 mb-3">{station.address}</p>
            <div className="flex gap-2.5 mt-2.5">
              <span className="bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1">
                <BoltIcon className="w-4 h-4" />
                {charger.powerOutput}
              </span>
              <span className="bg-gray-200 text-gray-700 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1">
                <PowerIcon className="w-4 h-4" />
                {charger.connectorType}
              </span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl mb-6">
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-600 font-medium">Pin hiện tại:</span>
              <span className="text-4xl font-bold text-green-600">
                {Math.round(batteryLevel)}%
              </span>
            </div>

            <div className="w-full h-[30px] bg-gray-200 rounded-full overflow-hidden mb-6 relative">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-lime-400 rounded-full transition-all duration-500 animate-pulse"
                style={{ width: `${batteryLevel}%` }}
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col items-center p-3 bg-gray-100 rounded-lg">
                <span className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                  <ClockIcon className="w-4 h-4" />
                  Bắt đầu
                </span>
                <span className="text-base font-semibold text-gray-800">
                  {estimatedTime}
                </span>
              </div>
              <div className="flex flex-col items-center p-3 bg-gray-100 rounded-lg">
                <span className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                  <StopwatchIcon className="w-4 h-4" />{" "}
                  {/* --- SẼ DÙNG ICON TỪ OUTLINE --- */}
                  Thời gian
                </span>
                <span className="text-base font-semibold text-gray-800">
                  {formatChargingTime(chargingTime)}
                </span>
              </div>
              <div className="flex flex-col items-center p-3 bg-gray-100 rounded-lg">
                <span className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                  <BanknotesIcon className="w-4 h-4" />
                  Giá
                </span>
                <span className="text-base font-semibold text-gray-800">
                  {station.pricePerKwh || "3,500đ/kWh"}
                </span>
              </div>
            </div>
          </div>

          <button
            className="w-full bg-red-600 text-white border-none py-4 rounded-[14px] text-lg font-bold cursor-pointer transition-all duration-300 shadow-lg shadow-red-500/30 hover:bg-red-700 hover:-translate-y-0.5"
            onClick={handleStopCharging}
          >
            Dừng sạc
          </button>
        </div>
      </div>
    );
  }

  // Completed state
  if (sessionState === "completed") {
    return (
      <div className={pageBackground}>
        <div className="bg-white p-10 rounded-[24px] shadow-2xl max-w-[500px] w-full text-center animate-slideUp">
          <CheckCircleIcon className="text-[5rem] mb-5 text-green-500 animate-bounceIn mx-auto" />
          <h2 className="text-3xl text-green-600 mb-8 font-bold">
            Sạc hoàn tất!
          </h2>

          <div className="bg-gray-50 p-6 rounded-xl mb-8 text-left divide-y divide-gray-200">
            <div className="flex justify-between py-4 text-base">
              <span className="text-gray-600">Pin đạt:</span>
              <span className="text-green-600 font-bold text-lg">
                {Math.round(batteryLevel)}%
              </span>
            </div>
            <div className="flex justify-between py-4 text-base">
              <span className="text-gray-600">Thời gian sạc:</span>
              <span className="font-semibold">
                {formatChargingTime(chargingTime)}
              </span>
            </div>
            <div className="flex justify-between py-4 text-base">
              <span className="text-gray-600">Trạm:</span>
              <span className="font-semibold">{station.stationName}</span>
            </div>
          </div>

          <button
            className="w-full bg-blue-600 text-white border-none py-4 rounded-[14px] text-lg font-bold cursor-pointer transition-all duration-300 shadow-lg shadow-blue-500/30 hover:bg-blue-700 hover:-translate-y-0.5"
            onClick={handleCompleteSession}
          >
            Xem lịch sử
          </button>
        </div>
      </div>
    );
  }

  return null;
}
