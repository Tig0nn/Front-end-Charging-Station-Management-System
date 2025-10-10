import React from "react";
import { FaCheckCircle } from "react-icons/fa"; // Icon đẹp hơn

const PlanCard = ({ plan, isSelected, onSelect }) => {
  const formatPrice = (price) => {
    if (price === 0) return "Miễn phí";
    return (
      <>
        {price.toLocaleString("vi-VN")}đ
        <span className="text-base font-normal text-gray-500">
          /{plan.period}
        </span>
      </>
    );
  };

  const cardClasses = `relative rounded-2xl p-6 transition-all duration-300 ease-in-out cursor-pointer h-full flex flex-col
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
      onClick={() => !plan.isCurrent && onSelect(plan)}
    >
      {plan.isPopular && !plan.isCurrent && (
        <div className="absolute -top-3.5 left-1/2 transform -translate-x-1/2">
          <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-md">
            Phổ biến
          </span>
        </div>
      )}
      {plan.isCurrent && (
        <div className="absolute -top-3.5 left-1/2 transform -translate-x-1/2">
          <span className="bg-green-600 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-md">
            Đang sử dụng
          </span>
        </div>
      )}
      <div className="text-center">
        <h3 className="text-xl font-bold text-gray-800 mb-2">{plan.name}</h3>
        <p className="text-4xl font-extrabold text-gray-900 mb-6">
          {formatPrice(plan.price)}
        </p>
      </div>
      <ul className="space-y-3 mb-8">
        {plan.features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <FaCheckCircle className="w-5 h-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
            <span className="text-gray-600">{feature}</span>
          </li>
        ))}
      </ul>
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
    </div>
  );
};

export default PlanCard;
