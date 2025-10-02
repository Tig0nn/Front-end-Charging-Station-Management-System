// URL API đăng ký của bạn
const REGISTER_API = "https://unendued-somnolent-rosemarie.ngrok-free.dev/evchargingstation/api/auth/register";

// Hàm này gửi yêu cầu đăng ký người dùng đến server và xử lý phản hồi. 
export async function registerUser(email, password) {
  try {
    const response = await fetch(REGISTER_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
      body: JSON.stringify({
        email: email.trim(),
        password: password,
      }),
    });

    // Nếu server trả về lỗi (ví dụ: email đã tồn tại, lỗi 4xx, 5xx)
    if (!response.ok) {
      const errorData = await response.json();
      // Ném ra lỗi với thông báo từ server để component có thể bắt và hiển thị
      throw new Error(errorData.message || 'Đã có lỗi không xác định từ server.');
    }

    // Nếu thành công, trả về dữ liệu từ response
    return await response.json();

  } catch (error) {
    // Phân biệt lỗi mạng và lỗi từ server
    if (error.message.includes('Failed to fetch')) {
      throw new Error('Lỗi mạng: Không thể kết nối đến máy chủ.');
    }
    // Ném lại lỗi (đã được xử lý ở trên hoặc là lỗi không xác định)
    throw error;
  }
}