import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  FaTimes,
  FaTags,
  FaRupeeSign,
  FaBoxes,
  FaLayerGroup,
  FaUserTie,
  FaSave,
} from "react-icons/fa";

const ProductForm = ({
  open,
  onClose,
  onSave,
  initialData,
  categories,
  subcategories,
  suppliers,
}) => {
  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [subCategoryId, setSubCategoryId] = useState("");
  const [supplierName, setSupplierName] = useState("");

  const [errors, setErrors] = useState({});
  const firstInputRef = useRef(null);

  // Filter subcategories based on selected category
  const filteredSubcategories = useMemo(() => {
    if (!categoryId) return [];
    return subcategories.filter(
      (s) => String(s.categoryId) === String(categoryId)
    );
  }, [categoryId, subcategories]);

  useEffect(() => {
    if (initialData) {
      setProductName(initialData.productName ?? "");
      setPrice(
        initialData.price != null ? String(initialData.price) : ""
      );
      setStock(
        initialData.stock != null ? String(initialData.stock) : ""
      );
      setCategoryId(
        initialData.categoryId != null
          ? String(initialData.categoryId)
          : ""
      );
      setSubCategoryId(
        initialData.subCategoryId != null
          ? String(initialData.subCategoryId)
          : ""
      );
      setSupplierName(initialData.supplierName ?? "");
    } else {
      setProductName("");
      setPrice("");
      setStock("");
      // default category if exists
      setCategoryId(categories[0]?.categoryId ? String(categories[0].categoryId) : "");
      setSubCategoryId("");
      setSupplierName("");
    }
    setErrors({});

    if (open) {
      setTimeout(() => firstInputRef.current?.focus?.(), 80);
    }
  }, [initialData, open, categories]);

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
    if (!productName.trim())
      e.productName = "Product name is required";
    if (!price.trim()) e.price = "Price is required";
    if (price && Number(price) < 0)
      e.price = "Price cannot be negative";
    if (!stock.trim()) e.stock = "Stock is required";
    if (stock && Number(stock) < 0)
      e.stock = "Stock cannot be negative";
    if (!categoryId) e.categoryId = "Category is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSave({
      productId: initialData?.productId ?? null,
      productName: productName.trim(),
      price: Number(price),
      stock: Number(stock),
      categoryId: categoryId ? Number(categoryId) : null,
      subCategoryId: subCategoryId ? Number(subCategoryId) : null,
      supplierName: supplierName.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      <motion.form
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-2xl bg-white rounded-2xl shadow-xl p-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-50 rounded-md">
              <FaTags className="text-amber-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">
                {initialData ? "Edit Product" : "Add Product"}
              </h2>
              <p className="text-sm text-gray-500">
                {initialData
                  ? "Update product details"
                  : "Create a new product entry"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-md text-gray-500 hover:bg-gray-100"
          >
            <FaTimes />
          </button>
        </div>

        {/* Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Product Name */}
          <label className="block">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
              <FaTags /> <span>Product Name</span>
            </div>
            <input
              ref={firstInputRef}
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className={`w-full p-2 border rounded ${
                errors.productName
                  ? "border-red-500"
                  : "border-gray-200"
              }`}
              placeholder="e.g. iPhone 15"
            />
            {errors.productName && (
              <p className="text-xs text-red-600 mt-1">
                {errors.productName}
              </p>
            )}
          </label>

          {/* Price */}
          <label className="block">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
              <FaRupeeSign /> <span>Price</span>
            </div>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className={`w-full p-2 border rounded ${
                errors.price ? "border-red-500" : "border-gray-200"
              }`}
              placeholder="e.g. 99999"
              min={0}
            />
            {errors.price && (
              <p className="text-xs text-red-600 mt-1">
                {errors.price}
              </p>
            )}
          </label>

          {/* Stock */}
          <label className="block">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
              <FaBoxes /> <span>Stock</span>
            </div>
            <input
              type="number"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              className={`w-full p-2 border rounded ${
                errors.stock ? "border-red-500" : "border-gray-200"
              }`}
              placeholder="e.g. 50"
              min={0}
            />
            {errors.stock && (
              <p className="text-xs text-red-600 mt-1">
                {errors.stock}
              </p>
            )}
          </label>

          {/* Category */}
          <label className="block">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
              <FaLayerGroup /> <span>Category</span>
            </div>
            <select
              className={`w-full p-2 border rounded ${
                errors.categoryId
                  ? "border-red-500"
                  : "border-gray-200"
              }`}
              value={categoryId}
              onChange={(e) => {
                setCategoryId(e.target.value);
                setSubCategoryId(""); // reset subcategory when category changes
              }}
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option
                  key={c.categoryId}
                  value={c.categoryId}
                >
                  {c.categoryName}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="text-xs text-red-600 mt-1">
                {errors.categoryId}
              </p>
            )}
          </label>

          {/* Subcategory */}
          <label className="block">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
              <FaLayerGroup /> <span>Subcategory</span>
            </div>
            <select
              className="w-full p-2 border rounded border-gray-200"
              value={subCategoryId}
              onChange={(e) => setSubCategoryId(e.target.value)}
              disabled={!categoryId}
            >
              <option value="">
                {categoryId
                  ? "Select subcategory"
                  : "Select category first"}
              </option>
              {filteredSubcategories.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>

          {/* Supplier */}
          <label className="block md:col-span-2">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
              <FaUserTie /> <span>Supplier</span>
            </div>
            <select
              className="w-full p-2 border rounded border-gray-200"
              value={supplierName}
              onChange={(e) => setSupplierName(e.target.value)}
            >
              <option value="">Select supplier (optional)</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border rounded bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded bg-amber-600 text-white hover:bg-amber-700 flex items-center gap-2"
          >
            <FaSave />
            {initialData ? "Update" : "Save"}
          </button>
        </div>
      </motion.form>
    </div>
  );
};

export default ProductForm;
