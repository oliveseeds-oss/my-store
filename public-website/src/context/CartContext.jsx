import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem("cart");
      return saved ? JSON.parse(saved) : [];
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

  const addToCart = (item) => {
    setCart((prev) => {
      const getCartKey = (i) => `${i.id}-${i.type}-${i.selectedSize || ""}-${i.customizationSummary || ""}`;
      const itemKey = getCartKey(item);
      const exists = prev.find((i) => getCartKey(i) === itemKey);
      if (exists) return prev.map((i) =>
        getCartKey(i) === itemKey
          ? { ...i, qty: i.qty + (item.qty || 1) } : i
      );
      return [...prev, { ...item, qty: item.qty || 1 }];
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