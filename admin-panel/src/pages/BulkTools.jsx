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
  MdAutoFixHigh,
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
      title: "Physical Products",
      desc: "Standard e-commerce items (mugs, t-shirts, frames, accessories)",
      icon: <MdShoppingBag className="text-2xl text-indigo-600" />,
      bg: "bg-indigo-50/60 border-indigo-100",
      templateFile: "physical_products_template.csv",
      templateEndpoint: "/admin/products/physical/template",
      exportFile: "physical_products.csv",
      exportEndpoint: "/admin/products/physical/export",
      targetRoute: "/products",
    },
    {
      id: "digital",
      title: "Digital Products",
      desc: "Instant download assets (Notion templates, Figma UI, ZIPs, code packages)",
      icon: <MdDownloadForOffline className="text-2xl text-sky-600" />,
      bg: "bg-sky-50/60 border-sky-100",
      templateFile: "digital_products_template.csv",
      templateEndpoint: "/admin/products/digital/template",
      exportFile: "digital_products.csv",
      exportEndpoint: "/admin/products/digital/export",
      targetRoute: "/digital-products",
    },
    {
      id: "engraved",
      title: "Engraved Products",
      desc: "Laser engraved gifts with customizable text, material & logo parameters",
      icon: <MdAutoFixHigh className="text-2xl text-amber-600" />,
      bg: "bg-amber-50/60 border-amber-100",
      templateFile: "engraved_products_template.csv",
      templateEndpoint: "/admin/products/engraved/template",
      exportFile: "engraved_products.csv",
      exportEndpoint: "/admin/products/engraved/export",
      targetRoute: "/products",
    },
    {
      id: "blog",
      title: "Blog Posts",
      desc: "Articles & craftsmanship guides via CSV or multi-file HTML upload",
      icon: <MdArticle className="text-2xl text-emerald-600" />,
      bg: "bg-emerald-50/60 border-emerald-100",
      templateFile: "blogs_template.csv",
      templateEndpoint: "/admin/blogs/template",
      exportFile: "blogs.csv",
      exportEndpoint: "/admin/blogs/export",
      targetRoute: "/blog",
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
                Download exact CSV templates, export live product data for batch editing, and launch one-click bulk imports.
              </p>
            </div>
          </div>

          {/* 4 Type Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sections.map((sec) => (
              <div
                key={sec.id}
                className={`rounded-3xl p-6 border bg-white shadow-sm flex flex-col justify-between hover:shadow-md transition`}
              >
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2.5 rounded-2xl bg-stone-100">{sec.icon}</div>
                    <div>
                      <h3 className="text-base font-bold text-stone-900">{sec.title}</h3>
                      <p className="text-xs text-stone-400">{sec.desc}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 mt-5">
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
                      {downloading === sec.id + "_export" ? "Exporting..." : "Export Current Records"}
                    </button>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => openBulkModal(sec.id, "upload")}
                    className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm"
                  >
                    <MdFileUpload className="text-base" /> Quick Upload
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate(sec.targetRoute)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-stone-600 hover:text-indigo-600 transition"
                  >
                    Go to {sec.title} page <MdArrowForward />
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
                HOW TO USE BULK UPLOAD:
              </h3>
              <ol className="space-y-2.5 text-xs text-stone-600 font-medium">
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    1
                  </span>
                  <span><strong>Download template</strong> for your product or blog type above.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    2
                  </span>
                  <span><strong>Open the file</strong> in Excel, Google Sheets, or any spreadsheet editor.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    3
                  </span>
                  <span><strong>Fill in your product details</strong> — exactly one row per product.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    4
                  </span>
                  <span><strong>Save file as CSV format</strong> (UTF-8 encoding).</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    5
                  </span>
                  <span><strong>Upload on the relevant page</strong> or via the Quick Upload modal.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    6
                  </span>
                  <span><strong>Check the results summary</strong> to inspect any row errors or validation notices.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    7
                  </span>
                  <span><strong>Add images</strong> to each product individually after import.</span>
                </li>
              </ol>
            </div>

            <div className="lg:col-span-5 bg-amber-50/50 rounded-3xl p-6 border border-amber-200/80 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-amber-900 flex items-center gap-2">
                <MdInfo className="text-lg text-amber-600" />
                IMPORTANT NOTES:
              </h3>
              <ul className="space-y-2 text-xs text-amber-800 font-medium">
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 font-bold">•</span>
                  <span><strong>Images cannot be bulk uploaded:</strong> please upload images per product after import.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 font-bold">•</span>
                  <span><strong>Always download template first:</strong> ensuring matching column headers.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 font-bold">•</span>
                  <span><strong>Do not change column header names:</strong> the importer strictly validates names.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 font-bold">•</span>
                  <span><strong>Delete instruction rows:</strong> comment rows starting with # can also be safely left.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 font-bold">•</span>
                  <span><strong>Maximum 500 rows per upload:</strong> keeps processing fast and prevents server timeouts.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 font-bold">•</span>
                  <span><strong>Bulk Update Workflow:</strong> export current CSV, edit rows, and upload to update matching IDs.</span>
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
