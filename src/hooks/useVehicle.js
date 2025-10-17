import { useState, useEffect } from "react";
import { vehiclesAPI } from "../lib/apiServices.js";

const useVehicle = () => {
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Fetch all vehicles for the current driver
  const fetchVehicles = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccessMessage("");

      console.log("🔍 Fetching vehicles list...");
      const response = await vehiclesAPI.getMyVehicles();

      console.log("📋 Vehicles API response:", response);

      // Handle different response formats
      let vehicleData = [];
      if (response?.data?.result) {
        vehicleData = response.data.result;
      } else if (response?.data) {
        vehicleData = Array.isArray(response.data)
          ? response.data
          : [response.data];
      } else if (response?.result) {
        vehicleData = response.result;
      } else if (Array.isArray(response)) {
        vehicleData = response;
      }

      console.log("✅ Processed vehicles data:", vehicleData);
      setVehicles(vehicleData);

      return { success: true, data: vehicleData };
    } catch (err) {
      console.error("❌ Error fetching vehicles:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Không thể tải danh sách xe";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Fetch a specific vehicle by ID
  const fetchVehicleById = async (vehicleId) => {
    try {
      setLoading(true);
      setError("");

      console.log(`🔍 Fetching vehicle details for ID: ${vehicleId}`);
      const response = await vehiclesAPI.getVehicleById(vehicleId);

      console.log("🚗 Vehicle details response:", response);

      // Handle different response formats
      let vehicleData = null;
      if (response?.data?.result) {
        vehicleData = response.data.result;
      } else if (response?.data) {
        vehicleData = response.data;
      } else if (response?.result) {
        vehicleData = response.result;
      }

      console.log("✅ Processed vehicle data:", vehicleData);
      setSelectedVehicle(vehicleData);

      return { success: true, data: vehicleData };
    } catch (err) {
      console.error("❌ Error fetching vehicle details:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Không thể tải thông tin xe";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Create a new vehicle
  const createVehicle = async (vehicleData) => {
    try {
      setLoading(true);
      setError("");
      setSuccessMessage("");

      console.log("➕ Creating new vehicle:", vehicleData);

      // Validate required fields
      const requiredFields = [
        "licensePlate",
        "model",
        "batteryCapacityKwh",
        "batteryType",
      ];
      for (const field of requiredFields) {
        if (!vehicleData[field]) {
          throw new Error(`Trường ${field} là bắt buộc`);
        }
      }

      // Ensure batteryCapacityKwh is a number
      const processedData = {
        ...vehicleData,
        batteryCapacityKwh: parseFloat(vehicleData.batteryCapacityKwh),
      };

      const response = await vehiclesAPI.createVehicle(processedData);

      console.log("✅ Vehicle created successfully:", response);

      // Handle different response formats
      let newVehicle = null;
      if (response?.data?.result) {
        newVehicle = response.data.result;
      } else if (response?.data) {
        newVehicle = response.data;
      } else if (response?.result) {
        newVehicle = response.result;
      }

      // Add new vehicle to the list
      if (newVehicle) {
        setVehicles((prev) => [...prev, newVehicle]);
      }

      setSuccessMessage("Xe đã được thêm thành công!");

      return { success: true, data: newVehicle };
    } catch (err) {
      console.error("❌ Error creating vehicle:", err);
      let errorMessage = "Không thể tạo xe mới";

      // Handle specific error codes
      if (err.response?.data?.code === 5002) {
        errorMessage = "Biển số xe đã tồn tại trong hệ thống";
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Update an existing vehicle
  const updateVehicle = async (vehicleId, vehicleData) => {
    try {
      setLoading(true);
      setError("");
      setSuccessMessage("");

      console.log(`🔄 Updating vehicle ${vehicleId}:`, vehicleData);

      // Process data - ensure batteryCapacityKwh is a number if provided
      const processedData = { ...vehicleData };
      if (processedData.batteryCapacityKwh) {
        processedData.batteryCapacityKwh = parseFloat(
          processedData.batteryCapacityKwh
        );
      }

      const response = await vehiclesAPI.updateVehicle(
        vehicleId,
        processedData
      );

      console.log("✅ Vehicle updated successfully:", response);

      // Handle different response formats
      let updatedVehicle = null;
      if (response?.data?.result) {
        updatedVehicle = response.data.result;
      } else if (response?.data) {
        updatedVehicle = response.data;
      } else if (response?.result) {
        updatedVehicle = response.result;
      }

      // Update vehicle in the list
      if (updatedVehicle) {
        setVehicles((prev) =>
          prev.map((vehicle) =>
            vehicle.vehicleId === vehicleId ? updatedVehicle : vehicle
          )
        );
        setSelectedVehicle(updatedVehicle);
      }

      setSuccessMessage("Thông tin xe đã được cập nhật thành công!");

      return { success: true, data: updatedVehicle };
    } catch (err) {
      console.error("❌ Error updating vehicle:", err);
      let errorMessage = "Không thể cập nhật thông tin xe";

      // Handle specific error codes
      if (err.response?.data?.code === 5001) {
        errorMessage = "Không tìm thấy xe";
      } else if (err.response?.data?.code === 5002) {
        errorMessage = "Biển số xe đã tồn tại trong hệ thống";
      } else if (err.response?.data?.code === 5003) {
        errorMessage = "Xe không thuộc về bạn";
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Delete a vehicle
  const deleteVehicle = async (vehicleId) => {
    try {
      setLoading(true);
      setError("");
      setSuccessMessage("");

      console.log(`🗑️ Deleting vehicle ${vehicleId}`);

      const response = await vehiclesAPI.deleteVehicle(vehicleId);

      console.log("✅ Vehicle deleted successfully:", response);

      // Remove vehicle from the list
      setVehicles((prev) =>
        prev.filter((vehicle) => vehicle.vehicleId !== vehicleId)
      );

      // Clear selected vehicle if it was the deleted one
      if (selectedVehicle?.vehicleId === vehicleId) {
        setSelectedVehicle(null);
      }

      setSuccessMessage("Xe đã được xóa thành công!");

      return { success: true };
    } catch (err) {
      console.error("❌ Error deleting vehicle:", err);
      let errorMessage = "Không thể xóa xe";

      // Handle specific error codes
      if (err.response?.data?.code === 5001) {
        errorMessage = "Không tìm thấy xe";
      } else if (err.response?.data?.code === 5003) {
        errorMessage = "Xe không thuộc về bạn";
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Clear messages
  const clearMessages = () => {
    setError("");
    setSuccessMessage("");
  };

  // Clear selected vehicle
  const clearSelectedVehicle = () => {
    setSelectedVehicle(null);
  };

  // Initial load effect
  useEffect(() => {
    fetchVehicles();
  }, []);

  return {
    // State
    vehicles,
    selectedVehicle,
    loading,
    error,
    successMessage,

    // Actions
    fetchVehicles,
    fetchVehicleById,
    createVehicle,
    updateVehicle,
    deleteVehicle,
    clearMessages,
    clearSelectedVehicle,
    setSelectedVehicle,
  };
};

export default useVehicle;
