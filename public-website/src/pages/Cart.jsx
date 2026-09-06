import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import Navbar from "../components/Navbar";
import { useCurrency } from "../context/CurrencyContext";
import AdBanner from "../components/AdBanner";
import SEO from "../components/SEO";

export default function Cart() {
  const { cart, removeFromCart, updateQty, total, count } = useCart();
  const { convert } = useCurrency();
  const navigate = useNavigate();
  const hasPhysicalItems = cart.some(i => i.type === "physical" || (!i.type && !i.is_digital));
  const shippingCharge = hasPhysicalItems ? (total >= 999 ? 0 : 60) : 0;

  return (
    <div style={{ background: "#FAF9F6", color: "#0D1512", fontFamily: "'Plus Jakarta Sans', sans-serif" }} className="min-h-screen">
      <SEO 
        title="Your Shopping Cart" 
        description="Review your selected premium laser-engraved custom creations, acrylic blocks, and professional digital developer resources." 
        keywords="cart, checkout queue, purchase summary"
      />
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 
          style={{ fontFamily: "'Outfit', sans-serif" }}
          className="text-3xl font-black mb-8 tracking-tight"
        >
          Your Cart ({count} items)
        </h1>

        {cart.length === 0 ? (
          <div 
            style={{ background: "white", borderColor: "rgba(27, 57, 49, 0.15)" }}
            className="text-center py-20 rounded-3xl border shadow-sm flex flex-col items-center gap-4"
          >
            <p className="text-6xl">🛒</p>
            <p className="text-sm opacity-60 font-semibold uppercase tracking-wider">Your shopping cart is empty</p>
            <Link 
              to="/products"
              style={{ background: "#0D1512", color: "#FAF9F6" }}
              className="px-6 py-3 rounded-xl text-xs font-bold transition-all hover:scale-105 active:scale-95 shadow-md"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <div className="lg:col-span-2 flex flex-col gap-4">
              {cart.map((item) => (
                <div 
                  key={`${item.id}-${item.type}-${item.selectedSize || ""}-${item.customizationSummary || ""}`}
                  style={{ background: "white", borderColor: "rgba(27, 57, 49, 0.15)" }}
                  className="rounded-3xl border p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <div className="w-20 h-20 bg-stone-100 rounded-2xl flex items-center justify-center flex-shrink-0 border border-stone-200 overflow-hidden">
                    {item.image_url || item.thumbnail_url ? (
                      <img 
                        src={item.image_url || item.thumbnail_url} 
                        alt={item.name} 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <span className="text-3xl">{item.type === "digital" ? "📦" : "🪵"}</span>
                    )}
                  </div>
                  
                  <div className="flex-1 w-full min-w-0">
                    <p style={{ fontFamily: "'Outfit', sans-serif" }} className="text-base font-bold truncate">{item.name}</p>
                    <p className="text-xs opacity-60 capitalize font-medium tracking-wide mt-0.5">
                      {item.type} asset {item.selectedSize ? `— Size: ${item.selectedSize}` : ''}
                    </p>
                    {item.customizationSummary && (
                      <p className="text-[11px] text-amber-800 bg-amber-50/50 rounded-lg px-2.5 py-1.5 font-bold mt-1.5 border border-amber-100/40">
                        ✒️ Custom: {item.customizationSummary}
                      </p>
                    )}
                    <p className="text-sm font-black text-[#0D1512] mt-2">{convert(item.price)}</p>
                  </div>

                  <div className="flex items-center justify-between w-full sm:w-auto gap-4 mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-[#0D1512]/10">
                    {item.type === "physical" && (
                      <div className="flex items-center border border-[#0D1512]/20 rounded-xl overflow-hidden bg-stone-50">
                        <button
                          onClick={() => item.qty > 1
                            ? updateQty(item.id, item.type, item.qty - 1, item.selectedSize, item.customizationSummary)
                            : removeFromCart(item.id, item.type, item.selectedSize, item.customizationSummary)}
                          className="px-3 py-1.5 hover:bg-stone-200 text-sm font-black transition"
                        >
                          −
                        </button>
                        <span className="px-3 text-xs font-bold text-center min-w-[24px]">{item.qty}</span>
                        <button
                          onClick={() => updateQty(item.id, item.type, item.qty + 1, item.selectedSize, item.customizationSummary)}
                          className="px-3 py-1.5 hover:bg-stone-200 text-sm font-black transition"
                        >
                          +
                        </button>
                      </div>
                    )}

                    <button
                      onClick={() => removeFromCart(item.id, item.type, item.selectedSize, item.customizationSummary)}
                      className="text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-xl transition text-xs font-bold border border-red-100 bg-red-50/20"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary Sidebar */}
            <div className="w-full">
              <div 
                style={{ background: "white", borderColor: "rgba(27, 57, 49, 0.15)" }}
                className="rounded-3xl border p-6 shadow-md sticky top-6 flex flex-col gap-5"
              >
                <h3 style={{ fontFamily: "'Outfit', sans-serif" }} className="text-lg font-black tracking-tight">Order summary</h3>
                
                <div className="flex flex-col gap-3 text-sm border-b border-stone-100 pb-4">
                  <div className="flex justify-between opacity-80 font-medium">
                    <span>Subtotal</span>
                    <span>{convert(total)}</span>
                  </div>
                  {hasPhysicalItems ? (
                    <div className="flex justify-between opacity-80 font-medium">
                      <span>Shipping</span>
                      <span>{shippingCharge === 0 ? "Free" : convert(shippingCharge)}</span>
                    </div>
                  ) : (
                    <div className="flex justify-between text-emerald-700 font-medium">
                      <span>Delivery</span>
                      <span className="font-bold text-xs uppercase tracking-wide">Instant Download (Free)</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between font-black text-[#0D1512] text-lg">
                  <span>Total</span>
                  <span>{convert(total + shippingCharge)}</span>
                </div>

                <button
                  onClick={() => navigate("/checkout")}
                  style={{ background: "#0D1512", color: "#FAF9F6" }}
                  className="w-full py-4 rounded-xl font-black text-xs uppercase tracking-wider shadow-lg hover:scale-105 active:scale-95 transition-all mt-2"
                >
                  Proceed to checkout
                </button>
              </div>

              {/* Brand Ad Panel */}
              <div className="mt-6">
                <AdBanner placement="Square Tile" />
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}