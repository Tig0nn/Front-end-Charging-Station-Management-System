import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router";
import { Toaster } from "react-hot-toast";
import Header from "./Header";
import { usersAPI } from "../../lib/apiServices";
import "bootstrap-icons/font/bootstrap-icons.css";

const MainLayoutDriver = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userName, setUserName] = useState("Tài xế");

  // Weather data - Từ API thật
  const [weather, setWeather] = useState({
    temp: 28,
    condition: "Loading...",
    icon: "bi-cloud-sun-fill",
    location: "...",
    humidity: 0,
    windSpeed: 0,
  });
  const [loadingWeather, setLoadingWeather] = useState(true);

  // API Key WeatherAPI.com (Thay bằng key của bạn)
  // Đăng ký miễn phí tại: https://www.weatherapi.com/
  // Free tier: 1 million calls/month
  const WEATHER_API_KEY = "280e5a72325d4efdbee142834250111"; // Demo key

  // Map weather condition text to icon and Vietnamese text
  const getWeatherInfo = (conditionText) => {
    const condition = conditionText.toLowerCase();

    if (condition.includes("sunny") || condition.includes("clear")) {
      return { icon: "bi-sun-fill", text: "Trời quang" };
    } else if (condition.includes("partly cloudy")) {
      return { icon: "bi-cloud-sun-fill", text: "Có mây" };
    } else if (condition.includes("cloudy") || condition.includes("overcast")) {
      return { icon: "bi-cloud-fill", text: "U ám" };
    } else if (condition.includes("rain") || condition.includes("drizzle")) {
      return { icon: "bi-cloud-rain-fill", text: "Mưa" };
    } else if (condition.includes("thunder")) {
      return { icon: "bi-cloud-lightning-rain-fill", text: "Dông" };
    } else if (condition.includes("snow")) {
      return { icon: "bi-cloud-snow-fill", text: "Tuyết" };
    } else if (condition.includes("mist") || condition.includes("fog")) {
      return { icon: "bi-cloud-fog-fill", text: "Sương mù" };
    }
    return { icon: "bi-cloud-sun-fill", text: conditionText || "Bình thường" };
  };

  // Fetch weather data using WeatherAPI.com
  const fetchWeatherData = async (lat, lon) => {
    try {
      // WeatherAPI.com supports lat,lon query
      const response = await fetch(
        `https://api.weatherapi.com/v1/current.json?key=${WEATHER_API_KEY}&q=${lat},${lon}&lang=vi&aqi=no`
      );
      const data = await response.json();

      if (response.ok && data.current) {
        const weatherInfo = getWeatherInfo(data.current.condition.text);

        setWeather({
          temp: Math.round(data.current.temp_c),
          condition: weatherInfo.text,
          icon: weatherInfo.icon,
          location: data.location.name || data.location.region || "Việt Nam",
          humidity: data.current.humidity,
          windSpeed: Math.round(data.current.wind_kph),
        });
      } else {
        console.error("Weather API error:", data.error?.message);
      }
    } catch (error) {
      console.error("Failed to fetch weather:", error);
    } finally {
      setLoadingWeather(false);
    }
  };

  // Get user's location and fetch weather
  const getUserLocationAndWeather = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchWeatherData(latitude, longitude);
        },
        (error) => {
          console.error("Geolocation error:", error);
          // Fallback: Use Ho Chi Minh City coordinates
          fetchWeatherData(10.8231, 106.6297);
        }
      );
    } else {
      // Fallback: Use Ho Chi Minh City coordinates
      fetchWeatherData(10.8231, 106.6297);
    }
  };

  useEffect(() => {
    // Fetch driver info từ API
    const fetchDriverInfo = async () => {
      try {
        console.log("📞 MainLayoutDriver: Fetching driver info...");
        const response = await usersAPI.getProfile();

        const responseData =
          response.data?.result || response.result || response.data;

        // Backend returns data inside driverProfile object
        const driverData = responseData.driverProfile || responseData;

        const name =
          driverData.fullname ||
          driverData.fullName ||
          driverData.firstname ||
          driverData.firstName ||
          driverData.lastname ||
          driverData.lastName ||
          driverData.username ||
          "Tài xế";

        console.log("👤 MainLayoutDriver: Driver name:", name);
        setUserName(name);

        // Also update localStorage for other components
        const userData = {
          userId: driverData.userId,
          email: driverData.email,
          phone: driverData.phone,
          dateOfBirth: driverData.dateOfBirth,
          gender: driverData.gender,
          firstName: driverData.firstname || driverData.firstName,
          lastName: driverData.lastname || driverData.lastName,
          fullName: driverData.fullname || driverData.fullName,
          address: driverData.address,
          joinDate: driverData.joinDate,
          role: "DRIVER",
        };
        localStorage.setItem("user", JSON.stringify(userData));
      } catch (error) {
        console.error(
          "❌ MainLayoutDriver: Error fetching driver info:",
          error
        );
        // Fallback: Lấy từ localStorage nếu API lỗi
        const cachedUser = JSON.parse(localStorage.getItem("user") || "{}");
        const name =
          cachedUser.fullName ||
          cachedUser.firstName ||
          cachedUser.lastName ||
          cachedUser.username ||
          "Tài xế";
        setUserName(name);
      }
    };

    fetchDriverInfo();

    // Fetch weather data từ API thật
    getUserLocationAndWeather();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // Navigation tabs - Driver version (Không có phần Overview)
  const tabs = [
    {
      path: "/driver/map",
      label: "Bản đồ trạm sạc",
      icon: "bi-geo-alt",
    },
    {
      path: "/driver/session",
      label: "Phiên sạc",
      icon: "bi-lightning-charge",
    },
    {
      path: "/driver/history",
      label: "Lịch sử",
      icon: "bi-clock-history",
    },
    {
      path: "/driver/wallet",
      label: "Ví",
      icon: "bi-wallet2",
    },
    {
      path: "/driver/profile",
      label: "Hồ sơ",
      icon: "bi-person-circle",
    },
  ];

  const isActiveTab = (path) => {
    // Check if current path starts with the tab path
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#ffffff" }}>
      {/* Header */}
      <Header />

      {/* Main Content Area */}
      <Container
        fluid
        style={{
          marginTop: "90px",
          paddingBottom: "40px",
          paddingLeft: "32px",
          paddingRight: "32px",
        }}
      >
        {/* Greeting & Weather Widget Section */}
        <div className="mb-4">
          {/* Greeting Card with Weather */}
          <Row className="mb-4">
            <Col>
              <Card
                className="border-0"
                style={{
                  background:
                    "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  borderRadius: "16px",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                  color: "white",
                }}
              >
                <Card.Body className="p-4">
                  <Row className="align-items-center">
                    {/* Left Side - Greeting */}
                    <Col md={6}>
                      <h1
                        className="mb-2"
                        style={{
                          fontSize: "32px",
                          fontWeight: "700",
                          color: "#ffffff",
                        }}
                      >
                        Xin chào, {userName}!
                      </h1>
                      <p
                        className="mb-0"
                        style={{
                          color: "rgba(255,255,255,0.9)",
                          fontSize: "15px",
                        }}
                      >
                        Chúc bạn có một ngày tuyệt vời!
                      </p>
                    </Col>

                    {/* Right Side - Weather Info */}
                    <Col md={6}>
                      <div className="d-flex align-items-center justify-content-md-end gap-4">
                        {/* Weather Icon & Temp */}
                        <div className="d-flex align-items-center gap-3">
                          {loadingWeather ? (
                            <div
                              className="spinner-border text-light"
                              role="status"
                              style={{ width: "64px", height: "64px" }}
                            >
                              <span className="visually-hidden">
                                Loading...
                              </span>
                            </div>
                          ) : (
                            <i
                              className={`bi ${weather.icon}`}
                              style={{
                                fontSize: "64px",
                                color: "#FFD700",
                                filter:
                                  "drop-shadow(0 2px 4px rgba(0,0,0,0.2))",
                              }}
                            ></i>
                          )}
                          <div>
                            <div
                              style={{
                                fontSize: "48px",
                                fontWeight: "700",
                                lineHeight: "1",
                              }}
                            >
                              {loadingWeather ? "--" : `${weather.temp}°C`}
                            </div>
                            <div
                              style={{
                                fontSize: "16px",
                                opacity: 0.9,
                                marginTop: "4px",
                              }}
                            >
                              {weather.condition}
                            </div>
                          </div>
                        </div>

                        {/* Additional Info */}
                        <div
                          className="d-none d-lg-block"
                          style={{
                            borderLeft: "1px solid rgba(255,255,255,0.3)",
                            paddingLeft: "20px",
                          }}
                        >
                          <div className="mb-2">
                            <i className="bi bi-geo-alt-fill me-2"></i>
                            <span style={{ fontSize: "14px" }}>
                              {weather.location}
                            </span>
                          </div>
                          <div className="mb-2">
                            <i className="bi bi-droplet-fill me-2"></i>
                            <span style={{ fontSize: "14px" }}>
                              Độ ẩm: {weather.humidity}%
                            </span>
                          </div>
                          <div>
                            <i className="bi bi-wind me-2"></i>
                            <span style={{ fontSize: "14px" }}>
                              Gió: {weather.windSpeed} km/h
                            </span>
                          </div>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>{" "}
          {/* Navigation Tabs - Modern Pill Style */}
          <Row className="mb-4">
            <Col>
              <div
                style={{
                  display: "inline-flex",
                  gap: "8px",
                  padding: "8px",
                  backgroundColor: "#f8fafc",
                  borderRadius: "50px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.04)",
                }}
              >
                {tabs.map((tab) => (
                  <button
                    key={tab.path}
                    className="nav-pill-button"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      borderRadius: "50px",
                      padding: "8px 20px",
                      fontSize: "14px",
                      fontWeight: isActiveTab(tab.path) ? "600" : "500",
                      border: "none",
                      background: isActiveTab(tab.path)
                        ? "#22c55e"
                        : "transparent",
                      color: isActiveTab(tab.path) ? "#ffffff" : "#64748b",
                      cursor: "pointer",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      transform: isActiveTab(tab.path)
                        ? "translateY(-1px)"
                        : "translateY(0)",
                      boxShadow: isActiveTab(tab.path)
                        ? "0 4px 6px rgba(34, 197, 94, 0.25)"
                        : "none",
                      whiteSpace: "nowrap",
                      outline: "none",
                      textDecoration: "none",
                      WebkitTapHighlightColor: "transparent",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActiveTab(tab.path)) {
                        e.currentTarget.style.backgroundColor = "#e2e8f0";
                        e.currentTarget.style.color = "#334155";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActiveTab(tab.path)) {
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.color = "#64748b";
                      }
                    }}
                    onMouseDown={(e) => {
                      e.currentTarget.style.color = isActiveTab(tab.path)
                        ? "#ffffff"
                        : "#64748b";
                    }}
                    onClick={() => navigate(tab.path)}
                  >
                    <i
                      className={`bi ${tab.icon}`}
                      style={{ fontSize: "16px" }}
                    ></i>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </Col>
          </Row>
        </div>{" "}
        {/* Dynamic Content - No Card Wrapper, Full Width */}
        {children}
      </Container>

      {/* 🎨 Toast Notifications - Driver */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            minWidth: "350px",
            padding: "16px",
            fontSize: "14px",
            fontWeight: "500",
          },
          success: {
            style: {
              background: "#10b981",
              color: "white",
            },
            iconTheme: {
              primary: "white",
              secondary: "#10b981",
            },
          },
          error: {
            style: {
              background: "#ef4444",
              color: "white",
            },
            iconTheme: {
              primary: "white",
              secondary: "#ef4444",
            },
          },
        }}
      />
    </div>
  );
};

export default MainLayoutDriver;
