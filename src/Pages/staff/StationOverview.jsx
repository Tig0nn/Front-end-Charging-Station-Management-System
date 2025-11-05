import React, { useRef, useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Spinner,
  Alert,
  Modal,
  Form,
} from "react-bootstrap";
// Giả sử bạn có file này
import { vehiclesAPI, chargingPointsAPI } from "../../lib/apiServices.js";

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
  // --- 💡 THÊM TIMERREF ---
  const timerRef = useRef(null);
  const [chargingPoints, setChargingPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));
  const stationId = user?.stationId;

  const [showStartModal, setShowStartModal] = useState(false);
  const [pointToStart, setPointToStart] = useState(null);
  const [licensePlate, setLicensePlate] = useState("");
  const [desiredSOC, setDesiredSOC] = useState(100);

  const lookupVehicleId = async (plate) => {
    if (!plate || !plate.trim()) return null;
    const formattedPlate = plate.trim().toUpperCase();
    try {
      console.log(`Đang tra cứu biển số: ${formattedPlate}`);
      const response = await vehiclesAPI.lookUp(formattedPlate);
      console.log("LookupVehicleId response:", response);

      if (response.data?.result?.vehicleId) {
        const vehicleId = response.data.result.vehicleId;
        console.log(`Tìm thấy vehicleId: ${vehicleId}`);
        return vehicleId;
      }
      console.warn("Không tìm thấy vehicleId từ API lookup");
      return null;
    } catch (err) {
      console.error("Lỗi khi tra cứu thông tin xe:", err);
      return null;
    }
  };

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
      // --- 💡 CẬP NHẬT ---
      await fetchChargingPoints(false); // Tải lại ngay không spinner
      setShowModal(false);
    } catch (err) {
      console.error("Lỗi khi cập nhật trạng thái trụ sạc:", err);
      alert("Không thể cập nhật trạng thái trụ sạc.");
      setShowModal(false);
    }
  };

  // --- 💡 HÀM FETCH ĐÃ ĐƯỢC CẬP NHẬT HOÀN TOÀN ---
  const fetchChargingPoints = async (showLoading = true) => {
    if (!stationId) {
      setError("Không xác định được ID của trạm sạc.");
      setLoading(false);
      return;
    }
    try {
      if (showLoading) setLoading(true);
      setError(null);

      // BƯỚC 1: Lấy danh sách trụ sạc
      const response = await chargingPointsAPI.getChargersByStation(stationId);
      const points = response.data?.result || [];

      // BƯỚC 2: Lọc ra các trụ đang sạc
      const activePoints = points.filter((p) => p.currentSessionId);

      // BƯỚC 3: Tạo mảng 'promises' để gọi API chi tiết
      const detailPromises = activePoints.map((point) =>
        // Giả sử API này trả về { data: { result: { sessionId: "...", soc: 80, totalCost: 15000 } } }
        chargingPointsAPI
          .simulateCharging(point.currentSessionId)
          .then((res) => res.data.result) // Chỉ lấy phần data
          .catch((err) => {
            console.error(
              `Lỗi lấy chi tiết session ${point.currentSessionId}:`,
              err
            );
            return null; // Trả về null nếu API lỗi
          })
      );

      // BƯỚC 4: Chờ tất cả API chi tiết trả về
      const sessionDetails = await Promise.all(detailPromises);

      // Tạo một map để tra cứu chi tiết session nhanh
      const detailsMap = {};
      sessionDetails.forEach((session) => {
        if (session && session.sessionId) {
          detailsMap[session.sessionId] = session;
        }
      });

      // BƯỚC 5: Gộp dữ liệu chi tiết vào danh sách trụ sạc
      const mergedPoints = points.map((point) => ({
        ...point,
        // Gán thông tin chi tiết (nếu có) vào một key mới
        currentSessionInfo: detailsMap[point.currentSessionId] || null,
      }));

      // BƯỚC 6: Cập nhật state với dữ liệu đã gộp
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

  // --- 💡 USEEFFECT ĐÃ ĐƯỢC CẬP NHẬT ĐỂ POLLING ---
  useEffect(() => {
    fetchChargingPoints(true); // Tải lần đầu

    // Thiết lập polling
    timerRef.current = setInterval(() => {
      console.log("(Polling) Đang tải lại danh sách trụ sạc và chi tiết...");
      fetchChargingPoints(false); // Tải lại (chạy ngầm)
    }, 10000); // Tải lại mỗi 10 giây

    // Hàm dọn dẹp
    return () => {
      if (timerRef.current) {
        console.log("Dọn dẹp: Dừng polling StationOverview.");
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Chỉ chạy 1 lần khi mount

  const handleShowStartModal = (point) => {
    setPointToStart(point);
    setLicensePlate("");
    setDesiredSOC(100);
    setShowStartModal(true);
  };

  const handleCloseStartModal = () => {
    setShowStartModal(false);
    setPointToStart(null);
  };

  // Bắt đầu phiên sạc mới
  const handleStartCharging = async () => {
    if (!pointToStart) {
      console.error("Lỗi: Không có trụ sạc nào được chọn.");
      return;
    }
    if (!licensePlate.trim()) {
      alert("Vui lòng nhập biển số xe.");
      return;
    }

    const soc = parseInt(desiredSOC, 10);
    if (isNaN(soc) || soc <= 0 || soc > 100) {
      alert("Mức pin mong muốn phải là một số từ 1 đến 100.");
      return;
    }

    try {
      setLoading(true);

      const vehicleId = await lookupVehicleId(licensePlate);
      if (!vehicleId) {
        throw new Error(
          "Không tìm thấy thông tin xe. Vui lòng kiểm tra lại biển số."
        );
      }

      const payload = {
        chargingPointId: pointToStart.pointId,
        vehicleId: vehicleId,
        targetSocPercent: soc,
      };

      const response = await chargingPointsAPI.startCharging(payload);
      const sessionId = response.data?.result?.sessionId;

      if (sessionId) {
        console.log(
          `Phiên sạc bắt đầu thành công với Session ID: ${sessionId}`
        );
        alert(
          `Bắt đầu sạc thành công cho xe ${licensePlate.trim().toUpperCase()}!`
        );

        handleCloseStartModal();
        // --- 💡 CẬP NHẬT ---
        await fetchChargingPoints(false); // Tải lại ngay
      } else {
        throw new Error("Không nhận được ID phiên sạc từ máy chủ.");
      }
    } catch (err) {
      console.error("❌ LỖI khi bắt đầu phiên sạc:", err);
      alert(err.message || "Đã xảy ra lỗi không mong muốn.");
    } finally {
      setLoading(false); // Luôn tắt loading
    }
  };


  if (loading && chargingPoints.length === 0) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="primary" />
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
                onClick={() => handleUpdateStatus("OFFLINE")}
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

      {/* Modal Khởi động sạc */}
      <Modal show={showStartModal} onHide={handleCloseStartModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Khởi động sạc: {pointToStart?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="formLicensePlate">
              <Form.Label>Biển số xe</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ví dụ: 51F-123.45"
                value={licensePlate}
                onChange={(e) => setLicensePlate(e.target.value)}
                autoFocus
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formDesiredSOC">
              <Form.Label>Mức pin mong muốn (%)</Form.Label>
              <Form.Control
                type="number"
                min="1"
                max="100"
                value={desiredSOC}
                onChange={(e) => setDesiredSOC(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseStartModal}>
            Hủy
          </Button>
          <Button
            variant="primary"
            onClick={handleStartCharging}
            disabled={loading}
          >
            {loading ? "Đang xử lý..." : "Bắt đầu"}
          </Button>
        </Modal.Footer>
      </Modal>
      <Button
        variant="outline-primary"
        onClick={() => fetchChargingPoints(true)} // Bấm nút này sẽ hiện spinner
        disabled={loading}
        className="mb-3"
      >
        {loading ? "Đang tải..." : "Tải lại dữ liệu"}
      </Button>
      <Row xs={1} md={2} lg={3} className="g-3">
        {chargingPoints.map((point) => {
          const statusInfo = getStatusInfo(point);
          const isCharging = statusInfo.text === "Đang sạc";
          const isUnavailable = !["Sẵn sàng", "Đang sạc"].includes(
            statusInfo.text
          );

          // --- 💡 LẤY DỮ LIỆU TỪ `currentSessionInfo` MÀ TA ĐÃ GỘP ---
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

                  {/* --- 💡 KHỐI JSX ĐÃ ĐƯỢC CẬP NHẬT --- */}
                  {isCharging && point.currentSessionId && (
                    <div className="bg-success bg-opacity-10 p-2 rounded mb-3">
                      <div className="fw-bold">Đang phục vụ khách</div>

                      {/* Hiển thị Pin và Tiền nếu có */}
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
                  {/* ------------------------------------ */}

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

                  <div className=" d-flex gap-2">
                    <Button
                      variant={isCharging ? "danger" : "dark"}
                      disabled={isUnavailable || loading}
                      className="bg-red w-50"
                      onClick={() => {
                        if (isCharging) {
                          // TODO: Xử lý dừng sạc
                          alert(
                            `Chức năng 'Dừng sạc' cho ${point.name} chưa được cài đặt.`
                          );
                        } else {
                          handleShowStartModal(point);
                        }
                      }}
                    >
                      {isCharging ? "Dừng sạc" : "Khởi động"}
                    </Button>

                    {statusInfo.text !== "Đang sạc" && !isCharging && (
                      <Button
                        variant="warning"
                        className="w-50"
                        disabled={loading}
                        onClick={() => {
                          setSelectedPoint(point);
                          setShowModal(true);
                        }}
                      >
                        Cài đặt
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
