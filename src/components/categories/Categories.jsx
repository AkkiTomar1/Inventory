import React, { useMemo, useState } from "react";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaSortAmountDown,
  FaEllipsisV,
  FaBoxes,
  FaTh,
  FaListUl,
} from "react-icons/fa";
import CategoryForm from "./CategoryForm";

/**
 * Polished, responsive Categories component
 * - Grid of cards (responsive)
 * - Header with stats + add button
 * - Search + Sort controls
 * - Edit / Delete actions on each card
 * - Uses local state (seed data) like your original
 */

const seed = [
  {
    id: 1,
    name: "Beverages",
    description: "Soft drinks, coffee, tea",
    productCount: 24,
    color: "bg-amber-100 text-amber-700",
  },
  {
    id: 2,
    name: "Snacks",
    description: "Chips, biscuits, and munchies",
    productCount: 41,
    color: "bg-emerald-100 text-emerald-700",
  },
  {
    id: 3,
    name: "Dairy",
    description: "Milk, butter, and cheese",
    productCount: 18,
    color: "bg-sky-100 text-sky-700",
  },
];

const Categories=() =>{
  const [categories, setCategories] = useState(seed);
  const [search, setSearch] = useState("");
  const [sortAsc, setSortAsc] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'table' (keeps compatibility if you want table later)

  const filtered = useMemo(() => {
    return categories
      .filter(
        (cat) =>
          cat.name.toLowerCase().includes(search.toLowerCase()) ||
          cat.description.toLowerCase().includes(search.toLowerCase())
      )
      .sort((a, b) =>
        sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
      );
  }, [categories, search, sortAsc]);

  const totalCategories = categories.length;
  const totalProducts = categories.reduce((s, c) => s + (c.productCount || 0), 0);

  const handleAdd = () => {
    setEditing(null);
    setOpenForm(true);
  };

  const handleEdit = (cat) => {
    setEditing(cat);
    setOpenForm(true);
  };

  const handleDelete = (id) => {
    if (
      !window.confirm(
        "Delete this category? This will not delete products but will unlink them."
      )
    )
      return;
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  const handleSave = (formData) => {
    if (editing) {
      setCategories((prev) =>
        prev.map((c) => (c.id === editing.id ? { ...c, ...formData } : c))
      );
    } else {
      const nextId = categories.length ? Math.max(...categories.map((c) => c.id)) + 1 : 1;
      const newCategory = {
        id: nextId,
        name: formData.name,
        description: formData.description,
        productCount: formData.productCount ?? 0,
        color: formData.color || "bg-amber-100 text-amber-700",
      };
      setCategories((prev) => [...prev, newCategory]); // append to bottom
    }
    setOpenForm(false);
    setEditing(null);
  };

  return (
    <div className="p-6 shadow-2xl rounded-2xl mt-15">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-bold text-gray-800">
            <FaBoxes className="text-amber-600" />
            Categories
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage product categories for your grocery store.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex gap-4 bg-white p-3 rounded-2xl shadow-sm items-center">
            <div className="text-sm text-gray-600">
              <div className="text-xs text-gray-400">Categories</div>
              <div className="text-lg font-semibold">{totalCategories}</div>
            </div>
            <div className="border-l h-8" />
            <div className="text-sm text-gray-600">
              <div className="text-xs text-gray-400">Products (est.)</div>
              <div className="text-lg font-semibold">{totalProducts}</div>
            </div>
          </div>

          <button
            onClick={handleAdd}
            className="flex items-center gap-2 bg-linear-to-r from-amber-500 to-amber-600 text-white px-4 py-2 rounded-lg shadow hover:scale-[1.02] transition-transform"
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
              placeholder="Search categories or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <button
            onClick={() => setSortAsc((v) => !v)}
            className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 bg-white hover:bg-gray-50 shadow-sm"
            title="Toggle name sort"
          >
            <FaSortAmountDown />
            <span className="text-sm">
              {sortAsc ? "A → Z" : "Z → A"}
            </span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setViewMode("grid")}
            className={`px-3 py-2 rounded-lg cursor-pointer ${viewMode === "grid" ? "bg-amber-100 font-semibold" : "bg-white border border-gray-200"}`}
            title="Grid view"
          >
            <FaTh/>
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={`px-3 py-2 cursor-pointer rounded-lg ${viewMode === "table" ? "bg-amber-100 font-semibold" : "bg-white border border-gray-200"}`}
            title="Table view (compact)"
          >
            <FaListUl/>
          </button>
        </div>
      </div>

      {/* Content */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((cat) => (
            <div key={cat.id} className="relative bg-white rounded-2xl p-5 shadow hover:shadow-lg transition">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${cat.color}`}>
                    {cat.name}
                  </div>

                  <p className="mt-3 text-sm text-gray-600">{cat.description}</p>

                  <div className="mt-4 flex items-center gap-3 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full" />
                      <span>{cat.productCount ?? 0} products</span>
                    </div>
                    <div className="px-2 py-1 rounded bg-gray-50 text-xs text-gray-500">ID: {cat.id}</div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <div className="text-gray-400 hover:text-gray-600 cursor-pointer" title="More">
                    <FaEllipsisV />
                  </div>

                  <div className="flex gap-2 mt-6">
                    <button
                      onClick={() => handleEdit(cat)}
                      className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-amber-50"
                      title="Edit"
                    >
                      <FaEdit className="text-amber-600" />
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-red-50"
                      title="Delete"
                    >
                      <FaTrash className="text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Empty state when no results */}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-20 bg-white rounded-2xl shadow">
              <div className="text-4xl text-amber-600 mb-3">No categories</div>
              <p className="text-gray-500 mb-4">Try adjusting your search or add a new category.</p>
              <button onClick={handleAdd} className="bg-amber-500 text-white px-4 py-2 rounded-lg">Add Category</button>
            </div>
          )}
        </div>
      ) : (
        // compact table-like list view (keeps simple)
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-amber-100">
              <tr>
                <th className="text-left px-4 py-3 text-sm text-gray-700">S. No</th>
                <th className="text-left px-4 py-3 text-sm text-gray-700">Category</th>
                <th className="text-left px-4 py-3 text-sm text-gray-700">Description</th>
                <th className="text-left px-4 py-3 text-sm text-gray-700">Products</th>
                <th className="px-4 py-3 text-sm text-gray-700 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((cat, idx) => (
                <tr key={cat.id} className={idx % 2 === 0 ? "" : "bg-gray-50"}>
                  <td className="px-4 py-3">{cat.id}</td>
                  <td className="px-4 py-3 font-semibold">{cat.name}</td>
                  <td className="px-4 py-3 text-gray-600">{cat.description}</td>
                  <td className="px-4 py-3">{cat.productCount ?? 0}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="inline-flex gap-2">
                      <button onClick={() => handleEdit(cat)} className="px-3 py-1 rounded bg-amber-50 text-amber-700">Edit</button>
                      <button onClick={() => handleDelete(cat.id)} className="px-3 py-1 rounded bg-red-50 text-red-600">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-4 py-10 text-center text-gray-500">No categories found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Form */}
      <CategoryForm
        open={openForm}
        onClose={() => { setOpenForm(false); setEditing(null); }}
        onSave={handleSave}
        initialData={editing}
      />
    </div>
  );
}

export default Categories;
