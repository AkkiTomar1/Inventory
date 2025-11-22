// src/components/purchases/Purchase.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  FaShoppingCart,
  FaPlus,
  FaSpinner,
  FaFileInvoice,
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
  FaDownload,
} from "react-icons/fa";
import PurchaseForm from "./PurchaseForm";
import axiosInstance from "../../api/axiosInstance";

const mapInvoiceFromApi = (inv) => {
  const id = inv.id ?? null;

  const invoiceNumber =
    inv.invoiceNumber ??
    inv.invoice_no ??
    inv.number ??
    inv.invoiceNo ??
    null;

  const customerName =
    inv.customerName ?? inv.customer?.name ?? inv.customer_name ?? "";

  const phoneNumber =
    inv.phoneNumber ??
    inv.customerPhoneNumber ??
    inv.customer?.phone ??
    inv.customer_phone ??
    "";

  const paymentMethod =
    inv.paymentMethod ?? inv.payment_method ?? inv.payment ?? "";

  const createdAt =
    inv.invoiceDate ??
    inv.createdAt ??
    inv.createdDate ??
    inv.date ??
    inv.invoiceDateFormatted ??
    "";

  const totalAmount =
    inv.amount ?? inv.totalAmount ?? inv.grandTotal ?? inv.total ?? null;

  return {
    raw: inv,
    id,
    invoiceNumber,
    customerName,
    phoneNumber,
    paymentMethod,
    createdAt,
    totalAmount,
  };
};

const formatDateTime = (val) => {
  if (!val) return "-";
  try {
    if (typeof val === "string" && /[A-Za-z]/.test(val)) return val;
    const d = new Date(val);
    if (Number.isNaN(d.getTime())) return String(val);
    return (
      d.toLocaleDateString("en-IN") +
      " " +
      d.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  } catch {
    return String(val);
  }
};

const formatMoney = (v) => {
  if (v == null || v === "") return "-";
  const num = Number(v);
  if (Number.isNaN(num)) return String(v);
  return num.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
  });
};

