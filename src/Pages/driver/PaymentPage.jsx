// src/pages/PaymentPage.jsx
import React, { useState, useEffect, useMemo } from "react";
import { plansAPI, paymentsAPI } from "../../lib/apiServices";

// Import các component con
import PlanCard from "../../components/PlanCard";
import PaymentMethodItem from "../../components/PaymentMethodItem";
import UpgradeSummary from "../../components/UpgradeSummary";

export default function PaymentPage() {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [availablePlans, setAvailablePlans] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        console.log("🔄 Loading data from real backend API...");
        setLoading(true);
        setError(null);

        // Load plans from real backend API
        const plansResponse = await plansAPI.getAll();
        console.log("📦 Plans API response:", plansResponse);

        // Check response structure and extract plans
        let plans = [];
        if (plansResponse?.data?.result) {
          plans = plansResponse.data.result;
        } else if (plansResponse?.result) {
          plans = plansResponse.result;
        } else if (Array.isArray(plansResponse?.data)) {
          plans = plansResponse.data;
        } else if (Array.isArray(plansResponse)) {
          plans = plansResponse;
        }

        if (plans.length > 0) {
          // Convert backend API plans to UI format
          const apiPlans = plans.map((plan, index) => ({
            id: plan.planId,
            name: plan.name,
            price: plan.monthlyFee || 0,
            period:
              plan.billingType === "PAY_PER_USE" ? "Trả theo lượt" : "tháng",
            features: plan.benefits
              ? plan.benefits.split(",").map((b) => b.trim())
              : [
                  `${plan.pricePerKwh || 0}đ/kWh`,
                  `${plan.pricePerMinute || 0}đ/phút`,
                ],
            isPopular: index === 1, // Make second plan popular
            isCurrent: false,
            billingType: plan.billingType,
            pricePerKwh: plan.pricePerKwh,
            pricePerMinute: plan.pricePerMinute,
          }));

          console.log("✅ Converted plans from backend:", apiPlans);
          setAvailablePlans(apiPlans);
        } else {
          console.warn("⚠️ No plans returned from backend");
          setError("Không thể tải danh sách gói dịch vụ");
        }

        // Load payment methods from real backend API
        try {
          const paymentMethodsResponse = await paymentsAPI.getPaymentMethods();
          console.log(
            "💳 Payment methods API response:",
            paymentMethodsResponse
          );

          // Extract payment methods from response
          let methods = [];
          if (paymentMethodsResponse?.data?.result) {
            methods = paymentMethodsResponse.data.result;
          } else if (paymentMethodsResponse?.result) {
            methods = paymentMethodsResponse.result;
          } else if (Array.isArray(paymentMethodsResponse?.data)) {
            methods = paymentMethodsResponse.data;
          } else if (Array.isArray(paymentMethodsResponse)) {
            methods = paymentMethodsResponse;
          }

          if (methods.length > 0) {
            // Convert backend payment methods to UI format
            const apiPaymentMethods = methods.map((method) => ({
              id: method.pmId,
              type: method.methodType, // CREDIT_CARD, DEBIT_CARD, EWALLET, etc.
              name: getPaymentMethodName(method.methodType, method.provider),
              provider: method.provider,
              maskedToken: method.maskedToken || "****",
              balance:
                method.methodType === "EWALLET"
                  ? "Kết nối để thanh toán"
                  : undefined,
            }));

            console.log(
              "✅ Converted payment methods from backend:",
              apiPaymentMethods
            );
            setPaymentMethods(apiPaymentMethods);
          } else {
            console.warn("⚠️ No payment methods returned from backend");
            // Don't show error - user might not have added payment methods yet
          }
        } catch (error) {
          console.error("⚠️ Error loading payment methods:", error);
          // Don't block the page if payment methods fail to load
          console.log("ℹ️ User might not have payment methods set up yet");
        }

        // Try to load current subscription
        try {
          const subscriptionResponse = await plansAPI.getCurrentSubscription();
          console.log(
            "📋 Current subscription response:",
            subscriptionResponse
          );

          if (subscriptionResponse?.data?.result) {
            setCurrentSubscription(subscriptionResponse.data.result);
          }
        } catch {
          console.log("ℹ️ No current subscription found (this is okay)");
          // Not having a subscription is okay - user might be on free plan
        }
      } catch (error) {
        console.error("❌ Error loading data from backend:", error);
        console.error("Error details:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        });
        setError(`Không thể kết nối với server: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  // Helper function to get payment method display name
  const getPaymentMethodName = (methodType, provider) => {
    const typeMap = {
      CREDIT_CARD: "Thẻ tín dụng",
      DEBIT_CARD: "Thẻ ghi nợ",
      EWALLET: "Ví điện tử",
    };

    const baseName = typeMap[methodType] || methodType;
    return provider ? `${baseName} - ${provider}` : baseName;
  };

  const subscriptionPlans = useMemo(() => {
    // Mark current plan if user has subscription
    return availablePlans.map((plan) => ({
      ...plan,
      isCurrent: currentSubscription?.planId === plan.id,
    }));
  }, [availablePlans, currentSubscription]);

  const handleSelectPlan = (plan) => {
    if (plan.isCurrent) {
      alert("Bạn đang sử dụng gói này rồi");
      return;
    }
    setSelectedPlan((prevPlan) => (prevPlan?.id === plan.id ? null : plan));
    setError(null);
  };

  // Handle payment method selection
  const handleSelectPaymentMethod = (method) => {
    setSelectedPaymentMethod((prevMethod) =>
      prevMethod?.id === method.id ? null : method
    );
  };

  // 🚀 Handle subscription to a plan using real backend
  const handleSubscribe = async (plan) => {
    if (!selectedPaymentMethod) {
      alert("Vui lòng chọn phương thức thanh toán");
      return;
    }

    if (plan.isCurrent) {
      alert("Bạn đang sử dụng gói này rồi");
      return;
    }

    try {
      console.log("🔄 Subscribing to plan via backend:", plan);
      console.log("💳 Using payment method:", selectedPaymentMethod);
      setLoading(true);
      setError(null);

      // Call real backend API to subscribe with the selected payment method
      const subscriptionData = await plansAPI.subscribe(
        plan.id,
        selectedPaymentMethod.id
      );
      console.log("✅ Backend subscription response:", subscriptionData);

      // Update current subscription
      setCurrentSubscription({ planId: plan.id });

      // Update plans to reflect current subscription
      setAvailablePlans((prev) =>
        prev.map((p) => ({
          ...p,
          isCurrent: p.id === plan.id,
        }))
      );

      alert(`Đăng ký gói ${plan.name} thành công!`);
      setSelectedPlan(null);
      setSelectedPaymentMethod(null);
    } catch (error) {
      console.error("❌ Backend subscription failed:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Đăng ký thất bại. Vui lòng thử lại.";

      alert(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải dữ liệu từ server...</p>
        </div>
      </div>
    );
  }

  if (error && availablePlans.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Lỗi kết nối</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Thử lại
          </button>
        </div>
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
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              💡 <strong>Hướng dẫn:</strong> Chọn phương thức thanh toán trước,
              sau đó click "Nâng cấp" trên gói bạn muốn đăng ký.
            </p>
          </div>

          {/* Backend connection indicator */}
          <div className="mt-2 text-xs text-gray-500">
            🌐 Kết nối với backend:{" "}
            {import.meta.env.VITE_API_BASE_URL || "Default"}
          </div>
        </div>

        {/* Error banner */}
        {error && availablePlans.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700 text-sm">⚠️ {error}</p>
          </div>
        )}

        {/* --- Phần Gói Dịch Vụ --- */}
        {availablePlans.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
            {subscriptionPlans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                isSelected={selectedPlan?.id === plan.id}
                onSelect={(plan) => {
                  // First select the plan
                  handleSelectPlan(plan);
                  // Then subscribe if payment method is selected
                  if (selectedPaymentMethod && !plan.isCurrent) {
                    handleSubscribe(plan);
                  }
                }}
              />
            ))}
          </div>
        ) : (
          <div className="text-center p-8 bg-white rounded-lg shadow">
            <p className="text-gray-500">Không có gói dịch vụ nào</p>
          </div>
        )}

        {/* --- ✨ Phần Phương Thức Thanh Toán (Luôn hiển thị) --- */}
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold mb-2 text-gray-900">
            Phương thức thanh toán
          </h2>
          <p className="text-gray-600 mb-6">
            {paymentMethods.length > 0
              ? "Chọn phương thức thanh toán để tiếp tục"
              : "Bạn chưa có phương thức thanh toán nào. Vui lòng thêm phương thức thanh toán."}
          </p>
          <div className="space-y-4">
            {paymentMethods.length > 0 ? (
              paymentMethods.map((method) => (
                <PaymentMethodItem
                  key={method.id}
                  method={method}
                  isSelected={selectedPaymentMethod?.id === method.id}
                  onSelect={() => handleSelectPaymentMethod(method)}
                />
              ))
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500 mb-4">
                  Chưa có phương thức thanh toán
                </p>
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  onClick={() =>
                    alert(
                      "Chức năng thêm phương thức thanh toán sẽ được cập nhật"
                    )
                  }
                >
                  + Thêm phương thức thanh toán
                </button>
              </div>
            )}
          </div>
        </div>

        {/* --- Phần Xác Nhận Nâng Cấp --- */}
        {/* ✨ Điều kiện hiển thị là đã chọn gói VÀ đã chọn phương thức thanh toán */}
        {selectedPlan && selectedPaymentMethod && !selectedPlan.isCurrent && (
          <UpgradeSummary
            selectedPlan={selectedPlan}
            selectedPaymentMethod={selectedPaymentMethod}
            onUpgrade={() => handleSubscribe(selectedPlan)}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
}
