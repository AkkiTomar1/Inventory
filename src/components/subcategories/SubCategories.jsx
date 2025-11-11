import React, { useMemo, useState } from "react";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaSortAmountDown,
  FaEllipsisV,
  FaLayerGroup,
  FaTh,
  FaListUl
} from "react-icons/fa";
import SubcategoriesForm from "./SubcategoriesForm";

/**
 * SubCategories (DESIGN MATCHED to Categories)
 * - same header, stats box, search, sort toggle, grid/table view switch (keeps consistent UI)
 * - new entries appended to bottom
 * - uses local state seed data (replace with API when ready)
 */

const seedCategories = [
  { id: 1, name: "Food" },
  { id: 2, name: "Beverages" },
  { id: 3, name: "Dairy & Eggs" },
  { id: 4, name: "Household Items" },
];

const seedSubcategories = [
  { id: 1, name: "Rice & Grains", description: "Different types of rice, pulses and grains", categoryId: 1, productCount: 12, color: "bg-amber-100 text-amber-700" },
  { id: 2, name: "Spices & Masalas", description: "Ground and whole spices", categoryId: 1, productCount: 8, color: "bg-emerald-100 text-emerald-700" },
  { id: 3, name: "Soft Drinks", description: "Cola, soda and fruit drinks", categoryId: 2, productCount: 20, color: "bg-sky-100 text-sky-700" },
  { id: 4, name: "Milk", description: "Packaged and fresh milk", categoryId: 3, productCount: 6, color: "bg-pink-100 text-pink-700" },
];

