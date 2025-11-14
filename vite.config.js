import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173, // Đảm bảo đúng port bạn đã khai báo trong Cloudflare
    host: true, // Cho phép lắng nghe từ các IP khác (quan trọng cho Tunnel)
    strictPort: true, // Nếu port 5173 bận thì báo lỗi chứ không tự đổi sang 5174
    allowedHosts: ["web.khoahtd.id.vn", ".khoahtd.id.vn"], // (Mới) Cho phép truy cập từ domain này
  },
});
