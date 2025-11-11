import React, { useRef, useState, useEffect } from "react";
import {
  Container,
  Badge,
  Button,
  Spinner,
  Alert,
} from "react-bootstrap";
import { chargingPointsAPI } from "../../lib/apiServices";
import LoadingSpinner from "../../components/loading_spins/LoadingSpinner.jsx";
import toast from "react-hot-toast";

// Hàm định dạng công suất từ "POWER_22KW" thành "22kW"
const formatPower = (powerString) => {
  if (!powerString) return "N/A";
  const matches = powerString.match(/(\d+)/);
  return matches ? `${matches[0]}kW` : powerString;
};

// Hàm lấy thông tin trạng thái và màu sắc
const getStatusInfo = (point) => {
  if (point.status === "AVAILABLE" && !point.currentSessionId) {
    return { text: "Sẵn sàng", bg: "primary" };
  }
  if (point.status === "AVAILABLE" && point.currentSessionId) {
    return { text: "Đang sạc", bg: "success" };
  }
  if (point.status === "CHARGING") {
    return { text: "Đang sạc", bg: "success" };
  }
  if (point.status === "OUT_OF_SERVICE" || point.status === "UNAVAILABLE") {
    return { text: "Lỗi", bg: "danger" };
  }
  if (point.status === "MAINTENANCE") {
    return { text: "Bảo trì", bg: "warning", textColor: "dark" };
  }
  return { text: point.status, bg: "secondary" };
};

// --- 💡 THÊM HÀM HELPER ĐỊNH DẠNG TIỀN ---
const formatCurrency = (value) => {
  if (typeof value !== "number") {
    return "0 đ";
  }
  return value.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
};

