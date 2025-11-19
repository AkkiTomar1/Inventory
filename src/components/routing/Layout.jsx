// src/components/layout/Layout.jsx
import React, { useEffect, useState } from "react";
import Sidebar from "../../Sidebar";
import Navbar from "../../Navbar";
import { Outlet } from "react-router-dom";

const MOBILE_BREAKPOINT = 768;

const Layout = () => {
  const initialLeft =
    window.innerWidth < MOBILE_BREAKPOINT ? 0 : 256;

  const [leftPx, setLeftPx] = useState(initialLeft);
  const [isMobile, setIsMobile] = useState(
    window.innerWidth < MOBILE_BREAKPOINT
  );

  useEffect(() => {
    const onSidebarState = (e) => {
      const detail = e?.detail ?? {};
      const reportedWidth =
        typeof detail.width === "number"
          ? detail.width
          : detail.expanded
          ? 256
          : 80;

      const finalWidth =
        window.innerWidth < MOBILE_BREAKPOINT ? 0 : reportedWidth;

      setLeftPx(finalWidth);
    };

    const onResize = () => {
      const mobile = window.innerWidth < MOBILE_BREAKPOINT;
      setIsMobile(mobile);
      if (mobile) setLeftPx(0);
      else setLeftPx((curr) => (curr === 0 ? 256 : curr));
    };

    window.addEventListener("sidebarState", onSidebarState);
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("sidebarState", onSidebarState);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Navbar />

        <main
          style={{
            paddingLeft: isMobile ? 0 : leftPx,
            transition: "padding-left 240ms ease-in-out",
          }}
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
