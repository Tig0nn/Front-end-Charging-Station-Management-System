// ...existing code...
const LOGIN_API = "https://overintense-hee-unaxiomatic.ngrok-free.dev/auth/login";

async function CheckCredentials(username, password) {
  if (!username || !password) return false;

  let res;
  try {
    res = await fetch(LOGIN_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: username.trim(), password }),
    });
  } catch (e) {
    // Lỗi mạng / không kết nối được
    throw new Error("NETWORK_ERROR");
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    // Không parse được JSON: vẫn tiếp tục
  }

  if (!res.ok) {
    // Sai thông tin hoặc server trả lỗi logic: coi là đăng nhập thất bại
    return false;
  }

  if (typeof data === "boolean") return data;
  if (data && typeof data.success === "boolean") return data.success;
  if (data && typeof data.authenticated === "boolean") return data.authenticated;
  return false;
}

export default CheckCredentials;