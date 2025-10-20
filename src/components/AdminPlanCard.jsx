import React from "react";
import { FaCheckCircle } from "react-icons/fa";
import { BiEdit } from "react-icons/bi"; // Bootstrap icon cho edit

const AdminPlanCard = ({ plan, onEdit }) => {
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

  const cardClasses = `relative rounded-2xl p-6 transition-all duration-300 ease-in-out h-full flex flex-col bg-white border border-gray-200 hover:shadow-lg hover:border-blue-400`;

  return (
    <div className={cardClasses}>
      {/* Edit Icon - Top Right Corner */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onEdit(plan);
        }}
        className="absolute top-3 right-3 p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all duration-200"
        title="Chỉnh sửa gói"
      >
        <BiEdit className="w-5 h-5" />
      </button>

      {/* Popular Badge */}
      {plan.isPopular && (
        <div className="absolute -top-3.5 left-1/2 transform -translate-x-1/2">
          <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-md">
            Phổ biến
          </span>
        </div>
      )}

      <div className="text-center mt-2">
        <h3 className="text-xl font-bold text-gray-800 mb-2">{plan.name}</h3>
        <p className="text-4xl font-extrabold text-gray-900 mb-6">
          {formatPrice(plan.price)}
        </p>
      </div>

      <ul className="space-y-3 mb-8 flex-grow">
        {plan.features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <FaCheckCircle className="w-5 h-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
            <span className="text-gray-600">{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminPlanCard;
