// --- GHI CHÚ: THAY ĐỔI 1 ---
// Thêm 'useRef' và 'useCallback' để quản lý polling (setInterval)
// và xử lý state một cách chính xác, ổn định.
import React, { useState, useEffect, useRef, useCallback } from "react";
import toast from "react-hot-toast";
import { chargingPointsAPI, vehiclesAPI } from "../../lib/apiServices.js";
import { useParams, useNavigate, useLocation } from "react-router-dom";

import {
  StopCircleIcon,
  ArrowUturnLeftIcon,
  TruckIcon,
} from "@heroicons/react/24/solid";
import LoadingSpinner from "../../components/loading_spins/LoadingSpinner.jsx";

export default function ChargingSessionPage() {
  const { sessionId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [isStopping, setIsStopping] = useState(false);

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- State cho danh sách xe ---
  const [myVehicles, setMyVehicles] = useState([]);
  const [loadingVehicle, setLoadingVehicle] = useState(false);

  // Sử dụng 'useRef' thay vì 'const' bên trong useEffect.
  // Điều này đảm bảo 'timerRef' tồn tại vĩnh viễn qua các lần render,
  // cho phép chúng ta dừng (clearInterval) nó một cách đáng tin cậy.
  const timerRef = useRef(null);

  const formatTime = (sec) => {
    const totalSeconds = sec || 0;
    const m = Math.floor(totalSeconds / 60);
    const s = Math.floor(totalSeconds % 60);
    // --- GHI CHÚ: SỬA LỖI CÚ PHÁP ---

    return `${m}:${s.toString().padStart(2, "0")}`;
  };
  const formatPower = (powerString) => {
    if (!powerString) return "N/A";
    const match = powerString.match(/\d+/); // lấy ra số trong chuỗi
    // --- GHI CHÚ: SỬA LỖI CÚ PHÁP ---
    return match ? `${match[0]} KW` : powerString;
  };

  useEffect(() => {
    // 1. Nếu URL đã CÓ sessionId, hook này không cần làm gì
    if (sessionId) {
      return;
    }

    const activeId = localStorage.getItem("activeSessionId");
    console.log(
      "useEffect: localStorage activeSessionId raw =",
      activeId,
      "type=",
      typeof activeId
    );

    // guard: nếu activeId là 'null' hoặc 'undefined' string, coi như không có
    if (!activeId || activeId === "null" || activeId === "undefined") {
      console.log("useEffect: không có session hợp lệ trong localStorage");
      setLoading(false);
      return;
    }

    const targetPath = `/driver/session/${activeId}`;
    if (location.pathname === targetPath) {
      console.log("useEffect: đã ở đúng đường dẫn target, không redirect");
      return;
    }

    console.log("useEffect: redirect tới", targetPath);
    navigate(targetPath, { replace: true });
  }, [location.pathname, sessionId, navigate]);

  const fetchSession = useCallback(async () => {
    // Nếu không có ID, hoặc timer đã bị dừng (do hoàn tất) thì không làm gì cả
    if (!sessionId) return;

    try {
      const res = await chargingPointsAPI.simulateCharging(sessionId);
      if (res.data.result) {
        const sessionData = res.data.result;
        console.log("Dữ liệu phiên sạc tải về:", sessionData);
        setSession(sessionData);
        setError(null);

        const status = sessionData.status;

        // Nếu hoàn tất, xóa key và dừng timer
        if (status === "COMPLETED" || status === "STOPPED") {
          console.log("Phiên sạc kết thúc, xóa localStorage và dừng polling.");
          // File này chỉ removeItem khi thực sự hoàn tất
          localStorage.removeItem("currentSessionId");

          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
        }
      } else {
        throw new Error("API không trả về dữ liệu hợp lệ.");
      }
    } catch (err) {
      console.error("Lỗi tải session sạc:", err);
      setError(err);

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    } finally {
      // Chỉ tắt loading lần đầu
      if (loading) {
        setLoading(false);
      }
    }
  }, [sessionId, loading]); // Phụ thuộc vào sessionId và loading (để tắt)

  // --- GHI CHÚ: THAY ĐỔI 2.3 (BLOCK 3) ---
  // Đây là 'useEffect' chính để quản lý polling VÀ xử lý lỗi "ĐỔI TAB".
  useEffect(() => {
    if (!sessionId) return;

    // --- Xử lý khi người dùng quay lại tab ---
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        // Lấy status từ state *hiện tại*
        const currentStatus = session?.status;

        // === [ TỐI ƯU HÓA THEO YÊU CẦU CỦA BẠN ] ===
        // Chỉ gọi API nếu phiên sạc CHƯA KẾT THÚC
        if (currentStatus !== "COMPLETED" && currentStatus !== "STOPPED") {
          console.log("Quay lại tab, phiên đang chạy, làm mới...");
          fetchSession(); // Lấy dữ liệu mới ngay lập tức

          // KIỂM TRA VÀ KHỞI ĐỘNG LẠI TIMER NẾU NÓ ĐÃ TẮT
          // (Phòng trường hợp timer bị dừng do lỗi mạng tạm thời)
          if (!timerRef.current) {
            console.log("Polling đã TẮT, khởi động lại...");
            timerRef.current = setInterval(fetchSession, 2000);
          }
        } else {
          console.log("Quay lại tab, phiên đã kết thúc. Không gọi API.");
        }
      }
    };
    //cảm biến sự kiện khi chuyển tab
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // --- Tải lần đầu và Bật polling ---
    fetchSession(); // Tải lần đầu

    // Bật polling NẾU timer chưa chạy
    if (!timerRef.current) {
      console.log("Bật polling...");
      timerRef.current = setInterval(fetchSession, 2000);
      // Hàm fetchSession sẽ tự xử lý việc dừng timer nếu sạc đã xong
    }

    // Dọn dẹp "cảm biến" khi hook chạy lại
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [sessionId, fetchSession, session?.status]); // Phụ thuộc vào session.status

  // Thêm 'useEffect' này để dọn dẹp timer KHI RỜI KHỎI TRANG (unmount).
  // Mảng rỗng '[]' đảm bảo nó CHỈ chạy 1 lần duy nhất khi component bị hủy.
  useEffect(() => {
    return () => {
      console.log("Component unmount, dọn dẹp timer.");
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []); // <-- Mảng rỗng là mấu chốt

  // Tải danh sách xe nếu không có session hoặc có lỗi

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
      await chargingPointsAPI.stopCharging(sessionId);
      toast.success("Đã dừng phiên sạc thành công.");

      // 1. Dừng polling ngay lập tức
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
        console.log("Đã dừng polling.");
      }

      // 2. Xóa localStorage
      localStorage.removeItem("currentSessionId");
      localStorage.removeItem("activeSessionId");

      // 3. Cập nhật state session để hiển thị màn hình hoàn tất NGAY LẬP TỨC
      setSession((prev) => ({
        ...prev,
        status: "STOPPED",
      }));

      // 4. Gọi lại API để lấy dữ liệu cuối cùng (chi phí, năng lượng...)
      await fetchSession();
    } catch (err) {
      console.error("Lỗi khi dừng phiên sạc:", err);
      toast.error("Không thể dừng phiên sạc, vui lòng thử lại.");
      setIsStopping(false); // Chỉ tắt loading khi lỗi
    }
    // Không cần finally ở đây vì đã xử lý trong logic thành công
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
                  <LoadingSpinner />
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
        <LoadingSpinner />
        <br /><span className="ml-2 text-gray-700">
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
  } // 4. MÀN HÌNH HOÀN TẤT - CARD LAYOUT DESIGN
  if (
    (session && isStopping) ||
    session.status === "COMPLETED" ||
    session.status === "STOPPED"
  ) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Back Button */}
        <button
          onClick={() => {
            localStorage.removeItem("currentSessionId");
            localStorage.removeItem("activeSessionId");
            setSession(null);
            navigate("/driver/map");
          }}
          className="absolute top-6 left-6 text-gray-600 hover:text-gray-900 transition-colors z-10"
        >
          <ArrowUturnLeftIcon className="w-6 h-6" />
        </button>

        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex justify-center">
            <div className="w-full max-w-2xl bg-white shadow-xl rounded-3xl overflow-hidden">
              {/* Station Info Header */}
              <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-8 py-6 text-center">
                <h2 className="text-xl mb-1">{session.stationName || "N/A"}</h2>
                <p className="text-emerald-100 text-sm">
                  Trạm sạc nhanh DC • Đầu sạc
                </p>
              </div>

              {/* Complete Status */}
              <div className="bg-white px-8 py-8">
                {/* Success Icon */}
                <div className="flex flex-col items-center mb-8">
                  <div className="relative mb-4">
                    <div className="absolute inset-0 bg-emerald-400 blur-2xl opacity-30 rounded-full"></div>
                    <div className="relative bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-600 p-6 rounded-full shadow-xl shadow-emerald-500/30">
                      <svg
                        className="w-16 h-16 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    Sạc hoàn tất!
                  </h3>
                  <p className="text-gray-600">Cảm ơn bạn đã sử dụng dịch vụ</p>
                </div>

                {/* Summary Stats - 3 Cards */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                  {/* Time Card */}
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl p-4 text-center shadow-sm hover:shadow-md transition-shadow">
                    <svg
                      className="w-6 h-6 text-blue-600 mx-auto mb-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div className="text-xs text-blue-600 mb-1 uppercase tracking-wider">
                      Thời gian
                    </div>
                    <div className="text-2xl text-blue-900 font-bold tabular-nums">
                      {formatTime((session.durationMin || 0) * 60)}
                    </div>
                  </div>

                  {/* Energy Card */}
                  <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-200 rounded-xl p-4 text-center shadow-sm hover:shadow-md transition-shadow">
                    <svg
                      className="w-6 h-6 text-emerald-600 mx-auto mb-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div className="text-xs text-emerald-600 mb-1 uppercase tracking-wider">
                      Năng lượng
                    </div>
                    <div className="text-2xl text-emerald-900 font-bold tabular-nums">
                      {(session.energyConsumedKwh || 0).toFixed(1)} kWh
                    </div>
                  </div>

                  {/* Cost Card */}
                  <div className="bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-200 rounded-xl p-4 text-center shadow-sm hover:shadow-md transition-shadow">
                    <svg
                      className="w-6 h-6 text-amber-600 mx-auto mb-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div className="text-xs text-amber-600 mb-1 uppercase tracking-wider">
                      Chi phí
                    </div>
                    <div className="text-2xl text-amber-900 font-bold tabular-nums">
                      {Math.round(
                        Number(session.costTotal) || 0
                      ).toLocaleString()}{" "}
                      VND
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => {
                    localStorage.removeItem("currentSessionId");
                    localStorage.removeItem("activeSessionId");
                    setSession(null);
                    navigate("/driver/map");
                  }}
                  className="w-full bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-700 hover:from-emerald-600 hover:via-emerald-700 hover:to-emerald-800 text-white py-6 text-lg font-semibold rounded-xl shadow-xl shadow-emerald-500/40 hover:shadow-emerald-600/60 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Quay về bản đồ
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // 5. MÀN HÌNH ĐANG SẠC - CARD LAYOUT DESIGN
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <button
        onClick={() => navigate("/driver/map")}
        className="absolute top-6 left-6 text-gray-600 hover:text-gray-900 transition-colors z-10"
      >
        <ArrowUturnLeftIcon className="w-6 h-6" />
      </button>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex justify-center">
          <div className="w-full max-w-2xl bg-white shadow-xl rounded-3xl overflow-hidden">
            {/* Station Info Header */}
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-8 py-6 text-center">
              <h2 className="text-xl mb-1">
                {session.stationName || "Đang sạc..."}
              </h2>
              <p className="text-emerald-100 text-sm">
                Trạm sạc nhanh DC • Đầu sạc
              </p>
            </div>

            {/* Charging Content */}
            <div className="bg-white px-10 py-12">
              {/* Lightning Icon with Glow */}
              <div className="flex justify-center mb-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-emerald-400 blur-3xl opacity-30 rounded-full animate-pulse"></div>
                  <div className="relative bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-600 p-6 rounded-full shadow-2xl shadow-emerald-500/40">
                    <svg
                      className="w-20 h-20 fill-white text-white drop-shadow-lg"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div className="text-center mb-10">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 px-8 py-3 rounded-full text-sm tracking-wider uppercase border-2 border-emerald-200 shadow-sm">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  Đang nạp điện
                </div>
              </div>

              {/* Main Stats Cards - 3 Column Grid */}
              <div className="grid grid-cols-3 gap-5 mb-10">
                {/* Time Card */}
                <div className="bg-gradient-to-br from-blue-50 via-blue-50 to-blue-100 border-2 border-blue-200 rounded-2xl p-7 text-center shadow-lg shadow-blue-100/50 hover:shadow-xl hover:shadow-blue-200/60 transition-all duration-300 hover:-translate-y-1">
                  <div className="flex justify-center mb-4">
                    <div className="bg-blue-100 p-3 rounded-xl">
                      <svg
                        className="w-9 h-9 text-blue-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="text-xs text-blue-600 mb-3 uppercase tracking-wider">
                    Thời gian
                  </div>
                  <div className="text-5xl text-blue-900 tabular-nums mb-2">
                    {formatTime((session.durationMin || 0) * 60)}
                  </div>
                  <div className="text-xs text-blue-500 mt-1">phút:giây</div>
                </div>

                {/* Energy Card */}
                

                
                <div className="bg-gradient-to-br from-emerald-50 via-emerald-50 to-emerald-100 border-2 border-emerald-200 rounded-2xl p-7 text-center shadow-lg shadow-emerald-100/50 hover:shadow-xl hover:shadow-emerald-200/60 transition-all duration-300 hover:-translate-y-1">
                  <div className="flex justify-center mb-4">
                    <div className="bg-emerald-100 p-3 rounded-xl">
                      <svg
                        className="w-9 h-9 text-emerald-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="text-xs text-emerald-600 mb-3 uppercase tracking-wider">
                    Năng lượng
                  </div>
                  <div className="text-5xl text-emerald-900 tabular-nums mb-2">
                    {(session.energyConsumedKwh || 0).toFixed(1)}
                  </div>
                  <div className="text-xs text-emerald-500 mt-1">kWh</div>
                </div>



             

                {/* Battery Card */}
                <div className="bg-gradient-to-br from-amber-50 via-amber-50 to-amber-100 border-2 border-amber-200 rounded-2xl p-7 text-center shadow-lg shadow-amber-100/50 hover:shadow-xl hover:shadow-amber-200/60 transition-all duration-300 hover:-translate-y-1">
                  <div className="flex justify-center mb-4">
                    <div className="bg-amber-100 p-3 rounded-xl">
                      <svg
                        className="w-9 h-9 text-amber-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 12h10m-5-5v10m5-5a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="text-xs text-amber-600 mb-3 uppercase tracking-wider">
                    Pin
                  </div>
                  <div className="text-5xl text-amber-900 tabular-nums mb-2">
                    {session.currentSocPercent || 0}
                  </div>
                  <div className="text-xs text-amber-500 mt-1">%</div>
                </div>
              </div>


              

              {/* Cost Display - Highlighted */}
              {/*   
              

              <div className="relative bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 rounded-3xl p-10 mb-10 text-center shadow-2xl shadow-emerald-500/40 overflow-hidden">
              
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16"></div>

                <div className="relative">
                  <div className="text-emerald-100 text-xs uppercase tracking-widest mb-3">
                    Tổng chi phí
                  </div>
                  <div className="flex items-end justify-center gap-2 mb-1">
                    <div className="text-7xl text-white tabular-nums drop-shadow-lg">
                      {Math.round(session.currentCost || 0).toLocaleString()}
                    </div>
                    <div className="text-3xl text-emerald-50 mb-3">VND</div>
                  </div>
                  <div className="inline-block bg-white/20 backdrop-blur-sm text-emerald-50 px-4 py-2 rounded-full text-xs mt-2">
                    Đơn giá: {(session.pricePerKwh || 0).toLocaleString()}{" "}
                    VND/kWh
                  </div>
                </div>
              </div>
               */}


               

              {/* Progress Bar */}
              <div className="space-y-4 mb-10 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-7 border border-gray-200 shadow-inner">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Tiến độ sạc</span>
                  <div className="flex items-center gap-2">
                    <div className="text-2xl text-emerald-600 tabular-nums">
                      {(session.currentSocPercent || 0).toFixed(1)}
                    </div>
                    <span className="text-sm text-gray-500">%</span>
                  </div>
                </div>
                <div className="relative h-5 bg-white rounded-full overflow-hidden shadow-inner border border-gray-200">
                  <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 rounded-full transition-all duration-300 shadow-lg"
                    style={{ width: `${session.currentSocPercent || 0}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>{" "}
                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/50"></div>
                  </div>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">0%</span>
                  <span className="text-emerald-600">
                    Công suất: {formatPower(session.powerOutput) || "N/A"}
                  </span>
                  <span className="text-gray-500">100%</span>
                </div>
              </div>

              {/* Stop Button */}
              <button
                onClick={handleStopSession}
                disabled={isStopping}
                className="w-full bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-700 hover:from-emerald-600 hover:via-emerald-700 hover:to-emerald-800 text-white py-8 text-xl rounded-2xl shadow-2xl shadow-emerald-500/50 hover:shadow-emerald-600/70 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] border-2 border-emerald-400/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isStopping ? (
                  <span className="flex items-center justify-center gap-2">
                    <Spinner animation="border" size="sm" />
                    Đang xử lý...
                  </span>
                ) : (
                  "DỪNG SẠC"
                )}
              </button>

              {/* Additional Info */}
              <div className="mt-8 pt-8 border-t-2 border-gray-200 grid grid-cols-2 gap-8 text-center">
                <div className="space-y-2">
                  
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
