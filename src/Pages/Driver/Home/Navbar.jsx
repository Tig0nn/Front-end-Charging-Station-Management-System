import { NavLink } from "react-router-dom";
import { useState } from "react";
import Profile from "./Profile";
function Navbar() {
   const [open, setOpen] = useState(false);
   let popup=null;
    function HandleProfile(){
       setOpen(true);
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
        </ul>
        {popup}
      </div>
    </>
  );
}

export default Navbar;
