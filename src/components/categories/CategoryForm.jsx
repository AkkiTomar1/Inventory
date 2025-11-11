import React, { useEffect, useState } from "react";

/**
 * Nice modal form for Add / Edit Category
 * Props:
 * - open (boolean)
 * - onClose()
 * - onSave(formData) => { name, description, productCount?, color? }
 * - initialData (optional)
 */

const CategoryForm=({ open, onClose, onSave, initialData = null }) =>{
  const [form, setForm] = useState({
    name: "",
    description: "",
    productCount: "",
    color: "bg-amber-100 text-amber-700",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || "",
        description: initialData.description || "",
        productCount: initialData.productCount ?? "",
        color: initialData.color || "bg-amber-100 text-amber-700",
      });
    } else {
      setForm({
        name: "",
        description: "",
        productCount: "",
        color: "bg-amber-100 text-amber-700",
      });
    }
    setErrors({});
  }, [initialData, open]);

  if (!open) return null;

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Category name is required";
    if (form.productCount && isNaN(Number(form.productCount)))
      e.productCount = "Enter a valid number";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    onSave({
      name: form.name.trim(),
      description: form.description.trim(),
      productCount: form.productCount ? Number(form.productCount) : 0,
      color: form.color,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black opacity-40" onClick={onClose}></div>

      <form onSubmit={handleSubmit} className="relative z-10 bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">{initialData ? "Edit Category" : "Add Category"}</h3>
          <button type="button" onClick={onClose} className="text-gray-500">✕</button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Category Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full p-2 border rounded mt-1"
              placeholder="e.g. Beverages"
            />
            {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full p-2 border rounded mt-1"
              rows="3"
              placeholder="A short description about the category"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Estimated products (optional)</label>
              <input
                value={form.productCount}
                onChange={(e) => setForm({ ...form, productCount: e.target.value })}
                className="w-full p-2 border rounded mt-1"
                placeholder="e.g. 24"
                inputMode="numeric"
              />
              {errors.productCount && <p className="text-sm text-red-600 mt-1">{errors.productCount}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium">Accent color</label>
              <select
                value={form.color}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
                className="w-full p-2 border rounded mt-1"
              >
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
          <button type="submit" className="px-4 py-2 rounded bg-amber-600 text-white hover:bg-amber-700">
            {initialData ? "Update" : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CategoryForm;