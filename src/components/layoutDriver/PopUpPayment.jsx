import React, { useState } from "react";
import ZaloPayGateway from "../payment/ZaloPayGateway";

const formatCurrency = (value) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    Number(value || 0)
  );

// Link logo (bạn có thể đổi thành file logo import từ local)
const zalopayLogoUrl = "/zalopay/images/logo-zalopay.svg";

export default function PopUpPayment({
  isOpen,
  onClose,
  session,
  onProcessPayment,
}) {
  const [showZaloPayModal, setShowZaloPayModal] = useState(false);
  // Nếu không "mở" hoặc không có "session", component sẽ không hiển thị gì
  if (!isOpen || !session) return null;

  return (
    // Lớp mờ backdrop
    // Bấm vào lớp mờ này sẽ gọi hàm onClose
    <div
      className="fixed inset-0 bg-white bg-opacity-60 flex justify-center items-center z-50 p-4"
      onClick={onClose}
    >
      {/* Nội dung Modal */}
      {/* Thêm e.stopPropagation() để bấm vào modal không bị tắt */}
      <div
        className="bg-white p-6 rounded-xl shadow-xl max-w-sm w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header (Tiêu đề và nút X) */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Xác nhận Thanh toán</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 text-2xl"
          >
            &times;
          </button>
        </div>

        {/* Thông tin hóa đơn */}
        <div className="mb-6">
          <p className="text-gray-600">Trạm sạc: {session.stationName}</p>
          <p className="text-3xl font-bold text-blue-600">
            {formatCurrency(session.costTotal)}
          </p>
        </div>

        {/* Các phương thức thanh toán */}
        <div className="space-y-3">
          <button
            onClick={() => onProcessPayment(session.sessionId, "cash")}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-800 font-semibold rounded-lg hover:bg-gray-200 transition-all"
          >
            {/* Lưu ý: icon này dùng Bootstrap Icons. 
              Nếu bạn chưa cài, nó sẽ không hiện. Bạn có thể thay bằng icon khác.
            */}
            <i className="bi bi-cash-coin text-lg"></i>
            Trả tiền mặt
          </button>

          <button
            onClick={() => setShowZaloPayModal(true)}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border border-blue-500 text-blue-500 font-semibold rounded-lg hover:bg-blue-50 transition-all"
          >
            <img src={zalopayLogoUrl} alt="ZaloPay" className="h-6" />
            Thanh toán qua ZaloPay
          </button>
        </div>
      </div>

      {/* ZaloPay Gateway Modal */}
      <ZaloPayGateway
        show={showZaloPayModal}
        onHide={() => setShowZaloPayModal(false)}
        sessionId={session?.sessionId}
        amount={session?.costTotal}
      />
    </div>
  );
}