export default function StationOverview() {
  const timerRef = useRef(null);
  const [chargingPoints, setChargingPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Read from "staff" localStorage instead of "user"
  const staff = JSON.parse(localStorage.getItem("staff") || "{}");
  const stationId = staff?.stationId;

  const handleUpdateStatus = async (newStatus) => {
    try {
      if (!selectedPoint) return;
      const power = selectedPoint.chargingPower;
      await chargingPointsAPI.updateStatus(
        power,
        stationId,
        selectedPoint.pointId,
        newStatus
      );
      toast.success(
        `Đã cập nhật trạng thái trụ ${selectedPoint.name} thành công!`
      );
      await fetchChargingPoints(false);
      setShowModal(false);
    } catch (err) {
      console.error("Lỗi khi cập nhật trạng thái trụ sạc:", err);
      toast.error("Không thể cập nhật trạng thái trụ sạc.");
      setShowModal(false);
    }
  };

  const fetchChargingPoints = async (showLoading = true) => {
    const staff = JSON.parse(localStorage.getItem("staff") || "{}");
    const stationId = staff?.stationId;
    try {
      if (showLoading) setLoading(true);
      setError(null);

      const response = await chargingPointsAPI.getChargersByStation(stationId);
      const points = response.data?.result || [];

      const activePoints = points.filter((p) => p.currentSessionId);

      const detailPromises = activePoints.map((point) =>
        chargingPointsAPI
          .simulateCharging(point.currentSessionId)
          .then((res) => res.data.result)
          .catch((err) => {
            console.error(
              `Lỗi lấy chi tiết session ${point.currentSessionId}:`,
              err
            );
            return null;
          })
      );

      const sessionDetails = await Promise.all(detailPromises);

      const detailsMap = {};
      sessionDetails.forEach((session) => {
        if (session && session.sessionId) {
          detailsMap[session.sessionId] = session;
        }
      });

      const mergedPoints = points.map((point) => ({
        ...point,
        currentSessionInfo: detailsMap[point.currentSessionId] || null,
      }));

      setChargingPoints(mergedPoints);
    } catch (err) {
      console.error("Error fetching charging points:", err);
      setError("Không thể tải danh sách trụ sạc. Vui lòng thử lại.");
    } finally {
      if (showLoading || loading) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    const staff = JSON.parse(localStorage.getItem("staff") || "{}");
    if (staff?.stationId) {
      fetchChargingPoints();
    }

    timerRef.current = setInterval(() => {
      console.log("(Polling) Đang tải lại danh sách trụ sạc và chi tiết...");
      fetchChargingPoints(false);
    }, 10000);

    return () => {
      if (timerRef.current) {
        console.log("Dọn dẹp: Dừng polling StationOverview.");
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Chỉ chạy 1 lần khi mount

  if (loading && chargingPoints.length === 0) {
    return (
      <Container className="text-center py-5">
        <LoadingSpinner />
        <p className="mt-2">Đang tải dữ liệu trạm sạc...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      {/* Header với nút Làm mới */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Tổng quan trạm sạc</h2>
          <p className="text-muted mb-0">
            Theo dõi trạng thái các trụ sạc ({chargingPoints.length} trụ)
          </p>
        </div>
        <Button
          onClick={() => fetchChargingPoints(true)}
          disabled={loading}
          className="d-flex align-items-center gap-2"
          style={{
            backgroundColor: "#22c55e",
            borderColor: "#22c55e",
            color: "white",
            fontWeight: "bold",
          }}
        >
          {loading ? (
            <>
              <Spinner as="span" animation="border" size="sm" />
              <span>Đang tải...</span>
            </>
          ) : (
            <>
              <i className="bi bi-arrow-clockwise"></i>
              <span>Làm mới</span>
            </>
          )}
        </Button>
      </div>

      {/* Edit Status Modal - New Styling */}
      {showModal && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-center"
          style={{
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 1050,
            padding: "1rem",
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl p-4"
            style={{
              maxWidth: "28rem",
              width: "100%",
              borderRadius: "0.75rem",
              boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="d-flex justify-content-between align-items-start mb-3">
              <h3 className="fs-5 fw-bold text-gray-900">
                Chỉnh sửa: {selectedPoint?.name}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="btn-close"
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "1.5rem",
                  color: "#9ca3af",
                  cursor: "pointer",
                }}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            {/* Content */}
            <div className="mb-4">
              <p className="text-muted mb-3">
                Chọn trạng thái mới cho trụ sạc:
              </p>
              <div className="d-flex flex-column gap-3">
                <button
                  onClick={() => handleUpdateStatus("MAINTENANCE")}
                  className="w-100 px-4 py-3 rounded-lg fw-semibold"
                  style={{
                    backgroundColor: "#fef3c7",
                    color: "#92400e",
                    border: "none",
                    borderRadius: "0.5rem",
                    transition: "background-color 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#fde68a")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "#fef3c7")
                  }
                >
                  <i className="bi bi-wrench me-2"></i>
                  Bảo trì
                </button>
                <button
                  onClick={() => handleUpdateStatus("OUT_OF_SERVICE")}
                  className="w-100 px-4 py-3 rounded-lg fw-semibold"
                  style={{
                    backgroundColor: "#f3f4f6",
                    color: "#374151",
                    border: "none",
                    borderRadius: "0.5rem",
                    transition: "background-color 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#e5e7eb")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "#f3f4f6")
                  }
                >
                  <i className="bi bi-pause-circle me-2"></i>
                  Tạm dừng
                </button>
                {(selectedPoint?.status === "OUT_OF_SERVICE" ||
                  selectedPoint?.status === "MAINTENANCE") && (
                  <button
                    onClick={() => handleUpdateStatus("AVAILABLE")}
                    className="w-100 px-4 py-3 text-white rounded-lg fw-semibold"
                    style={{
                      backgroundColor: "#22c55e",
                      border: "none",
                      borderRadius: "0.5rem",
                      transition: "background-color 0.2s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#16a34a")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "#22c55e")
                    }
                  >
                    <i className="bi bi-play-circle me-2"></i>
                    Kích hoạt
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Charging Points Grid - New Styling */}
      <div className="row g-4">
        {chargingPoints.map((point) => {
          const statusInfo = getStatusInfo(point);
          const isCharging = statusInfo.text === "Đang sạc";
          const sessionInfo = point.currentSessionInfo;

          return (
            <div key={point.pointId} className="col-12 col-md-6 col-lg-4">
              <div
                className="border-2 rounded-lg p-4 h-100"
                style={{
                  border: "2px solid #e5e7eb",
                  borderRadius: "0.5rem",
                  transition: "border-color 0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.borderColor = "#22c55e")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.borderColor = "#e5e7eb")
                }
              >
                {/* Status Badge */}
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="mb-0 fw-semibold">{point.name}</h6>
                  <Badge
                    bg={statusInfo.bg}
                    text={statusInfo.textColor || "light"}
                    style={{
                      padding: "0.375rem 0.75rem",
                      borderRadius: "9999px",
                      fontSize: "0.75rem",
                      fontWeight: "600",
                    }}
                  >
                    {statusInfo.text}
                  </Badge>
                </div>

                {/* Power */}
                <p className="text-muted small mb-3">
                  Công suất: {formatPower(point.chargingPower)}
                </p>

                {/* Session Info if charging */}
                {isCharging && point.currentSessionId && (
                  <div
                    className="p-3 rounded-lg mb-3"
                    style={{
                      backgroundColor: "#dcfce7",
                      borderRadius: "0.5rem",
                    }}
                  >
                    <div className="fw-semibold text-success mb-2">
                      Đang phục vụ khách
                    </div>
                    <div className="small">
                      <div className="d-flex justify-content-between mb-1">
                        <span className="text-muted">Pin:</span>
                        <span className="fw-semibold">
                          {sessionInfo?.soc ?? "..."}%
                        </span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span className="text-muted">Phí:</span>
                        <span className="fw-semibold">
                          {formatCurrency(sessionInfo?.totalCost)}
                        </span>
                      </div>
                    </div>
                    <div className="text-muted" style={{ fontSize: "0.75rem", marginTop: "0.5rem" }}>
                      Session: {point.currentSessionId.substring(0, 8)}...
                    </div>
                  </div>
                )}

                {/* Error/Maintenance messages */}
                {statusInfo.text === "Lỗi" && (
                  <div
                    className="text-center py-3 rounded-lg mb-3"
                    style={{
                      backgroundColor: "#fee2e2",
                      color: "#dc2626",
                      borderRadius: "0.5rem",
                    }}
                  >
                    Trụ đang gặp lỗi
                  </div>
                )}

                {statusInfo.text === "Bảo trì" && (
                  <div
                    className="text-center py-3 rounded-lg mb-3"
                    style={{
                      backgroundColor: "#fef3c7",
                      color: "#b45309",
                      borderRadius: "0.5rem",
                    }}
                  >
                    Đang bảo trì
                  </div>
                )}

                {/* Actions */}
                <div className="d-flex gap-2">
                  {statusInfo.text !== "Đang sạc" && !isCharging && (
                    <button
                      onClick={() => {
                        setSelectedPoint(point);
                        setShowModal(true);
                      }}
                      disabled={loading}
                      className="flex-grow-1 px-3 py-2 text-white rounded fw-semibold"
                      style={{
                        backgroundColor: "#22c55e",
                        border: "none",
                        borderRadius: "0.5rem",
                        fontSize: "0.875rem",
                        transition: "background-color 0.2s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = "#16a34a")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = "#22c55e")
                      }
                    >
                      Chỉnh sửa
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Container>
  );
}
