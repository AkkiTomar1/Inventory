// Sidebar.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaTachometerAlt,
  FaBoxes,
  FaBoxOpen,
  FaTruck,
  FaUserCircle,
  FaSignOutAlt,
  FaLayerGroup,
  FaChevronDown,
  FaShoppingCart,
} from "react-icons/fa";
import useLogout from "./hooks/useLogout";

const Sidebar = () => {
  const [expanded, setExpanded] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [loadingLogout, setLoadingLogout] = useState(false);
  const logout = useLogout();

  const handleLogout = async () => {
    setLoadingLogout(true);
    await logout({ callApi: true });
    setLoadingLogout(false);
  };

  const menuItems = [
    { name: "Dashboard", icon: <FaTachometerAlt size={18} />, path: "/dashboard" },
    { name: "Purchase", icon: <FaShoppingCart size={18} />, path: "/purchase" },
    { name: "Categories", icon: <FaBoxes size={18} />, path: "/categories" },
    { name: "Sub Categories", icon: <FaLayerGroup size={18} />, path: "/subcategories" },
    { name: "Products", icon: <FaBoxOpen size={18} />, path: "/products" },
    { name: "Suppliers", icon: <FaTruck size={18} />, path: "/suppliers" },
    { name: "Profile", icon: <FaUserCircle size={18} />, path: "/profile" },
  ];

  // Whenever expanded or mobileOpen changes, dispatch the correct width
  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    const width = isMobile ? (mobileOpen ? 256 : 0) : (expanded ? 256 : 80);
    // expanded flag for consumer: only meaningful on desktop (for mobile keep false)
    const expandedFlag = isMobile ? false : expanded;
    window.dispatchEvent(new CustomEvent("sidebarState", { detail: { expanded: expandedFlag, width } }));
  }, [expanded, mobileOpen]);

  // Listen for the global toggleSidebar event
  useEffect(() => {
    const handler = () => {
      if (window.innerWidth < 768) {
        // mobile: toggle drawer
        setMobileOpen((v) => !v);
      } else {
        // desktop: toggle collapse/expand
        setExpanded((prev) => !prev);
      }
    };
    window.addEventListener("toggleSidebar", handler);
    return () => window.removeEventListener("toggleSidebar", handler);
  }, []);

  const expandSidebar = () => {
    const next = true;
    setExpanded(next);
    // dispatch will be handled by effect above
  };

  const onNavigate = (path) => {
    if (!path) return;
    navigate(path);
    // if mobile, close and ensure width 0 is dispatched (effect will run because mobileOpen changes)
    if (window.innerWidth < 768) {
      setMobileOpen(false);
    }
  };

  const containerBase = "fixed left-0 top-0 h-full z-40 transition-all duration-300 ease-in-out flex flex-col justify-between";
  const desktopWidthClass = expanded ? "w-64" : "w-20";
  const mobileVisibility = mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0";

  return (
    <div className={`${containerBase} ${desktopWidthClass} ${mobileVisibility}`}>
      <div className={`h-full bg-[#0f2027] flex flex-col justify-between py-4 px-2 ${expanded ? "bg-[#0f2027]" : "bg-gray-900"} shadow-2xl`}>
        <div>
          <div className={`hidden md:flex items-center justify-center py-4 border-b border-white/10 mb-3 ${expanded ? "" : "hidden"}`}>
            <h1 className="text-2xl font-bold text-gray-100 tracking-wide flex items-center">
              <FaChevronDown size={22} className="mr-3 text-white/80" />
              {expanded && <span>Inventory</span>}
            </h1>
          </div>

          <nav className="mt-4 flex flex-col gap-1">
            {menuItems.map((item, idx) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={idx}
                  onClick={() => onNavigate(item.path)}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 w-full focus:outline-none 
                    ${expanded ? "justify-start" : "justify-center"}
                    ${isActive ? "bg-linear-to-l from-amber-400 to-amber-500" : "hover:bg-white/10"}
                    active:bg-white/30`}
                  title={expanded ? "" : item.name}
                >
                  <span className={`text-white ${isActive ? "opacity-100" : "opacity-90"}`}>{item.icon}</span>
                  {expanded && <span className={`text-white font-medium ${isActive ? "opacity-100" : "opacity-95"}`}>{item.name}</span>}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="px-2">
          {expanded ? (
            <div className="border-t border-white/10 pt-3">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full p-3 rounded-xl text-white font-semibold hover:bg-red-500 hover:text-white transition-all duration-200 active:bg-red-600"
              >
                <FaSignOutAlt size={18} />
                <span>{loadingLogout ? "Logging out..." : "Logout"}</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center py-3">
              <button
                onClick={expandSidebar}
                className="p-2 rounded-md bg-black/15 hover:bg-black/10 text-white active:bg-white/30 transition"
                aria-label="Expand sidebar"
                title="Open"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white">
                  <path d="M8 6l8 6-8 6V6z" fill="currentColor" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
