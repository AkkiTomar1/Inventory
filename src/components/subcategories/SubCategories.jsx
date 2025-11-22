// src/components/subcategories/Subcategories.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  FaSpinner,
  FaPlus,
  FaTh,
  FaListUl,
  FaSearch,
  FaBoxes,
  FaAngleLeft,
  FaAngleRight,
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
} from "react-icons/fa";
import SubcategoriesForm from "./SubcategoriesForm";
import axiosInstance from "../../api/axiosInstance";

// Normalize category from /admin/product-categories
const normalizeCategory = (raw) => {
  const categoryId =
    raw.categoryId ?? raw.id ?? raw.categoryID ?? raw.productCategoryId ?? null;

  const categoryName =
    raw.categoryName ?? raw.name ?? raw.category_title ?? raw.title ?? "";

  return {
    id: categoryId,
    categoryId: categoryId,
    name: categoryName || "Unnamed",
  };
};

// Normalize subcategory from /admin/subcategories
const normalizeSubcategory = (raw) => ({
  id: raw.id,
  name: raw.name,
  categoryId: raw.categoryId,
  categoryName: raw.categoryName,
});

const Subcategories = () => {
  const [subcategories, setSubcategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [sortAsc, setSortAsc] = useState(true);
  const [viewMode, setViewMode] = useState("table"); // "grid" | "table"
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  // pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(() => (viewMode === "grid" ? 8 : 10));

  const menuRef = useRef(null);

  const clearSessionAndRedirect = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  // ---------- API CALLS ----------
  const fetchCategories = async () => {
    try {
      const res = await axiosInstance.get("/admin/product-categories");
      const listRaw = Array.isArray(res.data) ? res.data : res.data?.data || [];
      const mapped = listRaw.map(normalizeCategory).filter((c) => c.categoryId != null);
      setCategories(mapped);
    } catch (err) {
      console.error("fetchCategories (for subcategories) error:", err);
    }
  };

  const fetchSubcategories = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axiosInstance.get("/admin/subcategories");
      const listRaw = Array.isArray(res.data) ? res.data : res.data?.data || [];
      const mapped = listRaw.map(normalizeSubcategory);
      setSubcategories(mapped);
    } catch (err) {
      console.error("fetchSubcategories error:", err);
      if (err?.response?.status === 401) {
        clearSessionAndRedirect();
        return;
      }
      const serverMsg = err?.response?.data?.message || err?.message || "Server error";
      setError(`Failed to load subcategories: ${serverMsg}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchSubcategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reset page when filters/search/view/pageSize change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedCategoryId, sortAsc, viewMode, pageSize]);

  // when view mode changes set sensible pageSize
  useEffect(() => {
    setPageSize(viewMode === "grid" ? 8 : 10);
  }, [viewMode]);

  // ---------- FILTER + SORT ----------
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = [...subcategories];

    if (selectedCategoryId) {
      list = list.filter((s) => s.categoryId != null && String(s.categoryId) === String(selectedCategoryId));
    }

    if (q) {
      list = list.filter((s) => {
        const name = (s.name || "").toLowerCase();
        const catName = (s.categoryName || "").toLowerCase();
        return name.includes(q) || catName.includes(q);
      });
    }

    return list.sort((a, b) =>
      sortAsc ? (a.name || "").localeCompare(b.name || "") : (b.name || "").localeCompare(a.name || "")
    );
  }, [subcategories, search, sortAsc, selectedCategoryId]);

  // ---------- PAGINATION ----------
  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalPages]);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return filtered.slice(start, end);
  }, [filtered, currentPage, pageSize]);

  const showFrom = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const showTo = Math.min(totalItems, currentPage * pageSize);

  const scrollToTopAnchor = () => {
    const anchorTop = document.querySelector(".subcategories-top-anchor")?.getBoundingClientRect()?.top ?? 0;
    window.scrollTo({ top: window.scrollY + anchorTop - 20, behavior: "smooth" });
  };

  const goToPage = (n) => {
    const page = Math.max(1, Math.min(totalPages, n));
    setCurrentPage(page);
    scrollToTopAnchor();
  };

  // professional pill button
  const PageButton = ({ page, active }) => (
    <button
      onClick={() => goToPage(page)}
      aria-current={active ? "page" : undefined}
      aria-label={`Page ${page}`}
      className={`inline-flex items-center justify-center min-w-[44px] h-10 px-4 rounded-full text-sm font-medium transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 ${active ? "bg-gradient-to-r from-amber-600 to-amber-400 text-white shadow-lg" : "bg-white border border-gray-200 text-gray-700 hover:shadow-sm"
        }`}
    >
      {page}
    </button>
  );

  const renderPageButtons = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => <PageButton key={p} page={p} active={p === currentPage} />);
    }

    const buttons = [];
    buttons.push(<PageButton key={1} page={1} active={1 === currentPage} />);

    if (currentPage > 4) buttons.push(<span key="left-ellipsis" className="px-2 text-gray-500">…</span>);

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let p = start; p <= end; p++) {
      buttons.push(<PageButton key={p} page={p} active={p === currentPage} />);
    }

    if (currentPage < totalPages - 3) buttons.push(<span key="right-ellipsis" className="px-2 text-gray-500">…</span>);

    buttons.push(<PageButton key={totalPages} page={totalPages} active={totalPages === currentPage} />);
    return buttons;
  };

  // ---------- HANDLERS ----------
  const openCreate = () => {
    setEditing(null);
    setShowForm(true);
  };

  const openEdit = (sub) => {
    const initial = { id: sub.id, name: sub.name || "", categoryId: sub.categoryId ?? "" };
    setEditing(initial);
    setShowForm(true);
  };

  const handleSave = async (formObj) => {
    setSaving(true);
    try {
      const catRes = await axiosInstance.get(`/admin/product-categories/${formObj.categoryId}`);
      const catRaw = catRes.data?.data || catRes.data || {};
      const categoryName = catRaw.categoryName ?? catRaw.name ?? catRaw.category_title ?? catRaw.title ?? "";

      const payload = {
        id: formObj.id ?? undefined,
        name: formObj.name,
        categoryId: formObj.categoryId,
        categoryName: categoryName,
      };

      if (formObj.id) {
        await axiosInstance.put(`/admin/subcategories/${encodeURIComponent(formObj.id)}`, payload);
      } else {
        await axiosInstance.post("/admin/subcategories", payload);
      }

      if (formObj.categoryId) setSelectedCategoryId(String(formObj.categoryId));
      setShowForm(false);
      setEditing(null);
      await fetchSubcategories();
    } catch (err) {
      if (err?.response?.status === 401) {
        clearSessionAndRedirect();
        return;
      }
      console.error("save subcategory error:", err);
      alert(err?.response?.data?.message || "Failed to save subcategory");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (sub) => {
    const id = sub?.id;
    if (!id) {
      alert("Invalid subcategory id");
      return;
    }
    if (!window.confirm(`Delete "${sub.name || "Unnamed"}"?`)) return;

    setSaving(true);
    try {
      await axiosInstance.delete(`/admin/subcategories/${encodeURIComponent(id)}`);
      await fetchSubcategories();
    } catch (err) {
      if (err?.response?.status === 401) {
        clearSessionAndRedirect();
        return;
      }
      console.error("delete subcategory error:", err);
      alert(err?.response?.data?.message || "Failed to delete subcategory");
    } finally {
      setSaving(false);
    }
  };

  const currentCategoryName =
    selectedCategoryId &&
      categories.find((c) => String(c.id) === String(selectedCategoryId))?.name
      ? categories.find((c) => String(c.id) === String(selectedCategoryId))?.name
      : "All Categories";

  // ---------- UI ----------
  return (
    <div>
      {/* anchor used by pagination scroll */}
      <div className="subcategories-top-anchor" />

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center bg-[linear-gradient(135deg,#fb923c,#60a5fa)] text-amber-200 md:justify-between rounded-t-2xl p-3">
        <div className="flex items-center gap-4">
          <div className="rounded-lg bg-amber-50 p-3 flex items-center justify-center">
            <FaBoxes className="text-amber-600 text-xl" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-100">Subcategories</h1>
            <p className="text-sm text-gray-50 mt-1">Manage subcategories and link them to categories.</p>
            <p className="text-xs text-gray-100/90 mt-1">Active Category: <span className="font-semibold">{currentCategoryName}</span></p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-4 bg-white p-2 rounded-xl shadow-sm">
            <div className="text-sm text-gray-600">
              <div className="text-xs text-gray-400">Subcategories</div>
              <div className="text-lg font-semibold">{filtered.length}</div>
            </div>
            <div className="border-l h-8" />
            <div className="text-sm text-gray-600">
              <div className="text-xs text-gray-400">Categories</div>
              <div className="text-lg font-semibold">{categories.length}</div>
            </div>
          </div>

          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-black hover:bg-amber-500 transition">
            <FaPlus /> Add Subcategory
          </button>
        </div>
      </div>

      {/* ERROR */}
      {error && <div className="bg-red-100 text-red-700 text-sm px-4 py-2">{error}</div>}

      {/* FILTER BAR */}
      <div className="bg-[linear-gradient(135deg,#fb923c,#60a5fa)] text-black rounded-b-2xl p-4 shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3 w-full sm:w-[480px]">
            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 w-full">
              <FaSearch className="text-gray-400" />
              <input className="ml-3 w-full outline-none text-sm" placeholder="Search subcategories or category..." value={search} onChange={(e) => setSearch(e.target.value)} />
              {search && <button onClick={() => setSearch("")} className="ml-2 text-xs text-gray-500">Clear</button>}
            </div>
            <button onClick={() => setSortAsc((v) => !v)} className="flex items-center justify-center gap-1 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-black transition shadow-sm">
              <span className="font-semibold text-sm">{sortAsc ? "A→Z" : "Z→A"}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <select className="px-3 py-2 rounded-lg bg-white border border-gray-200 text-sm" value={selectedCategoryId} onChange={(e) => setSelectedCategoryId(e.target.value)}>
              {categories.length === 0 ? <option value="">No categories</option> : <>
                <option value="">All Categories</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </>}
            </select>

            <button onClick={() => setViewMode("grid")} className={`px-3 py-2 rounded-lg ${viewMode === "grid" ? "bg-amber-300 font-semibold" : "bg-white border border-gray-200"}`}>
              <FaTh />
            </button>
            <button onClick={() => setViewMode("table")} className={`px-3 py-2 rounded-lg ${viewMode === "table" ? "bg-amber-300 font-semibold" : "bg-white border border-gray-200"}`}>
              <FaListUl />
            </button>
          </div>
        </div>
      </div>

      {/* Showing range + controls */}
      <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="text-sm text-gray-600">
          Showing <span className="font-semibold">{showFrom}</span> to <span className="font-semibold">{showTo}</span> of <span className="font-semibold">{totalItems}</span> subcategories
        </div>

        <div className="text-sm text-gray-600">
            Page <span className="font-semibold">{currentPage}</span> of <span className="font-semibold">{totalPages}</span>
          </div>

      </div>

      {/* CONTENT */}
      {loading ? (
        <div className="py-10 flex justify-center">
          <FaSpinner className="animate-spin text-amber-500 text-2xl" />
        </div>
      ) : viewMode === "grid" ? (
        paginated.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow">
            <div className="text-2xl text-gray-600 mb-3">{error || "No subcategories found"}</div>
            {!error && <p className="text-gray-500">Try adjusting your search or switch category.</p>}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {paginated.map((sub) => {
              const catName = sub.categoryName || categories.find((c) => String(c.id) === String(sub.categoryId))?.name;
              return (
                <div key={sub.id} className="p-4 bg-white rounded-2xl shadow hover:shadow-lg transition flex flex-col justify-between h-full">
                  <div>
                    <div className="font-semibold text-lg">{sub.name || "Unnamed"}</div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm text-gray-500">{catName ?? sub.categoryId ?? "-"}</div>
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(sub)} className="px-3 py-1 bg-amber-100 text-amber-700 rounded">Edit</button>
                      <button onClick={() => handleDelete(sub)} className="px-3 py-1 bg-red-50 text-red-600 rounded">Delete</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        <div className="bg-white rounded-2xl shadow overflow-auto">
          <table className="min-w-full">
            <thead className="bg-linear-to-l from-amber-900 via-amber-950 to-amber-900">
              <tr>
                <th className="text-left px-4 py-3 text-sm text-gray-100">ID</th>
                <th className="text-left px-4 py-3 text-sm text-gray-100">Subcategory</th>
                <th className="text-left px-4 py-3 text-sm text-gray-100">Category</th>
                <th className="text-center px-4 py-3 text-sm text-gray-100">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-sm text-gray-500">{error || "No subcategories found"}</td>
                </tr>
              ) : (
                paginated.map((sub, i) => (
                  <tr key={sub.id ?? i} className={i % 2 ? "bg-gray-50" : "bg-white"}>
                    <td className="px-4 py-3">{(currentPage - 1) * pageSize + (i + 1)}</td>
                    <td className="px-4 py-3 font-semibold">{sub.name || "-"}</td>
                    <td className="px-4 py-3">{sub.categoryName || categories.find((c) => String(c.id) === String(sub.categoryId))?.name || sub.categoryId || "-"}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => openEdit(sub)} className="text-amber-800 bg-amber-200 rounded-xl pl-2 p-1 pr-2 cursor-pointer hover:text-amber-950 text-sm">Edit</button>
                        <button onClick={() => handleDelete(sub)} className="text-red-800 bg-red-200 rounded-xl pl-2 pr-2 p-1 cursor-pointer hover:text-red-950 text-sm">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* PAGINATION (bottom, professional design) */}
      <div className="mt-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-3">
          <label className="text-sm text-gray-600">Per page</label>
          <select
            className="px-3 py-2 rounded border border-gray-200 bg-white text-sm"
            value={pageSize}
            onChange={(e) => {
              const val = Number(e.target.value) || (viewMode === "grid" ? 8 : 10);
              setPageSize(val);
              setCurrentPage(1);
            }}
            aria-label="Items per page"
          >
            {/* options: 5 / 10 / 15 / 20 */}
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={15}>15</option>
            <option value={20}>20</option>
          </select>
        </div>

          <div className="flex items-center gap-2 justify-center md:justify-end flex-wrap">
            <button onClick={() => goToPage(1)} disabled={currentPage === 1} aria-label="First page" className={`inline-flex items-center justify-center w-10 h-10 rounded-full transition ${currentPage === 1 ? "bg-gray-100 text-gray-300 cursor-not-allowed" : "bg-white border border-gray-200 hover:shadow"}`} title="First">
              <FaAngleDoubleLeft />
            </button>

            <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} aria-label="Previous page" className={`inline-flex items-center justify-center w-10 h-10 rounded-full transition ${currentPage === 1 ? "bg-gray-100 text-gray-300 cursor-not-allowed" : "bg-white border border-gray-200 hover:shadow"}`} title="Prev">
              <FaAngleLeft />
            </button>

            <div className="flex items-center gap-2 flex-wrap">
              {renderPageButtons()}
            </div>

            <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages} aria-label="Next page" className={`inline-flex items-center justify-center w-10 h-10 rounded-full transition ${currentPage === totalPages ? "bg-gray-100 text-gray-300 cursor-not-allowed" : "bg-white border border-gray-200 hover:shadow"}`} title="Next">
              <FaAngleRight />
            </button>

            <button onClick={() => goToPage(totalPages)} disabled={currentPage === totalPages} aria-label="Last page" className={`inline-flex items-center justify-center w-10 h-10 rounded-full transition ${currentPage === totalPages ? "bg-gray-100 text-gray-300 cursor-not-allowed" : "bg-white border border-gray-200 hover:shadow"}`} title="Last">
              <FaAngleDoubleRight />
            </button>
          </div>
        </div>
      </div>

      {/* MODAL FORM */}
      {showForm && (
        <SubcategoriesForm
          open={showForm}
          onClose={() => {
            setShowForm(false);
            setEditing(null);
          }}
          onSave={handleSave}
          initialData={editing}
          categories={categories}
          selectedCategoryId={selectedCategoryId}
        />
      )}

      {saving && <div className="fixed bottom-4 right-4 bg-black/70 text-white px-3 py-2 rounded">Saving...</div>}
    </div>
  );
};

export default Subcategories;
