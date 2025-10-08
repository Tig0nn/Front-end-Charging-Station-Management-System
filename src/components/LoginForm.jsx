import "tailwindcss";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.jsx";

function LoginForm() {
  const navigate = useNavigate();
  const { login } = useAuth();
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
        navigate("/Admin");
      } else {
        setLoginErr(result.error || "Đăng nhập thất bại");
      }
    } catch (err) {
      console.error("Login error:", err);
      setLoginErr("Lỗi không xác định: " + err.message);
    }
  }
  return (
    <form className="space-y-6  " onSubmit={HandleClick}>
      <div>
        <label
          className="text-white font-semibold text-lg mb-2 "
          htmlFor="username"
        >
          Email
        </label>
        <input
          id="username"
          name="username"
          type="text"
          placeholder="Hãy nhập Email tại đây"
          className="w-full px-3 py-2 rounded-md border-none  
                 bg-[#253340] text-white 
                 placeholder-transparent focus:placeholder-[#6bfbdc]
                 focus:outline-none focus:ring-1 focus:ring-[#6bfbdc]"
          onFocus={() => setLoginErr("")}
        />
      </div>

      <div className="-mt-2 ">
        <label
          className="text-white font-semibold text-lg mb-2"
          htmlFor="password"
        >
          Mật Khẩu
        </label>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="Hãy nhập mật khẩu"
          className="w-full px-3 py-2 rounded-md border-none  
                 bg-[#253340] text-white 
                 placeholder-transparent focus:placeholder-[#6bfbdc]
                 focus:outline-none focus:ring-1 focus:ring-[#6bfbdc]"
          onFocus={() => setLoginErr("")}
        />
      </div>
      <div className="mt-2">
        {loginErr && <p className="text-red-500 text-sm">{loginErr}</p>}
      </div>

      <button
        className="bg-[#2bf0b5] w-full py-1 rounded-md border-none border-gray-300 
             text-gray-800  text-lg  font-bold transition duration-300 ease-in-out 
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
