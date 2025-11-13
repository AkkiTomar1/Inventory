// SubCategories.jsx
import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaSortAmountDown,
  FaEllipsisV,
  FaLayerGroup,
  FaTh,
  FaListUl,
  FaSpinner,
} from "react-icons/fa";
import SubcategoriesForm from "./SubcategoriesForm";

const seedCategories = [
  { id: 1, name: "Food" },
  { id: 2, name: "Beverages" },
  { id: 3, name: "Dairy & Eggs" },
  { id: 4, name: "Household Items" },
];

const seedSubcategories = [
  { id: 1, name: "Rice & Grains", description: "Types of rice and grains", categoryId: 1, productCount: 12, color: "bg-amber-100 text-amber-700" },
  { id: 2, name: "Spices & Masalas", description: "Ground and whole spices", categoryId: 1, productCount: 8, color: "bg-emerald-100 text-emerald-700" },
  { id: 3, name: "Soft Drinks", description: "Cola, soda and drinks", categoryId: 2, productCount: 20, color: "bg-sky-100 text-sky-700" },
  { id: 4, name: "Milk", description: "Packaged and fresh milk", categoryId: 3, productCount: 6, color: "bg-pink-100 text-pink-700" },
];

const SubCategories = () => {
  const [categories] = useState(seedCategories);
  const [subcategories, setSubcategories] = useState(seedSubcategories);

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [sortAsc, setSortAsc] = useState(true);
  const [viewMode, setViewMode] = useState("grid");
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim().toLowerCase()), 250);
    return () => clearTimeout(t);
  }, [query]);

  const filtered = useMemo(() => {
    return subcategories
      .filter((sc) => {
        const q = debouncedQuery;
        if (!q) return true;

        const categoryName = (categories.find((c) => c.id === sc.categoryId)?.name || "").toLowerCase();
        return (
          sc.name.toLowerCase().includes(q) ||
          sc.description.toLowerCase().includes(q) ||
          categoryName.includes(q)
        );
      })
      .sort((a, b) => (sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)));
  }, [subcategories, debouncedQuery, sortAsc, categories]);

  const handleAdd = () => {
    setEditing(null);
    setOpenForm(true);
  };

  const handleEdit = (sc) => {
    setEditing(sc);
    setOpenForm(true);
  };

  const handleDelete = (id) => {
    const sc = subcategories.find((s) => s.id === id);
    if (!sc) return;

    if (window.confirm(`Delete "${sc.name}"?`)) {
      setLoading(true);
      setTimeout(() => {
        setSubcategories((prev) => prev.filter((s) => s.id !== id));
        setLoading(false);
      }, 300);
    }
  };

  const handleSave = (data) => {
    setLoading(true);

    setTimeout(() => {
      if (editing) {
        setSubcategories((prev) =>
          prev.map((s) => (s.id === editing.id ? { ...s, ...data } : s))
        );
      } else {
        const nextId = subcategories.length
          ? Math.max(...subcategories.map((s) => s.id)) + 1
          : 1;

        const newSub = {
          id: nextId,
          ...data,
          productCount: data.productCount ?? 0,
        };

        setSubcategories((prev) => [...prev, newSub]);
      }

      setEditing(null);
      setOpenForm(false);
      setLoading(false);
    }, 400);
  };

  const getCategoryName = (id) =>
    categories.find((c) => c.id === id)?.name || "-";

  return (
    <div className="p-6 rounded-2xl shadow-2xl bg-linear-to-br from-white to-amber-50">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-extrabold text-amber-700">
            <FaLayerGroup className="text-amber-600" />
            Subcategories
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage subcategories with a clean, smooth UI.
          </p>
        </div>

        <button
          onClick={handleAdd}
          className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg shadow"
        >
          <FaPlus /> Add Subcategory
        </button>
      </div>

      {/* SEARCH + SORT */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">

        {/* Search box */}
        <div className="flex items-center bg-white border rounded-xl shadow-sm px-3 py-2 w-full sm:w-[350px]">
          <FaSearch className="text-gray-400" />
          <input
            className="ml-3 w-full outline-none"
            placeholder="Search subcategories..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {/* Sort + View Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSortAsc(!sortAsc)}
            className="px-3 py-2 bg-white border rounded-lg flex items-center gap-2"
          >
            <FaSortAmountDown />
            {sortAsc ? "A → Z" : "Z → A"}
          </button>

          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-lg ${viewMode === "grid" ? "bg-amber-200" : "bg-white border"}`}
          >
            <FaTh />
          </button>

          <button
            onClick={() => setViewMode("table")}
            className={`p-2 rounded-lg ${viewMode === "table" ? "bg-amber-200" : "bg-white border"}`}
          >
            <FaListUl />
          </button>
        </div>
      </div>

      {/* LOADING INDICATOR */}
      {loading && (
        <div className="mb-4 flex items-center gap-2">
          <FaSpinner className="animate-spin text-gray-400" />
          <span className="text-sm">Updating...</span>
        </div>
      )}

      {/* GRID VIEW */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

          <AnimatePresence>
            {filtered.map((sc) => (
              <motion.div
                key={sc.id}
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                className="bg-white rounded-2xl p-5 shadow hover:shadow-lg"
              >
                <div className="flex justify-between">

                  <div>
                    <div
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${sc.color}`}
                    >
                      {sc.name}
                    </div>

                    <p className="text-gray-600 mt-3">{sc.description}</p>

                    <div className="flex flex-wrap gap-2 mt-4 text-xs text-gray-500">
                      <div className="px-2 py-1 bg-gray-100 rounded">
                        {getCategoryName(sc.categoryId)}
                      </div>

                      <div className="px-2 py-1 bg-gray-100 rounded">
                        {sc.productCount} products
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <button onClick={() => handleEdit(sc)} className="p-2 bg-amber-50 rounded-lg">
                      <FaEdit className="text-amber-600" />
                    </button>

                    <button onClick={() => handleDelete(sc.id)} className="p-2 bg-red-50 rounded-lg">
                      <FaTrash className="text-red-600" />
                    </button>
                  </div>

                </div>
              </motion.div>
            ))}
          </AnimatePresence>

        </div>
      )}

      {/* TABLE VIEW */}
      {viewMode === "table" && (
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <table className="min-w-full">

            <thead className="bg-amber-100">
              <tr>
                <th className="px-4 py-3 text-left">ID</th>
                <th className="px-4 py-3 text-left">Subcategory</th>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-left">Description</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((sc) => (
                <tr key={sc.id} className="even:bg-gray-50">

                  <td className="px-4 py-3">{sc.id}</td>
                  <td className="px-4 py-3 font-semibold">{sc.name}</td>
                  <td className="px-4 py-3">{getCategoryName(sc.categoryId)}</td>
                  <td className="px-4 py-3">{sc.description}</td>

                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleEdit(sc)}
                        className="px-3 py-1 bg-amber-50 text-amber-700 rounded"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleDelete(sc.id)}
                        className="px-3 py-1 bg-red-50 text-red-600 rounded"
                      >
                        Delete
                      </button>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* FORM MODAL */}
      <SubcategoriesForm
        open={openForm}
        onClose={() => {
          setOpenForm(false);
          setEditing(null);
        }}
        onSave={handleSave}
        initialData={editing}
        categories={categories}
      />
    </div>
  );
};

export default SubCategories;
