// src/components/dashboard/Dashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
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
import Card from "./Card";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";

// ---------- small sparkline helper ----------
const drawSpark = (data, stroke = "white") => {
  const w = 64;
  const h = 20;
  const max = Math.max(...data) || 1;
  const step = w / (data.length - 1 || 1);
  const points = data
    .map((d, i) => `${i * step},${h - (d / max) * h}`)
    .join(" ");

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

// ---------- MOCK SALES HOOK ----------
// Assumes some values for today, last week, last month.
// Values change automatically when date / week / month changes.
const useMockSales = () => {
  const [sales, setSales] = useState({
    todaySales: 0,
    lastWeekSales: 0,
    lastMonthSales: 0,
    todayChange: null,
    weekChange: null,
    monthChange: null,
  });

  useEffect(() => {
    const now = new Date();

    // deterministic "seed" from date
    const daySeed =
      now.getFullYear() * 1000 +
      (now.getMonth() + 1) * 50 +
      now.getDate();

    const weekSeed = Math.floor(daySeed / 7);
    const monthSeed =
      now.getFullYear() * 100 + (now.getMonth() + 1);

    // simple pseudo-random-ish functions based on seed
    const rand = (seed, mult, offset, min, max) => {
      const base = (seed * mult + offset) % 1000;
      const range = max - min;
      return Math.round(min + ((base / 1000) * range));
    };

    // assume base values
    const todaySales = rand(daySeed, 37, 17, 7000, 20000); // 7k–20k
    const lastWeekSales = rand(weekSeed, 53, 11, 50000, 120000); // 50k–1.2L
    const lastMonthSales = rand(
      monthSeed,
      91,
      23,
      200000,
      500000
    ); // 2L–5L

    // previous period values (for comparison)
    const yesterdaySales = Math.round(todaySales * 0.9); // assume -10%
    const prevWeekSales = Math.round(lastWeekSales * 0.95); // -5%
    const prevMonthSales = Math.round(
      lastMonthSales * 0.92
    ); // -8%

    const pctChange = (current, previous) => {
      if (!previous || previous === 0) return null;
      return ((current - previous) / previous) * 100;
    };

    setSales({
      todaySales,
      lastWeekSales,
      lastMonthSales,
      todayChange: pctChange(todaySales, yesterdaySales),
      weekChange: pctChange(lastWeekSales, prevWeekSales),
      monthChange: pctChange(lastMonthSales, prevMonthSales),
    });
  }, []); // runs once per mount — values depend on current date

  return sales;
};

const Dashboard = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]); // raw API products
  const [suppliers, setSuppliers] = useState([]); // from API
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);
  const [fetchError, setFetchError] = useState("");

  const {
    todaySales,
    lastWeekSales,
    lastMonthSales,
    todayChange,
    weekChange,
    monthChange,
  } = useMockSales();

  // ---------- PRODUCTS API CALL ----------
  const fetchProducts = async () => {
    setLoadingProducts(true);
    setFetchError("");
    try {
      const res = await axiosInstance.get("/admin/products");
      const list = Array.isArray(res.data)
        ? res.data
        : res.data?.data ?? [];
      setProducts(list);
    } catch (err) {
      console.error("Dashboard fetch products error", err);
      setFetchError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load products"
      );
    } finally {
      setLoadingProducts(false);
    }
  };

  // ---------- SUPPLIERS API CALL ----------
  const fetchSuppliers = async () => {
    setLoadingSuppliers(true);
    try {
      const res = await axiosInstance.get("/admin/suppliers");
      const list = Array.isArray(res.data)
        ? res.data
        : res.data?.data ?? [];
      // schema expected: { id, name, email, phoneNumber, address }
      setSuppliers(list);
    } catch (err) {
      console.error("Dashboard fetch suppliers error", err);
    } finally {
      setLoadingSuppliers(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchSuppliers();
  }, []);

  // ---------- PRODUCTS: NORMALIZATION ----------
  const productRow = (p) => {
    const name =
      p.productName ?? p.name ?? p.title ?? "Unnamed product";
    const stock = Number(
      p.stock ?? p.stockQty ?? p.quantity ?? 0
    );
    const priceN = Number(
      p.discountPrice ?? p.price ?? p.mrp ?? 0
    );
    const price = isNaN(priceN) ? 0 : priceN;
    return { name, stock, price, raw: p };
  };

  const productRows = useMemo(
    () => products.map(productRow),
    [products]
  );

  // ---------- KPI COUNTS ----------
  const totalProducts = productRows.length;
  const lowStockProducts = productRows.filter(
    (r) => r.stock > 0 && r.stock < 10
  );
  const lowStock = lowStockProducts.length;
  const outOfStockProducts = productRows.filter(
    (r) => r.stock === 0
  );
  const outOfStock = outOfStockProducts.length;
  const totalSuppliers = suppliers.length;

  // ---------- TOP 5 PRODUCTS ----------
  const topProducts = useMemo(() => {
    return [...productRows]
      .sort((a, b) => {
        if (b.stock !== a.stock) return b.stock - a.stock;
        return b.price - a.price;
      })
      .slice(0, 5)
      .map((r) => ({
        name: r.name,
        stock: r.stock,
        price: `₹${Number(r.price).toLocaleString("en-IN")}`,
      }));
  }, [productRows]);

  // ---------- TOP 5 SUPPLIERS (simple: first 5 sorted by name) ----------
  const topSuppliers = useMemo(() => {
    const mapped = suppliers.map((s) => ({
      id: s.id,
      name: s.name ?? s.supplierName ?? "Unnamed supplier",
      contact: s.phoneNumber ?? s.phone ?? "",
    }));
    return [...mapped]
      .sort((a, b) => a.name.localeCompare(b.name))
      .slice(0, 5);
  }, [suppliers]);

  const productColumns = [
    { key: "name", label: "Product" },
    { key: "stock", label: "Stock" },
    { key: "price", label: "Price" },
  ];

  const supplierColumns = [
    { key: "name", label: "Supplier" },
    { key: "contact", label: "Contact" },
  ];

  const formatMoney = (v) =>
    `₹${Number(v || 0).toLocaleString("en-IN")}`;

  const formatChangeLabel = (val) => {
    if (val === null) return "No previous data";
    const sign = val >= 0 ? "+" : "";
    return `${sign}${val.toFixed(1)}% vs previous`;
  };

  const loading = loadingProducts || loadingSuppliers;

  return (
    <div className="p-6 pt-4 space-y-8">
      {/* SALES SUMMARY CARDS – MOCK VALUES, TIME-BASED */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Today */}
        <div
          className="overflow-hidden rounded-3xl p-6 shadow-2xl"
          style={{
            background: "linear-gradient(135deg,#10b981,#059669)",
          }}
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm text-white/80">
                Today&apos;s Sale
              </div>
              <div className="mt-2 text-3xl font-extrabold text-white">
                {formatMoney(todaySales)}
              </div>
              <div className="mt-1 text-xs text-white/80">
                {formatChangeLabel(todayChange)}
              </div>
            </div>

            <div className="flex flex-col items-end">
              <div className="p-2 rounded-md bg-white/20 text-white">
                <FaRupeeSign className="text-2xl" />
              </div>
              <div className="mt-3">
                {drawSpark([todaySales || 0, todaySales || 0])}
              </div>
            </div>
          </div>
        </div>

        {/* Last Week (7 days) */}
        <div
          className="overflow-hidden rounded-3xl p-5 shadow-2xl"
          style={{
            background: "linear-gradient(135deg,#fb923c,#f59e0b)",
          }}
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm text-white/90">
                Last Week
              </div>
              <div className="mt-2 text-3xl font-extrabold text-white">
                {formatMoney(lastWeekSales)}
              </div>
              <div className="mt-1 text-xs text-white/80">
                {formatChangeLabel(weekChange)}
              </div>
            </div>

            <div className="flex flex-col items-end">
              <div className="p-2 rounded-md bg-white/20 text-white">
                <FaCalendarAlt className="text-2xl" />
              </div>
              <div className="mt-3">
                {drawSpark([
                  lastWeekSales * 0.9,
                  lastWeekSales || 0,
                ])}
              </div>
            </div>
          </div>
        </div>

        {/* Last Month (30 days) */}
        <div
          className="overflow-hidden rounded-3xl p-5 shadow-2xl"
          style={{
            background: "linear-gradient(135deg,#60a5fa,#6366f1)",
          }}
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm text-white/90">
                Last Month
              </div>
              <div className="mt-2 text-3xl font-extrabold text-white">
                {formatMoney(lastMonthSales)}
              </div>
              <div className="mt-1 text-xs text-white/80">
                {formatChangeLabel(monthChange)}
              </div>
            </div>

            <div className="flex flex-col items-end">
              <div className="p-2 rounded-md bg-white/20 text-white">
                <FaRegCalendar className="text-2xl" />
              </div>
              <div className="mt-5">
                {drawSpark([
                  lastMonthSales * 0.85,
                  lastMonthSales || 0,
                ])}
              </div>
            </div>
          </div>
        </div>
      </div>

      {fetchError && (
        <div className="text-sm text-red-600">{fetchError}</div>
      )}

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-7">
        <Card
          onClick={() => navigate("/app/products")}
          title="Total Products"
          value={loading ? "..." : totalProducts}
          icon={<FaBoxOpen size={22} className="text-amber-600" />}
          iconsbg="bg-amber-100"
          textColor="text-amber-700"
          bgcolor="bg-white"
          cardswidth="w-full"
          cardsheight="h-32"
        />

        <Card
          onClick={() => navigate("/app/products")}
          title="Low Stock"
          value={loading ? "..." : lowStock}
          icon={<FaArrowDown size={22} className="text-orange-600" />}
          iconsbg="bg-orange-100"
          textColor="text-orange-700"
          bgcolor="bg-white"
          cardswidth="w-full"
          cardsheight="h-32"
        />

        <Card
          onClick={() => navigate("/app/products")}
          title="Out of Stock"
          value={loading ? "..." : outOfStock}
          icon={<FaBan size={22} className="text-red-600" />}
          iconsbg="bg-red-100"
          textColor="text-red-700"
          bgcolor="bg-white"
          cardswidth="w-full"
          cardsheight="h-32"
        />

        <Card
          onClick={() => navigate("/app/suppliers")}
          title="Suppliers"
          value={loading ? "..." : totalSuppliers}
          icon={<FaUser size={22} className="text-blue-600" />}
          iconsbg="bg-blue-100"
          textColor="text-blue-700"
          bgcolor="bg-white"
          cardswidth="w-full"
          cardsheight="h-32"
        />
      </div>

      {/* TABLES */}
      <div className="flex flex-col lg:flex-row justify-between gap-4">
        {/* Top Products */}
        <div className="bg-white rounded-2xl p-4 shadow-lg lg:w-[60%]">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-bold text-2xl text-gray-800">
              Top Products
            </h4>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/app/products")}
                className="text-sm text-amber-600 hover:underline"
              >
                View all
              </button>
              <div className="text-sm text-gray-500">
                {loading
                  ? "Loading..."
                  : `${totalProducts} products`}
              </div>
            </div>
          </div>

          <Table columns={productColumns} data={topProducts} />
        </div>

        {/* Top Suppliers */}
        <div className="bg-white rounded-2xl p-4 shadow-lg lg:w-[38%]">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-bold text-2xl text-gray-800">
              Top Suppliers
            </h4>
            <button
              onClick={() => navigate("/app/suppliers")}
              className="text-sm text-amber-600 hover:underline"
            >
              Manage
            </button>
          </div>

          <Table columns={supplierColumns} data={topSuppliers} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
