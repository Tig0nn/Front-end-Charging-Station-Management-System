import LoginForm from "../Utils/Form";
import { Link } from "react-router-dom";
function LoginPage() {
  const suggestion = (
    <div className=" text-[#2bf0b5] mb-6 text-center">
      <h3 className=" text-[#68ffc2] text-xl font-bold ">Đăng Nhập</h3>
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
  const logo = <img src="src/image/logo.png" alt="Logo" />;

  const helper = (
    <div className="mt-3 space-y-4 ">
      <label className="flex items-center text-white text-sm mb-2">
        <input type="checkbox" className="mr-2 accent-blue-500" />
        Ghi nhớ
      </label>
      <div className="flex  flex-col justify-center items-center gap-6 mt-3 ">
        <p className="text-white text-sm mb-2">
          _______________Hoặc_______________
        </p>
        <button
          type="button"
          className="w-full inline-flex items-center justify-center gap-2
                     px-4 py-2 rounded-lg
                     bg-[#2C3E50] text-white border border-transparent
                     hover:bg-white hover:text-black  hover:border-[#2C3E50]
                     transition-colors duration-200
                     active:scale-95"
        >
          <img
            src="src/image/anhGG.png"
            alt="Google"
            className="w-8 h-8 pointer-events-none"
          />
          <span className="text-sm font-medium ">Google</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex items-center    justify-center min-h-screen bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364]  ">
      <div className="absolute top-4 left-4 w-24">{logo}</div>
      <div className=" p-6 space-y-6 sm:p-8 rounded-xl shadow-lg w-full max-w-sm bg-[#2C3E50]">
        {suggestion}
        {directToSignUp}
        <LoginForm />
        {helper}
      </div>
    </div>
  );
}

export default LoginPage;
