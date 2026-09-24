import { createContext, useContext, useState, useEffect } from "react";
import { trackGA4Event } from "../utils/ga4";

const CartContext = createContext();

const normalizeCartItem = (i) => {
  const hasDiscount = i.discount_price !== null && i.discount_price !== undefined && i.discount_price !== "" && Number(i.discount_price) > 0;
  const currentPrice = Number(i.price) || 0;
  const discountPrice = hasDiscount ? Number(i.discount_price) : null;
  const effectivePrice = (discountPrice !== null && discountPrice < currentPrice) ? discountPrice : currentPrice;
  const originalPrice = Number(i.original_price || (hasDiscount && discountPrice < currentPrice ? currentPrice : effectivePrice));
  return {
    ...i,
    price: effectivePrice,
    original_price: originalPrice,
    qty: Number(i.qty) || 1
  };
};

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem("cart");
      const list = saved ? JSON.parse(saved) : [];
      return Array.isArray(list) ? list.map(normalizeCartItem) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("cart", JSON.stringify(cart));
    } catch (e) {
      console.error("Failed to save cart to local storage:", e);
    }
  }, [cart]);

  const addToCart = (rawItem) => {
    const item = normalizeCartItem(rawItem);
    trackGA4Event("add_to_cart", {
      currency: "INR",
      value: item.price * (item.qty || 1),
      items: [{ item_id: item.id, item_name: item.name, quantity: item.qty || 1 }]
    });
    setCart((prev) => {
      const getCartKey = (i) => `${i.id}-${i.type}-${i.selectedSize || ""}-${i.customizationSummary || ""}`;
      const itemKey = getCartKey(item);
      const exists = prev.find((i) => getCartKey(i) === itemKey);
      if (exists) return prev.map((i) =>
        getCartKey(i) === itemKey
          ? { ...i, qty: i.qty + (item.qty || 1) } : i
      );
      return [...prev, item];
    });
  };

  const removeFromCart = (id, type, selectedSize = "", customizationSummary = "") => {
    const itemKey = `${id}-${type}-${selectedSize}-${customizationSummary}`;
    const getCartKey = (i) => `${i.id}-${i.type}-${i.selectedSize || ""}-${i.customizationSummary || ""}`;
    setCart(cart.filter((i) => getCartKey(i) !== itemKey));
  };

  const updateQty = (id, type, qty, selectedSize = "", customizationSummary = "") => {
    const itemKey = `${id}-${type}-${selectedSize}-${customizationSummary}`;
    const getCartKey = (i) => `${i.id}-${i.type}-${i.selectedSize || ""}-${i.customizationSummary || ""}`;
    setCart(cart.map((i) =>
      getCartKey(i) === itemKey ? { ...i, qty } : i
    ));
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("cart");
  };

  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const count = cart.reduce((sum, i) => sum + i.qty, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQty, clearCart, total, count }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);