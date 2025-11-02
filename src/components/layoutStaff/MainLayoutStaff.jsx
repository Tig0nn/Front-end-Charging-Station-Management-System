import React from "react";
import Header from "./HeaderStaff";

export default function MainLayoutStaff({ children }) {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Header />
      <main className="flex-grow-1 bg-light" style={{ paddingTop: "1rem" }}>
        {children}
      </main>
    </div>
  );
}
