import React from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";

const MainLayout = ({ children, showSidebar = true }) => {
  return (
    <div className="min-vh-100">
      {/* Header */}
      <Header />

      {/* Main Content Area */}
      <div className="d-flex">
        {/* Sidebar */}
        {showSidebar && <Sidebar />}

        {/* Main Content */}
        <main className="flex-grow-1 p-4">{children}</main>
      </div>
    </div>
  );
};

export default MainLayout;
