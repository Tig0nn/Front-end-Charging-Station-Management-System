async function CheckCredentials(username, password) {
  try {
    const response = await fetch(
      "https://68d23b63cc7017eec542f589.mockapi.io/USER"
    );

    if (!response.ok) {
      throw new Error(`Lỗi HTTP: ${response.status}`);
    }

    const users = await response.json();

    // Tìm người dùng có username và password khớp
    const foundUser = users.find(
      (user) => user.username === username && user.password === password
    );

    if (foundUser) {
      console.log("Đăng nhập thành công:", foundUser);
      return foundUser; // Trả về thông tin người dùng nếu thành công
    } else {
      console.log("Tên đăng nhập hoặc mật khẩu không đúng.");
      return null; // Trả về null nếu không tìm thấy
    }
  } catch (error) {
    console.error("Lỗi khi kiểm tra đăng nhập:", error);
    return null; // Trả về null nếu có lỗi xảy ra
  }
}

export default CheckCredentials;