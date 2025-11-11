import React from "react";
import { FaCreditCard, FaWallet } from "react-icons/fa";

const PaymentMethodItem = ({ method, isSelected, onSelect }) => {
  const getIcon = () => {
    // Check method type from backend
    if (
      method.type === "EWALLET" ||
      method.name.toLowerCase().includes("momo")
    ) {
      return <FaWallet className="w-8 h-8 text-purple-600" />;
    }
    // Default to credit card icon for CREDIT_CARD, DEBIT_CARD, etc.
    return <FaCreditCard className="w-8 h-8 text-blue-600" />;
  };

  const itemClasses = `border rounded-xl p-4 flex items-center justify-between cursor-pointer transition-all duration-300 ease-in-out
    ${
      isSelected
        ? "border-blue-500 bg-blue-50 shadow-md"
        : "border-gray-200 bg-white hover:border-gray-400"
    }`;

  return (
    <div className={itemClasses} onClick={() => onSelect(method)}>
      <div className="flex items-center">
        <div className="w-16 h-10 bg-gray-100 rounded-md flex items-center justify-center mr-4">
          {getIcon()}
        </div>
        <div>
          <p className="font-semibold text-gray-800">{method.name}</p>
          <p className="text-sm text-gray-500">
            {method.maskedToken
              ? `**** ${method.maskedToken}`
              : method.balance || "Sẵn sàng thanh toán"}
          </p>
        </div>
      </div>
      {method.isDefault ? (
        <span className="bg-gray-800 text-white px-2.5 py-1 rounded-md text-xs font-medium">
          Mặc định
        </span>
      ) : (
        !isSelected &&
        method.type === "EWALLET" && (
          <span className="text-blue-600 text-sm font-semibold">Kết nối</span>
        )
      )}
    </div>
  );
};

export default PaymentMethodItem;
