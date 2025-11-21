import React, { useState, useEffect } from "react";
import { walletAPI } from "../../lib/apiServices.js";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// CSS animation cho loading spinner
const styles = document.createElement("style");
styles.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styles);

export default function WalletPage() {
  // =============== STATES - Quản lý dữ liệu từ API ===============
  const [walletDashboard, setWalletDashboard] = useState(null); // Thông tin số dư và thống kê ví
  const [userTransactions, setUserTransactions] = useState([]); // Lịch sử giao dịch từ API
  const [isLoading, setIsLoading] = useState(true); // Trạng thái đang tải dữ liệu
  const [error, setError] = useState(null); // Lưu thông báo lỗi nếu có

  // =============== STATES - Quản lý giao diện UI ===============
  const [searchQuery, setSearchQuery] = useState(""); // Từ khóa tìm kiếm giao dịch
  const [activeTab, setActiveTab] = useState("all"); // Tab hiện tại: all/topup/charge/refund
  const [showTopupDialog, setShowTopupDialog] = useState(false); // Hiển thị dialog nạp tiền
  const [topupAmount, setTopupAmount] = useState(""); // Số tiền người dùng muốn nạp
  const [isProcessingPayment, setIsProcessingPayment] = useState(false); // Đang xử lý thanh toán ZaloPay

  // Chỉ sử dụng dữ liệu thật từ API
  const transactions = userTransactions;

  // =============== HELPERS - Dịch message từ backend ===============
  const translateErrorMessage = (message) => {
    const translations = {
      // Wallet errors
      "Insufficient balance": "Số dư không đủ",
      "Wallet not found": "Không tìm thấy ví",
      "Invalid amount": "Số tiền không hợp lệ",
      "Transaction failed": "Giao dịch thất bại",
      "Payment failed": "Thanh toán thất bại",
      "Invalid transaction": "Giao dịch không hợp lệ",

      // ZaloPay errors
      "ZaloPay payment failed": "Thanh toán ZaloPay thất bại",
      "Cannot create payment order": "Không thể tạo đơn thanh toán",
      "Payment order creation failed": "Tạo đơn thanh toán thất bại",

      // Network errors
      "Network Error": "Lỗi kết nối mạng",
      "Request timeout": "Hết thời gian chờ",
      "Server error": "Lỗi máy chủ",

      // Auth errors
      Unauthorized: "Chưa đăng nhập",
      "Token expired": "Phiên đăng nhập hết hạn",
    };

    // Kiểm tra message có trong bản dịch không
    for (const [english, vietnamese] of Object.entries(translations)) {
      if (message?.toLowerCase().includes(english.toLowerCase())) {
        return vietnamese;
      }
    }

    // Nếu không tìm thấy, trả về message gốc
    return message;
  };

  // =============== EFFECT - Tải dữ liệu ví khi component mount ===============
  useEffect(() => {
    // Hàm lấy thông tin dashboard ví (số dư, thống kê)
    const fetchWalletDashboard = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const res = await walletAPI.walletDashboard();

        if (res.data.result) {
          console.log(" Setting wallet dashboard with:", res.data.result);
          setWalletDashboard(res.data.result);
        } else {
          const errorMsg = res.data.message || "Không thể tải dữ liệu ví";
          console.log(" API returned error:", errorMsg);
          setError(translateErrorMessage(errorMsg));
        }
      } catch (error) {
        console.error(" Error fetching wallet dashboard:", error);
        console.error("Error response:", error.response?.data);
        const errorMsg =
          error.response?.data?.message || "Lỗi kết nối. Vui lòng thử lại sau.";
        setError(translateErrorMessage(errorMsg));
      } finally {
        setIsLoading(false);
      }
    }; // Hàm lấy lịch sử giao dịch
    const fetchTransactionHistory = async () => {
      try {
        const res = await walletAPI.getTransactionHistory();

        if (res.data.result) {
          setUserTransactions(res.data.result);
          console.log(" Đã lấy lịch sử giao dịch:", res.data.result);
        }
      } catch (error) {
        console.error(" Lỗi khi lấy lịch sử giao dịch:", error);
        const errorMsg = error.response?.data?.message || error.message;
        toast.error(
          translateErrorMessage(errorMsg) || "Không thể tải lịch sử giao dịch"
        );
      }
    };

    // Gọi cả 2 API khi component mount
    fetchWalletDashboard();
    fetchTransactionHistory();
  }, []);
  // =============== DATA - Các giá trị mặc định ===============
  // Các mức tiền gợi ý nhanh
  const quickAmounts = [50000, 100000, 200000, 500000, 1000000, 2000000];
  // =============== FILTER - Lọc giao dịch theo tìm kiếm và tab ===============
  const filteredTransactions = transactions.filter((transaction) => {
    // Kiểm tra từ khóa tìm kiếm
    const matchesSearch = transaction.description
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    // Kiểm tra tab hiện tại
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "TOPUP_ZALOPAY" &&
        transaction.transactionType === "TOPUP_ZALOPAY") ||
      (activeTab === "CHARGING_PAYMENT" &&
        transaction.transactionType === "CHARGING_PAYMENT") ||
      (activeTab === "BOOKING_DEPOSIT_REFUND" &&
        transaction.transactionType === "BOOKING_DEPOSIT_REFUND");

    return matchesSearch && matchesTab;
  });
  // =============== HELPER FUNCTIONS - Các hàm tiện ích ===============
  // Lấy icon tương ứng với loại giao dịch
  const getTransactionIcon = (type) => {
    switch (type) {
      case "TOPUP_ZALOPAY":
        return (
          <i
            className="bi bi-arrow-down-circle-fill"
            style={{ fontSize: "1.5rem", color: "#059669" }}
          ></i>
        );
      case "CHARGING_PAYMENT":
        return (
          <i
            className="bi bi-ev-station-fill"
            style={{ fontSize: "1.5rem", color: "#2563eb" }}
          ></i>
        );
      case "BOOKING_DEPOSIT_REFUND":
        return (
          <i
            className="bi bi-arrow-repeat"
            style={{ fontSize: "1.5rem", color: "#ea580c" }}
          ></i>
        );
      default:
        return (
          <i
            className="bi bi-receipt"
            style={{ fontSize: "1.5rem", color: "#6b7280" }}
          ></i>
        );
    }
  }; // Format số tiền theo định dạng VN (ví dụ: 1,000,000)
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN").format(Math.abs(amount));
  };

  // Format timestamp từ API thành date và time
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return { date: "N/A", time: "N/A" };

    const date = new Date(timestamp);

    // Format date: DD/MM/YYYY
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const formattedDate = `${day}/${month}/${year}`;

    // Format time: HH:MM
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const formattedTime = `${hours}:${minutes}`;

    return { date: formattedDate, time: formattedTime };
  };

  // =============== HANDLERS - Xử lý các sự kiện ===============

  // Xử lý nạp tiền qua ZaloPay - gọi trực tiếp API
  const handleTopup = async () => {
    // Kiểm tra đã nhập số tiền chưa
    if (!topupAmount) {
      toast.error("Vui lòng nhập số tiền nạp!");
      return;
    }

    try {
      setIsProcessingPayment(true);

      // Gọi API tạo order ZaloPay
      console.log(" Đang gọi API topupZaloPay với số tiền:", topupAmount);
      const response = await walletAPI.topupZaloPay(parseFloat(topupAmount));

      console.log(" Response từ API:", response);

      if (response?.data?.result?.orderUrl) {
        // Mở link thanh toán ZaloPay trong tab mới
        window.open(response.data.result.orderUrl, "_blank");

        // Đóng dialog và reset form
        setShowTopupDialog(false);
        setTopupAmount("");

        toast.success(
          "Đang chuyển đến ZaloPay để thanh toán. Vui lòng hoàn tất thanh toán trên trang ZaloPay."
        );

        // Refresh dữ liệu ví sau 3 giây (cho user thời gian thanh toán)
        setTimeout(async () => {
          try {
            console.log(" Đang refresh dữ liệu ví...");
            const res = await walletAPI.walletDashboard();
            if (res.data.result) {
              setWalletDashboard(res.data.result);
              console.log(" Đã cập nhật wallet dashboard");
            }

            const transRes = await walletAPI.getTransactionHistory();
            if (transRes.data.result) {
              setUserTransactions(transRes.data.result);
              console.log(" Đã cập nhật lịch sử giao dịch");
            }
          } catch (error) {
            console.error(" Lỗi khi làm mới dữ liệu ví:", error);
          }
        }, 3000);
      } else {
        toast.error("Không thể tạo thanh toán. Vui lòng thử lại!");
      }
    } catch (error) {
      console.error(" Lỗi khi tạo thanh toán ZaloPay:", error);
      const errorMsg = error.response?.data?.message || error.message;
      toast.error(translateErrorMessage(errorMsg) || "Lỗi không xác định");
    } finally {
      setIsProcessingPayment(false);
    }
  }; // =============== RENDER JSX ===============
  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer  position="top-right" autoClose={3000} />
      {/* Container chính */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* ========== Card hiển thị số dư ví ========== */}
        <div className="bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 rounded-2xl shadow-emerald-500/20 shadow-2xl mb-8 overflow-hidden relative">
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full transform -translate-x-1/2 translate-y-1/2"></div>

          <div className="relative p-8">
            {/* Thông tin loại ví */}
            <div className="flex items-center gap-2 text-white/90 mb-8">
              <i className="bi bi-wallet2 text-xl"></i>
              <span className="text-sm">Số dư ví T-Green</span>
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded">
                Tài xế
              </span>
            </div>

            {/* Hiển thị số dư - Loading/Error/Data */}
            <div className="mb-8">
              {isLoading ? (
                <div className="text-white text-2xl">
                  <i className="bi bi-arrow-repeat animate-spin"></i> Đang
                  tải...
                </div>
              ) : error ? (
                <div className="text-white/90 text-base">{error}</div>
              ) : walletDashboard ? (
                <>
                  <div className="text-6xl text-white mb-1 font-bold">
                    {formatCurrency(walletDashboard.currentBalance || 0)}
                  </div>
                  <div className="text-xl text-white/90">VND</div>
                </>
              ) : (
                <div className="text-white/90 text-base">Không có dữ liệu</div>
              )}
            </div>

            {/* Nút "Nạp tiền" - Mở dialog nạp tiền */}
            <button
              onClick={() => setShowTopupDialog(true)}
              className="w-full bg-white text-emerald-600 h-12 rounded-lg border-none shadow-lg cursor-pointer text-base font-semibold flex items-center justify-center gap-2 transition-all duration-200 hover:bg-white/95 hover:-translate-y-0.5 hover:shadow-xl active:scale-98"
            >
              <i className="bi bi-plus-lg text-xl"></i>
              Nạp tiền
            </button>
          </div>
        </div>{" "}
        {/* ========== Cards thống kê (Chi tiêu, Nạp tiền, Số lượng GD) ========== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Card 1: Chi tiêu tháng này */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-6 shadow-sm transition-all duration-200 cursor-pointer hover:shadow-blue-500/15 hover:shadow-xl hover:-translate-y-1">
            <div className="flex items-center gap-2 text-blue-600 mb-4">
              <i className="bi bi-graph-up text-xl"></i>
              <span className="text-sm">Chi tiêu tháng này</span>
            </div>
            <div className="text-3xl text-blue-900 mb-1 font-bold">
              {formatCurrency(
                walletDashboard?.statistics?.monthlySpending || 0
              )}
            </div>
            <div className="text-sm text-blue-600">VND</div>
          </div>

          {/* Card 2: Số tiền nạp tháng này */}
          <div className="bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl p-6 shadow-sm transition-all duration-200 cursor-pointer hover:shadow-emerald-500/15 hover:shadow-xl hover:-translate-y-1">
            <div className="flex items-center gap-2 text-emerald-600 mb-4">
              <i className="bi bi-arrow-down-left text-xl"></i>
              <span className="text-sm">Nạp tháng này</span>
            </div>
            <div className="text-3xl text-emerald-900 mb-1 font-bold">
              {formatCurrency(walletDashboard?.statistics?.monthlyTopUp || 0)}
            </div>
            <div className="text-sm text-emerald-600">VND</div>
          </div>

          {/* Card 3: Tổng số lượng giao dịch */}
          <div className="bg-gradient-to-br from-orange-100 to-yellow-100 rounded-xl p-6 shadow-sm transition-all duration-200 cursor-pointer hover:shadow-orange-500/15 hover:shadow-xl hover:-translate-y-1">
            <div className="flex items-center gap-2 text-orange-600 mb-4">
              <i className="bi bi-receipt text-xl"></i>
              <span className="text-sm">Giao dịch</span>
            </div>
            <div className="text-3xl text-orange-900 mb-1 font-bold">
              {walletDashboard?.statistics?.transactionCount || 0}
            </div>
            <div className="text-sm text-orange-600">Lần</div>
          </div>
        </div>{" "}
        {/* ========== Bảng lịch sử giao dịch ========== */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header: Tiêu đề + Thanh tìm kiếm + Filter tabs */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl text-gray-900 mb-4">Lịch sử giao dịch</h2>
            {/* Thanh tìm kiếm */}
            <div className="relative mb-4">
              <i className="bi bi-search absolute left-3 top-1/2 -translate-y-1/2 text-xl text-gray-400"></i>
              <input
                type="text"
                placeholder="Tìm kiếm giao dịch..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 h-12 bg-gray-50 border border-gray-200 rounded-lg text-base outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
              />
            </div>{" "}
            {/* Các nút filter theo loại giao dịch */}
            <div className="flex gap-3 flex-wrap">
              {[
                { value: "all", label: "Tất cả" },
                { value: "TOPUP_ZALOPAY", label: "Nạp tiền" },
                { value: "CHARGING_PAYMENT", label: "Sạc xe" },
                { value: "BOOKING_DEPOSIT_REFUND", label: "Hoàn tiền" },
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={`px-8 py-2.5 !rounded-md text-sm font-medium border-none cursor-pointer transition-all duration-200 whitespace-nowrap ${
                    activeTab === tab.value
                      ? "bg-emerald-500 text-white shadow-emerald-500/40 shadow-lg hover:shadow-emerald-500/50 hover:shadow-xl"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md"
                  } hover:-translate-y-0.5 active:scale-95`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>{" "}
          {/* Transaction List */}
          <div>
            {filteredTransactions.length === 0 ? (
              <div className="p-12 text-center">
                <i className="bi bi-inbox text-5xl text-gray-300 block mb-3"></i>
                <p className="text-gray-500 m-0">
                  Không tìm thấy giao dịch nào
                </p>
              </div>
            ) : (
              filteredTransactions.map((transaction, index) => (
                <div
                  key={transaction.id}
                  className={`p-6 ${
                    index > 0 ? "border-t border-gray-100" : ""
                  } cursor-pointer transition-all duration-200 border-l-4 border-transparent hover:bg-gray-50 hover:translate-x-1 hover:border-l-emerald-500 hover:shadow-sm`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Icon */}
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          transaction.transactionType === "TOPUP_ZALOPAY"
                            ? "bg-emerald-100"
                            : transaction.transactionType === "CHARGING_PAYMENT"
                            ? "bg-blue-100"
                            : transaction.transactionType ===
                              "BOOKING_DEPOSIT_REFUND"
                            ? "bg-orange-100"
                            : "bg-gray-100"
                        }`}
                      >
                        {getTransactionIcon(transaction.transactionType)}
                      </div>{" "}
                      {/* Details */}
                      <div>
                        <p className="text-gray-900 mb-1 font-medium">
                          {transaction.description}
                        </p>
                        <p className="text-sm text-gray-500 m-0">
                          {formatTimestamp(transaction.timestamp).date} •{" "}
                          {formatTimestamp(transaction.timestamp).time}
                        </p>
                      </div>
                    </div>{" "}
                    {/* Amount */}
                    <div className="text-right">
                      <p
                        className={`text-lg mb-1 font-semibold ${
                          transaction.amount > 0
                            ? "text-emerald-600"
                            : "text-gray-900"
                        }`}
                      >
                        {transaction.amount > 0 ? "+" : "-"}{" "}
                        {formatCurrency(transaction.amount)} VND
                      </p>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          transaction.status.toLowerCase() === "completed"
                            ? "bg-emerald-100 text-emerald-800"
                            : transaction.status.toLowerCase() === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {transaction.status.toLowerCase() === "completed"
                          ? "Hoàn thành"
                          : transaction.status.toLowerCase() === "pending"
                          ? "Đang xử lý"
                          : "Thất bại"}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>{" "}
      {/* ========== Dialog nạp tiền qua ZaloPay ========== */}
      {showTopupDialog && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowTopupDialog(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold m-0">Nạp tiền qua ZaloPay</h3>
                <button
                  onClick={() => {
                    setShowTopupDialog(false);
                    setTopupAmount("");
                  }}
                  className="bg-transparent border-none cursor-pointer p-2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <i className="bi bi-x-lg text-xl"></i>
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              <div className="flex flex-col gap-6">
                {/* Amount Input */}
                <div>
                  <label className="block mb-2 text-sm font-semibold">
                    Số tiền nạp (VND)
                  </label>
                  <input
                    type="number"
                    placeholder="Nhập số tiền"
                    value={topupAmount}
                    onChange={(e) => setTopupAmount(e.target.value)}
                    className="w-full h-12 text-lg px-4 border border-gray-200 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  />
                </div>

                {/* Quick Amount Buttons */}
                <div className="grid grid-cols-3 gap-2">
                  {quickAmounts.map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setTopupAmount(amount.toString())}
                      className="py-2 px-3 rounded-lg border-2 border-gray-200 bg-white cursor-pointer text-sm transition-all duration-200 hover:border-blue-500 hover:bg-blue-50 hover:scale-105 hover:shadow-blue-500/20 hover:shadow-md active:scale-95"
                    >
                      {formatCurrency(amount)}
                    </button>
                  ))}
                </div>

                {/* ZaloPay Info */}
                <div className="bg-blue-50 border border-blue-500 rounded-xl p-4 flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <i className="bi bi-wallet2 text-2xl text-white"></i>
                  </div>
                  <div className="flex-1">
                    <p className="m-0 font-semibold text-blue-900 mb-1">
                      Thanh toán qua ZaloPay
                    </p>
                    <p className="m-0 text-xs text-blue-700">
                      Nhanh chóng, an toàn & bảo mật
                    </p>
                  </div>
                </div>

                {/* Payment Button */}
                <button
                  onClick={handleTopup}
                  disabled={!topupAmount || isProcessingPayment}
                  className={`w-full h-12 border-none rounded-lg text-base font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                    !topupAmount || isProcessingPayment
                      ? "bg-gray-400 cursor-not-allowed opacity-60"
                      : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 cursor-pointer shadow-lg hover:shadow-xl active:scale-95"
                  } text-white`}
                >
                  {isProcessingPayment ? (
                    <>
                      <i className="bi bi-arrow-repeat animate-spin"></i>
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-wallet2"></i>
                      Thanh toán ZaloPay
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
