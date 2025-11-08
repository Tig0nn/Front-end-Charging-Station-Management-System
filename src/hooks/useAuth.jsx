import { useState, useEffect, useContext, createContext } from "react";
import { authAPI, usersAPI, staffAPI } from "../lib/apiServices.js";
import { setAuthToken, getAuthToken } from "../lib/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Hàm decode JWT token
  const decodeToken = (token) => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  };

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      // Try to get user from localStorage first
      try {
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        if (storedUser && storedUser.email) {
          // Prefill UI, nhưng KHÔNG return, KHÔNG setLoading(false)
          setUser(storedUser);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.log("Error reading stored user:", error);
      }

      // Decode token để lấy role
      const decodedToken = decodeToken(token);
      console.log("Decoded token on mount:", decodedToken);

      if (!decodedToken) {
        setAuthToken(null);
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem("user");
        setLoading(false);
        return;
      }

      const userInfo = decodedToken.userInfo || decodedToken;
      const role = String(
        userInfo.role || decodedToken.role || decodedToken.scope || ""
      ).toUpperCase();

      if (role === "DRIVER") {
        usersAPI
          .getDriverInfo()
          .then((response) => {
            const userData = response.data.result || response.data;
            setUser(userData);
            setIsAuthenticated(true);
            localStorage.setItem("user", JSON.stringify(userData));
          })
          .catch(() => {
            setAuthToken(null);
            setUser(null);
            setIsAuthenticated(false);
            localStorage.removeItem("user");
          })
          .finally(() => setLoading(false));
      } else if (role === "STAFF") {
        staffAPI
          .getStaffProfile()
          .then((response) => {
            const userData = response.data.result || response.data;
            setUser(userData);
            setIsAuthenticated(true);
            localStorage.setItem("user", JSON.stringify(userData));
          })
          .catch(() => {
            setAuthToken(null);
            setUser(null);
            setIsAuthenticated(false);
            localStorage.removeItem("user");
          })
          .finally(() => setLoading(false));
      } else {
        const userData = {
          userId:
            userInfo.userId ||
            decodedToken.sub ||
            decodedToken.userId ||
            decodedToken.id,
          email: userInfo.email || decodedToken.email || decodedToken.sub,
          role: role,
          firstName: userInfo.firstName || decodedToken.firstName || null,
          lastName: userInfo.lastName || decodedToken.lastName || null,
          fullName:
            userInfo.fullName ||
            decodedToken.fullName ||
            decodedToken.name ||
            null,
        };
        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem("user", JSON.stringify(userData));
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (credentials) => {
    try {
      setLoading(true);

      // Clear old data before login
      localStorage.removeItem("user");
      localStorage.removeItem("role");
      localStorage.removeItem("currentUserId");

      // 1) Gọi API login để lấy token
      // 1) Gọi API login để lấy token
      const response = await authAPI.login(credentials);
      console.log("Login response:", response);

      const token = response.data?.result?.token || response.data?.token;

      if (!token) {
        throw new Error("No token received from server");
      }

      // 2) Decode token để lấy role
      // 2) Decode token để lấy role
      const decodedToken = decodeToken(token);
      console.log("Decoded token:", decodedToken);

      if (!decodedToken) {
        throw new Error("Failed to decode token");
      }

      // 3) Set token vào header
      setAuthToken(token);

      // 4) Lấy role từ token
      const userInfo = decodedToken.userInfo || decodedToken;
      const role = String(
        userInfo.role || decodedToken.role || decodedToken.scope || ""
      ).toUpperCase();

      let userData;
      let needsProfile = false;

      // 5) Nếu là DRIVER, gọi getDriverInfo để lấy thông tin đầy đủ
      if (role === "DRIVER") {
        try {
          const userInfoResponse = await usersAPI.getDriverInfo();
          console.log("Driver info response:", userInfoResponse.data);

          const responseData =
            userInfoResponse.data?.result || userInfoResponse.data;

          // Backend returns data inside driverProfile object
          const driverData = responseData.driverProfile || responseData;

          // Map data với correct field names (backend uses lowercase)
          userData = {
            userId: driverData.userId || null,
            email: driverData.email || null,
            phone: driverData.phone || null,
            dateOfBirth: driverData.dateOfBirth || null,
            gender: driverData.gender || null,
            firstName: driverData.firstname || driverData.firstName || null,
            lastName: driverData.lastname || driverData.lastName || null,
            fullName: driverData.fullname || driverData.fullName || null,
            address: driverData.address || null,
            joinDate: driverData.joinDate || null,
            role: driverData.role || role,
          };

          needsProfile = !userData.phone;
        } catch (driverError) {
          console.warn(
            "Cannot get driver info (may need to fill profile):",
            driverError
          );
          // Nếu 403, driver chưa có profile
          userData = {
            userId: userInfo.userId || decodedToken.sub,
            email: userInfo.email || credentials.email,
            role: role,
          };
          needsProfile = true;
        }
      } else if (role === "STAFF") {
        // 7) Nếu là STAFF, gọi staffAPI.getStaffProfile để lấy thông tin đầy đủ
        try {
          const userInfoResponse = await staffAPI.getStaffProfile();
          const staffData =
            userInfoResponse.data?.result || userInfoResponse.data;

          userData = {
            staffId: staffData.staffId,
            email: staffData.email,
            fullName: staffData.fullName,
            phone: staffData.phone,
            employeeNo: staffData.employeeNo,
            position: staffData.position,
            stationId: staffData.stationId,
            stationName: staffData.stationName,
            stationAddress: staffData.stationAddress,
            role: staffData.role || role,
          };
        } catch (staffError) {
          console.warn("Cannot get staff info:", staffError);
        }
      } else {
        // 6) Nếu là ADMIN hoặc role khác, chỉ dùng thông tin từ token
        userData = {
          userId:
            userInfo.userId ||
            decodedToken.sub ||
            decodedToken.userId ||
            decodedToken.id,
          email: userInfo.email || decodedToken.email || decodedToken.sub,
          role: role,
          firstName: userInfo.firstName || decodedToken.firstName || null,
          lastName: userInfo.lastName || decodedToken.lastName || null,
          fullName:
            userInfo.fullName ||
            decodedToken.fullName ||
            decodedToken.name ||
            null,
        };
      }

      console.log("User data extracted:", userData);

      setUser(userData);
      setIsAuthenticated(true);

      // Store user data in localStorage
      // Store user data in localStorage
      localStorage.setItem("user", JSON.stringify(userData));
      if (userData.role) {
        localStorage.setItem("role", userData.role);
      }
      if (userData.userId) {
        localStorage.setItem("currentUserId", userData.userId);
      }

      return { success: true, user: userData, needsProfile };
    } catch (error) {
      console.error("Login error:", error);
      console.error("Error details:", error.response?.data || error.message);

      return {
        success: false,
        error: error.response?.data?.message || error.message || "Login failed",
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Clear local state first (guaranteed to happen)
      setAuthToken(null);
      setUser(null);
      setIsAuthenticated(false);

      // Clear ALL localStorage keys to prevent old data from persisting
      localStorage.removeItem("user");
      localStorage.removeItem("staff");
      localStorage.removeItem("users");
      localStorage.removeItem("role");
      localStorage.removeItem("authToken");
      localStorage.removeItem("currentUserId");
      localStorage.removeItem("authUser");
      localStorage.removeItem("driverTab");
      localStorage.removeItem("adminTab");
      localStorage.removeItem("staffTab");

      // KHÔNG gọi API logout vì backend redirect về Google (gây lỗi CORS)
      // Client-side logout là đủ nếu backend không cung cấp proper logout endpoint
      console.log("✅ Client-side logout completed");
    } catch (error) {
      console.error("❌ Logout error:", error);
    } finally {
      // Always redirect to login page (guaranteed to happen)
      window.location.href = "/login";
    }
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

// Higher-order component for protected routes
// eslint-disable-next-line no-unused-vars, react-refresh/only-export-components
export const withAuth = (Component) => {
  return (props) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Spinner className="mx-auto text-gray-900" />
            <p className="mt-2 text-gray-600">Loading...</p>
          </div>
        </div>
      );
    }

    if (!isAuthenticated) {
      window.location.href = "/login";
      return null;
    }

    return <Component {...props} />;
  };
};

// Hook for role-based access control
// eslint-disable-next-line react-refresh/only-export-components
export const useRole = () => {
  const { user } = useAuth();

  const hasRole = (requiredRole) => {
    if (!user || !user.role) return false;

    // Admin has access to everything
    if (user.role === "Admin") return true;

    // Check specific role
    return user.role === requiredRole;
  };

  const hasAnyRole = (roles) => {
    return roles.some((role) => hasRole(role));
  };

  return {
    userRole: user?.role,
    hasRole,
    hasAnyRole,
    isAdmin: hasRole("Admin"),
    isStaff: hasRole("Staff"),
    isDriver: hasRole("Driver"),
    isCustomer: hasRole("Customer"),
  };
};
