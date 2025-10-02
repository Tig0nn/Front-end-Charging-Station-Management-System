const LOGIN_API =
  "https://unendued-somnolent-rosemarie.ngrok-free.dev/evchargingstation/api/auth/login";

async function CheckCredentials(username, password) {
  if (!username || !password) return false;

  let res;
  try {
    res = await fetch(LOGIN_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "ngrok-skip-browser-warning": "true",
      },
      body: JSON.stringify({
        email: username.trim(), // đổi thành username: nếu backend yêu cầu
        password: password,
      }),
    });
  } catch (e) {
    throw new Error("NETWORK_ERROR");
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    // Không parse được JSON
  }

  if (!res.ok) {
    return false;
  }

  let token = null;

  if (data && data.result) {
    token = data.result.token;
    const authenticated = data.result.authenticated;
    console.log("token:", token);
    console.log("authenticated:", authenticated);
    if (authenticated && token) {
      try {
        localStorage.setItem("auth_token", token);
      } catch {}
      return true;
    }
  }

  if (token) {
    try {
      localStorage.setItem("auth_token", token);
    } catch {}
    return true; // Có token => success
  }

  // Không có token => không cho qua
  return false;
}

export default CheckCredentials;
