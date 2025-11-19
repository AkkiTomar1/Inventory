import React, { useEffect, useMemo, useState } from "react";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaPhone,
  FaMapMarkerAlt,
  FaSearch,
  FaTh,
  FaListUl,
  FaSortAmountDown,
  FaBoxes,
} from "react-icons/fa";
import SupplierForm from "./SupplierForm";
import axiosInstance from "../../api/axiosInstance";

// API → UI mapping based on backend schema:
// { id, name, email, phoneNumber, address }
const mapApiToUi = (apiSupplier) => ({
  id: apiSupplier.id,
  name: apiSupplier.name || "",
  contact: apiSupplier.phoneNumber || "",
  email: apiSupplier.email || "",
  address: apiSupplier.address || "",
  notes: "", // backend does not have notes; UI-only field
});

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);

  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [sortMode, setSortMode] = useState("name"); // 'name' | 'id'
  const [nameAsc, setNameAsc] = useState(true);
  const [idAsc, setIdAsc] = useState(true);
  const [view, setView] = useState("grid"); // 'grid' | 'table'
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState(null);

  // Fetch suppliers from backend
  const fetchSuppliers = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      // Backend URL: http://localhost:9090/api/admin/suppliers
      const res = await axiosInstance.get("/admin/suppliers");
      const raw = Array.isArray(res.data)
        ? res.data
        : res.data?.data || [];
      setSuppliers(raw.map(mapApiToUi));
    } catch (err) {
      console.error("Failed to load suppliers", err);
      setLoadError("Failed to load suppliers. Please refresh.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  // Debounce search query
  useEffect(() => {
    const t = setTimeout(
      () => setDebouncedQuery(query.trim().toLowerCase()),
      220
    );
    return () => clearTimeout(t);
  }, [query]);

  // Filter + sort suppliers
  const displayed = useMemo(() => {
    const q = debouncedQuery;
    const filtered = suppliers.filter((s) =>
      `${s.name} ${s.contact} ${s.email} ${s.address} ${s.notes}`
        .toLowerCase()
        .includes(q)
    );

    if (sortMode === "id") {
      return [...filtered].sort((a, b) =>
        idAsc ? a.id - b.id : b.id - a.id
      );
    }

    return [...filtered].sort((a, b) =>
      nameAsc
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name)
    );
  }, [suppliers, debouncedQuery, sortMode, nameAsc, idAsc]);

  const totalSuppliers = suppliers.length;

  const openAdd = () => {
    setEditing(null);
    setOpenForm(true);
  };

  const openEdit = (supplier) => {
    setEditing(supplier);
    setOpenForm(true);
  };

  const handleDelete = async (id) => {
    const s = suppliers.find((x) => x.id === id);
    if (!s) return;
    if (
      !window.confirm(
        `Delete supplier "${s.name}"? This cannot be undone.`
      )
    )
      return;

    try {
      // DELETE /admin/suppliers/{id}
      await axiosInstance.delete(`/admin/suppliers/${id}`);
      setSuppliers((prev) => prev.filter((x) => x.id !== id));
    } catch (err) {
      console.error("Failed to delete supplier", err);
      alert("Failed to delete supplier. Please try again.");
    }
  };

  // Called from SupplierForm after successful save
  const handleSave = (savedSupplier) => {
    if (editing) {
      setSuppliers((prev) =>
        prev.map((s) => (s.id === savedSupplier.id ? savedSupplier : s))
      );
    } else {
      setSuppliers((prev) => [...prev, savedSupplier]);
    }
    setEditing(null);
    setOpenForm(false);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-[linear-gradient(135deg,#fb923c,#60a5fa)] text-amber-100 p-4 rounded-t-2xl shadow-sm">
        <div className="flex items-center gap-4">
          <div className="rounded-lg bg-amber-50 p-3 flex items-center justify-center">
            <FaBoxes className="text-amber-600 text-2xl" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-100">Suppliers</h1>
            <p className="text-sm text-gray-50 mt-0.5">
              Manage supplier contacts and purchase sources.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-4 bg-white p-2 rounded-xl shadow-sm">
            <div className="text-sm text-gray-900 text-center">
              <div className="text-xs text-gray-400">Suppliers</div>
              <div className="text-lg font-semibold">
                {totalSuppliers}
              </div>
            </div>
          </div>

          <button
            onClick={openAdd}
            className="flex items-center gap-2 bg-white hover:bg-amber-500 text-black px-4 py-2 rounded-lg shadow"
          >
            <FaPlus /> Add Supplier
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-[linear-gradient(135deg,#fb923c,#60a5fa)] text-amber-100 rounded-b-2xl p-4 shadow-sm mb-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-3 w-full md:w-[60%]">
            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 w-100">
              <FaSearch className="text-gray-900" />
              <input
                className="ml-3 w-full text-gray-900 outline-none text-sm"
                placeholder="Search suppliers by name, phone, email..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="ml-2 text-xs text-gray-900"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 justify-end">
            <button
              onClick={() => {
                setSortMode("name");
                setNameAsc((v) => !v);
              }}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
                sortMode === "name"
                  ? "bg-white border-none cursor-pointer text-gray-900 font-semibold"
                  : "bg-whit border-none cursor-pointer text-gray-900 hover:bg-gray-50"
              }`}
              title="Sort by name"
              aria-pressed={sortMode === "name"}
            >
              <FaSortAmountDown/>
              <span className="text-sm">
                {nameAsc ? "A → Z" : "Z → A"}
              </span>
            </button>

            <button
              onClick={() => {
                setSortMode("id");
                setIdAsc((v) => !v);
              }}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
                sortMode === "id"
                  ? "bg-white  text-gray-900  cursor-pointer border-none font-semibold"
                  : "bg-white text-gray-900 cursor-pointer border-none  hover:bg-gray-50"
              }`}
              title="Sort by ID"
              aria-pressed={sortMode === "id"}
            >
              <FaSortAmountDown />
              <span className="text-sm">
                {idAsc ? "ID ↑" : "ID ↓"}
              </span>
            </button>

            <button
              onClick={() => setView("grid")}
              className={`p-2 rounded-lg text-gray-900 ${
                view === "grid"
                  ? "bg-amber-300"
                  : "bg-white border border-gray-200"
              }`}
              title="Grid view"
            >
              <FaTh />
            </button>
            <button
              onClick={() => setView("table")}
              className={`p-2 rounded-lg text-gray-900 ${
                view === "table"
                  ? "bg-amber-300"
                  : "bg-white border border-gray-200"
              }`}
              title="Table view"
            >
              <FaListUl />
            </button>
          </div>
        </div>
      </div>

      {loadError && (
        <div className="mb-4 text-center text-sm text-red-600">
          {loadError}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="mt-6 text-center text-gray-500">
          Loading suppliers...
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayed.length === 0 ? (
            <div className="col-span-full text-center py-16 bg-white rounded-2xl shadow">
              <div className="text-2xl text-amber-600 mb-2">
                No suppliers
              </div>
              <p className="text-gray-500 mb-4">
                Try a different search or add a new supplier.
              </p>
              <button
                onClick={openAdd}
                className="bg-amber-600 text-white px-4 py-2 rounded-lg"
              >
                Add Supplier
              </button>
            </div>
          ) : (
            displayed.map((s) => (
              <div
                key={s.id}
                className="bg-white rounded-2xl p-5 shadow hover:shadow-lg transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {s.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                      {s.notes}
                    </p>

                    <div className="mt-4 text-sm text-gray-600 space-y-2">
                      <div className="flex items-center gap-2">
                        <FaPhone className="text-gray-400" />
                        <span>{s.contact}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <FaMapMarkerAlt className="text-gray-400 mt-1" />
                        <span>{s.address}</span>
                      </div>
                      <div className="mt-2 text-sm text-gray-600 break-words">
                        <strong className="text-gray-700">Email:</strong>{" "}
                        {s.email}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    {/* <div className="text-sm text-gray-500">
                      ID: {s.id}
                    </div> */}

                    <div className="flex gap-2 mt-3">
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
            ))
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-md overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead className="bg-linear-to-l from-amber-900 via-amber-950 to-amber-900">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-100">
                  ID
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-100">
                  Supplier
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-100">
                  Contact
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-100">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-100">
                  Address
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-100">
                  Notes
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-100">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {displayed.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="text-center py-6 text-gray-500"
                  >
                    No suppliers found.
                  </td>
                </tr>
              ) : (
                displayed.map((s, i) => (
                  <tr
                    key={s.id}
                    className={`${
                      i % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-amber-50 transition`}
                  >
                    <td className="px-4 py-3 border border-gray-200">
                      {s.id}
                    </td>
                    <td className="px-4 py-3 border border-gray-200 font-semibold text-gray-800">
                      {s.name}
                    </td>
                    <td className="px-4 py-3 border border-gray-200 text-gray-600">
                      <div className="flex items-center gap-2">
                        <FaPhone className="text-sm text-gray-500" />
                        {s.contact}
                      </div>
                    </td>
                    <td className="px-4 py-3 border border-gray-200 text-gray-600">
                      {s.email}
                    </td>
                    <td className="px-4 py-3 border border-gray-200 text-gray-600">
                      {s.address}
                    </td>
                    <td className="px-4 py-3 border border-gray-200 text-gray-600">
                      {s.notes}
                    </td>
                    <td className="px-4 py-3 border border-gray-200 text-center">
                      <div className="flex justify-center gap-3">
                        <button
                          onClick={() => openEdit(s)}
                          className="text-amber-600 hover:text-amber-800"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(s.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
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
