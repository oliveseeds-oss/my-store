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
    <div style={{ background: "#FFFFFF", color: "#181A18", fontFamily: "'DM Sans', sans-serif" }} className="min-h-screen">
      <SEO 
        title="Your Shopping Cart" 
        description="Review your selected bespoke design objects, hand-finished pieces, and professional digital design systems." 
        keywords="cart, purchase summary, bespoke orders"
      />
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 
          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          className="text-3xl md:text-4xl font-normal text-[#181A18] mb-8 tracking-tight"
        >
          Your Cart ({count} items)
        </h1>

        {cart.length === 0 ? (
          <div 
            className="text-center py-20 rounded-[4px] border border-[#E7E7E2] bg-white flex flex-col items-center gap-4"
          >
            <p className="text-6xl">🛒</p>
            <p className="text-xs text-[#676A65] font-semibold uppercase tracking-wider">Your shopping cart is empty</p>
            <Link 
              to="/products"
              className="px-6 py-3 rounded-[4px] text-xs font-semibold tracking-wider uppercase bg-[#23483D] hover:bg-[#16352D] text-white transition-all"
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
                  className="rounded-[4px] border border-[#E7E7E2] bg-white p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 transition-all duration-300"
                >
                  <div className="w-20 h-20 bg-[#F8F8F6] rounded-[4px] flex items-center justify-center flex-shrink-0 border border-[#E7E7E2] overflow-hidden">
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
                    <p className="text-base font-medium text-[#181A18] truncate">{item.name}</p>
                    <p className="text-xs text-[#676A65] capitalize font-normal tracking-wide mt-0.5">
                      {item.type} asset {item.selectedSize ? `— Size: ${item.selectedSize}` : ''}
                    </p>
                    {item.customizationSummary && (
                      <p className="text-[11px] text-[#23483D] bg-[#F8F8F6] rounded-[4px] px-2.5 py-1.5 font-medium mt-1.5 border border-[#E7E7E2]">
                        ✒️ Custom: {item.customizationSummary}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-sm font-semibold text-[#181A18]">{convert(item.price)}</span>
                      {item.original_price && item.original_price > item.price && (
                        <span className="text-xs text-stone-400 line-through font-normal">
                          {convert(item.original_price)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between w-full sm:w-auto gap-4 mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-[#E7E7E2]">
                    {item.type === "physical" && (
                      <div className="flex items-center border border-[#E7E7E2] rounded-[4px] overflow-hidden bg-[#F8F8F6]">
                        <button
                          onClick={() => item.qty > 1
                            ? updateQty(item.id, item.type, item.qty - 1, item.selectedSize, item.customizationSummary)
                            : removeFromCart(item.id, item.type, item.selectedSize, item.customizationSummary)}
                          className="px-3 py-1.5 hover:bg-stone-200 text-sm font-bold transition"
                        >
                          −
                        </button>
                        <span className="px-3 text-xs font-semibold text-center min-w-[24px]">{item.qty}</span>
                        <button
                          onClick={() => updateQty(item.id, item.type, item.qty + 1, item.selectedSize, item.customizationSummary)}
                          className="px-3 py-1.5 hover:bg-stone-200 text-sm font-bold transition"
                        >
                          +
                        </button>
                      </div>
                    )}

                    <button
                      onClick={() => removeFromCart(item.id, item.type, item.selectedSize, item.customizationSummary)}
                      className="text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-[4px] transition text-xs font-medium border border-red-200 bg-red-50/20"
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
                className="rounded-[4px] border border-[#E7E7E2] bg-white p-6 sticky top-6 flex flex-col gap-5"
              >
                <h3 className="text-lg font-medium text-[#181A18] tracking-tight">Order summary</h3>
                
                <div className="flex flex-col gap-3 text-sm border-b border-[#E7E7E2] pb-4">
                  <div className="flex justify-between text-[#676A65]">
                    <span>Subtotal</span>
                    <span className="text-[#181A18] font-medium">{convert(total)}</span>
                  </div>
                  {hasPhysicalItems ? (
                    <div className="flex justify-between text-[#676A65] items-center">
                      <span>Shipping</span>
                      <span className="text-xs font-medium text-[#23483D] bg-[#F8F8F6] px-2 py-0.5 rounded-[4px] border border-[#E7E7E2]">
                        Calculated at checkout
                      </span>
                    </div>
                  ) : (
                    <div className="flex justify-between text-emerald-700 font-medium">
                      <span>Delivery</span>
                      <span className="font-bold text-xs uppercase tracking-wide">Instant Download (Free)</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between font-semibold text-[#181A18] text-lg">
                  <span>Total</span>
                  <span>{convert(total)}</span>
                </div>
                {hasPhysicalItems && (
                  <p className="text-[11px] text-[#676A65] leading-relaxed">
                    * Final delivery charges will be calculated and added based on your selected shipping method (Standard, Express, etc.) at checkout.
                  </p>
                )}

                <button
                  onClick={() => navigate("/checkout")}
                  className="w-full py-3.5 rounded-[4px] font-semibold text-xs uppercase tracking-wider bg-[#23483D] hover:bg-[#16352D] text-white transition-all mt-2"
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