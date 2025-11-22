import React, { useState, useEffect } from "react";
import { Dropdown, Spinner } from "react-bootstrap";
import { vehiclesAPI } from "../../lib/apiServices";
import toast from "react-hot-toast";
import "bootstrap-icons/font/bootstrap-icons.css";

const VehicleSelector = () => {
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVehiclesAndSetSelection = async () => {
      try {
        setLoading(true);
        const response = await vehiclesAPI.getMyVehicles();
        const vehicleData = response?.data?.result || response?.data || [];
        setVehicles(vehicleData);

        const savedVehicleId = localStorage.getItem("selectedVehicleId");

        if (savedVehicleId && vehicleData.length > 0) {
          const vehicle = vehicleData.find(
            (v) => v.vehicleId === savedVehicleId
          );
          if (vehicle) {
            setSelectedVehicle(vehicle);
          } else {
            localStorage.removeItem("selectedVehicleId");
            setSelectedVehicle(null);
          }
        } else {
          setSelectedVehicle(null);
        }
      } catch (err) {
        toast.error("Lỗi tải danh sách xe");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchVehiclesAndSetSelection();
  }, []);

  const handleSelectVehicle = (vehicle) => {
    setSelectedVehicle(vehicle);
    localStorage.setItem("selectedVehicleId", vehicle.vehicleId);
    toast.success(`Đã đổi sang: ${vehicle.licensePlate}`);
    window.dispatchEvent(new Event("storage"));
  };

  // --- STYLES ĐỒNG BỘ VỚI TABBAR ---
  const COMPONENT_WIDTH = "100%";

  const toggleStyle = {
    width: COMPONENT_WIDTH,
    minWidth: "300px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    // Style Pill giống Tabbar
    backgroundColor: "#f8fafc", // Màu nền giống tabbar
    borderRadius: "50px", // Bo tròn dạng pill giống tabbar
    // Logic viền: Nếu chưa chọn -> Viền cam nét đứt, Đã chọn -> Viền xám nhạt giống tabbar
    border: selectedVehicle ? "1px solid #e2e8f0" : "2px dashed #ffc107",
    padding: "8px 20px", // Tăng padding để có không gian cho mức pin
    minHeight: "65px", // Tăng chiều cao tối thiểu để hiển thị đầy đủ
    height: "auto", // Cho phép chiều cao tự động
    transition: "all 0.2s ease",
    boxShadow: "0 2px 4px rgba(0,0,0,0.04)", // Shadow nhẹ giống tabbar
  };

  const customStyles = `
    .vehicle-selector-toggle.dropdown-toggle::after {
        display: none !important;
    }
    .vehicle-selector-toggle:hover {
        background-color: #f1f5f9 !important; /* Màu hover nhẹ */
        border-color: #cbd5e1 !important;
    }
  `;

  if (loading) {
    return (
      <div
        className="d-flex align-items-center px-4 bg-light rounded-pill shadow-sm border"
        style={{ width: "100%", height: "58px" }}
      >
        <Spinner animation="border" size="sm" variant="primary" />
        <span className="ms-3 text-muted fw-medium small">Đang tải xe...</span>
      </div>
    );
  }

  return (
    <>
      <style>{customStyles}</style>
      <Dropdown align="end" className="w-100">
        <Dropdown.Toggle
          variant="light"
          id="dropdown-vehicle"
          className="vehicle-selector-toggle text-decoration-none d-flex align-items-center"
          style={toggleStyle}
        >
          <div className="d-flex align-items-center w-100 overflow-hidden">
            {/* Icon Trạng thái */}
            <div
              className={`d-flex align-items-center justify-content-center rounded-circle me-3 flex-shrink-0 ${
                selectedVehicle
                  ? "bg-white text-success shadow-sm"
                  : "bg-warning-subtle text-warning"
              }`}
              style={{
                width: "38px",
                height: "38px",
                border: selectedVehicle ? "1px solid #e2e8f0" : "none",
              }}
            >
              {selectedVehicle ? (
                <i className="bi bi-car-front-fill fs-6"></i>
              ) : (
                <i className="bi bi-exclamation-triangle-fill fs-6"></i>
              )}
            </div>

            {/* Text Info */}
            <div className="text-start flex-grow-1 overflow-hidden">
              {selectedVehicle ? (
                <div className="d-flex align-items-center justify-content-between w-100">
                  {/* Bên trái: Biển số + Model */}
                  <div className="d-flex flex-column">
                    <div
                      className="fw-bold text-dark lh-1 mb-1"
                      style={{ fontSize: "0.95rem" }}
                    >
                      {selectedVehicle.licensePlate}
                    </div>
                    <div
                      className="text-muted small text-truncate"
                      style={{ fontSize: "0.8rem" }}
                    >
                      {selectedVehicle.brandDisplayName}{" "}
                      {selectedVehicle.modelName}
                    </div>
                  </div>
                  
                  {/* Bên phải: Mức pin */}
                  {selectedVehicle.currentSocPercent !== undefined && (
                    <div className="d-flex align-items-center ms-3">
                      <i className="bi bi-battery-charging me-1" style={{ fontSize: "1.1rem", color: "#059669" }}></i>
                      <span 
                        className="fw-bold" 
                        style={{ 
                          fontSize: "1rem",
                          color: selectedVehicle.currentSocPercent < 20 
                            ? "#dc2626" 
                            : selectedVehicle.currentSocPercent < 50 
                            ? "#eab308" 
                            : "#059669"
                        }}
                      >
                        {selectedVehicle.currentSocPercent}%
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="d-flex flex-column justify-content-center">
                  <div
                    className="fw-bold text-dark"
                    style={{ fontSize: "0.9rem" }}
                  >
                    Chưa chọn xe
                  </div>
                  <div
                    className="text-danger small fst-italic"
                    style={{ fontSize: "0.75rem" }}
                  >
                    Vui lòng chọn xe
                  </div>
                </div>
              )}
            </div>

            {/* Mũi tên tùy chỉnh */}
            <div
              className="d-flex align-items-center justify-content-center rounded-circle bg-white ms-2 text-secondary shadow-sm"
              style={{
                width: "32px",
                height: "32px",
                border: "1px solid #e2e8f0",
              }}
            >
              <i
                className="bi bi-chevron-down"
                style={{ fontSize: "12px" }}
              ></i>
            </div>
          </div>
        </Dropdown.Toggle>

        <Dropdown.Menu className="shadow-lg border-0 mt-2 p-2 rounded-4 w-100">
          <div
            className="px-3 py-2 text-uppercase text-secondary fw-bold small"
            style={{ letterSpacing: "0.5px", fontSize: "0.7rem" }}
          >
            Xe của bạn ({vehicles.length})
          </div>

          <div style={{ maxHeight: "350px", overflowY: "auto" }}>
            {vehicles.length === 0 ? (
              <div className="text-center py-4 text-muted">
                <p className="mb-0 small">Không tìm thấy xe nào</p>
              </div>
            ) : (
              vehicles.map((vehicle) => {
                const isActive =
                  selectedVehicle?.vehicleId === vehicle.vehicleId;
                return (
                  <Dropdown.Item
                    key={vehicle.vehicleId}
                    onClick={() => handleSelectVehicle(vehicle)}
                    className={`rounded-pill mb-2 py-2 d-flex align-items-center position-relative ${
                      isActive ? "bg-success text-white" : ""
                    }`}
                    style={{ transition: "background 0.2s" }}
                  >
                    <i
                      className={`bi bi-car-front me-3 fs-5 ${
                        isActive ? "text-white" : "text-secondary"
                      }`}
                    ></i>

                    <div className="d-flex align-items-center justify-content-between flex-grow-1">
                      {/* Bên trái: Tên xe + Biển số */}
                      <div className="d-flex flex-column">
                        <span
                          className={`fw-bold ${
                            isActive ? "text-white" : "text-dark"
                          }`}
                          style={{ fontSize: "0.9rem" }}
                        >
                          {vehicle.brandDisplayName} {vehicle.modelName}
                        </span>
                        <span
                          className="small px-2 rounded-pill border mt-1"
                          style={{
                            width: "fit-content",
                            backgroundColor: isActive
                              ? "rgba(255,255,255,0.2)"
                              : "#f8f9fa",
                            borderColor: isActive ? "transparent" : "#dee2e6",
                            color: isActive ? "white" : "#6c757d",
                            fontSize: "0.75rem",
                          }}
                        >
                          {vehicle.licensePlate}
                        </span>
                      </div>
                      
                      {/* Bên phải: Mức pin */}
                      {vehicle.currentSocPercent !== undefined && (
                        <div className="d-flex align-items-center ms-3 me-4">
                          <span
                            className="d-flex align-items-center px-3 py-1 rounded-pill"
                            style={{
                              backgroundColor: isActive
                                ? "rgba(255,255,255,0.2)"
                                : vehicle.currentSocPercent < 20
                                ? "#fee2e2"
                                : vehicle.currentSocPercent < 50
                                ? "#fef3c7"
                                : "#d1fae5",
                              color: isActive
                                ? "white"
                                : vehicle.currentSocPercent < 20
                                ? "#dc2626"
                                : vehicle.currentSocPercent < 50
                                ? "#ca8a04"
                                : "#059669",
                              fontWeight: "700",
                              fontSize: "0.85rem",
                            }}
                          >
                            <i className="bi bi-battery-charging me-1" style={{ fontSize: "0.9rem" }}></i>
                            {vehicle.currentSocPercent}%
                          </span>
                        </div>
                      )}
                    </div>

                    {isActive && (
                      <div className="position-absolute end-0 me-3">
                        <i className="bi bi-check-circle-fill text-white fs-5"></i>
                      </div>
                    )}
                  </Dropdown.Item>
                );
              })
            )}
          </div>
        </Dropdown.Menu>
      </Dropdown>
    </>
  );
};

export default VehicleSelector;
