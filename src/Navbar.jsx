import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaUserCircle, FaChevronDown, FaBars } from "react-icons/fa";
import useLogout from "./hooks/useLogout";
import MobileMenu from "./MobileMenu";

const MOBILE_BREAKPOINT = 768;

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const logout = useLogout();

  const [profileHovered, setProfileHovered] = useState(false);
  const [contentPadding, setContentPadding] = useState(
    typeof window !== "undefined" && window.innerWidth < MOBILE_BREAKPOINT ? 0 : 256
  );
  const [loadingLogout, setLoadingLogout] = useState(false);
  const [userName, setUserName] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" && window.innerWidth < MOBILE_BREAKPOINT
  );

  const menuBtnRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      const width = e?.detail?.width ?? 256;
      const final = window.innerWidth < MOBILE_BREAKPOINT ? 0 : Math.max(0, width);
      setContentPadding(final);
    };
    window.addEventListener("sidebarState", handler);
    return () => window.removeEventListener("sidebarState", handler);
  }, []);

  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth < MOBILE_BREAKPOINT;
      setIsMobile(mobile);
      if (!mobile) {
        setMobileMenuOpen(false);
        setContentPadding((curr) => (curr === 0 ? 256 : curr));
      } else {
        setContentPadding(0);
      }
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
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

  const handleMenuButton = () => {
    if (window.innerWidth < MOBILE_BREAKPOINT) {
      setMobileMenuOpen((v) => !v);
    } else {
      window.dispatchEvent(new CustomEvent("toggleSidebar"));
      setMobileMenuOpen(false);
    }
  };

  const handleLogout = async () => {
    setLoadingLogout(true);
    await logout({ callApi: true });
    setLoadingLogout(false);
  };

  const handleProfile = () => navigate("/app/profile");

  const getPageTitle = () => {
    const titles = {
      "/app": "Dashboard",
      "/app/dashboard": "Dashboard",
      "/app/purchase": "Purchase",
      "/app/categories": "Categories",
      "/app/subcategories": "Sub Categories",
      "/app/products": "Products",
      "/app/suppliers": "Suppliers",
      "/app/profile": "Profile",
    };
    return titles[location.pathname] || "";
  };

  return (
    <header
      style={{
        paddingLeft: isMobile ? 0 : contentPadding,
        transition: "padding-left 240ms ease-in-out",
      }}
      className="fixed top-0 left-0 right-0 p-4 bg-[#0f2027] text-gray-100 shadow-xl z-30"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            ref={menuBtnRef}
            onClick={handleMenuButton}
            className="p-2 rounded-md hover:bg-gray-900 cursor-pointer ml-2 transition focus:outline-none focus:ring-2 focus:ring-amber-100"
            aria-label="Toggle menu"
            title="Menu"
          >
            <FaBars size={18} className="text-gray-100" />
          </button>

          <h1 className="text-2xl font-bold text-white tracking-wide truncate">
            {getPageTitle().toUpperCase()}
          </h1>
        </div>

        <div
          className="flex items-center gap-3 relative"
          onMouseEnter={() => setProfileHovered(true)}
          onMouseLeave={() => setProfileHovered(false)}
        >
          <button
            className="flex items-center gap-2 focus:outline-none"
            aria-haspopup="menu"
            aria-expanded={profileHovered}
          >
            <FaUserCircle size={30} className="text-gray-50 hover:text-amber-600 transition" />
            <span className="font-medium text-gray-50 hidden sm:inline">{userName}</span>
            <FaChevronDown className="text-gray-50" />
          </button>

          <div
            className={`absolute right-0 top-12 w-44 rounded-lg shadow-lg transition-all duration-150 origin-top-right ${
              profileHovered ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-2"
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

      <MobileMenu
        open={mobileMenuOpen && isMobile}
        onClose={() => setMobileMenuOpen(false)}
        anchorRef={menuBtnRef}
      />
    </header>
  );
};

export default Navbar;
