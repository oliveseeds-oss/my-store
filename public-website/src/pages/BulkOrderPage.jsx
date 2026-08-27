import { useState } from "react";
import API from "../api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SEO from "../components/SEO";
import { MdCorporateFare, MdCheckCircle } from "react-icons/md";

export default function BulkOrderPage() {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    company_name: "",
    product_interest: "",
    quantity: "",
    message: ""
  });
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.full_name || !emailValid(form.email)) {
      alert("Please enter a valid full name and email.");
      return;
    }

    setLoading(true);
    try {
      const res = await API.post("/bulk-inquiry", form);
      setSuccessMsg(res.data.message || "Thank you! We will contact you within 24 hours.");
      setForm({
        full_name: "",
        email: "",
        phone: "",
        company_name: "",
        product_interest: "",
        quantity: "",
        message: ""
      });
    } catch (err) {
      console.error("Failed to submit bulk inquiry:", err);
      alert(err.response?.data?.error || "Failed to submit inquiry. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const emailValid = (email) => /\S+@\S+\.\S+/.test(email);

  return (
    <div style={{ background: "#FAF9F6", color: "#0D1512", fontFamily: "'Plus Jakarta Sans', sans-serif" }} className="min-h-screen flex flex-col">
      <SEO title="Bulk & Wholesale Orders | Olive Seeds Studio" description="Request custom corporate gifts, wholesale printed products, and bulk merchandise from Olive Seeds Studio." />
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-6 py-12 w-full">
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 text-xs font-bold px-3.5 py-1.5 rounded-full border border-indigo-200 mb-3">
            <MdCorporateFare className="text-base" /> Corporate & Wholesale
          </div>
          <h1 style={{ fontFamily: "'Outfit', sans-serif" }} className="text-3xl sm:text-4xl font-black text-[#0D1512] tracking-tight">
            Bulk Order Inquiries
          </h1>
          <p className="text-xs sm:text-sm text-[#0D1512]/60 mt-2 leading-relaxed">
            Planning corporate gifting, event favors, or bulk merchandise? Contact us for exclusive tiered volume discounts and custom branding.
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-3xl border border-[#0D1512]/10 p-8 sm:p-10 shadow-sm max-w-2xl mx-auto">
          {successMsg ? (
            <div className="py-12 text-center space-y-4">
              <MdCheckCircle className="text-6xl text-emerald-500 mx-auto" />
              <h3 className="text-xl font-bold text-[#0D1512]">Inquiry Received!</h3>
              <p className="text-xs text-stone-600 font-medium max-w-md mx-auto">{successMsg}</p>
              <button
                onClick={() => setSuccessMsg("")}
                className="mt-4 bg-[#0D1512] text-white text-xs font-bold px-6 py-3 rounded-xl hover:bg-stone-800 transition shadow-sm"
              >
                Submit Another Inquiry
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-stone-700 mb-1 block">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={form.full_name}
                    onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                    placeholder="John Doe"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#0D1512]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 mb-1 block">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="john@company.com"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#0D1512]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-stone-700 mb-1 block">Phone Number</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+1 555-0199"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#0D1512]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 mb-1 block">Company / Brand Name</label>
                  <input
                    type="text"
                    value={form.company_name}
                    onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                    placeholder="Acme Corp (Optional)"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#0D1512]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-stone-700 mb-1 block">Products Interested In</label>
                  <input
                    type="text"
                    value={form.product_interest}
                    onChange={(e) => setForm({ ...form, product_interest: e.target.value })}
                    placeholder="e.g. Laser Engraved Mugs & T-Shirts"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#0D1512]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 mb-1 block">Estimated Quantity</label>
                  <input
                    type="number"
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                    placeholder="100"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#0D1512]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 mb-1 block">Message / Specifications</label>
                <textarea
                  rows={4}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Tell us about your timeline, custom printing design needs, or packaging requirements..."
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#0D1512] resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#0D1512] hover:bg-stone-800 text-white font-bold text-xs py-3.5 rounded-xl transition shadow-md disabled:opacity-50"
              >
                {loading ? "Submitting Inquiry..." : "Submit Bulk Inquiry"}
              </button>
            </form>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
