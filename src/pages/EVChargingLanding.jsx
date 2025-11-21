import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import {
  BadgeDollarSign,
  MapPin,
  Zap,
  BookCheck,
  BarChart3,
  Shield,
  CreditCard,
  Menu,
  X,
} from "lucide-react";
import { plansAPI } from "../lib/apiServices";
import LoadingSpinner from "../components/loading_spins/LoadingSpinner";

export default function EVChargingLanding() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const response = await plansAPI.getPlans();
        setPlans(response.data?.result || response.data || []);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch subscription plans:", err);

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

  const formatCurrency = (amount) => {
    if (typeof amount !== "number") return "N/A";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="relative z-50 bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-15 h-15 flex items-center justify-center">
                <img src="src/assets/image/logo.png" className="w-15 h-15" />
              </div>
              <span className="text-xl font-bold text-gray-900">T-Green</span>
            </div>
            <div className="hidden md:flex space-x-8">
              <a
                href="#features"
                className="font-bold text-decoration-none hover:scale-105 transition-colors"
                style={{ color: "#22c55e" }}
              >
                Tiện ích
              </a>
              <a
                href="#subscription"
                className="font-bold text-decoration-none hover:scale-105 transition-colors"
                style={{ color: "#22c55e" }}
              >
                Gói thuê bao
              </a>
              <a
                href="#about"
                className="font-bold text-decoration-none hover:scale-105 transition-colors"
                style={{ color: "#22c55e" }}
              >
                Về chúng tôi
              </a>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              <Link to="/login">
                <button className="hover:scale-105 font-bold px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors">
                  Đăng nhập
                </button>
              </Link>
              <Link to="/signup">
                <button
                  className="font-bold !rounded-2xl px-6 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 
              text-white hover:from-emerald-600 hover:to-emerald-700
              hover:scale-105 shadow-lg shadow-emerald-500/40 hover:shadow-xl hover:shadow-emerald-600/50
              transition-all duration-200"
                >
                  Đăng ký
                </button>
              </Link>
            </div>

            <button
              className="md:hidden text-gray-900"
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
      <section className="py-10 relative min-h-screen flex flex-col justify-center overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1669349412975-a9dd0d2292ee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVjdHJpYyUyMGNhciUyMGNoYXJnaW5nJTIwZ3JlZW58ZW58MXx8fHwxNzYzMDM4MjU3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral)",
          }}
        ></div>

        {/* Gradient Overlay - Emerald Green */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/80 via-emerald-500/70 to-teal-600/80"></div>

        {/* Subtle Pattern Overlay */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-8">
            <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm text-white border border-white/30 mb-6">
              <Zap className="w-4 h-4 mr-2" />
              Hệ thống trạm sạc xe điện thông minh
            </div>

            <h1 className="text-10xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="text-white drop-shadow-lg">
                T-GREEN
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed drop-shadow-md">
              Bạn có xe điện? Chúng tôi có trạm sạc! Hãy tin tưởng vào T-GREEN.
            </p>

            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <button
                onClick={() => navigate("/signup")}
                className="font-bold !rounded-2xl group px-8 py-4 
              bg-white text-emerald-600 
              hover:bg-emerald-50 hover:scale-105
              shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-black/30
               transition-all duration-200 flex items-center"
              >
                Bắt đầu ngay
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Tiện ích{" "}
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                gì mà nhiều thế?
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
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
                title: "Thanh toán qua Ví",
                description: "Tiện lợi và tự động.",
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
              {
                icon: BookCheck,
                title: "Đặt chỗ trước",
                description:
                  "Đặt chỗ trạm sạc trước để đảm bảo có chỗ khi bạn đến",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 border border-gray-200 hover:border-emerald-500 hover:shadow-lg transition-all hover:scale-105 group"
              >
                <feature.icon className="w-12 h-12 text-emerald-600 mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        id="subscription"
        className="py-20 bg-gradient-to-br from-emerald-50 via-emerald-100/30 to-teal-50"
      >
        {/* Feature Tabs */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Tràn ngập ưu đãi{" "}
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              hấp dẫn!
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Các gói thuê bao mang đến nhiều ưu đãi cho bạn.
          </p>
        </div>
        {loading && (
          <div><LoadingSpinner /></div>
        )}
        {error && <div className="text-center text-red-600 px-4">{error}</div>}
        {!loading && !error && plans.length > 0 && (
          <div className="flex flex-col lg:flex-row justify-center mb-8 max-w-7xl mx-auto px-4">
            <div className="flex flex-col sm:flex-row lg:flex-col space-y-2 sm:space-y-0 sm:space-x-4 lg:space-x-0 lg:space-y-4 lg:mr-8 mb-8 lg:mb-0">
              {/* HIỂN THỊ TÊN CÁC GÓI */}
              {plans.map((plan, index) => (
                <button
                  key={plan.planId || index}
                  onClick={() => setActiveFeature(index)}
                  className={`flex items-center px-6 py-4 mt-3 !rounded-xl transition-all text-left ${activeFeature === index
                      ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/40"
                      : "bg-white text-gray-700 hover:bg-emerald-50 border border-emerald-200"
                    }`}
                >
                  <span className="font-medium">{plan.name}</span>
                </button>
              ))}
            </div>

            {/* Feature Content */}
            <div className="flex-1 max-w-2xl">
              <div className="bg-white rounded-2xl p-8 border border-emerald-300 shadow-xl">
                <div className="flex items-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {plans[activeFeature]?.name}
                  </h3>
                </div>

                {/* HIỂN THỊ CHI TIẾT GÓI */}
                <div className="space-y-4 text-gray-700">
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
      <section id="about" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Chúng tôi{" "}
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                là ai nhỉ?
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
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
                className="rounded-xl shadow-2xl w-full border border-gray-200"
              />
            </div>

            {/* Cột bên phải cho văn bản */}
            <div className="md:w-1/2 w-full text-lg text-gray-700">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
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
      <footer className="bg-gradient-to-r from-emerald-600 to-teal-600 border-t border-green-600 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="">
                  <img src="src/assets/image/logo.png" className="w-6 h-6" />
                </div>
                <span className="text-xl font-bold text-white">T-Green</span>
              </div>
              <p className="!text-white">
                Hệ thống trạm sạc xe điện thông minh, tiện lợi và đáng tin cậy.
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Thành viên</h4>
              <div className="space-y-2">
                <a
                  href="#"
                  className="block !text-white hover:text-emerald-400 transition-colors !no-underline"
                >
                  Trường Huy
                </a>
                <a
                  href="#"
                  className="block !text-white hover:text-emerald-400 transition-colors !no-underline"
                >
                  Thục Nhân
                </a>
                <a
                  href="#"
                  className="block !text-white hover:text-emerald-400 transition-colors !no-underline"
                >
                  Đăng Khoa
                </a>
                <a
                  href="#"
                  className="block !text-white hover:text-emerald-400 transition-colors !no-underline"
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
                  className="block !text-white hover:text-emerald-400 transition-colors !no-underline"
                >
                  Về chúng tôi
                </a>
                <a
                  href="#"
                  className="block !text-white hover:text-emerald-400 transition-colors !no-underline"
                >
                  Tin tức
                </a>
                <a
                  href="#"
                  className="block !text-white hover:text-emerald-400 transition-colors !no-underline"
                >
                  Liên hệ
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-white mt-8 pt-8 text-center text-white">
            <p>&copy; 2025 T-Green - Một sản phẩm đến từ SWP391</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
