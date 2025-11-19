import React, { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaTachometerAlt,
  FaBoxes,
  FaBoxOpen,
  FaTruck,
  FaUserCircle,
  FaLayerGroup,
  FaShoppingCart,
} from "react-icons/fa";

const MENU = [
  { name: "Dashboard", icon: <FaTachometerAlt />, path: "/app/dashboard" },
  { name: "Purchase", icon: <FaShoppingCart />, path: "/app/purchase" },
  { name: "Categories", icon: <FaBoxes />, path: "/app/categories" },
  { name: "Sub Categories", icon: <FaLayerGroup />, path: "/app/subcategories" },
  { name: "Products", icon: <FaBoxOpen />, path: "/app/products" },
  { name: "Suppliers", icon: <FaTruck />, path: "/app/suppliers" },
  { name: "Profile", icon: <FaUserCircle />, path: "/app/profile" },
];

const MobileMenu = ({ open, onClose, anchorRef }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const panelRef = useRef(null);

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  useEffect(() => {
    if (!open) return;

    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    const onDocClick = (e) => {
      if (!panelRef.current) return;
      if (panelRef.current.contains(e.target)) return;
      if (anchorRef?.current && anchorRef.current.contains(e.target)) return;
      onClose();
    };

    document.addEventListener("keydown", onKey);
    document.addEventListener("click", onDocClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onDocClick);
    };
  }, [open, onClose, anchorRef]);

  if (!open) return null;

  const handleNav = (path) => {
    navigate(path);
    onClose();
  };

  if (isMobile) {
    return (
      <>
        <div className="fixed inset-0 z-40 bg-black/40" />
        <div
          ref={panelRef}
          className="fixed left-0 right-0 bottom-0 z-50 bg-white rounded-t-2xl shadow-2xl border-t border-gray-100 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="text-lg font-semibold">Menu</div>
            <button onClick={onClose} className="px-3 py-1 rounded-md border">
              Close
            </button>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {MENU.map((item) => {
              const active = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => handleNav(item.path)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-lg transition ${
                    active ? "bg-amber-50" : "hover:bg-gray-50"
                  }`}
                >
                  <div className="text-2xl text-amber-600">{item.icon}</div>
                  <div className="text-xs text-gray-700 text-center">{item.name}</div>
                </button>
              );
            })}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-transparent" />
      <div
        ref={panelRef}
        className="absolute z-50 mt-2 right-4 transform translate-y-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100"
        style={{ top: (anchorRef?.current?.getBoundingClientRect()?.bottom ?? 56) + 8 }}
      >
        <div className="p-3 grid grid-cols-1 gap-1">
          {MENU.map((item) => {
            const active = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => handleNav(item.path)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-left transition ${
                  active ? "bg-amber-50" : "hover:bg-gray-50"
                }`}
              >
                <div className="text-amber-600 text-lg">{item.icon}</div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-700">{item.name}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default MobileMenu;
