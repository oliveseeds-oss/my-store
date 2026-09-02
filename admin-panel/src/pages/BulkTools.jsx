import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import BulkUploadModal from "../components/BulkUploadModal";
import API from "../api";
import {
  MdDownload,
  MdFileUpload,
  MdArrowForward,
  MdShoppingBag,
  MdDownloadForOffline,
  MdArticle,
  MdInfo,
  MdHelpOutline,
} from "react-icons/md";

export default function BulkTools() {
  const navigate = useNavigate();
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    type: "physical",
    mode: "upload",
  });
  const [downloading, setDownloading] = useState("");

  const handleDownloadTemplate = async (type, filename, endpoint) => {
    setDownloading(type + "_template");
    try {
      const response = await API.get(endpoint, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: "text/csv" }));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Failed to download template: " + (err.response?.data?.error || err.message));
    } finally {
      setDownloading("");
    }
  };

  const handleExport = async (type, filename, endpoint) => {
    setDownloading(type + "_export");
    try {
      const response = await API.get(endpoint, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: "text/csv" }));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Failed to export: " + (err.response?.data?.error || err.message));
    } finally {
      setDownloading("");
    }
  };

  const openBulkModal = (type, mode = "upload") => {
    setModalConfig({
      isOpen: true,
      type,
      mode,
    });
  };

  const sections = [
    {
      id: "physical",
      title: "Products (Physical)",
      desc: "Upload physical products in bulk. Includes all product types.",
      icon: <MdShoppingBag className="text-2xl text-indigo-600" />,
      templateFile: "products_template.csv",
      templateEndpoint: "/admin/products/physical/template",
      exportFile: "physical_products.csv",
      exportEndpoint: "/admin/products/physical/export",
      targetRoute: "/products",
      tabName: "Products",
    },
    {
      id: "digital",
      title: "Digital Products",
      desc: "Upload digital download products.",
      icon: <MdDownloadForOffline className="text-2xl text-sky-600" />,
      templateFile: "digital_products_template.csv",
      templateEndpoint: "/admin/products/digital/template",
      exportFile: "digital_products.csv",
      exportEndpoint: "/admin/products/digital/export",
      targetRoute: "/digital-products",
      tabName: "Digital Products",
    },
    {
      id: "blog",
      title: "Blog Posts",
      desc: "Upload multiple blog posts at once.",
      icon: <MdArticle className="text-2xl text-emerald-600" />,
      templateFile: "blogs_template.csv",
      templateEndpoint: "/admin/blogs/template",
      exportFile: "blogs.csv",
      exportEndpoint: "/admin/blogs/export",
      targetRoute: "/blog",
      tabName: "Blog Manager",
    },
  ];

  return (
    <div className="flex min-h-screen bg-stone-50/50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar title="Templates & Bulk Tools" />

        <main className="p-6 max-w-7xl mx-auto w-full space-y-6">
          
          {/* Header Banner */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                Bulk Management Hub
              </span>
              <h1 className="text-2xl font-black text-stone-900 mt-2">
                Templates &amp; Bulk Upload Tools
              </h1>
              <p className="text-xs text-stone-500 mt-1 max-w-xl">
                Download exact CSV templates matching each form, export live data with IDs for batch updates, and perform fast imports.
              </p>
            </div>
          </div>

          {/* 3 Type Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {sections.map((sec) => (
              <div
                key={sec.id}
                className="rounded-3xl p-6 border bg-white shadow-sm flex flex-col justify-between hover:shadow-md transition"
              >
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2.5 rounded-2xl bg-stone-100">{sec.icon}</div>
                    <div>
                      <h3 className="text-base font-bold text-stone-900">{sec.title}</h3>
                      <p className="text-xs text-stone-400 mt-0.5">{sec.desc}</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 mt-5">
                    <button
                      type="button"
                      disabled={downloading === sec.id + "_template"}
                      onClick={() =>
                        handleDownloadTemplate(sec.id, sec.templateFile, sec.templateEndpoint)
                      }
                      className="inline-flex items-center justify-center gap-1.5 bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200 px-3 py-2.5 rounded-xl text-xs font-semibold shadow-xs transition"
                    >
                      <MdDownload className="text-base text-indigo-600" />
                      {downloading === sec.id + "_template" ? "Downloading..." : "Download CSV Template"}
                    </button>

                    <button
                      type="button"
                      disabled={downloading === sec.id + "_export"}
                      onClick={() =>
                        handleExport(sec.id, sec.exportFile, sec.exportEndpoint)
                      }
                      className="inline-flex items-center justify-center gap-1.5 bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200 px-3 py-2.5 rounded-xl text-xs font-semibold shadow-xs transition"
                    >
                      <MdDownload className="text-base text-emerald-600" />
                      {downloading === sec.id + "_export" ? "Exporting..." : `Export Current ${sec.title} as CSV`}
                    </button>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => openBulkModal(sec.id, "upload")}
                    className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-sm"
                  >
                    <MdFileUpload className="text-base" /> Quick Upload
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate(sec.targetRoute)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-stone-600 hover:text-indigo-600 transition"
                  >
                    → Go to {sec.tabName} → Bulk Upload <MdArrowForward />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Guide & Instructions Card */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                <MdHelpOutline className="text-lg text-indigo-600" />
                HOW TO BULK UPLOAD IN 5 STEPS:
              </h3>
              <ol className="space-y-2.5 text-xs text-stone-600 font-medium">
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    1️⃣
                  </span>
                  <span><strong>Download the CSV template</strong> from the cards above.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    2️⃣
                  </span>
                  <span><strong>Open in Excel or Google Sheets</strong> to edit products.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    3️⃣
                  </span>
                  <span><strong>Fill one row per product/blog</strong> (follow the instructions inside the template).</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    4️⃣
                  </span>
                  <span><strong>Save file as CSV format</strong> (UTF-8 encoding).</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    5️⃣
                  </span>
                  <span><strong>Upload on the relevant page</strong> via the Bulk Upload tab or Quick Upload button.</span>
                </li>
              </ol>
            </div>

            <div className="lg:col-span-5 bg-amber-50/50 rounded-3xl p-6 border border-amber-200/80 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-amber-900 flex items-center gap-2">
                <MdInfo className="text-lg text-amber-600" />
                ⚠️ IMPORTANT NOTES:
              </h3>
              <ul className="space-y-2 text-xs text-amber-800 font-medium">
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 font-bold">•</span>
                  <span><strong>Column headers must not be changed</strong> to ensure accurate database mapping.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 font-bold">•</span>
                  <span><strong>Delete # instruction rows</strong> before uploading (the parser also auto-skips # comment rows).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 font-bold">•</span>
                  <span><strong>Images upload separately after import</strong>, or provide hosted image URLs directly in the CSV.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 font-bold">•</span>
                  <span><strong>Maximum 500 rows per upload file</strong> to maintain fast processing without timeouts.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 font-bold">•</span>
                  <span><strong>Export first to see correct format</strong> and structure of your live data.</span>
                </li>
              </ul>
            </div>
          </div>

        </main>
      </div>

      <BulkUploadModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
        type={modalConfig.type}
        initialMode={modalConfig.mode}
      />
    </div>
  );
}
