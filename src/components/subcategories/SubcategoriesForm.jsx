import React, { useEffect, useRef, useState } from "react";
import { FaTimes, FaTag, FaListAlt, FaSave } from "react-icons/fa";

/**
 * SubcategoriesForm (DESIGN MATCHED to CategoryForm)
 * - amber gradient header, soft shadows, focus rings
 * - same props: open, onClose, onSave, initialData, categories
 * - returns minimal payload { name, description, categoryId, productCount?, color? }
 */

const SubcategoriesForm = ({ open, onClose, onSave, initialData = null, categories = [] }) => {
  const [form, setForm] = useState({ name: "", description: "", categoryId: "", productCount: "" , color: "bg-amber-100 text-amber-700"});
  const [errors, setErrors] = useState({});
  const firstRef = useRef(null);

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || "",
        description: initialData.description || "",
        categoryId: initialData.categoryId ? String(initialData.categoryId) : "",
        productCount: initialData.productCount ?? "",
        color: initialData.color || "bg-amber-100 text-amber-700",
      });
    } else {
      setForm({ name: "", description: "", categoryId: "", productCount: "", color: "bg-amber-100 text-amber-700" });
    }
    setErrors({});
    if (open) setTimeout(() => firstRef.current?.focus?.(), 80);
  }, [initialData, open]);

  if (!open) return null;

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Subcategory name is required";
    if (!form.categoryId) e.categoryId = "Select a category";
    if (form.productCount && isNaN(Number(form.productCount))) e.productCount = "Enter a valid number";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    onSave({
      name: form.name.trim(),
      description: form.description.trim(),
      categoryId: Number(form.categoryId),
      productCount: form.productCount ? Number(form.productCount) : 0,
      color: form.color,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black opacity-40" onClick={onClose} />

      <form onSubmit={handleSubmit} className="relative z-10 bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-50 rounded-md">
              <FaTag className="text-amber-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">{initialData ? "Edit Subcategory" : "Add Subcategory"}</h3>
              <p className="text-sm text-gray-500">{initialData ? "Update subcategory details" : "Create a new subcategory"}</p>
            </div>
          </div>

          <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Subcategory Name</label>
            <input ref={firstRef} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={`w-full p-2 border rounded mt-1 focus:ring-2 focus:ring-amber-300 outline-none ${errors.name ? "border-red-500" : "border-gray-300"}`} placeholder="e.g. Spices & Masalas" />
            {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium">Category</label>
            <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className={`w-full p-2 border rounded mt-1 focus:ring-2 focus:ring-amber-300 outline-none ${errors.categoryId ? "border-red-500" : "border-gray-300"}`}>
              <option value="">Select Category</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            {errors.categoryId && <p className="text-sm text-red-600 mt-1">{errors.categoryId}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full p-2 border rounded mt-1 focus:ring-2 focus:ring-amber-300 outline-none border-gray-300" rows="3" placeholder="Optional description" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Estimated products (optional)</label>
              <input value={form.productCount} onChange={(e) => setForm({ ...form, productCount: e.target.value })} className="w-full p-2 border rounded mt-1" placeholder="e.g. 12" inputMode="numeric" />
              {errors.productCount && <p className="text-sm text-red-600 mt-1">{errors.productCount}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium">Accent color</label>
              <select value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="w-full p-2 border rounded mt-1">
                <option value="bg-amber-100 text-amber-700">Amber</option>
                <option value="bg-emerald-100 text-emerald-700">Emerald</option>
                <option value="bg-sky-100 text-sky-700">Sky</option>
                <option value="bg-pink-100 text-pink-700">Pink</option>
                <option value="bg-violet-100 text-violet-700">Violet</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 border rounded">Cancel</button>
          <button type="submit" className="px-4 py-2 rounded bg-amber-600 text-white hover:bg-amber-700">{initialData ? "Update" : "Save"}</button>
        </div>
      </form>
    </div>
  );
};

export default SubcategoriesForm;
