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
          const userData = response.data;
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
      const response = await authAPI.login(credentials);

      // Handle both mock API and real API response formats
      const token = response.data.result.token ;
      const userData =
        response.data?.user || response.data?.User || response.data;

      if (!token) {
        throw new Error("No token received from server");
      }

      setAuthToken(token);
      setUser(userData);
      setIsAuthenticated(true);

      // Store user data in localStorage for persistence
      localStorage.setItem("user", JSON.stringify(userData));

      return { success: true, user: userData };
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        error: error.message || "Login failed",
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setAuthToken(null);
    setUser(null);
    setIsAuthenticated(false);

    // Optionally call logout API
    authAPI.logout().catch(() => {
      // Ignore logout API errors
    });

    // Redirect to login page
    window.location.href = "/login";
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
