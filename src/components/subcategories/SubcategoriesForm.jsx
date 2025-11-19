import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

const SubcategoriesForm = ({
  open,
  onClose,
  onSave,
  initialData,
  categories,
  selectedCategoryId,
}) => {
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");

  useEffect(() => {
    const defaultCategoryId =
      selectedCategoryId ||
      (categories[0]?.id ? String(categories[0].id) : "");

    if (initialData) {
      setName(initialData.name || "");
      setCategoryId(
        initialData.categoryId != null
          ? String(initialData.categoryId)
          : defaultCategoryId
      );
    } else {
      setName("");
      setCategoryId(defaultCategoryId);
    }
  }, [initialData, categories, selectedCategoryId, open]);

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name.trim()) {
      alert("Subcategory name is required");
      return;
    }
    if (!categoryId) {
      alert("Please select a category");
      return;
    }

    onSave({
      id: initialData?.id ?? null,
      name: name.trim(),
      categoryId: Number(categoryId),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose}></div>

      {/* Modal form */}
      <motion.form
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative z-10 w-full max-w-xl bg-white rounded-2xl shadow-xl p-6"
        onSubmit={handleSubmit}
      >
        <h2 className="text-xl font-bold mb-4">
          {initialData ? "Edit Subcategory" : "Add Subcategory"}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Name */}
          <div className="sm:col-span-2">
            <label className="text-sm text-gray-600">Name</label>
            <input
              className="w-full border p-2 rounded mt-1"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Category */}
          <div className="sm:col-span-2">
            <label className="text-sm text-gray-600">Category</label>
            <select
              className="w-full border p-2 rounded mt-1"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              {categories.length === 0 ? (
                <option value="">No categories</option>
              ) : (
                categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
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
            {initialData ? "Update" : "Create"}
          </button>
        </div>
      </motion.form>
    </div>
  );
};

export default SubcategoriesForm;
