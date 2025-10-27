import React from "react";
import { FaCheckCircle, FaClock, FaPercent } from "react-icons/fa";

const PlanCard = ({
  plan,
  isSelected,
  onSelect,
  mode = "driver", // "driver" | "admin" - mode để phân biệt context sử dụng
}) => {
  // Format giá tiền
  const formatPrice = (price) => {
    if (price === 0) return "Miễn phí";
    return (
      <>
        {price.toLocaleString("vi-VN")}đ
        <span className="text-base font-normal text-gray-500">
          /{plan.period || "tháng"}
        </span>
      </>
    );
  };

  // Format billing type để hiển thị
  const getBillingTypeLabel = (billingType) => {
    const typeMap = {
      MONTHLY_SUBSCRIPTION: "Theo tháng",
      PAY_AS_YOU_GO: "Trả theo lượt",
      PREPAID: "Trả trước",
      POSTPAID: "Trả sau",
    };
    return typeMap[billingType] || billingType;
  };

  const cardClasses = `relative rounded-2xl p-6 transition-all duration-300 ease-in-out ${
    mode === "driver" ? "cursor-pointer" : "cursor-default"
  } h-full flex flex-col
    ${
      plan.isCurrent
        ? "bg-green-50 border-2 border-green-400 shadow-md"
        : isSelected
        ? "bg-blue-50 border-2 border-blue-500 shadow-xl transform -translate-y-2"
        : "bg-white border border-gray-200 hover:shadow-lg hover:border-blue-400"
    }`;

  const buttonClasses = `w-full mt-auto py-3 px-4 rounded-lg font-semibold transition-all duration-300 ease-in-out
    ${
      plan.isCurrent
        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
        : isSelected
        ? "bg-blue-600 text-white hover:bg-blue-700 shadow-lg"
        : "bg-gray-800 text-white hover:bg-gray-900"
    }`;

  return (
    <div
      className={cardClasses}
      onClick={() =>
        mode === "driver" && !plan.isCurrent && onSelect && onSelect(plan)
      }
    >
      {/* Badge hiện tại */}
      {plan.isCurrent && (
        <div className="absolute -top-3.5 left-1/2 transform -translate-x-1/2">
          <span className="bg-green-600 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-md">
            Đang sử dụng
          </span>
        </div>
      )}

      {/* Header: Tên và giá */}
      <div className="text-center mb-4">
        <h3 className="text-xl font-bold text-gray-800 mb-2">{plan.name}</h3>
        <p className="text-4xl font-extrabold text-gray-900 mb-2">
          {formatPrice(plan.monthlyFee || plan.price || 0)}
        </p>

        {/* Billing Type Badge */}
        {plan.billingType && (
          <div className="inline-block">
            <span className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full border border-gray-300">
              {getBillingTypeLabel(plan.billingType)}
            </span>
          </div>
        )}
      </div>

      {/* Thông tin chi tiết giá - LUÔN HIỂN THỊ ngay cả khi = 0 */}
      <div className="bg-gray-50 rounded-lg p-3 mb-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center text-green-600">
            <FaClock className="w-4 h-4 mr-2" />
            <span className="font-medium">Phút sạc miễn phí</span>
          </div>
          <span className="font-bold text-green-600">
            {plan.freeChargingMinutes || 0} phút
          </span>
        </div>
      </div>

      {/* Giảm giá - LUÔN HIỂN THỊ */}
      <div className="bg-gray-50 rounded-lg p-3 mb-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center text-green-600">
            <FaPercent className="w-4 h-4 mr-2" />
            <span className="font-medium">Giảm giá</span>
          </div>
          <span className="font-bold text-green-600">
            {plan.discountPercent || 0}%
          </span>
        </div>
      </div>

      {/* Mô tả và quyền lợi - hiển thị nguyên text */}
      {plan.benefits && (
        <div className="mb-6 flex-grow bg-blue-50 rounded-lg p-4 border border-blue-100">
          <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
            {plan.benefits}
          </p>
        </div>
      )}

      {/* Action button - chỉ hiển thị khi mode = driver */}
      {mode === "driver" && onSelect && (
        <button
          className={buttonClasses}
          disabled={plan.isCurrent}
          onClick={(e) => {
            e.stopPropagation();
            !plan.isCurrent && onSelect(plan);
          }}
        >
          {plan.isCurrent ? "Đang sử dụng" : "Nâng cấp"}
        </button>
      )}
    </div>
  );
};

export default PlanCard;
