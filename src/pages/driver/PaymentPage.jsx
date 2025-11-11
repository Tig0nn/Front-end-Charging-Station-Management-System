// src/pages/PaymentPage.jsx
import React, { useState, useEffect, useMemo } from "react";
import { plansAPI, dashboardAPI } from "../../lib/apiServices";

// Import các component con
import PlanCard from "../../components/PlanCard";
import LoadingSpinner from "../../components/loading_spins/LoadingSpinner";

export default function PaymentPage() {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [availablePlans, setAvailablePlans] = useState([]);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load plans from real backend API
        const plansResponse = await plansAPI.getPlans();

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
          // Convert backend API plans to UI format with full information
          const apiPlans = plans.map((plan) => ({
            id: plan.planId || plan.id,
            name: plan.name,
            monthlyFee: plan.monthlyFee || 0,
            price: plan.monthlyFee || 0, // Backward compatibility
            period: plan.billingType === "PAY_AS_YOU_GO" ? "lượt" : "tháng",
            billingType: plan.billingType,
            discountPercent: plan.discountPercent || 0,
            pricePerKwh: plan.pricePerKwh || 0,
            pricePerMinute: plan.pricePerMinute || 0,
            freeChargingMinutes: plan.freeChargingMinutes || 0,
            benefits: plan.description || plan.benefits || "", // Backend trả về "description"
            isCurrent: false,
          }));

          setAvailablePlans(apiPlans);
        } else {
          setError("Không thể tải danh sách gói dịch vụ");
        }

        // Load current plan from dashboard API
        try {
          const currentPlanResponse = await dashboardAPI.getCurrentPlan();

          // Extract plan data from response
          // Response structure: { code: 0, result: {...} } hoặc { result: {...} }
          let planData = null;

          if (currentPlanResponse?.data?.result) {
            planData = currentPlanResponse.data.result;
          } else if (currentPlanResponse?.result) {
            planData = currentPlanResponse.result;
          } else if (currentPlanResponse?.data) {
            // Fallback: data object chính là plan data
            planData = currentPlanResponse.data;
          }

          // Check if has plan data (với hoặc không có code)
          // Nếu có planId thì coi như có plan
          if (planData && planData.planId) {
            // Store the current plan data
            const currentPlan = {
              planId: planData.planId,
              planName: planData.name || "Chưa có tên",
              monthlyFee: planData.monthlyFee || 0,
              billingType: planData.billingType || "UNKNOWN",
              pricePerKwh: planData.pricePerKwh || 0,
              pricePerMinute: planData.pricePerMinute || 0,
              benefits: planData.benefits || "",
            };
            setCurrentSubscription(currentPlan);
          } else {
            setCurrentSubscription(null);
          }
        } catch (error) {
          // Handle errors - User might not have subscribed to any plan yet
          const errorCode =
            error.response?.data?.code || error.response?.status;

          // Backend error codes for "no plan":
          // - 14001: User Not Existed (user chưa có plan nào)
          // - 404: Not found
          // - 400: Bad request (có thể là chưa có plan)
          // These are normal cases for users who haven't subscribed yet
          if (errorCode === 14001 || errorCode === 404 || errorCode === 400) {
            // This is expected - not an error
          } else {
            // Unexpected error
          }
          // Not having a plan is okay - user might be on default free plan
          setCurrentSubscription(null);
        }
      } catch (error) {
        setError(`Không thể kết nối với server: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  const subscriptionPlans = useMemo(() => {
    // Mark current plan if user has subscription
    return availablePlans.map((plan) => ({
      ...plan,
      isCurrent: currentSubscription?.planId === plan.id,
    }));
  }, [availablePlans, currentSubscription]);

  // 🚀 Handle subscription - Payment directly from wallet
  const handleSubscribe = async (plan) => {
    if (plan.isCurrent) {
      alert("Bạn đang sử dụng gói này rồi");
      return;
    }

    // Confirm before subscribing
    const confirmed = window.confirm(
      `Xác nhận đăng ký gói "${plan.name}"?\n\n` +
        `Phí tháng: ${plan.monthlyFee?.toLocaleString("vi-VN")}đ\n` +
        `Giá điện: ${plan.pricePerKwh?.toLocaleString("vi-VN")}đ/kWh\n\n` +
        `Số tiền sẽ được trừ trực tiếp từ ví của bạn.\n` +
        `Bạn sẽ nhận được email xác nhận sau khi đăng ký thành công.`
    );

    if (!confirmed) return;

    try {
      setLoading(true);
      setError(null);

      // Call backend API to subscribe - payment from wallet
      // API: POST /api/plans/subscribe/{planId}
      const response = await plansAPI.subscribe(plan.id);

      // Extract plan data from response
      // Response: { code: 0, message: "string", result: { planId, name, ... } }
      let newPlanData = null;
      if (response?.data?.result) {
        newPlanData = response.data.result;
      } else if (response?.result) {
        newPlanData = response.result;
      }

      // Update current subscription with the new plan data
      if (newPlanData && newPlanData.planId) {
        setCurrentSubscription({
          planId: newPlanData.planId,
          planName: newPlanData.name,
          monthlyFee: newPlanData.monthlyFee || 0,
          billingType: newPlanData.billingType,
          pricePerKwh: newPlanData.pricePerKwh || 0,
          pricePerMinute: newPlanData.pricePerMinute || 0,
          benefits: newPlanData.benefits || "",
        });

        // Update plans to reflect current subscription
        setAvailablePlans((prev) =>
          prev.map((p) => ({
            ...p,
            isCurrent: p.id === newPlanData.planId,
          }))
        );
      }

      // Show success message
      const successMessage =
        response?.data?.message ||
        response?.message ||
        `Đăng ký gói ${plan.name} thành công!`;

      alert(
        `✅ ${successMessage}\n\n` +
          `📧 Vui lòng kiểm tra email để xem thông tin chi tiết.`
      );

      setSelectedPlan(null);
    } catch (error) {
      // Handle error
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Đăng ký thất bại. Vui lòng thử lại.";

      const errorCode = error.response?.data?.code || error.response?.status;

      let userMessage = errorMessage;

      // Provide helpful message based on error
      if (errorCode === 400) {
        userMessage = `Không thể đăng ký gói: ${errorMessage}`;
      } else if (errorCode === 403 || errorMessage.includes("insufficient")) {
        userMessage =
          "Số dư ví không đủ để đăng ký gói này. Vui lòng nạp thêm tiền vào ví.";
      } else if (errorCode === 404) {
        userMessage = "Không tìm thấy gói dịch vụ. Vui lòng thử lại.";
      }

      alert(`❌ ${userMessage}`);
      setError(userMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
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
                  if (!plan.isCurrent) {
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

        {/* --- ✨ Thông tin thanh toán --- */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 shadow-lg border-2 border-blue-200">
          <div className="flex items-center gap-3 mb-4">
            <i
              className="bi bi-wallet2 text-blue-600"
              style={{ fontSize: "32px" }}
            ></i>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                Thanh toán từ ví
              </h2>
              <p className="text-gray-600">
                Phí đăng ký gói sẽ được trừ trực tiếp từ số dư ví của bạn.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 mt-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Phương thức thanh toán:</span>
              <span className="font-semibold text-gray-900">
                <i className="bi bi-wallet2 me-2 text-green-600"></i>
                Ví T-Green
              </span>
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-100 rounded-lg">
            <p className="text-sm text-blue-800">
              <i className="bi bi-info-circle me-2"></i>
              Vui lòng đảm bảo ví của bạn có đủ số dư trước khi đăng ký gói.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
