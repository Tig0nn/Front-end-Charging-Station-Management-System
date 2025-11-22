import React, { useState, useEffect } from "react";
import { chargingPointsAPI } from "../lib/apiServices.js";
import {
  XMarkIcon,
  BoltIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  PowerIcon,
  TruckIcon, // Icon cho xe
  ChevronLeftIcon, // Icon cho nút quay lại
} from "@heroicons/react/24/solid";
import LoadingSpinner from "./loading_spins/LoadingSpinner.jsx";

export default function ChargerSelectionModal({
  station,
  onClose,
  onStartCharging,
  preSelectedPointId = null, // 🆕 NEW PROP for QR code flow
}) {
  // State chung
  const [error, setError] = useState(null);

  // --- STATE MỚI CHO MỨC PIN MONG MUỐN ---
  const [targetSoc, setTargetSoc] = useState(90);

  // State cho màn hình chọn trụ sạc
  const [chargers, setChargers] = useState([]);
  const [chargerLoading, setChargerLoading] = useState(true);
  const [selectedCharger, setSelectedCharger] = useState(null);
  // State cho màn hình chọn xe
  // const [vehicles, setVehicles] = useState([]);
  // const [vehicleLoading, setVehicleLoading] = useState(false);
  // const [selectedVehicle, setSelectedVehicle] = useState(null); // COMMENTED - không dùng object xe nữa

  // --- MỚI: Lấy vehicleId từ localStorage thay vì chọn từ danh sách ---
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);

  // State để điều khiển giao diện
  // const [view, setView] = useState("chargers"); // COMMENTED - không cần chuyển view nữa
  const [isStarting, setIsStarting] = useState(false); // Trạng thái khi nhấn nút "Bắt đầu"

  // Lấy VehicleID từ localStorage
  useEffect(() => {
    const storedVehicleId = localStorage.getItem("selectedVehicleId");
    if (storedVehicleId) {
      setSelectedVehicleId(storedVehicleId); // Lưu ID thay vì object
    } else {
      setError("Vui lòng chọn xe trước khi bắt đầu sạc.");
    }
  }, []); // Chỉ chạy 1 lần khi mount

  // --- CÁC HÀM GỌI API ---

  // --- HÀM LẤY DANH SÁCH TRỤ SẠC ---
  const fetchChargers = async () => {
    if (!station?.stationId) {
      setError("ID của trạm không hợp lệ.");
      setChargerLoading(false);
      return;
    }
    try {
      setChargerLoading(true);
      setError(null);
      const response = await chargingPointsAPI.getChargersByStation(
        station.stationId
      );
      if (response.data && response.data.result) {
        setChargers(response.data.result);
        console.log(response.data.result);
      } else {
        setChargers([]);
      }
    } catch (err) {
      console.error("Error fetching chargers:", err);
      setError("Không thể tải danh sách trụ sạc. Vui lòng thử lại.");
      setChargers([]);
    } finally {
      setChargerLoading(false);
    }
  };
  // --- HÀM LẤY DANH SÁCH XE CỦA NGƯỜI DÙNG ---
  // const fetchVehicles = async () => {
  //   try {
  //     setVehicleLoading(true);
  //     setError(null);
  //     const response = await vehiclesAPI.getMyVehicles();
  //     if (response.data && response.data.result) {
  //       const userVehicles = response.data.result;
  //       setVehicles(userVehicles);
  //       console.log("User vehicles:", userVehicles);
  //       if (userVehicles.length === 1) {
  //         setSelectedVehicle(userVehicles[0]);
  //       }
  //     } else {
  //       setVehicles([]);
  //     }
  //     console.log("Fetched vehicles:", vehicles);
  //   } catch (err) {
  //     console.error("Error fetching vehicles:", err);
  //     setError("Không thể tải danh sách xe của bạn.");
  //     setVehicles([]);
  //   } finally {
  //     setVehicleLoading(false);
  //   }
  // };
  useEffect(() => {
    fetchChargers();
  }, [station]); // Khi station thay đổi, fetch lại chargers

  //  Auto-select charger from QR code
  useEffect(() => {
    if (preSelectedPointId && chargers.length > 0 && !selectedCharger) {
      const charger = chargers.find((c) => c.pointId === preSelectedPointId);
      if (charger && charger.status === "AVAILABLE") {
        console.log(" Auto-selecting charger from QR:", charger);
        setSelectedCharger(charger);
        // Skip to vehicle selection
        //setView("vehicles");
        //fetchVehicles();
      } else if (charger) {
        setError(
          `Trụ sạc ${charger.name} hiện không khả dụng. Vui lòng chọn trụ khác.`
        );
      } else {
        setError("Không tìm thấy trụ sạc từ mã QR. Vui lòng chọn trụ khác.");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preSelectedPointId, chargers, selectedCharger]);

  // --- CÁC HÀM XỬ LÝ SỰ KIỆN ---

  const handleSelectCharger = (charger) => {
    if (charger.status === "AVAILABLE") {
      setSelectedCharger(charger);
    }
  };
  // const handleSelectVehicle = (vehicle) => {
  //   setSelectedVehicle(vehicle);
  // };

  // COMMENTED - không cần chuyển sang màn hình chọn xe nữa
  // const handleProceedToVehicleSelection = () => {
  //   if (!selectedCharger) return;
  //   setView("vehicles");
  //   fetchVehicles();
  // };

  // COMMENTED - không cần quay lại nữa
  // const handleGoBackToChargerSelection = () => {
  //   setView("chargers");
  //   setError(null);
  // };

  // --- MỚI: Bắt đầu sạc trực tiếp với vehicleId từ localStorage ---
  const handleConfirmAndStartCharging = async () => {
    if (!selectedCharger || !selectedVehicleId) {
      setError("Vui lòng chọn trụ sạc và xe.");
      return;
    }
    setIsStarting(true);
    try {
      await onStartCharging(selectedCharger, selectedVehicleId, targetSoc); // Dùng vehicleId thay vì vehicle object
      onClose();
    } catch (err) {
      console.error(err);
      setError("Không thể bắt đầu sạc.");
    } finally {
      setIsStarting(false);
    }
  };

  // --- CÁC HÀM TIỆN ÍCH CHO GIAO DIỆN ---
  const formatPower = (powerString) => {
    if (!powerString) return "N/A";
    const match = powerString.match(/\d+/); // lấy ra số trong chuỗi
    return match ? `${match[0]} KW` : powerString;
  };

  const getChargerIcon = (status) => {
    switch (status) {
      case "AVAILABLE":
        return <PowerIcon className="w-10 h-10 text-gray-500" />;
      case "CHARGING":
        return <BoltIcon className="w-10 h-10 text-emerald-600" />;
      default:
        return <PowerIcon className="w-10 h-10 text-gray-400" />;
    }
  };

  const getChargerStatusText = (status) => {
    switch (status) {
      case "AVAILABLE":
        return "Sẵn sàng";
      case "CHARGING":
        return "Đang sạc";
      default:
        return "Không khả dụng";
    }
  };

  // --- RENDER ---

  const renderChargerView = () => (
    <>
      <div className="px-8 pt-7 pb-5 border-b bg-white sticky top-0 z-20">
        <label
          htmlFor="soc-slider"
          className="block font-semibold text-gray-700 mb-2"
        >
          Sạc đến mức pin mong muốn:{" "}
          <span className="font-bold text-emerald-600">{targetSoc}%</span>
        </label>

        <input
          id="soc-slider"
          type="range"
          min="10"
          max="100"
          step="1"
          value={targetSoc}
          onChange={(e) => setTargetSoc(parseInt(e.target.value))}
          className={`
    w-full h-2 rounded-lg cursor-pointer appearance-none 
    transition-all duration-300

    ${targetSoc < 20 ? "bg-red-300 accent-red-600" : ""}
    ${
      targetSoc >= 20 && targetSoc <= 50
        ? "bg-yellow-300 accent-yellow-500"
        : ""
    }
    ${targetSoc > 50 ? "bg-emerald-300 accent-emerald-600" : ""}
  `}
        />

        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>10%</span>
          <span>100%</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-8 py-7 modal-body-scroll">
        {chargerLoading ? (
          <div className="text-center py-10">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="text-center py-10">
            <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-500 font-semibold">{error}</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-4">
              {chargers.map((charger) => (
                <div
                  key={charger.pointId}
                  onClick={() => handleSelectCharger(charger)}
                  className={`bg-white border-2 rounded-2xl p-4 text-center transition-all duration-300 relative ${
                    charger.status === "AVAILABLE"
                      ? "cursor-pointer hover:-translate-y-1"
                      : "cursor-not-allowed opacity-70"
                  } ${
                    selectedCharger?.pointId === charger.pointId
                      ? "border-emerald-500 scale-[1.02]"
                      : "border-gray-200"
                  }`}
                >
                  {selectedCharger?.pointId === charger.pointId && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-emerald-600 text-white rounded-full flex items-center justify-center">
                      <CheckCircleIcon className="w-6 h-6" />
                    </div>
                  )}
                  <div className="h-12 flex items-center justify-center mb-2">
                    {getChargerIcon(charger.status)}
                  </div>
                  <h3 className="text-lg font-extrabold text-gray-900 mb-1">
                    {charger.name}
                  </h3>
                  <p className="text-sm text-gray-600 my-0.5 font-semibold">
                    {formatPower(charger.chargingPower)}
                  </p>
                  <p className="text-xs text-gray-500 my-0.5 mb-2 font-medium">
                    {charger.connectorType}
                  </p>
                  <div
                    className={`inline-block px-3 py-1 rounded-xl text-xs font-bold uppercase mt-1 ${
                      charger.status === "AVAILABLE"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {getChargerStatusText(charger.status)}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      <div className="px-8 py-5 border-t flex justify-end gap-3">
        <button
          className="px-7 py-3.5 rounded-xl font-bold bg-gray-100 text-gray-700 hover:bg-gray-200"
          onClick={onClose}
        >
          Hủy
        </button>
        {/* COMMENTED - nút Tiếp tục cũ */}
        {/* <button
          className="px-7 py-3.5 rounded-xl font-bold bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          onClick={handleProceedToVehicleSelection}
          disabled={!selectedCharger}
        >
          Tiếp tục
        </button> */}

        {/* MỚI - nút Bắt đầu sạc trực tiếp */}
        <button
          className="px-7 py-3.5 rounded-xl font-bold bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
          onClick={handleConfirmAndStartCharging}
          disabled={!selectedCharger || !selectedVehicleId || isStarting}
        >
          {isStarting ? (
            <BoltIcon className="w-5 h-5 animate-spin" />
          ) : (
            <BoltIcon className="w-5 h-5" />
          )}
          {isStarting ? "Đang bắt đầu..." : "Bắt đầu sạc"}
        </button>
      </div>
    </>
  );
  // =================== COMMENTED - renderVehicleView CŨ - KHÔNG DÙNG NỮA ===================
  // const renderVehicleView = () => (
  //   <>
  //     {/* SLIDER FIXED AT TOP */}
  //     {vehicles.length > 0 && (
  //       <div className="px-8 pt-7 pb-5 border-b bg-white sticky top-0 z-20">
  //         <label
  //           htmlFor="soc-slider"
  //           className="block font-semibold text-gray-700 mb-2"
  //         >
  //           Sạc đến mức pin mong muốn:{" "}
  //           <span className="font-bold text-emerald-600">{targetSoc}%</span>
  //         </label>
  //         <input
  //           id="soc-slider"
  //           type="range"
  //           min="10"
  //           max="100"
  //           step="1"
  //           value={targetSoc}
  //           onChange={(e) => setTargetSoc(parseInt(e.target.value))}
  //           className="w-full h-2 rounded-lg cursor-pointer appearance-none transition-all duration-300"
  //         />
  //         <div className="flex justify-between text-xs text-gray-500 mt-1">
  //           <span>10%</span>
  //           <span>100%</span>
  //         </div>
  //       </div>
  //     )}
  //     {/* VEHICLE LIST (SCROLLABLE) */}
  //     <div className="flex-1 overflow-y-auto px-8 py-7">
  //       {vehicleLoading ? (
  //         <div className="text-center py-10">
  //           <ArrowPathIcon className="w-10 h-10 text-emerald-500 animate-spin mx-auto" />
  //           <p>Đang tải danh sách xe...</p>
  //         </div>
  //       ) : error ? (
  //         <div className="text-center py-10">
  //           <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
  //           <p className="text-red-500 font-semibold">{error}</p>
  //         </div>
  //       ) : (
  //         <div className="space-y-3 mt-2">
  //           {vehicles.length > 0 ? (
  //             vehicles.map((vehicle) => (
  //               <div
  //                 key={vehicle.vehicleId}
  //                 onClick={() => handleSelectVehicle(vehicle)}
  //                 className="flex items-center gap-4 rounded-lg border-2 p-4 cursor-pointer transition-all"
  //               >
  //                 <TruckIcon className="h-8 w-8 text-gray-600" />
  //                 <div>
  //                   <p className="font-semibold">{vehicle.brand} {vehicle.model}</p>
  //                   <p className="text-sm text-gray-500">{vehicle.licensePlate}</p>
  //                   <p className="text-sm text-gray-500">Pin: <span className="font-bold">{vehicle.currentSocPercent}%</span></p>
  //                 </div>
  //                 {selectedVehicle?.vehicleId === vehicle.vehicleId && (
  //                   <CheckCircleIcon className="h-6 w-6 text-emerald-600 ml-auto" />
  //                 )}
  //               </div>
  //             ))
  //           ) : (
  //             <p className="text-center text-gray-500">Bạn chưa có phương tiện nào.</p>
  //           )}
  //         </div>
  //       )}
  //     </div>
  //     {/* FOOTER BUTTONS */}
  //     <div className="px-8 py-5 border-t flex justify-between gap-3 bg-white">
  //       <button
  //         className="px-7 py-3.5 rounded-xl font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center gap-2"
  //         onClick={handleGoBackToChargerSelection}
  //       >
  //         <ChevronLeftIcon className="w-5 h-5" /> Quay lại
  //       </button>
  //       <button
  //         className="px-7 py-3.5 rounded-xl font-bold bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
  //         onClick={handleConfirmAndStartCharging}
  //         disabled={!selectedVehicle || isStarting}
  //       >
  //         {isStarting ? (
  //           <ArrowPathIcon className="w-5 h-5 animate-spin" />
  //         ) : (
  //           <BoltIcon className="w-5 h-5" />
  //         )}
  //         {isStarting ? "Đang bắt đầu..." : "Bắt đầu sạc"}
  //       </button>
  //     </div>
  //   </>
  // );
  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-5"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-[700px] w-full max-h-[90vh] flex flex-col shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-8 py-7 border-b relative">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">
              {/* COMMENTED - title cũ có chuyển đổi view */}
              {/* {view === "chargers" ? "Chọn trụ sạc" : "Chọn phương tiện"} */}
              {/* MỚI - chỉ hiển thị "Chọn trụ sạc" */}
              Chọn trụ sạc
            </h2>
            <p className="text-gray-600 mt-1">{station.stationName}</p>
          </div>
          <button
            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-red-100 hover:text-red-600"
            onClick={onClose}
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        {/* COMMENTED - render có điều kiện view cũ */}
        {/* {view === "chargers" ? renderChargerView() : renderVehicleView()} */}
        {/* MỚI - chỉ render charger view */}
        {renderChargerView()}
      </div>
    </div>
  );
}
