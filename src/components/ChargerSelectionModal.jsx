import React, { useState, useEffect } from "react";
import "./ChargerSelectionModal.css";

export default function ChargerSelectionModal({
  station,
  onClose,
  onStartCharging,
}) {
  const [chargers, setChargers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCharger, setSelectedCharger] = useState(null);
  const [error, setError] = useState(null);

  const fetchChargers = async () => {
    try {
      setLoading(true);

      // Import mock API
      const { mockChargersApi } = await import("../lib/mockApi");
      const response = await mockChargersApi.getChargersByStation(
        station.stationId
      );

      if (response.success && response.data.result) {
        setChargers(response.data.result);
      }
      setError(null);
    } catch (err) {
      console.error("Error fetching chargers:", err);
      setError("Không thể tải danh sách trụ sạc");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChargers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [station]);

  const handleSelectCharger = (charger) => {
    if (charger.status === "Available") {
      setSelectedCharger(charger);
    }
  };

  const handleStartCharging = async () => {
    if (!selectedCharger) return;

    try {
      const { mockChargersApi } = await import("../lib/mockApi");
      await mockChargersApi.startCharging(selectedCharger.chargerId, null);

      onStartCharging(selectedCharger);
      onClose();
    } catch (err) {
      console.error("Error starting charging:", err);
      setError("Không thể bắt đầu sạc. Vui lòng thử lại.");
    }
  };

  const getChargerIcon = (status) => {
    switch (status) {
      case "Available":
        return "🔌";
      case "InUse":
        return "⚡";
      default:
        return "🔌";
    }
  };

  const getChargerStatusText = (status) => {
    switch (status) {
      case "Available":
        return "Sẵn sàng";
      case "InUse":
        return "Đang dùng";
      default:
        return "Không khả dụng";
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Chọn trụ sạc</h2>
            <p className="modal-subtitle">
              {station.stationName} - {station.address}
            </p>
          </div>
          <button className="close-button" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          {loading ? (
            <div className="loading-state">
              <div className="spinner-small"></div>
              <p>Đang tải danh sách trụ sạc...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <p>{error}</p>
              <button onClick={fetchChargers} className="retry-btn">
                Thử lại
              </button>
            </div>
          ) : (
            <div className="chargers-grid">
              {chargers.map((charger) => (
                <div
                  key={charger.chargerId}
                  className={`charger-card ${
                    charger.status === "Available" ? "available" : "in-use"
                  } ${
                    selectedCharger?.chargerId === charger.chargerId
                      ? "selected"
                      : ""
                  }`}
                  onClick={() => handleSelectCharger(charger)}
                >
                  <div className="charger-icon">
                    {getChargerIcon(charger.status)}
                  </div>
                  <h3 className="charger-name">{charger.chargerName}</h3>
                  <p className="charger-power">{charger.powerOutput}</p>
                  <p className="charger-connector">{charger.connectorType}</p>
                  <div
                    className={`charger-status ${
                      charger.status === "Available"
                        ? "status-available"
                        : "status-in-use"
                    }`}
                  >
                    {getChargerStatusText(charger.status)}
                  </div>
                  {charger.currentUser && (
                    <p className="current-user">{charger.currentUser}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="cancel-button" onClick={onClose}>
            Hủy
          </button>
          <button
            className="start-button"
            onClick={handleStartCharging}
            disabled={!selectedCharger}
          >
            ⚡ Bắt đầu
          </button>
        </div>
      </div>
    </div>
  );
}
