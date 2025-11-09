import React, { useRef, useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Badge,
  Button,
  Modal,
  Spinner,
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
      toast.success(`Đã cập nhật trạng thái trụ ${selectedPoint.name} thành công!`);
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
          variant="success"
          onClick={() => fetchChargingPoints(true)}
          disabled={loading}
          className="d-flex align-items-center gap-2"
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

      {/* Modal Chỉnh sửa */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Chỉnh sửa: {selectedPoint?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedPoint && (
            <div className="d-flex gap-2 mt-3">
              <Button
                variant="warning"
                className="w-50"
                onClick={() => handleUpdateStatus("MAINTENANCE")}
              >
                Bảo trì
              </Button>
              <Button
                variant="secondary"
                className="w-50"
                onClick={() => handleUpdateStatus("OUT_OF_SERVICE")}
              >
                Tạm dừng
              </Button>
              {(selectedPoint?.status === "OUT_OF_SERVICE" ||
                selectedPoint?.status === "MAINTENANCE") && (
                <Button
                  variant="primary"
                  className="w-50"
                  onClick={() => handleUpdateStatus("AVAILABLE")}
                >
                  Kích hoạt
                </Button>
              )}
            </div>
          )}
        </Modal.Body>
      </Modal>

      <Row xs={1} md={2} lg={3} className="g-3">
        {chargingPoints.map((point) => {
          const statusInfo = getStatusInfo(point);
          const isCharging = statusInfo.text === "Đang sạc";
          const sessionInfo = point.currentSessionInfo;

          return (
            <Col key={point.pointId}>
              <Card className="h-100 shadow-sm">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="mb-0">{point.name}</h6>
                    <Badge
                      bg={statusInfo.bg}
                      text={statusInfo.textColor || "light"}
                    >
                      {statusInfo.text}
                    </Badge>
                  </div>

                  <div className="text-muted small mb-2">
                    Công suất: {formatPower(point.chargingPower)}
                  </div>

                  {isCharging && point.currentSessionId && (
                    <div className="bg-success bg-opacity-10 p-2 rounded mb-3">
                      <div className="fw-bold">Đang phục vụ khách</div>

                      <div className="small text-dark mt-2">
                        <Row>
                          <Col xs={6}>
                            <strong>Pin:</strong> {sessionInfo?.soc ?? "..."}%
                          </Col>
                          <Col xs={6}>
                            <strong>Phí:</strong>{" "}
                            {formatCurrency(sessionInfo?.totalCost)}
                          </Col>
                        </Row>
                      </div>

                      <div className="small text-muted mt-2">
                        Session: {point.currentSessionId.substring(0, 8)}...
                      </div>
                    </div>
                  )}

                  {statusInfo.text === "Lỗi" && (
                    <div className="text-center text-danger py-3">
                      Trụ đang gặp lỗi
                    </div>
                  )}

                  {statusInfo.text === "Bảo trì" && (
                    <div className="text-center text-warning py-3">
                      Đang bảo trì
                    </div>
                  )}

                  <div className="d-flex gap-2">
                    {statusInfo.text !== "Đang sạc" && !isCharging && (
                      <Button
                        className="w-100"
                        disabled={loading}
                        style={{
                          backgroundColor: "#22c55e",
                          borderColor: "#22c55e",
                          color: "white",
                          fontWeight: "bold",
                        }}
                        onClick={() => {
                          setSelectedPoint(point);
                          setShowModal(true);
                        }}
                      >
                        Chỉnh sửa
                      </Button>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>
    </Container>
  );
}
