import React, { useEffect, useState } from "react";

const CategoryForm = ({ open, onClose, onSave, initialData = null }) => {
  const [form, setForm] = useState({
    name: "",
    description: "",
    productCount: "",
    color: "amber",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || "",
        description: initialData.description || "",
        productCount: initialData.productCount ?? "",
        color: initialData.color || "amber",
      });
    } else {
      setForm({ name: "", description: "", productCount: "", color: "amber" });
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

    const data = {
      name: form.name.trim(),
      description: form.description.trim(),
      productCount: form.productCount ? Number(form.productCount) : 0,
      color: form.color,
    };

    if (initialData?.categoryId) data.categoryId = initialData.categoryId;

    if (onSave) onSave(data);
    onClose && onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black opacity-40" onClick={onClose} />

      <form
        onSubmit={handleSubmit}
        className="relative z-10 bg-white rounded-2xl shadow-xl w-full max-w-lg p-6"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            {initialData ? "Edit Category" : "Add Category"}
          </h3>
          <button type="button" onClick={onClose} className="text-gray-500">
            ✕
          </button>
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
            {errors.name && (
              <p className="text-sm text-red-600 mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium">Description</label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="w-full p-2 border rounded mt-1"
              rows="3"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border rounded"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-amber-600 text-white rounded"
          >
            {initialData ? "Update" : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CategoryForm;
