import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import API from "../api";
import SEO from "../components/SEO";
import { trackGA4Event } from "../utils/ga4";

export default function OrderSuccess() {
  const [params] = useSearchParams();
  const orderId = params.get("id");
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sendingMail, setSendingMail] = useState(false);
  const [mailSent, setMailSent] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    API.get(`/orders/detail/${orderId}`)
      .then(res => {
        setOrderData(res.data);
        setLoading(false);
        if (res.data?.order) {
          trackGA4Event("purchase", {
            transaction_id: res.data.order.order_uid || res.data.order.id,
            value: res.data.order.total_amount,
            currency: res.data.order.currency_code || "INR"
          });
        }
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [orderId]);

  const handleSendInvoiceEmail = async () => {
    if (!orderData?.order) return;
    setSendingMail(true);
    try {
      await API.post(`/orders/${orderData.order.order_uid}/invoice/mail`);
      setMailSent(true);
      setTimeout(() => setMailSent(false), 3000);
    } catch (err) {
      alert("Failed to send email. Try again.");
    } finally {
      setSendingMail(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <p className="text-gray-400">Loading your invoice details...</p>
      </div>
    );
  }

  if (!orderData?.order) {
    return (
      <div className="min-h-screen bg-stone-50">
        <Navbar />
        <div className="max-w-md mx-auto py-20 text-center">
          <p className="text-red-500 font-bold">Failed to load order. Invoice not found.</p>
        </div>
      </div>
    );
  }

  const { order, items, type } = orderData;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(`Invoice: ${order.invoice_uid}\nTotal: ₹${order.total || order.price}\nStatus: ${order.payment_status}`)}`;

  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      <Navbar className="no-print" />
      <SEO title={`Order Confirmation - Invoice ${order.invoice_uid}`} description="Invoice details" />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        
        {/* Success Header banner (no-print) */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-8 text-center mb-8 no-print shadow-sm">
          <div className="text-5xl mb-3">🎉</div>
          <h1 className="text-2xl font-black text-emerald-900" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Order Placed Successfully!
          </h1>
          <p className="text-sm text-emerald-800 font-medium mt-1">
            Your unique invoice <strong>{order.invoice_uid}</strong> is ready.
          </p>
          
          <div className="flex flex-wrap gap-3 justify-center mt-6">
            <button
              onClick={handlePrint}
              className="bg-stone-800 hover:bg-stone-900 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow"
            >
              📄 Print / Save PDF Invoice
            </button>
            
            <button
              onClick={handleSendInvoiceEmail}
              disabled={sendingMail}
              className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow disabled:opacity-50"
            >
              ✉️ {sendingMail ? "Sending..." : mailSent ? "✓ Sent to Email" : "Email Invoice"}
            </button>
            
            <Link
              to="/products"
              className="bg-white hover:bg-stone-100 text-stone-700 text-xs font-bold px-5 py-2.5 rounded-xl transition border border-stone-200 shadow-sm"
            >
              Continue Shopping
            </Link>
          </div>
        </div>

        {/* Amazon-style Invoice Template Container */}
        <div 
          id="amazon-invoice"
          className="bg-white border border-stone-200 rounded-3xl p-8 shadow-md relative max-w-3xl mx-auto"
          style={{ fontFamily: "'Outfit', sans-serif", color: "#333333" }}
        >
          {/* Header Row */}
          <div className="flex justify-between items-start border-b border-stone-250 pb-6">
            <div>
              <h2 className="text-xl font-extrabold text-amber-700 uppercase tracking-tight">OLIVESEEDS CUSTOMS</h2>
              <p className="text-xs text-stone-500 font-semibold mt-1">Unique Laser Engravings & Digital Goods</p>
              <p className="text-[10px] text-stone-400 font-medium mt-0.5">GSTIN: 27AABCO1234F1Z0 | Reg Office: Mumbai, India</p>
            </div>
            <div className="text-right">
              <h3 className="text-lg font-black text-stone-700 uppercase tracking-wide">Retail Invoice</h3>
              <p className="text-xs text-stone-500 font-semibold mt-1"><strong>Invoice Number:</strong> {order.invoice_uid}</p>
              <p className="text-xs text-stone-500 font-semibold mt-0.5"><strong>Order UID:</strong> {order.order_uid}</p>
              <p className="text-xs text-stone-500 font-semibold mt-0.5"><strong>Date:</strong> {new Date(order.invoice_date).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Addresses Row */}
          <div className="grid grid-cols-2 gap-8 py-6 text-xs border-b border-stone-100">
            <div>
              <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-wider mb-2">Billed To (Customer):</h4>
              <p className="font-bold text-stone-800 text-sm">{order.customer_name}</p>
              <p className="text-stone-500 font-medium mt-1">{order.customer_email}</p>
              {order.guest_phone && <p className="text-stone-500 font-medium">Phone: {order.guest_phone}</p>}
              <p className="text-stone-500 font-medium mt-1">Payment Method: <strong>{order.payment_mode || 'Cash on Delivery'}</strong></p>
              <p className="text-stone-500 font-medium">Payment Status: <strong className={order.payment_status === 'Paid' ? 'text-green-700' : 'text-amber-700'}>{order.payment_status}</strong></p>
            </div>
            
            <div className="text-left sm:text-left sm:pl-8">
              <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-wider mb-2">Shipping Destination:</h4>
              {type === "physical" ? (
                <>
                  <p className="font-bold text-stone-800 text-sm">{order.delivery_name || order.customer_name}</p>
                  <p className="text-stone-600 font-medium mt-1">{order.delivery_street}</p>
                  {order.delivery_apt && <p className="text-stone-600 font-medium">{order.delivery_apt}</p>}
                  <p className="text-stone-600 font-medium">{order.delivery_city}, {order.delivery_state} - {order.delivery_pincode}</p>
                  <p className="text-stone-600 font-bold mt-1 uppercase tracking-wide">{order.delivery_country || 'India'}</p>
                  
                  {/* Courier Partner info */}
                  <div className="mt-3 pt-2 border-t border-stone-100/50 inline-block text-left">
                    <p className="text-[10px] text-stone-400 font-bold uppercase">Shipping Partner:</p>
                    <p className="text-stone-700 font-bold mt-0.5">{order.courier_name || 'DELHIVERY EXPRESS'}</p>
                    {order.tracking_number && (
                      <p className="text-[10px] text-stone-500 font-mono mt-0.5">AWB Tracking: {order.tracking_number}</p>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-right">
                  <p className="text-green-700 font-bold text-xs bg-green-50 rounded-lg p-2.5 inline-block border border-green-100">
                    ⚡ Instant Digital Delivery via Email
                  </p>
                  <p className="text-stone-500 mt-2 text-[10px] italic">No physical shipment required. Digital asset download links are active.</p>
                </div>
              )}
            </div>
          </div>

          {/* Table Items */}
          <div className="py-6">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-stone-50 text-stone-500 uppercase text-[9px] font-black tracking-wider">
                  <th className="py-3 px-4 rounded-l-lg">Product Description</th>
                  <th className="py-3 px-4 text-center">Qty</th>
                  <th className="py-3 px-4 text-right rounded-r-lg">Price</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={idx} className="border-b border-stone-100 font-medium text-stone-700">
                    <td className="py-4 px-4">
                      <p className="font-bold text-stone-800 text-xs">{item.product_name}</p>
                      {item.selected_size && (
                        <span className="text-[10px] text-stone-500 font-bold block mt-0.5">Size: {item.selected_size}</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center font-bold">{item.qty}</td>
                    <td className="py-4 px-4 text-right font-black text-stone-800">₹{item.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pricing Totals & QR Code verification */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-stone-200 text-xs">
            {/* Left side: QR Code verification */}
            <div className="flex gap-4 items-center bg-stone-50 p-4 rounded-2xl border border-stone-100">
              <img src={qrUrl} alt="Verify Invoice" className="w-20 h-20 bg-white border border-stone-200 p-1 rounded-lg flex-shrink-0" />
              <div>
                <h5 className="font-black text-[10px] uppercase text-stone-700 tracking-wider">Secure Invoice Verification</h5>
                <p className="text-[10px] text-stone-500 leading-relaxed mt-1">
                  Scan this QR code using a scanner or mobile phone to verify the invoice authenticity and check your parcel delivery status directly with our transport carriers.
                </p>
              </div>
            </div>

            {/* Right side: Totals */}
            <div className="flex flex-col gap-2.5 md:pl-8 text-right font-medium">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal:</span>
                <span className="font-bold">₹{type === "physical" ? order.subtotal : order.price}</span>
              </div>
              {type === "physical" && (
                <>
                  <div className="flex justify-between text-stone-600">
                    <span>Tax (CGST/SGST 18%):</span>
                    <span className="font-bold">₹{order.tax_amount || '0.00'}</span>
                  </div>
                  <div className="flex justify-between text-stone-600">
                    <span>Shipping fee:</span>
                    <span className="font-bold">₹{order.shipping_fee || '0.00'}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between text-lg font-black text-amber-700 pt-2 border-t border-stone-100">
                <span>Total Paid:</span>
                <span>₹{order.total || order.price}</span>
              </div>
            </div>
          </div>

          {/* Footer print override */}
          <div className="text-center text-[10px] text-stone-400 font-medium pt-8 mt-6 border-t border-stone-100">
            This is a computer generated tax invoice. No signature required. For returns or support, write to orders@oliveseed.com.
          </div>
        </div>

      </div>

      <style>{`
        @media print {
          body {
            background: #ffffff !important;
            color: #000000 !important;
          }
          .no-print {
            display: none !important;
          }
          #amazon-invoice {
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 auto !important;
            width: 100% !important;
            max-width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
}