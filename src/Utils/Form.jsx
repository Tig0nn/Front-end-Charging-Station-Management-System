import "tailwindcss";
import { useNavigate } from "react-router-dom";
import CheckCredentials from "../FetchApi/CheckLogin";

function LoginForm() {
  const navigate = useNavigate();

  function HandleClick(e) {
    e.preventDefault();
    const username = e.target.username.value;
   const password = e.target.password.value;
    CheckCredentials(username, password).then((result) => {
      if (result && result.success) {
        alert("Đăng nhập thành công!");
        navigate("/");
      } else {
        alert(result);
      }
    })
  }

  return (
    <form className="space-y-8  " onSubmit={HandleClick}>
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

      <div>
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
