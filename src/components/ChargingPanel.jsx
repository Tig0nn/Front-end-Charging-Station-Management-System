import React, { useState, useEffect, useCallback } from "react";

export default function ChargingPanel({
  station,
  charger,
  onClose,
  onComplete,
}) {
  const [sessionState, setSessionState] = useState("waiting"); // "waiting" | "charging" | "invoice"
  const [countdown, setCountdown] = useState(300); // 5 minutes
  const [batteryLevel, setBatteryLevel] = useState(58);
  const [chargingTime, setChargingTime] = useState(0);
  const [startTime] = useState(new Date());
  const [endTime, setEndTime] = useState(null);
  const [energyDelivered, setEnergyDelivered] = useState(0);

  const handleCancel = useCallback(() => {
    if (window.confirm("Bạn có chắc muốn hủy phiên sạc?")) {
      onClose();
    }
  }, [onClose]);

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

        // Simulate battery charging
        setBatteryLevel((prev) => {
          if (prev >= 100) {
            clearInterval(timer);
            handleStopCharging();
            return 100;
          }
          return Math.min(prev + 0.1, 100);
        });

        // Calculate energy delivered (kWh)
        setEnergyDelivered((prev) => prev + 50 / 3600); // 50kW per hour
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [sessionState]);

  const formatCountdown = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatTime = (seconds) => {
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

  const formatTimeDisplay = (date) => {
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleConfirmConnection = () => {
    setSessionState("charging");
    setChargingTime(0);
  };

  const handleStopCharging = () => {
    setEndTime(new Date());
    setSessionState("invoice");
  };

  const calculateCosts = () => {
    const pricePerKwh = 3500;
    const subtotal = Math.round(energyDelivered * pricePerKwh);
    const vat = Math.round(subtotal * 0.1);
    const total = subtotal + vat;

    return { subtotal, vat, total, pricePerKwh };
  };

  const handleCloseInvoice = () => {
    onComplete();
    onClose();
  };

  // Waiting State
  if (sessionState === "waiting") {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[10000] p-5 animate-fadeIn">
        <div className="bg-white rounded-[20px] shadow-[0_20px_60px_rgba(0,0,0,0.3)] max-w-[600px] w-full max-h-[90vh] overflow-y-auto relative animate-slideUp">
          <button
            className="absolute top-5 right-5 bg-gray-100 border-none w-9 h-9 rounded-full text-xl cursor-pointer flex items-center justify-center transition-all duration-300 hover:bg-gray-200 hover:rotate-90 z-10"
            onClick={handleCancel}
          >
            ✕
          </button>

          <div className="pt-12 px-10 pb-10 text-center">
            <div className="text-6xl mb-5 animate-pulse-custom">⏱️</div>
            <h2 className="text-2xl text-gray-800 mb-7 font-semibold">
              Đang chờ kết nối sủng sạc
            </h2>

            <div className="bg-gray-50 p-5 rounded-xl mb-6">
              <h3 className="text-lg text-gray-800 mb-2">
                {station.stationName} - {charger.chargerName}
              </h3>
              <p className="text-gray-500 text-sm mb-4">{station.address}</p>
              <p className="text-blue-500 text-sm italic">
                Hệ thống đang tự động phát hiện kết nối...
              </p>
            </div>

            <div className="flex justify-between items-center bg-yellow-50 border-2 border-yellow-400 px-6 py-4 rounded-xl mb-7 text-base">
              <span>Thời gian còn lại:</span>
              <span className="text-3xl font-bold text-red-600 font-mono">
                {formatCountdown(countdown)}
              </span>
            </div>

            <div className="flex gap-4">
              <button
                className="flex-1 border-none px-4 py-4 rounded-[10px] text-lg font-semibold cursor-pointer transition-all duration-300 bg-gray-600 text-white hover:bg-gray-700 hover:-translate-y-0.5"
                onClick={handleCancel}
              >
                Hủy
              </button>
              <button
                className="flex-1 border-none px-4 py-4 rounded-[10px] text-lg font-semibold cursor-pointer transition-all duration-300 bg-green-600 text-white shadow-[0_4px_15px_rgba(40,167,69,0.3)] hover:bg-green-700 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(40,167,69,0.4)]"
                onClick={handleConfirmConnection}
              >
                Đã kết nối
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Charging State
  if (sessionState === "charging") {
    const costs = calculateCosts();

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[10000] p-5 animate-fadeIn">
        <div className="bg-gradient-to-br from-green-100 to-green-50 rounded-[20px] shadow-[0_20px_60px_rgba(0,0,0,0.3)] max-w-[600px] w-full max-h-[90vh] overflow-y-auto animate-slideUp p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl text-gray-800 font-bold">Đang sạc xe</h2>
            <button
              className="bg-green-600 text-white border-none px-5 py-2.5 rounded-lg text-sm cursor-pointer transition-all duration-300 hover:bg-green-700 hover:-translate-y-0.5"
              onClick={handleStopCharging}
            >
              Hoàn đồng
            </button>
          </div>

          <div className="bg-white p-5 rounded-xl mb-5">
            <h3 className="text-xl text-gray-800 mb-2 font-semibold">
              {station.stationName}
            </h3>
            <p className="text-gray-600 text-sm mb-2">{station.address}</p>
            <div className="flex gap-2.5 mt-2.5">
              <span className="bg-gray-100 px-3 py-1.5 rounded-2xl text-xs text-gray-600">
                ⚡ {charger.powerOutput}
              </span>
              <span className="bg-gray-100 px-3 py-1.5 rounded-2xl text-xs text-gray-600">
                🔌 {charger.connectorType}
              </span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl mb-5">
            <div className="flex justify-between items-center mb-4">
              <span>Pin hiện tại:</span>
              <span className="text-3xl font-bold text-green-600">
                {Math.round(batteryLevel)}%
              </span>
            </div>

            <div className="w-full h-[30px] bg-gray-300 rounded-2xl overflow-hidden mb-5">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-lime-400 rounded-2xl transition-all duration-500 animate-charging-pulse"
                style={{ width: `${batteryLevel}%` }}
              />
            </div>

            <div className="grid grid-cols-3 gap-3 mb-5">
              <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-xs text-gray-500 mb-1">Bắt đầu</span>
                <span className="text-base font-semibold text-gray-800">
                  {formatTimeDisplay(startTime)}
                </span>
              </div>
              <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-xs text-gray-500 mb-1">
                  Thời gian sạc
                </span>
                <span className="text-base font-semibold text-gray-800">
                  {formatTime(chargingTime)}
                </span>
              </div>
              <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-xs text-gray-500 mb-1">Điện năng</span>
                <span className="text-base font-semibold text-gray-800">
                  {energyDelivered.toFixed(1)} kWh
                </span>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between py-2 text-sm">
                <span>Đơn giá</span>
                <span>{costs.pricePerKwh.toLocaleString()}đ/kWh</span>
              </div>
              <div className="flex justify-between py-2 text-sm">
                <span>Tạm tính</span>
                <span>{costs.subtotal.toLocaleString()}đ</span>
              </div>
            </div>
          </div>

          <button
            className="w-full bg-red-600 text-white border-none py-4 rounded-xl text-xl font-semibold cursor-pointer transition-all duration-300 shadow-[0_4px_15px_rgba(220,53,69,0.3)] hover:bg-red-700 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(220,53,69,0.4)]"
            onClick={handleStopCharging}
          >
            Dừng sạc
          </button>
        </div>
      </div>
    );
  }

  // Invoice State
  if (sessionState === "invoice") {
    const costs = calculateCosts();

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[10000] p-5 animate-fadeIn">
        <div className="bg-white rounded-[20px] shadow-[0_20px_60px_rgba(0,0,0,0.3)] max-w-[600px] w-full max-h-[90vh] overflow-y-auto animate-slideUp p-8">
          <div className="text-center mb-6 pb-5 border-b-2 border-gray-200">
            <h2 className="text-xl text-gray-800 font-semibold">
              {station.stationName} - {charger.chargerName}
            </h2>
          </div>

          <div className="flex justify-around mb-6 p-5 bg-gray-50 rounded-xl">
            <div className="flex flex-col items-center">
              <span className="text-xs text-gray-500 mb-1">Bắt đầu</span>
              <span className="text-2xl font-bold text-gray-800">
                {formatTimeDisplay(startTime)}
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-xs text-gray-500 mb-1">Kết thúc</span>
              <span className="text-2xl font-bold text-gray-800">
                {formatTimeDisplay(endTime)}
              </span>
            </div>
          </div>

          <div className="mb-6 p-5 bg-green-50 rounded-xl">
            <div className="flex justify-between py-2.5 text-base">
              <span className="text-gray-600">Thời gian sạc</span>
              <span className="font-semibold text-gray-800">
                {formatTime(chargingTime)}
              </span>
            </div>
            <div className="flex justify-between py-2.5 text-base">
              <span className="text-gray-600">Điện năng</span>
              <span className="font-semibold text-gray-800">
                {energyDelivered.toFixed(1)} kWh
              </span>
            </div>
          </div>

          <div className="mb-6 p-5 bg-white border border-gray-200 rounded-xl">
            <div className="flex justify-between py-3 border-b border-gray-100">
              <span>Đơn giá</span>
              <span>{costs.pricePerKwh.toLocaleString()}đ/kWh</span>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-100">
              <span>Tạm tính</span>
              <span>{costs.subtotal.toLocaleString()}đ</span>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-100">
              <span>VAT (10%)</span>
              <span>{costs.vat.toLocaleString()}đ</span>
            </div>
            <div className="flex justify-between py-3 border-t-2 border-green-600 pt-4 mt-2.5 text-xl font-bold">
              <span>Tổng cộng</span>
              <span className="text-green-600 text-2xl">
                {costs.total.toLocaleString()}đ
              </span>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-base text-gray-800 mb-4">
              Phương thức thanh toán
            </h3>
            <div className="flex items-center gap-4 p-4 bg-gray-50 border-2 border-gray-200 rounded-xl">
              <span className="text-3xl">💳</span>
              <div>
                <p className="font-semibold text-gray-800 mb-1">Ví MoMo</p>
                <p className="text-xs text-gray-500">
                  Thanh toán qua ví điện tử MoMo
                </p>
              </div>
            </div>
          </div>

          <button
            className="w-full bg-blue-600 text-white border-none py-4 rounded-xl text-xl font-semibold cursor-pointer transition-all duration-300 shadow-[0_4px_15px_rgba(0,123,255,0.3)] hover:bg-blue-700 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,123,255,0.4)]"
            onClick={handleCloseInvoice}
          >
            Xác nhận thanh toán
          </button>
        </div>
      </div>
    );
  }

  return null;
}
