import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../api";
import Navbar from "../components/Navbar";

export default function InvoicePage() {
  const { order_id } = useParams();
  const [inv, setInv] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    API.get(`/invoices/${order_id}`)
      .then(r => setInv(r.data))
      .catch(() => setError("Invoice not found"))
      .finally(() => setLoading(false));
  }, [order_id]);

  const print = () => window.print();

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading invoice...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
  if (!inv) return null;

  return (
    <>
      {/* Print: hide navbar */}
      <style>{`@media print { .no-print { display: none !important; } body { background: white; } }`}</style>

      <div className="no-print"><Navbar /></div>

      <div className="min-h-screen bg-gray-100 py-8 px-4">
        {/* Toolbar */}
        <div className="no-print max-w-3xl mx-auto flex justify-end gap-3 mb-4">
          <button onClick={print}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition">
            🖨️ Print / Download PDF
          </button>
          <Link to="/profile"
            className="px-5 py-2.5 border border-gray-200 bg-white text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition">
            ← Back
          </Link>
        </div>

        {/* Invoice Document */}
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden" id="invoice">

          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-700 to-purple-700 text-white p-8">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-black tracking-tight">{inv.store.name}</h1>
                <p className="text-indigo-200 text-sm mt-1">{inv.store.address}</p>
                <p className="text-indigo-200 text-sm">{inv.store.email} · {inv.store.phone}</p>
                {inv.store.gstin && <p className="text-indigo-200 text-xs mt-1">GSTIN: {inv.store.gstin}</p>}
              </div>
              <div className="text-right">
                <p className="text-indigo-200 text-sm font-medium uppercase tracking-widest">Invoice</p>
                <p className="text-2xl font-black font-mono mt-1">{inv.invoice_number}</p>
                <p className="text-indigo-200 text-sm mt-1">
                  {new Date(inv.invoice_date).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}
                </p>
                <span className={`inline-block mt-2 text-xs px-3 py-1 rounded-full font-bold
                  ${inv.status === "Delivered" ? "bg-green-400 text-green-900" : "bg-amber-400 text-amber-900"}`}>
                  {inv.status}
                </span>
              </div>
            </div>
          </div>

          {/* Bill To / Ship To */}
          <div className="grid grid-cols-2 gap-0 border-b border-gray-100">
            <div className="p-6 border-r border-gray-100">
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Bill To</p>
              <p className="font-bold text-gray-800">{inv.customer.name}</p>
              <p className="text-sm text-gray-600">{inv.customer.email}</p>
              {inv.customer.phone && <p className="text-sm text-gray-600">{inv.customer.phone}</p>}
              {inv.customer.address && <p className="text-sm text-gray-600 mt-1">{inv.customer.address}</p>}
            </div>
            <div className="p-6">
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Order Details</p>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Order ID</span>
                  <span className="font-bold">#{inv.order_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Payment</span>
                  <span className="font-bold">{inv.payment_method}</span>
                </div>
                {inv.shipment && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Tracking</span>
                      <span className="font-bold font-mono text-xs">{inv.shipment.tracking_number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Courier</span>
                      <span className="font-bold">{inv.shipment.partner}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="p-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-800">
                  <th className="text-left pb-3 text-xs font-black uppercase tracking-wider text-gray-600">Item</th>
                  <th className="text-center pb-3 text-xs font-black uppercase tracking-wider text-gray-600">HSN</th>
                  <th className="text-center pb-3 text-xs font-black uppercase tracking-wider text-gray-600">Qty</th>
                  <th className="text-right pb-3 text-xs font-black uppercase tracking-wider text-gray-600">Rate</th>
                  <th className="text-right pb-3 text-xs font-black uppercase tracking-wider text-gray-600">Amount</th>
                </tr>
              </thead>
              <tbody>
                {inv.items.map((item, i) => (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="py-3">
                      <p className="font-semibold text-gray-800">{item.product_name}</p>
                      <p className="text-xs text-gray-400 capitalize">{item.type} product</p>
                    </td>
                    <td className="py-3 text-center text-gray-500 font-mono text-xs">{item.hsn_code}</td>
                    <td className="py-3 text-center font-medium">{item.qty}</td>
                    <td className="py-3 text-right text-gray-700">₹{item.unit_price.toFixed(2)}</td>
                    <td className="py-3 text-right font-bold text-gray-800">₹{item.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pricing Summary */}
            <div className="mt-6 flex justify-end">
              <div className="w-72">
                {[
                  ["Subtotal", `₹${inv.pricing.subtotal.toFixed(2)}`],
                  [`Shipping`, `₹${inv.pricing.shipping_fee.toFixed(2)}`],
                  [`CGST (${inv.pricing.tax_rate_percent / 2}%)`, `₹${inv.pricing.cgst.toFixed(2)}`],
                  [`SGST (${inv.pricing.tax_rate_percent / 2}%)`, `₹${inv.pricing.sgst.toFixed(2)}`],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between text-sm py-1.5 border-b border-gray-100">
                    <span className="text-gray-500">{label}</span>
                    <span className="font-medium text-gray-700">{value}</span>
                  </div>
                ))}
                <div className="flex justify-between py-3 border-t-2 border-gray-800 mt-1">
                  <span className="font-black text-gray-800 text-base">Total</span>
                  <span className="font-black text-indigo-700 text-xl">₹{inv.pricing.grand_total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 p-6 bg-gray-50 text-center">
            <p className="text-sm text-gray-500">Thank you for your purchase! 💙</p>
            <p className="text-xs text-gray-400 mt-1">
              For support, contact {inv.store.email} · {inv.store.phone}
            </p>
            <p className="text-xs text-gray-300 mt-3">This is a computer-generated invoice and does not require a signature.</p>
          </div>
        </div>
      </div>
    </>
  );
}