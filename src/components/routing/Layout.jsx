// src/components/layout/Layout.jsx
import React, { useEffect, useState } from "react";
import Sidebar from "../../Sidebar";
import { Outlet } from "react-router-dom";
import Navbar from "../../Navbar";

const Layout = () => {
  // default width matches expanded sidebar (16rem = 256px)
  const [leftPx, setLeftPx] = useState(256);

  useEffect(() => {
    const handler = (e) => {
      const detail = e?.detail ?? {};
      const width = typeof detail.width === "number" ? detail.width : (detail.expanded ? 256 : 80);
      setLeftPx(Math.max(0, width));
    };

    // listen for sidebar state events
    window.addEventListener("sidebarState", handler);

    // cleanup
    return () => window.removeEventListener("sidebarState", handler);
  }, []);

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Navbar />

        {/* main content: paddingLeft follows sidebar width and animates smoothly */}
        <main
          style={{ paddingLeft: leftPx, transition: "padding-left 300ms ease-in-out" }}
          className="flex-1 pt-20 bg-gray-50"
        >
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
