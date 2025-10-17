import { useState, useEffect } from "react";
import { usersAPI } from "../lib/apiServices";

export const useDriverProfile = () => {
  const [driverProfile, setDriverProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch driver profile
  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("🚀 Starting fetchProfile...");
      const response = await usersAPI.getDriverInfo();

      console.log("✅ Driver profile response:", response); // Debug log
      console.log("Response structure:", {
        hasData: !!response.data,
        hasResult: !!response.result,
        hasCode: !!response.code,
        fullResponse: response,
      });

      // Xử lý response từ axios (response.data chứa actual data)
      const responseData = response.data;

      if (responseData) {
        // Trường hợp 1: response có code và result
        if (responseData.code === 1000 && responseData.result) {
          console.log("✅ Using responseData.result:", responseData.result);
          setDriverProfile(responseData.result);
          return;
        }

        // Trường hợp 2: response chính là data
        if (responseData.userId || responseData.email) {
          console.log("✅ Using responseData directly:", responseData);
          setDriverProfile(responseData);
          return;
        }
      }

      console.error("❌ No valid data structure found");
      throw new Error("Không có dữ liệu từ server");
    } catch (err) {
      console.error("💥 Error fetching driver profile:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Lỗi không thể tải thông tin tài xế";
      console.error("Error details:", {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        message: err.message,
      });
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Update driver profile
  const updateProfile = async (updatedData) => {
    try {
      setError(null);

      console.log("🔄 Starting updateProfile with data:", updatedData);
      const response = await usersAPI.updateDriverInfo(updatedData);

      console.log("✅ Update response:", response);
      console.log("Update response structure:", {
        hasData: !!response.data,
        hasResult: !!response.data?.result,
        hasCode: !!response.data?.code,
        fullResponse: response,
      });

      // Xử lý response từ axios (response.data chứa actual data)
      const responseData = response.data;

      if (responseData && responseData.code === 1000) {
        // Update local state with new data from response
        if (responseData.result) {
          console.log("✅ Updating local state with:", responseData.result);
          setDriverProfile(responseData.result);
        } else {
          // Fallback: merge with existing data
          setDriverProfile((prev) => ({
            ...prev,
            ...updatedData,
            fullName: `${updatedData.firstName || prev?.firstName || ""} ${
              updatedData.lastName || prev?.lastName || ""
            }`.trim(),
          }));
        }
        return { success: true };
      } else {
        throw new Error(responseData?.message || "Cập nhật thất bại");
      }
    } catch (err) {
      console.error("💥 Error updating driver profile:", err);
      const errorMessage =
        err.response?.data?.message || err.message || "Lỗi cập nhật thông tin";
      console.error("Update error details:", {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        message: err.message,
      });
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Get user by ID (for admin or viewing other users)
  const getUserById = async (userId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await usersAPI.getUserById(userId);

      if (response && response.result) {
        return response.result;
      } else {
        throw new Error("Không tìm thấy người dùng");
      }
    } catch (err) {
      console.error("Error fetching user by ID:", err);
      setError(err.message || "Lỗi không xác định");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Refresh profile data
  const refreshProfile = () => {
    fetchProfile();
  };

  // Load profile on hook initialization
  useEffect(() => {
    fetchProfile();
  }, []);

  return {
    driverProfile,
    loading,
    error,
    updateProfile,
    getUserById,
    refreshProfile,
    setError, // For manual error clearing
  };
};

export default useDriverProfile;
