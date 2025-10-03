import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import Profile from "./Profile";
function Navbar() {
   const navigate = useNavigate();
   const [open, setOpen] = useState(false);
   let popup=null;
    function HandleProfile(){
       setOpen(true);
    }
    function handleLogout(){
       try{
         localStorage.removeItem("auth_token");
       }catch{}
       navigate("/", { replace: true });
    }
    if(open){
        popup=<Profile/>;
    };
  return (
    <>
    
      <div className="bg-gray-800 text-white px-6 py-3 ">
        <ul className="flex items-center space-x-6 ">
          <li>
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive
                  ? "border-b-2 rounded-md border-teal-400 pb-1 text-lg"
                  : "hover:border-b-2 hover:border-gray-400 pb-1 text-lg"
              }

            >Home</NavLink>
          </li>
          <li>
            <NavLink 
              to="/info"
              className={({ isActive }) =>
                isActive
                  ? "border-b-2 rounded-md border-teal-400 pb-1 text-lg"
                  : "hover:border-b-2 hover:border-gray-400 pb-1 text-lg"
              }
              onClick={HandleProfile}
            >
              Info
            </NavLink>
           
          </li>
          <li className="ml-auto">
            <button
              type="button"
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-md bg-red-600 hover:bg-red-700 text-white text-sm"
            >
              Đăng xuất
            </button>
          </li>
        </ul>
        {popup}
      </div>
    </>
  );
}

export default Navbar;
