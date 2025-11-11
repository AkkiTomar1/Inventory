import React, { useEffect, useRef, useState } from "react";
import {
  FaTimes,
  FaTag,
  FaBoxes,
  FaBarcode,
  FaSave,
  FaIndustry,
  FaWarehouse,
  FaCalendarAlt,
  FaCashRegister,
  FaHashtag,
} from "react-icons/fa";

const ProductForm = ({ open, onClose, onSave, initialData = null, categories = [], subcategories = [] }) => {
  const [form, setForm] = useState({
    name: "",
    brand: "",
    categoryId: "",
    subcategoryId: "",
    packSize: "",
    unit: "pcs",
    mrp: "",
    sellingPrice: "",
    stockQty: "",
    expiryDate: "",
    barcode: "",
  });
  const [errors, setErrors] = useState({});
  const firstRef = useRef(null);

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || "",
        brand: initialData.brand || "",
        categoryId: initialData.categoryId || "",
        subcategoryId: initialData.subcategoryId || "",
        packSize: initialData.packSize || "",
        unit: initialData.unit || "pcs",
        mrp: initialData.mrp !== undefined ? String(initialData.mrp) : "",
        sellingPrice: initialData.sellingPrice !== undefined ? String(initialData.sellingPrice) : "",
        stockQty: initialData.stockQty !== undefined ? String(initialData.stockQty) : "",
        expiryDate: initialData.expiryDate || "",
        barcode: initialData.barcode || "",
      });
    } else {
      setForm({
        name: "",
        brand: "",
        categoryId: "",
        subcategoryId: "",
        packSize: "",
        unit: "pcs",
        mrp: "",
        sellingPrice: "",
        stockQty: "",
        expiryDate: "",
        barcode: "",
      });
    }
    setErrors({});
    if (open) setTimeout(() => firstRef.current?.focus?.(), 80);
  }, [initialData, open]);

  if (!open) return null;

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Product name is required";
    if (!form.categoryId) e.categoryId = "Please select a category";
    if (!form.subcategoryId) e.subcategoryId = "Please select a subcategory";
    if (!form.sellingPrice || isNaN(Number(form.sellingPrice))) e.sellingPrice = "Valid selling price required";
    if (!form.stockQty || isNaN(Number(form.stockQty))) e.stockQty = "Valid stock quantity required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    const payload = {
      name: form.name.trim(),
      brand: form.brand.trim(),
      categoryId: Number(form.categoryId),
      subcategoryId: Number(form.subcategoryId),
      packSize: form.packSize.trim(),
      unit: form.unit,
      mrp: form.mrp ? Number(form.mrp) : undefined,
      sellingPrice: form.sellingPrice ? Number(form.sellingPrice) : undefined,
      stockQty: form.stockQty ? Number(form.stockQty) : 0,
      expiryDate: form.expiryDate || "",
      barcode: form.barcode.trim(),
    };
    onSave(payload);
  };

  const filteredSubcats = subcategories.filter((s) => String(s.categoryId) === String(form.categoryId));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <form onSubmit={handleSubmit} className="relative z-10 bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-50 rounded-md"><FaBoxes className="text-amber-600" /></div>
            <div>
              <h3 className="text-lg font-semibold">{initialData ? "Edit Product" : "Add Product"}</h3>
              <p className="text-sm text-gray-500">{initialData ? "Update product details" : "Create a new product"}</p>
            </div>
          </div>

          <button type="button" onClick={onClose} className="p-2 rounded-md text-gray-500 hover:bg-gray-100"><FaTimes /></button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label>
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1"><FaTag /> <span>Product Name</span></div>
            <input ref={firstRef} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={`w-full p-2 border rounded ${errors.name ? "border-red-500" : "border-gray-300"}`} placeholder="e.g. Basmati Rice 5kg" />
            {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
          </label>

          <label>
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1"><FaIndustry /> <span>Brand</span></div>
            <input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} className="w-full p-2 border rounded" placeholder="e.g. Royal" />
          </label>

          <label>
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1"><FaBoxes /> <span>Category</span></div>
            <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value, subcategoryId: "" })} className={`w-full p-2 border rounded ${errors.categoryId ? "border-red-500" : "border-gray-300"}`}>
              <option value="">Select category</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            {errors.categoryId && <p className="text-sm text-red-600 mt-1">{errors.categoryId}</p>}
          </label>

          <label>
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1"><FaBoxes /> <span>Subcategory</span></div>
            <select value={form.subcategoryId} onChange={(e) => setForm({ ...form, subcategoryId: e.target.value })} className={`w-full p-2 border rounded ${errors.subcategoryId ? "border-red-500" : "border-gray-300"}`}>
              <option value="">Select subcategory</option>
              {filteredSubcats.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            {errors.subcategoryId && <p className="text-sm text-red-600 mt-1">{errors.subcategoryId}</p>}
          </label>

          <label>
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1"><FaHashtag /> <span>Pack Size</span></div>
            <input value={form.packSize} onChange={(e) => setForm({ ...form, packSize: e.target.value })} className="w-full p-2 border rounded" placeholder="e.g. 500 g, 1 kg" />
          </label>

          <label>
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1"><FaWarehouse /> <span>Unit</span></div>
            <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} className="w-full p-2 border rounded">
              <option value="pcs">pcs</option>
              <option value="kg">kg</option>
              <option value="g">g</option>
              <option value="l">l</option>
              <option value="ml">ml</option>
            </select>
          </label>

          <label>
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1"><FaCashRegister /> <span>MRP</span></div>
            <input value={form.mrp} onChange={(e) => setForm({ ...form, mrp: e.target.value })} className="w-full p-2 border rounded" placeholder="0.00" inputMode="decimal" />
          </label>

          <label>
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1"><FaCashRegister /> <span>Selling Price *</span></div>
            <input value={form.sellingPrice} onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })} className={`w-full p-2 border rounded ${errors.sellingPrice ? "border-red-500" : "border-gray-300"}`} placeholder="0.00" inputMode="decimal" />
            {errors.sellingPrice && <p className="text-sm text-red-600 mt-1">{errors.sellingPrice}</p>}
          </label>

          <label>
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1"><FaHashtag /> <span>Stock Quantity *</span></div>
            <input value={form.stockQty} onChange={(e) => setForm({ ...form, stockQty: e.target.value })} className={`w-full p-2 border rounded ${errors.stockQty ? "border-red-500" : "border-gray-300"}`} placeholder="e.g. 10" inputMode="numeric" />
            {errors.stockQty && <p className="text-sm text-red-600 mt-1">{errors.stockQty}</p>}
          </label>

          <label>
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1"><FaCalendarAlt /> <span>Expiry Date</span></div>
            <input type="date" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} className="w-full p-2 border rounded" />
          </label>

          <label>
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1"><FaBarcode /> <span>Barcode</span></div>
            <input value={form.barcode} onChange={(e) => setForm({ ...form, barcode: e.target.value })} className="w-full p-2 border rounded" placeholder="Optional" />
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 border rounded bg-white hover:bg-gray-50">Cancel</button>
          <button type="submit" className="px-4 py-2 rounded bg-amber-600 text-white hover:bg-amber-700 flex items-center gap-2"><FaSave /> {initialData ? "Update" : "Save"}</button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