const SubCategories = () => {
  const [categories] = useState(seedCategories);
  const [subcategories, setSubcategories] = useState(seedSubcategories);

  const [search, setSearch] = useState("");
  const [sortAsc, setSortAsc] = useState(true);
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'table'
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return subcategories
      .filter(
        (sc) =>
          sc.name.toLowerCase().includes(q) ||
          sc.description.toLowerCase().includes(q) ||
          (categories.find((c) => c.id === sc.categoryId)?.name || "").toLowerCase().includes(q)
      )
      .sort((a, b) => (sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)));
  }, [subcategories, search, sortAsc, categories]);

  const totalSub = subcategories.length;
  const totalProducts = subcategories.reduce((s, c) => s + (c.productCount || 0), 0);

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
    if (window.confirm(`Delete subcategory "${sc.name}"?`)) {
      setSubcategories((prev) => prev.filter((s) => s.id !== id));
    }
  };

  const handleSave = (formData) => {
    if (editing) {
      setSubcategories((prev) => prev.map((s) => (s.id === editing.id ? { ...s, ...formData } : s)));
    } else {
      const nextId = subcategories.length ? Math.max(...subcategories.map((s) => s.id)) + 1 : 1;
      const newSub = { id: nextId, ...formData, productCount: formData.productCount ?? 0, color: formData.color || "bg-amber-100 text-amber-700" };
      setSubcategories((prev) => [...prev, newSub]); // append bottom
    }
    setOpenForm(false);
    setEditing(null);
  };

  const getCategoryName = (id) => categories.find((c) => c.id === id)?.name || "-";

  return (
    <div className="p-6 rounded-2xl shadow-2xl mt-15">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-bold text-gray-800">
            <FaLayerGroup className="text-amber-600" />
            Subcategories
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage subcategories for your grocery store.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex gap-4 bg-white p-3 rounded-2xl shadow-sm items-center">
            <div className="text-sm text-gray-600">
              <div className="text-xs text-gray-400">Subcategories</div>
              <div className="text-lg font-semibold">{totalSub}</div>
            </div>
            <div className="border-l h-8" />
            <div className="text-sm text-gray-600">
              <div className="text-xs text-gray-400">Products (est.)</div>
              <div className="text-lg font-semibold">{totalProducts}</div>
            </div>
          </div>

          <button onClick={handleAdd} className="flex items-center gap-2 bg-linear-to-r from-amber-500 to-amber-600 text-white px-4 py-2 rounded-lg shadow hover:scale-[1.02] transition-transform">
            <FaPlus /> Add Subcategory
          </button>
        </div>
      </div>

      {/* Controls (matches Categories) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm w-full sm:w-[360px]">
            <FaSearch className="text-gray-400" />
            <input className="ml-3 w-full outline-none" placeholder="Search subcategories or description..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>

          <button onClick={() => setSortAsc((v) => !v)} className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 bg-white hover:bg-gray-50" title="Toggle name sort">
            <FaSortAmountDown />
            <span className="text-sm">{sortAsc ? "A → Z" : "Z → A"}</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
  <button
    onClick={() => setViewMode("grid")}
    className={`px-3 py-2 rounded-lg ${viewMode === "grid" ? "bg-amber-100 font-semibold" : "bg-white border border-gray-200"}`}
    title="Grid"
  >
    <FaTh />
  </button>
  <button
    onClick={() => setViewMode("table")}
    className={`px-3 py-2 rounded-lg ${viewMode === "table" ? "bg-amber-100 font-semibold" : "bg-white border border-gray-200"}`}
    title="Table"
  >
    <FaListUl />
  </button>
</div>
      </div>

      {/* Content */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((sc) => (
            <div key={sc.id} className="relative bg-white rounded-2xl p-5 shadow hover:shadow-lg transition">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${sc.color || "bg-amber-100 text-amber-700"}`}>
                    {sc.name}
                  </div>

                  <p className="mt-3 text-sm text-gray-600">{sc.description}</p>

                  <div className="mt-4 flex items-center gap-3 text-sm text-gray-600">
                    <div className="px-2 py-1 rounded bg-gray-50 text-xs text-gray-500">Category: {getCategoryName(sc.categoryId)}</div>
                    <div className="px-2 py-1 rounded bg-gray-50 text-xs text-gray-500">ID: {sc.id}</div>
                    <div className="px-2 py-1 rounded bg-gray-50 text-xs text-gray-500">{(sc.productCount ?? 0) + " products"}</div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <div className="text-gray-400 hover:text-gray-600 cursor-pointer" title="More"><FaEllipsisV /></div>

                  <div className="flex gap-2 mt-6">
                    <button onClick={() => handleEdit(sc)} className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-amber-50" title="Edit">
                      <FaEdit className="text-amber-600" />
                    </button>
                    <button onClick={() => handleDelete(sc.id)} className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-red-50" title="Delete">
                      <FaTrash className="text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="col-span-full text-center py-20 bg-white rounded-2xl shadow">
              <div className="text-4xl text-amber-600 mb-3">No subcategories</div>
              <p className="text-gray-500 mb-4">Try adjusting your search or add a new subcategory.</p>
              <button onClick={handleAdd} className="bg-amber-500 text-white px-4 py-2 rounded-lg">Add Subcategory</button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-amber-100">
              <tr>
                <th className="text-left px-4 py-3 text-sm text-gray-700">S. No</th>
                <th className="text-left px-4 py-3 text-sm text-gray-700">Subcategory</th>
                <th className="text-left px-4 py-3 text-sm text-gray-700">Category</th>
                <th className="text-left px-4 py-3 text-sm text-gray-700">Description</th>
                <th className="px-4 py-3 text-sm text-gray-700 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((sc, idx) => (
                <tr key={sc.id} className={idx % 2 === 0 ? "" : "bg-gray-50"}>
                  <td className="px-4 py-3">{sc.id}</td>
                  <td className="px-4 py-3 font-semibold">{sc.name}</td>
                  <td className="px-4 py-3 text-gray-600">{getCategoryName(sc.categoryId)}</td>
                  <td className="px-4 py-3 text-gray-600">{sc.description}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="inline-flex gap-2">
                      <button onClick={() => handleEdit(sc)} className="px-3 py-1 rounded bg-amber-50 text-amber-700">Edit</button>
                      <button onClick={() => handleDelete(sc.id)} className="px-3 py-1 rounded bg-red-50 text-red-600">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-4 py-10 text-center text-gray-500">No subcategories found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Form (matches CategoryForm design) */}
      <SubcategoriesForm open={openForm} onClose={() => { setOpenForm(false); setEditing(null); }} onSave={handleSave} initialData={editing} categories={categories} />
    </div>
  );
};

export default SubCategories;
