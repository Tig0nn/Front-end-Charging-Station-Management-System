// Bảng màu hiện đại và hài hòa cho buttons
export const buttonStyles = {
  // Nút chính - Xanh lá mint (dễ chịu, hiện đại)
  primary: {
    default: "#10b981", // Emerald-500
    hover: "#059669", // Emerald-600
    active: "#047857", // Emerald-700
  },

  // Nút nguy hiểm - Đỏ cam nhẹ nhàng
  danger: {
    default: "#f97316", // Orange-500
    hover: "#ea580c", // Orange-600
    active: "#c2410c", // Orange-700
  },

  // Nút tối - Xám đen mềm mại
  dark: {
    default: "#374151", // Gray-700
    hover: "#1f2937", // Gray-800
    active: "#111827", // Gray-900
  },

  // Nút cảnh báo - Vàng cam ấm áp
  warning: {
    default: "#fbbf24", // Amber-400
    hover: "#f59e0b", // Amber-500
    active: "#d97706", // Amber-600
  },

  // Nút thành công - Xanh lá tươi
  success: {
    default: "#22c55e", // Green-500
    hover: "#16a34a", // Green-600
    active: "#15803d", // Green-700
  },
};

// Helper function để tạo style object cho button
export const createButtonStyle = (type = "primary", disabled = false) => ({
  backgroundColor: disabled ? "#d1d5db" : buttonStyles[type].default,
  color: "white",
  border: "none",
  transition: "all 0.3s ease",
  cursor: disabled ? "not-allowed" : "pointer",
  opacity: disabled ? 0.6 : 1,
});

// Helper function cho hover effects
export const getHoverStyle = (type = "primary") => ({
  backgroundColor: buttonStyles[type].hover,
  transform: "translateY(-2px)",
  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
});

export const getActiveStyle = (type = "primary") => ({
  backgroundColor: buttonStyles[type].active,
  transform: "translateY(0)",
  boxShadow: "none",
});
