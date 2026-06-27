import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import API from "../api";
import Navbar from "../components/Navbar";

export default function OrderConfirmation() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const orderId = params.get("order");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) { navigate("/"); return; }
    API.get(`/invoices/${orderId}`)
      .then(r => setOrder(r.data))
      .catch(() => navigate("/"))
      .finally(() => setLoading(false));
  }, [orderId, navigate]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500">Loading your order...</p>
      </div>
    </div>
  );
  if (!order) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-10">

        {/* Success Banner */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-4xl mx-auto mb-4 animate-bounce">
            🎉
          </div>
          <h1 className="text-2xl font-black text-gray-800">Order Confirmed!</h1>
          <p className="text-gray-500 mt-2">Your order has been placed successfully. We'll notify you once it ships.</p>
        </div>

        {/* Order Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-5">
          <div className="bg-indigo-600 text-white p-5 flex justify-between items-center">
            <div>
              <p className="text-indigo-200 text-xs font-medium uppercase tracking-wider">Order ID</p>
              <p className="text-xl font-black">#{order.order_id}</p>
            </div>
            <div className="text-right">
              <p className="text-indigo-200 text-xs font-medium uppercase tracking-wider">Invoice</p>
              <p className="font-mono font-bold text-sm">{order.invoice_number}</p>
            </div>
          </div>

          <div className="p-5">
            {/* Customer */}
            <div className="flex gap-3 mb-5 pb-5 border-b border-gray-100">
              <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-lg flex-shrink-0">👤</div>
              <div>
                <p className="font-bold text-gray-800">{order.customer.name}</p>
                <p className="text-sm text-gray-500">{order.customer.email}</p>
                {order.customer.address && <p className="text-sm text-gray-500 mt-1">📍 {order.customer.address}</p>}
              </div>
            </div>

            {/* Items */}
            <div className="mb-5 pb-5 border-b border-gray-100">
              <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3">Items Ordered</p>
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between items-center py-2">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{item.product_name}</p>
                    <p className="text-xs text-gray-400">Qty: {item.qty} × ₹{item.unit_price}</p>
                  </div>
                  <p className="font-bold text-gray-800">₹{item.total}</p>
                </div>
              ))}
            </div>

            {/* Pricing */}
            <div className="space-y-2">
              {[
                ["Subtotal", `₹${order.pricing.subtotal}`],
                ["Shipping", order.pricing.shipping_fee > 0 ? `₹${order.pricing.shipping_fee}` : "FREE 🎉"],
                [`GST (${order.pricing.tax_rate_percent}%)`, `₹${order.pricing.tax_amount}`],
              ].map(([l, v]) => (
                <div key={l} className="flex justify-between text-sm">
                  <span className="text-gray-500">{l}</span>
                  <span className={`font-medium ${v === "FREE 🎉" ? "text-green-600" : "text-gray-700"}`}>{v}</span>
                </div>
              ))}
              <div className="flex justify-between pt-3 border-t border-gray-200 mt-3">
                <span className="font-black text-gray-800">Total Paid</span>
                <span className="font-black text-indigo-700 text-lg">₹{order.pricing.grand_total}</span>
              </div>
            </div>
          </div>
        </div>

        {/* What's Next */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-5">
          <p className="font-bold text-gray-800 mb-4">What happens next?</p>
          <div className="space-y-3">
            {[
              { icon: "📧", title: "Confirmation Email", desc: "You'll receive an order confirmation email shortly" },
              { icon: "📦", title: "Processing", desc: "We'll prepare your order within 1-2 business days" },
              { icon: "🚛", title: "Shipping", desc: "You'll get a tracking number once your order ships" },
              { icon: "✅", title: "Delivery", desc: "Estimated delivery in 3-7 business days" },
            ].map((s, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className="w-9 h-9 bg-indigo-50 rounded-full flex items-center justify-center text-lg flex-shrink-0">{s.icon}</div>
                <div>
                  <p className="text-sm font-bold text-gray-800">{s.title}</p>
                  <p className="text-sm text-gray-500">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 flex-col sm:flex-row">
          <Link to={`/track-order?order=${order.order_id}`}
            className="flex-1 text-center px-5 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition text-sm">
            🚚 Track Order
          </Link>
          <a href={`/invoice/${order.order_id}`} target="_blank" rel="noreferrer"
            className="flex-1 text-center px-5 py-3 border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition text-sm">
            🧾 Download Invoice
          </a>
          <Link to="/"
            className="flex-1 text-center px-5 py-3 bg-gray-800 text-white rounded-xl font-semibold hover:bg-gray-900 transition text-sm">
            🏠 Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}