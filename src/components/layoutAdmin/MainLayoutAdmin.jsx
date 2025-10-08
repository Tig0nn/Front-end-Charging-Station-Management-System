import React from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import "./MainLayoutAdmin.css"; // Import CSS cho layout

const MainLayoutAdmin = ({ children, showSidebar = true }) => {
  return (
    <div className="admin-layout">
      {/* Header */}
      <Header />

      {/* Main Content Area */}
      <div className="admin-body">
        {/* Sidebar */}
        {showSidebar && <Sidebar />}

        {/* Main Content */}
        <main className="admin-main-content">{children}</main>
      </div>
    </div>
  );
};

export default MainLayoutAdmin;
