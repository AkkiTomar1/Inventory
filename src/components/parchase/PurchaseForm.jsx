import React, { useMemo, useState } from "react";
import { FaPlus, FaTrash, FaSearch, FaSave, FaPrint, FaTimes, FaUser, FaShoppingCart, FaPercent, FaRupeeSign } from "react-icons/fa";

const money = (v) => (Number(v) || 0).toLocaleString("en-IN", { style: "currency", currency: "INR" });
const productLabel = (p) => `${p.name}${p.brand ? " • " + p.brand : ""}${p.barcode ? " • " + p.barcode : ""}`;

const PurchaseForm = ({ open, onClose, onSave, products = [] }) => {
  const [customer, setCustomer] = useState({ name: "", phone: "", address: "" });
  const [items, setItems] = useState([
    { id: Date.now(), productId: products[0] ? products[0].id : null, name: products[0] ? products[0].name : "", sku: products[0] ? products[0].barcode || "" : "", price: products[0] ? products[0].sellingPrice || products[0].mrp || 0 : 0, qty: 1, discount: 0 }
  ]);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [taxPercent, setTaxPercent] = useState(0);
  const [otherCharges, setOtherCharges] = useState(0);
  const [notes, setNotes] = useState("");
  const [searchProduct, setSearchProduct] = useState("");

  const suggestions = useMemo(() => {
    const q = (searchProduct || "").trim().toLowerCase();
    if (!q) return products.slice(0, 6);
    return products.filter((p) => productLabel(p).toLowerCase().includes(q) || String(p.barcode || "").includes(q)).slice(0, 8);
  }, [searchProduct, products]);

  const addItem = () => setItems((s) => [...s, { id: Date.now() + Math.random(), productId: null, name: "", sku: "", price: 0, qty: 1, discount: 0 }]);
  const removeItem = (id) => setItems((s) => s.filter((it) => it.id !== id));
  const updateItem = (id, patch) => setItems((s) => s.map((it) => (it.id === id ? { ...it, ...patch } : it)));

  const selectProduct = (productId, lineId) => {
    const p = products.find((x) => String(x.id) === String(productId));
    if (!p) return;
    updateItem(lineId, { productId: p.id, name: p.name, sku: p.barcode || "", price: p.sellingPrice ?? p.mrp ?? 0 });
  };

  const computeTotals = () => {
    let subtotal = 0, discountTotal = 0;
    items.forEach((it) => {
      subtotal += (Number(it.price) || 0) * (Number(it.qty) || 0);
      discountTotal += (Number(it.discount) || 0) * (Number(it.qty) || 0);
    });
    const tax = (Number(taxPercent) || 0) * (subtotal - discountTotal) / 100;
    const total = subtotal - discountTotal + tax + (Number(otherCharges) || 0);
    return { subtotal, discountTotal, tax, total };
  };

  const handleSubmit = (e) => {
    e && e.preventDefault && e.preventDefault();
    const invoiceNo = "INV-" + Date.now();
    const purchase = {
      invoiceNo,
      date: new Date().toISOString(),
      customer,
      items: items.map((it) => ({ name: it.name || "NA", sku: it.sku, qty: Number(it.qty) || 0, price: Number(it.price) || 0, discount: Number(it.discount) || 0 })),
      paymentMethod,
      taxPercent: Number(taxPercent) || 0,
      otherCharges: Number(otherCharges) || 0,
      notes,
      createdBy: "Admin",
      shopName: "My Grocery",
      shopAddress: "Your address here",
      shopPhone: "0123-456789"
    };
    onSave && onSave(purchase);
  };

  const handleSaveAndPrint = (e) => {
    handleSubmit(e);
  };

  if (!open) return null;
  const totals = computeTotals();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-6xl rounded-xl shadow-2xl flex flex-col" style={{ maxHeight: '95vh', minHeight: '600px' }}>
        
        {/* Header */}
        <div className="shrink-0 border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Create New Invoice</h2>
              <p className="text-gray-600 mt-1">Add products and customer details</p>
            </div>
            <button 
              type="button" 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FaTimes className="text-gray-500" size={20} />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            {/* Customer & Payment Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* Customer Info */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center gap-3">
                  <FaUser className="text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Customer Information</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Customer Name</label>
                    <input 
                      value={customer.name} 
                      onChange={(e) => setCustomer({ ...customer, name: e.target.value })} 
                      placeholder="Enter customer name"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <input 
                      value={customer.phone} 
                      onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} 
                      placeholder="Enter phone number"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <input 
                    value={customer.address} 
                    onChange={(e) => setCustomer({ ...customer, address: e.target.value })} 
                    placeholder="Enter customer address"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Payment & Settings */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                  <select 
                    value={paymentMethod} 
                    onChange={(e) => setPaymentMethod(e.target.value)} 
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  >
                    <option>Cash</option>
                    <option>Card</option>
                    <option>UPI</option>
                    <option>Credit</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tax %</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        value={taxPercent} 
                        onChange={(e) => setTaxPercent(e.target.value)} 
                        className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                      <FaPercent className="absolute left-3 top-3.5 text-gray-400" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Other Charges</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        value={otherCharges} 
                        onChange={(e) => setOtherCharges(e.target.value)} 
                        className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                      <FaRupeeSign className="absolute left-3 top-3.5 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Search */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <FaSearch className="text-green-600" />
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
                            setItems((prev) => [...prev, { 
                              id: Date.now()+Math.random(), 
                              productId: s.id, 
                              name: s.name, 
                              sku: s.barcode || "", 
                              price: s.sellingPrice||s.mrp||0, 
                              qty: 1, 
                              discount: 0 
                            }]); 
                            setSearchProduct(""); 
                          }}
                        >
                          <div className="font-medium text-gray-900">{s.name}</div>
                          <div className="text-sm text-gray-600">{s.brand} • {money(s.sellingPrice || s.mrp || 0)}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <button 
                  type="button" 
                  onClick={addItem}
                  className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                >
                  <FaPlus /> Add Item
                </button>
              </div>
            </div>

            {/* Items Table */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Items ({items.length})</h3>
              </div>

              <div className="bg-gray-50 rounded-lg border border-gray-200">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-white border-b border-gray-200 rounded-t-lg">
                  <div className="col-span-5 text-sm font-medium text-gray-700">Product</div>
                  <div className="col-span-2 text-sm font-medium text-gray-700 text-right">Price</div>
                  <div className="col-span-1 text-sm font-medium text-gray-700 text-right">Qty</div>
                  <div className="col-span-2 text-sm font-medium text-gray-700 text-right">Discount</div>
                  <div className="col-span-2 text-sm font-medium text-gray-700 text-right">Amount</div>
                </div>

                {/* Table Rows */}
                <div className="space-y-2 p-2">
                  {items.map((line) => {
                    const amount = (Number(line.price) || 0) * (Number(line.qty) || 0) - (Number(line.discount) || 0) * (Number(line.qty) || 0);
                    return (
                      <div key={line.id} className="grid grid-cols-12 gap-4 items-center px-2 py-3 bg-white rounded-lg border border-gray-100">
                        <div className="col-span-5">
                          <select 
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            value={line.productId || ""} 
                            onChange={(e) => selectProduct(e.target.value, line.id)}
                          >
                            <option value="">Select product</option>
                            {products.map((p) => <option key={p.id} value={p.id}>{productLabel(p)}</option>)}
                          </select>
                          <input 
                            className="w-full border border-gray-300 rounded px-3 py-2 mt-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
                            value={line.name} 
                            onChange={(e) => updateItem(line.id, { name: e.target.value })} 
                            placeholder="Product name"
                          />
                        </div>

                        <div className="col-span-2">
                          <input 
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-right focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
                            value={line.price} 
                            onChange={(e) => updateItem(line.id, { price: e.target.value })} 
                          />
                        </div>

                        <div className="col-span-1">
                          <input 
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-right focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
                            value={line.qty} 
                            onChange={(e) => updateItem(line.id, { qty: e.target.value })} 
                          />
                        </div>

                        <div className="col-span-2">
                          <input 
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-right focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
                            value={line.discount} 
                            onChange={(e) => updateItem(line.id, { discount: e.target.value })} 
                          />
                        </div>

                        <div className="col-span-2 flex items-center justify-between">
                          <span className="font-medium text-gray-900">{money(amount)}</span>
                          <button 
                            type="button" 
                            onClick={() => removeItem(line.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                          >
                            <FaTrash size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Additional Notes</h3>
              <textarea 
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)} 
                rows={3} 
                placeholder="Any additional notes or terms..."
              />
            </div>
          </div>
        </div>

        {/* Footer with Totals and Actions */}
        <div className="shrink-0 border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Totals */}
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

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button 
                type="button" 
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={handleSubmit}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                <FaSave /> Save Invoice
              </button>
              <button 
                type="button" 
                onClick={handleSaveAndPrint}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
              >
                <FaPrint /> Save & Print
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseForm;