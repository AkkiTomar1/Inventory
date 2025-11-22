// src/components/purchases/PurchaseForm.jsx
import React, { useMemo, useState, useEffect, useCallback, useRef } from "react";
import {
  FaPlus,
  FaTrash,
  FaSearch,
  FaSave,
  FaPrint,
  FaTimes,
  FaUser,
  FaPercent,
  FaRupeeSign,
} from "react-icons/fa";
import axiosInstance from "../../api/axiosInstance";

const money = (v) =>
  (Number(v) || 0).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
  });

const normalizeProduct = (p) => ({
  id: p.productId ?? p.id,
  name: p.productName ?? p.name ?? "",
  barcode: p.barcode ?? p.sku ?? "",
  price: p.price ?? p.sellingPrice ?? p.mrp ?? 0,
  brand: p.brand ?? "",
  stock: Number(p.stock ?? p.quantity ?? p.availableStock ?? 0),
});

const getFriendlyErrorMessage = (err) => {
  if (!err) return "Unknown error";
  const message = err?.response?.data?.message || err?.response?.data?.error || err?.message || "";
  return message || "Failed to save invoice";
};

/* Helpers */
const readArrayBufferAsText = (arrayBuffer) => {
  try {
    const decoder = new TextDecoder("utf-8");
    return decoder.decode(arrayBuffer);
  } catch {
    return null;
  }
};

const readResponseBody = async (resp) => {
  if (!resp) return null;
  const data = resp.data;
  try {
    if (data && typeof data === "string") {
      try {
        return JSON.parse(data);
      } catch {
        return data;
      }
    }
    if (data && (data instanceof ArrayBuffer || ArrayBuffer.isView(data))) {
      const text = readArrayBufferAsText(data);
      if (!text) return data;
      try {
        return JSON.parse(text);
      } catch {
        return text;
      }
    }
    return data;
  } catch (e) {
    return data;
  }
};

const extractInvoiceId = (data) => {
  if (!data) return null;
  if (typeof data === "number") return data;
  if (data.id) return data.id;
  if (data.invoiceId) return data.invoiceId;
  if (data.invoice && data.invoice.id) return data.invoice.id;
  if (data._id) return data._id;
  if (data.invoice_id) return data.invoice_id;
  if (data.data && data.data.id) return data.data.id;
  return null;
};

