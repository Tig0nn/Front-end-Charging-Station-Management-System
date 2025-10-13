import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  BadgeDollarSign,
  MapPin,
  Zap,
  BarChart3,
  Shield,
  CreditCard,
  Menu,
  X,
  Wifi,
} from "lucide-react";
import { plansAPI } from "../lib/apiServices";
import logo from "../assets/image/logo.png";
import aboutImg from "../assets/image/img.png";
import "./EVChargingLanding.css";

export default function EVChargingLanding() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await plansAPI.getAll();
        setPlans(res.data?.result || res.data || []);
      } catch (e) {
        setError("Không thể tải được các gói thuê bao. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!plans.length) return;
    const t = setInterval(() => setActiveFeature((p) => (p + 1) % plans.length), 4000);
    return () => clearInterval(t);
  }, [plans.length]);

  const formatCurrency = (n) =>
    typeof n === "number"
      ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n)
      : "N/A";

  return (
    <div className="ev-landing">
      <nav className="ev-nav">
        <div className="ev-container">
          <div className="ev-nav-inner">
            <div className="ev-brand">
              <img src={logo} alt="Juudensha" className="ev-logo" />
              <span className="ev-brand-name">Juudensha</span>
            </div>

            <nav className={`ev-menu ${isMenuOpen ? "open" : ""}`}>
              <a href="#features" className="ev-link">
                Tiện ích
              </a>
              <a href="#subscription" className="ev-link">
                Gói thuê bao
              </a>
              <a href="#about" className="ev-link">
                Về chúng tôi
              </a>
            </nav>

            <div className="ev-actions">
              <Link to="/login" className="ev-btn ev-btn-ghost">
                Đăng nhập
              </Link>
              <Link to="/signup" className="ev-btn ev-btn-pill">
                Đăng ký
              </Link>
            </div>

            <button
              className="ev-burger md-hide"
              onClick={() => setIsMenuOpen((v) => !v)}
              aria-label="Menu"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
      </nav>

      <section className="ev-hero">
        <div className="ev-blob blue"></div>
        <div className="ev-blob green"></div>
        <div className="ev-blob purple"></div>

        <div className="ev-container">
          <div className="ev-badge">
            <Zap size={16} /> Hệ thống trạm sạc xe điện thông minh
          </div>

          <h1 className="ev-title">Juudensha</h1>

          <p className="ev-subtitle">
            Bạn có xe điện? Chúng tôi có trạm sạc! Hãy tin tưởng vào Juudensha.
          </p>

          <div>
            <Link to="/signup" className="ev-btn ev-btn-cta">
              Bắt đầu ngay
            </Link>
          </div>

          <section className="ev-stats">
            {[
              { number: "1000+", label: "Trạm sạc" },
              { number: "50K+", label: "Người dùng" },
              { number: "24/7", label: "Hỗ trợ" },
            ].map((s, i) => (
              <div className="ev-stat" key={i}>
                <div className="ev-stat-num">{s.number}</div>
                <div className="ev-stat-label">{s.label}</div>
              </div>
            ))}
          </section>
        </div>
      </section>

      <section id="features" className="ev-section-dark section-pad">
        <div className="ev-container">
          <h2 className="ev-section-title">
            Tiện ích{" "}
            <span className="grad">gì mà nhiều thế?</span>
          </h2>
          <p className="ev-section-subtitle">
            Trạm sạc chúng tôi luôn cố gắng mang tới trải nghiệm tốt nhất.
          </p>

          <div className="ev-grid">
            {[
              { icon: BadgeDollarSign, title: "Gói thuê bao linh hoạt", description: "Nhiều lựa chọn phù hợp với nhu cầu của bạn." },
              { icon: MapPin,          title: "Bản đồ Thông minh",      description: "Tìm trạm sạc gần nhất với thông tin chi tiết và realtime." },
              { icon: CreditCard,      title: "Thanh toán Đa dạng",     description: "Hỗ trợ nhiều hình thức thanh toán." },
              { icon: BarChart3,       title: "Báo cáo Chi tiết",        description: "Thống kê và phân tích dữ liệu trực quan." },
              { icon: Shield,          title: "Bảo mật Cao",            description: "An toàn thông tin và giao dịch của người dùng." },
              { icon: Wifi,            title: "Kết nối Realtime",       description: "Giám sát và điều khiển theo thời gian thực." },
            ].map((f, i) => (
              <div className="ev-card" key={i}>
                <f.icon className="ev-icon-lg" />
                <h3>{f.title}</h3>
                <p>{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="subscription" className="ev-subscription section-pad-lg">
        <div className="ev-container">
          <h2 className="ev-section-title">
            Tràn ngập ưu đãi{" "}
            <span className="grad">hấp dẫn!</span>
          </h2>
          <p className="ev-section-subtitle">
            Các gói thuê bao mang đến nhiều ưu đãi cho bạn.
          </p>

          {loading && <div style={{ textAlign: "center" }}>Đang tải các gói...</div>}
          {error && <div style={{ textAlign: "center", color: "#fca5a5" }}>{error}</div>}

          {!loading && !error && plans.length > 0 && (
            <div className="ev-plan-wrap">
              <div className="ev-plan-tabs">
                {plans.map((p, i) => (
                  <button
                    key={p.planId || i}
                    className={`ev-plan-tab ${activeFeature === i ? "is-active" : ""}`}
                    onClick={() => setActiveFeature(i)}
                  >
                    <span style={{ fontWeight: 600 }}>{p.name}</span>
                  </button>
                ))}
              </div>

              <div className="ev-panel">
                <div className="ev-panel-box">
                  <h3>{plans[activeFeature]?.name}</h3>
                  <div className="kv">
                    <strong>Loại thanh toán:</strong>{" "}
                    {plans[activeFeature]?.billingType === "MONTHLY_SUBSCRIPTION"
                      ? "Theo tháng"
                      : plans[activeFeature]?.billingType}
                  </div>
                  <div className="kv">
                    <strong>Phí hàng tháng:</strong>{" "}
                    {formatCurrency(plans[activeFeature]?.monthlyFee)}
                  </div>
                  <div className="kv">
                    <strong>Giá mỗi kWh:</strong>{" "}
                    {formatCurrency(plans[activeFeature]?.pricePerKwh)}
                  </div>
                  <div className="kv">
                    <strong>Giá mỗi phút:</strong>{" "}
                    {formatCurrency(plans[activeFeature]?.pricePerMinute)}
                  </div>
                  <div className="kv">
                    <strong>Quyền lợi khác:</strong>{" "}
                    {plans[activeFeature]?.benefits}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <section id="about" className="ev-section-dark section-pad">
        <div className="ev-container">
          <h2 className="ev-section-title">
            Chúng tôi{" "}
            <span className="grad">là ai nhỉ?</span>
          </h2>
          <p className="ev-section-subtitle">
            Những bạn trẻ góp phần phát triển trào lưu xe điện.
          </p>

          <div className="ev-about-grid">
            <div style={{ flex: 1 }}>
              <img src={aboutImg} alt="Về chúng tôi" className="ev-about-img" />
            </div>
            <div
              style={{
                flex: 1,
                fontSize: 18,
                color: "rgba(255,255,255,.8)",
              }}
            >
              <h3
                style={{
                  fontSize: 28,
                  color: "#fff",
                  fontWeight: 800,
                  marginBottom: 12,
                }}
              >
                Sứ mệnh của Juudensha
              </h3>
              <p className="mb-4">
                Juudensha được thành lập với sứ mệnh thúc đẩy cuộc cách mạng xe điện tại Việt Nam.
                Chúng tôi xây dựng một mạng lưới trạm sạc thông minh, tiện lợi và đáng tin cậy.
              </p>
              <p>
                Với công nghệ tiên tiến và đội ngũ tận tâm, chúng tôi cam kết mang đến trải nghiệm sạc xe tốt nhất,
                góp phần xây dựng một tương lai giao thông bền vững.
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="ev-footer">
        <div className="ev-container">
          <div className="ev-footer-grid">
            <div>
              <div className="brand">
                <img src={logo} alt="Juudensha" />
                <span style={{ fontSize: 20, fontWeight: 800, color: "#fff" }}>Juudensha</span>
              </div>
              <p style={{ color: "rgba(255,255,255,.7)" }}>
                Hệ thống trạm sạc xe điện thông minh, tiện lợi và đáng tin cậy.
              </p>
            </div>

            <div>
              <h4 style={{ color: "#fff", fontWeight: 600, marginBottom: 12 }}>Thành viên</h4>
              <a href="#">Trường Huy</a>
              <a href="#">Thục Nhân</a>
              <a href="#">Đăng Khoa</a>
              <a href="#">Phi Trường</a>
            </div>

            <div>
              <h4 style={{ color: "#fff", fontWeight: 600, marginBottom: 12 }}>Công ty</h4>
              <a href="#">Về chúng tôi</a>
              <a href="#">Tin tức</a>
              <a href="#">Liên hệ</a>
            </div>
          </div>

          <div className="ev-footer-bottom">
            <p>&copy; 2025 Juudensha - Một sản phẩm đến từ SWP391</p>
            <p>Mọi thông tin chỉ là minh họa.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
