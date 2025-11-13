// src/components/layout/Layout.jsx
import React, { useEffect, useState } from "react";
import Sidebar from "../../Sidebar";
import { Outlet } from "react-router-dom";
import Navbar from "../../Navbar";

const MOBILE_BREAKPOINT = 768; // px

const Layout = () => {
  // initial: 0 on mobile, 256 on desktop
  const initialLeft = typeof window !== "undefined" && window.innerWidth < MOBILE_BREAKPOINT ? 0 : 256;
  const [leftPx, setLeftPx] = useState(initialLeft);
  const [isMobile, setIsMobile] = useState(typeof window !== "undefined" && window.innerWidth < MOBILE_BREAKPOINT);

  useEffect(() => {
    // handle sidebarState events
    const onSidebarState = (e) => {
      const detail = e?.detail ?? {};
      // reported width or infer from expanded flag
      const reportedWidth = typeof detail.width === "number" ? detail.width : (detail.expanded ? 256 : 80);
      // if mobile, force 0 (sidebar overlays content on mobile)
      const finalWidth = window.innerWidth < MOBILE_BREAKPOINT ? 0 : Math.max(0, reportedWidth);
      setLeftPx(finalWidth);
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    window.addEventListener("sidebarState", onSidebarState);

    // respond to window resize so layout adapts immediately
    const onResize = () => {
      const mobile = window.innerWidth < MOBILE_BREAKPOINT;
      setIsMobile(mobile);
      // If mobile, always force 0
      if (mobile) {
        setLeftPx(0);
      } else {
        // when going to desktop, keep a sensible fallback (256) until sidebar dispatches state
        setLeftPx((curr) => (curr === 0 ? 256 : curr));
        // optionally: ask sidebar to emit its current state (if implemented)
        // window.dispatchEvent(new CustomEvent("requestSidebarState"));
      }
    };
    window.addEventListener("resize", onResize);

    // cleanup
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

        {/* main content: on mobile left padding is forced to 0 */}
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
