import React from "react";
import {
  FaArrowDown,
  FaBan,
  FaRupeeSign,
  FaUser,
  FaCalendarAlt,
  FaRegCalendar,
  FaBoxOpen,
} from "react-icons/fa";
import Table from "./Table";
import Card from "./Card"; // ✅ make sure this path is correct
import { useNavigate } from "react-router-dom";

// Sample Data
const suppliers = [
  { name: "ABC Traders", contact: "+91 98765 43210", rating: 4.6 },
  { name: "SweetCo", contact: "+91 91234 56789", rating: 4.2 },
  { name: "SpiceHouse", contact: "+91 99887 76655", rating: 4.4 },
  { name: "FreshDairy", contact: "+91 91222 33445", rating: 4.3 },
  { name: "GoodGrains", contact: "+91 90000 11122", rating: 4.7 },
];

const products = [
  { id: 1, name: "Basmati Rice", stock: 10, price: "₹500" },
  { id: 2, name: "Sugar", stock: 5, price: "₹200" },
  { id: 3, name: "Mustard Oil", stock: 20, price: "₹1000" },
  { id: 4, name: "Wheat Flour", stock: 8, price: "₹400" },
  { id: 5, name: "Tea", stock: 10, price: "₹800" },
];

// Sparkline helper (simple chart)
const sparkData = {
  today: [3, 5, 4, 6, 8, 7, 10],
  week: [8, 7, 9, 10, 9, 11, 10],
  month: [20, 22, 18, 25, 28, 30, 27],
};

const drawSpark = (data, stroke = "white") => {
  const w = 64;
  const h = 20;
  const max = Math.max(...data) || 1;
  const step = w / (data.length - 1 || 1);
  const points = data.map((d, i) => `${i * step},${h - (d / max) * h}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-20 h-6" aria-hidden>
      <polyline
        points={points}
        fill="none"
        stroke={stroke}
        strokeWidth="1.6"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();

  // Summary calculations
  const totalProducts = products.length;
  const lowStock = products.filter((p) => p.stock <= 8).length;
  const outOfStock = products.filter((p) => p.stock === 0).length;
  const totalSuppliers = suppliers.length;

  const productColumns = [
    { key: "name", label: "Product" },
    { key: "stock", label: "Stock" },
    { key: "price", label: "Price" },
  ];

  const supplierColumns = [
    { key: "name", label: "Supplier" },
    { key: "contact", label: "Contact" },
    { key: "rating", label: "Rating" },
  ];

  return (
    <div className="p-6 pt-4 space-y-8">
      {/* SALES SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          className="relative overflow-hidden rounded-3xl p-5 shadow-2xl"
          style={{ background: "linear-gradient(135deg,#10b981,#059669)" }}
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm text-white/90">Today's Sale</div>
              <div className="mt-2 text-3xl font-extrabold text-white">₹10,000</div>
              <div className="mt-1 text-xs text-white/80">+8.5% vs yesterday</div>
            </div>
            <div className="flex flex-col items-end">
              <div className="p-2 rounded-md bg-white/20 text-white">
                <FaRupeeSign className="text-2xl" />
              </div>
              <div className="mt-3">{drawSpark(sparkData.today)}</div>
            </div>
          </div>
          <div className="absolute -right-8 -bottom-8 opacity-10 text-white text-8xl">💰</div>
        </div>

        <div
          className="relative overflow-hidden rounded-3xl p-5 shadow-2xl"
          style={{ background: "linear-gradient(135deg,#fb923c,#f59e0b)" }}
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm text-white/90">Last Week</div>
              <div className="mt-2 text-3xl font-extrabold text-white">₹72,500</div>
              <div className="mt-1 text-xs text-white/80">-3.2% vs previous week</div>
            </div>
            <div className="flex flex-col items-end">
              <div className="p-2 rounded-md bg-white/20 text-white">
                <FaCalendarAlt className="text-2xl" />
              </div>
              <div className="mt-3">{drawSpark(sparkData.week)}</div>
            </div>
          </div>
          <div className="absolute -right-8 -bottom-8 opacity-10 text-white text-8xl">📅</div>
        </div>

        <div
          className="relative overflow-hidden rounded-3xl p-5 shadow-2xl"
          style={{ background: "linear-gradient(135deg,#60a5fa,#6366f1)" }}
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm text-white/90">Last Month</div>
              <div className="mt-2 text-3xl font-extrabold text-white">₹285,000</div>
              <div className="mt-1 text-xs text-white/80">+12.1% vs previous month</div>
            </div>
            <div className="flex flex-col items-end">
              <div className="p-2 rounded-md bg-white/20 text-white">
                <FaRegCalendar className="text-2xl" />
              </div>
              <div className="mt-3">{drawSpark(sparkData.month)}</div>
            </div>
          </div>
          <div className="absolute -right-8 -bottom-8 opacity-10 text-white text-8xl">📈</div>
        </div>
      </div>

      {/* KPI CARDS USING CARD COMPONENT */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-7">
        <Card
          onClick={() => navigate("/products")}
          title="Total Products"
          value={totalProducts}
          icon={<FaBoxOpen size={22} className="text-amber-600" />}
          iconsbg="bg-amber-100"
          textColor="text-amber-700"
          bgcolor="bg-white"
          cardswidth="w-full"
          cardsheight="h-32"
        />

        <Card
          onClick={() => navigate("/products")}
          title="Low Stock"
          value={lowStock}
          icon={<FaArrowDown size={22} className="text-orange-600" />}
          iconsbg="bg-orange-100"
          textColor="text-orange-700"
          bgcolor="bg-white"
          cardswidth="w-full"
          cardsheight="h-32"
        />

        <Card
          onClick={() => navigate("/products")}
          title="Out of Stock"
          value={outOfStock}
          icon={<FaBan size={22} className="text-red-600" />}
          iconsbg="bg-red-100"
          textColor="text-red-700"
          bgcolor="bg-white"
          cardswidth="w-full"
          cardsheight="h-32"
        />

        <Card
          onClick={() => navigate("/suppliers")}
          title="Suppliers"
          value={totalSuppliers}
          icon={<FaUser size={22} className="text-blue-600" />}
          iconsbg="bg-blue-100"
          textColor="text-blue-700"
          bgcolor="bg-white"
          cardswidth="w-full"
          cardsheight="h-32"
        />


      </div>

      {/* TABLES */}
      <div className="flex justify-between gap-4">
        <div className="bg-white rounded-2xl p-4 shadow-lg w-[48%]">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-bold text-2xl text-gray-800">Top Products</h4>
            <button
              onClick={() => navigate("/products")}
              className="text-sm text-amber-600 hover:underline"
            >
              View all
            </button>
          </div>
          <Table columns={productColumns} data={products} navigateTo="/products" small />
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-lg w-[48%]">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-bold text-2xl text-gray-800">Top Suppliers</h4>
            <button
              onClick={() => navigate("/suppliers")}
              className="text-sm text-amber-600 hover:underline"
            >
              Manage
            </button>
          </div>
          <Table columns={supplierColumns} data={suppliers} navigateTo="/suppliers" small />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
