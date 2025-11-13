import React, { useState } from "react";
import { FaFileInvoice, FaPlus, FaChartLine, FaRupeeSign, FaReceipt } from "react-icons/fa";
import PurchaseForm from "./PurchaseForm";
import InvoiceViewer from "./InvoiceViewer";

const Purchase = ({ products = [] }) => {
  const [invoices, setInvoices] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [viewInvoice, setViewInvoice] = useState(null);

  const handleSave = (newInvoice) => {
    setInvoices((prev) => [newInvoice, ...prev]);
    setShowForm(false);
    setViewInvoice(newInvoice);
  };

  const computeTotalSales = () =>
    invoices.reduce((sum, inv) => {
      const invTotal = (inv.items || []).reduce((s, it) => {
        return s + ((Number(it.price) || 0) * (Number(it.qty) || 0) - (Number(it.discount) || 0) * (Number(it.qty) || 0));
      }, 0);
      return sum + invTotal;
    }, 0);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
            <p className="text-gray-600 mt-2">Create and manage customer invoices</p>
          </div>

          <div className="flex items-center gap-6">
            {/* Stats */}
            <div className="flex items-center gap-6 bg-white px-6 py-4 rounded-lg border border-gray-200">
              <div className="text-center">
                <div className="text-sm text-gray-500">Total Invoices</div>
                <div className="text-2xl font-bold text-gray-900">{invoices.length}</div>
              </div>
              <div className="h-8 border-l border-gray-300" />
              <div className="text-center">
                <div className="text-sm text-gray-500">Total Sales</div>
                <div className="text-2xl font-bold text-green-600">
                  {computeTotalSales().toLocaleString("en-IN", { style: "currency", currency: "INR" })}
                </div>
              </div>
            </div>

            {/* New Invoice Button */}
            <button 
              onClick={() => setShowForm(true)} 
              className="flex items-center gap-3 bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              <FaPlus /> New Invoice
            </button>
          </div>
        </div>

        {/* Content */}
        {invoices.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="p-4 bg-amber-200 rounded-full inline-flex mb-6">
                <FaReceipt className="text-amber-600 text-2xl" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No Invoices Yet</h3>
              <p className="text-gray-600 mb-6">
                Create your first invoice to get started with billing and payments.
              </p>
              <button 
                onClick={() => setShowForm(true)} 
                className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                <FaPlus /> Create First Invoice
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {invoices.slice(0, 9).map((inv) => {
              const amount = (inv.items || []).reduce((s, it) => {
                return s + ((Number(it.price) || 0) * (Number(it.qty) || 0) - (Number(it.discount) || 0) * (Number(it.qty) || 0));
              }, 0);

              const customerName = (inv.customer && inv.customer.name) || "Walk-in Customer";

              return (
                <div 
                  key={inv.invoiceNo} 
                  className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setViewInvoice(inv)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="font-semibold text-gray-900">{customerName}</div>
                      <div className="text-sm text-gray-500">{inv.invoiceNo}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600">
                        {amount.toLocaleString("en-IN", { style: "currency", currency: "INR" })}
                      </div>
                      <div className="text-xs text-gray-500">{inv.items.length} items</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center gap-3">
                      <span>{new Date(inv.date).toLocaleDateString()}</span>
                      <span className="px-2 py-1 bg-gray-100 rounded text-xs">{inv.paymentMethod}</span>
                    </div>
                    <button className="bg-amber-500 hover:bg-amber-600 font-medium">
                      View
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modals */}
        <PurchaseForm
          open={showForm}
          onClose={() => setShowForm(false)}
          onSave={handleSave}
          products={products}
        />

        {viewInvoice && (
          <InvoiceViewer
            purchase={viewInvoice}
            onClose={() => setViewInvoice(null)}
            template="modern"
          />
        )}
      </div>
    </div>
  );
};

export default Purchase;