const Purchase = () => {
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [invoices, setInvoices] = useState([]);

  const [loading, setLoading] = useState(false);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [loadError, setLoadError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [lastInvoice, setLastInvoice] = useState(null);

  const [search, setSearch] = useState("");

  // Pagination state
  const [pageSize, setPageSize] = useState(10); // default 10 rows
  const [currentPage, setCurrentPage] = useState(1);

  const clearSessionAndRedirect = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const fetchProducts = async () => {
    try {
      const res = await axiosInstance.get("/admin/products");
      const list = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
      setProducts(list);
    } catch (err) {
      console.error("Failed to load products for purchase", err);
      if (err?.response?.status === 401) {
        clearSessionAndRedirect();
        return;
      }
      setLoadError((prev) =>
        prev ? prev + " | Products error" : "Failed to load products"
      );
    }
  };

  const fetchSuppliers = async () => {
    try {
      const res = await axiosInstance.get("/admin/suppliers");
      const list = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
      const mapped = list.map((s) => ({
        id: s.id,
        name: s.name,
        email: s.email,
        phoneNumber: s.phoneNumber ?? s.phone ?? s.contact,
        address: s.address,
      }));
      setSuppliers(mapped);
    } catch (err) {
      console.error("Failed to load suppliers for purchase", err);
      if (err?.response?.status === 401) {
        clearSessionAndRedirect();
        return;
      }
      setLoadError((prev) =>
        prev ? prev + " | Suppliers error" : "Failed to load suppliers"
      );
    }
  };

  const fetchInvoices = async () => {
    setLoadingInvoices(true);
    try {
      const res = await axiosInstance.get("/admin/invoices");
      const list = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
      setInvoices(list.map(mapInvoiceFromApi));
    } catch (err) {
      console.error("Failed to load invoices", err);
      if (err?.response?.status === 401) {
        clearSessionAndRedirect();
        return;
      }
    } finally {
      setLoadingInvoices(false);
    }
  };

  // Robust PDF download for previous invoices
  const downloadInvoicePdf = async (invoiceId) => {
    if (!invoiceId) {
      console.warn("No invoice id available for PDF download");
      alert("No invoice id provided.");
      return;
    }

    // Exact URL provided by you
    const pdfUrl = `http://localhost:9090/api/admin/invoices/${encodeURIComponent(invoiceId)}/pdf`;

    try {
      const res = await axiosInstance.get(pdfUrl, {
        responseType: "blob",
        headers: {
          Accept: "application/pdf, application/octet-stream, */*",
        },
        // withCredentials: true, // uncomment if backend requires cookies
      });

      const contentType = (res.headers && (res.headers["content-type"] || res.headers["Content-Type"])) || "";

      // If backend returned non-pdf (e.g., JSON error), try to read and show it
      if (!contentType.includes("pdf")) {
        try {
          // attempt to read as text for helpful error
          const text = await res.data.text();
          console.error("Expected PDF but server returned:", text);
          alert("Server returned an error instead of PDF. Check console for details.");
          return;
        } catch (e) {
          console.warn("Non-pdf response and unable to read text:", e);
        }
      }

      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      // Try to open in new tab (should be allowed when triggered directly by click)
      const w = window.open(url, "_blank");
      if (!w) {
        // popup may be blocked — fallback to anchor download/open
        const a = document.createElement("a");
        a.href = url;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        // optional: download attribute to force download
        // a.download = `invoice-${invoiceId}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      }

      // revoke after a while
      setTimeout(() => URL.revokeObjectURL(url), 30 * 1000);
    } catch (err) {
      console.error("Failed to download invoice PDF", err);
      if (err?.response) {
        const status = err.response.status;
        if (status === 401 || status === 403) {
          alert("Not authorised to download this invoice (401/403). Please login or check permissions.");
          return;
        }
        // try to extract server text
        try {
          const reader = new FileReader();
          reader.onload = () => {
            const txt = reader.result;
            console.error("Server error body:", txt);
            alert("Server error: " + (txt || "See console for details."));
          };
          reader.onerror = () => {
            alert("Failed to download PDF. See console for details.");
          };
          reader.readAsText(err.response.data);
        } catch {
          alert("Failed to download PDF. See console for details.");
        }
      } else {
        alert("Failed to open invoice PDF. Check console and server.");
      }
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setLoadError("");
      await Promise.all([fetchProducts(), fetchSuppliers()]);
      await fetchInvoices();
      setLoading(false);
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredInvoices = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return invoices;

    return invoices.filter((inv) => {
      const num = inv.invoiceNumber ? String(inv.invoiceNumber).toLowerCase() : "";
      const idStr = inv.id != null ? String(inv.id) : "";
      const pay = (inv.paymentMethod || "").toLowerCase();
      const customer = (inv.customerName || "").toLowerCase();
      return (
        idStr.includes(q) ||
        pay.includes(q) ||
        customer.includes(q) ||
        num.includes(q)
      );
    });
  }, [invoices, search]);

  // Reset page to 1 when filter changes or invoices list changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, invoices, pageSize]);

  const totalItems = filteredInvoices.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // Ensure currentPage is within bounds
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
    if (currentPage < 1) setCurrentPage(1);
  }, [currentPage, totalPages]);

  const paginatedInvoices = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredInvoices.slice(start, start + pageSize);
  }, [filteredInvoices, currentPage, pageSize]);

  const handleInvoiceSaved = (invoiceData) => {
    setLastInvoice(invoiceData ?? null);
    fetchInvoices();
  };

  // Pagination controls
  const goToPage = (p) => {
    const page = Math.max(1, Math.min(totalPages, p));
    setCurrentPage(page);
  };

  const changePageSize = (size) => {
    setPageSize(Number(size));
    setCurrentPage(1);
  };

  // Condensed page number rendering with ellipses
  const renderPageNumbers = () => {
    const pages = [];
    const maxButtons = 7; // adjust to show more/less
    if (totalPages <= maxButtons) {
      for (let i = 1; i <= totalPages; i += 1) {
        pages.push(i);
      }
    } else {
      const left = Math.max(2, currentPage - 1);
      const right = Math.min(totalPages - 1, currentPage + 1);

      pages.push(1);
      if (left > 2) pages.push("left-ellipsis");

      for (let i = left; i <= right; i += 1) {
        pages.push(i);
      }

      if (right < totalPages - 1) pages.push("right-ellipsis");
      pages.push(totalPages);
    }

    return pages.map((p, idx) => {
      if (p === "left-ellipsis" || p === "right-ellipsis") {
        return (
          <span key={`ell-${idx}`} className="px-2 text-sm text-gray-400">
            …
          </span>
        );
      }
      const isActive = p === currentPage;
      return (
        <button
          key={p}
          onClick={() => goToPage(p)}
          aria-current={isActive ? "page" : undefined}
          className={`px-3 py-1 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 ${
            isActive
              ? "bg-amber-600 text-white shadow"
              : "bg-white text-gray-700 border"
          }`}
        >
          {p}
        </button>
      );
    });
  };

  return (
    <div className="">
      {/* Top header card */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-linear-to-r from-sky-600 to-amber-500 p-5 rounded-2xl shadow-lg text-white">
          <div className="flex items-center gap-4 p-3">
            <div className="rounded-lg bg-white/20 p-5 flex items-center justify-center shadow-sm">
              <FaShoppingCart className="text-white text-2xl" size={40} />
            </div>
            <div>
              <h1 className="text-3xl font-semibold mb-2">Invoices</h1>
              <p className="text-sm opacity-90 mt-1">Create invoices, download PDFs and manage records.</p>
              {lastInvoice && (
                <div className="mt-2 text-xs opacity-90 flex items-center gap-2">
                  <FaFileInvoice />
                  <span>Last invoice ID: <strong>{lastInvoice.id ?? lastInvoice.invoiceId ?? "N/A"}</strong></span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-4 bg-white p-2 rounded-xl shadow-sm text-gray-800">
              <div className="text-center text-sm">
                <div className="text-xs text-gray-500">Products</div>
                <div className="text-lg font-semibold">{products.length}</div>
              </div>
              <div className="border-l h-8" />
              <div className="text-center text-sm">
                <div className="text-xs text-gray-500">Suppliers</div>
                <div className="text-lg font-semibold">{suppliers.length}</div>
              </div>
            </div>

            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-sky-700 hover:bg-white/90 font-semibold shadow-md transition"
              disabled={loading || products.length === 0}
            >
              <FaPlus /> New Invoice
            </button>
          </div>
        </div>
      </div>

      {/* Controls (search + rows selector) */}
      <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-3 w-full md:w-[60%]">
          <label className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><FaSearch /></span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search invoice , customer, id or payment..."
              className="w-full pl-10 pr-4 py-3 rounded-full bg-white border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
            />
          </label>

          <div className="hidden sm:flex items-center gap-2 bg-white rounded-full px-3 py-2 shadow-sm">
            <label className="text-sm text-gray-600 mr-2">Rows</label>
            <select
              value={pageSize}
              onChange={(e) => changePageSize(e.target.value)}
              className="text-sm outline-none bg-transparent"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={20}>20</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3 justify-between md:justify-end">
          <div className="text-sm text-gray-600">Total: <strong className="text-gray-800">{filteredInvoices.length}</strong></div>
          <div className="flex items-center gap-2 sm:hidden bg-white rounded-full px-3 py-1 shadow-sm">
            <label className="text-xs text-gray-600 mr-2">Rows</label>
            <select
              value={pageSize}
              onChange={(e) => changePageSize(e.target.value)}
              className="text-sm outline-none bg-transparent"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={20}>20</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-linear-to-r from-gray-800 to-gray-900 text-white">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium uppercase tracking-wider">Invoice</th>
                <th className="text-left px-6 py-3 text-xs font-medium uppercase tracking-wider">Customer</th>
                {/* <th className="text-left px-6 py-3 text-xs font-medium uppercase tracking-wider">Date</th> */}
                <th className="text-left px-6 py-3 text-xs font-medium uppercase tracking-wider">Payment</th>
                <th className="text-right px-6 py-3 text-xs font-medium uppercase tracking-wider">Total</th>
                {/* <th className="text-right px-6 py-3 text-xs font-medium uppercase tracking-wider">Actions</th> */}
              </tr>
            </thead>

            <tbody>
              {loadingInvoices ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <FaSpinner className="inline-block animate-spin mr-2" /> Loading invoices...
                  </td>
                </tr>
              ) : paginatedInvoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No invoices found.
                  </td>
                </tr>
              ) : (
                paginatedInvoices.map((inv, idx) => (
                  <tr key={inv.id ?? idx} className={`${idx % 2 ? "bg-gray-50" : "bg-white"} hover:bg-sky-50 transition`}>
                    <td className="px-6 py-4 align-top">
                      <div className="font-medium text-sky-700">{inv.invoiceNumber ?? inv.id ?? "-"}</div>
                      {/* <div className="text-xs text-gray-400 mt-1">ID: {inv.id ?? "-"}</div> */}
                    </td>

                    <td className="px-6 py-4 align-top">
                      <div className="font-medium text-gray-900">{inv.customerName || "N/A"}</div>
                      {inv.phoneNumber && <div className="text-xs text-gray-500 mt-1">{inv.phoneNumber}</div>}
                    </td>

                    {/* <td className="px-6 py-4 align-top">
                      <div className="text-gray-800">{formatDateTime(inv.createdAt)}</div>
                    </td> */}

                    <td className="px-6 py-4 align-top">
                      <div className="text-gray-800 capitalize">{inv.paymentMethod || "-"}</div>
                    </td>

                    <td className="px-6 py-4 align-top text-right">
                      <div className="font-semibold text-gray-900">{formatMoney(inv.totalAmount)}</div>
                    </td>

                    {/* <td className="px-6 py-4 align-top text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => downloadInvoicePdf(inv.id)}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-sky-600 text-white text-sm hover:bg-sky-700 transition shadow"
                          title="Download PDF"
                        >
                          <FaDownload /> Download
                        </button>
                      </div>
                    </td> */}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer / pagination */}
        <div className="px-6 py-4 border-t flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="text-sm text-gray-600">
            {totalItems === 0 ? (
              <>Showing 0 items</>
            ) : (
              <>
                Showing{" "}
                <span className="font-semibold">
                  {(currentPage - 1) * pageSize + 1}
                </span>{" "}
                –{" "}
                <span className="font-semibold">
                  {Math.min(currentPage * pageSize, totalItems)}
                </span>{" "}
                of <span className="font-semibold">{totalItems}</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 justify-end">
            <button
              onClick={() => goToPage(1)}
              disabled={currentPage <= 1}
              className="p-2 rounded-md bg-white border disabled:opacity-50 hover:bg-gray-50"
              title="First page"
            >
              <FaAngleDoubleLeft />
            </button>

            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage <= 1}
              className="p-2 rounded-md bg-white border disabled:opacity-50 hover:bg-gray-50"
              title="Previous page"
            >
              <FaChevronLeft />
            </button>

            <div className="flex items-center gap-1">
              {renderPageNumbers()}
            </div>

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="p-2 rounded-md bg-white border disabled:opacity-50 hover:bg-gray-50"
              title="Next page"
            >
              <FaChevronRight />
            </button>

            <button
              onClick={() => goToPage(totalPages)}
              disabled={currentPage >= totalPages}
              className="p-2 rounded-md bg-white border disabled:opacity-50 hover:bg-gray-50"
              title="Last page"
            >
              <FaAngleDoubleRight />
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showForm && (
        <PurchaseForm
          open={showForm}
          onClose={() => setShowForm(false)}
          onSave={handleInvoiceSaved}
          products={products}
          suppliers={suppliers}
        />
      )}
    </div>
  );
};

export default Purchase;
