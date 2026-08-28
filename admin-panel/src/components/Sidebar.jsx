import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  MdDashboard, MdShoppingBag, MdDownload, MdPeople,
  MdListAlt, MdArticle, MdMail, MdCampaign,
  MdNotifications, MdSettings, MdCategory,
  MdPublic, MdLocalShipping, MdBarChart, MdReceipt, MdSearch, MdInsertPhoto, MdRssFeed, MdStar, MdMenu, MdClose
} from "react-icons/md";

const links = [
  { to: "/", icon: <MdDashboard />, label: "Dashboard" },
  { to: "/reports", icon: <MdBarChart />, label: "Reports & Analytics" },
  { to: "/transactions", icon: <MdReceipt />, label: "Transactions Ledger" },
  { to: "/categories", icon: <MdCategory />, label: "Categories (Products)" },
  { to: "/catalog", icon: <MdCategory className="text-amber-500" />, label: "Catalog Collections" },
  { to: "/gallery", icon: <MdInsertPhoto />, label: "Gallery Showcase" },
  { to: "/portfolio", icon: <MdInsertPhoto className="text-indigo-500" />, label: "Portfolio Showcase" },
  { to: "/products", icon: <MdShoppingBag />, label: "Products" },
  { to: "/digital-products", icon: <MdDownload />, label: "Digital products" },
  { to: "/reviews", icon: <MdStar className="text-amber-500" />, label: "Reviews Manager" },
  { to: "/orders", icon: <MdListAlt />, label: "Orders" },
  { to: "/members", icon: <MdPeople />, label: "Members" },
  { to: "/blog", icon: <MdArticle />, label: "Blog" },
  { to: "/faqs", icon: <MdArticle className="text-emerald-600" />, label: "FAQ Manager" },
  { to: "/feeds", icon: <MdRssFeed className="text-amber-600" />, label: "Product Feeds" },
  { to: "/coupons", icon: <MdSettings className="text-indigo-600" />, label: "Coupons" },
  { to: "/bulk-inquiries", icon: <MdMail className="text-emerald-600" />, label: "Bulk Inquiries" },
  { to: "/messages", icon: <MdMail />, label: "Contact messages" },
  { to: "/ads", icon: <MdCampaign />, label: "Ad panel" },
  { to: "/newsletter", icon: <MdMail className="text-indigo-600" />, label: "Newsletter" },
  { to: "/send-notifications", icon: <MdNotifications className="text-emerald-600" />, label: "Send Notifications" },
  { to: "/notifications", icon: <MdNotifications />, label: "Notifications" },
  { to: "/currency", icon: <MdPublic />, label: "Currency & shipping" },
  { to: "/shipping-countries", icon: <MdLocalShipping />, label: "Shipping Countries" },
  { to: "/seo", icon: <MdSearch />, label: "SEO Manager" },
  { to: "/settings", icon: <MdSettings />, label: "Settings" },
];

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile / Tablet Toggle Header Button */}
      <button
        type="button"
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed bottom-5 right-5 z-50 bg-indigo-600 text-white p-3.5 rounded-full shadow-2xl hover:bg-indigo-700 transition flex items-center justify-center"
        aria-label="Toggle Navigation Menu"
      >
        {mobileOpen ? <MdClose className="text-2xl" /> : <MdMenu className="text-2xl" />}
      </button>

      {/* Backdrop for mobile drawer */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="lg:hidden fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-40 transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed lg:static top-0 left-0 bottom-0 z-40 w-64 bg-white border-r border-gray-200 flex flex-col py-6 transition-transform duration-300 ease-in-out shrink-0 overflow-y-auto max-h-screen
        ${mobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:translate-x-0"}
      `}>
        <div className="px-6 mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-indigo-700">Admin Panel</h1>
            <p className="text-xs text-gray-400 mt-0.5">Olive Seeds Studio</p>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden text-gray-400 hover:text-gray-600 p-1"
          >
            <MdClose className="text-xl" />
          </button>
        </div>

        <nav className="flex flex-col gap-1 px-3 flex-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all
                 ${isActive ? "bg-indigo-50 text-indigo-700 font-bold" : "text-gray-600 hover:bg-stone-50"}`
              }
            >
              <span className="text-base">{l.icon}</span>
              {l.label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}