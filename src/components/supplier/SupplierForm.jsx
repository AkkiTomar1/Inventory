import React, { useEffect, useRef, useState } from "react";
import {
  FaTimes,
  FaUser,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaStickyNote,
  FaSave,
} from "react-icons/fa";
import axiosInstance from "../../api/axiosInstance";

// UI → API mapping based on backend schema:
// { id, name, email, phoneNumber, address }
const mapUiToApi = (form, initialData) => {
  const payload = {
    name: form.name,
    email: form.email,
    phoneNumber: form.contact,
    address: form.address,
  };

  // For update, id can optionally be sent in body too (depends on backend)
  if (initialData?.id) {
    payload.id = initialData.id;
  }

  return payload;
};

// API → UI (same as in Suppliers.jsx)
const mapApiToUi = (apiSupplier) => ({
  id: apiSupplier.id,
  name: apiSupplier.name || "",
  contact: apiSupplier.phoneNumber || "",
  email: apiSupplier.email || "",
  address: apiSupplier.address || "",
  notes: "",
});

const SupplierForm = ({ open, onClose, onSave, initialData = null }) => {
  const [form, setForm] = useState({
    name: "",
    contact: "",
    email: "",
    address: "",
    notes: "",
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState(null);
  const firstInputRef = useRef(null);

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || "",
        contact: initialData.contact || "",
        email: initialData.email || "",
        address: initialData.address || "",
        notes: initialData.notes || "",
      });
    } else {
      setForm({
        name: "",
        contact: "",
        email: "",
        address: "",
        notes: "",
      });
    }
    setErrors({});
    setApiError(null);

    if (open) {
      setTimeout(() => firstInputRef.current?.focus?.(), 80);
    }
  }, [initialData, open]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Supplier name is required";
    if (!form.contact.trim()) e.contact = "Contact number is required";
    if (form.contact && !/^\d{7,15}$/.test(form.contact.trim()))
      e.contact = "Enter a valid phone number (7–15 digits)";
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email.trim()))
      e.email = "Enter a valid email address";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;

    setSaving(true);
    setApiError(null);

    try {
      const payload = mapUiToApi(form, initialData);
      let res;

      if (initialData?.id) {
        // UPDATE -> PUT /admin/suppliers/{id}
        res = await axiosInstance.put(
          `/admin/suppliers/${initialData.id}`,
          payload
        );
      } else {
        // CREATE -> POST /admin/suppliers
        res = await axiosInstance.post("/admin/suppliers", payload);
      }

      const savedSupplier = mapApiToUi(res.data || {});
      onSave && onSave(savedSupplier);
      onClose();
    } catch (err) {
      console.error("Failed to save supplier", err);
      const serverMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Failed to save supplier. Please try again.";
      setApiError(serverMsg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black opacity-40"
        onClick={onClose}
        aria-hidden="true"
      />

      <form
        onSubmit={handleSubmit}
        className="relative z-10 bg-white w-full max-w-2xl rounded-2xl shadow-xl p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="supplier-form-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-50 rounded-md">
              <FaUser className="text-amber-600" />
            </div>
            <div>
              <h3 id="supplier-form-title" className="text-lg font-semibold">
                {initialData ? "Edit Supplier" : "Add Supplier"}
              </h3>
              <p className="text-sm text-gray-500">
                {initialData
                  ? "Update supplier details"
                  : "Create a new supplier record"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-md text-gray-500 hover:bg-gray-100"
              aria-label="Close"
              disabled={saving}
            >
              <FaTimes />
            </button>
          </div>
        </div>

        {apiError && (
          <p className="mb-3 text-sm text-red-600">{apiError}</p>
        )}

        {/* Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
              <FaUser /> <span>Supplier Name</span>
            </div>
            <input
              ref={firstInputRef}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={`w-full p-2 border rounded ${
                errors.name ? "border-red-500" : "border-gray-200"
              }`}
              placeholder="e.g. Aman Wholesale"
              autoComplete="organization"
              disabled={saving}
            />
            {errors.name && (
              <p className="text-sm text-red-600 mt-1">{errors.name}</p>
            )}
          </label>

          <label className="block">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
              <FaPhone /> <span>Contact Number</span>
            </div>
            <input
              value={form.contact}
              onChange={(e) =>
                setForm({ ...form, contact: e.target.value })
              }
              className={`w-full p-2 border rounded ${
                errors.contact ? "border-red-500" : "border-gray-200"
              }`}
              placeholder="e.g. 9876543210"
              inputMode="tel"
              autoComplete="tel"
              disabled={saving}
            />
            {errors.contact && (
              <p className="text-sm text-red-600 mt-1">
                {errors.contact}
              </p>
            )}
          </label>

          <label className="block">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
              <FaEnvelope /> <span>Email</span>
            </div>
            <input
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
              className={`w-full p-2 border rounded ${
                errors.email ? "border-red-500" : "border-gray-200"
              }`}
              placeholder="optional"
              inputMode="email"
              autoComplete="email"
              disabled={saving}
            />
            {errors.email && (
              <p className="text-sm text-red-600 mt-1">
                {errors.email}
              </p>
            )}
          </label>

          <label className="block">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
              <FaMapMarkerAlt /> <span>Address</span>
            </div>
            <input
              value={form.address}
              onChange={(e) =>
                setForm({ ...form, address: e.target.value })
              }
              className="w-full p-2 border rounded border-gray-200"
              placeholder="e.g. Market Road, Sitapur"
              autoComplete="street-address"
              disabled={saving}
            />
          </label>
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border rounded bg-white hover:bg-gray-50"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded bg-amber-600 text-white hover:bg-amber-700 flex items-center gap-2 disabled:opacity-70"
            disabled={saving}
          >
            <FaSave />
            {saving
              ? initialData
                ? "Updating..."
                : "Saving..."
              : initialData
              ? "Update"
              : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SupplierForm;
