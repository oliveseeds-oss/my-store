import { createContext, useContext, useState } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

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

  const clearCart = () => setCart([]);

  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const count = cart.reduce((sum, i) => sum + i.qty, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQty, clearCart, total, count }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);