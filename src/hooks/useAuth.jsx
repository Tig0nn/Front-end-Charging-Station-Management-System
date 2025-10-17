import { useState, useEffect, useContext, createContext } from "react";
import { authAPI } from "../lib/apiServices.js";
import { setAuthToken, getAuthToken } from "../lib/api";
// import { setCurrentUser, getCurrentUser, clearAuth } from "../lib/auth.js";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      // Try to get user from localStorage first
      try {
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        if (storedUser && storedUser.email) {
          setUser(storedUser);
          setIsAuthenticated(true);
          setLoading(false);
          return;
        }
      } catch (error) {
        console.log("Error reading stored user:", error);
      }

      // If no stored user, verify token with backend
      authAPI
        .getProfile()
        .then((response) => {
          const userData = response.data.result || response.data;
          setUser(userData);
          setIsAuthenticated(true);
          // Store user data
          localStorage.setItem("user", JSON.stringify(userData));
        })
        .catch(() => {
          // Token invalid, clear it
          setAuthToken(null);
          setUser(null);
          setIsAuthenticated(false);
          localStorage.removeItem("user");
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (credentials) => {
    try {
      setLoading(true);

      // Clear old data before login
      localStorage.removeItem("users");
      localStorage.removeItem("currentUserId");

      const response = await authAPI.login(credentials);
      console.log("Login response:", response);

      // Get token from response
      let token = response.data?.result?.token || response.data?.token;

      if (!token) {
        throw new Error("No token received from server");
      }

      // Decode JWT token to get user info
      const decodeToken = (token) => {
        try {
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(
            atob(base64)
              .split('')
              .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
              .join('')
          );
          return JSON.parse(jsonPayload);
        } catch (error) {
          console.error("Error decoding token:", error);
          return null;
        }
      };

      const decodedToken = decodeToken(token);
      console.log("Decoded token:", decodedToken);

      if (!decodedToken) {
        throw new Error("Failed to decode token");
      }

      // Extract user data from decoded token
      const userData = {
        userId: decodedToken.sub || decodedToken.userId || decodedToken.id,
        email: decodedToken.email || decodedToken.sub,
        role: decodedToken.role || decodedToken.scope,
        fullName: decodedToken.fullName || decodedToken.name,
        firstName: decodedToken.firstName,
        lastName: decodedToken.lastName,
      };

      console.log("User data extracted:", userData);

      setAuthToken(token);
      setUser(userData);
      setIsAuthenticated(true);

      // Store user data in localStorage for persistence
      localStorage.setItem("user", JSON.stringify(userData));
      // Also store role separately for easy access
      if (userData.role) {
        localStorage.setItem("role", userData.role);
      }
      if (userData.userId) {
        localStorage.setItem("currentUserId", userData.userId);
      }

      return { success: true, user: userData };
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
      localStorage.removeItem("user");

      // Try to call logout API (optional, don't fail if it errors)
      await authAPI.logout();
    } catch (error) {
      console.warn("Logout API call failed (ignoring):", error);
      // Continue with logout process even if API call fails
    } finally {
      // Always redirect to login page
      window.location.href = "/login";
    }
  };

  const updateUser = (userData) => {
    setUser(userData);
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
