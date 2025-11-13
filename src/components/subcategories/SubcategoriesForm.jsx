// SubcategoriesForm.jsx
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

const SubcategoriesForm = ({ open, onClose, onSave, initialData, categories }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [productCount, setProductCount] = useState(0);
  const [color, setColor] = useState("bg-amber-100 text-amber-700");

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setDescription(initialData.description);
      setCategoryId(initialData.categoryId);
      setProductCount(initialData.productCount);
      setColor(initialData.color);
    } else {
      setName("");
      setDescription("");
      setCategoryId(categories[0]?.id || "");
      setProductCount(0);
      setColor("bg-amber-100 text-amber-700");
    }
  }, [initialData, categories, open]);

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name.trim()) return alert("Enter subcategory name");

    onSave({
      name: name.trim(),
      description: description.trim(),
      categoryId,
      productCount,
      color,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <motion.form
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative z-10 w-full max-w-xl bg-white rounded-2xl shadow-xl p-6"
      >
        <h2 className="text-xl font-bold mb-4">{initialData ? "Edit Subcategory" : "Add Subcategory"}</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          <div>
            <label className="text-sm text-gray-600">Name</label>
            <input
              className="w-full border p-2 rounded mt-1"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Category</label>
            <select
              className="w-full border p-2 rounded mt-1"
              value={categoryId}
              onChange={(e) => setCategoryId(Number(e.target.value))}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="col-span-2">
            <label className="text-sm text-gray-600">Description</label>
            <textarea
              rows={3}
              className="w-full border p-2 rounded mt-1"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Product Count</label>
            <input
              type="number"
              className="w-full border p-2 rounded mt-1"
              value={productCount}
              onChange={(e) => setProductCount(Number(e.target.value))}
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Color</label>
            <select
              className="w-full border p-2 rounded mt-1"
              value={color}
              onChange={(e) => setColor(e.target.value)}
            >
              <option value="bg-amber-100 text-amber-700">Amber</option>
              <option value="bg-emerald-100 text-emerald-700">Emerald</option>
              <option value="bg-sky-100 text-sky-700">Sky</option>
              <option value="bg-pink-100 text-pink-700">Pink</option>
            </select>
          </div>
        </div>

        {/* BUTTONS */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            type="button"
            className="px-4 py-2 border rounded"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
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
