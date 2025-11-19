// src/components/purchases/Purchase.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  FaShoppingCart,
  FaPlus,
  FaSpinner,
  FaFileInvoice,
  FaDownload,
  FaSearch,
} from "react-icons/fa";
import PurchaseForm from "./PurchaseForm";
import axiosInstance from "../../api/axiosInstance";

const mapInvoiceFromApi = (inv) => {
  // IMPORTANT: take id only from inv.id (new API must provide numeric id)
  const id = inv.id ?? null;

  const invoiceNumber =
    inv.invoiceNumber ??
    inv.invoice_no ??
    inv.number ??
    inv.invoiceNo ??
    null;

  const customerName =
    inv.customerName ??
    inv.customer?.name ??
    inv.customer_name ??
    "";

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
    inv.amount ??
    inv.totalAmount ??
    inv.grandTotal ??
    inv.total ??
    null;

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
    // If backend already provides a formatted string like "19 Nov, 2025 01:16 pm", return it
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

  // DOWNLOAD PDF from the exact URL pattern you requested:
  // http://localhost:9090/api/admin/invoices/{id}/pdf
  const downloadInvoicePdf = async (invoiceId) => {
    if (!invoiceId) {
      console.warn("No invoice id available for PDF download");
      return;
    }

    // Use exact URL (absolute) — per your request
    const pdfUrl = `http://localhost:9090/api/admin/invoices/${encodeURIComponent(
      invoiceId
    )}/pdf`;

    try {
      // axiosInstance will still add auth header via interceptor if present
      const res = await axiosInstance.get(pdfUrl, { responseType: "blob" });
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (err) {
      console.error("Failed to download invoice PDF", err);
      alert("Failed to open invoice PDF.");
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

  const handleInvoiceSaved = (invoiceData) => {
    setLastInvoice(invoiceData ?? null);
    fetchInvoices();
  };

  return (
    <div>
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-[linear-gradient(135deg,#fb923c,#60a5fa)] text-amber-100 p-4 rounded-t-2xl shadow-sm">
        <div className="flex items-center gap-4">
          <div className="rounded-lg bg-amber-50 p-3 flex items-center justify-center">
            <FaShoppingCart className="text-amber-600 text-2xl" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-100">Invoices</h1>
            <p className="text-sm text-gray-50 mt-0.5">Create new invoices and see previous ones.</p>
            {lastInvoice && (
              <p className="text-xs text-gray-100/90 mt-1 flex items-center gap-2">
                <FaFileInvoice />
                <span>
                  Last invoice ID:{" "}
                  <span className="font-semibold">{lastInvoice.id ?? lastInvoice.invoiceId ?? "N/A"}</span>
                </span>
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-4 bg-white p-2 rounded-xl shadow-sm text-gray-700">
            <div className="text-center text-sm">
              <div className="text-xs text-gray-400">Products</div>
              <div className="text-lg font-semibold">{products.length}</div>
            </div>
            <div className="border-l h-8" />
            <div className="text-center text-sm">
              <div className="text-xs text-gray-400">Suppliers</div>
              <div className="text-lg font-semibold">{suppliers.length}</div>
            </div>
          </div>

          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-black hover:bg-amber-500 transition shadow-sm"
            disabled={loading || products.length === 0}
          >
            <FaPlus /> New Invoice
          </button>
        </div>
      </div>

      {/* BODY (search + stats) */}
      <div className="bg-[linear-gradient(135deg,#fb923c,#60a5fa)] rounded-b-2xl p-4 text-black mb-6">
        {loading ? (
          <div className="flex items-center justify-center py-8 gap-3 text-amber-50">
            <FaSpinner className="animate-spin text-2xl" />
            <span>Loading products, suppliers & invoices...</span>
          </div>
        ) : (
          <>
            {loadError && <div className="mb-4 bg-red-50 text-red-700 p-3 rounded text-sm">{loadError}</div>}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-2 w-full sm:w-[420px]">
                <div className="flex items-center bg-white border border-gray-200 rounded-lg px-3 py-2 w-full">
                  <FaSearch className="text-gray-400" />
                  <input className="ml-2 w-full outline-none text-sm" placeholder="Search by invoice#, id, customer or payment..." value={search} onChange={(e) => setSearch(e.target.value)} />
                  {search && (
                    <button onClick={() => setSearch("")} className="ml-1 text-xs text-gray-500">
                      Clear
                    </button>
                  )}
                </div>
              </div>

              <div className="text-sm text-white/90">
                Invoices: <span className="font-semibold">{filteredInvoices.length}</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* INVOICES TABLE */}
      {!loading && (
        <div className="bg-white rounded-2xl shadow overflow-auto mb-10">
          <table className="min-w-full text-sm">
            <thead className="bg-[#2A2A2A]">
              <tr>
                <th className="text-left px-4 py-3 text-xs text-gray-100">Invoice </th>
                <th className="text-left px-4 py-3 text-xs text-gray-100">Customer</th>
                <th className="text-left px-4 py-3 text-xs text-gray-100">Date</th>
                <th className="text-left px-4 py-3 text-xs text-gray-100">Payment</th>
                <th className="text-right px-4 py-3 text-xs text-gray-100">Total</th>
              </tr>
            </thead>

            <tbody>
              {loadingInvoices ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                    <FaSpinner className="inline-block animate-spin mr-2" />
                    Loading invoices...
                  </td>
                </tr>
              ) : filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                    No invoices found.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv, idx) => (
                  <tr key={inv.id ?? idx} className={idx % 2 ? "bg-gray-50" : "bg-white"}>
                    <td className="px-4 py-3">
                      <div className="font-medium">{inv.invoiceNumber ?? inv.id ?? "-"}</div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="font-medium">{inv.customerName || "N/A"}</div>
                      {inv.phoneNumber && <div className="text-xs text-gray-400">{inv.phoneNumber}</div>}
                    </td>

                    <td className="px-4 py-3">{formatDateTime(inv.createdAt)}</td>

                    <td className="px-4 py-3">{inv.paymentMethod || "-"}</td>

                    <td className="px-4 py-3 text-right">{formatMoney(inv.totalAmount)}</td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL: PurchaseForm */}
      {showForm && (
        <PurchaseForm open={showForm} onClose={() => setShowForm(false)} onSave={handleInvoiceSaved} products={products} suppliers={suppliers} />
      )}
    </div>
  );
};

export default Purchase;
