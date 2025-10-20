import {
  useState,
  useEffect,
  useContext,
  createContext,
  useCallback,
} from "react";
import { authAPI } from "../lib/apiServices.js";
import { setAuthToken, getAuthToken } from "../lib/api";
// import { setCurrentUser, getCurrentUser, clearAuth } from "../lib/auth.js";

const AuthContext = createContext();

// HÀM DECODETOKEN ĐÃ BỊ XÓA

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      // Cố gắng lấy user từ localStorage trước
      // Nếu user đã đăng nhập từ phiên trước và ĐÃ vào trang profile,
      // thông tin đầy đủ sẽ có ở đây.
      try {
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        if (storedUser && storedUser.email) {
          setUser(storedUser);
          setIsAuthenticated(true);
        } else {
          // Có token, nhưng không có thông tin user
          // Chỉ đơn giản là xác thực
          setIsAuthenticated(true);
          setUser({}); // Đặt user là đối tượng rỗng
        }
      } catch (error) {
        console.log("Error reading stored user:", error);
        // Nếu lỗi, coi như chưa đăng nhập
        setAuthToken(null);
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false); // Không có token
    }
  }, []);

  const login = async (credentials) => {
    try {
      setLoading(true);

      // 1. Dọn dẹp state và localStorage cũ
      localStorage.removeItem("user");
      localStorage.removeItem("role");
      localStorage.removeItem("currentUserId");
      localStorage.removeItem("authToken");
      setAuthToken(null);
      setUser(null);
      setIsAuthenticated(false);

      // 2. Gọi API login để lấy token
      const loginResponse = await authAPI.login(credentials);
      console.log("Login response:", loginResponse);

      const token =
        loginResponse.data?.result?.token || loginResponse.data?.token;

      if (!token) {
        throw new Error("Không nhận được token từ server");
      }

      // 3. Lưu token ngay lập tức
      setAuthToken(token);

      // 4. (ĐÃ SỬA) KHÔNG giải mã token, KHÔNG gọi getProfile
      // Chỉ đơn giản là thông báo đã đăng nhập.
      // User sẽ là một đối tượng rỗng cho đến khi được cập nhật.
      const userData = {};

      // 5. Cập nhật state (User là rỗng)
      setUser(userData);
      setIsAuthenticated(true);

      // KHÔNG lưu gì vào localStorage "user" vì chúng ta không có dữ liệu
      // Nó sẽ được cập nhật bởi trang Profile

      return { success: true, user: userData };
    } catch (error) {
      console.error("Lỗi đăng nhập:", error);
      console.error("Chi tiết lỗi:", error.response?.data || error.message);

      setAuthToken(null);
      setUser(null);
      setIsAuthenticated(false);
      localStorage.clear();

      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Đăng nhập thất bại",
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setAuthToken(null);
      setUser(null);
      setIsAuthenticated(false);

      // Xóa tất cả
      localStorage.removeItem("user");
      localStorage.removeItem("role");
      localStorage.removeItem("authToken");
      localStorage.removeItem("currentUserId");

      await authAPI.logout();
    } catch (error) {
      console.warn("Logout API call failed (ignoring):", error);
    } finally {
      window.location.href = "/login";
    }
  };

  // HÀM NÀY SỬA LỖI ĐƠ/TREO MÁY (VÒNG LẶP VÔ HẠN)
  // (Giữ nguyên)
  const updateUser = useCallback((newUserData) => {
    setUser((currentUser) => {
      const updatedUser = { ...currentUser, ...newUserData };

      localStorage.setItem("user", JSON.stringify(updatedUser));
      if (updatedUser.role) {
        localStorage.setItem("role", updatedUser.role);
      }
      if (updatedUser.userId) {
        localStorage.setItem("currentUserId", updatedUser.userId);
      }
      console.log("AuthContext updated with new user data:", updatedUser);

      return updatedUser;
    });
  }, []); // <-- Mảng dependency rỗng (rất quan trọng)

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

// Hook: useAuth
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

// HOC: withAuth
export const withAuth = (Component) => {
  return (props) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
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

// Hook: useRole
export const useRole = () => {
  const { user } = useAuth();

  const hasRole = (requiredRole) => {
    // Cảnh báo: user.role sẽ là UNDEFINED khi mới đăng nhập
    // cho đến khi trang Profile cập nhật nó
    if (!user || !user.role) return false;

    if (user.role === "Admin") return true;
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
