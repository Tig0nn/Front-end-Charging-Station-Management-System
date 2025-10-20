import React from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";

const MainLayoutAdmin = ({ children, showSidebar = true }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />

      {/* Main Content Area */}
      <div className="relative min-h-[calc(100vh-100px)]">
        {/* Sidebar - positioned fixed, will overlay content when expanded on hover */}
        {showSidebar && <Sidebar />}

        {/* Main Content - padding-left for collapsed sidebar (80px), expanded sidebar overlays */}
        <main className="pl-[100px] pr-10 pt-8 pb-8 min-h-[calc(100vh-100px)] bg-white overflow-x-auto overflow-y-auto transition-all duration-300">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayoutAdmin;
