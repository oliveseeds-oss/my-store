import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import API from "../api";
import { formatAdminPrice } from "../utils/currency";
import { MdSearch, MdExpandMore, MdFilterList, MdLocalShipping, MdBookmark, MdHelp, MdOpenInNew, MdAddCircleOutline } from "react-icons/md";

const ENV_STATUS = ["Processing", "Packed", "Shipped", "Out for Delivery", "Delivered", "Cancelled", "Returned"];
const DIG_PAYMENT = ["Pending", "Paid", "Failed", "Refunded"];
const DIG_STATUS  = ["Processing", "Ready", "Delivered", "Refunded"];
const PARTNERS = ["delhivery", "shiprocket", "dtdc", "bluedart", "india_post", "ekart", "xpressbees"];

const BADGE = {
  Processing: "bg-amber-100 text-amber-700",
  Packed: "bg-yellow-100 text-yellow-700",
  Shipped: "bg-blue-100 text-blue-700",
  "Out for Delivery": "bg-sky-100 text-sky-700",
  Delivered: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-600",
  Returned: "bg-orange-100 text-orange-700",
  Pending: "bg-amber-100 text-amber-700",
  Paid: "bg-green-100 text-green-700",
  Failed: "bg-red-100 text-red-600",
  Ready: "bg-sky-100 text-sky-700",
  Refunded: "bg-gray-100 text-gray-600",
};

