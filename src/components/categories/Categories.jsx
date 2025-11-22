// src/components/categories/Categories.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  FaBoxes,
  FaSearch,
  FaTh,
  FaListUl,
  FaSpinner,
  FaPlus,
  FaChevronLeft,
  FaChevronRight,
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

const perPageOptions = [5, 10, 15, 20];

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

  // pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(perPageOptions[0]);

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
      const list = Array.isArray(listRaw) ? listRaw.map(normalizeCategory) : [];
      setCategories(list);
      // reset to first page when categories change
      setCurrentPage(1);
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
      const list = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
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
        p.categoryId ?? p.productCategoryId ?? p.category?.categoryId ?? p.categoryId;
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

  // --- Pagination helpers ---
  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));

  // ensure currentPage valid if perPage or filtered changes
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalPages]);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, currentPage, perPage]);

  // ✅ Updated payload -> backend expects { name }
  const handleSaveCategory = async (formData) => {
    setSaving(true);
    try {
      const payload = {
        name: formData.name, // must match your API
      };

      if (formData.categoryId) {
        await axiosInstance.put(
          `/admin/product-categories/${encodeURIComponent(formData.categoryId)}`,
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
    if (!window.confirm(`Delete "${category.categoryName || "Unnamed"}"?`)) return;

    try {
      setSaving(true);
      await axiosInstance.delete(
        `/admin/product-categories/${encodeURIComponent(category.categoryId)}`
      );
      // if last item on current page deleted, move back a page if needed
      const isLastItemOnPage = paginated.length === 1 && currentPage > 1;
      await fetchCategories();
      if (isLastItemOnPage) {
        setCurrentPage((p) => Math.max(1, p - 1));
      }
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

  // page number button generator (compact, shows neighbors)
  const pageRange = () => {
    const maxButtons = 7; // total visible numeric buttons including first/last
    const pages = [];
    if (totalPages <= maxButtons) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }
    // always show 1 and last, and neighbours around current page
    const side = 1; // neighbors each side
    const left = Math.max(2, currentPage - side);
    const right = Math.min(totalPages - 1, currentPage + side);

    pages.push(1);
    if (left > 2) pages.push("left-ellipsis");
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < totalPages - 1) pages.push("right-ellipsis");
    pages.push(totalPages);
    return pages;
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center bg-[linear-gradient(135deg,#fb923c,#60a5fa)] text-amber-200 md:justify-between rounded-t-2xl p-3">
        <div className="flex items-center gap-4">
          <div className="rounded-lg bg-amber-50 p-3 flex items-center justify-center">
            <FaBoxes className="text-amber-600 text-xl" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-100">Categories</h1>
            <p className="text-sm text-gray-50 mt-1">Manage product categories.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-4 bg-white p-2 rounded-xl shadow-sm">
            <div className="text-sm text-gray-600">
              <div className="text-xs text-gray-400">Categories</div>
              <div className="text-lg text-center font-semibold">{categories.length}</div>
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

      <div className="bg-[linear-gradient(135deg,#fb923c,#60a5fa)] text-black rounded-b-2xl p-4 shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3 w-full sm:w-[480px]">
            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 w-full">
              <FaSearch className="text-gray-400" />
              <input
                className="ml-3 w-full outline-none text-sm"
                placeholder="Search categories..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1); // reset page on search
                }}
              />
              {search && (
                <button onClick={() => { setSearch(""); setCurrentPage(1); }} className="ml-2 text-xs text-gray-500">
                  Clear
                </button>
              )}
            </div>
            <button
              onClick={() => setSortAsc((v) => !v)}
              className="flex items-center justify-center gap-1 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-black transition shadow-sm"
            >
              <span className="font-semibold text-sm">{sortAsc ? "A→Z" : "Z→A"}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-3 py-2 rounded-lg ${viewMode === "grid" ? "bg-amber-300 font-semibold" : "bg-white border border-gray-200"}`}
            >
              <FaTh />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`px-3 py-2 rounded-lg ${viewMode === "table" ? "bg-amber-300 font-semibold" : "bg-white border border-gray-200"}`}
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
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginated.length === 0 ? (
              <div className="col-span-full text-center py-20 bg-white rounded-2xl shadow">
                <div className="text-2xl text-gray-600 mb-3">No categories found</div>
                <p className="text-gray-500">Try adjusting your search or reload data.</p>
              </div>
            ) : (
              paginated.map((cat, idx) => {
                const key = cat.categoryId ?? cat.categoryName ?? `cat-${idx}`;
                const productQty = getProductQty(cat);
                return (
                  <div key={key} className="bg-white rounded-2xl p-5 shadow hover:shadow-lg transition flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{cat.categoryName || "Unnamed"}</h3>
                      <div className="text-sm text-gray-700">
                        Products: <span className="font-semibold">{productQty}</span>
                      </div>
                    </div>

                    <div className="mt-6 flex gap-2 justify-end">
                      <button onClick={() => handleEditClick(cat)} className="px-3 py-1 rounded bg-amber-100 text-amber-700 text-sm">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(cat)} className="px-3 py-1 rounded bg-red-50 text-red-600 text-sm">
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Pagination Controls */}
          <div className="mt-6 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Rows per page:</label>
              <select
                value={perPage}
                onChange={(e) => {
                  setPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="p-2 border rounded"
              >
                {perPageOptions.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <div className="text-sm text-gray-600">
                {totalItems === 0 ? "0" : (currentPage - 1) * perPage + 1}-
                {Math.min(currentPage * perPage, totalItems)} of {totalItems}
              </div>

              <nav className="inline-flex items-center gap-1" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded border bg-white disabled:opacity-40"
                  aria-label="Previous page"
                >
                  <FaChevronLeft />
                </button>

                {pageRange().map((p, i) => {
                  if (p === "left-ellipsis" || p === "right-ellipsis") {
                    return (
                      <span key={String(p) + i} className="px-2 text-sm text-gray-500">
                        …
                      </span>
                    );
                  }
                  return (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className={`px-3 py-1 rounded ${p === currentPage ? "bg-amber-300 font-semibold" : "bg-white border"}`}
                      aria-current={p === currentPage ? "page" : undefined}
                    >
                      {p}
                    </button>
                  );
                })}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded border bg-white disabled:opacity-40"
                  aria-label="Next page"
                >
                  <FaChevronRight />
                </button>
              </nav>
            </div>
          </div>
        </>
      ) : (
        // Table view
        <>
          <div className="bg-white rounded-2xl shadow overflow-auto">
            <table className="min-w-full">
              <thead className="bg-linear-to-l from-amber-900 via-amber-950 to-amber-900">
                <tr>
                  <th className="text-left px-4 py-3 text-lg text-gray-100">ID</th>
                  <th className="text-left px-4 py-3 text-lg text-gray-100">Category</th>
                  <th className="text-left px-4 py-3 text-lg text-gray-100">Products</th>
                  <th className="text-center px-4 py-3 text-lg text-gray-100">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((cat, idx) => {
                  const productQty = getProductQty(cat);
                  const rowIndex = (currentPage - 1) * perPage + idx;
                  return (
                    <tr key={cat.categoryId ?? idx} className={rowIndex % 2 ? "bg-gray-200" : "bg-white"}>
                      <td className="px-4 py-3">{rowIndex + 1}</td>
                      <td className="px-4 py-3 font-semibold">{cat.categoryName || "Unnamed"}</td>
                      <td className="px-4 py-3">{productQty}</td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => handleEditClick(cat)} className="text-amber-800 bg-amber-200 rounded-xl shadow-xl pl-2 p-1 pr-2 cursor-pointer hover:text-amber-950 text-sm">
                            Edit
                          </button>
                          <button onClick={() => handleDelete(cat)} className="text-red-800 bg-red-200 rounded-xl shadow-xl pl-2 pr-2 p-1 cursor-pointer hover:text-red-950 text-sm">
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

          {/* Pagination Controls (table view) */}
          <div className="mt-6 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <label className="text-md text-gray-600">Rows per page:</label>
              <select
                value={perPage}
                onChange={(e) => {
                  setPerPage(Number(e.target.value));
                  setCurrentPage(1);

                }}
                className="p-1 border rounded-2xl"
              >
                {perPageOptions.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 pr-4">
              <div className="text-sm text-gray-600">
                {totalItems === 0 ? "0" : (currentPage - 1) * perPage + 1}-
                {Math.min(currentPage * perPage, totalItems)} of {totalItems}
              </div>

              <nav className="inline-flex items-center gap-2" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-xl border bg-white disabled:opacity-40"
                  aria-label="Previous page"
                >
                  <FaChevronLeft />
                </button>

                {pageRange().map((p, i) => {
                  if (p === "left-ellipsis" || p === "right-ellipsis") {
                    return (
                      <span key={String(p) + i} className="px-2 text-sm text-gray-500">
                        …
                      </span>
                    );
                  }
                  return (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className={`px-3 py-1 rounded-2xl ${p === currentPage ? "bg-amber-600 font-semibold" : "bg-white border rounded-2xl"}`}
                      aria-current={p === currentPage ? "page" : undefined}
                    >
                      {p}
                    </button>
                  );
                })}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-2xl border bg-white disabled:opacity-40"
                  aria-label="Next page"
                >
                  <FaChevronRight />
                </button>
              </nav>
            </div>
          </div>
        </>
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
        <div className="fixed bottom-4 right-4 bg-black/70 text-white px-3 py-2 rounded">Saving...</div>
      )}
    </div>
  );
};

export default Categories;
