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
      console.log("📞 Fetching driver info from API...");
      const response = await usersAPI.getDriverInfo();
      
      const driverData = response.data?.result || response.result || response.data;
      console.log("👤 Driver data:", driverData);
      setUserData(driverData);
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
