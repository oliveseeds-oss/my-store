import { createContext, useContext, useState } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  const addToCart = (item) => {
    setCart((prev) => {
      const exists = prev.find((i) => i.id === item.id && i.type === item.type);
      if (exists) return prev.map((i) =>
        i.id === item.id && i.type === item.type
          ? { ...i, qty: i.qty + 1 } : i
      );
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const removeFromCart = (id, type) =>
    setCart(cart.filter((i) => !(i.id === id && i.type === type)));

  const updateQty = (id, type, qty) =>
    setCart(cart.map((i) =>
      i.id === id && i.type === type ? { ...i, qty } : i
    ));

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