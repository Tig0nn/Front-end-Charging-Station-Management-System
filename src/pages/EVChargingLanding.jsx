import React, { useState, useEffect } from "react";
import {
  Battery,
  MapPin,
  Zap,
  Users,
  Settings,
  BarChart3,
  Shield,
  Smartphone,
  CreditCard,
  Clock,
  Car,
  ChevronRight,
  Menu,
  X,
  Star,
  Wifi,
  Eye,
  TrendingUp,
} from "lucide-react";

export default function EVChargingLanding() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      icon: Car,
      title: "Tài xế (EV Driver)",
      color: "bg-blue-500",
      items: [
        "Đăng ký & quản lý tài khoản toàn diện",
        "Bản đồ trạm sạc thông minh với thông tin chi tiết",
        "Đặt chỗ & khởi động phiên sạc dễ dàng",
        "Thanh toán đa dạng & ví điện tử",
        "Lịch sử & phân tích cá nhân chi tiết",
      ],
    },
    {
      icon: Users,
      title: "Nhân viên Trạm sạc",
      color: "bg-green-500",
      items: [
        "Quản lý thanh toán tại trạm sạc",
        "Kiểm soát khởi động/dừng phiên sạc",
        "Theo dõi tình trạng điểm sạc realtime",
        "Báo cáo sự cố nhanh chóng",
        "Giao diện thân thiện cho nhân viên",
      ],
    },
    {
      icon: Settings,
      title: "Quản trị (Admin)",
      color: "bg-purple-500",
      items: [
        "Quản lý toàn bộ hệ thống trạm sạc",
        "Điều khiển từ xa & giám sát",
        "Quản lý người dùng & gói dịch vụ",
        "Báo cáo & thống kê chi tiết",
        "AI dự báo nhu cầu sử dụng",
      ],
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      {/* Navigation */}
      <nav className="relative z-50 bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-green-400 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">EVCharge Pro</span>
            </div>

            <div className="hidden md:flex space-x-8">
              <a
                href="#features"
                className="text-white/80 hover:text-white transition-colors"
              >
                Tính năng
              </a>
              <a
                href="#pricing"
                className="text-white/80 hover:text-white transition-colors"
              >
                Bảng giá
              </a>
              <a
                href="#about"
                className="text-white/80 hover:text-white transition-colors"
              >
                Về chúng tôi
              </a>
              <a
                href="#contact"
                className="text-white/80 hover:text-white transition-colors"
              >
                Liên hệ
              </a>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              <button className="px-4 py-2 text-white/80 hover:text-white transition-colors">
                Đăng nhập
              </button>
              <button className="px-6 py-2 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-lg hover:from-blue-600 hover:to-green-600 transition-all shadow-lg hover:shadow-xl">
                Đăng ký
              </button>
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

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-black/90 backdrop-blur-md border-b border-white/10">
            <div className="px-4 py-6 space-y-4">
              <a
                href="#features"
                className="block text-white/80 hover:text-white transition-colors"
              >
                Tính năng
              </a>
              <a
                href="#pricing"
                className="block text-white/80 hover:text-white transition-colors"
              >
                Bảng giá
              </a>
              <a
                href="#about"
                className="block text-white/80 hover:text-white transition-colors"
              >
                Về chúng tôi
              </a>
              <a
                href="#contact"
                className="block text-white/80 hover:text-white transition-colors"
              >
                Liên hệ
              </a>
              <div className="pt-4 space-y-2">
                <button className="block w-full text-left text-white/80 hover:text-white transition-colors">
                  Đăng nhập
                </button>
                <button className="block w-full px-6 py-2 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-lg hover:from-blue-600 hover:to-green-600 transition-all">
                  Đăng ký
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
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
              Hệ thống quản lý trạm sạc xe điện thông minh
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              <span className="bg-gradient-to-r from-blue-400 via-green-400 to-blue-400 bg-clip-text text-transparent animate-pulse">
                EVCharge Pro
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-white/80 mb-8 max-w-3xl mx-auto leading-relaxed">
              Giải pháp toàn diện cho việc quản lý và vận hành hệ thống trạm sạc
              xe điện. Từ tài xế đến quản trị viên, chúng tôi có tất cả những gì
              bạn cần.
            </p>

            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <button className="group px-8 py-4 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-xl hover:from-blue-600 hover:to-green-600 transition-all shadow-2xl hover:shadow-3xl hover:scale-105 flex items-center">
                Dùng thử miễn phí
                <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-8 py-4 bg-white/10 backdrop-blur-md text-white rounded-xl hover:bg-white/20 transition-all border border-white/20 hover:border-white/40">
                Tìm hiểu thêm
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
            {[
              { number: "1000+", label: "Trạm sạc" },
              { number: "50K+", label: "Người dùng" },
              { number: "99.9%", label: "Uptime" },
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
      <section id="features" className="py-20 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Tính năng{" "}
              <span className="bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
                Đầy đủ
              </span>
            </h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              Hệ thống được thiết kế để phục vụ mọi đối tượng từ tài xế cá nhân
              đến quản trị viên hệ thống
            </p>
          </div>

          {/* Feature Tabs */}
          <div className="flex flex-col lg:flex-row justify-center mb-8">
            <div className="flex flex-col sm:flex-row lg:flex-col space-y-2 sm:space-y-0 sm:space-x-4 lg:space-x-0 lg:space-y-4 lg:mr-8 mb-8 lg:mb-0">
              {features.map((feature, index) => (
                <button
                  key={index}
                  onClick={() => setActiveFeature(index)}
                  className={`flex items-center px-6 py-4 rounded-xl transition-all text-left ${
                    activeFeature === index
                      ? "bg-white/20 text-white shadow-xl"
                      : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <feature.icon className="w-6 h-6 mr-3 flex-shrink-0" />
                  <span className="font-medium">{feature.title}</span>
                </button>
              ))}
            </div>

            {/* Feature Content */}
            <div className="flex-1 max-w-2xl">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
                <div className="flex items-center mb-6">
                  <div
                    className={`w-12 h-12 ${features[activeFeature].color} rounded-xl flex items-center justify-center mr-4`}
                  >
                    {React.createElement(features[activeFeature].icon, {
                      className: "w-6 h-6 text-white",
                    })}
                  </div>
                  <h3 className="text-2xl font-bold text-white">
                    {features[activeFeature].title}
                  </h3>
                </div>

                <div className="space-y-4">
                  {features[activeFeature].items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-center">
                      <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-green-400 rounded-full mr-4 flex-shrink-0"></div>
                      <span className="text-white/90">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
            {[
              {
                icon: Smartphone,
                title: "Ứng dụng Mobile",
                description:
                  "Giao diện thân thiện, dễ sử dụng trên mọi thiết bị di động",
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
                description:
                  "Hỗ trợ nhiều hình thức thanh toán: e-wallet, banking, thẻ",
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
                icon: Wifi,
                title: "Kết nối Realtime",
                description:
                  "Giám sát và điều khiển hệ thống theo thời gian thực",
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

      {/* Detailed Feature Sections */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Driver Features */}
          <div className="mb-20">
            <div className="flex flex-col lg:flex-row items-center">
              <div className="lg:w-1/2 mb-10 lg:mb-0 lg:pr-12">
                <div className="flex items-center mb-6">
                  <Car className="w-8 h-8 text-blue-400 mr-3" />
                  <h3 className="text-3xl font-bold text-white">
                    Dành cho Tài xế
                  </h3>
                </div>
                <div className="space-y-6">
                  <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                    <h4 className="text-xl font-semibold text-white mb-3">
                      Đăng ký & Quản lý tài khoản
                    </h4>
                    <p className="text-white/70 mb-4">
                      Đăng ký dễ dàng qua email, số điện thoại hoặc mạng xã hội.
                      Quản lý hồ sơ cá nhân, thông tin xe và lịch sử giao dịch.
                    </p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                    <h4 className="text-xl font-semibold text-white mb-3">
                      Bản đồ & Đặt chỗ
                    </h4>
                    <p className="text-white/70 mb-4">
                      Xem bản đồ trạm sạc với đầy đủ thông tin: vị trí, công
                      suất, tình trạng, loại cổng sạc, giá cả. Đặt trước và khởi
                      động bằng QR code.
                    </p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                    <h4 className="text-xl font-semibold text-white mb-3">
                      Thanh toán & Phân tích
                    </h4>
                    <p className="text-white/70">
                      Thanh toán linh hoạt theo kWh, thời gian hoặc gói. Báo cáo
                      chi phí và phân tích thói quen sạc cá nhân.
                    </p>
                  </div>
                </div>
              </div>
              <div className="lg:w-1/2">
                <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-md rounded-2xl p-8 border border-blue-400/30">
                  <div className="text-center">
                    <Battery className="w-16 h-16 text-blue-400 mx-auto mb-6" />
                    <h4 className="text-2xl font-bold text-white mb-4">
                      Trải nghiệm sạc thông minh
                    </h4>
                    <p className="text-white/80">
                      Theo dõi tiến trình sạc realtime, nhận thông báo khi hoàn
                      thành
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Staff Features */}
          <div className="mb-20">
            <div className="flex flex-col lg:flex-row-reverse items-center">
              <div className="lg:w-1/2 mb-10 lg:mb-0 lg:pl-12">
                <div className="flex items-center mb-6">
                  <Users className="w-8 h-8 text-green-400 mr-3" />
                  <h3 className="text-3xl font-bold text-white">
                    Dành cho Nhân viên
                  </h3>
                </div>
                <div className="space-y-6">
                  <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                    <h4 className="text-xl font-semibold text-white mb-3">
                      Quản lý Thanh toán
                    </h4>
                    <p className="text-white/70 mb-4">
                      Hỗ trợ thanh toán tại chỗ, khởi động và dừng phiên sạc cho
                      khách hàng một cách nhanh chóng.
                    </p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                    <h4 className="text-xl font-semibold text-white mb-3">
                      Giám sát Trạm sạc
                    </h4>
                    <p className="text-white/70">
                      Theo dõi tình trạng điểm sạc realtime, báo cáo sự cố nhanh
                      chóng và chính xác.
                    </p>
                  </div>
                </div>
              </div>
              <div className="lg:w-1/2">
                <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-md rounded-2xl p-8 border border-green-400/30">
                  <div className="text-center">
                    <Eye className="w-16 h-16 text-green-400 mx-auto mb-6" />
                    <h4 className="text-2xl font-bold text-white mb-4">
                      Giám sát chuyên nghiệp
                    </h4>
                    <p className="text-white/80">
                      Giao diện đơn giản, dễ sử dụng cho nhân viên tại trạm
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Admin Features */}
          <div>
            <div className="flex flex-col lg:flex-row items-center">
              <div className="lg:w-1/2 mb-10 lg:mb-0 lg:pr-12">
                <div className="flex items-center mb-6">
                  <Settings className="w-8 h-8 text-purple-400 mr-3" />
                  <h3 className="text-3xl font-bold text-white">
                    Dành cho Quản trị
                  </h3>
                </div>
                <div className="space-y-6">
                  <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                    <h4 className="text-xl font-semibold text-white mb-3">
                      Quản lý Hệ thống
                    </h4>
                    <p className="text-white/70 mb-4">
                      Theo dõi toàn bộ hệ thống trạm sạc, điều khiển từ xa, quản
                      lý người dùng và gói dịch vụ.
                    </p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                    <h4 className="text-xl font-semibold text-white mb-3">
                      Báo cáo & AI
                    </h4>
                    <p className="text-white/70 mb-4">
                      Thống kê doanh thu chi tiết, phân tích tần suất sử dụng và
                      AI dự báo nhu cầu để nâng cấp hạ tầng.
                    </p>
                  </div>
                </div>
              </div>
              <div className="lg:w-1/2">
                <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-md rounded-2xl p-8 border border-purple-400/30">
                  <div className="text-center">
                    <TrendingUp className="w-16 h-16 text-purple-400 mx-auto mb-6" />
                    <h4 className="text-2xl font-bold text-white mb-4">
                      Quản trị thông minh
                    </h4>
                    <p className="text-white/80">
                      Dashboard tổng quan với AI dự báo và phân tích dữ liệu
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600/20 to-green-600/20 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Sẵn sàng bắt đầu?
          </h2>
          <p className="text-xl text-white/80 mb-8">
            Tham gia cùng hàng nghìn người dùng đang sử dụng EVCharge Pro để
            quản lý hệ thống sạc xe điện
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <button className="group px-8 py-4 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-xl hover:from-blue-600 hover:to-green-600 transition-all shadow-2xl hover:shadow-3xl hover:scale-105 flex items-center">
              Dùng thử 30 ngày miễn phí
              <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="px-8 py-4 bg-white/10 backdrop-blur-md text-white rounded-xl hover:bg-white/20 transition-all border border-white/20 hover:border-white/40">
              Liên hệ tư vấn
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/30 backdrop-blur-md border-t border-white/10 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-green-400 rounded-xl flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-white">
                  EVCharge Pro
                </span>
              </div>
              <p className="text-white/70">
                Giải pháp quản lý trạm sạc xe điện thông minh và toàn diện.
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Sản phẩm</h4>
              <div className="space-y-2">
                <a
                  href="#"
                  className="block text-white/70 hover:text-white transition-colors"
                >
                  Ứng dụng tài xế
                </a>
                <a
                  href="#"
                  className="block text-white/70 hover:text-white transition-colors"
                >
                  Hệ thống nhân viên
                </a>
                <a
                  href="#"
                  className="block text-white/70 hover:text-white transition-colors"
                >
                  Dashboard quản trị
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Hỗ trợ</h4>
              <div className="space-y-2">
                <a
                  href="#"
                  className="block text-white/70 hover:text-white transition-colors"
                >
                  Tài liệu
                </a>
                <a
                  href="#"
                  className="block text-white/70 hover:text-white transition-colors"
                >
                  API
                </a>
                <a
                  href="#"
                  className="block text-white/70 hover:text-white transition-colors"
                >
                  Trợ giúp
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
            <p>&copy; 2024 EVCharge Pro. Tất cả quyền được bảo lưu.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
