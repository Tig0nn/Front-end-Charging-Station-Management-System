// src/components/UpgradeSummary.jsx
import React from "react";

const UpgradeSummary = ({
  selectedPlan,
  selectedPaymentMethod,
  onUpgrade,
  loading,
}) => {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-lg">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Tóm tắt đơn hàng</h3>
          <p className="text-gray-600 mt-1">
            Nâng cấp lên **{selectedPlan.name}** bằng **
            {selectedPaymentMethod.name}**
          </p>
        </div>
        <div className="text-3xl font-extrabold text-gray-900">
          {selectedPlan.price.toLocaleString("vi-VN")}đ
        </div>
      </div>
      <button
        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={onUpgrade}
        disabled={loading}
      >
        {loading ? "Đang xử lý..." : `Xác nhận và thanh toán`}
      </button>
    </div>
  );
};

export default UpgradeSummary;
