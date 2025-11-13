import React, { useMemo, useState } from "react";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaSortAmountDown,
  FaBoxes,
  FaTh,
  FaListUl,
} from "react-icons/fa";
import ProductForm from "./ProductForm";

const Products = () => {
  // seed categories & subcats (replace with API)
  const [categories] = useState([
    { id: 1, name: "Food" },
    { id: 2, name: "Beverages" },
    { id: 3, name: "Dairy & Eggs" },
    { id: 4, name: "Fresh Produce" },
  ]);

  const [subcategories] = useState([
    { id: 1, categoryId: 1, name: "Rice" },
    { id: 2, categoryId: 1, name: "Atta & Flours" },
    { id: 3, categoryId: 2, name: "Tea" },
    { id: 4, categoryId: 3, name: "Milk" },
    { id: 5, categoryId: 4, name: "Fruits" },
  ]);

  const [products, setProducts] = useState([
    {
      id: 1,
      name: "Basmati Rice 5kg",
      brand: "Royal",
      categoryId: 1,
      subcategoryId: 1,
      packSize: "5 kg",
      unit: "kg",
      mrp: 599.0,
      sellingPrice: 549.0,
      stockQty: 25,
      expiryDate: "",
      barcode: "8901234567890",
    },
    {
      id: 2,
      name: "Dairy Milk 1L",
      brand: "DailyFresh",
      categoryId: 3,
      subcategoryId: 4,
      packSize: "1 L",
      unit: "l",
      mrp: 55.0,
      sellingPrice: 50.0,
      stockQty: 40,
      expiryDate: "2025-12-01",
      barcode: "8909876543210",
    },
  ]);

  // ui state
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("name"); // name | price | stock
  const [sortAsc, setSortAsc] = useState(true);
  const [viewMode, setViewMode] = useState("table"); // 'table' or 'grid'
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState(null);

  // derived list: filter + sort
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = products.filter((p) =>
      `${p.name} ${p.brand} ${p.barcode}`.toLowerCase().includes(q)
    );

    return list.sort((a, b) => {
      let aVal, bVal;
      if (sortKey === "price") {
        aVal = a.sellingPrice ?? a.mrp ?? 0;
        bVal = b.sellingPrice ?? b.mrp ?? 0;
      } else if (sortKey === "stock") {
        aVal = a.stockQty ?? 0;
        bVal = b.stockQty ?? 0;
      } else {
        aVal = a.name.toLowerCase();
        bVal = b.name.toLowerCase();
      }
      if (aVal < bVal) return sortAsc ? -1 : 1;
      if (aVal > bVal) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [products, search, sortKey, sortAsc]);

  const handleAdd = () => {
    setEditing(null);
    setOpenForm(true);
  };

  const handleEdit = (p) => {
    setEditing(p);
    setOpenForm(true);
  };

  const handleDelete = (id) => {
    const p = products.find((x) => x.id === id);
    if (!p) return;
    if (window.confirm(`Delete "${p.name}"? This cannot be undone.`)) {
      setProducts((prev) => prev.filter((x) => x.id !== id));
    }
  };

  const handleSave = (formData) => {
    if (editing) {
      setProducts((prev) =>
        prev.map((p) => (p.id === editing.id ? { ...p, ...formData } : p))
      );
    } else {
      const newProduct = {
        id: products.length ? Math.max(...products.map((p) => p.id)) + 1 : 1,
        ...formData,
      };
      // keep previous behavior: new product on top (admin preference)
      setProducts((prev) => [newProduct, ...prev]);
    }
    setOpenForm(false);
    setEditing(null);
  };

  const getCategoryName = (id) => categories.find((c) => c.id === id)?.name ?? "-";
  const getSubcategoryName = (id) => subcategories.find((s) => s.id === id)?.name ?? "-";

  return (
    <div className="p-6 rounded-2xl shadow-2xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-50 rounded-lg">
            <FaBoxes className="text-amber-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Products</h1>
            <p className="text-sm text-gray-500 mt-1">Manage grocery products — add, edit or remove items.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex gap-4 bg-white p-3 rounded-2xl shadow-sm items-center">
            <div className="text-sm text-gray-600">
              <div className="text-xs text-gray-400">Products</div>
              <div className="text-lg font-semibold">{products.length}</div>
            </div>
            <div className="border-l h-8" />
            <div className="text-sm text-gray-600">
              <div className="text-xs text-gray-400">Categories</div>
              <div className="text-lg font-semibold">{categories.length}</div>
            </div>
          </div>

          <button
            onClick={handleAdd}
            className="flex items-center gap-2 bg-linear-to-r from-amber-500 to-amber-600 text-white px-4 py-2 rounded-lg shadow hover:scale-[1.02] transition"
          >
            <FaPlus /> Add Product
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm w-full sm:w-[420px]">
            <FaSearch className="text-gray-400" />
            <input
              className="ml-3 w-full outline-none"
              placeholder="Search by name, brand or barcode..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="name">Sort: Name</option>
            <option value="price">Sort: Price</option>
            <option value="stock">Sort: Stock</option>
          </select>

          <button
            onClick={() => setSortAsc((v) => !v)}
            className="border border-gray-300 rounded-lg px-3 py-2 hover:bg-gray-100"
            title="Toggle sort direction"
          >
            <FaSortAmountDown />
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
          {filtered.map((p) => (
            <div key={p.id} className="bg-white rounded-2xl p-5 shadow hover:shadow-lg transition">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800">{p.name}</h3>
                  <div className="text-sm text-gray-500 mt-1">{p.brand}</div>

                  <div className="mt-3 text-sm text-gray-600 space-y-1">
                    <div>Category: {getCategoryName(p.categoryId)}</div>
                    <div>Subcategory: {getSubcategoryName(p.subcategoryId)}</div>
                    <div>Pack: {p.packSize} • {p.unit}</div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm font-semibold text-gray-800">₹{(p.sellingPrice ?? 0).toFixed(2)}</div>
                    <div className="text-xs bg-gray-50 px-2 py-1 rounded text-gray-600">Stock: {p.stockQty}</div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-3">
                  <div className="text-gray-400 text-sm">ID: {p.id}</div>
                  <div className="flex gap-2 mt-6">
                    <button onClick={() => handleEdit(p)} className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-amber-50" title="Edit">
                      <FaEdit className="text-amber-600" />
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-red-50" title="Delete">
                      <FaTrash className="text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="col-span-full text-center py-20 bg-white rounded-2xl shadow">
              <h3 className="text-gray-600 font-semibold mb-2">No products found</h3>
              <p className="text-gray-500 mb-4">Try changing filters or add a new product.</p>
              <button onClick={handleAdd} className="bg-amber-500 text-white px-4 py-2 rounded-lg">Add Product</button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-md overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead className="bg-amber-100">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">#</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Brand</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Category</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Pack</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Price</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Stock</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-6 text-gray-500">No products found.</td>
                </tr>
              ) : (
                filtered.map((p, idx) => (
                  <tr key={p.id} className={`${idx % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-amber-50 transition`}>
                    <td className="px-4 py-3 border border-gray-200">{p.id}</td>
                    <td className="px-4 py-3 border border-gray-200 font-semibold text-gray-800">{p.name}</td>
                    <td className="px-4 py-3 border border-gray-200 text-gray-600">{p.brand}</td>
                    <td className="px-4 py-3 border border-gray-200 text-gray-600">{getCategoryName(p.categoryId)}</td>
                    <td className="px-4 py-3 border border-gray-200 text-gray-600">{p.packSize}</td>
                    <td className="px-4 py-3 border border-gray-200 text-right font-semibold">₹{(p.sellingPrice ?? 0).toFixed(2)}</td>
                    <td className="px-4 py-3 border border-gray-200 text-right">{p.stockQty}</td>
                    <td className="px-4 py-3 border border-gray-200 text-center">
                      <div className="flex justify-center gap-3">
                        <button onClick={() => handleEdit(p)} className="text-blue-600 hover:text-blue-800"><FaEdit /></button>
                        <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:text-red-800"><FaTrash /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <ProductForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSave={handleSave}
        initialData={editing}
        categories={categories}
        subcategories={subcategories}
      />
    </div>
  );
};

export default Products;
