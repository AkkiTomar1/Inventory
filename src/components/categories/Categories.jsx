import React, { useEffect, useMemo, useState } from "react";
import {
  FaBoxes,
  FaSearch,
  FaTh,
  FaListUl,
  FaSpinner,
  FaPlus,
} from "react-icons/fa";
import CategoryForm from "./CategoryForm";
import axiosInstance from "../../api/axiosInstance";

// ✅ Updated normalizeCategory for your API: { id, name }
const normalizeCategory = (raw) => {
  return {
    ...raw,
    categoryId: raw.id,
    categoryName: raw.name,
  };
};

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [sortAsc, setSortAsc] = useState(true);
  const [viewMode, setViewMode] = useState("table");
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const clearSessionAndRedirect = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const fetchCategories = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axiosInstance.get("/admin/product-categories");
      const listRaw = res.data?.data || res.data || [];
      const list = Array.isArray(listRaw)
        ? listRaw.map(normalizeCategory)
        : [];
      setCategories(list);
    } catch (err) {
      if (err?.response?.status === 401) {
        clearSessionAndRedirect();
        return;
      }
      setError("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await axiosInstance.get("/admin/products");
      const list = Array.isArray(res.data)
        ? res.data
        : res.data?.data ?? [];
      setProducts(list);
    } catch (err) {
      console.error("fetchProducts error", err);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  const getProductQty = (category) => {
    const cid = category?.categoryId;
    if (cid == null) return 0;
    const cidStr = String(cid);
    return products.reduce((acc, p) => {
      const pid =
        p.categoryId ??
        p.productCategoryId ??
        p.category?.categoryId ??
        p.categoryId;
      if (pid == null) return acc;
      return acc + (String(pid) === cidStr ? 1 : 0);
    }, 0);
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = categories.filter((c) => {
      if (!q) return true;
      const name = (c.categoryName || "").toLowerCase();
      return name.includes(q);
    });
    return [...list].sort((a, b) =>
      sortAsc
        ? (a.categoryName || "").localeCompare(b.categoryName || "")
        : (b.categoryName || "").localeCompare(a.categoryName || "")
    );
  }, [categories, search, sortAsc]);

  // ✅ Updated payload -> backend expects { name }
  const handleSaveCategory = async (formData) => {
    setSaving(true);
    try {
      const payload = {
        name: formData.name, // must match your API
        // If your backend later supports these, you can uncomment/update:
        // slug: (formData.name || "").toLowerCase().replace(/\s+/g, "-"),
        // description: formData.description,
        // image: "",
        // isActive: true,
      };

      if (formData.categoryId) {
        await axiosInstance.put(
          `/admin/product-categories/${encodeURIComponent(
            formData.categoryId
          )}`,
          payload
        );
      } else {
        await axiosInstance.post("/admin/product-categories", payload);
      }

      setShowModal(false);
      setEditingCategory(null);
      await fetchCategories();
    } catch (err) {
      if (err?.response?.status === 401) {
        clearSessionAndRedirect();
        return;
      }
      alert(err?.response?.data?.message || "Failed to save category");
    } finally {
      setSaving(false);
    }
  };

  const handleEditClick = (cat) => {
    setEditingCategory({
      name: cat.categoryName,
      // description is optional now; backend doesn't send it
      description: cat.categoryDescription ?? "",
      productCount: getProductQty(cat),
      categoryId: cat.categoryId,
    });
    setShowModal(true);
  };

  const handleDelete = async (category) => {
    if (!category?.categoryId) {
      alert("Invalid category id");
      return;
    }
    if (
      !window.confirm(
        `Delete "${category.categoryName || "Unnamed"}"?`
      )
    )
      return;

    try {
      setSaving(true);
      await axiosInstance.delete(
        `/admin/product-categories/${encodeURIComponent(
          category.categoryId
        )}`
      );
      await fetchCategories();
    } catch (err) {
      if (err?.response?.status === 401) {
        clearSessionAndRedirect();
        return;
      }
      alert(err?.response?.data?.message || "Failed to delete category");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center bg-[linear-gradient(135deg,#fb923c,#60a5fa)] text-amber-200 md:justify-between rounded-t-2xl p-3">
        <div className="flex items-center gap-4">
          <div className="rounded-lg bg-amber-50 p-3 flex items-center justify-center">
            <FaBoxes className="text-amber-600 text-xl" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-100">
              Categories
            </h1>
            <p className="text-sm text-gray-50 mt-1">
              Manage product categories.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-4 bg-white p-2 rounded-xl shadow-sm">
            <div className="text-sm text-gray-600">
              <div className="text-xs text-gray-400">Categories</div>
              <div className="text-lg text-center font-semibold">
                {categories.length}
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              setEditingCategory(null);
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-black hover:bg-amber-500 transition"
          >
            <FaPlus /> Add Category
          </button>
        </div>
      </div>

      <div className="bg-[linear-gradient(135deg,#fb923c,#60a5fa)] text-black rounded-b-2xl p-4 shadow-sm mb-12">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3 w-full sm:w-[480px]">
            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 w-full">
              <FaSearch className="text-gray-400" />
              <input
                className="ml-3 w-full outline-none text-sm"
                placeholder="Search categories..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="ml-2 text-xs text-gray-500"
                >
                  Clear
                </button>
              )}
            </div>
            <button
              onClick={() => setSortAsc((v) => !v)}
              className="flex items-center justify-center gap-1 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-black transition shadow-sm"
            >
              <span className="font-semibold text-sm">
                {sortAsc ? "A→Z" : "Z→A"}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-3 py-2 rounded-lg ${
                viewMode === "grid"
                  ? "bg-amber-300 font-semibold"
                  : "bg-white border border-gray-200"
              }`}
            >
              <FaTh />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`px-3 py-2 rounded-lg ${
                viewMode === "table"
                  ? "bg-amber-300 font-semibold"
                  : "bg-white border border-gray-200"
              }`}
            >
              <FaListUl />
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <FaSpinner className="animate-spin text-amber-500 text-3xl" />
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.length === 0 ? (
            <div className="col-span-full text-center py-20 bg-white rounded-2xl shadow">
              <div className="text-2xl text-gray-600 mb-3">
                No categories found
              </div>
              <p className="text-gray-500">
                Try adjusting your search or reload data.
              </p>
            </div>
          ) : (
            filtered.map((cat, idx) => {
              const key =
                cat.categoryId ?? cat.categoryName ?? `cat-${idx}`;
              const productQty = getProductQty(cat);
              return (
                <div
                  key={key}
                  className="bg-white rounded-2xl p-5 shadow hover:shadow-lg transition flex flex-col justify-between"
                >
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {cat.categoryName || "Unnamed"}
                    </h3>
                    <div className="text-sm text-gray-700">
                      Products:{" "}
                      <span className="font-semibold">
                        {productQty}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 flex gap-2 justify-end">
                    <button
                      onClick={() => handleEditClick(cat)}
                      className="px-3 py-1 rounded bg-amber-100 text-amber-700 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(cat)}
                      className="px-3 py-1 rounded bg-red-50 text-red-600 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow overflow-auto">
          <table className="min-w-full">
            <thead className="bg-[#2A2A2A]">
              <tr>
                <th className="text-left px-4 py-3 text-lg text-gray-100">
                  ID
                </th>
                <th className="text-left px-4 py-3 text-lg text-gray-100">
                  Category
                </th>
                <th className="text-left px-4 py-3 text-lg text-gray-100">
                  Products
                </th>
                <th className="text-center px-4 py-3 text-lg text-gray-100">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((cat, idx) => {
                const productQty = getProductQty(cat);
                return (
                  <tr
                    key={idx}
                    className={idx % 2 ? "bg-gray-200" : "bg-white"}
                  >
                    <td className="px-4 py-3">{idx + 1}</td>
                    <td className="px-4 py-3 font-semibold">
                      {cat.categoryName || "Unnamed"}
                    </td>
                    <td className="px-4 py-3">
                      {productQty}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEditClick(cat)}
                          className="text-amber-600 hover:text-amber-800 text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(cat)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <CategoryForm
          open={showModal}
          onClose={() => {
            setShowModal(false);
            setEditingCategory(null);
          }}
          onSave={handleSaveCategory}
          initialData={editingCategory}
        />
      )}

      {saving && (
        <div className="fixed bottom-4 right-4 bg-black/70 text-white px-3 py-2 rounded">
          Saving...
        </div>
      )}
    </div>
  );
};

export default Categories;
