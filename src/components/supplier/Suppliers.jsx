// src/components/supplier/Suppliers.jsx
import React, { useMemo, useState } from "react";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaPhone,
  FaMapMarkerAlt,
  FaSearch,
  FaTh,
  FaListUl,
  FaSortAmountDownAlt,
  FaHashtag,
  FaBoxes,
} from "react-icons/fa";
import SupplierForm from "./SupplierForm";

const seedSuppliers = [
  {
    id: 1,
    name: "Aman Wholesale",
    contact: "9876543210",
    email: "aman@wholesale.com",
    address: "Mall Road, Sitapur",
    notes: "Primary rice supplier",
  },
  {
    id: 2,
    name: "FreshDairy Co.",
    contact: "9123456780",
    email: "sales@freshdairy.com",
    address: "Industrial Area, Lucknow",
    notes: "Dairy products",
  },
  {
    id: 3,
    name: "SpiceHouse",
    contact: "9988776655",
    email: "info@spicehouse.com",
    address: "Market Street, Sitapur",
    notes: "Spices & masalas",
  },
];

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState(seedSuppliers);
  const [search, setSearch] = useState("");
  const [sortMode, setSortMode] = useState("name"); // 'name' or 'id'
  const [nameAsc, setNameAsc] = useState(true);
  const [idAsc, setIdAsc] = useState(true);
  const [view, setView] = useState("grid"); // 'grid' or 'table'
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState(null);

  // derived list (filtered + sorted)
  const displayed = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = suppliers.filter((s) =>
      `${s.name} ${s.contact} ${s.email} ${s.address} ${s.notes}`
        .toLowerCase()
        .includes(q)
    );

    if (sortMode === "id") {
      return filtered.sort((a, b) => (idAsc ? a.id - b.id : b.id - a.id));
    }
    // default sort by name
    return filtered.sort((a, b) =>
      nameAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
    );
  }, [suppliers, search, sortMode, nameAsc, idAsc]);

  // stats
  const totalSuppliers = suppliers.length;

  // actions
  const openAdd = () => {
    setEditing(null);
    setOpenForm(true);
  };

  const openEdit = (supplier) => {
    setEditing(supplier);
    setOpenForm(true);
  };

  const handleDelete = (id) => {
    const s = suppliers.find((x) => x.id === id);
    if (!s) return;
    if (window.confirm(`Delete supplier "${s.name}"? This cannot be undone.`)) {
      setSuppliers((prev) => prev.filter((x) => x.id !== id));
    }
  };

  const handleSave = (formData) => {
    if (editing) {
      setSuppliers((prev) =>
        prev.map((s) => (s.id === editing.id ? { ...s, ...formData } : s))
      );
    } else {
      const nextId = suppliers.length ? Math.max(...suppliers.map((s) => s.id)) + 1 : 1;
      const newSupplier = { id: nextId, ...formData };
      setSuppliers((prev) => [...prev, newSupplier]); // append to bottom
    }
    setOpenForm(false);
    setEditing(null);
  };

  return (
    <div className="p-6 rounded-2xl shadow-2xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-50 rounded-lg">
            <FaBoxes className="text-amber-600 text-xl" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Suppliers</h1>
            <p className="text-sm text-gray-500">Manage supplier contacts and purchase sources.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="hidden sm:flex items-center gap-4 bg-white p-3 rounded-2xl shadow-sm">
            <div className="text-sm text-gray-600">
              <div className="text-xs text-gray-400">Suppliers</div>
              <div className="text-lg font-semibold">{totalSuppliers}</div>
            </div>
          </div>

          <button
            onClick={openAdd}
            className="flex items-center gap-2 bg-linear-to-r from-amber-500 to-amber-600 text-white px-4 py-2 rounded-lg shadow hover:scale-[1.02] transition"
          >
            <FaPlus /> Add Supplier
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
              placeholder="Search suppliers by name, phone, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <button
            onClick={() => {
              setSortMode("name");
              setNameAsc((v) => !v);
            }}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 ${
              sortMode === "name" ? "bg-amber-100 font-semibold" : ""
            }`}
            title="Sort by name"
          >
            <FaSortAmountDownAlt />
            <span className="text-sm">{nameAsc ? "A → Z" : "Z → A"}</span>
          </button>

          <button
            onClick={() => {
              setSortMode("id");
              setIdAsc((v) => !v);
            }}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 ${
              sortMode === "id" ? "bg-amber-100 font-semibold" : ""
            }`}
            title="Sort by id"
          >
            <FaHashtag />
            <span className="text-sm">{idAsc ? "Low → High" : "High → Low"}</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setView("grid")}
            className={`p-2 rounded-lg ${view === "grid" ? "bg-amber-100" : "bg-white border border-gray-200"}`}
            title="Grid view"
          >
            <FaTh />
          </button>
          <button
            onClick={() => setView("table")}
            className={`p-2 rounded-lg ${view === "table" ? "bg-amber-100" : "bg-white border border-gray-200"}`}
            title="Table view"
          >
            <FaListUl />
          </button>
        </div>
      </div>

      {/* Content */}
      {view === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayed.map((s) => (
            <div key={s.id} className="bg-white rounded-2xl p-5 shadow hover:shadow-lg transition">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800">{s.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{s.notes}</p>

                  <div className="mt-4 text-sm text-gray-600 space-y-2">
                    <div className="flex items-center gap-2">
                      <FaPhone className="text-gray-400" />
                      <span>{s.contact}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <FaMapMarkerAlt className="text-gray-400 mt-1" />
                      <span>{s.address}</span>
                    </div>
                    <div className="mt-2 wrap-break-words text-sm text-gray-600">
                      <strong className="text-gray-700">Email:</strong> {s.email}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-3">
                  <div className="text-gray-400 text-sm">ID: {s.id}</div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => openEdit(s)}
                      className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-amber-50"
                      title="Edit"
                    >
                      <FaEdit className="text-amber-600" />
                    </button>
                    <button
                      onClick={() => handleDelete(s.id)}
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

          {displayed.length === 0 && (
            <div className="col-span-full text-center py-20 bg-white rounded-2xl shadow">
              <div className="text-4xl text-amber-600 mb-3">No suppliers</div>
              <p className="text-gray-500 mb-4">Try a different search or add a new supplier.</p>
              <button onClick={openAdd} className="bg-amber-500 text-white px-4 py-2 rounded-lg">Add Supplier</button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-md overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead className="bg-amber-100">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">#</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Supplier</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Contact</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Address</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Notes</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayed.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-6 text-gray-500">No suppliers found.</td>
                </tr>
              ) : (
                displayed.map((s, i) => (
                  <tr key={s.id} className={`${i % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-amber-50 transition`}>
                    <td className="px-4 py-3 border border-gray-200">{s.id}</td>
                    <td className="px-4 py-3 border border-gray-200 font-semibold text-gray-800">{s.name}</td>
                    <td className="px-4 py-3 border border-gray-200 text-gray-600 flex items-center gap-2"><FaPhone className="text-sm text-gray-500" /> {s.contact}</td>
                    <td className="px-4 py-3 border border-gray-200 text-gray-600">{s.email}</td>
                    <td className="px-4 py-3 border border-gray-200 text-gray-600">{s.address}</td>
                    <td className="px-4 py-3 border border-gray-200 text-gray-600">{s.notes}</td>
                    <td className="px-4 py-3 border border-gray-200 text-center">
                      <div className="flex justify-center gap-3">
                        <button onClick={() => openEdit(s)} className="text-blue-600 hover:text-blue-800"><FaEdit /></button>
                        <button onClick={() => handleDelete(s.id)} className="text-red-600 hover:text-red-800"><FaTrash /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Form */}
      <SupplierForm
        open={openForm}
        onClose={() => {
          setOpenForm(false);
          setEditing(null);
        }}
        onSave={handleSave}
        initialData={editing}
      />
    </div>
  );
};

export default Suppliers;
