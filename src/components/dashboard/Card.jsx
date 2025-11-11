import React from "react";
import { FaBoxOpen } from "react-icons/fa";
import { FiArrowUpRight } from "react-icons/fi";

const Card = ({
  title,
  value,
  icon,
  textColor = "text-gray-900",
  iconsbg = "bg-gray-100",
  cardswidth = "w-full",
  cardsheight = "h-40",
  onClick,
  bgcolor = "bg-white",
}) => {
  return (
    <div
      onClick={onClick}
      className={`${cardswidth} ${cardsheight} ${bgcolor} cursor-pointer rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex items-center justify-between px-6 py-5`}
    >
      {/* Left side */}
      <div className="flex items-center gap-4">
        <div className={`${iconsbg} p-3 rounded-xl shadow-sm`}>
          {icon || <FaBoxOpen size={22} className="text-gray-600" />}
        </div>
        <div>
          <h2 className="text-md font-bold text-gray-500 uppercase tracking-wide">
            {title}
          </h2>
          <p className={`text-3xl font-extrabold mt-1 ${textColor}`}>{value}</p>
        </div>
      </div>

      {/* Right arrow */}
      <div className="flex items-center justify-center bg-gray-50 rounded-full p-2">
        <FiArrowUpRight size={18} className="text-gray-500" />
      </div>
    </div>
  );
};

export default Card;
