import React, { useState, useEffect } from "react";
import { Spinner } from "react-bootstrap";
import { chargingPointsAPI, vehiclesAPI } from "../../lib/apiServices.js";
import { useParams, useNavigate } from "react-router-dom";

import {
  StopCircleIcon,
  ArrowUturnLeftIcon,
  TruckIcon,
} from "@heroicons/react/24/solid";

export default function ChargingSessionPage() {
  const { sessionId } = useParams();
  

  const navigate = useNavigate();
  const [isStopping, setIsStopping] = useState(false);

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- State cho danh sách xe ---
  const [myVehicles, setMyVehicles] = useState([]); // Đổi thành mảng
  const [loadingVehicle, setLoadingVehicle] = useState(false);

  const formatTime = (sec) => {
    const totalSeconds = sec || 0;
    const m = Math.floor(totalSeconds / 60);
    const s = Math.floor(totalSeconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };
  const formatPower = (powerString) => {
    if (!powerString) return "N/A";
    const match = powerString.match(/\d+/); // lấy ra số trong chuỗi
    return match ? `${match[0]} KW` : powerString;
  };

  
  useEffect(() => {
    // 1. Nếu URL đã CÓ sessionId, hook này không cần làm gì
    if (sessionId) {
      return;
    }

    // 2. Nếu URL KHÔNG có sessionId
    const activeId = localStorage.getItem("currentSessionId");

    if (activeId) {
      // 3. Nếu tìm thấy, lập tức CHUYỂN HƯỚNG
      console.log("Phát hiện session trong localStorage, đang chuyển hướng...");
      navigate(`/driver/session/${activeId}`, { replace: true });
    } else {
      // 4. Nếu CẢ HAI đều không có (không URL, không localStorage)
      //    thì mới tắt loading để hiển thị trang "Không có phiên sạc"
      setLoading(false);
    }
  }, [sessionId, navigate]);

  //   ---  TẢI THÔNG TIN SESSION SẠC VỚI POLLING ---
  useEffect(() => {
    // Hook này chỉ chạy nếu CÓ sessionId (sau khi Hook 2 đã xử lý)
    if (!sessionId) {
      return;
    }

    const timerRef = { current: null };

    const fetchSession = async () => {
      try {
        const res = await chargingPointsAPI.simulateCharging(sessionId);
        if (res.data.result) {
          const sessionData = res.data.result;
          console.log("Dữ liệu phiên sạc tải về:", sessionData);
          setSession(sessionData);
          setError(null);

          // ===  CHỈ SET KHI API GỌI THÀNH CÔNG ===
          if (localStorage.getItem("currentSessionId") !== sessionId) {
            console.log("Phiên sạc hợp lệ, set localStorage:", sessionId);
            localStorage.setItem("currentSessionId", sessionId);
          }

          // === LOGIC XÓA LOCALSTORAGE KHI HOÀN TẤT ===
          const status = sessionData.status;
          if (status === "COMPLETED" || status === "STOPPED") {
            console.log(
              "Phiên sạc kết thúc, xóa localStorage và dừng polling."
            );
            localStorage.removeItem("currentSessionId");

            // Dừng polling
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
          }
        } else {
          throw new Error("API không trả về dữ liệu hợp lệ.");
        }
      } catch (err) {
        console.error("Lỗi tải session sạc (ID có thể không hợp lệ):", err);
        setError(err);
        setSession(null);

        // ===  XÓA KEY HỎNG NẾU GỌI API LỖI ===
        localStorage.removeItem("currentSessionId");

        // Dừng polling nếu bị lỗi (ví dụ: 404 Not Found)
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      } finally {
        setLoading(false);
      }
    };

    // Tải lần đầu
    fetchSession();

    // Bật polling
    // Chỉ bật polling NẾU chưa có lỗi và chưa hoàn thành
    if (!error && !session) { // Kiểm tra !session để đảm bảo logic hoàn thành ở trên đã chạy
      timerRef.current = setInterval(fetchSession, 2000); // mỗi 2 giây
    }
    
    // Logic trong fetchSession sẽ tự hủy timer khi hoàn tất.
    // Nếu fetchSession lần đầu bị lỗi, nó cũng sẽ tự hủy timer.

    // Dọn dẹp KHI component unmount
    return () => {
      
      console.log("Component unmount, dọn dẹp timer.");
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [sessionId]); // Phụ thuộc vào sessionId



  //   ---  TẢI THÔNG TIN XE ---
  useEffect(() => {
    // CẬP NHẬT ĐIỀU KIỆN: Tải xe nếu không có session HOẶC nếu có lỗi
    if (!sessionId || error) {
      const fetchVehicleInfo = async () => {
        setLoadingVehicle(true);
        try {
          const response = await vehiclesAPI.getMyVehicles();
          console.log("Kết quả trả về từ API:", response.data);
          setMyVehicles(response.data.result || []);
        } catch (err) {
          console.error("Lỗi tải thông tin xe:", err);
          setMyVehicles([]);
        } finally {
          setLoadingVehicle(false);
        }
      };
      fetchVehicleInfo();
    }
  }, [sessionId, error]);



  // Hàm dừng phiên sạc
  const handleStopSession = async () => {
    if (!sessionId) return;
    setIsStopping(true);
    try {
      console.log("Gửi yêu cầu dừng phiên sạc:", sessionId);
      await chargingPointsAPI.stopCharging(sessionId);
    } catch (err) {
      console.error("Lỗi khi dừng phiên sạc:", err);
      alert("Không thể dừng phiên sạc, vui lòng thử lại.");
    } finally {
      setIsStopping(false);
    }
  };

  

  // 1. MÀN HÌNH HƯỚNG DẪN (NẾU KHÔNG CÓ ID HOẶC BỊ LỖI)
  if (!sessionId || error) {
    return (
      <div className="min-h-screen bg-gray-50 px-8 py-10">
        <div className="max-w-6xl mx-auto text-center">
          {/* Thông báo không có phiên sạc */}
          <div className="bg-white rounded-2xl shadow-sm py-16 px-6 border mb-8">
            <div className="text-5xl mb-4">⚡</div>
            <h2 className="text-2xl font-semibold mb-2">
              {error
                ? "Phiên sạc không hợp lệ"
                : "Hiện không có phiên sạc nào đang diễn ra"}
            </h2>
            <p className="text-gray-600">
              Vui lòng chọn trạm sạc từ tab <b>“Bản đồ trạm sạc”</b> để bắt đầu.
            </p>
            {error && (
              <p className=" text-sm mt-4">
                Chi tiết: Không tìm thấy phiên sạc
              </p>
            )}
          </div>

          {/* Grid hướng dẫn + thông tin xe */}
          <div className="grid md:grid-cols-2 gap-6">
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
            <div className="bg-white rounded-xl p-5 border text-left">
              <h3 className="text-lg font-semibold mb-4">
                Danh sách xe của bạn
              </h3>

              {loadingVehicle ? (
                <div className="flex justify-center items-center h-40">
                  <Spinner animation="border" size="sm" variant="secondary" />
                  <span className="ml-2 text-gray-500">
                    Đang tải thông tin xe...
                  </span>
                </div>
              ) : myVehicles.length > 0 ? (
                <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                  {myVehicles.map((vehicle) => (
                    <div
                      key={vehicle.vehicleId}
                      className="border rounded-lg p-3 bg-gray-50"
                    >
                      <div className="flex items-center mb-2">
                        <TruckIcon className="w-5 h-5 text-gray-600 mr-2" />
                        <p className="font-semibold text-base">
                          {vehicle.brandDisplayName || vehicle.brand || "N/A"} -{" "}
                          {vehicle.modelName || vehicle.model || "N/A"}
                        </p>
                      </div>
                      <div className="text-sm text-gray-700 space-y-1 pl-1">
                        <p>
                          Biển số:{" "}
                          <span className="font-medium">
                            {vehicle.licensePlate || "N/A"}
                          </span>
                        </p>
                        <p>
                          Pin hiện tại:{" "}
                          <span className="font-medium">
                            {vehicle.currentSocPercent ?? "N/A"}%
                          </span>
                        </p>
                        <p>
                          Dung lượng:{" "}
                          <span className="font-medium">
                            {vehicle.batteryCapacityKwh ?? "N/A"} kWh
                          </span>
                        </p>
                        <p>
                          Cổng sạc:{" "}
                          <span className="font-medium">
                            {vehicle.batteryType || "N/A"}
                          </span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm text-center">
                  Chưa có thông tin xe nào.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. MÀN HÌNH TẢI (CHỈ KHI ĐANG TẢI LẦN ĐẦU)
  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Spinner animation="border" variant="primary" />
        <span className="ml-2 text-gray-700">
          Đang tải dữ liệu phiên sạc...
        </span>
      </div>
    );
  }

  // 3. TRƯỜNG HỢP HIẾM: KHÔNG TẢI, KHÔNG LỖI, NHƯNG KHÔNG CÓ SESSION
  if (!session) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p className="text-gray-700">Không tìm thấy dữ liệu.</p>
      </div>
    );
  }

  // 4. MÀN HÌNH HOÀN TẤT 
  if (
    (session && isStopping) ||
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
              <span className="font-semibold">
                {session.stationName || "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Thời gian sạc:</span>
              <span className="font-semibold">
                {formatTime((session.durationMin || 0) * 60)} Phút
              </span>
            </div>
            <div className="flex justify-between">
              <span>Năng lượng đã nạp:</span>
              <span className="font-semibold">
                {(session.energyConsumedKwh || 0).toFixed(2)} kWh
              </span>
            </div>
            <div className="flex justify-between text-lg">
              <strong>Tổng chi phí:</strong>
              <strong className="text-blue-600">
                {(session.costTotal || 0).toLocaleString("vi-VN")}đ
              </strong>
            </div>
          </div>

          <button
           onClick={() => {
              // === THÊM LOGIC XÓA TẠI ĐÂY ===
              localStorage.removeItem("currentSessionId");
              setSession(null);
              navigate("/driver/map");
            }}
            className="w-full bg-emerald-600 text-white font-bold py-3 rounded-lg hover:bg-emerald-700 flex items-center justify-center gap-2"
          >
            <ArrowUturnLeftIcon className="w-5 h-5" />
            Quay về bản đồ
          </button>
          
        </div>
      </div>
    );
  }

  // 5. MÀN HÌNH ĐANG SẠC (ĐÃ SỬA TÊN TRƯỜNG & SỬA LỖI TYPO)
  return (
    <div className="min-h-screen bg-gray-50 px-8 py-10">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8">
          {/* CỘT TRÁI: Thông tin sạc */}
          <div className="bg-white rounded-2xl shadow-sm border p-6 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">
                Đang sạc tại <b>{session.stationName || "N/A"}</b>
              </h2>
              <span className="text-green-700 bg-green-100 px-3 py-1 rounded-lg text-sm font-medium">
                {/* Sử dụng session.status */}
                {session.status || "Đang sạc"}
              </span>
            </div>

            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Mức pin hiện tại</span>
                {/* Sửa: Dùng currentSocPercent */}
                <span>{session.currentSocPercent || 0}%</span>
              </div>
              <div className="w-full bg-gray-200 h-4 rounded-full overflow-hidden">
                <div
                  className="bg-green-600 h-full"
                  style={{
                    // Sửa: Dùng currentSocPercent
                    width: `${session.currentSocPercent || 0}%`,
                    transition: "width 0.3s",
                  }}
                ></div>
              </div>
            </div>

            {/* BỎ các trường thiếu: plugType, voltage, batteryCapacity */}
            {/* <div className="grid grid-cols-2 gap-4 text-sm text-gray-700"> */}
            {/* <p>🔌 Loại cổng sạc: {session.plugType || "N/A"}</p> */}
            {/* <p>⚙️ Điện áp: {session.voltage || "N/A"}</p> */}
            {/* <p>🔋 Dung lượng pin: {session.batteryCapacity || "N/A"}</p> */}
            {/* Bạn có thể giữ lại tên trạm nếu muốn */}
            {/* <p>📍 Trạm: {session.stationName || "N/A"}</p> */}
            {/* </div> */}

            <div className="flex justify-between items-center border-t pt-4 text-gray-700">
              <div>
                <p className="text-sm">
                  Công suất: <b>
                    {/* Sửa: Dùng formatPower với powerOutput */}
                    {formatPower(session.powerOutput) || "N/A"}
                  </b>
                </p>
                <p className="text-sm">
                  Giá điện:{" "}
                  <b>{(session.pricePerKwh || 0).toLocaleString()}đ/kWh</b>
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Thời gian đã sạc</p>
                <p className="font-semibold text-lg">
                  {/* Sửa: Dùng elapsedTimeMinutes */}
                  {formatTime((session.durationMin || 0) * 60)}
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
                {/* Cập nhật xử lý null */}
                {session.estimatedTimeRemainingMinutes !== null
                  ? `${session.estimatedTimeRemainingMinutes} phút`
                  : "Đang tính..."}
              </div>
              <p className="text-gray-500 text-sm mb-2">
                Thời gian còn lại (ước tính)
              </p>
              <p className="text-gray-700 text-sm">
                Mục tiêu: <b>{session.targetSocPercent || 100}%</b>
              </p>
            </div>

            <div className="bg-white rounded-2xl border shadow-sm p-6">
              <h3 className="font-semibold text-gray-700 mb-3">
                {" "}
                Chi phí hiện tại
              </h3>
              <p className="text-3xl font-bold text-blue-600 mb-1">
                 {/* Sửa: Dùng currentCost */}
                {(session.currentCost || 0).toLocaleString()}đ
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
