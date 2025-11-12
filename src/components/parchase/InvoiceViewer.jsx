import React from "react";
import { FaPrint, FaFileExport, FaTimes, FaDownload } from "react-icons/fa";

const formatCurrency = (v) => (Number(v) || 0).toLocaleString("en-IN", { style: "currency", currency: "INR" });

const InvoiceViewer = ({ purchase, onClose, template = "modern" }) => {
  if (!purchase) return null;

  let subtotal = 0;
  let discountTotal = 0;
  (purchase.items || []).forEach((it) => {
    subtotal += (Number(it.price) || 0) * (Number(it.qty) || 0);
    discountTotal += (Number(it.discount) || 0) * (Number(it.qty) || 0);
  });
  const tax = (Number(purchase.taxPercent) || 0) * (subtotal - discountTotal) / 100;
  const other = Number(purchase.otherCharges) || 0;
  const total = subtotal - discountTotal + tax + other;

  const handlePrint = () => {
    const w = window.open("", "_blank", "width=800,height=900");
    const el = document.getElementById("invoice-" + purchase.invoiceNo);
    const content = el ? el.innerHTML : "<pre>" + JSON.stringify(purchase, null, 2) + "</pre>";
    const style = template === "receipt"
      ? "<style>body{font-family:Inter,system-ui,Arial;font-size:12px;padding:10px;width:320px}table{width:100%;border-collapse:collapse}td,th{padding:4px;border-bottom:1px dashed #ddd}</style>"
      : "<style>body{font-family:Inter,system-ui,Arial;margin:20px;color:#111}table{width:100%;border-collapse:collapse}th,td{padding:8px;border:1px solid #ddd;text-align:left}</style>";
    w.document.write("<html><head><title>Invoice</title>" + style + "</head><body>" + content + "</body></html>");
    w.document.close();
    setTimeout(() => w.print(), 300);
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(purchase, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "invoice-" + purchase.invoiceNo + ".json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const Modern = () => (
    <div id={"invoice-" + purchase.invoiceNo} className="p-8 bg-white">
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-amber-500 pb-6 mb-6">
        <div>
          <div className="text-3xl font-bold text-gray-900">{purchase.shopName || "My Grocery"}</div>
          <div className="text-sm text-gray-600 mt-2">{purchase.shopAddress}</div>
          <div className="text-sm text-gray-600">Phone: {purchase.shopPhone}</div>
        </div>

        <div className="text-right">
          <div className="text-2xl font-bold text-amber-600">INVOICE</div>
          <div className="text-sm text-gray-600 mt-2">No: <span className="font-semibold">{purchase.invoiceNo}</span></div>
          <div className="text-sm text-gray-600">Date: {new Date(purchase.date).toLocaleDateString('en-IN')}</div>
        </div>
      </div>

      {/* Customer & Payment Info */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm font-semibold text-gray-700 mb-2">BILL TO</div>
          <div className="text-lg font-bold text-gray-900">{(purchase.customer && purchase.customer.name) || "Walk-in Customer"}</div>
          <div className="text-sm text-gray-600">{purchase.customer && purchase.customer.phone}</div>
          <div className="text-sm text-gray-600">{purchase.customer && purchase.customer.address}</div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm font-semibold text-gray-700 mb-2">PAYMENT DETAILS</div>
          <div className="text-lg font-bold text-gray-900">{purchase.paymentMethod || "Cash"}</div>
          <div className="text-sm text-gray-600">Due: Upon Receipt</div>
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-8">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-900 text-white">
              <th className="px-4 py-3 text-left font-semibold">#</th>
              <th className="px-4 py-3 text-left font-semibold">ITEM DESCRIPTION</th>
              <th className="px-4 py-3 text-right font-semibold">RATE</th>
              <th className="px-4 py-3 text-right font-semibold">QTY</th>
              <th className="px-4 py-3 text-right font-semibold">DISCOUNT</th>
              <th className="px-4 py-3 text-right font-semibold">AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            {(purchase.items || []).map((it, i) => {
              const amount = (Number(it.price) || 0) * (Number(it.qty) || 0) - (Number(it.discount) || 0) * (Number(it.qty) || 0);
              return (
                <tr key={i} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-600">{i + 1}</td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-gray-900">{it.name}</div>
                    {it.sku && <div className="text-sm text-gray-500">SKU: {it.sku}</div>}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-900">{formatCurrency(it.price)}</td>
                  <td className="px-4 py-3 text-right text-gray-900">{it.qty}</td>
                  <td className="px-4 py-3 text-right text-red-600">{formatCurrency((it.discount || 0) * (it.qty || 0))}</td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900">{formatCurrency(amount)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end">
        <div className="w-80">
          <div className="space-y-3">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal:</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-red-600">
              <span>Discount:</span>
              <span>-{formatCurrency(discountTotal)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Tax ({purchase.taxPercent || 0}%):</span>
              <span>{formatCurrency(tax)}</span>
            </div>
            {other ? (
              <div className="flex justify-between text-gray-600">
                <span>Other Charges:</span>
                <span>{formatCurrency(other)}</span>
              </div>
            ) : null}
            <div className="border-t border-gray-300 pt-3">
              <div className="flex justify-between text-lg font-bold text-gray-900">
                <span>TOTAL:</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-12 pt-6 border-t border-gray-300 text-center text-gray-500">
        <div className="text-sm">Thank you for your business!</div>
        <div className="text-xs mt-2">Terms & Conditions: Payment due within 15 days</div>
      </div>
    </div>
  );

  const Classic = () => (
    <div id={"invoice-" + purchase.invoiceNo} className="p-8 bg-white border-2 border-gray-300">
      <div className="text-center mb-8">
        <div className="text-4xl font-bold text-gray-800 mb-2">{purchase.shopName || "My Grocery"}</div>
        <div className="text-gray-600">{purchase.shopAddress}</div>
        <div className="text-gray-600">Phone: {purchase.shopPhone}</div>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-6">
        <div>
          <div className="font-bold text-gray-700 mb-2">BILL TO</div>
          <div className="text-lg">{(purchase.customer && purchase.customer.name) || "Walk-in"}</div>
          <div className="text-gray-600">{purchase.customer && purchase.customer.phone}</div>
        </div>
        <div className="text-right">
          <div className="font-bold text-gray-700">INVOICE</div>
          <div>No: <span className="font-semibold">{purchase.invoiceNo}</span></div>
          <div>Date: {new Date(purchase.date).toLocaleDateString('en-IN')}</div>
        </div>
      </div>

      <table className="w-full mb-6">
        <thead>
          <tr className="bg-gray-800 text-white">
            <th className="px-4 py-2 text-left">#</th>
            <th className="px-4 py-2 text-left">DESCRIPTION</th>
            <th className="px-4 py-2 text-right">QTY</th>
            <th className="px-4 py-2 text-right">PRICE</th>
            <th className="px-4 py-2 text-right">AMOUNT</th>
          </tr>
        </thead>
        <tbody>
          {(purchase.items || []).map((it, i) => {
            const amount = (Number(it.price) || 0) * (Number(it.qty) || 0) - (Number(it.discount) || 0) * (Number(it.qty) || 0);
            return (
              <tr key={i} className="border-b border-gray-300">
                <td className="px-4 py-2">{i + 1}</td>
                <td className="px-4 py-2">{it.name}</td>
                <td className="px-4 py-2 text-right">{it.qty}</td>
                <td className="px-4 py-2 text-right">{formatCurrency(it.price)}</td>
                <td className="px-4 py-2 text-right font-semibold">{formatCurrency(amount)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="flex justify-end">
        <div className="w-80 bg-gray-50 p-4 rounded">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-red-600">
              <span>Discount:</span>
              <span>-{formatCurrency(discountTotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax:</span>
              <span>{formatCurrency(tax)}</span>
            </div>
            {other && (
              <div className="flex justify-between">
                <span>Other Charges:</span>
                <span>{formatCurrency(other)}</span>
              </div>
            )}
            <div className="border-t border-gray-300 pt-2 mt-2">
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const Receipt = () => (
    <div id={"invoice-" + purchase.invoiceNo} className="bg-white p-6 max-w-sm mx-auto shadow-lg">
      <div className="text-center mb-4">
        <div className="text-xl font-bold">{purchase.shopName || "My Grocery"}</div>
        <div className="text-xs text-gray-600">{purchase.shopAddress}</div>
        <div className="text-xs text-gray-600">Phone: {purchase.shopPhone}</div>
      </div>

      <div className="text-center text-sm mb-4 border-b border-dashed border-gray-400 pb-2">
        <div>INVOICE: {purchase.invoiceNo}</div>
        <div>Date: {new Date(purchase.date).toLocaleString()}</div>
        <div>Customer: {(purchase.customer && purchase.customer.name) || "Walk-in"}</div>
      </div>

      <div className="text-sm mb-4">
        {(purchase.items || []).map((it, i) => {
          const amount = (Number(it.price) || 0) * (Number(it.qty) || 0) - (Number(it.discount) || 0) * (Number(it.qty) || 0);
          return (
            <div key={i} className="flex justify-between mb-2">
              <div className="flex-1">
                <div>{it.name} x{it.qty}</div>
                {it.discount > 0 && <div className="text-xs text-red-600">Disc: {formatCurrency(it.discount * it.qty)}</div>}
              </div>
              <div className="font-semibold">{formatCurrency(amount)}</div>
            </div>
          );
        })}
      </div>

      <div className="border-t border-dashed border-gray-400 pt-2 text-sm">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between text-red-600">
          <span>Discount:</span>
          <span>-{formatCurrency(discountTotal)}</span>
        </div>
        <div className="flex justify-between">
          <span>Tax:</span>
          <span>{formatCurrency(tax)}</span>
        </div>
        {other && (
          <div className="flex justify-between">
            <span>Other:</span>
            <span>{formatCurrency(other)}</span>
          </div>
        )}
        <div className="flex justify-between font-bold text-lg mt-2 border-t border-gray-400 pt-2">
          <span>TOTAL:</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>

      <div className="text-center text-xs mt-4 text-gray-600">
        Thank you for your business!
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-6 bg-linear-to-r from-gray-900 to-amber-700 text-white">
          <h3 className="text-xl font-bold">Invoice — {purchase.invoiceNo}</h3>
          <div className="flex items-center gap-3">
            <button 
              onClick={exportJSON} 
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            >
              <FaDownload /> Export JSON
            </button>
            <button 
              onClick={handlePrint} 
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 rounded-lg transition-colors"
            >
              <FaPrint /> Print
            </button>
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <FaTimes size={20} />
            </button>
          </div>
        </div>

        <div className="max-h-[80vh] overflow-auto">
          {template === "modern" && <Modern />}
          {template === "classic" && <Classic />}
          {template === "receipt" && <Receipt />}
        </div>
      </div>
    </div>
  );
};

export default InvoiceViewer;