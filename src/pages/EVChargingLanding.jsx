import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// SỬA LẠI IMPORT CHO ĐÚNG
import { Link } from "react-router-dom";
import {
  BadgeDollarSign,
  MapPin,
  Zap,
  Users,
  Settings,
  BarChart3,
  Shield,
  Smartphone,
  CreditCard,
  Car,
  ChevronRight,
  Menu,
  X,
  Wifi,
} from "lucide-react";
// IMPORT API SERVICE MỚI
import { plansAPI } from "../lib/apiServices";
import LoadingSpinner from "../components/loading_spins/LoadingSpinner";

export default function EVChargingLanding() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  // STATE ĐỂ LƯU CÁC GÓI THUÊ BAO TỪ API
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // BỎ DỮ LIỆU CỨNG
  // const features = [ ... ];

  useEffect(() => {
    // HÀM GỌI API ĐỂ LẤY CÁC GÓI THUÊ BAO
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const response = await plansAPI.getPlans();
        setPlans(response.data?.result || response.data || []);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch subscription plans:", err);

        // Hiển thị lỗi rõ ràng
        if (err?.response?.status === 401) {
          setError(
            "⚠️ API /api/plans yêu cầu authentication. Backend cần cho phép endpoint này là PUBLIC hoặc cho phép anonymous access."
          );
        } else {
          setError(
            "Không thể tải được các gói thuê bao. Vui lòng thử lại sau."
          );
        }
        setPlans([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  useEffect(() => {
    if (plans.length === 0) return;
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % plans.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [plans.length]);

  // Hàm helper để định dạng tiền tệ
  const formatCurrency = (amount) => {
    if (typeof amount !== "number") return "N/A";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      {/* Navigation */}
      <nav className="relative z-50 bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-15 h-15 flex items-center justify-center">
                <img src="src/assets/image/logo.png" className="w-15 h-15" />
              </div>
              <span className="text-xl font-bold text-white">T-Green</span>
            </div>
            <div className="hidden md:flex space-x-8">
              <a
                href="#features"
                className="font-bold text-decoration-none !text-[#00ffc6] hover:scale-105 transition-colors"
              >
                Tiện ích
              </a>
              <a
                href="#subscription"
                className="font-bold text-decoration-none !text-[#00ffc6] hover:scale-105 transition-colors"
              >
                Gói thuê bao
              </a>
              <a
                href="#about"
                className="font-bold text-decoration-none !text-[#00ffc6] hover:scale-105 transition-colors"
              >
                Về chúng tôi
              </a>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              <Link to="/login">
                <button className="hover:scale-105 font-bold px-4 py-2 text-white/80 hover:text-white transition-colors">
                  Đăng nhập
                </button>
              </Link>
              <Link to="/signup">
                <button
                  className="font-bold !rounded-2xl px-6 py-2 bg-gradient-to-r from-[#2bf0b5] to-[#00ffc6] 
              text-white hover: bg-gradient-to-r from-[#5fffd4] to-[#2bf0b5]
              hover:scale-105
              transition-[background_0.4s_ease,box-shadow_0.4s_ease,transform_0.1s_ease]"
                >
                  Đăng ký
                </button>
              </Link>
            </div>

            <button
              className="md:hidden text-white"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-10 relative min-h-screen flex flex-col pt-8 sm:pt-24justify-center overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-20 h-20 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-32 h-32 bg-green-500/20 rounded-full blur-xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-purple-500/20 rounded-full blur-xl animate-pulse delay-2000"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-8">
            <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-sm text-white/80 border border-white/20 mb-6">
              <Zap className="w-4 h-4 mr-2" />
              Hệ thống trạm sạc xe điện thông minh
            </div>

            <h1 className="text-10xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              <span className="bg-gradient-to-r from-[#79ffdb] via-[#56d1f7] to-[#31ffa9] bg-clip-text text-transparent animate-pulse">
                T-GREEN
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-white/80 mb-8 max-w-3xl mx-auto leading-relaxed">
              Bạn có xe điện? Chúng tôi có trạm sạc! Hãy tin tưởng vào T-GREEN.
            </p>

            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <button
                onClick={() => navigate("/signup")}
                className="font-bold !rounded-2xl transition-[background_0.4s_ease,box-shadow_0.4s_ease,transform_0.1s_ease] group px-8 py-4 
              bg-gradient-to-r from-[#2bf0b5] to-[#00ffc6] text-white hover:scale-105 hover: bg-gradient-to-r from-[#5fffd4] to-[#2bf0b5]
              hover:shadow-[0_0_8px_#00ffc6,0_0_16px_#00ffc6,0_0_24px_#00ffc6] flex items-center"
              >
                Bắt đầu ngay
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mt-16">
            {[
              { number: "1000+", label: "Trạm sạc" },
              { number: "50K+", label: "Người dùng" },
              { number: "24/7", label: "Hỗ trợ" },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-white mb-2">
                  {stat.number}
                </div>
                <div className="text-white/60 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-8 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Tiện ích{" "}
              <span className="bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
                gì mà nhiều thế?
              </span>
            </h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              Trạm sạc chúng tôi luôn cố gắng mang tới trải nghiệm tốt nhất.
            </p>
          </div>

          {/* Detailed Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
            {[
              {
                icon: BadgeDollarSign,
                title: "Gói thuê bao linh hoạt",
                description: "Nhiều lựa chọn phù hợp với nhu cầu của bạn.",
              },
              {
                icon: MapPin,
                title: "Bản đồ Thông minh",
                description:
                  "Tìm kiếm trạm sạc gần nhất với thông tin chi tiết và realtime",
              },
              {
                icon: CreditCard,
                title: "Thanh toán Đa dạng",
                description: "Hỗ trợ nhiều hình thức thanh toán.",
              },
              {
                icon: BarChart3,
                title: "Báo cáo Chi tiết",
                description:
                  "Thống kê và phân tích dữ liệu sử dụng một cách trực quan",
              },
              {
                icon: Shield,
                title: "Bảo mật Cao",
                description:
                  "Đảm bảo an toàn thông tin và giao dịch của người dùng",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all hover:scale-105"
              >
                <feature.icon className="w-12 h-12 text-blue-400 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-white/70">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        id="subscription"
        className=" py-20 bg-gradient-to-r from-blue-600/20 to-green-600/20 backdrop-blur-sm"
      >
        {/* Feature Tabs */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Tràn ngập ưu đãi{" "}
            <span className="bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
              hấp dẫn!
            </span>
          </h2>
          <p className="text-xl text-white/80 max-w-3xl mx-auto">
            Các gói thuê bao mang đến nhiều ưu đãi cho bạn.
          </p>
        </div>
        {loading && (
          <div><LoadingSpinner /></div>
        )}
        {error && <div className="text-center text-red-400 px-4">{error}</div>}
        {!loading && !error && plans.length > 0 && (
          <div className="flex flex-col lg:flex-row justify-center mb-8">
            <div className="flex flex-col sm:flex-row lg:flex-col space-y-2 sm:space-y-0 sm:space-x-4 lg:space-x-0 lg:space-y-4 lg:mr-8 mb-8 lg:mb-0">
              {/* HIỂN THỊ TÊN CÁC GÓI */}
              {plans.map((plan, index) => (
                <button
                  key={plan.planId || index}
                  onClick={() => setActiveFeature(index)}
                  className={`flex items-center px-6 py-4 rounded-xl transition-all text-left ${
                    activeFeature === index
                      ? "bg-white/20 text-white shadow-xl"
                      : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <span className="font-medium">{plan.name}</span>
                </button>
              ))}
            </div>

            {/* Feature Content */}
            <div className="flex-1 max-w-2xl">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
                <div className="flex items-center mb-6">
                  <h3 className="text-2xl font-bold text-white">
                    {plans[activeFeature]?.name}
                  </h3>
                </div>

                {/* HIỂN THỊ CHI TIẾT GÓI */}
                <div className="space-y-4 text-white/90">
                  <p>
                    <strong>Loại thanh toán:</strong>{" "}
                    {plans[activeFeature]?.name}
                  </p>
                  <p>
                    <strong>Phí hàng tháng:</strong>{" "}
                    {formatCurrency(plans[activeFeature]?.monthlyFee)}
                  </p>
                  <p>
                    <strong>Giá mỗi kWh:</strong>{" "}
                    {formatCurrency(plans[activeFeature]?.pricePerKwh)}
                  </p>
                  <p>
                    <strong>Giá mỗi phút:</strong>{" "}
                    {formatCurrency(plans[activeFeature]?.pricePerMinute)}
                  </p>
                  <p>
                    <strong>Quyền lợi khác:</strong>{" "}
                    {plans[activeFeature]?.benefits}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
      <section id="about" className="py-12 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Chúng tôi{" "}
              <span className="bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
                là ai nhỉ?
              </span>
            </h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              Những bạn trẻ góp phần phát triển trào lưu xe điện.
            </p>
          </div>
          {/* Bố cục 50/50 */}
          <div className="flex flex-col md:flex-row items-center gap-12">
            {/* Cột bên trái cho hình ảnh */}
            <div className="md:w-1/2 w-full">
              <img
                src="src/assets/image/img.png"
                alt="Về chúng tôi"
                className="rounded-xl shadow-lg w-full"
              />
            </div>

            {/* Cột bên phải cho văn bản */}
            <div className="md:w-1/2 w-full text-lg text-white/80">
              <h3 className="text-3xl font-bold text-white mb-4">
                Sứ mệnh của T-Green
              </h3>
              <p className="mb-4">
                T-Green được thành lập với sứ mệnh thúc đẩy cuộc cách mạng xe
                điện tại Việt Nam. Chúng tôi xây dựng một mạng lưới trạm sạc
                thông minh, tiện lợi và đáng tin cậy, giúp mọi người dễ dàng
                tiếp cận năng lượng sạch.
              </p>
              <p>
                Với công nghệ tiên tiến và đội ngũ tận tâm, chúng tôi cam kết
                mang đến trải nghiệm sạc xe tốt nhất, góp phần xây dựng một
                tương lai giao thông bền vững.
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* Footer */}
      <footer className="bg-black/30 backdrop-blur-md border-t border-white/10 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="">
                  <img src="src/assets/image/logo.png" className="w-6 h-6" />
                </div>
                <span className="text-xl font-bold text-white">T-Green</span>
              </div>
              <p className="text-white/70">
                Hệ thống trạm sạc xe điện thông minh, tiện lợi và đáng tin cậy.
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Thành viên</h4>
              <div className="space-y-2">
                <a
                  href="#"
                  className="block text-white/70 hover:text-white transition-colors"
                >
                  Trường Huy
                </a>
                <a
                  href="#"
                  className="block text-white/70 hover:text-white transition-colors"
                >
                  Thục Nhân
                </a>
                <a
                  href="#"
                  className="block text-white/70 hover:text-white transition-colors"
                >
                  Đăng Khoa
                </a>
                <a
                  href="#"
                  className="block text-white/70 hover:text-white transition-colors"
                >
                  Phi Trường
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Công ty</h4>
              <div className="space-y-2">
                <a
                  href="#"
                  className="block text-white/70 hover:text-white transition-colors"
                >
                  Về chúng tôi
                </a>
                <a
                  href="#"
                  className="block text-white/70 hover:text-white transition-colors"
                >
                  Tin tức
                </a>
                <a
                  href="#"
                  className="block text-white/70 hover:text-white transition-colors"
                >
                  Liên hệ
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 mt-8 pt-8 text-center text-white/70">
            <p>&copy; 2025 T-Green - Một sản phẩm đến từ SWP391</p>
            <p>Mọi thông tin chỉ là minh họa.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
