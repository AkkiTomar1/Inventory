import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  FaBoxes,
  FaSearch,
  FaSortAmountDown,
  FaTh,
  FaListUl,
  FaSpinner,
  FaPlus,
} from "react-icons/fa";
import CategoryForm from "./CategoryForm"; // <-- your form file

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false); // list loading
  const [saving, setSaving] = useState(false); // save button loading
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [sortAsc, setSortAsc] = useState(true);
  const [viewMode, setViewMode] = useState("grid");
  const [showModal, setShowModal] = useState(false);

  // Build auth header if token exists
  const getAuthHeaders = () => {
    const token = localStorage.getItem("accessToken");
    const tokenType = localStorage.getItem("tokenType") || "Bearer";
    return token ? { Authorization: `${tokenType} ${token}` } : {};
  };

  // Clear session if unauthorized
  const clearSessionAndRedirect = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  // Fetch categories
  const fetchCategories = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get("/admin/categories", {
        headers: getAuthHeaders(),
      });
      const data = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
        ? res.data.data
        : [];
      setCategories(data);
    } catch (err) {
      if (err?.response?.status === 401) {
        clearSessionAndRedirect();
        return;
      }
      setError(err?.response?.data?.message || "Failed to load categories");
      console.error("fetchCategories error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, );

  const getCounts = (category) => {
    let subCount = 0;
    let prodCount = 0;
    if (Array.isArray(category?.subcategories)) {
      subCount = category.subcategories.length;
      category.subcategories.forEach((sc) => {
        if (Array.isArray(sc.products)) prodCount += sc.products.length;
      });
    }
    return { subCount, prodCount };
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = categories.filter((c) => {
      if (!q) return true;
      const catMatch =
        (c.categoryName || "").toLowerCase().includes(q) ||
        (c.categoryDescription || "").toLowerCase().includes(q);
      return catMatch;
    });
    // copy before sorting
    return [...list].sort((a, b) =>
      sortAsc
        ? (a.categoryName || "").localeCompare(b.categoryName || "")
        : (b.categoryName || "").localeCompare(a.categoryName || "")
    );
  }, [categories, search, sortAsc]);

  // Called by CategoryForm when user saves — parent uses axios to save
  const handleAddCategory = async (formData) => {
    // formData: { name, description, productCount, color }
    setSaving(true);
    try {
      const payload = {
        categoryName: formData.name,
        categoryDescription: formData.description,
        productCount: formData.productCount ?? 0,
        color: formData.color,
        isActive: true,
      };

      await axios.post("/admin/categories", payload, {
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
      });

      setShowModal(false);
      await fetchCategories();
    } catch (err) {
      if (err?.response?.status === 401) {
        clearSessionAndRedirect();
        return;
      }
      console.error("Add category error:", err);
      alert(err?.response?.data?.message || "Failed to add category");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 mt-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-50 rounded-lg">
            <FaBoxes className="text-amber-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Categories</h1>
            <p className="text-sm text-gray-500 mt-1">Manage and add new categories</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition"
          >
            <FaPlus /> Add Category
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm w-full sm:w-[360px]">
            <FaSearch className="text-gray-400" />
            <input
              className="ml-3 w-full outline-none"
              placeholder="Search categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <button
            onClick={() => setSortAsc((v) => !v)}
            className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 bg-white hover:bg-gray-50"
          >
            <FaSortAmountDown />
            <span className="text-sm">{sortAsc ? "A → Z" : "Z → A"}</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setViewMode("grid")}
            className={`px-3 py-2 rounded-lg ${
              viewMode === "grid" ? "bg-amber-100 font-semibold" : "bg-white border border-gray-200"
            }`}
          >
            <FaTh />
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={`px-3 py-2 rounded-lg ${
              viewMode === "table" ? "bg-amber-100 font-semibold" : "bg-white border border-gray-200"
            }`}
          >
            <FaListUl />
          </button>
          <button
            onClick={fetchCategories}
            className="px-3 py-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50"
          >
            {loading ? <FaSpinner className="animate-spin" /> : "Refresh"}
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <FaSpinner className="animate-spin text-amber-500 text-3xl" />
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-700 p-4 rounded">{error}</div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.length === 0 ? (
            <div className="col-span-full text-center py-20 bg-white rounded-2xl shadow">
              <div className="text-2xl text-gray-600 mb-3">No categories found</div>
              <p className="text-gray-500">Try adjusting your search or reload data.</p>
            </div>
          ) : (
            filtered.map((cat) => {
              const { subCount, prodCount } = getCounts(cat);
              return (
                <div
                  key={cat.categoryId || cat.categoryName}
                  className="bg-white rounded-2xl p-5 shadow hover:shadow-lg transition"
                >
                  <div className="flex flex-col gap-2">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {cat.categoryName || "Unnamed"}
                    </h3>
                    <p className="text-sm text-gray-600">{cat.categoryDescription || "-"}</p>
                    <div className="flex gap-3 text-xs text-gray-500">
                      <span>Subs: {subCount}</span>
                      <span>Products: {prodCount}</span>
                      <span>Active: {cat.isActive ? "Yes" : "No"}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-amber-100">
              <tr>
                <th className="text-left px-4 py-3 text-sm text-gray-700">#</th>
                <th className="text-left px-4 py-3 text-sm text-gray-700">Category</th>
                <th className="text-left px-4 py-3 text-sm text-gray-700">Description</th>
                <th className="text-center px-4 py-3 text-sm text-gray-700">Active</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((cat, idx) => (
                <tr key={idx} className={idx % 2 ? "bg-gray-50" : ""}>
                  <td className="px-4 py-3">{idx + 1}</td>
                  <td className="px-4 py-3 font-semibold">{cat.categoryName}</td>
                  <td className="px-4 py-3 text-gray-600">{cat.categoryDescription}</td>
                  <td className="px-4 py-3 text-center">{cat.isActive ? "Yes" : "No"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Render CategoryForm directly (CategoryForm itself renders the modal overlay) */}
      {showModal && (
        <CategoryForm
          open={showModal}
          onClose={() => setShowModal(false)}
          onSave={handleAddCategory} // parent performs axios POST
          saving={saving} // pass saving so form can disable inputs/buttons
        />
      )}

      {/* Show small saving indicator if desired */}
      {saving && (
        <div className="fixed bottom-4 right-4 bg-black/70 text-white px-3 py-2 rounded">
          Saving...
        </div>
      )}
    </div>
  );
};

export default Categories;
