import React from "react";
import Header from "./HeaderStaff";
import Sidebar from "./SidebarStaff";

export default function MainLayoutStaff({ children }) {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Header />
      <div className="d-flex flex-grow-1">
        <Sidebar />
        <main
          className="flex-grow-1 bg-light"
          style={{ marginLeft: "80px", paddingTop: "1rem", transition: "margin-left 0.3s ease" }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}