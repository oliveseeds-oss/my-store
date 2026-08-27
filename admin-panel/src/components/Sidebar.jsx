import { NavLink } from "react-router-dom";
import {
  MdDashboard, MdShoppingBag, MdDownload, MdPeople,
  MdListAlt, MdArticle, MdMail, MdCampaign,
  MdNotifications, MdSettings, MdCategory,
  MdPublic, MdLocalShipping, MdBarChart, MdReceipt, MdSearch, MdInsertPhoto, MdRssFeed, MdStar
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
  { to: "/notifications", icon: <MdNotifications />, label: "Notifications" },
  { to: "/currency", icon: <MdPublic />, label: "Currency & shipping" },
  { to: "/shipping-countries", icon: <MdLocalShipping />, label: "Shipping Countries" },
  { to: "/seo", icon: <MdSearch />, label: "SEO Manager" },
  { to: "/settings", icon: <MdSettings />, label: "Settings" },
];

export default function Sidebar() {
  return (
    <aside className="w-60 min-h-screen bg-white border-r border-gray-200 flex flex-col py-6">
      <div className="px-6 mb-8">
        <h1 className="text-lg font-bold text-indigo-700">Admin Panel</h1>
        <p className="text-xs text-gray-400 mt-0.5">Your store manager</p>
      </div>
      <nav className="flex flex-col gap-1 px-3 flex-1">
        {links.map((l) => (
          <NavLink key={l.to} to={l.to} end={l.to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all
               ${isActive ? "bg-indigo-50 text-indigo-700 font-medium" : "text-gray-600 hover:bg-gray-100"}`}>
            <span className="text-lg">{l.icon}</span>
            {l.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}