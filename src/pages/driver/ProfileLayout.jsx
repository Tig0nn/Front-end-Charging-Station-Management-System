import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { ProfileHeader, ProfileTabs } from "../../components/driver";
import { usersAPI } from "../../lib/apiServices";

const ProfileLayout = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDriverInfo();
  }, []);

  const fetchDriverInfo = async () => {
    try {
      setLoading(true);
      console.log(" Fetching driver info from API...");
      const response = await usersAPI.getProfile();

      const responseData =
        response.data?.result || response.result || response.data;

      // Backend returns data inside driverProfile object
      const driverData = responseData.driverProfile || responseData;

      console.log("👤 Driver data:", driverData);

      // Map to consistent format
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
        role: driverData.role || "DRIVER",
      };

      setUserData(userData);

      // Update localStorage so ProfileInfoPage can access via useAuth()
      localStorage.setItem("user", JSON.stringify(userData));

      // Trigger storage event to notify other components
      window.dispatchEvent(new Event("storage"));
    } catch (err) {
      console.error("❌ Error fetching driver info:", err);
      // Fallback: Lấy từ localStorage nếu API lỗi
      const cachedUser = JSON.parse(localStorage.getItem("user") || "{}");
      setUserData(cachedUser);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Profile Header - Hiển thị avatar, tên, email */}
      {!loading && <ProfileHeader user={userData} />}

      {/* Navigation Tabs */}
      <ProfileTabs />

      {/* Content area - Render child routes */}
      <Outlet />
    </div>
  );
};

export default ProfileLayout;
