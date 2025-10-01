import "tailwindcss";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CheckCredentials from "../FetchApi/CheckLogin";

function LoginForm() {
  const navigate = useNavigate();
  const [loginErr, setLoginErr] = useState("");

  async function HandleClick(e) {
    e.preventDefault();
    const username = e.target.username.value;
    const password = e.target.password.value;

    if (!username || !password) {
      setLoginErr("Vui lòng nhập đủ username và password");
      return;
    }

    try {
      const ok = await CheckCredentials(username, password);
      if (ok) {
        alert("Đăng nhập thành công!");
        navigate("/");
      } else {
        setLoginErr("Sai tài khoản hoặc mật khẩu!");
      }
    } catch (err) {
      if (err.message === "NETWORK_ERROR") {
        alert(
          "Không thể kết nối tới server (lỗi mạng hoặc server không phản hồi)!"
        );
      } else {
        alert("Lỗi không xác định!");
      }
      console.error("Lỗi khi đăng nhập:", err);
    }
  }
  return (
    <form className="space-y-6  " onSubmit={HandleClick}>
      <div>
        <label className="text-white " htmlFor="username">
          Tên tài khoản
        </label>
        <input
          id="username"
          name="username"
          type="text"
          placeholder="Hãy nhập Gmail tại đây"
          className="w-full px-3 py-2 rounded-md border border-gray-300 
                 bg-white text-gray-800 placeholder-gray-400   placeholder-transparent focus:placeholder-gray-400"
        />
      </div>

      <div className="-mt-3">
        <label className="text-white " htmlFor="password">
          Mật Khẩu
        </label>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="Hãy nhập mật khẩu"
          className="w-full px-3 py-2 rounded-md border border-gray-300 
                 bg-white text-gray-800 placeholder-gray-400 placeholder-transparent focus:placeholder-gray-400 "
        />
        
      </div>
      <div className="mt-2">
        {loginErr && <p className="text-red-500 text-sm">{loginErr}</p>}
      </div>

      <button
        className="bg-[#2bf0b5] w-full py-1 rounded-md border border-gray-300 
             text-gray-800 transition duration-300 ease-in-out 
             hover:bg-[#1dd3a1] hover:text-white hover:scale-[1.02]
             active:scale-95 active:bg-[#19b98d]"
        type="submit"
      >
        Đăng nhập
      </button>
    </form>
  );
}

export default LoginForm;
