import { useState } from "react";
import LoginPage from "./Pages/Login";
import Navbar from "./Pages/Driver/Home/Navbar"; 
import "./App.css";

function App() {
  const [count, setCount] = useState(0);

  return (
    
      <div>
        <LoginPage />
      </div>
    
  );
}

export default App;
