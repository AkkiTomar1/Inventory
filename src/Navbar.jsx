import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaUserCircle, FaChevronDown, FaBars } from "react-icons/fa";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  // padding that pushes header content right to match sidebar width
  const [contentPadding, setContentPadding] = useState(256);

  useEffect(() => {
    const handler = (e) => {
      const detail = e?.detail ?? {};
      const width = typeof detail.width === "number" ? detail.width : 256;
      setContentPadding(Math.max(0, width));
    };
    window.addEventListener("sidebarState", handler);

    // cleanup
    return () => window.removeEventListener("sidebarState", handler);
  }, []);

  const handleToggleSidebar = () => {
    window.dispatchEvent(new CustomEvent("toggleSidebar"));
  };

  const getPageTitle = () => {
    switch (location.pathname) {
      case "/":
        return "Dashboard";
      case "/dashboard":
        return "Dashboard";
      case "/categories":
        return "Categories";
      case "/subcategories":
        return "Sub Categories";
      case "/products":
        return "Products";
      case "/suppliers":
        return "Suppliers";
      case "/profile":
        return "Profile";
      default:
        return "";
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleProfile = () => navigate("/profile");

  return (
    <header
      // keep header full width; shift its content with paddingLeft so title remains visible
      style={{
        paddingLeft: contentPadding,
        transition: "padding-left 300ms ease-in-out",
      }}
      className="fixed top-0 left-0 right-0  p-4 bg-white shadow-xl"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={handleToggleSidebar}
            className="p-2 rounded-md hover:bg-gray-100 cursor-pointer ml-2  transition focus:outline-none focus:ring-2 focus:ring-amber-300"
            aria-label="Toggle sidebar"
            title="Toggle sidebar"
          >
            <FaBars size={18} className="text-gray-700 " />
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
          <button className="flex items-center gap-2 focus:outline-none" aria-haspopup="menu" aria-expanded={isHovered}>
            <FaUserCircle size={28} className="text-gray-700 hover:text-amber-600 transition" />
            <span className="font-medium text-gray-800 hidden sm:inline">Akhilesh Singh</span>
            <FaChevronDown className="text-gray-600" />
          </button>

          <div
            className={`absolute right-0 top-12 w-40 rounded-lg shadow-lg transition-all duration-150 origin-top-right ${
              isHovered ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-2"
            }`}
          >
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={handleProfile}
                className="w-full text-left px-3 py-2 text-gray-700 hover:bg-linear-to-l from-indigo-400 to-purple-400 cursor-pointer transition"
              >
                Profile
              </button>
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 text-gray-700 hover:bg-linear-to-l from-indigo-400 to-purple-400 cursor-pointer transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
