import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaUserCircle, FaChevronDown, FaBars } from "react-icons/fa";
import useLogout from "./hooks/useLogout";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const logout = useLogout();
  const [isHovered, setIsHovered] = useState(false);
  const [contentPadding, setContentPadding] = useState(256);
  const [loadingLogout, setLoadingLogout] = useState(false);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const handler = (e) => {
      const width = e?.detail?.width ?? 256;
      setContentPadding(Math.max(0, width));
    };
    window.addEventListener("sidebarState", handler);
    return () => window.removeEventListener("sidebarState", handler);
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) {
        const u = JSON.parse(raw);
        setUserName(u.name || u.username || u.email || "User");
      } else {
        setUserName("User");
      }
    } catch {
      setUserName("User");
    }
  }, [location]);

  const handleToggleSidebar = () => {
    window.dispatchEvent(new CustomEvent("toggleSidebar"));
  };

  const getPageTitle = () => {
    const titles = {
      "/": "Dashboard",
      "/dashboard": "Dashboard",
      "/purchase": "Purchase",
      "/categories": "Categories",
      "/subcategories": "Sub Categories",
      "/products": "Products",
      "/suppliers": "Suppliers",
      "/profile": "Profile",
    };
    return titles[location.pathname] || "";
  };

  const handleLogout = async () => {
    setLoadingLogout(true);
    await logout({ callApi: true });
    setLoadingLogout(false);
  };

  const handleProfile = () => navigate("/profile");

  return (
    <header
      style={{
        paddingLeft: contentPadding,
        transition: "padding-left 300ms ease-in-out",
      }}
      className="fixed top-0 left-0 right-0 p-4 bg-white shadow-xl"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={handleToggleSidebar}
            className="p-2 rounded-md hover:bg-gray-100 cursor-pointer ml-2 transition focus:outline-none focus:ring-2 focus:ring-amber-300"
            aria-label="Toggle sidebar"
            title="Toggle sidebar"
          >
            <FaBars size={18} className="text-gray-700" />
          </button>

          <h1 className="text-2xl font-bold text-black tracking-wide truncate">
            {getPageTitle().toUpperCase()}
          </h1>
        </div>

        <div
          className="flex items-center gap-3 relative"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <button
            className="flex items-center gap-2 focus:outline-none"
            aria-haspopup="menu"
            aria-expanded={isHovered}
          >
            <FaUserCircle
              size={30}
              className="text-gray-700 hover:text-amber-600 transition"
            />
            <span className="font-medium text-gray-800 hidden sm:inline">
              {userName}
            </span>
            <FaChevronDown className="text-gray-600" />
          </button>

          <div
            className={`absolute right-0 top-12 w-44 rounded-lg shadow-lg transition-all duration-150 origin-top-right ${
              isHovered ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-2"
            }`}
          >
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={handleProfile}
                className="w-full text-left px-4 py-2 text-gray-700 hover:bg-amber-50 hover:text-amber-700 transition"
              >
                Profile
              </button>
              <button
                onClick={handleLogout}
                disabled={loadingLogout}
                className="w-full text-left px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 transition"
              >
                {loadingLogout ? "Logging out..." : "Logout"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
