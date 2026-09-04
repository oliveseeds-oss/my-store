import React, { useState } from "react";
import API from "../api";
import {
  MdClose,
  MdCloudUpload,
  MdDownload,
  MdCheckCircle,
  MdErrorOutline,
  MdInfo,
  MdRefresh,
  MdInsertDriveFile,
} from "react-icons/md";

/**
 * BulkUploadModal
 *
 * Props:
 * - isOpen: boolean
 * - onClose: () => void
 * - type: "physical" | "digital" | "engraved" | "blog"
 * - initialMode: "upload" | "update"
 * - onComplete: () => void
 */
export default function BulkUploadModal({
  isOpen,
  onClose,
  type = "physical",
  initialMode = "upload",
  onComplete,
}) {
  const [mode, setMode] = useState(initialMode); // "upload" or "update"
  const [blogMethod, setBlogMethod] = useState("csv"); // "csv" or "html" (only for blog)
  const [file, setFile] = useState(null);
  const [htmlFiles, setHtmlFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  if (!isOpen) return null;

  const titles = {
    physical: "Physical Products",
    digital: "Digital Products",
    blog: "Blog Posts",
    catalog: "Catalog Collections",
    gallery: "Showcase Gallery",
    portfolio: "Portfolio Projects",
  };

  const templateFilenames = {
    physical: "products_template.csv",
    digital: "digital_products_template.csv",
    blog: "blogs_template.csv",
    catalog: "catalog_template.csv",
    gallery: "gallery_template.csv",
    portfolio: "portfolio_template.csv",
  };

  const templateEndpoints = {
    physical: "/admin/products/physical/template",
    digital: "/admin/products/digital/template",
    blog: "/admin/blogs/template",
    catalog: "/admin/catalog/template",
    gallery: "/admin/gallery/template",
    portfolio: "/admin/portfolio/template",
  };

  const uploadEndpoints = {
    physical: "/admin/products/physical/bulk-upload",
    digital: "/admin/products/digital/bulk-upload",
    blog: "/admin/blogs/bulk-upload-csv",
    catalog: "/admin/catalog/bulk-upload",
    gallery: "/admin/gallery/bulk-upload",
    portfolio: "/admin/portfolio/bulk-upload",
  };

  const updateEndpoints = {
    physical: "/admin/products/physical/bulk-update",
    digital: "/admin/products/digital/bulk-update",
    blog: "/admin/blogs/bulk-update",
    catalog: "/admin/catalog/bulk-update",
    gallery: "/admin/gallery/bulk-update",
    portfolio: "/admin/portfolio/bulk-update",
  };

  const handleDownloadTemplate = async () => {
    try {
      const endpoint = templateEndpoints[type];
      const filename = templateFilenames[type];
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
    }
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (type === "blog" && blogMethod === "html") {
      const files = Array.from(e.dataTransfer.files).filter((f) => f.name.endsWith(".html") || f.name.endsWith(".htm"));
      if (files.length) setHtmlFiles(files);
    } else {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile && (droppedFile.name.endsWith(".csv") || droppedFile.type.includes("csv"))) {
        setFile(droppedFile);
      } else {
        alert("Please drop a valid .csv file");
      }
    }
  };

  const handleFileSelect = (e) => {
    if (type === "blog" && blogMethod === "html") {
      const files = Array.from(e.target.files);
      setHtmlFiles(files);
    } else {
      const selected = e.target.files[0];
      if (selected) setFile(selected);
    }
  };

  const handleUpload = async () => {
    setLoading(true);
    setResult(null);

    try {
      if (type === "blog" && blogMethod === "html" && mode === "upload") {
        if (!htmlFiles.length) {
          alert("Please select at least one .html file");
          setLoading(false);
          return;
        }

        const formData = new FormData();
        htmlFiles.forEach((f) => formData.append("files", f));

        const res = await API.post("/admin/blogs/bulk-upload-html", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        setResult(res.data);
        if (onComplete) onComplete();
      } else {
        if (!file) {
          alert("Please select a CSV file to upload");
          setLoading(false);
          return;
        }

        const formData = new FormData();
        formData.append("file", file);

        const endpoint = mode === "update" ? updateEndpoints[type] : uploadEndpoints[type];
        const res = await API.post(endpoint, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        setResult(res.data);
        if (onComplete) onComplete();
      }
    } catch (err) {
      console.error("Bulk process error:", err);
      const errMsg = err.response?.data?.error || err.message || "Failed to process bulk operation";
      setResult({
        success: 0,
        errors: [{ row: "Server", error: errMsg }],
        total: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const resetAll = () => {
    setFile(null);
    setHtmlFiles([]);
    setResult(null);
  };

  return (
    <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden border border-stone-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-5 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-stone-800 flex items-center gap-2">
              <span className="p-1.5 bg-indigo-100 text-indigo-600 rounded-lg text-lg">
                <MdCloudUpload />
              </span>
              {mode === "update" ? "Bulk Update" : "Bulk Upload"} {titles[type]}
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              {mode === "update"
                ? "Update existing records by ID or insert new rows"
                : "Import multiple items at once using CSV or HTML"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 p-1.5 rounded-xl hover:bg-stone-200 transition"
          >
            <MdClose className="text-xl" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex border-b border-stone-200 bg-stone-100/60 px-6 pt-2 gap-2">
          <button
            onClick={() => {
              setMode("upload");
              resetAll();
            }}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all ${
              mode === "upload"
                ? "bg-white text-indigo-600 border-t-2 border-indigo-600 shadow-sm"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            Bulk Upload (New)
          </button>
          <button
            onClick={() => {
              setMode("update");
              resetAll();
            }}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all ${
              mode === "update"
                ? "bg-white text-indigo-600 border-t-2 border-indigo-600 shadow-sm"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            Bulk Update (Edit Existing)
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Blog Method Selector (If type === 'blog' and mode === 'upload') */}
          {type === "blog" && mode === "upload" && (
            <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-4">
              <span className="text-xs font-bold text-amber-900 uppercase tracking-wider block mb-2">
                Select Upload Method
              </span>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setBlogMethod("csv");
                    resetAll();
                  }}
                  className={`p-3 rounded-xl border text-left transition ${
                    blogMethod === "csv"
                      ? "border-amber-600 bg-white shadow-sm ring-2 ring-amber-400/20"
                      : "border-amber-200 bg-amber-50/40 hover:bg-white"
                  }`}
                >
                  <p className="text-xs font-bold text-stone-800">METHOD 1: CSV Upload</p>
                  <p className="text-[11px] text-stone-500 mt-0.5">Good for simple text blogs</p>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setBlogMethod("html");
                    resetAll();
                  }}
                  className={`p-3 rounded-xl border text-left transition ${
                    blogMethod === "html"
                      ? "border-amber-600 bg-white shadow-sm ring-2 ring-amber-400/20"
                      : "border-amber-200 bg-amber-50/40 hover:bg-white"
                  }`}
                >
                  <p className="text-xs font-bold text-stone-800">METHOD 2: HTML Files</p>
                  <p className="text-[11px] text-stone-500 mt-0.5">Good for rich HTML formatting</p>
                </button>
              </div>
            </div>
          )}

          {/* Mode Note for Update */}
          {mode === "update" && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3.5 flex items-start gap-2.5 text-xs text-blue-800">
              <MdInfo className="text-base text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Bulk Edit Workflow:</p>
                <p className="mt-0.5 text-blue-700">
                  Export your existing records first, edit prices/stock/fields in Excel or Sheets, then upload here.
                  Rows with an existing <strong>ID</strong> will be updated. Rows without an ID will be added as new items.
                </p>
              </div>
            </div>
          )}

          {/* Step 1: Download Template (Only for CSV mode) */}
          {(type !== "blog" || blogMethod === "csv") && (
            <div className="border border-stone-200 rounded-2xl p-4 bg-stone-50/40 flex items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-bold text-stone-700">
                  1. Download {mode === "update" ? "Sample / " : ""}Template CSV
                </h4>
                <p className="text-[11px] text-stone-400 mt-0.5">
                  Pre-formatted with exact column headers and example rows.
                </p>
              </div>
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="inline-flex items-center gap-1.5 bg-white border border-stone-300 hover:border-indigo-500 hover:text-indigo-600 text-stone-700 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-sm transition shrink-0"
              >
                <MdDownload className="text-base" /> Download Template
              </button>
            </div>
          )}

          {/* HTML Multi-File Upload Info (When blog + HTML method) */}
          {type === "blog" && blogMethod === "html" && mode === "upload" && (
            <div className="border border-stone-200 rounded-2xl p-4 bg-stone-50/40 text-xs text-stone-600 space-y-2">
              <h4 className="font-bold text-stone-800">HTML File Requirements:</h4>
              <p className="text-[11px] text-stone-500">
                Each .html file represents one post. Filename becomes the URL slug. You can include metadata comments at the top:
              </p>
              <pre className="bg-stone-900 text-stone-200 p-3 rounded-xl text-[11px] font-mono overflow-x-auto">
{`<!-- title: Your Blog Title -->
<!-- category: Gift Ideas -->
<!-- tags: gifts,custom -->
<!-- status: published -->
<!-- excerpt: Short summary -->
<!-- author: Admin -->
<h1>Your Rich Article Content</h1>`}
              </pre>
            </div>
          )}

          {/* Step 2: File Dropzone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleFileDrop}
            className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
              dragOver
                ? "border-indigo-600 bg-indigo-50/50"
                : file || htmlFiles.length
                ? "border-emerald-500 bg-emerald-50/30"
                : "border-stone-200 hover:border-stone-400 bg-white"
            }`}
          >
            {type === "blog" && blogMethod === "html" && mode === "upload" ? (
              <div>
                <MdInsertDriveFile className="text-4xl text-amber-500 mx-auto mb-2" />
                {htmlFiles.length > 0 ? (
                  <div>
                    <p className="text-xs font-bold text-emerald-700">
                      {htmlFiles.length} HTML file(s) selected:
                    </p>
                    <p className="text-[11px] text-stone-500 mt-1 max-h-24 overflow-y-auto">
                      {htmlFiles.map((f) => f.name).join(", ")}
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs font-semibold text-stone-700">
                      Drag &amp; drop multiple <strong>.html</strong> files here
                    </p>
                    <p className="text-[11px] text-stone-400 mt-0.5">or choose from your computer</p>
                  </div>
                )}
                <label className="inline-block mt-3 bg-stone-100 hover:bg-stone-200 text-stone-700 px-4 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition">
                  Choose HTML Files
                  <input
                    type="file"
                    accept=".html,.htm"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
              </div>
            ) : (
              <div>
                <MdCloudUpload className="text-4xl text-indigo-500 mx-auto mb-2" />
                {file ? (
                  <div>
                    <p className="text-xs font-bold text-emerald-700">Selected File: {file.name}</p>
                    <p className="text-[11px] text-stone-400 mt-0.5">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs font-semibold text-stone-700">
                      Drag and drop your completed <strong>.csv</strong> file here
                    </p>
                    <p className="text-[11px] text-stone-400 mt-0.5">Maximum 500 rows per upload</p>
                  </div>
                )}
                <label className="inline-block mt-3 bg-stone-100 hover:bg-stone-200 text-stone-700 px-4 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition">
                  {file ? "Change CSV File" : "Choose CSV File"}
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>

          {/* Important Notice */}
          <div className="bg-stone-50 rounded-xl p-3 border border-stone-200/80 text-[11px] text-stone-500 flex items-center justify-between">
            <span>
              <strong>Note:</strong> Public image URLs can be included directly in the CSV or items can be updated individually. Maximum 500 rows per CSV.
            </span>
            {(file || htmlFiles.length > 0) && (
              <button
                type="button"
                onClick={resetAll}
                className="text-stone-400 hover:text-red-600 font-semibold flex items-center gap-1 transition shrink-0 ml-2"
              >
                <MdRefresh /> Clear
              </button>
            )}
          </div>

          {/* Results Summary Box */}
          {result && (
            <div
              className={`rounded-2xl p-4 border transition-all ${
                result.errors && result.errors.length
                  ? "bg-amber-50/70 border-amber-300"
                  : "bg-emerald-50/70 border-emerald-300"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                {result.errors && result.errors.length ? (
                  <MdErrorOutline className="text-lg text-amber-600" />
                ) : (
                  <MdCheckCircle className="text-lg text-emerald-600" />
                )}
                <h4 className="text-xs font-bold text-stone-800">
                  {result.success > 0 ? "Import Process Completed" : "Import Failed"}
                </h4>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center my-3">
                <div className="bg-white/80 p-2 rounded-xl border border-stone-200/60">
                  <span className="text-base font-black text-emerald-600 block">{result.success || 0}</span>
                  <span className="text-[10px] text-stone-500 uppercase font-semibold">
                    {mode === "update" ? "Processed" : "Imported"}
                  </span>
                </div>
                {mode === "update" && (
                  <div className="bg-white/80 p-2 rounded-xl border border-stone-200/60">
                    <span className="text-base font-black text-blue-600 block">{result.updated || 0}</span>
                    <span className="text-[10px] text-stone-500 uppercase font-semibold">Updated</span>
                  </div>
                )}
                <div className="bg-white/80 p-2 rounded-xl border border-stone-200/60">
                  <span className="text-base font-black text-red-600 block">{result.errors ? result.errors.length : 0}</span>
                  <span className="text-[10px] text-stone-500 uppercase font-semibold">Errors / Skipped</span>
                </div>
                {mode !== "update" && (
                  <div className="bg-white/80 p-2 rounded-xl border border-stone-200/60">
                    <span className="text-base font-black text-stone-700 block">{result.total || 0}</span>
                    <span className="text-[10px] text-stone-500 uppercase font-semibold">Total Rows</span>
                  </div>
                )}
              </div>

              {/* Error Rows Table */}
              {result.errors && result.errors.length > 0 && (
                <div className="mt-3">
                  <p className="text-[11px] font-bold text-red-700 mb-1">
                    Error Details ({result.errors.length} issue{result.errors.length > 1 ? "s" : ""}):
                  </p>
                  <div className="max-h-32 overflow-y-auto border border-red-200 rounded-xl bg-white text-[11px]">
                    <table className="w-full text-left">
                      <thead className="bg-red-50 text-red-800 font-semibold border-b border-red-100">
                        <tr>
                          <th className="px-3 py-1.5 w-16">Row/File</th>
                          <th className="px-3 py-1.5">Reason</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.errors.map((e, idx) => (
                          <tr key={idx} className="border-b border-stone-100 hover:bg-stone-50">
                            <td className="px-3 py-1 font-mono text-stone-600">
                              {e.row ? `Row ${e.row}` : e.file || `#${idx + 1}`}
                            </td>
                            <td className="px-3 py-1 text-red-600">{e.error}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-stone-600 hover:text-stone-800 rounded-xl hover:bg-stone-200 transition"
          >
            {result ? "Close" : "Cancel"}
          </button>

          <button
            type="button"
            onClick={handleUpload}
            disabled={loading || (!file && !htmlFiles.length)}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-stone-300 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md transition disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </>
            ) : mode === "update" ? (
              "Upload and Update Records"
            ) : (
              "Upload and Import"
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
