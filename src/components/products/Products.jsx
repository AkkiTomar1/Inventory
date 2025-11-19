// src/components/products/Products.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  FaPlus,
  FaSpinner,
  FaTh,
  FaListUl,
  FaSearch,
  FaBoxes,
  FaChevronDown,
} from "react-icons/fa";
import ProductForm from "./ProductForm";
import axiosInstance from "../../api/axiosInstance";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [sortAsc, setSortAsc] = useState(true);
  const [viewMode, setViewMode] = useState("table");

  // active subcategory filter
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState("");

  // stock filter: "", "in", "low", "out"
  const [stockFilter, setStockFilter] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // dropdown open state
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const clearSessionAndRedirect = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  // ---------- API CALLS ----------
  const fetchProducts = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axiosInstance.get("/admin/products");
      const baseList = Array.isArray(res.data) ? res.data : res.data?.data ?? [];

      const listWithSupplier = await Promise.all(
        baseList.map(async (p) => {
          const id = p.productId ?? p.id;
          if (!id) return p;
          if (p.supplierName) return p;

          try {
            const detailRes = await axiosInstance.get(`/admin/products/${encodeURIComponent(id)}`);
            const detail = Array.isArray(detailRes.data) ? detailRes.data[0] : detailRes.data?.data || detailRes.data || {};
            return {
              ...p,
              supplierName: detail.supplierName != null ? detail.supplierName : p.supplierName ?? null,
            };
          } catch (err) {
            console.error("fetch single product error", err);
            return p;
          }
        })
      );

      setProducts(listWithSupplier);
    } catch (err) {
      console.error("fetchProducts error", err);
      if (err?.response?.status === 401) {
        clearSessionAndRedirect();
        return;
      }
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axiosInstance.get("/admin/product-categories");
      const listRaw = res.data?.data || res.data || [];
      const list = Array.isArray(listRaw) ? listRaw : [];
      setCategories(
        list.map((c) => ({
          categoryId: c.categoryId ?? c.id ?? null,
          categoryName: c.categoryName ?? c.name ?? "",
        }))
      );
    } catch (err) {
      console.error("fetchCategories error", err);
    }
  };

  const fetchSubcategories = async () => {
    try {
      const res = await axiosInstance.get("/admin/subcategories");
      const raw = Array.isArray(res.data) ? res.data : res.data?.data || [];
      const list = raw.map((s) => ({
        id: s.id,
        name: s.name,
        categoryId: s.categoryId,
        categoryName: s.categoryName,
      }));
      setSubcategories(list);
    } catch (err) {
      console.error("fetchSubcategories error", err);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const res = await axiosInstance.get("/admin/suppliers");
      const raw = Array.isArray(res.data) ? res.data : res.data?.data || [];
      const list = raw.map((s) => ({ id: s.id, name: s.name }));
      setSuppliers(list);
    } catch (err) {
      console.error("fetchSuppliers error", err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchSubcategories();
    fetchSuppliers();
    // click outside to close dropdown
    const onDocClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- HELPERS ----------
  const productToTitle = (p) => p.productName ?? p.name ?? "Unnamed product";

  const stockBadge = (stockVal) => {
    const stock = Number(stockVal ?? 0);
    if (stock <= 0) return { text: "Out", className: "bg-red-100 text-red-700" };
    if (stock < 10) return { text: "Low", className: "bg-orange-100 text-orange-700" };
    return { text: "In Stock", className: "bg-green-100 text-green-700" };
  };

  const getCategoryName = (p) => {
    if (p.categoryName) return p.categoryName;
    const cid = p.categoryId ?? null;
    if (cid == null) return "-";
    const found = categories.find((c) => String(c.categoryId) === String(cid));
    return found?.categoryName || "-";
  };

  const getSubCategoryName = (p) => {
    if (p.subCategoryName) return p.subCategoryName;
    const sid = p.subCategoryId ?? null;
    if (sid == null) return "-";
    const found = subcategories.find((s) => String(s.id) === String(sid));
    return found?.name || "-";
  };

  const getSupplierName = (p) => p.supplierName || "-";

  const currentSubcategoryName =
    selectedSubcategoryId &&
    subcategories.find((s) => String(s.id) === String(selectedSubcategoryId))?.name
      ? subcategories.find((s) => String(s.id) === String(selectedSubcategoryId))?.name
      : "All Products";

  // ---------- FILTER + SORT ----------
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = [...products];

    if (selectedSubcategoryId) {
      list = list.filter((p) => p.subCategoryId != null && String(p.subCategoryId) === String(selectedSubcategoryId));
    }

    if (stockFilter) {
      list = list.filter((p) => {
        const stock = Number(p.stock ?? 0);
        if (stockFilter === "out") return stock <= 0;
        if (stockFilter === "low") return stock > 0 && stock < 10;
        if (stockFilter === "in") return stock >= 10;
        return true;
      });
    }

    if (q) {
      list = list.filter((p) => {
        const name = (p.productName ?? "").toString().toLowerCase();
        const price = (p.price ?? "").toString().toLowerCase();
        const catName = getCategoryName(p).toLowerCase();
        const subName = getSubCategoryName(p).toLowerCase();
        const supplier = getSupplierName(p).toLowerCase();
        return name.includes(q) || price.includes(q) || catName.includes(q) || subName.includes(q) || supplier.includes(q);
      });
    }

    return list.sort((a, b) =>
      sortAsc ? (productToTitle(a) || "").localeCompare(productToTitle(b) || "") : (productToTitle(b) || "").localeCompare(productToTitle(a) || "")
    );
  }, [products, search, sortAsc, categories, subcategories, selectedSubcategoryId, stockFilter]);

  // ---------- HANDLERS ----------
  const openCreate = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  const openEdit = (p) => {
    const form = {
      productId: p.productId ?? p.id ?? null,
      productName: p.productName ?? "",
      price: p.price ?? 0,
      stock: p.stock ?? 0,
      categoryId: p.categoryId ?? null,
      subCategoryId: p.subCategoryId ?? null,
      supplierName: p.supplierName ?? "",
    };
    setEditingProduct(form);
    setShowForm(true);
  };

  const handleSave = async (data) => {
    setSaving(true);
    setError("");
    try {
      const isEdit = !!data.productId;
      const category = categories.find((c) => data.categoryId != null && String(c.categoryId) === String(data.categoryId));
      const subcat = subcategories.find((s) => data.subCategoryId != null && String(s.id) === String(data.subCategoryId));
      const payload = {
        productId: data.productId ?? 0,
        productName: data.productName,
        price: Number(data.price),
        stock: Number(data.stock),
        categoryId: data.categoryId != null ? Number(data.categoryId) : 0,
        categoryName: category?.categoryName || "",
        subCategoryId: data.subCategoryId != null ? Number(data.subCategoryId) : 0,
        subCategoryName: subcat?.name || "",
        supplierName: data.supplierName || "",
      };
      if (isEdit) {
        await axiosInstance.put(`/admin/products/${encodeURIComponent(data.productId)}`, payload);
      } else {
        await axiosInstance.post("/admin/products", payload);
      }
      await fetchProducts();
      setShowForm(false);
      setEditingProduct(null);
    } catch (err) {
      console.error("save product error", err);
      if (err?.response?.status === 401) {
        clearSessionAndRedirect();
        return;
      }
      setError(err?.response?.data?.message || "Failed to save product");
      alert(err?.response?.data?.message || "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (p) => {
    const id = p.productId ?? p.id;
    if (!id) return alert("Invalid product id");
    if (!window.confirm(`Delete product "${productToTitle(p)}"? This cannot be undone.`)) return;
    setSaving(true);
    try {
      await axiosInstance.delete(`/admin/products/${encodeURIComponent(id)}`);
      await fetchProducts();
    } catch (err) {
      console.error("delete product error", err);
      if (err?.response?.status === 401) {
        clearSessionAndRedirect();
        return;
      }
      alert(err?.response?.data?.message || "Failed to delete product");
    } finally {
      setSaving(false);
    }
  };

  // ---------- UI ----------
  const stockLabel = stockFilter === "" ? "All" : stockFilter === "in" ? "In" : stockFilter === "low" ? "Low" : "Out";

  return (
    <div>
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center bg-[linear-gradient(135deg,#fb923c,#60a5fa)] text-amber-200 md:justify-between rounded-t-2xl p-3">
        <div className="flex items-center gap-4">
          <div className="rounded-lg bg-amber-50 p-3 flex items-center justify-center">
            <FaBoxes className="text-amber-600 text-xl" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-100">Products</h1>
            <p className="text-sm text-gray-50 mt-1">Manage products with price, stock, categories & suppliers.</p>
            <p className="text-xs text-gray-100/90 mt-1">Active Subcategory: <span className="font-semibold">{currentSubcategoryName}</span></p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-4 bg-white p-2 rounded-xl shadow-sm text-gray-700">
            <div className="text-sm text-gray-600">
              <div className="text-xs text-gray-400">Products</div>
              <div className="text-lg font-semibold">{filtered.length}</div>
            </div>
            <div className="border-l h-8" />
            <div className="text-sm text-gray-600">
              <div className="text-xs text-gray-400">Subcategories</div>
              <div className="text-lg font-semibold">{subcategories.length}</div>
            </div>
          </div>

          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-black hover:bg-amber-500 transition">
            <FaPlus /> Add Product
          </button>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="bg-[linear-gradient(135deg,#fb923c,#60a5fa)] text-black rounded-b-2xl p-4 shadow-sm mb-12">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* Search + Sort */}
          <div className="flex items-center gap-3 w-full sm:w-[480px]">
            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 w-full">
              <FaSearch className="text-gray-400" />
              <input className="ml-3 w-full outline-none text-sm" placeholder="Search products, category, subcategory or supplier..." value={search} onChange={(e) => setSearch(e.target.value)} />
              {search && <button onClick={() => setSearch("")} className="ml-2 text-xs text-gray-500">Clear</button>}
            </div>
            <button onClick={() => setSortAsc((v) => !v)} className="flex items-center justify-center gap-1 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-black transition shadow-sm">
              <span className="font-semibold text-sm">{sortAsc ? "A→Z" : "Z→A"}</span>
            </button>
          </div>

          {/* Subcategory select + unified dropdown (stock + view) */}
          <div className="flex items-center gap-2">
            <select className="px-3 py-2 rounded-lg bg-white border border-gray-200 text-sm" value={selectedSubcategoryId} onChange={(e) => setSelectedSubcategoryId(e.target.value)}>
              <option value="">All Products</option>
              {subcategories.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>

            {/* Unified dropdown */}
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-gray-200 text-sm"
              >
                <span className="font-medium">{stockLabel}</span>
                <FaChevronDown />
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <div className="p-2">
                    <div className="text-xs text-gray-500 mb-2">Stock filter</div>
                    <div className="flex flex-col gap-1">
                      <button onClick={() => { setStockFilter(""); setMenuOpen(false); }} className={`text-left px-3 py-2 rounded ${stockFilter === "" ? "bg-amber-100 font-semibold" : "hover:bg-gray-50"}`}>All</button>
                      <button onClick={() => { setStockFilter("in"); setMenuOpen(false); }} className={`text-left px-3 py-2 rounded ${stockFilter === "in" ? "bg-amber-100 font-semibold" : "hover:bg-gray-50"}`}>In Stock</button>
                      <button onClick={() => { setStockFilter("low"); setMenuOpen(false); }} className={`text-left px-3 py-2 rounded ${stockFilter === "low" ? "bg-amber-100 font-semibold" : "hover:bg-gray-50"}`}>Low Stock</button>
                      <button onClick={() => { setStockFilter("out"); setMenuOpen(false); }} className={`text-left px-3 py-2 rounded ${stockFilter === "out" ? "bg-amber-100 font-semibold" : "hover:bg-gray-50"}`}>Out of Stock</button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* small view buttons kept for quick access (optional) */}
            <button onClick={() => setViewMode("grid")} className={`px-3 py-2 rounded-lg ${viewMode === "grid" ? "bg-amber-300 font-semibold" : "bg-white border border-gray-200"}`}>
              <FaTh />
            </button>
            <button onClick={() => setViewMode("table")} className={`px-3 py-2 rounded-lg ${viewMode === "table" ? "bg-amber-300 font-semibold" : "bg-white border border-gray-200"}`}>
              <FaListUl />
            </button>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      {loading ? (
        <div className="py-10 flex justify-center">
          <FaSpinner className="animate-spin text-amber-500 text-2xl" />
        </div>
      ) : viewMode === "grid" ? (
        filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow">
            <div className="text-2xl text-gray-600 mb-3">{error || "No products found"}</div>
            {!error && <p className="text-gray-500">Try adjusting your search or switch subcategory filter.</p>}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filtered.map((p, idx) => {
              const id = p.productId ?? p.id ?? idx;
              const title = productToTitle(p);
              const price = Number(p.price ?? 0);
              const stock = Number(p.stock ?? 0);
              const badge = stockBadge(stock);
              const categoryName = getCategoryName(p);
              const subCategoryName = getSubCategoryName(p);
              const supplierName = getSupplierName(p);

              return (
                <div key={id} className="p-4 bg-white rounded-2xl shadow hover:shadow-lg transition flex flex-col justify-between h-full">
                  <div>
                    <div className="font-semibold text-lg truncate">{title}</div>
                    <div className="mt-1 text-xs text-gray-600 space-y-0.5">
                      <div>Category: <span className="font-medium">{categoryName}</span></div>
                      <div>Subcategory: <span className="font-medium">{subCategoryName}</span></div>
                      <div>Supplier: <span className="font-medium">{supplierName}</span></div>
                    </div>
                    <div className="mt-2 text-sm text-gray-700">Price: <span className="font-semibold text-amber-700">₹{price.toLocaleString("en-IN")}</span></div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${badge.className}`}>{badge.text}</span>
                      <span>Stock: <span className="font-semibold text-gray-900">{stock}</span></span>
                    </div>

                    <div className="flex gap-2">
                      <button onClick={() => openEdit(p)} className="px-3 py-1 bg-amber-100 text-amber-700 rounded text-sm">Edit</button>
                      <button onClick={() => handleDelete(p)} className="px-3 py-1 bg-red-50 text-red-600 rounded text-sm">Delete</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        <div className="bg-white rounded-2xl shadow overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-linear-to-l from-amber-900 via-amber-950 to-amber-900">
              <tr>
                <th className="text-left px-3 py-2 text-xs text-gray-100">Id</th>
                <th className="text-left px-3 py-2 text-xs text-gray-100">Product</th>
                <th className="text-left px-3 py-2 text-xs text-gray-100">Category</th>
                <th className="text-left px-3 py-2 text-xs text-gray-100">Subcategory</th>
                <th className="text-left px-3 py-2 text-xs text-gray-100">Supplier</th>
                <th className="text-right px-3 py-2 text-xs text-gray-100">Price</th>
                <th className="text-left px-3 py-2 text-xs text-gray-100">Stock</th>
                <th className="text-center px-3 py-2 text-xs text-gray-100">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-3 py-6 text-center text-sm text-gray-500">{error || "No products found"}</td>
                </tr>
              ) : (
                filtered.map((p, i) => {
                  const title = productToTitle(p);
                  const price = Number(p.price ?? 0);
                  const stock = Number(p.stock ?? 0);
                  const categoryName = getCategoryName(p);
                  const subCategoryName = getSubCategoryName(p);
                  const supplierName = getSupplierName(p);

                  return (
                    <tr key={p.productId ?? p.id ?? i} className={i % 2 ? "bg-gray-50" : "bg-white"}>
                      <td className="px-3 py-2">{i + 1}</td>
                      <td className="px-3 py-2 font-medium">{title}</td>
                      <td className="px-3 py-2">{categoryName}</td>
                      <td className="px-3 py-2">{subCategoryName}</td>
                      <td className="px-3 py-2">{supplierName}</td>
                      <td className="px-3 py-2 text-right">₹{price.toLocaleString("en-IN")}</td>
                      <td className="px-3 py-2"><span className={`px-2 py-0.5 rounded-full text-xs ${stock <= 0 ? "bg-red-100 text-red-700" : stock < 10 ? "bg-orange-100 text-orange-700" : "bg-green-100 text-green-700"}`}>{stock}</span></td>
                      <td className="px-3 py-2 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => openEdit(p)} className="text-amber-600 hover:text-amber-800 text-sm">Edit</button>
                          <button onClick={() => handleDelete(p)} className="text-red-600 hover:text-red-800 text-sm">Delete</button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL FORM */}
      {showForm && (
        <ProductForm
          open={showForm}
          onClose={() => {
            setShowForm(false);
            setEditingProduct(null);
          }}
          onSave={handleSave}
          initialData={editingProduct}
          categories={categories}
          subcategories={subcategories}
          suppliers={suppliers}
        />
      )}

      {saving && <div className="fixed bottom-4 right-4 bg-black/80 text-white px-3 py-2 rounded text-sm">Saving...</div>}
    </div>
  );
};

export default Products;
