import { Link } from "react-router-dom";
import LoginForm from "../components/LoginForm";
function LoginPage() {
  const suggestion = (
    <div className=" text-[#2bf0b5] mb-6 text-center">
      <h3 className="text-lg font-semibold ">Đăng Nhập</h3>
    </div>
  );

  const directToSignUp = (
    <p className="text-white text-xs text-center ">
      Nếu bạn chưa có tài khoản, bạn có thể đăng ký
      <Link
        to="/signup"
        className="ml-1 font-semibold text-[#2bf0b5]! hover:text-[#00ffc6]! no-underline!
        hover:[text-shadow:0_0_5px_#00ffc6,0_0_10px_#00ffc6,0_0_15px_#00ffc6]!"
      >
        Tại đây
      </Link>
    </p>
  );
  const logo = <img src="src/assets/image/logo.png" alt="Logo" />;

 const helper = (
  <div className="mt-4 space-y-5">
    {/* Ghi nhớ + Quên tài khoản */}
    <div className="flex items-center justify-between text-sm text-white">
      <label className="inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          className="w-4 h-4 accent-[#2bf0b5]"
        />
        <span className="ml-2">Ghi nhớ</span>
      </label>

      <a
        href="#"
        className="text-white  no-underline! hover:text-[#2bf0b5]! transition-colors"
      >
        Bạn đã quên tài khoản?
      </a>
    </div>

    {directToSignUp}

    {/* Divider */}
    <div className="flex items-center w-full">
      <div className="flex-1 border-t border-gray-600"></div>
      <span className="px-3 text-gray-300 text-sm">Hoặc</span>
      <div className="flex-1 border-t border-gray-600"></div>
    </div>

    {/* Google Button */}
    <button
      type="button"
      className="w-full flex items-center justify-center gap-3
                 px-4 py-2 rounded-lg bg-white
                 text-gray-700 font-semibold shadow-sm
                 hover:bg-gray-100 hover:text-black
                 transition-colors duration-200 active:scale-95"
    >
      <img
        src="src/assets/image/anhGG.png"
        alt="Google"
        className="w-6 h-6 pointer-events-none"
      />
      <span className="text-base"> Google</span>
    </button>
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
    <div className="flex items-center px-[45px] py-[40px]  justify-center  background  ">
      <div className="absolute top-4 left-4 w-24">{logo}</div>
      <div className=" p-6 space-y-6 sm:p-8 rounded-xl shadow-lg w-full max-w-sm bg-[#2C3E50]">
        {suggestion}
        <LoginForm />
        {helper}
      </div>
    </div>
  );
}

export default Login;
