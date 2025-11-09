import React, { useState, useEffect, useCallback } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import apiServices from "../lib/apiServices";

const BookingModal = ({ show, handleClose, selectedDate }) => {
  const {
    bookings: bookingsAPI,
    vehicles: vehiclesAPI,
    chargingPoints: chargingPointsAPI,
  } = apiServices;

  // States
  const [vehicles, setVehicles] = useState([]);
  const [stations, setStations] = useState([]);
  const [chargers, setChargers] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [selectedStation, setSelectedStation] = useState("");
  const [selectedCharger, setSelectedCharger] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [desiredPercentage, setDesiredPercentage] = useState(80);
  const [loading, setLoading] = useState(false);
  const [availabilityMessage, setAvailabilityMessage] = useState("");

  // Format date in Vietnamese
  const formattedDate = selectedDate?.toLocaleDateString("vi-VN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Generate time slots (6:00 - 22:00, every 30 minutes)
  const generateTimeSlots = () => {
    const slots = [];
    const now = new Date();
    const isToday = selectedDate?.toDateString() === now.toDateString();

    for (let hour = 6; hour < 22; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`;

        if (isToday) {
          const slotTime = new Date(selectedDate);
          slotTime.setHours(hour, minute, 0, 0);
          if (slotTime > now) {
            slots.push(timeString);
          }
        } else {
          slots.push(timeString);
        }
      }
    }
    return slots;
  };

  // Check availability
  const checkAvailability = useCallback(async () => {
    if (!selectedVehicle || !selectedCharger || !selectedTime || !selectedDate)
      return;

    try {
      const [hours, minutes] = selectedTime.split(":");
      const bookingDateTime = new Date(selectedDate);
      bookingDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      // Fix: Use string ID directly (backend now accepts string)
      console.log(
        "🔑 Checking availability with chargingPointId:",
        selectedCharger
      );

      const response = await bookingsAPI.checkAvailability(
        selectedCharger, // Pass string ID directly
        bookingDateTime.toISOString(),
        selectedVehicle
      );

      if (response?.data?.available || response?.available) {
        const message = response?.data?.message || response?.message || "";
        setAvailabilityMessage(`✅ Trạm khả dụng! ${message}`);
      } else {
        setAvailabilityMessage("❌ Trạm đã được đặt trong thời gian này");
      }
    } catch (err) {
      setAvailabilityMessage("❌ Không thể kiểm tra tình trạng");
      console.error("Error checking availability:", err);
    }
  }, [
    selectedVehicle,
    selectedCharger,
    selectedTime,
    selectedDate,
    bookingsAPI,
  ]);

  // Load vehicles
  const loadVehicles = async () => {
    try {
      setLoading(true);
      const response = await vehiclesAPI.getMyVehicles();
      setVehicles(response?.data?.result || response?.result || []);
    } catch (err) {
      console.error("Error loading vehicles:", err);
    } finally {
      setLoading(false);
    }
  };

  // Load stations
  const loadStations = async () => {
    try {
      setLoading(true);
      const response = await apiServices.stations.getStation();
      setStations(response?.data?.result || response?.result || []);
    } catch (err) {
      console.error("Error loading stations:", err);
    } finally {
      setLoading(false);
    }
  };

  // Load chargers when station is selected
  const loadChargers = async (stationId) => {
    try {
      setLoading(true);
      const response = await chargingPointsAPI.getChargersByStation(stationId);
      const chargersList = response?.data?.result || response?.result || [];
      console.log("📍 Chargers response:", chargersList); // Debug: xem cấu trúc data
      setChargers(chargersList);
    } catch (err) {
      console.error("Error loading chargers:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle station change
  const handleStationChange = (e) => {
    const stationId = e.target.value;
    setSelectedStation(stationId);
    setSelectedCharger("");
    setChargers([]);
    if (stationId) {
      loadChargers(stationId);
    }
  };

  // Handle booking submission
  const handleBooking = async () => {
    if (
      !selectedVehicle ||
      !selectedCharger ||
      !selectedTime ||
      !desiredPercentage
    ) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    try {
      setLoading(true);
      const [hours, minutes] = selectedTime.split(":");
      const bookingDateTime = new Date(selectedDate);
      bookingDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      const bookingData = {
        vehicleId: selectedVehicle,
        chargingPointId: selectedCharger,
        bookingTime: bookingDateTime.toISOString(),
        desiredPercentage: parseInt(desiredPercentage),
      };

      await bookingsAPI.createBooking(bookingData);
      alert("Đặt chỗ thành công!");
      handleClose();
      resetForm();
    } catch (err) {
      console.error("Error creating booking:", err);
      alert(
        "Đặt chỗ thất bại! " + (err.response?.data?.message || err.message)
      );
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setSelectedVehicle("");
    setSelectedStation("");
    setSelectedCharger("");
    setSelectedTime("");
    setDesiredPercentage(80);
    setAvailabilityMessage("");
  };

  // Load data on mount
  useEffect(() => {
    if (show) {
      loadVehicles();
      loadStations();
    } else {
      resetForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  // Check availability when all required fields are filled
  useEffect(() => {
    if (selectedVehicle && selectedCharger && selectedTime) {
      checkAvailability();
    } else {
      setAvailabilityMessage("");
    }
  }, [selectedVehicle, selectedCharger, selectedTime, checkAvailability]);

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <i className="bi bi-star-fill" style={{ color: "#fbbf24" }}></i>
            Đặt chỗ sạc
          </div>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {/* Date Display */}
        <div
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            padding: "16px",
            borderRadius: "8px",
            marginBottom: "20px",
            textAlign: "center",
          }}
        >
          <h5 style={{ margin: 0 }}>{formattedDate}</h5>
        </div>

        {/* Vehicle Selection */}
        <Form.Group className="mb-3">
          <Form.Label>1. Chọn xe</Form.Label>
          <Form.Select
            value={selectedVehicle}
            onChange={(e) => setSelectedVehicle(e.target.value)}
            disabled={loading}
          >
            <option value="">-- Chọn xe --</option>
            {vehicles.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.licensePlate} - {vehicle.model}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        {/* Station Selection */}
        <Form.Group className="mb-3">
          <Form.Label>2. Chọn trạm sạc</Form.Label>
          <Form.Select
            value={selectedStation}
            onChange={handleStationChange}
            disabled={loading || !selectedVehicle}
          >
            <option value="">-- Chọn trạm --</option>
            {stations.map((station) => (
              <option key={station.stationId} value={station.stationId}>
                {station.name} - {station.address}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        {/* Charger Selection */}
        <Form.Group className="mb-3">
          <Form.Label>3. Chọn cột sạc</Form.Label>
          <Form.Select
            value={selectedCharger}
            onChange={(e) => setSelectedCharger(e.target.value)}
            disabled={loading || !selectedStation || chargers.length === 0}
          >
            <option value="">-- Chọn cột sạc --</option>
            {chargers.map((charger) => (
              <option key={charger.pointId} value={charger.pointId}>
                {charger.name} - {charger.chargingPower}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        {/* Time Selection */}
        <Form.Group className="mb-3">
          <Form.Label>4. Chọn giờ</Form.Label>
          <Form.Select
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            disabled={loading || !selectedCharger}
          >
            <option value="">-- Chọn giờ --</option>
            {generateTimeSlots().map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        {/* Availability Message */}
        {availabilityMessage && (
          <div
            style={{
              padding: "10px",
              borderRadius: "5px",
              marginBottom: "15px",
              backgroundColor: availabilityMessage.includes("✅")
                ? "#d4edda"
                : "#f8d7da",
              color: availabilityMessage.includes("✅") ? "#155724" : "#721c24",
              border: `1px solid ${
                availabilityMessage.includes("✅") ? "#c3e6cb" : "#f5c6cb"
              }`,
            }}
          >
            {availabilityMessage}
          </div>
        )}

        {/* Battery Percentage */}
        <Form.Group className="mb-3">
          <Form.Label>5. Mức pin mong muốn: {desiredPercentage}%</Form.Label>
          <Form.Range
            min="20"
            max="100"
            step="5"
            value={desiredPercentage}
            onChange={(e) => setDesiredPercentage(e.target.value)}
            disabled={loading || !availabilityMessage.includes("✅")}
          />
        </Form.Group>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Hủy
        </Button>
        <Button
          variant="primary"
          onClick={handleBooking}
          disabled={loading || !availabilityMessage.includes("✅")}
        >
          {loading ? "Đang xử lý..." : "Xác nhận đặt chỗ"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default BookingModal;
