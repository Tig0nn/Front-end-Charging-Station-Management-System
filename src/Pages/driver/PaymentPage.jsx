// src/pages/PaymentPage.jsx
import React, { useState, useEffect, useMemo } from "react";
// import { plansAPI, paymentsAPI } from "../lib/apiServices";

// Import các component con
import PlanCard from "../../components/PlanCard";
import PaymentMethodItem from "../../components/PaymentMethodItem";
// ✨ Không cần modal nữa nên có thể xóa dòng import AddPaymentModal
import UpgradeSummary from "../../components/UpgradeSummary";

// Dữ liệu mock và hàm helper (giữ nguyên)
// ... (giữ nguyên phần code này)
// const mockPaymentMethods = [
//   {
//     id: 1,
//     type: "card",
//     name: "Visa",
//     number: "**** **** **** 1234",
//     expiry: "Hết hạn 12/26",
//     isDefault: true,
//   },
//   {
//     id: 2,
//     type: "ewallet",
//     name: "Ví MoMo",
//     balance: "Số dư: 500,000đ",
//     isDefault: false,
//   },
// ];
const getDefaultPlans = (currentSubscription) => [
  {
    id: "basic",
    name: "Cơ bản",
    price: 0,
    period: "Miễn phí",
    features: ["Thanh toán theo lượt", "Bản đồ trạm sạc", "Lịch sử cơ bản"],
    isPopular: false,
    isCurrent: currentSubscription?.planId === "basic" || !currentSubscription,
  },
  {
    id: "premium",
    name: "Premium",
    price: 199000,
    period: "tháng",
    features: [
      "Giảm 10% mọi phiên sạc",
      "Đặt chỗ trước",
      "Báo cáo chi tiết",
      "Hỗ trợ ưu tiên",
    ],
    isPopular: true,
    isCurrent: currentSubscription?.planId === "premium",
  },
  {
    id: "vip",
    name: "VIP",
    price: 499000,
    period: "tháng",
    features: [
      "Giảm 20% mọi phiên sạc",
      "Sạc không giới hạn",
      "Concierge 24/7",
      "Trạm sạc độc quyền",
    ],
    isPopular: false,
    isCurrent: currentSubscription?.planId === "vip",
  },
];

// ✨ Dữ liệu MoMo cố định, vì chỉ dùng duy nhất phương thức này
const momoPaymentMethod = {
  id: "momo",
  type: "ewallet",
  name: "Ví MoMo",
  balance: "Kết nối để thanh toán",
};

export default function PaymentPage() {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [availablePlans, setAvailablePlans] = useState([]);

  // ✨ Dùng boolean để theo dõi việc chọn MoMo, vì chỉ có 1 lựa chọn
  const [isMomoSelected, setIsMomoSelected] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      // Logic fetch data của bạn giữ nguyên...
      setTimeout(() => {
        setCurrentSubscription({ planId: "basic" });
        setAvailablePlans(getDefaultPlans({ planId: "basic" }));
        setLoading(false);
      }, 1000);
    };
    loadUserData();
  }, []);

  const subscriptionPlans = useMemo(() => {
    // Logic này giữ nguyên
    const plans =
      availablePlans.length > 0
        ? availablePlans
        : getDefaultPlans(currentSubscription);
    return plans.map((plan) => ({
      ...plan,
      isCurrent:
        currentSubscription?.planId === plan.id ||
        (!currentSubscription && plan.id === "basic"),
    }));
  }, [availablePlans, currentSubscription]);

  const handleSelectPlan = (plan) => {
    setSelectedPlan((prevPlan) => (prevPlan?.id === plan.id ? null : plan));
  };

  // ✨ Hàm xử lý khi nhấn vào MoMo
  const handleToggleMomo = () => {
    setIsMomoSelected((prevState) => !prevState);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Đang tải dữ liệu...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Nâng cấp gói dịch vụ
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Chọn gói và phương thức thanh toán để tiếp tục.
          </p>
        </div>

        {/* --- Phần Gói Dịch Vụ --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
          {subscriptionPlans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isSelected={selectedPlan?.id === plan.id}
              onSelect={handleSelectPlan}
            />
          ))}
        </div>

        {/* --- ✨ Phần Phương Thức Thanh Toán (Luôn hiển thị) --- */}
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold mb-2 text-gray-900">
            Phương thức thanh toán
          </h2>
          <p className="text-gray-600 mb-6">
            Chúng tôi hỗ trợ thanh toán qua Ví MoMo.
          </p>
          <div className="space-y-4">
            {/* Sử dụng trực tiếp component PaymentMethodItem với dữ liệu MoMo */}
            <PaymentMethodItem
              method={momoPaymentMethod}
              isSelected={isMomoSelected}
              onSelect={handleToggleMomo}
            />
          </div>
        </div>

        {/* --- Phần Xác Nhận Nâng Cấp --- */}
        {/* ✨ Điều kiện hiển thị là đã chọn gói VÀ đã chọn MoMo */}
        {selectedPlan && isMomoSelected && !selectedPlan.isCurrent && (
          <UpgradeSummary
            selectedPlan={selectedPlan}
            selectedPaymentMethod={momoPaymentMethod}
            onUpgrade={() => alert("Xử lý nâng cấp...")}
            loading={false}
          />
        )}
      </div>
    </div>
  );
}