export default function Orders() {
  const [tab, setTab] = useState("engraved");
  const [engOrders, setEngOrders] = useState([]);
  const [digOrders, setDigOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [expanded, setExpanded] = useState(null);

  const [demoLoading, setDemoLoading] = useState(false);
  const [editShipping, setEditShipping] = useState({});

  // Invoice Export States
  const [exportStartDate, setExportStartDate] = useState("");
  const [exportEndDate, setExportEndDate] = useState("");
  const [exportType, setExportType] = useState("all");

  const handleExportReports = () => {
    let url = `/orders/admin/reports/export?type=${exportType}`;
    if (exportStartDate) url += `&startDate=${exportStartDate}`;
    if (exportEndDate) url += `&endDate=${exportEndDate}`;
    
    API.get(url, { responseType: 'blob' })
      .then(response => {
        const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.setAttribute('download', `invoice_report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      })
      .catch(err => {
        alert("Failed to export reports: " + err.message);
      });
  };

  // Order Details & Production states
  const [orderDetails, setOrderDetails] = useState({});
  const [prodStatus, setProdStatus] = useState({});
  const [prodNotes, setProdNotes] = useState({});

  const handleToggleExpand = async (uid) => {
    if (expanded === uid) {
      setExpanded(null);
      return;
    }
    setExpanded(uid);
    if (!orderDetails[uid] && tab === "engraved") {
      try {
        const res = await API.get(`/orders/admin/engraved/${uid}/details`);
        setOrderDetails(prev => ({ ...prev, [uid]: res.data }));
        setProdStatus(prev => ({ ...prev, [uid]: res.data.order.production_status || "Pending" }));
        setProdNotes(prev => ({ ...prev, [uid]: res.data.order.production_notes || "" }));
      } catch (err) {
        console.error("Failed to load order details", err);
      }
    }
  };

  const handleUpdateProduction = async (uid) => {
    const status = prodStatus[uid] || orderDetails[uid]?.order?.production_status || "Pending";
    const notes = prodNotes[uid] !== undefined ? prodNotes[uid] : orderDetails[uid]?.order?.production_notes || "";
    try {
      await API.put(`/orders/admin/engraved/${uid}/production`, {
        production_status: status,
        production_notes: notes
      });
      alert("✅ Production details updated successfully!");
      const res = await API.get(`/orders/admin/engraved/${uid}/details`);
      setOrderDetails(prev => ({ ...prev, [uid]: res.data }));
      loadEngraved();
    } catch (e) {
      alert("❌ Failed to update production: " + (e.response?.data?.error || e.message));
    }
  };

  const handlePrintCustomization = (uid) => {
    const details = orderDetails[uid];
    if (!details) return;
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Order \${uid} Customization Details</title>
          <style>
            body { font-family: sans-serif; padding: 20px; color: #333; }
            h1 { font-size: 20px; margin-bottom: 5px; }
            h2 { font-size: 14px; color: #666; margin-top: 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
            th { background-color: #f5f5f5; font-size: 12px; text-transform: uppercase; }
            td { font-size: 13px; }
            .notes { background-color: #fafafa; border-left: 4px solid #4f46e5; padding: 10px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <h1>Order Customization Details</h1>
          <h2>Order ID: \${uid} | Date: \${new Date(details.order.invoice_date).toLocaleString("en-IN")}</h2>
          <p><strong>Customer:</strong> \${details.order.delivery_name || details.order.customer_name || 'Guest'}</p>
          <p><strong>Address:</strong> \${[details.order.delivery_street, details.order.delivery_city, details.order.delivery_state, details.order.delivery_pincode].filter(Boolean).join(", ")}</p>
          
          <h3>Items to Customize:</h3>
          \${details.items.map(item => \`
            <div style="margin-bottom: 25px;">
              <p><strong>Item:</strong> \${item.product_name} (\${item.selected_size || 'Standard'}) x \${item.qty}</p>
              <table>
                <thead>
                  <tr>
                    <th>Field Label</th>
                    <th>Customized Value</th>
                  </tr>
                </thead>
                <tbody>
                  \${item.customizations && item.customizations.length ? item.customizations.map(c => \\\`
                    <tr>
                      <td><strong>\${c.field_label}</strong></td>
                      <td>
                        \${c.field_type === 'image' || c.field_type === 'file' 
                          ? \\\`<a href="http://localhost:5000\${c.field_value}" target="_blank">View File (\${c.field_value.split('/').pop()})</a>\\\` 
                          : c.field_value
                        }
                      </td>
                    </tr>
                  \\\`).join('') : \\\`<tr><td colspan="2">No engraving details provided</td></tr>\\\`}
                </tbody>
              </table>
            </div>
          \`).join('')}
          
          <div class="notes">
            <p><strong>Production Status:</strong> \${details.order.production_status || 'Pending'}</p>
            <p><strong>Production Notes:</strong> \${details.order.production_notes || 'No notes'}</p>
          </div>
          <script>window.onload = function() { window.print(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handlePrintShippingLabel = (uid) => {
    const details = orderDetails[uid];
    if (!details) {
      alert("Please expand the order details first to load shipping label data.");
      return;
    }
    const o = details.order;
    const items = details.items;
    const printWindow = window.open("", "_blank");
    
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(`Order: ${o.order_uid}\nAWB: ${o.tracking_number || 'N/A'}\nCourier: ${o.courier_name || 'N/A'}`)}`;

    printWindow.document.write(`
      <html>
        <head>
          <title>Shipping Label - ${o.order_uid}</title>
          <style>
            @page {
              size: 4in 6in;
              margin: 0;
            }
            body {
              font-family: 'Courier New', Courier, monospace;
              margin: 0;
              padding: 15px;
              width: 3.6in;
              height: 5.6in;
              box-sizing: border-box;
              border: 2px solid #000;
              font-size: 11px;
              line-height: 1.3;
              color: #000;
            }
            .header {
              border-bottom: 2px dashed #000;
              padding-bottom: 5px;
              margin-bottom: 8px;
              text-align: center;
            }
            .logo {
              font-size: 14px;
              font-weight: bold;
            }
            .tracking-box {
              border: 2px solid #000;
              padding: 6px;
              text-align: center;
              margin-bottom: 8px;
            }
            .carrier-title {
              font-size: 13px;
              font-weight: bold;
              text-transform: uppercase;
            }
            .awb-text {
              font-size: 14px;
              font-weight: bold;
              letter-spacing: 1px;
              margin-top: 3px;
            }
            .address-section {
              border-bottom: 2px dashed #000;
              padding-bottom: 8px;
              margin-bottom: 8px;
            }
            .section-title {
              font-size: 9px;
              font-weight: bold;
              text-decoration: underline;
              margin-bottom: 3px;
              text-transform: uppercase;
            }
            .recipient-name {
              font-size: 13px;
              font-weight: bold;
              text-transform: uppercase;
            }
            .recipient-address {
              font-size: 11px;
              font-weight: bold;
            }
            .footer-grid {
              display: grid;
              grid-template-columns: 2fr 1fr;
              gap: 5px;
              align-items: center;
              border-top: 2px dashed #000;
              padding-top: 8px;
              margin-top: auto;
            }
            .items-list {
              font-size: 9px;
              max-height: 1.2in;
              overflow: hidden;
            }
            .qr-img {
              width: 70px;
              height: 70px;
              display: block;
              margin-left: auto;
            }
            .sender-info {
              font-size: 8px;
              margin-top: 5px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">OLIVESEEDS CUSTOMS</div>
            <div style="font-size: 8px;">Premium Laser Engraving Workshop</div>
          </div>

          <div class="tracking-box">
            <div class="carrier-title">${o.courier_name ? o.courier_name.toUpperCase() : 'DELHIVERY EXPRESS'}</div>
            <div class="awb-text">${o.tracking_number || 'PENDING AWB'}</div>
            <div style="font-size: 7px; margin-top: 2px;">SCAN TO TRACK PARCEL</div>
          </div>

          <div class="address-section">
            <div class="section-title">Deliver To:</div>
            <div class="recipient-name">${o.delivery_name || o.customer_name}</div>
            <div class="recipient-address">
              ${o.delivery_street || ''}<br/>
              ${o.delivery_city || ''}, ${o.delivery_state || ''} - ${o.delivery_pincode || ''}<br/>
              <strong>${o.delivery_country ? o.delivery_country.toUpperCase() : 'INDIA'}</strong>
            </div>
            <div style="font-weight: bold; margin-top: 4px;">Phone: ${o.guest_phone || 'N/A'}</div>
          </div>

          <div class="section-title">Package Contents (Items):</div>
          <div class="items-list">
            ${items.map(item => `* ${item.product_name} ${item.selected_size ? `(${item.selected_size})` : ''} x ${item.qty}`).join('<br/>')}
          </div>

          <div class="footer-grid">
            <div>
              <div class="section-title">Sender (Return Address):</div>
              <div class="sender-info">
                <strong>OLIVESEEDS CUSTOMS</strong><br/>
                Laser Engraving Unit 4B, Industrial Estate,<br/>
                Mumbai, Maharashtra - 400001<br/>
                Order ID: ${o.order_uid}<br/>
                Date: ${new Date(o.invoice_date).toLocaleDateString()}
              </div>
            </div>
            <div>
              <img class="qr-img" src="${qrUrl}" alt="QR" />
            </div>
          </div>

          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const loadEngraved = async () => {
    try {
      const r = await API.get(`/orders/admin/engraved?search=${search}`);
      setEngOrders(r.data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadDigital = async () => {
    try {
      const r = await API.get(`/orders/admin/digital?search=${search}`);
      setDigOrders(r.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadEngraved();
    loadDigital();
  }, [search]);

  const updateEngravedStatus = async (id, delivery_status, tracking_number, courier_name) => {
    try {
      await API.put(`/orders/admin/engraved/${id}/status`, {
        delivery_status,
        tracking_number,
        courier_name
      });
      loadEngraved();
    } catch (e) {
      alert("Failed to update status: " + (e.response?.data?.error || e.message));
    }
  };

  const handleUpdateShippingInfo = async (orderId, trackingNumber, courierName, deliveryStatus) => {
    try {
      await API.put(`/orders/admin/engraved/${orderId}/status`, {
        delivery_status: deliveryStatus,
        tracking_number: trackingNumber,
        courier_name: courierName
      });
      alert("✅ Shipping information updated successfully!");
      loadEngraved();
    } catch (e) {
      alert("❌ Failed to update shipping details: " + (e.response?.data?.error || e.message));
    }
  };

  const updateDigitalStatus = async (id, payment_status, delivery_status) => {
    try {
      await API.put(`/orders/admin/digital/${id}/status`, {
        payment_status,
        delivery_status
      });
      loadDigital();
    } catch (e) {
      alert("Failed to update digital status: " + (e.response?.data?.error || e.message));
    }
  };

  const handleCreateDemoOrder = async () => {
    setDemoLoading(true);
    try {
      const isPhys = tab === "engraved";
      const demoPayload = {
        guest_name: isPhys ? "Demo Customer (Physical)" : "Demo Customer (Digital)",
        guest_email: `demo_${Date.now()}@example.com`,
        guest_phone: "9876543210",
        address_line: "123 Innovation Street, Technopark, Chennai, Tamil Nadu, India, 600001",
        shipping_fee: isPhys ? 60 : 0,
        items: [
          {
            type: isPhys ? "physical" : "digital",
            product_id: 1,
            product_uid: isPhys ? "PRD-MOCK-101" : "DPD-MOCK-202",
            product_name: isPhys ? "Premium Engraved Wood Frame" : "Abstract Artwork High-Res PDF",
            selected_size: isPhys ? "A4 Size" : null,
            price: isPhys ? 1299.00 : 499.00,
            qty: 1
          }
        ]
      };
      
      const r = await API.post("/orders", demoPayload);
      alert(`🎉 Demo Order Placed! ID: ${r.data.order_id}`);
      
      // Auto-set search or refresh
      setSearch("");
      loadEngraved();
      loadDigital();
    } catch (e) {
      alert("❌ Failed to place demo order: " + (e.response?.data?.error || e.message));
    }
    setDemoLoading(false);
  };

  const allOrders = tab === "engraved" ? engOrders : digOrders;

  // Perform status filtering in memory for instant UX updates
  const filteredOrders = allOrders.filter(o => {
    if (!statusFilter) return true;
    const currentStatus = o.delivery_status || o.payment_status || "";
    return currentStatus.toLowerCase() === statusFilter.toLowerCase();
  });

  return (
    <div className="flex min-h-screen bg-gray-50/50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar title="Orders Management" />
        <main className="p-6 flex flex-col gap-6 max-w-7xl w-full mx-auto">

          {/* Header Dashboard Stats */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <p className="text-xs text-gray-400 font-semibold tracking-wider uppercase">Fulfillment Desk</p>
              <h2 className="text-2xl font-bold text-gray-800">Customer Orders</h2>
            </div>
          </div>

          {/* Export Invoice Reports Panel (Admin Option) */}
          <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm flex flex-col gap-4">
            <div>
              <span className="text-[10px] text-indigo-600 font-extrabold uppercase tracking-wider block">📊 Invoice Reports & Spreadsheet Exporter</span>
              <h3 className="text-sm font-bold text-gray-800">Export Invoice History</h3>
            </div>
            <div className="flex flex-wrap items-end gap-3.5 text-xs font-semibold text-gray-650">
              <div className="flex flex-col gap-1 flex-1 min-w-[150px]">
                <label className="text-[9px] uppercase tracking-wider text-gray-400 font-bold">Order Type</label>
                <select
                  value={exportType}
                  onChange={e => setExportType(e.target.value)}
                  className="border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 font-bold">
                  <option value="all">All Invoices (Physical + Digital)</option>
                  <option value="physical">Physical Engraving Invoices</option>
                  <option value="digital">Digital Product Invoices</option>
                </select>
              </div>

              <div className="flex flex-col gap-1 flex-1 min-w-[130px]">
                <label className="text-[9px] uppercase tracking-wider text-gray-400 font-bold">Start Date</label>
                <input
                  type="date"
                  value={exportStartDate}
                  onChange={e => setExportStartDate(e.target.value)}
                  className="border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 font-bold"
                />
              </div>

              <div className="flex flex-col gap-1 flex-1 min-w-[130px]">
                <label className="text-[9px] uppercase tracking-wider text-gray-400 font-bold">End Date</label>
                <input
                  type="date"
                  value={exportEndDate}
                  onChange={e => setExportEndDate(e.target.value)}
                  className="border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 font-bold"
                />
              </div>

              <button
                onClick={handleExportReports}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-5 py-2.5 rounded-xl transition shadow flex items-center justify-center gap-1.5 whitespace-nowrap h-10">
                📥 Download CSV Report
              </button>
            </div>
          </div>

          {/* Search, Filter & Tab Controls */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
            
            {/* Tabs */}
            <div className="flex gap-1 bg-gray-100/80 p-1 rounded-xl w-full sm:w-fit">
              {[["engraved", "📦 Engraved Orders"], ["digital", "⚡ Digital Orders"]].map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => { setTab(key); setStatusFilter(""); }}
                  className={`flex-1 sm:flex-none px-4 py-2.5 text-xs rounded-lg font-bold transition flex items-center justify-center gap-2
                    ${tab === key ? "bg-white shadow text-indigo-700" : "text-gray-500 hover:text-gray-700"}`}>
                  {label}
                  <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded-full font-medium text-gray-500">
                    {key === "engraved" ? engOrders.length : digOrders.length}
                  </span>
                </button>
              ))}
            </div>

            {/* Filter controls */}
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              
              {/* Search Bar */}
              <div className="relative flex-1 sm:w-64 sm:flex-none">
                <MdSearch className="absolute left-3 top-3 text-gray-400 text-lg" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder={`Search ${tab === "engraved" ? "engraved" : "digital"} orders...`}
                  className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              {/* Status Filter */}
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-100 bg-white font-semibold text-gray-600 appearance-none pr-8">
                  <option value="">All Statuses</option>
                  {tab === "engraved"
                    ? ENV_STATUS.map(s => <option key={s} value={s}>{s}</option>)
                    : [...new Set([...DIG_PAYMENT, ...DIG_STATUS])].map(s => <option key={s} value={s}>{s}</option>)
                  }
                </select>
                <MdFilterList className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" />
              </div>

            </div>
          </div>

          {/* List of Orders */}
          <div className="flex flex-col gap-3">
            {filteredOrders.map(o => {
              const trackingVal = editShipping[o.order_id]?.tracking_number ?? o.tracking_number ?? "";
              const courierVal = editShipping[o.order_id]?.courier_name ?? "delhivery";

              return (
                <div key={o.order_id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md/50 transition duration-200">                  {/* Header Row */}
                  <div
                    onClick={() => handleToggleExpand(o.order_id)}
                    className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50/50 transition">
                    <div className="flex items-center gap-4 min-w-0">
                      <span className={`font-mono text-xs px-2.5 py-1 rounded font-black
                        ${tab === "engraved" ? "text-indigo-600 bg-indigo-50 border border-indigo-100/50" : "text-sky-600 bg-sky-50 border border-sky-100/50"}`}>
                        {o.order_id}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-800 truncate">
                          {o.ship_full_name || o.member_name || o.guest_name || "Guest Checkout"}
                        </p>
                        <p className="text-xs text-gray-400 truncate mt-0.5">{o.product_name}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <span className="text-sm font-black text-gray-800">{formatAdminPrice(o.total_amount)}</span>
                      <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider
                        ${BADGE[o.delivery_status] || BADGE[o.payment_status] || "bg-gray-100 text-gray-600"}`}>
                        {o.delivery_status || o.payment_status}
                      </span>
                      <MdExpandMore className={`text-gray-400 text-xl transition-transform duration-300
                        ${expanded === o.order_id ? "rotate-180 text-indigo-600" : ""}`} />
                    </div>
                  </div>

                  {/* Expanded View */}
                  {expanded === o.order_id && (
                    <div className="border-t border-gray-100 px-5 py-5 bg-gray-50/30 flex flex-col gap-6">
                      
                      {/* Action Bar */}
                      <div className="flex gap-2.5 border-b border-gray-100 pb-3.5 no-print">
                        <button
                          onClick={() => window.open(`http://localhost:3000/order-success?id=${o.order_id}`, "_blank")}
                          className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-black px-4 py-2 rounded-xl border border-indigo-200/50 transition flex items-center gap-1.5 shadow-sm"
                        >
                          📄 View / Print Retail Invoice
                        </button>
                        {tab === "engraved" && (
                          <button
                            onClick={() => handlePrintShippingLabel(o.order_id)}
                            className="bg-amber-50 hover:bg-amber-100 text-amber-700 text-[11px] font-black px-4 py-2 rounded-xl border border-amber-200/50 transition flex items-center gap-1.5 shadow-sm"
                          >
                            🏷️ Print Shipping Sticker (4x6)
                          </button>
                        )}
                      </div>
                      
                      {/* Grid with Details */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                        <div>
                          <p className="text-gray-400 font-bold uppercase tracking-wider mb-1 text-[10px]">Invoice Number</p>
                          <p className="font-mono text-gray-700 font-bold">{o.invoice_no}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 font-bold uppercase tracking-wider mb-1 text-[10px]">Customer Member ID</p>
                          <p className="font-mono text-indigo-600 font-black">{o.member_id || "Guest Checkout"}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 font-bold uppercase tracking-wider mb-1 text-[10px]">Order Timestamp</p>
                          <p className="text-gray-700 font-semibold">{new Date(o.created_at).toLocaleString("en-IN")}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 font-bold uppercase tracking-wider mb-1 text-[10px]">Payment Mode</p>
                          <p className="text-gray-700 font-semibold">{o.payment_mode || "COD"}</p>
                        </div>

                        {tab === "engraved" && (
                          <>
                            <div className="col-span-2">
                              <p className="text-gray-400 font-bold uppercase tracking-wider mb-1 text-[10px]">Shipping Destination Address</p>
                              <p className="text-gray-700 font-medium leading-relaxed">
                                {[o.ship_street, o.ship_city, o.ship_state, o.ship_pincode].filter(Boolean).join(", ")}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-400 font-bold uppercase tracking-wider mb-1 text-[10px]">Engraved Size / Qty</p>
                              <p className="text-gray-700 font-semibold">{o.selected_size || "Standard"} × {o.quantity || 1}</p>
                            </div>
                            <div>
                              <p className="text-gray-400 font-bold uppercase tracking-wider mb-1 text-[10px]">Delhivery Tracking Link</p>
                              {o.tracking_number ? (
                                <a
                                  href={`https://www.delhivery.com/track/package/${o.tracking_number}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-bold transition">
                                  {o.tracking_number} <MdOpenInNew />
                                </a>
                              ) : (
                                <span className="text-gray-400 italic">No tracking set yet</span>
                              )}
                            </div>
                          </>
                        )}

                        {tab === "digital" && (
                          <>
                            <div>
                              <p className="text-gray-400 font-bold uppercase tracking-wider mb-1 text-[10px]">Product format</p>
                              <p className="text-gray-700 font-semibold uppercase">{o.file_format || "ZIP / PDF"}</p>
                            </div>
                            <div>
                              <p className="text-gray-400 font-bold uppercase tracking-wider mb-1 text-[10px]">Fulfillment status</p>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${BADGE[o.delivery_status] || "bg-gray-100"}`}>
                                {o.delivery_status || "Completed"}
                              </span>
                            </div>
                            <div>
                              <p className="text-gray-400 font-bold uppercase tracking-wider mb-1 text-[10px]">Link downloads count</p>
                              <p className="text-gray-700 font-semibold">{o.download_count ?? 0} / {o.max_downloads || 5}</p>
                            </div>
                            <div>
                              <p className="text-gray-400 font-bold uppercase tracking-wider mb-1 text-[10px]">Link expiry date</p>
                              <p className="text-gray-700 font-semibold">
                                {o.download_expires ? new Date(o.download_expires).toLocaleDateString("en-IN") : "Never Expires"}
                              </p>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Dynamic Customization Details section */}
                      {tab === "engraved" && orderDetails[o.order_id] && (
                        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm flex flex-col gap-4">
                          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                            <h4 className="text-xs font-black text-gray-700 uppercase tracking-widest flex items-center gap-1.5">
                              ✨ Customization Details
                            </h4>
                            <button
                              onClick={() => handlePrintCustomization(o.order_id)}
                              className="bg-gray-50 hover:bg-gray-100 text-gray-700 text-[10px] font-extrabold px-3 py-1.5 rounded-lg border border-gray-200 transition">
                              🖨️ Print Customization Details
                            </button>
                          </div>
                          
                          <div className="flex flex-col gap-3 text-xs">
                            {orderDetails[o.order_id].items.map((item, iIdx) => (
                              <div key={iIdx} className="bg-stone-50/50 rounded-xl p-3 border border-stone-200/50">
                                <p className="font-bold text-stone-850 mb-2 border-b border-stone-200/40 pb-1">
                                  Item: {item.product_name} ({item.selected_size || 'Standard'}) x {item.qty}
                                </p>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mt-2">
                                  {item.customizations && item.customizations.length ? (
                                    item.customizations.map((c, cIdx) => (
                                      <div key={cIdx} className="flex flex-col gap-0.5 border-l-2 border-amber-250 pl-2.5 py-0.5">
                                        <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">{c.field_label}</span>
                                        {c.field_type === 'image' || c.field_type === 'file' ? (
                                          <div className="flex items-center gap-2 mt-1">
                                            {c.field_type === 'image' && (
                                              <img src={`http://localhost:5000${c.field_value}`} alt="" className="w-12 h-12 object-cover rounded-lg border bg-stone-100" />
                                            )}
                                            <a href={`http://localhost:5000${c.field_value}`} target="_blank" rel="noreferrer" className="text-xs text-indigo-600 hover:underline font-bold">
                                              Download Uploaded File
                                            </a>
                                          </div>
                                        ) : (
                                          <span className="font-bold text-gray-800 text-sm">{c.field_value}</span>
                                        )}
                                      </div>
                                    ))
                                  ) : (
                                    <p className="text-gray-400 italic text-[11px]">No personalization fields filled</p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Production Tracking Control */}
                          <div className="border-t border-gray-100 pt-4 mt-2">
                            <span className="text-[10px] text-indigo-650 font-extrabold uppercase tracking-wider block mb-2">⚙️ Production & Engraving Tracker</span>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                              <div>
                                <label className="text-[9px] font-bold text-gray-400 block mb-1">Production Status</label>
                                <select
                                  value={prodStatus[o.order_id] || ""}
                                  onChange={e => setProdStatus({ ...prodStatus, [o.order_id]: e.target.value })}
                                  className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 font-medium">
                                  {["Pending", "Design Review", "Approved", "Production Started", "Engraving Completed", "Packed", "Shipped", "Delivered"].map(st => (
                                    <option key={st} value={st}>{st}</option>
                                  ))}
                                </select>
                              </div>
                              <div className="md:col-span-2 flex gap-2">
                                <div className="flex-1">
                                  <label className="text-[9px] font-bold text-gray-400 block mb-1">Production Notes</label>
                                  <input
                                    value={prodNotes[o.order_id] || ""}
                                    onChange={e => setProdNotes({ ...prodNotes, [o.order_id]: e.target.value })}
                                    placeholder="Enter internal production/engraving notes..."
                                    className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-300"
                                  />
                                </div>
                                <button
                                  onClick={() => handleUpdateProduction(o.order_id)}
                                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-lg shadow-sm transition whitespace-nowrap">
                                  Update Production
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Shipping information entry (PHYSICAL ONLY) */}
                      {tab === "engraved" && (
                        <div className="bg-white border border-gray-100 rounded-xl p-4 flex flex-col md:flex-row items-end gap-3 shadow-sm">
                          <div className="flex-1 w-full">
                            <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Shipping Partner / Courier</label>
                            <select
                              value={courierVal}
                              onChange={e => setEditShipping(prev => ({
                                ...prev,
                                [o.order_id]: { ...prev[o.order_id], courier_name: e.target.value }
                              }))}
                              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white font-medium">
                              {PARTNERS.map(p => <option key={p} value={p}>{p.toUpperCase()}</option>)}
                            </select>
                          </div>
                          
                          <div className="flex-1 w-full col-span-2">
                            <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Delhivery Tracking / AWB Number</label>
                            <input
                              value={trackingVal}
                              onChange={e => setEditShipping(prev => ({
                                ...prev,
                                [o.order_id]: { ...prev[o.order_id], tracking_number: e.target.value }
                              }))}
                              placeholder="e.g. DL1234567890IN"
                              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            />
                          </div>

                          <button
                            onClick={() => handleUpdateShippingInfo(o.order_id, trackingVal, courierVal, o.delivery_status)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-lg shadow-sm transition whitespace-nowrap w-full md:w-auto">
                            Update Shipping
                          </button>
                        </div>
                      )}

                      {/* Status updates sections */}
                      <div className="border-t border-gray-100 pt-4 flex flex-col gap-3">
                        {tab === "engraved" ? (
                          <div className="flex flex-wrap gap-2 items-center">
                            <p className="text-xs font-bold text-gray-500 mr-2 flex items-center gap-1">
                              <MdLocalShipping className="text-indigo-600 text-base" /> Change Shipment Status:
                            </p>
                            {ENV_STATUS.map(s => (
                              <button
                                key={s}
                                onClick={() => updateEngravedStatus(o.order_id, s, o.tracking_number, o.courier_name)}
                                className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border transition duration-200
                                  ${o.delivery_status === s
                                    ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100"
                                    : "bg-white text-gray-500 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/30"}`}>
                                {s}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="flex flex-col gap-3">
                            {/* Digital Payment Status */}
                            <div className="flex flex-wrap gap-2 items-center">
                              <p className="text-xs font-bold text-gray-500 mr-2 flex items-center gap-1">
                                💳 Payment Status:
                              </p>
                              {DIG_PAYMENT.map(s => (
                                <button
                                  key={s}
                                  onClick={() => updateDigitalStatus(o.order_id, s, o.delivery_status)}
                                  className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border transition duration-200
                                    ${o.payment_status === s
                                      ? "bg-sky-600 text-white border-sky-600 shadow-md shadow-sky-100"
                                      : "bg-white text-gray-500 border-gray-200 hover:border-sky-300 hover:bg-sky-50/30"}`}>
                                  {s}
                                </button>
                              ))}
                            </div>
                            
                            {/* Digital Delivery Status */}
                            <div className="flex flex-wrap gap-2 items-center">
                              <p className="text-xs font-bold text-gray-500 mr-2 flex items-center gap-1">
                                ⚡ Delivery Status:
                              </p>
                              {DIG_STATUS.map(s => (
                                <button
                                  key={s}
                                  onClick={() => updateDigitalStatus(o.order_id, o.payment_status, s)}
                                  className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border transition duration-200
                                    ${o.delivery_status === s
                                      ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100"
                                      : "bg-white text-gray-500 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/30"}`}>
                                  {s}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            
            {filteredOrders.length === 0 && (
              <div className="text-center py-16 text-gray-400 text-sm bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center gap-3">
                <span className="text-4xl">📭</span>
                <p className="font-semibold">No orders found matching the filter criteria.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}