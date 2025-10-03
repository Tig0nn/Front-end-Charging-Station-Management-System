// Thay thế URL này bằng API endpoint CẬP NHẬT THÔNG TIN của bạn
const UPDATE_USER_API = "https://unendued-somnolent-rosemarie.ngrok-free.dev/evchargingstation/api/users/myInfo";

export async function updateUserInfo(last_name, first_name, gender, dob, phoneNum) {
  try {
    const response = await fetch(UPDATE_USER_API, {
      method: "POST", // Hoặc 'PUT' tùy theo thiết kế API của bạn
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
      body: JSON.stringify({
        token: "eyJhbGciOiJIUzUxMiJ9.eyJpc3MiOiJldi1jaGFyZ2luZy1zdGF0aW9uIiwic3ViIjoiaGVsbG8xMjNAZ21haWwuY29tIiwiZXhwIjoxNzU5NDc3NzcyLCJpYXQiOjE3NTk0NzQxNzIsInNjb3BlIjoiRFJJVkVSIn0.1DnBU-wtxP5mL5eckRLwzwY4GSRf_Woq3iky1zkmbk22WG11_ohT4YJQ2f8oTKSBHMfVfDQFmIJuKWf083d5Kg",
        last_name: last_name.trim(),
        first_name: first_name.trim(),
        gender: gender.trim(),
        dob: dob.trim(),
        phoneNum: phoneNum.trim()
      }),
    });

    // Nếu server trả về lỗi (vd: token hết hạn, dữ liệu không hợp lệ)
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Có lỗi xảy ra từ phía server.');
    }

    return await response.json();

  } catch (error) {
    // Phân biệt lỗi mạng và các lỗi khác
    if (error.message.includes('Failed to fetch')) {
      throw new Error('Lỗi mạng: Không thể kết nối đến máy chủ.');
    }
    // Ném lại lỗi đã được xử lý ở trên hoặc lỗi không xác định
    throw error;
  }
}