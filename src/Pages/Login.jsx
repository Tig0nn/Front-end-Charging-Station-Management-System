import LoginForm from "../Utils/Form";

function LoginPage() {
  const suggestion = (
    <div className="mb-6 text-center">
      <h3 className=" text-[#68ffc2] text-xl font-bold ">Đăng Nhập</h3>
    </div>
  );

  const directToSignUp = (
    <p className="text-white text-xs text-center mt-4 ">
      Nếu bạn chưa có tài khoản, bạn có thể đăng ký
      <span className="text-[#68ffc2] ml-1 font-semibold cursor-pointer hover:underline">
        Tại đây
      </span>
    </p>
  );
  const logo=(
    <img src="https://media.discordapp.net/attachments/1415674358923264035/1420652393221062656/logo.png?ex=68d62d24&is=68d4dba4&hm=56ea21cf7406be6fd4ba8022c30784fff3c24956f56a75cdab828868ba17b7b3&=&format=webp&quality=lossless&width=545&height=545"
     alt='Logo'/>
  )
  
  const helper = (
    <div className="mt-3 space-y-4 ">
      <label className="flex items-center text-white text-sm mb-2">
        <input type="checkbox" className="mr-2 accent-blue-500" />
        Ghi nhớ
      </label>
      <div className="flex items-center gap-6 mt-3 ">
        <p className="text-white text-sm mb-2">Hoặc đăng nhập với</p>
        <button className=" bg-white inline-flex items-center  px-4 py-2 border border-gray-300 rounded-lg shadow-sm hover:bg-gray-100 transition">
          <img
            src="https://developers.google.com/identity/images/g-logo.png"
            alt="Google"
            className="mr-2"
            width="20"
            height="20"
          />
          Google
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex items-center   justify-center min-h-screen bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364]  ">
      <div className="absolute top-4 left-4 w-24">
      {logo}
    </div>
      <div className=" p-6 space-y-6 sm:p-8 rounded-xl shadow-lg w-full max-w-sm bg-black">
        {suggestion}
        <LoginForm />
        {helper}
         {directToSignUp}
      </div>
    </div>
  );
}

export default LoginPage;