// parse filename from Content-Disposition header if present
const parseFilenameFromContentDisposition = (headerValue) => {
  if (!headerValue || typeof headerValue !== "string") return null;
  // RFC5987 and basic filename forms
  const match = headerValue.match(/filename\*=UTF-8''([^;\n]+)|filename=\"?([^\";\n]+)\"?/i);
  if (match) {
    const raw = decodeURIComponent((match[1] || match[2] || "").trim());
    return raw || null;
  }
  return null;
};

// sanitize a string to be safe for filenames
const sanitizeFilename = (name) => {
  if (!name) return "invoice";
  // replace path separators and control chars with dash
  const s = String(name)
    .trim()
    .replace(/\\s+/g, " ")
    .replace(/[\\/\\\\:\\*\?\"<>\|\u0000-\u001F]+/g, "-")
    .replace(/\s+/g, "_") // convert spaces to underscore
    .replace(/__+/g, "_")
    .replace(/^[-_]+|[-_]+$/g, "");
  if (!s) return "invoice";
  // limit length
  return s.slice(0, 120);
};

const openPdfToWindow = (blob, existingWindow = null, filename = null) => {
  try {
    const url = URL.createObjectURL(blob);

    if (existingWindow && !existingWindow.closed) {
      try {
        existingWindow.location.href = url;
      } catch {
        const w2 = window.open(url, "_blank");
        if (!w2) {
          const a = document.createElement("a");
          a.href = url;
          a.target = "_blank";
          a.rel = "noopener noreferrer";
          if (filename) a.download = filename;
          document.body.appendChild(a);
          a.click();
          a.remove();
        }
      }
      setTimeout(() => URL.revokeObjectURL(url), 1000 * 30);
      return;
    }

    const w = window.open(url, "_blank");
    if (w) {
      // If we have a filename, also trigger a download in background to suggest the filename.
      if (filename) {
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        // slight delay so the preview tab can open first
        setTimeout(() => {
          try {
            a.click();
          } catch (e) {
            // ignore
          }
          a.remove();
        }, 300);
      }
      setTimeout(() => URL.revokeObjectURL(url), 1000 * 30);
      return;
    }

    // If popup blocked, force a download (uses filename if provided)
    const a = document.createElement("a");
    a.href = url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    if (filename) a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000 * 30);
  } catch (e) {
    console.error("openPdfToWindow error:", e);
    alert("Failed to open PDF in a new tab. Check popup blocker.");
  }
};

/* Component */
const PurchaseForm = ({ open, onClose, onSave, products = [], suppliers = [] }) => {
  const formRef = useRef(null);
  const firstInputRef = useRef(null);
  const normalizedProducts = useMemo(() => products.map(normalizeProduct), [products]);

  const makeInitialItem = useCallback(() => {
    return {
      id: Date.now() + Math.random(),
      productId: null,
      name: "",
      sku: "",
      price: 0,
      qty: 1,
      discount: 0,
    };
  }, []);

  const [customer, setCustomer] = useState({ name: "", phone: "", address: "" });
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id ? String(suppliers[0].id) : "");
  const [items, setItems] = useState(() => []);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [taxPercent, setTaxPercent] = useState(0);
  const [otherCharges, setOtherCharges] = useState(0);
  const [notes, setNotes] = useState("");
  const [searchProduct, setSearchProduct] = useState("");
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState("");

  // Field-level errors similar to ProductForm's `errors` object
  const [errors, setErrors] = useState({});
  // Per-line errors (you already had this pattern)
  const [lineErrors, setLineErrors] = useState({});

  useEffect(() => {
    if (suppliers?.length) {
      setSupplierId((prev) => (prev ? prev : String(suppliers[0].id)));
    }
  }, [suppliers]);

  useEffect(() => {
    if (open) {
      setTimeout(() => firstInputRef.current?.focus?.(), 80);
    }
  }, [open]);

  const suggestions = useMemo(() => {
    const q = (searchProduct || "").trim().toLowerCase();
    if (!q) return normalizedProducts.slice(0, 6);
    return normalizedProducts
      .filter((p) => `${p.name} ${p.brand} ${p.barcode}`.toLowerCase().includes(q) || String(p.barcode || "").includes(q))
      .slice(0, 8);
  }, [searchProduct, normalizedProducts]);

  const addItem = () =>
    setItems((s) => [
      ...s,
      {
        id: Date.now() + Math.random(),
        productId: null,
        name: "",
        sku: "",
        price: 0,
        qty: 1,
        discount: 0,
      },
    ]);

  const removeItem = (id) => {
    setItems((s) => s.filter((it) => it.id !== id));
    setLineErrors((prev) => {
      const cp = { ...prev };
      delete cp[id];
      return cp;
    });
  };

  const updateItem = (id, patch) => {
    setItems((s) => s.map((it) => (it.id === id ? { ...it, ...patch } : it)));
    setLineErrors((prev) => {
      const cp = { ...prev };
      delete cp[id];
      return cp;
    });
  };

  const selectProduct = (productId, lineId) => {
    const p = normalizedProducts.find((x) => String(x.id) === String(productId));
    if (!p) return;
    updateItem(lineId, {
      productId: p.id,
      name: p.name,
      sku: p.barcode || "",
      price: p.price ?? 0,
      qty: 1,
    });
  };

  const computeTotals = () => {
    let subtotal = 0,
      discountTotal = 0;
    items.forEach((it) => {
      const price = Number(it.price) || 0;
      const qty = Number(it.qty) || 0;
      const perDisc = Number(it.discount) || 0;

      subtotal += price * qty;
      discountTotal += perDisc * qty;
    });
    const tax = ((Number(taxPercent) || 0) * (subtotal - discountTotal)) / 100;
    const total = subtotal - discountTotal + tax + (Number(otherCharges) || 0);
    return { subtotal, discountTotal, tax, total };
  };

  const totals = computeTotals();

  // Client-side validation (keeps supplier/items/stock checks)
  const validate = () => {
    const newErrors = {};

    // Customer validations
    if (!customer.name || !String(customer.name).trim()) newErrors.customerName = "Customer name is required.";
    if (!customer.phone || !/^\d{10}$/.test(String(customer.phone))) newErrors.customerPhone = "Enter 10 digit phone number.";
    if (!customer.address || !String(customer.address).trim()) newErrors.customerAddress = "Customer address is required.";

    // Supplier
    if (!supplierId) newErrors.supplierId = "Please select a supplier.";

    // Totals fields
    if (Number(taxPercent) < 0 || Number(taxPercent) > 100) newErrors.taxPercent = "Tax must be between 0 and 100.";
    if (Number(otherCharges) < 0) newErrors.otherCharges = "Other charges must be ≥ 0.";

    // Items
    const validItems = items.filter((it) => it.productId != null && (Number(it.qty) || 0) > 0);
    if (validItems.length === 0) {
      newErrors.items = "Add at least one product with quantity.";
    }

    // Per-line stock & value validations
    const newLineErrors = {};
    const stockProblems = [];
    validItems.forEach((it) => {
      const p = normalizedProducts.find((x) => String(x.id) === String(it.productId));
      const available = p ? Number(p.stock || 0) : 0;
      const requested = Number(it.qty || 0);
      const price = Number(it.price || 0);
      const perDisc = Number(it.discount || 0);

      if (!it.productId) {
        newLineErrors[it.id] = "Select product.";
      }
      if (requested <= 0) {
        newLineErrors[it.id] = "Quantity must be at least 1";
      }
      if (requested > available) {
        newLineErrors[it.id] = `Requested ${requested}, but only ${available} available`;
        stockProblems.push({ name: p?.name ?? `#${it.productId}`, requested, available });
      }
      if (price < 0) newLineErrors[it.id] = "Price must be ≥ 0";
      if (perDisc < 0) newLineErrors[it.id] = "Discount must be ≥ 0";
      if (perDisc > price) newLineErrors[it.id] = "Discount cannot exceed price per unit";
    });

    setLineErrors(newLineErrors);

    // Aggregate messages
    if (Object.keys(newLineErrors).length > 0) {
      if (stockProblems.length > 0) {
        const msg =
          "Insufficient stock for:\n" +
          stockProblems.map((p) => `${p.name}: requested ${p.requested}, available ${p.available}`).join("\n");
        newErrors.items = msg;
      } else {
        newErrors.items = newErrors.items || "Please fix the highlighted fields.";
      }
    }

    setErrors(newErrors);
    setApiError(newErrors.items || "");

    return Object.keys(newErrors).length === 0 && Object.keys(newLineErrors).length === 0;
  };

  const buildPayload = () => {
    const validItems = items.filter((it) => it.productId != null && (Number(it.qty) || 0) > 0);
    const itemsPayload = validItems.map((it) => ({
      productId: Number(it.productId),
      quantity: Number(it.qty) || 0,
    }));
    const discountValue = totals.discountTotal || 0;
    return {
      supplierId: supplierId ? Number(supplierId) : 0,
      customerName: customer.name != null ? String(customer.name) : "",
      phoneNumber: customer.phone != null ? String(customer.phone) : "",
      address: customer.address != null ? String(customer.address) : "",
      items: itemsPayload,
      paymentMethod: String(paymentMethod || "cash"),
      tax: Number(taxPercent) || 0,
      discount: Number(discountValue) || 0,
      otherCharges: Number(otherCharges) || 0,
    };
  };

  const resetForm = () => {
    setCustomer({ name: "", phone: "", address: "" });
    setSupplierId(suppliers[0]?.id ? String(suppliers[0].id) : "");
    setItems([]);
    setPaymentMethod("cash");
    setTaxPercent(0);
    setOtherCharges(0);
    setNotes("");
    setSearchProduct("");
    setApiError("");
    setErrors({});
    setLineErrors({});
  };

  /* submitInvoice: POST with responseType 'arraybuffer' so we can handle direct-PDF responses */
  const submitInvoice = async ({ print = false } = {}) => {
    // native HTML validity
    if (formRef.current) {
      const ok = formRef.current.checkValidity();
      if (!ok) {
        formRef.current.reportValidity();
        return;
      }
    }

    // client-side business validation
    if (!validate()) {
      // Focus first error field
      // Order: customerName, customerPhone, customerAddress, supplier, first line error
      if (errors.customerName) {
        firstInputRef.current?.focus?.();
      } else if (errors.customerPhone) {
        const el = formRef.current?.querySelector("input[name='customerPhone']");
        el?.focus?.();
      } else if (errors.customerAddress) {
        const el = formRef.current?.querySelector("input[name='customerAddress']");
        el?.focus?.();
      } else if (errors.supplierId) {
        const el = formRef.current?.querySelector("select[name='supplierId']");
        el?.focus?.();
      } else if (Object.keys(lineErrors).length > 0) {
        const firstLineId = Object.keys(lineErrors)[0];
        const el = formRef.current?.querySelector(`[data-line-id='${firstLineId}'] input`);
        el?.focus?.();
      }
      return;
    }

    setSaving(true);
    setApiError("");

    // open blank window synchronously if we will print — avoids popup blocker
    let printWindow = null;
    if (print) {
      try {
        printWindow = window.open("", "_blank");
        if (printWindow) {
          try {
            printWindow.document.write("<title>Generating PDF...</title><p style='font-family: sans-serif; padding: 20px;'>Generating invoice PDF — please wait...</p>");
          } catch {}
        }
      } catch {
        printWindow = null;
      }
    }

    try {
      const payload = buildPayload();
      console.debug("[PurchaseForm] create payload:", payload);

      // POST and request raw bytes (arraybuffer). Server may return PDF or JSON.
      const createRes = await axiosInstance.post("/admin/invoices", payload, { responseType: "arraybuffer" });
      console.debug("[PurchaseForm] create response headers:", createRes.headers);

      // Helper: build the filename we want: customername_total.pdf
      const buildClientFilename = () => {
        const namePart = sanitizeFilename(customer.name || "invoice");
        const totalPart = Number(totals.total || 0).toFixed(2).replace(/\.00$/, "");
        return `${namePart}_${totalPart}.pdf`;
      };

      // Inspect content-type of response
      const contentType = (createRes.headers && (createRes.headers["content-type"] || createRes.headers["Content-Type"])) || "";

      // If server returned PDF directly in POST response
      if (contentType.includes("pdf")) {
        const blob = new Blob([createRes.data], { type: "application/pdf" });

        // prefer server filename only if you want it; user requested customer_total, so we override
        const filename = buildClientFilename();
        openPdfToWindow(blob, printWindow, filename);
        onSave && onSave(null);
        resetForm();
        onClose && onClose();
        return;
      }

      // Otherwise try to parse arraybuffer as JSON text to get id
      let parsed = null;
      try {
        const text = readArrayBufferAsText(createRes.data);
        parsed = text ? JSON.parse(text) : null;
      } catch (e) {
        console.warn("Failed to parse create response as JSON:", e);
        const rawText = readArrayBufferAsText(createRes.data);
        setApiError(rawText || "Server returned unknown response. Check console.");
        onSave && onSave(null);
        resetForm();
        onClose && onClose();
        return;
      }

      // If not printing just save & close
      if (!print) {
        onSave && onSave(parsed);
        resetForm();
        onClose && onClose();
        return;
      }

      // For print flow: try Location header -> invoice id -> GET /pdf with retries
      const locationHeader = createRes.headers && (createRes.headers.location || createRes.headers.Location);
      if (locationHeader) {
        try {
          const pdfResp = await axiosInstance.get(locationHeader, { responseType: "blob", headers: { Accept: "application/pdf" } });
          const ct2 = (pdfResp.headers && (pdfResp.headers["content-type"] || pdfResp.headers["Content-Type"])) || "";
          if (ct2.includes("pdf") || pdfResp.data instanceof Blob) {
            const filename = buildClientFilename();
            openPdfToWindow(pdfResp.data, printWindow, filename);
            onSave && onSave(parsed);
            resetForm();
            onClose && onClose();
            return;
          }
        } catch (err) {
          console.warn("Failed to fetch PDF from Location header:", err);
        }
      }

      const invoiceId = extractInvoiceId(parsed);
      console.debug("[PurchaseForm] extracted invoice id:", invoiceId);

      if (!invoiceId) {
        setApiError("Invoice created but server did not return invoice id. Check server response in console.");
        onSave && onSave(parsed);
        resetForm();
        onClose && onClose();
        return;
      }

      // Try GET /admin/invoices/{id}/pdf with retries
      const pdfEndpoint = `/admin/invoices/${encodeURIComponent(invoiceId)}/pdf`;
      const tryFetchPdfWithRetries = async (url, maxAttempts = 6, delayMs = 500) => {
        let attempt = 0;
        while (attempt < maxAttempts) {
          attempt += 1;
          try {
            console.debug(`[PurchaseForm] fetching PDF (attempt ${attempt})`, url);
            const pdfRes = await axiosInstance.get(url, { responseType: "blob", headers: { Accept: "application/pdf" } });
            const ct = (pdfRes.headers && (pdfRes.headers["content-type"] || pdfRes.headers["Content-Type"])) || "";
            if (ct.includes("pdf") || pdfRes.data instanceof Blob) {
              return { ok: true, resp: pdfRes };
            }
            try {
              const body = await readResponseBody(pdfRes);
              return { ok: false, error: body ?? `Non-PDF content-type: ${ct}` };
            } catch (e) {
              return { ok: false, error: `Non-PDF response, content-type: ${ct}` };
            }
          } catch (err) {
            console.warn(`[PurchaseForm] pdf fetch attempt ${attempt} failed:`, err);
            if (attempt >= maxAttempts) {
              const serverBody = err?.response ? await readResponseBody(err.response) : null;
              return { ok: false, error: serverBody ?? err };
            }
            await new Promise((res) => setTimeout(res, delayMs));
          }
        }
        return { ok: false, error: "Exceeded retries" };
      };

      const pdfResult = await tryFetchPdfWithRetries(pdfEndpoint, 6, 700);

      if (pdfResult.ok) {
        const filename = buildClientFilename();
        openPdfToWindow(pdfResult.resp.data, printWindow, filename);
        onSave && onSave(parsed);
        resetForm();
        onClose && onClose();
        return;
      }

      console.error("Failed to fetch PDF after create. Detail:", pdfResult.error);
      setApiError(pdfResult.error ? (typeof pdfResult.error === "string" ? pdfResult.error : JSON.stringify(pdfResult.error)) : "Invoice saved but failed to fetch PDF.");
      onSave && onSave(parsed);
      resetForm();
      onClose && onClose();
      return;
    } catch (err) {
      console.error("Failed to save invoice (raw):", err);
      try {
        const resp = err?.response;
        if (resp) {
          const serverBody = await readResponseBody(resp);
          console.debug("[PurchaseForm] Server response body (create error):", serverBody);

          // Map server-side validation errors to UI if possible
          if (serverBody && typeof serverBody === "object") {
            // common shapes: { errors: { field: "msg" } } or { message: "...", details: [...] }
            if (serverBody.errors && typeof serverBody.errors === "object") {
              const newErrors = {};
              const newLineErr = {};
              Object.entries(serverBody.errors).forEach(([k, v]) => {
                // items[0].quantity -> map to first line or find by productId
                if (/items\[\d+\]/.test(k)) {
                  // attempt to parse index
                  const idxMatch = k.match(/items\[(\d+)\]/);
                  if (idxMatch) {
                    const idx = Number(idxMatch[1]);
                    const line = items[idx];
                    if (line) newLineErr[line.id] = String(v || "");
                  }
                } else if (k.startsWith("customer") || k.startsWith("phone") || k.startsWith("address")) {
                  newErrors[k] = String(v || "");
                } else if (k === "supplierId") {
                  newErrors.supplierId = String(v || "");
                } else {
                  // fallback to apiError
                  newErrors.items = newErrors.items ? `${newErrors.items}\n${String(v)}` : String(v || "");
                }
              });
              setErrors((prev) => ({ ...prev, ...newErrors }));
              setLineErrors((prev) => ({ ...prev, ...newLineErr }));
              setApiError(newErrors.items || serverBody.message || getFriendlyErrorMessage(err));
            } else if (serverBody.message) {
              setApiError(serverBody.message);
            } else {
              setApiError(getFriendlyErrorMessage(err));
            }
          } else {
            setApiError(getFriendlyErrorMessage(err));
          }
        } else if (err?.request) {
          console.error("No response received when creating invoice. Possible CORS or network error. Request:", err.request);
          setApiError("No response from server when creating invoice. Check server availability and CORS.");
        } else {
          setApiError(err.message || "Unknown error while creating invoice");
        }
      } catch (parseErr) {
        console.error("Error parsing create error payload:", parseErr);
        setApiError(getFriendlyErrorMessage(err));
      } finally {
        setSaving(false);
        if (printWindow && !printWindow.closed) {
          try {
            printWindow.close();
          } catch {}
        }
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = (e) => {
    e && e.preventDefault && e.preventDefault();
    submitInvoice({ print: false });
  };

  const handleSaveAndPrint = (e) => {
    e && e.preventDefault && e.preventDefault();
    submitInvoice({ print: true });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-6xl rounded-xl shadow-2xl flex flex-col" style={{ maxHeight: "95vh", minHeight: "600px" }}>
        {/* Header */}
        <div className="shrink-0 border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Create New Invoice</h2>
              <p className="text-gray-600 mt-1">Add products and customer details</p>
            </div>
            <button type="button" onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" disabled={saving}>
              <FaTimes className="text-gray-500" size={20} />
            </button>
          </div>
          {/* show api error if any */}
          {apiError && (
            <p className="mt-3 text-sm text-red-600 whitespace-pre-line" role="alert" aria-live="assertive">
              {apiError}
            </p>
          )}
        </div>

        {/* Main content wrapped in a native form so `required` works */}
        <form ref={formRef} onSubmit={handleSubmit} className="flex-1 overflow-auto" noValidate>
          <div className="p-6">
            {/* Customer & Payment Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center gap-3">
                  <FaUser className="text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Customer Information</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Customer Name</label>
                    <input
                      name="customerName"
                      required
                      ref={firstInputRef}
                      aria-invalid={errors.customerName ? "true" : "false"}
                      aria-describedby={errors.customerName ? "err-customer-name" : undefined}
                      value={customer.name}
                      onChange={(e) => {
                        setCustomer({ ...customer, name: e.target.value });
                        setErrors((prev) => ({ ...prev, customerName: undefined }));
                        setApiError("");
                      }}
                      placeholder="Enter customer name"
                      className={`w-full border ${errors.customerName ? "border-red-500" : "border-gray-300"} rounded-lg px-4 py-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500`}
                    />
                    {errors.customerName && <p id="err-customer-name" className="text-xs text-red-600 mt-1">{errors.customerName}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <input
                      name="customerPhone"
                      required
                      pattern="\d{10}"
                      title="Enter 10 digit phone number"
                      aria-invalid={errors.customerPhone ? "true" : "false"}
                      aria-describedby={errors.customerPhone ? "err-customer-phone" : undefined}
                      value={customer.phone}
                      onChange={(e) => {
                        setCustomer({ ...customer, phone: e.target.value });
                        setErrors((prev) => ({ ...prev, customerPhone: undefined }));
                        setApiError("");
                      }}
                      placeholder="Enter phone number"
                      className={`w-full border ${errors.customerPhone ? "border-red-500" : "border-gray-300"} rounded-lg px-4 py-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500`}
                    />
                    {errors.customerPhone && <p id="err-customer-phone" className="text-xs text-red-600 mt-1">{errors.customerPhone}</p>}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <input
                    name="customerAddress"
                    required
                    aria-invalid={errors.customerAddress ? "true" : "false"}
                    aria-describedby={errors.customerAddress ? "err-customer-address" : undefined}
                    value={customer.address}
                    onChange={(e) => {
                      setCustomer({ ...customer, address: e.target.value });
                      setErrors((prev) => ({ ...prev, customerAddress: undefined }));
                      setApiError("");
                    }}
                    placeholder="Enter customer address"
                    className={`w-full border ${errors.customerAddress ? "border-red-500" : "border-gray-300"} rounded-lg px-4 py-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500`}
                  />
                  {errors.customerAddress && <p id="err-customer-address" className="text-xs text-red-600 mt-1">{errors.customerAddress}</p>}
                </div>
              </div>

              <div className="space-y-4 pt-6">
                <div>
                  <label className="block text-xl font-bold text-gray-700 mb-5">Payment Method</label>
                  <select name="paymentMethod" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                    <option>cash</option>
                    <option>card</option>
                    <option>UPI</option>
                    <option>credit</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tax %</label>
                    <div className="relative">
                      <input type="number" value={taxPercent} onChange={(e) => { setTaxPercent(e.target.value); setErrors((p)=>({...p,taxPercent:undefined})); setApiError(""); }} className={`w-full border ${errors.taxPercent ? "border-red-500" : "border-gray-300"} rounded pl-10 pr-4 py-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500`} />
                      <FaPercent className="absolute left-3 top-3.5 text-gray-400" />
                    </div>
                    {errors.taxPercent && <p className="text-xs text-red-600 mt-1">{errors.taxPercent}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Other Charges</label>
                    <div className="relative">
                      <input type="number" value={otherCharges} onChange={(e) => { setOtherCharges(e.target.value); setErrors((p)=>({...p,otherCharges:undefined})); setApiError(""); }} className={`w-full border ${errors.otherCharges ? "border-red-500" : "border-gray-300"} rounded pl-10 pr-4 py-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500`} />
                      <FaRupeeSign className="absolute left-3 top-3.5 text-gray-400" />
                    </div>
                    {errors.otherCharges && <p className="text-xs text-red-600 mt-1">{errors.otherCharges}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Product Search, Items table, Notes — unchanged UI */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <FaSearch className="text-amber-600" />
                <h3 className="text-lg font-semibold text-gray-900">Add Products</h3>
              </div>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <input
                    value={searchProduct}
                    onChange={(e) => setSearchProduct(e.target.value)}
                    placeholder="Search products by name, brand, or barcode..."
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-green-500 focus:ring-1 focus:ring-green-500"
                  />
                  {searchProduct && suggestions.length > 0 && (
                    <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto z-10">
                      {suggestions.map((s) => (
                        <div
                          key={s.id}
                          className="px-4 py-3 hover:bg-green-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                          onClick={() => {
                            setItems((prev) => [
                              ...prev,
                              {
                                id: Date.now() + Math.random(),
                                productId: s.id,
                                name: s.name,
                                sku: s.barcode || "",
                                price: s.price,
                                qty: 1,
                                discount: 0,
                              },
                            ]);
                            setSearchProduct("");
                          }}
                        >
                          <div className="font-medium text-gray-900">{s.name}</div>
                          <div className="text-sm text-gray-600">{s.brand && `${s.brand} • `}{money(s.price)} • Stock: {s.stock}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button type="button" onClick={addItem} className="flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors">
                  <FaPlus /> Add Item
                </button>
              </div>
            </div>

            {/* Items list */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Items ({items.length})</h3>
              </div>

              <div className="bg-gray-50 rounded-lg border border-gray-200">
                <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-white border-b border-gray-200 rounded-t-lg">
                  <div className="col-span-5 text-sm font-medium text-gray-700">Product</div>
                  <div className="col-span-2 text-sm font-medium text-gray-700 text-right">Price</div>
                  <div className="col-span-1 text-sm font-medium text-gray-700 text-right">Qty</div>
                  <div className="col-span-2 text-sm font-medium text-gray-700 text-right">Discount</div>
                  <div className="col-span-2 text-sm font-medium text-gray-700 text-right">Amount</div>
                </div>

                <div className="space-y-2 p-2">
                  {items.length === 0 ? (
                    <div className="px-4 py-6 text-center text-gray-500">No items. Click "Add Item" or select from search to add products.</div>
                  ) : (
                    items.map((line) => {
                      const amount = (Number(line.price) || 0) * (Number(line.qty) || 0) - (Number(line.discount) || 0) * (Number(line.qty) || 0);
                      const prod = normalizedProducts.find((p) => String(p.id) === String(line.productId));
                      const available = prod ? Number(prod.stock || 0) : 0;
                      const lineError = lineErrors[line.id];

                      return (
                        <div key={line.id} data-line-id={line.id} className="grid grid-cols-12 gap-4 items-center px-2 py-3 bg-white rounded-lg border border-gray-100">
                          <div className="col-span-5">
                            <select
                              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                              value={line.productId || ""}
                              onChange={(e) => selectProduct(e.target.value, line.id)}
                            >
                              <option value="">Select product</option>
                              {normalizedProducts.map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.name}{p.brand ? ` • ${p.brand}` : ""}{p.barcode ? ` • ${p.barcode}` : ""} {p.stock != null ? ` • stock: ${p.stock}` : ""}
                                </option>
                              ))}
                            </select>
                            <input className="w-full border border-gray-300 rounded px-3 py-2 mt-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" value={line.name} onChange={(e) => updateItem(line.id, { name: e.target.value })} placeholder="Product name" />
                            {prod && <div className={`text-xs mt-1 ${available === 0 ? "text-red-600" : available < 5 ? "text-amber-600" : "text-gray-400"}`}>Available: {available}</div>}
                          </div>

                          <div className="col-span-2">
                            <input className={`w-full border rounded px-3 py-2 text-sm text-right focus:border-blue-500 focus:ring-1 focus:ring-blue-500 ${lineError ? "border-red-400" : "border-gray-300"}`} value={line.price} onChange={(e) => updateItem(line.id, { price: e.target.value })} />
                          </div>

                          <div className="col-span-1">
                            <input
                              className={`w-full border rounded px-3 py-2 text-sm text-right focus:border-blue-500 focus:ring-1 focus:ring-blue-500 ${lineError ? "border-red-400" : "border-gray-300"}`}
                              value={line.qty}
                              onChange={(e) => {
                                const val = Number(e.target.value || 0);
                                updateItem(line.id, { qty: val });
                                if (prod && val > available) {
                                  setLineErrors((prev) => ({ ...prev, [line.id]: `Only ${available} available` }));
                                } else {
                                  setLineErrors((prev) => {
                                    const cp = { ...prev };
                                    delete cp[line.id];
                                    return cp;
                                  });
                                }
                              }}
                              type="number"
                              min={0}
                            />
                          </div>

                          <div className="col-span-2">
                            <input className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-right focus:border-blue-500 focus:ring-1 focus:ring-blue-500" value={line.discount} onChange={(e) => updateItem(line.id, { discount: e.target.value })} />
                          </div>

                          <div className="col-span-2 flex items-center justify-between">
                            <span className="font-medium text-gray-900">{money(amount)}</span>
                            <button type="button" onClick={() => removeItem(line.id)} className="p-1 text-red-600 hover:bg-red-50 rounded">
                              <FaTrash size={14} />
                            </button>
                          </div>

                          {lineError && <div className="col-span-12 text-xs text-red-700 mt-1">{lineError}</div>}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Additional Notes</h3>
              <textarea className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Any additional notes or terms..." />
            </div>
          </div>

          {/* Footer */}
          <div className="shrink-0 border-t border-gray-200 p-6 bg-gray-50">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex-1">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600">Subtotal</div>
                    <div className="font-semibold text-gray-900">{money(totals.subtotal)}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Discount</div>
                    <div className="font-semibold text-red-600">-{money(totals.discountTotal)}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Tax</div>
                    <div className="font-semibold text-gray-900">{money(totals.tax)}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Total</div>
                    <div className="text-xl font-bold text-gray-900">{money(totals.total)}</div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={onClose} className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors" disabled={saving}>
                  Cancel
                </button>
                <button type="submit" className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-70" disabled={saving}>
                  <FaSave />
                  {saving ? "Saving..." : "Save Invoice"}
                </button>
                <button type="button" onClick={handleSaveAndPrint} className="flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors disabled:opacity-70" disabled={saving}>
                  <FaPrint />
                  {saving ? "Saving..." : "Save & Print"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PurchaseForm;
