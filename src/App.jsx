import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { Routes, Route, Navigate } from "react-router-dom"; 
import LoginPage from "./Pages/Login";
import SignupForm from "./Pages/SignUp";
import Navbar from "./Pages/Driver/Home/Navbar";
function App() {
  return (
   <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/signup" element={<SignupForm />} />
      <Route path="/Admin" element={<Navbar />} />
      <Route path="*" element={<Navigate to="/" replace />} />
      
    </Routes>
  );
}

export default App;
