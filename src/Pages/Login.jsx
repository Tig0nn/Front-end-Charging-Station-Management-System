import "tailwindcss";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.jsx";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loginErr, setLoginErr] = useState("");

  // Xử lý đăng nhập
  async function HandleClick(e) {
    e.preventDefault();
    const username = e.target.username.value;
    const password = e.target.password.value;

    if (!username || !password) {
      setLoginErr("Vui lòng nhập đủ username và password");
      return;
    }

    try {
      setLoginErr(""); // Xóa lỗi cũ nếu có

      const result = await login({
        email: username.trim(),
        password: password,
      });

      if (result.success) {
        alert("Đăng nhập thành công!");
        navigate("/admin/dashboard");
      } else {
        setLoginErr(result.error || "Đăng nhập thất bại");
      }
    } catch (err) {
      console.error("Login error:", err);
      setLoginErr("Lỗi không xác định: " + err.message);
    }
  }

  // Các phần giao diện phụ
  const suggestion = (
    <div className="text-[#2bf0b5] mb-6 text-center">
      <h3 className="text-[#68ffc2] text-xl font-bold">Đăng Nhập</h3>
    </div>
  );

  const directToSignUp = (
    <p className="text-white text-xs text-center mt-4">
      Nếu bạn chưa có tài khoản, bạn có thể đăng ký
      <Link
        to="/signup"
        className="text-[#68ffc2] ml-1 font-semibold hover:underline"
      >
        Tại đây
      </Link>
    </p>
  );
  const logo = <img src="src/assets/image/logo.png" alt="Logo" />;

  const helper = (
    <div className="mt-3 space-y-4">
      <label className="flex items-center text-white text-sm mb-2">
        <input type="checkbox" className="mr-2 accent-blue-500" />
        Ghi nhớ
      </label>
      <div className="flex flex-col justify-center items-center gap-6 mt-3">
        <p className="text-white text-sm mb-2">
          _______________Hoặc_______________
        </p>
        <button
          type="button"
          className="w-full inline-flex items-center justify-center gap-2
                     px-4 py-2 rounded-lg
                     bg-[#2C3E50] text-white border border-transparent
                     hover:bg-white hover:text-black hover:border-[#2C3E50]
                     transition-colors duration-200
                     active:scale-95"
        >
          <img
            src="src/assets/image/anhGG.png"
            alt="Google"
            className="w-8 h-8 pointer-events-none"
          />
          <span className="text-sm font-medium">Google</span>
        </button>
      </div>
    </div>
  );

  // Form đăng nhập
  const loginForm = (
    <form className="space-y-6" onSubmit={HandleClick}>
      <div>
        <label className="text-white" htmlFor="username">
          Tên tài khoản
        </label>
        <input
          id="username"
          name="username"
          type="text"
          placeholder="Hãy nhập Gmail tại đây"
          className="w-full px-3 py-2 rounded-md border border-gray-300 
                     bg-white text-gray-800 placeholder-gray-400 
                     placeholder-transparent focus:placeholder-gray-400"
        />
      </div>

      <div className="-mt-3">
        <label className="text-white" htmlFor="password">
          Mật Khẩu
        </label>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="Hãy nhập mật khẩu"
          className="w-full px-3 py-2 rounded-md border border-gray-300 
                     bg-white text-gray-800 placeholder-gray-400 
                     placeholder-transparent focus:placeholder-gray-400"
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

  return (
    <div className="flex items-center    justify-center min-h-screen bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364]  ">
      <div className="absolute top-4 left-4 w-24">
        <Link to="/">{logo}</Link>
      </div>
      <div className=" p-6 space-y-6 sm:p-8 rounded-xl shadow-lg w-full max-w-sm bg-[#2C3E50]">
        {suggestion}
        {directToSignUp}
        {loginForm}
        {helper}
      </div>
    </div>
  );
}

export default Login;
